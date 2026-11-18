import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { syncSessionUserToCloud, isUserAccountRevoked, getStoredUsers, saveUsersToLocalStorage } from "@/lib/admin-users";

/** Current auth session; `ready` is false until the first check finishes. */
export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const getDevSession = (): Session | null => {
      if (typeof window !== "undefined" && import.meta.env.DEV) {
        const mock = localStorage.getItem("creare_dev_session");
        if (mock) {
          try {
            return JSON.parse(mock) as Session;
          } catch {
            return null;
          }
        }
      }
      return null;
    };

    const handleUserSync = (sess: Session | null) => {
      if (sess?.user && sess.user.email) {
        const email = sess.user.email.trim().toLowerCase();
        isUserAccountRevoked(email).then(async (revoked) => {
          if (revoked) {
            console.warn(`Session for revoked/deleted user ${email} detected. Force signing out.`);
            await supabase.auth.signOut().catch(() => {});
            if (typeof window !== "undefined") {
              localStorage.removeItem("creare_dev_session");
              const current = getStoredUsers().filter((u) => u.email.toLowerCase() !== email);
              saveUsersToLocalStorage(current);
            }
            setSession(null);
            return;
          }
          // Not revoked -> sync normally
          syncSessionUserToCloud(sess.user).catch((e) => {
            console.warn("Auto-sync user to cloud failed:", e);
          });
        });
      }
    };

    const { data } = supabase.auth.onAuthStateChange((_e, s) => {
      const active = s ?? getDevSession();
      setSession(active);
      handleUserSync(active);
    });

    supabase.auth.getSession().then(({ data: sessionData }) => {
      const active = sessionData.session ?? getDevSession();
      setSession(active);
      setReady(true);
      handleUserSync(active);
    });

    // Listen for cross-tab account deletion broadcasts
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel("creare_admin_channel");
      bc.onmessage = async (event) => {
        if (event.data?.type === "account_deleted" && event.data.email) {
          const deleted = String(event.data.email).toLowerCase();
          const currentEmail = session?.user?.email?.toLowerCase();
          if (currentEmail && currentEmail === deleted) {
            await supabase.auth.signOut().catch(() => {});
            localStorage.removeItem("creare_dev_session");
            setSession(null);
            window.location.reload();
          }
        }
      };
    } catch {}

    const handleRevokeEvent = async (e: Event) => {
      const detail = (e as CustomEvent).detail;
      const currentEmail = session?.user?.email?.toLowerCase();
      if (currentEmail && currentEmail === String(detail).toLowerCase()) {
        await supabase.auth.signOut().catch(() => {});
        localStorage.removeItem("creare_dev_session");
        setSession(null);
        window.location.reload();
      }
    };
    window.addEventListener("creare_session_revoked", handleRevokeEvent);
    window.addEventListener("creare_account_deleted", handleRevokeEvent);

    return () => {
      data.subscription.unsubscribe();
      if (bc) bc.close();
      window.removeEventListener("creare_session_revoked", handleRevokeEvent);
      window.removeEventListener("creare_account_deleted", handleRevokeEvent);
    };
  }, []);

  return { session, user: session?.user ?? null, ready };
}

