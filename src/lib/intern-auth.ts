import { supabasePublic } from "@/lib/supabase-public";
import { getEmailStorageKey } from "@/lib/admin-users";

/**
 * Standard SHA-256 hashing using the browser's built-in Web Crypto API
 */
export async function hashInternPassword(password: string): Promise<string> {
  const clean = password.trim();
  if (!clean) return "";
  try {
    if (typeof window !== "undefined" && window.crypto && window.crypto.subtle) {
      const encoder = new TextEncoder();
      const data = encoder.encode(clean);
      const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    }
  } catch (e) {
    console.warn("WebCrypto error, fallback hashing:", e);
  }
  // Simple fallback hash for SSR or older environments
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    const char = clean.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return "h_" + Math.abs(hash).toString(16);
}

/**
 * Retrieves the stored password hash from localStorage (synchronous)
 */
export function getStoredInternPasswordHash(email: string): string | null {
  if (typeof window === "undefined" || !email) return null;
  const key = `creare_intern_pwd_${email.trim().toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
  return localStorage.getItem(key);
}

/**
 * Checks if the current session is already unlocked for this intern
 */
export function isInternUnlocked(email: string): boolean {
  if (typeof window === "undefined" || !email) return false;
  const key = `creare_intern_unlocked_${email.trim().toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
  return sessionStorage.getItem(key) === "true" || localStorage.getItem(key) === "true";
}

/**
 * Marks the session as unlocked or locked
 */
export function setInternUnlocked(email: string, unlocked: boolean): void {
  if (typeof window === "undefined" || !email) return;
  const key = `creare_intern_unlocked_${email.trim().toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
  if (unlocked) {
    sessionStorage.setItem(key, "true");
    localStorage.setItem(key, "true");
  } else {
    sessionStorage.removeItem(key);
    localStorage.removeItem(key);
  }
  window.dispatchEvent(new CustomEvent("creare_intern_lock_changed", { detail: { email, unlocked } }));
}

/**
 * Locks the intern session (requires password on next view)
 */
export function lockInternSession(email: string): void {
  setInternUnlocked(email, false);
}

/**
 * Fetches password hash authoritatively from Supabase cloud database
 */
export async function fetchInternPasswordHashFromCloud(email: string): Promise<string | null> {
  if (!email) return null;
  const cleanEmail = email.trim().toLowerCase();
  const localHash = getStoredInternPasswordHash(cleanEmail);

  try {
    const pubId = `${getEmailStorageKey(cleanEmail)}_CREDENTIAL`;
    const { data, error } = await supabasePublic
      .from("media")
      .select("url, created_at")
      .eq("resource_type", "intern_credential")
      .eq("public_id", pubId)
      .order("created_at", { ascending: false })
      .limit(1);

    if (!error && data && data.length > 0 && data[0].url) {
      try {
        const parsed = JSON.parse(data[0].url);
        if (parsed && parsed.hash) {
          const key = `creare_intern_pwd_${cleanEmail.replace(/[^a-z0-9]/g, "_")}`;
          if (typeof window !== "undefined") {
            localStorage.setItem(key, parsed.hash);
          }
          return parsed.hash;
        }
      } catch {}
    }
  } catch (err) {
    console.warn("Could not fetch intern password hash from Supabase:", err);
  }

  return localHash;
}

/**
 * Sets or updates the intern access password in both Supabase cloud and local storage
 */
export async function saveInternPassword(email: string, plainPassword: string): Promise<boolean> {
  if (!email || !plainPassword) return false;
  const cleanEmail = email.trim().toLowerCase();
  const hash = await hashInternPassword(plainPassword);

  // 1. Save in local storage
  if (typeof window !== "undefined") {
    const key = `creare_intern_pwd_${cleanEmail.replace(/[^a-z0-9]/g, "_")}`;
    localStorage.setItem(key, hash);
  }

  // 2. Mark session unlocked immediately
  setInternUnlocked(cleanEmail, true);

  // 3. Persist credential hash in Supabase cloud database
  try {
    const pubId = `${getEmailStorageKey(cleanEmail)}_CREDENTIAL`;
    const payload = {
      email: cleanEmail,
      hash,
      updatedAt: new Date().toISOString(),
    };

    await supabasePublic.from("media").insert({
      public_id: pubId,
      resource_type: "intern_credential",
      url: JSON.stringify(payload),
      original_filename: `CREDENTIAL_${cleanEmail}`,
    });

    return true;
  } catch (err) {
    console.warn("Failed to persist intern credential in Supabase:", err);
    return true; // Local storage succeeded
  }
}

/**
 * Verifies the intern's entered password against stored hash
 */
export async function verifyInternPassword(email: string, plainPassword: string): Promise<boolean> {
  if (!email || !plainPassword) return false;
  const cleanEmail = email.trim().toLowerCase();
  const inputHash = await hashInternPassword(plainPassword);

  let storedHash = getStoredInternPasswordHash(cleanEmail);
  if (!storedHash) {
    storedHash = await fetchInternPasswordHashFromCloud(cleanEmail);
  }

  if (!storedHash) return false;

  const isValid = inputHash === storedHash;
  if (isValid) {
    setInternUnlocked(cleanEmail, true);
  }
  return isValid;
}
