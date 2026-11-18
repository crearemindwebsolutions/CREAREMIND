import type { User } from "@supabase/supabase-js";
import { supabasePublic } from "@/lib/supabase-public";
import { isAdmin, ADMIN_EMAILS } from "@/lib/admin";
import { format8DigitUserId } from "@/lib/user-id";

export interface ManagedUser {
  id: string; // Unique 8-digit User ID
  name: string;
  email: string;
  phone: string;
  provider: "Google OAuth" | "Email / Password" | "Phone OTP" | "GitHub";
  role: "Super Admin" | "Admin" | "Intern" | "Customer";
  joinedDate: string;
  company?: string;
  avatarUrl?: string;
  internDetails?: {
    roleTitle?: string;
    college?: string;
    department?: string;
    mentorName?: string;
    startDate?: string;
    endDate?: string;
  };
}

export const DEFAULT_MANAGED_USERS: ManagedUser[] = [
  {
    id: "54360931",
    name: "Gowthaman PR",
    email: "gowthamandharshan4@gmail.com",
    phone: "8072719603",
    provider: "Google OAuth",
    role: "Super Admin",
    joinedDate: "15 Oct 2026",
    company: "Creare Mind Founder",
  },
  {
    id: "80721960",
    name: "Ajith",
    email: "ajith2801p@gmail.com",
    phone: "—",
    provider: "Google OAuth",
    role: "Super Admin",
    joinedDate: "18 Nov 2026",
    company: "Creare Mind Leadership",
  },
  {
    id: "10000001",
    name: "CREARE MIND",
    email: "crearemindwebsolutions@gmail.com",
    phone: "8072719603",
    provider: "Google OAuth",
    role: "Super Admin",
    joinedDate: "16 Oct 2026",
    company: "Creare Mind Administration",
  },
  {
    id: "53702161",
    name: "Ajith Kumar",
    email: "ajithkohli028@gmail.com",
    phone: "—",
    provider: "Google OAuth",
    role: "Customer",
    joinedDate: "18 Nov 2026",
  },
  {
    id: "73819204",
    name: "RAMESH P",
    email: "jaisriramtextilekpm@gmail.com",
    phone: "—",
    provider: "Google OAuth",
    role: "Admin",
    joinedDate: "18 Nov 2026",
  },
];

const STORAGE_KEY = "creare_admin_users_list";
const DELETED_STORAGE_KEY = "creare_admin_deleted_users_list";

export interface DeletedUserRecord {
  id: string;
  name: string;
  email: string;
  phone?: string;
  provider?: ManagedUser["provider"];
  previousRole?: ManagedUser["role"];
  deletedAt: string;
  reason?: string;
}

const DUMMY_EMAILS = new Set([
  "sarah.jenkins@quickcartpos.com",
  "liam.vance@aetherstudio.design",
  "elena@luminuxeskincare.com",
  "m.rossi@verveoptics.it",
  "alice@example.com",
  "bob@example.com",
  "test@example.com",
  "kavitha.creare@gmail.com",
  "testsyncer@example.com",
  "realcustomer@example.com",
  "testgoogleuser1794676237047@gmail.com",
]);

/**
 * Filter out any mock, sample, or dummy test users from all directories
 */
export function isDemoOrDummyEmail(email?: string): boolean {
  if (!email) return true;
  const clean = email.trim().toLowerCase();
  if (DUMMY_EMAILS.has(clean)) return true;
  if (clean.startsWith("testgoogleuser")) return true;
  if (clean.includes("example.com")) return true;
  if (clean.includes("quickcartpos.com")) return true;
  if (clean.includes("aetherstudio.design")) return true;
  if (clean.includes("luminuxeskincare.com")) return true;
  if (clean.includes("verveoptics.it")) return true;
  if (clean.includes("dummy") || clean.includes("sample")) return true;
  return false;
}

/**
 * Normalizes email address to clean key for Supabase record identification
 */
export function getEmailStorageKey(email: string): string {
  return `CREARE_USER_${email.trim().toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
}

/**
 * Privilege rank helper to ensure elevated roles are never overwritten by customer rows
 */
function getRoleRank(role?: string): number {
  if (role === "Super Admin") return 4;
  if (role === "Admin") return 3;
  if (role === "Intern") return 2;
  return 1;
}

/**
 * Cleans list, removes dummy placeholders, dedupes by email, ensures 8-digit IDs.
 * Preserves the authoritative order so that cloud updates take precedence.
 */
export function sanitizeAndDedupeUsers(list: ManagedUser[]): ManagedUser[] {
  const seenEmails = new Set<string>();
  const seenIds = new Set<string>();
  const cleaned: ManagedUser[] = [];

  for (const u of list) {
    if (!u) continue;
    const emailKey = String(u.email || "").trim().toLowerCase();
    if (!emailKey) continue;
    if ((u as any).isDeleted || (u as any).role === "Deleted") continue;
    if (isDemoOrDummyEmail(emailKey)) continue;
    if (seenEmails.has(emailKey)) continue;
    seenEmails.add(emailKey);

    const defaultMeta = DEFAULT_MANAGED_USERS.find(
      (d) => d.email.toLowerCase() === emailKey
    );

    let currentId = String(u.id || "").trim();
    if (defaultMeta?.id) {
      currentId = defaultMeta.id;
    } else if (!/^\d{8}$/.test(currentId) || seenIds.has(currentId)) {
      currentId = format8DigitUserId(currentId || emailKey);
    }
    seenIds.add(currentId);

    const safeName =
      String(u.name || "").trim() ||
      defaultMeta?.name ||
      emailKey.split("@")[0] ||
      "User";
    const safePhone =
      u.phone && u.phone !== "—"
        ? String(u.phone).trim()
        : defaultMeta?.phone || "—";
    const safeProvider = (u.provider || defaultMeta?.provider || "Email / Password") as ManagedUser["provider"];
    
    // Primary founders are always Super Admin to avoid accidental lock-out;
    // for all other accounts, the appointed role takes absolute precedence.
    const isPrimaryFounder = ADMIN_EMAILS.slice(0, 2).some((a) => a.toLowerCase() === emailKey);
    const safeRole = isPrimaryFounder
      ? "Super Admin"
      : ((u.role || defaultMeta?.role || "Customer") as ManagedUser["role"]);

    const safeJoinedDate = String(u.joinedDate || defaultMeta?.joinedDate || "Recently").trim();
    const safeCompany = u.company ? String(u.company).trim() : defaultMeta?.company;

    cleaned.push({
      id: currentId,
      name: safeName,
      email: emailKey,
      phone: safePhone,
      provider: safeProvider,
      role: safeRole,
      joinedDate: safeJoinedDate,
      company: safeCompany,
      avatarUrl: u.avatarUrl ? String(u.avatarUrl) : undefined,
      internDetails: (u as any).internDetails || undefined,
    });
  }

  return cleaned.length > 0 ? cleaned : DEFAULT_MANAGED_USERS;
}

/**
 * Retrieve users synchronously from localStorage (offline/initial fallback)
 */
export function getStoredUsers(): ManagedUser[] {
  if (typeof window === "undefined") return DEFAULT_MANAGED_USERS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const cleaned = sanitizeAndDedupeUsers(parsed);
        // If dummy accounts were stripped, immediately save the purged clean list to localStorage
        if (cleaned.length !== parsed.length) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
        }
        return cleaned;
      }
    }
  } catch (e) {
    console.warn("Failed to load users from localStorage:", e);
  }
  return DEFAULT_MANAGED_USERS;
}

/**
 * Write users to local storage and dispatch cross-tab synchronization event
 */
export function saveUsersToLocalStorage(users: ManagedUser[]): void {
  if (typeof window === "undefined") return;
  try {
    const cleaned = sanitizeAndDedupeUsers(users);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
    window.dispatchEvent(new CustomEvent("creare_users_updated", { detail: cleaned }));
    try {
      const bc = new BroadcastChannel("creare_admin_channel");
      bc.postMessage({ type: "users_updated", users: cleaned });
      bc.close();
    } catch {}
  } catch (e) {
    console.error("Failed to save users to localStorage:", e);
  }
}

/**
 * Retrieve deleted/revoked users synchronously from localStorage
 */
export function getStoredDeletedUsers(): DeletedUserRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(DELETED_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn("Failed to load deleted users from localStorage:", e);
  }
  return [];
}

/**
 * Write deleted users to local storage and dispatch cross-tab synchronization event
 */
export function saveDeletedUsersToLocalStorage(deleted: DeletedUserRecord[]): void {
  if (typeof window === "undefined") return;
  try {
    // Dedupe deleted users by email (keep newest)
    const seen = new Set<string>();
    const cleaned: DeletedUserRecord[] = [];
    for (const d of deleted) {
      if (!d || !d.email) continue;
      const key = d.email.trim().toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      cleaned.push({
        id: String(d.id || format8DigitUserId(key)),
        name: String(d.name || key.split("@")[0] || "User").trim(),
        email: key,
        phone: d.phone || "—",
        provider: d.provider || "Google OAuth",
        previousRole: d.previousRole || "Customer",
        deletedAt: d.deletedAt || new Date().toISOString(),
        reason: d.reason || "Revoked by Administrator",
      });
    }
    localStorage.setItem(DELETED_STORAGE_KEY, JSON.stringify(cleaned));
    window.dispatchEvent(new CustomEvent("creare_deleted_users_updated", { detail: cleaned }));
  } catch (e) {
    console.error("Failed to save deleted users to localStorage:", e);
  }
}

/**
 * Fetches BOTH active users and deleted/revoked accounts from Supabase cloud database.
 * Realtime and authoritative: parses all user_account records in Supabase.
 */
export async function fetchUsersAndDeletedFromCloud(): Promise<{
  activeUsers: ManagedUser[];
  deletedUsers: DeletedUserRecord[];
}> {
  try {
    const { data, error } = await supabasePublic
      .from("media")
      .select("url, created_at, original_filename, public_id")
      .eq("resource_type", "user_account")
      .order("created_at", { ascending: false });

    const rowsByEmail = new Map<string, any[]>();

    if (!error && Array.isArray(data)) {
      for (const row of data) {
        try {
          if (row.url) {
            const parsed = JSON.parse(row.url);
            const email = (
              parsed.email ||
              row.original_filename?.replace(/^DELETED_/, "")?.replace(/^PURGED_/, "") ||
              ""
            ).trim().toLowerCase();
            if (email) {
              if (!rowsByEmail.has(email)) rowsByEmail.set(email, []);
              rowsByEmail.get(email)!.push({
                ...parsed,
                created_at: row.created_at,
                orig_fn: row.original_filename,
              });
            }
          }
        } catch {}
      }
    }

    const activeUsers: ManagedUser[] = [];
    const deletedUsers: DeletedUserRecord[] = [];
    const deletedEmails = new Set<string>();
    const purgedEmails = new Set<string>();

    for (const [emailKey, rows] of rowsByEmail.entries()) {
      if (isDemoOrDummyEmail(emailKey)) continue;

      // The newest row is the authoritative state
      const newest = rows[0];

      // 1. Check if permanently purged from system
      const isPurged = Boolean(
        newest?.isPurged ||
        newest?.role === "Purged" ||
        newest?.orig_fn?.startsWith("PURGED_")
      );

      if (isPurged) {
        purgedEmails.add(emailKey);
        continue; // Exclude from both Active Directory and Removed Accounts table!
      }

      // 2. Check if moved to Removed Accounts
      const isDeleted = Boolean(
        newest?.isDeleted ||
        newest?.role === "Deleted" ||
        newest?.orig_fn?.startsWith("DELETED_")
      );

      if (isDeleted) {
        deletedEmails.add(emailKey);
        // Find if any historical row contained their profile details
        const historicalActive = rows.find(
          (r) => r.name && !r.isDeleted && r.role !== "Deleted" && !r.isPurged
        );
        deletedUsers.push({
          id: newest.id || historicalActive?.id || format8DigitUserId(emailKey),
          name: newest.name || historicalActive?.name || emailKey.split("@")[0] || "User",
          email: emailKey,
          phone: newest.phone || historicalActive?.phone || "—",
          provider: newest.provider || historicalActive?.provider || "Google OAuth",
          previousRole: newest.previousRole || historicalActive?.role || "Customer",
          deletedAt: newest.deletedAt || newest.created_at || new Date().toISOString(),
          reason: newest.reason || "Revoked by Administrator",
        });
        continue;
      }

      if (newest && (newest.name || newest.role)) {
        activeUsers.push(newest);
      }
    }

    // Filter localUsers to purge deleted and permanently purged accounts from active cache
    const localUsers = getStoredUsers().filter(
      (u) =>
        !deletedEmails.has(u.email.trim().toLowerCase()) &&
        !purgedEmails.has(u.email.trim().toLowerCase()) &&
        !isDemoOrDummyEmail(u.email.trim().toLowerCase())
    );

    // Filter defaults so deleted or purged accounts never resurrect in active list
    const defaultsNotDeleted = DEFAULT_MANAGED_USERS.filter(
      (d) =>
        !deletedEmails.has(d.email.trim().toLowerCase()) &&
        !purgedEmails.has(d.email.trim().toLowerCase())
    );

    const combinedActive = sanitizeAndDedupeUsers([
      ...activeUsers,
      ...localUsers,
      ...defaultsNotDeleted,
    ]).filter(
      (u) =>
        !deletedEmails.has(u.email.trim().toLowerCase()) &&
        !purgedEmails.has(u.email.trim().toLowerCase()) &&
        !isDemoOrDummyEmail(u.email.trim().toLowerCase())
    );

    // Ensure deleted accounts also exclude permanently purged records
    const cleanedDeleted = deletedUsers.filter(
      (d) => !purgedEmails.has(d.email.trim().toLowerCase())
    );

    saveUsersToLocalStorage(combinedActive);
    saveDeletedUsersToLocalStorage(cleanedDeleted);

    return {
      activeUsers: combinedActive,
      deletedUsers: cleanedDeleted,
    };
  } catch (err) {
    console.warn("Could not fetch users and deleted from Supabase cloud:", err);
    return {
      activeUsers: DEFAULT_MANAGED_USERS,
      deletedUsers: getStoredDeletedUsers(),
    };
  }
}

/**
 * Fetches ALL live active users from Supabase cloud database
 */
export async function fetchUsersFromCloud(): Promise<ManagedUser[]> {
  const { activeUsers } = await fetchUsersAndDeletedFromCloud();
  return activeUsers;
}

/**
 * Persist an individual user record into Supabase cloud database
 */
export async function saveUserToCloud(user: ManagedUser): Promise<boolean> {
  if (!user || !user.email) return false;
  try {
    const cleanEmail = user.email.trim().toLowerCase();
    if (isDemoOrDummyEmail(cleanEmail)) return false;
    const publicId = getEmailStorageKey(cleanEmail);
    const normalizedUser: ManagedUser = {
      ...user,
      email: cleanEmail,
    };

    // Upsert into Supabase media table under resource_type 'user_account'
    const { error } = await supabasePublic.from("media").insert({
      public_id: publicId,
      resource_type: "user_account",
      url: JSON.stringify(normalizedUser),
      original_filename: cleanEmail,
    });

    if (error) {
      console.warn("Error inserting user to Supabase:", error.message);
    }

    // Keep local cache updated & broadcast
    const current = getStoredUsers();
    const updated = sanitizeAndDedupeUsers([
      normalizedUser,
      ...current.filter((u) => u.email.toLowerCase() !== cleanEmail),
    ]);
    saveUsersToLocalStorage(updated);

    return !error;
  } catch (err) {
    console.warn("Failed to persist user to Supabase cloud:", err);
    return false;
  }
}

/**
 * Checks whether an account has been deleted / revoked by the administrator in the cloud.
 */
export async function isUserAccountRevoked(email?: string): Promise<boolean> {
  if (!email) return false;
  const clean = email.trim().toLowerCase();

  // Primary founders can never be revoked
  if (ADMIN_EMAILS.slice(0, 2).some((a) => a.toLowerCase() === clean)) {
    return false;
  }

  try {
    const pubId = getEmailStorageKey(clean);
    const { data } = await supabasePublic
      .from("media")
      .select("url, original_filename, created_at")
      .eq("resource_type", "user_account")
      .or(`public_id.eq.${pubId},original_filename.ilike.%${clean}%`)
      .order("created_at", { ascending: false });

    if (data && data.length > 0) {
      for (const row of data) {
        try {
          const parsed = JSON.parse(row.url || "{}");
          const rowEmail = (
            parsed.email ||
            row.original_filename?.replace("DELETED_", "")?.replace("PURGED_", "") ||
            ""
          ).trim().toLowerCase();
          if (rowEmail === clean) {
            if (
              parsed.isPurged ||
              parsed.role === "Purged" ||
              row.original_filename?.startsWith("PURGED_") ||
              parsed.isDeleted ||
              parsed.role === "Deleted" ||
              row.original_filename?.startsWith("DELETED_")
            ) {
              return true;
            }
            return false;
          }
        } catch {}
      }
    }
  } catch (e) {
    console.warn("Failed to check if user account is revoked:", e);
  }
  return false;
}

/**
 * Syncs any authenticated Supabase session user into the cloud user directory.
 * Guaranteed to be called when ANY user logs in, signs up, or visits their profile.
 * CRITICAL: If account was deleted by admin, forces immediate logout and cancels sync.
 */
export async function syncSessionUserToCloud(user: User, fallbackName?: string): Promise<ManagedUser | null> {
  if (!user || !user.email) return null;

  const email = user.email.trim().toLowerCase();
  if (isDemoOrDummyEmail(email)) return null;

  // 1. If account was revoked/deleted by admin, force logout immediately
  const isRevoked = await isUserAccountRevoked(email);
  if (isRevoked) {
    console.warn(`User ${email} was deleted by admin. Force signing out.`);
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      await supabase.auth.signOut().catch(() => {});
    } catch {}
    if (typeof window !== "undefined") {
      localStorage.removeItem("creare_dev_session");
      const current = getStoredUsers().filter((u) => u.email.toLowerCase() !== email);
      saveUsersToLocalStorage(current);
      window.dispatchEvent(new CustomEvent("creare_session_revoked", { detail: email }));
    }
    return null;
  }

  let realName = (
    (user.user_metadata?.full_name as string) ||
    (user.user_metadata?.name as string) ||
    ""
  ).trim();

  if (!realName) {
    if (fallbackName && fallbackName.trim()) {
      realName = fallbackName.trim();
    } else {
      realName = email.split("@")[0] || "User";
    }
  }

  const realPhone = (
    (user.user_metadata?.phone as string) ||
    (user.phone as string) ||
    ""
  ).trim();

  const realProvider = (
    user.app_metadata?.provider === "google"
      ? "Google OAuth"
      : user.app_metadata?.provider === "github"
      ? "GitHub"
      : "Email / Password"
  ) as ManagedUser["provider"];

  // Authoritative check against Supabase cloud to determine the user's latest appointed role & record
  let cloudUser: (ManagedUser & { isDeleted?: boolean }) | null = null;
  try {
    const pubId = getEmailStorageKey(email);
    const { data } = await supabasePublic
      .from("media")
      .select("url, created_at")
      .eq("resource_type", "user_account")
      .or(`public_id.eq.${pubId},original_filename.ilike.${email}`)
      .order("created_at", { ascending: false });

    if (data && data.length > 0) {
      for (const row of data) {
        try {
          const parsed = JSON.parse(row.url) as ManagedUser & { isDeleted?: boolean };
          if (parsed && parsed.email?.toLowerCase() === email) {
            cloudUser = parsed;
            break; // Authoritative newest row
          }
        } catch {}
      }
    }
  } catch (err) {
    console.warn("Could not check cloud role in syncSessionUserToCloud:", err);
  }

  const existingLocal = getStoredUsers().find((u) => u.email.toLowerCase() === email);

  // Authoritative role resolution:
  // 1. Primary founder accounts always Super Admin
  // 2. Authoritative role set by Super Admin in cloud database (Super Admin, Admin, Intern, Customer)
  // 3. User metadata / local fallback
  let realRole: ManagedUser["role"] = "Customer";
  if (ADMIN_EMAILS.slice(0, 2).some((a) => a.toLowerCase() === email)) {
    realRole = "Super Admin";
  } else if (cloudUser && cloudUser.role && !cloudUser.isDeleted && (cloudUser as any).role !== "Deleted") {
    realRole = cloudUser.role;
  } else if (existingLocal?.role && existingLocal.role !== "Customer") {
    realRole = existingLocal.role;
  } else if (user.user_metadata?.role === "admin" || user.app_metadata?.role === "admin") {
    realRole = "Admin";
  } else if (user.user_metadata?.role === "intern" || user.app_metadata?.role === "intern") {
    realRole = "Intern";
  }

  const realJoinDate = cloudUser?.joinedDate || existingLocal?.joinedDate || (user.created_at
    ? new Date(user.created_at).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "Recently");

  const real8DigitId = cloudUser?.id || existingLocal?.id || format8DigitUserId(user.id || email);

  const managedUser: ManagedUser = {
    id: real8DigitId,
    name: realName || cloudUser?.name || existingLocal?.name || "User",
    email,
    phone: (realPhone && realPhone !== "—") ? realPhone : (cloudUser?.phone || existingLocal?.phone || "—"),
    provider: realProvider,
    role: realRole,
    joinedDate: realJoinDate,
    company: cloudUser?.company || existingLocal?.company,
    avatarUrl: cloudUser?.avatarUrl || existingLocal?.avatarUrl,
    internDetails: cloudUser?.internDetails || existingLocal?.internDetails,
  };

  // Always update local cache so isAdmin(user) and other sync checks instantly see the authoritative role!
  const current = getStoredUsers();
  const updated = sanitizeAndDedupeUsers([
    managedUser,
    ...current.filter((u) => u.email.toLowerCase() !== email),
  ]);
  saveUsersToLocalStorage(updated);

  // If the user has never been recorded in the cloud database, persist them now
  if (!cloudUser) {
    try {
      await saveUserToCloud(managedUser);
    } catch (err) {
      console.warn("Initial user cloud sync error:", err);
    }
  }

  return managedUser;
}

/**
 * Authoritative async helper to retrieve a user's exact assigned role directly from Supabase.
 */
export async function getUserRoleAsync(email: string): Promise<"Super Admin" | "Admin" | "Intern" | "Customer"> {
  if (!email) return "Customer";
  const safeEmail = email.trim().toLowerCase();
  if (isDemoOrDummyEmail(safeEmail)) return "Customer";

  if (ADMIN_EMAILS.slice(0, 2).some((a) => a.toLowerCase() === safeEmail)) {
    return "Super Admin";
  }

  try {
    const pubId = getEmailStorageKey(safeEmail);
    const { data } = await supabasePublic
      .from("media")
      .select("url, created_at")
      .eq("resource_type", "user_account")
      .or(`public_id.eq.${pubId},original_filename.ilike.${safeEmail}`)
      .order("created_at", { ascending: false });

    if (data && data.length > 0) {
      for (const row of data) {
        try {
          const parsed = JSON.parse(row.url || "{}") as any;
          if (parsed && parsed.email?.toLowerCase() === safeEmail) {
            if (parsed.isDeleted || parsed.role === "Deleted") {
              return "Customer";
            }
            if (parsed.role) {
              return parsed.role;
            }
          }
        } catch {}
      }
    }
  } catch (err) {
    console.warn("Error getting user role async:", err);
  }

  const local = getStoredUsers().find((u) => u.email.toLowerCase() === safeEmail);
  return local?.role || "Customer";
}

/**
 * Permanently deletes / revokes a user from cloud database and active directory.
 * Inserts a durable revocation tombstone so any active session for this user is force-logged out,
 * and moves them to the dedicated Deleted / Revoked Accounts table.
 */
export async function deleteUserFromCloud(
  userId: string,
  email: string,
  userMeta?: Partial<ManagedUser>
): Promise<boolean> {
  try {
    const cleanEmail = email.trim().toLowerCase();
    const publicId = getEmailStorageKey(cleanEmail);
    const nowIso = new Date().toISOString();

    const tombstonePayload = {
      email: cleanEmail,
      isDeleted: true,
      id: userId,
      name: userMeta?.name || cleanEmail.split("@")[0] || "User",
      role: "Deleted",
      previousRole: userMeta?.role || "Customer",
      provider: userMeta?.provider || "Google OAuth",
      phone: userMeta?.phone || "—",
      deletedAt: nowIso,
    };

    // Insert tombstone into Supabase media table under user_account
    await supabasePublic.from("media").insert({
      public_id: publicId,
      resource_type: "user_account",
      url: JSON.stringify(tombstonePayload),
      original_filename: `DELETED_${cleanEmail}`,
    });

    // Remove from active users list
    const current = getStoredUsers();
    const updated = current.filter(
      (u) => u.id !== userId && u.email.toLowerCase() !== cleanEmail
    );
    saveUsersToLocalStorage(updated);

    // Add to deleted users list
    const deletedRecord: DeletedUserRecord = {
      id: userId,
      name: tombstonePayload.name,
      email: cleanEmail,
      phone: tombstonePayload.phone,
      provider: tombstonePayload.provider as any,
      previousRole: tombstonePayload.previousRole as any,
      deletedAt: nowIso,
      reason: "Revoked by Administrator",
    };

    const currentDeleted = getStoredDeletedUsers().filter(
      (d) => d.email.toLowerCase() !== cleanEmail
    );
    saveDeletedUsersToLocalStorage([deletedRecord, ...currentDeleted]);

    // Broadcast account deletion so any active tab/browser for this user force signs out immediately
    try {
      const bc = new BroadcastChannel("creare_admin_channel");
      bc.postMessage({ type: "account_deleted", email: cleanEmail });
      bc.close();
    } catch {}

    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("creare_account_deleted", { detail: cleanEmail })
      );
    }

    return true;
  } catch (err) {
    console.warn("Failed to delete user from Supabase cloud:", err);
    return false;
  }
}

/**
 * Restores a previously deleted user account in Supabase and reactivates their access.
 */
export async function restoreUserInCloud(
  record: DeletedUserRecord,
  appointedRole?: ManagedUser["role"]
): Promise<boolean> {
  if (!record || !record.email) return false;
  const cleanEmail = record.email.trim().toLowerCase();
  const targetRole = appointedRole || record.previousRole || "Customer";
  const publicId = getEmailStorageKey(cleanEmail);

  const restoredUser: ManagedUser = {
    id: record.id || format8DigitUserId(cleanEmail),
    name: record.name || cleanEmail.split("@")[0] || "User",
    email: cleanEmail,
    phone: record.phone && record.phone !== "—" ? record.phone : "—",
    provider: (record.provider || "Google OAuth") as ManagedUser["provider"],
    role: targetRole,
    joinedDate: new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
  };

  try {
    // Insert new authoritative active record into Supabase media table
    const { error } = await supabasePublic.from("media").insert({
      public_id: publicId,
      resource_type: "user_account",
      url: JSON.stringify(restoredUser),
      original_filename: cleanEmail,
    });

    if (error) {
      console.warn("Error inserting restored user in Supabase:", error.message);
    }

    // Add back to active users
    const currentActive = getStoredUsers().filter(
      (u) => u.email.toLowerCase() !== cleanEmail
    );
    const updatedActive = sanitizeAndDedupeUsers([restoredUser, ...currentActive]);
    saveUsersToLocalStorage(updatedActive);

    // Remove from deleted users
    const currentDeleted = getStoredDeletedUsers().filter(
      (d) => d.email.toLowerCase() !== cleanEmail
    );
    saveDeletedUsersToLocalStorage(currentDeleted);

    // Broadcast across tabs
    try {
      const bc = new BroadcastChannel("creare_admin_channel");
      bc.postMessage({ type: "user_restored", user: restoredUser });
      bc.close();
    } catch {}

    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("creare_user_restored", { detail: restoredUser })
      );
    }

    return !error;
  } catch (err) {
    console.error("Failed to restore user in Supabase cloud:", err);
    return false;
  }
}

/**
 * Permanently purges a record from the Deleted Accounts table and Supabase cloud.
 * Writes a permanent PURGED tombstone to Supabase so this account will NEVER resurrect
 * in the Active Directory or Removed Accounts Table.
 */
export async function purgeDeletedUserRecord(email: string): Promise<boolean> {
  if (!email) return false;
  const cleanEmail = email.trim().toLowerCase();
  const pubId = getEmailStorageKey(cleanEmail);

  try {
    // 1. Insert permanent PURGED tombstone row in Supabase
    await supabasePublic.from("media").insert({
      public_id: pubId,
      resource_type: "user_account",
      url: JSON.stringify({
        email: cleanEmail,
        isPurged: true,
        isDeleted: true,
        role: "Purged",
        purgedAt: new Date().toISOString(),
      }),
      original_filename: `PURGED_${cleanEmail}`,
    });
  } catch (err) {
    console.warn("Could not insert PURGED tombstone in Supabase:", err);
  }

  // 2. Clear from localStorage deleted accounts
  const currentDeleted = getStoredDeletedUsers().filter(
    (d) => d.email.toLowerCase() !== cleanEmail
  );
  saveDeletedUsersToLocalStorage(currentDeleted);

  // 3. Clear from localStorage active accounts
  const currentActive = getStoredUsers().filter(
    (u) => u.email.toLowerCase() !== cleanEmail
  );
  saveUsersToLocalStorage(currentActive);

  // 4. Broadcast purge event across tabs
  try {
    const bc = new BroadcastChannel("creare_admin_channel");
    bc.postMessage({ type: "account_purged", email: cleanEmail });
    bc.close();
  } catch {}

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("creare_account_purged", { detail: cleanEmail })
    );
  }

  return true;
}

/**
 * Purges ALL accounts currently in the Deleted Accounts list.
 */
export async function purgeAllDeletedUserRecords(): Promise<boolean> {
  const current = getStoredDeletedUsers();
  for (const record of current) {
    await purgeDeletedUserRecord(record.email);
  }
  return true;
}

/**
 * Generates unique 8-digit User ID for manually added users
 */
export function generateUnique8DigitId(existingList: ManagedUser[]): string {
  const existing = new Set(existingList.map((u) => u.id));
  let id = "";
  let attempts = 0;
  do {
    const num = Math.floor(10000000 + Math.random() * 90000000);
    id = String(num);
    attempts++;
  } while (existing.has(id) && attempts < 1000);
  return id;
}

/**
 * Export users directory to CSV file
 */
export function exportUsersToCsv(users: ManagedUser[]): void {
  if (typeof window === "undefined" || users.length === 0) return;

  const headers = [
    "User ID",
    "Customer Name",
    "Email Address",
    "Mobile Number",
    "Sign-up Provider",
    "Account Role",
    "Joined Date",
    "Company / Store",
  ];

  const rows = users.map((u) => [
    `"${u.id}"`,
    `"${(u.name || "").replace(/"/g, '""')}"`,
    `"${(u.email || "").replace(/"/g, '""')}"`,
    `"${(u.phone || "").replace(/"/g, '""')}"`,
    `"${u.provider}"`,
    `"${u.role}"`,
    `"${u.joinedDate}"`,
    `"${(u.company || "").replace(/"/g, '""')}"`,
  ]);

  const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `creare_mind_users_${new Date().toISOString().split("T")[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Checks if the given authenticated user is authorized to access the Intern Workspace.
 * Access is granted ONLY if:
 * 1. The user is a Super Admin or listed in ADMIN_EMAILS.
 * 2. The user has been appointed as an "Intern" by the Admin in User Management.
 */
export function isInternOrAdmin(
  user: User | null | undefined,
  cachedUsers?: ManagedUser[]
): {
  allowed: boolean;
  role: "Super Admin" | "Admin" | "Intern" | "Customer" | null;
  managedUser: ManagedUser | null;
} {
  if (!user || !user.email) {
    return { allowed: false, role: null, managedUser: null };
  }

  const email = user.email.trim().toLowerCase();

  // Super Admins always have oversight access
  if (isAdmin(user) || ADMIN_EMAILS.some((adm) => adm.toLowerCase() === email)) {
    const list = cachedUsers && cachedUsers.length > 0 ? cachedUsers : getStoredUsers();
    const match = list.find((u) => u.email.trim().toLowerCase() === email) || null;
    return { allowed: true, role: "Super Admin", managedUser: match };
  }

  // Check user metadata if role was set directly
  const metaRole = String(user.user_metadata?.role || user.app_metadata?.role || "").toLowerCase();
  if (metaRole === "intern") {
    const list = cachedUsers && cachedUsers.length > 0 ? cachedUsers : getStoredUsers();
    const match = list.find((u) => u.email.trim().toLowerCase() === email) || null;
    return { allowed: true, role: "Intern", managedUser: match };
  }

  const list = cachedUsers && cachedUsers.length > 0 ? cachedUsers : getStoredUsers();
  const match = list.find((u) => u.email.trim().toLowerCase() === email);

  if (match) {
    if (match.role === "Intern" || match.role === "Admin" || match.role === "Super Admin") {
      return { allowed: true, role: match.role, managedUser: match };
    }
    return { allowed: false, role: match.role, managedUser: match };
  }

  return { allowed: false, role: "Customer", managedUser: null };
}
