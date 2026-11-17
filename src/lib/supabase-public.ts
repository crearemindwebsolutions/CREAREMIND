import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const SUPABASE_URL =
  import.meta.env["VITE_SUPABASE_URL"] ||
  process.env["SUPABASE_URL"] ||
  "https://lnfdtleuoyjkqmuonhnt.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] ||
  process.env["SUPABASE_PUBLISHABLE_KEY"] ||
  "sb_publishable_hkrqISIhR1AlZbklD2QWPw_k7a-0YSm";

/**
 * Public, unauthenticated Supabase client.
 *
 * CRITICAL ARCHITECTURAL PURPOSE:
 * The 'media' table serves as the global synchronized store for site assets,
 * client inquiries, and user directories. When an admin logs in, the standard
 * supabase client attaches an authenticated Bearer JWT token, which causes Postgres
 * Row-Level Security (RLS) to restrict rows to 'user_id = auth.uid()', hiding all
 * customer accounts, inquiries, and public assets.
 *
 * By using this public client (with persistSession: false), requests are executed
 * under the 'anon' role using the publishable apikey, guaranteeing complete, unrestricted
 * visibility into all synchronized cloud user accounts, inquiries, and media assets.
 */
export const supabasePublic = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

