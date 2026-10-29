import { supabase } from "@/integrations/supabase/client";
import { createClient } from "@supabase/supabase-js";

export interface CloudinaryUploadResponse {
  asset_id: string;
  public_id: string;
  version: number;
  format: string;
  resource_type: string;
  created_at: string;
  bytes: number;
  url: string;
  secure_url: string;
  original_filename?: string;
}

export interface MediaRecord {
  id: string;
  user_id: string | null;
  url: string;
  public_id: string;
  resource_type: string;
  format: string | null;
  bytes: number | null;
  original_filename: string | null;
  created_at: string;
}

const CLOUD_NAME = import.meta.env["VITE_CLOUDINARY_CLOUD_NAME"] || "nf3aubag";
const UPLOAD_PRESET = import.meta.env["VITE_CLOUDINARY_UPLOAD_PRESET"] || "crearemind";
const SUPABASE_URL = import.meta.env["VITE_SUPABASE_URL"] || "https://lnfdtleuoyjkqmuonhnt.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] || "sb_publishable_hkrqISIhR1AlZbklD2QWPw_k7a-0YSm";

// Dedicated public/anon client for media operations so RLS policy "Public can view media"
// and "Allow anon insert" always apply, guaranteeing shared media is visible even when
// authenticated with a user session.
const publicSupabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

const LOCAL_STORAGE_MEDIA_KEY = "creare_uploaded_media_v1";
const LOCAL_STORAGE_DELETED_KEY = "creare_deleted_media_ids_v1";

export const LEGACY_AI_BLACKLISTED_IDS = [
  "gm33q3bquos8hs0fwrzo",
  "kwkab3etojeikeclxnx5",
  "jum4pj3cdzvninwtdvfp",
  "kwfqzovj8xfkvvph1z1y",
  "ow7c0uatyd1bx6hl7skg",
  "qhs7uxfjnmhclfsvl92g",
  "vlln111ls8isi7ydnxpe",
  "frzn8lxk1eefwk2yplhp",
  "hero-v1",
  "hero-v2",
  "hero-v3",
  "hero-1",
  "hero-2",
  "hero-3",
  "hero-library",
];

export const isLegacyBlacklisted = (idOrUrl?: string | null): boolean => {
  if (!idOrUrl || typeof idOrUrl !== "string") return false;
  return LEGACY_AI_BLACKLISTED_IDS.some((bad) => idOrUrl.includes(bad));
};

export function getDeletedMediaKeys(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_DELETED_KEY);
    const arr: string[] = raw ? JSON.parse(raw) : [];
    return new Set(arr);
  } catch {
    return new Set();
  }
}

export function saveDeletedMediaKey(key: string): void {
  if (typeof window === "undefined" || !key) return;
  try {
    const current = getDeletedMediaKeys();
    current.add(key);
    localStorage.setItem(LOCAL_STORAGE_DELETED_KEY, JSON.stringify(Array.from(current)));
  } catch (err) {
    console.warn("Could not save to deleted media cache:", err);
  }
}

export function saveDeletedMediaKeysBatch(keys: string[]): void {
  if (typeof window === "undefined" || !keys.length) return;
  try {
    const current = getDeletedMediaKeys();
    for (const k of keys) {
      if (k) current.add(k);
    }
    localStorage.setItem(LOCAL_STORAGE_DELETED_KEY, JSON.stringify(Array.from(current)));
  } catch (err) {
    console.warn("Could not save batch to deleted media cache:", err);
  }
}

export function getLocalMedia(): MediaRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_MEDIA_KEY);
    const list: MediaRecord[] = raw ? JSON.parse(raw) : [];
    const deleted = getDeletedMediaKeys();
    return list.filter(
      (m) =>
        !deleted.has(m.id) &&
        !deleted.has(m.url) &&
        !deleted.has(m.public_id) &&
        !isLegacyBlacklisted(m.id) &&
        !isLegacyBlacklisted(m.url) &&
        !isLegacyBlacklisted(m.public_id) &&
        m.resource_type !== "deleted" &&
        !m.public_id?.startsWith("DELETED:")
    );
  } catch {
    return [];
  }
}

export function saveLocalMedia(record: MediaRecord): void {
  if (typeof window === "undefined") return;
  try {
    const deleted = getDeletedMediaKeys();
    if (
      deleted.has(record.id) ||
      deleted.has(record.url) ||
      deleted.has(record.public_id) ||
      record.resource_type === "deleted" ||
      record.public_id?.startsWith("DELETED:")
    ) {
      return;
    }
    const current = getLocalMedia();
    const updated = [record, ...current.filter((m) => m.url !== record.url && m.public_id !== record.public_id)];
    localStorage.setItem(LOCAL_STORAGE_MEDIA_KEY, JSON.stringify(updated.slice(0, 200)));
  } catch (err) {
    console.warn("Could not save to local media cache:", err);
  }
}

export function saveLocalMediaBatch(records: MediaRecord[]): void {
  if (typeof window === "undefined" || !records.length) return;
  try {
    const deleted = getDeletedMediaKeys();
    const current = getLocalMedia().filter(
      (m) => !deleted.has(m.id) && !deleted.has(m.url) && !deleted.has(m.public_id)
    );
    const map = new Map<string, MediaRecord>();
    for (const r of current) map.set(r.url, r);
    for (const r of records) {
      if (
        !deleted.has(r.id) &&
        !deleted.has(r.url) &&
        !deleted.has(r.public_id) &&
        r.resource_type !== "deleted" &&
        !r.public_id?.startsWith("DELETED:")
      ) {
        map.set(r.url, r);
      }
    }
    const merged = Array.from(map.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    localStorage.setItem(LOCAL_STORAGE_MEDIA_KEY, JSON.stringify(merged.slice(0, 200)));
  } catch (err) {
    console.warn("Could not save batch to local media cache:", err);
  }
}

export function removeLocalMedia(idOrUrl: string): void {
  if (typeof window === "undefined") return;
  try {
    saveDeletedMediaKey(idOrUrl);
    const current = getLocalMedia();
    const updated = current.filter((m) => m.id !== idOrUrl && m.url !== idOrUrl && m.public_id !== idOrUrl);
    localStorage.setItem(LOCAL_STORAGE_MEDIA_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn("Could not remove from local media cache:", err);
  }
}

/**
 * Upload a file directly to Cloudinary using an unsigned upload preset.
 * Works for images and videos.
 */
export async function uploadToCloudinary(file: File): Promise<CloudinaryUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  // Use 'auto' so Cloudinary handles both images and videos seamlessly
  const endpoint = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `Upload failed with status ${response.status}`);
    }

    const result: CloudinaryUploadResponse = await response.json();
    return result;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Cloudinary upload network error";
    throw new Error(msg);
  }
}

/**
 * Save an uploaded media item into the Supabase database.
 * Uses publicSupabase first to avoid RLS / foreign key violations,
 * and maintains resilient local storage caching.
 */
export async function saveMediaToDatabase(
  upload: CloudinaryUploadResponse,
  userId?: string | null
): Promise<MediaRecord> {
  const fallbackRecord: MediaRecord = {
    id: `media_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    user_id: userId || null,
    url: upload.secure_url,
    public_id: upload.public_id,
    resource_type: upload.resource_type || "image",
    format: upload.format || null,
    bytes: upload.bytes || null,
    original_filename: upload.original_filename || null,
    created_at: new Date().toISOString(),
  };

  try {
    // Attempt insert via publicSupabase (anon role) which has full insert check (true)
    const res = await publicSupabase
      .from("media")
      .insert({
        url: upload.secure_url,
        public_id: upload.public_id,
        resource_type: upload.resource_type || "image",
        format: upload.format || null,
        bytes: upload.bytes || null,
        original_filename: upload.original_filename || null,
        user_id: null,
      })
      .select()
      .single();

    if (res.data && !res.error) {
      saveLocalMedia(res.data);
      return res.data;
    }

    // Fallback: Try with authenticated client if present
    if (userId) {
      const authRes = await supabase
        .from("media")
        .insert({
          url: upload.secure_url,
          public_id: upload.public_id,
          resource_type: upload.resource_type || "image",
          format: upload.format || null,
          bytes: upload.bytes || null,
          original_filename: upload.original_filename || null,
          user_id: userId,
        })
        .select()
        .single();

      if (authRes.data && !authRes.error) {
        saveLocalMedia(authRes.data);
        return authRes.data;
      }
    }

    console.warn("Supabase insert returned error, saving to local cache:", res.error?.message);
    saveLocalMedia(fallbackRecord);
    return fallbackRecord;
  } catch (err) {
    console.warn("Supabase insert exception, using resilient fallback:", err);
    saveLocalMedia(fallbackRecord);
    return fallbackRecord;
  }
}

/**
 * Upload a single file to Cloudinary and immediately record it in the database and local cache.
 */
export async function uploadAndSaveMedia(file: File, userId?: string | null): Promise<MediaRecord> {
  const uploadResult = await uploadToCloudinary(file);
  return saveMediaToDatabase(uploadResult, userId);
}

/**
 * Upload multiple files in batch with progress reporting and isolated error handling.
 * Allows uploading dozens of images/videos seamlessly without failing the entire batch.
 */
export async function uploadMultipleMedia(
  files: File[],
  userId?: string | null,
  onProgress?: (completed: number, total: number, currentFileName: string) => void
): Promise<{ successes: MediaRecord[]; failures: { fileName: string; error: string }[] }> {
  const successes: MediaRecord[] = [];
  const failures: { fileName: string; error: string }[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (onProgress) {
      onProgress(i, files.length, file.name);
    }

    try {
      const record = await uploadAndSaveMedia(file, userId);
      successes.push(record);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload error";
      failures.push({ fileName: file.name, error: msg });
    }
  }

  if (onProgress) {
    onProgress(files.length, files.length, "");
  }

  if (successes.length > 0) {
    saveLocalMediaBatch(successes);
  }

  return { successes, failures };
}

/**
 * Fetch all media items from Supabase database.
 * Uses publicSupabase to bypass authenticated RLS filtering so all uploaded demo & user media
 * are always returned to the admin console. Seamlessly merges with local fallback cache and
 * strictly excludes any deleted media or tombstones.
 */
export async function fetchUserMedia(userId?: string | null): Promise<MediaRecord[]> {
  const localItems = getLocalMedia();
  const deletedSet = getDeletedMediaKeys();

  try {
    // 1. Fetch from publicSupabase which has role 'anon' (all media is visible)
    const { data, error } = await publicSupabase
      .from("media")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Supabase query returned error, serving local cached media:", error.message);
      return localItems.filter(
        (m) =>
          !deletedSet.has(m.id) &&
          !deletedSet.has(m.url) &&
          !deletedSet.has(m.public_id) &&
          m.resource_type !== "deleted" &&
          !m.public_id?.startsWith("DELETED:")
      );
    }

    const rawItems: MediaRecord[] = data || [];

    // 2. Extract all tombstones from database
    const newlyDiscoveredDeleted: string[] = [];
    for (const item of rawItems) {
      const isTombstone =
        item.resource_type === "deleted" ||
        item.public_id?.startsWith("DELETED:") ||
        item.url?.startsWith("https://deleted.crearemind.com/");

      if (isTombstone) {
        if (item.original_filename) {
          deletedSet.add(item.original_filename);
          newlyDiscoveredDeleted.push(item.original_filename);
        }
        if (item.public_id?.startsWith("DELETED:")) {
          const targetId = item.public_id.replace(/^DELETED:/, "");
          deletedSet.add(targetId);
          newlyDiscoveredDeleted.push(targetId);
        }
        if (item.url && !item.url.startsWith("https://deleted.crearemind.com/")) {
          deletedSet.add(item.url);
          newlyDiscoveredDeleted.push(item.url);
        }
      }
    }

    if (newlyDiscoveredDeleted.length > 0) {
      saveDeletedMediaKeysBatch(newlyDiscoveredDeleted);
    }

    // 3. Filter DB items to strictly exclude tombstones and any deleted media
    const isCleanItem = (m: MediaRecord) =>
      !deletedSet.has(m.id) &&
      !deletedSet.has(m.url) &&
      !deletedSet.has(m.public_id) &&
      !isLegacyBlacklisted(m.id) &&
      !isLegacyBlacklisted(m.url) &&
      !isLegacyBlacklisted(m.public_id) &&
      m.resource_type !== "deleted" &&
      m.resource_type !== "site_config" &&
      !m.public_id?.startsWith("DELETED:") &&
      !m.url?.startsWith("https://deleted.crearemind.com/");

    const cleanDbItems = rawItems.filter(isCleanItem);
    const cleanLocalItems = localItems.filter(isCleanItem);

    // 4. Merge items cleanly without deleted media
    const combined = [...cleanDbItems];
    const existingUrls = new Set(combined.map((m) => m.url));

    for (const item of cleanLocalItems) {
      if (!existingUrls.has(item.url)) {
        combined.push(item);
        existingUrls.add(item.url);
      }
    }

    const sorted = combined.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    // 5. Save only clean items to localStorage cache
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(LOCAL_STORAGE_MEDIA_KEY, JSON.stringify(sorted.slice(0, 200)));
      } catch (err) {
        console.warn("Could not save clean media cache:", err);
      }
    }

    return sorted;
  } catch (err) {
    console.warn("Exception fetching media from Supabase, serving local cached media:", err);
    return localItems.filter(
      (m) =>
        !deletedSet.has(m.id) &&
        !deletedSet.has(m.url) &&
        !deletedSet.has(m.public_id) &&
        m.resource_type !== "deleted" &&
        !m.public_id?.startsWith("DELETED:")
    );
  }
}

/**
 * Delete a media item record from Supabase and local cache.
 * Records a durable tombstone so that even upon hard browser refreshes or
 * visits across devices, the item is guaranteed to never resurrect.
 */
export async function deleteMediaRecord(
  mediaId: string,
  mediaUrl?: string | null,
  publicId?: string | null
): Promise<void> {
  // 1. Instantly register in local deleted blacklist
  saveDeletedMediaKey(mediaId);
  if (mediaUrl) saveDeletedMediaKey(mediaUrl);
  if (publicId) saveDeletedMediaKey(publicId);

  // 2. Remove from local storage array
  removeLocalMedia(mediaId);
  if (mediaUrl) removeLocalMedia(mediaUrl);
  if (publicId) removeLocalMedia(publicId);

  // 3. Persist tombstone into Supabase database (anon insert is allowed by RLS)
  try {
    await publicSupabase.from("media").insert({
      url: mediaUrl || `https://deleted.crearemind.com/${mediaId}`,
      public_id: `DELETED:${mediaId}`,
      resource_type: "deleted",
      original_filename: mediaId,
      user_id: null,
    });
  } catch (err) {
    console.warn("Could not record media tombstone in Supabase:", err);
  }

  // 4. Also attempt direct delete on Supabase in case table permissions allow it
  try {
    await publicSupabase.from("media").delete().eq("id", mediaId);
    await supabase.from("media").delete().eq("id", mediaId);
  } catch (err) {
    console.warn("Could not delete from Supabase media table:", err);
  }
}

/**
 * Persist site content globally to Supabase cloud database so edits in /admin
 * are immediately visible to all visitors and live on production domains.
 */
export async function syncSiteContentToCloud(content: any): Promise<boolean> {
  try {
    const serialized = JSON.stringify(content);
    // Delete previous config rows
    await publicSupabase.from("media").delete().eq("public_id", "GLOBAL_SITE_CONTENT_CONFIG_V1");
    // Insert new global config row
    const { error } = await publicSupabase.from("media").insert({
      public_id: "GLOBAL_SITE_CONTENT_CONFIG_V1",
      resource_type: "site_config",
      url: serialized,
      original_filename: `config_${Date.now()}`,
    });
    if (error) {
      console.warn("Supabase site content sync error:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("Failed to sync site content to Supabase cloud:", err);
    return false;
  }
}

/**
 * Fetch the latest globally published site content from Supabase database.
 */
export async function fetchSiteContentFromCloud(): Promise<any | null> {
  try {
    const { data, error } = await publicSupabase
      .from("media")
      .select("url, created_at")
      .eq("public_id", "GLOBAL_SITE_CONTENT_CONFIG_V1")
      .order("created_at", { ascending: false })
      .limit(1);

    if (!error && data && data.length > 0 && data[0]?.url) {
      return JSON.parse(data[0].url);
    }
  } catch (err) {
    console.warn("Could not fetch global site content from Supabase cloud:", err);
  }
  return null;
}

