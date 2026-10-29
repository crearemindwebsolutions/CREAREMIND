import type { User } from "@supabase/supabase-js";

/**
 * Primary administrator email specified by the system owner.
 */
export const PRIMARY_ADMIN_EMAIL = "gowthamandharshan4@gmail.com";

/**
 * List of authorized admin emails.
 */
export const ADMIN_EMAILS: readonly string[] = [
  "gowthamandharshan4@gmail.com",
  "crearemindwebsolutions@gmail.com",
];

/**
 * Check if the given user has administrative rights.
 */
export function isAdmin(user: User | null | undefined): boolean {
  if (!user || !user.email) return false;
  const email = user.email.trim().toLowerCase();
  const isEmailMatch = ADMIN_EMAILS.some((adm) => adm.toLowerCase() === email);
  const isRoleMatch = user.user_metadata?.role === "admin";
  return isEmailMatch || isRoleMatch;
}
