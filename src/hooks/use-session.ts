import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { syncSessionUserToCloud } from "@/lib/admin-users";

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
        // Automatically sync registered user to Supabase cloud directory in background
        setTimeout(() => {
          syncSessionUserToCloud(sess.user).catch((e) => {
            console.warn("Auto-sync user to cloud failed:", e);
          });
        }, 500);
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

    return () => data.subscription.unsubscribe();
  }, []);

  return { session, user: session?.user ?? null, ready };
}

