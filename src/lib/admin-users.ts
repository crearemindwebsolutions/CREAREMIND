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
];

const STORAGE_KEY = "creare_admin_users_list";

const DUMMY_EMAILS = new Set([
  "crearemindwebsolutions@gmail.com",
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
 * Fetches ALL live registered users from Supabase cloud database
 */
export async function fetchUsersFromCloud(): Promise<ManagedUser[]> {
  try {
    const { data, error } = await supabasePublic
      .from("media")
      .select("url, created_at")
      .eq("resource_type", "user_account")
      .order("created_at", { ascending: false });

    const rowsByEmail = new Map<string, (ManagedUser & { isDeleted?: boolean })[]>();

    if (!error && Array.isArray(data)) {
      for (const row of data) {
        try {
          if (row.url) {
            const parsed = JSON.parse(row.url) as ManagedUser & { isDeleted?: boolean };
            if (parsed && parsed.email) {
              const emailKey = parsed.email.trim().toLowerCase();
              if (!rowsByEmail.has(emailKey)) rowsByEmail.set(emailKey, []);
              rowsByEmail.get(emailKey)!.push(parsed);
            }
          }
        } catch {}
      }
    }

    const cloudUsers: ManagedUser[] = [];
    const deletedEmails = new Set<string>();

    for (const [emailKey, rows] of rowsByEmail.entries()) {
      if (isDemoOrDummyEmail(emailKey)) continue;

      // Authoritative: Inspect the NEWEST record for this email
      const newest = rows[0];
      if (newest?.isDeleted || (newest as any)?.role === "Deleted") {
        deletedEmails.add(emailKey);
        continue;
      }

      // The newest row contains the authoritative role and details saved by the admin
      if (newest && newest.name && newest.role) {
        cloudUsers.push(newest);
      }
    }

    // Filter localUsers to purge deleted accounts and demo accounts from browser storage
    const localUsers = getStoredUsers().filter(
      (u) => !deletedEmails.has(u.email.trim().toLowerCase()) && !isDemoOrDummyEmail(u.email.trim().toLowerCase())
    );

    // Combine cloud users, purged local users, and default admin accounts
    const combined = sanitizeAndDedupeUsers([...cloudUsers, ...localUsers, ...DEFAULT_MANAGED_USERS]).filter(
      (u) => !deletedEmails.has(u.email.trim().toLowerCase()) && !isDemoOrDummyEmail(u.email.trim().toLowerCase())
    );

    saveUsersToLocalStorage(combined);
    return combined;
  } catch (err) {
    console.warn("Could not fetch users from Supabase cloud:", err);
    return DEFAULT_MANAGED_USERS;
  }
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
 * Syncs any authenticated Supabase session user into the cloud user directory.
 * Guaranteed to be called when ANY user logs in, signs up, or visits their profile.
 * CRITICAL: Preserves whatever role the Super Admin appointed in the cloud (Admin, Super Admin, Intern, Customer).
 */
export async function syncSessionUserToCloud(user: User, fallbackName?: string): Promise<ManagedUser | null> {
  if (!user || !user.email) return null;

  const email = user.email.trim().toLowerCase();
  if (isDemoOrDummyEmail(email)) return null;

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
 * Permanently deletes a user from cloud database and local cache
 */
export async function deleteUserFromCloud(userId: string, email: string): Promise<boolean> {
  try {
    const publicId = getEmailStorageKey(email);
    // Insert tombstone to propagate deletion across all devices
    await supabasePublic.from("media").insert({
      public_id: publicId,
      resource_type: "user_account",
      url: JSON.stringify({ email, isDeleted: true, id: userId, role: "Deleted" }),
      original_filename: `DELETED_${email}`,
    });

    const current = getStoredUsers();
    const updated = current.filter(
      (u) => u.id !== userId && u.email.toLowerCase() !== email.toLowerCase()
    );
    saveUsersToLocalStorage(updated);
    return true;
  } catch (err) {
    console.warn("Failed to delete user from Supabase cloud:", err);
    return false;
  }
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
