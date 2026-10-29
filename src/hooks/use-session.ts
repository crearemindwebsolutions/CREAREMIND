import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

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

    const { data } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s ?? getDevSession());
    });

    supabase.auth.getSession().then(({ data: sessionData }) => {
      setSession(sessionData.session ?? getDevSession());
      setReady(true);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  return { session, user: session?.user ?? null, ready };
}

