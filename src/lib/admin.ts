import type { User } from "@supabase/supabase-js";

/**
 * Primary administrator email specified by the system owner.
 */
export const PRIMARY_ADMIN_EMAIL = "gowthamandharshan4@gmail.com";

/**
 * List of authorized admin emails who have full system access.
 */
export const ADMIN_EMAILS: readonly string[] = [
  "gowthamandharshan4@gmail.com",
  "crearemindwebsolutions@gmail.com",
  "ajith2801p@gmail.com",
  "admin@crearemind.in",
];

/**
 * Check if the given user has administrative rights.
 */
export function isAdmin(user: User | null | undefined): boolean {
  if (!user || !user.email) return false;
  const email = user.email.trim().toLowerCase();

  // 1. Direct admin email whitelist
  const isEmailMatch = ADMIN_EMAILS.some((adm) => adm.toLowerCase() === email);
  if (isEmailMatch) return true;

  // 2. Metadata role check (admin, super_admin, super admin)
  const userRole = String(
    user.user_metadata?.role ||
    user.app_metadata?.role ||
    user.user_metadata?.user_role ||
    ""
  ).toLowerCase().replace(/[\s_-]+/g, "");

  if (["admin", "superadmin", "owner"].includes(userRole)) {
    return true;
  }

  // 3. Local storage cached user list check
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("creare_admin_users_list");
      if (raw) {
        const users = JSON.parse(raw);
        if (Array.isArray(users)) {
          const match = users.find((u: any) => String(u?.email || "").toLowerCase() === email);
          if (match && (match.role === "Super Admin" || match.role === "Admin")) {
            return true;
          }
        }
      }
    } catch {}
  }

  return false;
}
