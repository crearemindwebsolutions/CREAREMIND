import { supabasePublic } from "@/lib/supabase-public";
import { saveUserToCloud, type ManagedUser } from "@/lib/admin-users";
import { format8DigitUserId } from "@/lib/user-id";

export interface ClientInquiry {
  id: string; // e.g. "CM-REQ-84920"
  name: string;
  phone: string;
  email: string;
  service: string;
  brief: string;
  status: "New" | "Contacted" | "In Progress" | "Completed" | "Archived";
  createdAt: string;
  timestamp: number;
  notes?: string;
}

const STORAGE_KEY = "creare_client_inquiries";
const LEGACY_STORAGE_KEY = "creare_callback_requests";
export const ADMIN_NOTIFICATION_EMAIL = "crearemindwebsolutions@gmail.com";

const FAKE_SAMPLE_IDS = new Set(["CM-REQ-92418", "CM-REQ-71042", "CM-REQ-52809"]);
const FAKE_SAMPLE_NAMES = new Set([
  "arun kumar",
  "priya sharma",
  "karthik raja",
  "sample",
  "test",
  "dummy",
]);

/**
 * Identify if an inquiry was a dummy/sample item so it gets automatically pruned
 */
export function isFakeInquiry(item: any): boolean {
  if (!item) return true;
  if (item.isDeleted || item.status === "Deleted") return true;
  const id = String(item.id || "").trim();
  const name = String(item.name || "").trim().toLowerCase();
  const email = String(item.email || "").trim().toLowerCase();

  if (FAKE_SAMPLE_IDS.has(id) || id.includes("99999")) return true;
  if (FAKE_SAMPLE_NAMES.has(name) || name.includes("test client")) return true;
  if (name.includes("arun kumar") || name.includes("priya sharma") || name.includes("karthik raja")) return true;
  if (email.includes("arun.kumar") || email.includes("priya@boutique") || email.includes("innovatetech.com")) return true;

  return false;
}

/**
 * Retrieve all genuine inquiries from localStorage. Absolutely NO fake data.
 */
export function getStoredInquiries(): ClientInquiry[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as ClientInquiry[];
      if (Array.isArray(parsed)) {
        // Strip out any fake/sample records
        const realOnly = parsed.filter((item) => !isFakeInquiry(item));
        if (realOnly.length !== parsed.length) {
          saveInquiriesList(realOnly);
        }
        return realOnly.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      }
    }

    // Clean legacy storage key if it had fake data
    const legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacyRaw) {
      try {
        const legacyParsed = JSON.parse(legacyRaw);
        if (Array.isArray(legacyParsed)) {
          const realLegacy = legacyParsed.filter((item) => !isFakeInquiry(item));
          if (realLegacy.length > 0) {
            const migrated: ClientInquiry[] = realLegacy.map((item: any, idx: number) => ({
              id: item.id || `CM-REQ-${Math.floor(10000 + Math.random() * 90000)}`,
              name: item.name || "Client",
              phone: item.phone || "—",
              email: item.email || "Not provided",
              service: item.service || "General Inquiry",
              brief: item.brief || "Requested consultation",
              status: "New",
              createdAt: item.createdAt || "Recently",
              timestamp: Date.now() - idx * 60000,
            }));
            saveInquiriesList(migrated);
            return migrated;
          } else {
            localStorage.removeItem(LEGACY_STORAGE_KEY);
          }
        }
      } catch {
        localStorage.removeItem(LEGACY_STORAGE_KEY);
      }
    }

    return [];
  } catch (err) {
    console.error("Failed to load inquiries from localStorage:", err);
    return [];
  }
}

/**
 * Save list to localStorage and trigger custom event for live cross-tab / cross-component sync
 */
export function saveInquiriesList(list: ClientInquiry[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    // Also keep legacy key synced for backward compatibility
    localStorage.setItem(
      LEGACY_STORAGE_KEY,
      JSON.stringify(
        list.map((q) => ({
          id: q.id,
          name: q.name,
          phone: q.phone,
          email: q.email,
          service: q.service,
          brief: q.brief,
          createdAt: q.createdAt,
        }))
      )
    );
    window.dispatchEvent(new CustomEvent("creare_inquiries_updated", { detail: list }));
  } catch (err) {
    console.error("Failed to save inquiries to localStorage:", err);
  }
}

/**
 * Send inquiry notification email to admin email and persist to admin inquiries
 */
export async function submitContactInquiry(data: {
  name: string;
  phone: string;
  email?: string;
  service: string;
  brief?: string;
}): Promise<{ success: boolean; id: string; emailSent: boolean }> {
  const ticketNum = Math.floor(10000 + Math.random() * 90000);
  const ticketId = `CM-REQ-${ticketNum}`;
  const now = new Date();
  const formattedTime = now.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }) + " at " + now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const record: ClientInquiry = {
    id: ticketId,
    name: data.name.trim(),
    phone: data.phone.trim(),
    email: data.email?.trim() || "Not provided",
    service: data.service.trim(),
    brief: data.brief?.trim() || "Requested project kickoff & consultation",
    status: "New",
    createdAt: formattedTime,
    timestamp: Date.now(),
  };

  // 1. Persist to Admin storage (local cache)
  try {
    const currentList = getStoredInquiries();
    const updated = [record, ...currentList.filter((q) => q.id !== record.id)];
    saveInquiriesList(updated);
  } catch (err) {
    console.error("Error persisting inquiry to admin storage:", err);
  }

  // 1b. Persist to Supabase cloud storage so all admin devices receive it in real-time
  try {
    const inqKey = `CREARE_INQUIRY_${record.id}`;
    await supabasePublic.from("media").delete().eq("public_id", inqKey);
    await supabasePublic.from("media").insert({
      public_id: inqKey,
      resource_type: "client_inquiry",
      url: JSON.stringify(record),
      original_filename: record.name,
    });
  } catch (cloudErr) {
    console.warn("Failed to persist inquiry to Supabase cloud:", cloudErr);
  }

  // 1c. Automatically add prospective client into Customer Directory so they appear in User Management
  if (record.email && record.email.includes("@") && !record.email.includes("Not provided")) {
    try {
      const emailLower = record.email.trim().toLowerCase();
      const customerId = format8DigitUserId(emailLower);
      const customerUser: ManagedUser = {
        id: customerId,
        name: record.name,
        email: emailLower,
        phone: record.phone || "—",
        provider: "Email / Password",
        role: "Customer",
        joinedDate: formattedTime.split(" at ")[0] || "Recently",
        company: `${record.service} Client`,
      };
      saveUserToCloud(customerUser).catch(() => {});
    } catch {}
  }

  // 2. Dispatch email to admin: crearemindwebsolutions@gmail.com
  let emailSent = false;
  try {
    const payload = {
      _subject: `⚡ New Project Inquiry: ${record.name} (${record.service}) - Ref ${record.id}`,
      "Ticket Reference": record.id,
      "Client Name": record.name,
      "Phone / WhatsApp": record.phone,
      "Email Address": record.email,
      "Selected Service": record.service,
      "Project Requirements": record.brief,
      "Submission Time": formattedTime,
      _captcha: "false",
      _template: "table",
    };

    const response = await fetch(`https://formsubmit.co/ajax/${ADMIN_NOTIFICATION_EMAIL}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      emailSent = true;
    }
  } catch (emailErr) {
    console.warn("Could not send automated email via API (fallback logged):", emailErr);
  }

  return {
    success: true,
    id: ticketId,
    emailSent,
  };
}

/**
 * Export inquiries to downloadable CSV
 */
export function exportInquiriesToCsv(inquiries: ClientInquiry[]): void {
  if (typeof window === "undefined" || inquiries.length === 0) return;

  const headers = ["Ticket ID", "Name", "Phone", "Email", "Service", "Status", "Date", "Brief", "Notes"];
  const rows = inquiries.map((q) => [
    `"${q.id}"`,
    `"${q.name.replace(/"/g, '""')}"`,
    `"${q.phone.replace(/"/g, '""')}"`,
    `"${q.email.replace(/"/g, '""')}"`,
    `"${q.service.replace(/"/g, '""')}"`,
    `"${q.status}"`,
    `"${q.createdAt}"`,
    `"${(q.brief || "").replace(/"/g, '""')}"`,
    `"${(q.notes || "").replace(/"/g, '""')}"`,
  ]);

  const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `creare-mind-inquiries-${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Fetch all client inquiries from Supabase cloud database
 */
export async function fetchInquiriesFromCloud(): Promise<ClientInquiry[]> {
  try {
    const { data, error } = await supabasePublic
      .from("media")
      .select("url, created_at")
      .eq("resource_type", "client_inquiry")
      .order("created_at", { ascending: false });

    const cloudInquiries: ClientInquiry[] = [];
    const seenInquiryIds = new Set<string>();
    if (!error && Array.isArray(data)) {
      for (const row of data) {
        try {
          if (row.url) {
            const parsed = JSON.parse(row.url) as ClientInquiry & { isDeleted?: boolean };
            if (parsed && parsed.id) {
              const id = String(parsed.id).trim();
              if (seenInquiryIds.has(id)) continue;
              seenInquiryIds.add(id);
              if (parsed.isDeleted || (parsed as any).status === "Deleted") continue;
              if (isFakeInquiry(parsed)) continue;

              cloudInquiries.push({
                id,
                name: String(parsed.name || "Client").trim(),
                phone: String(parsed.phone || "—").trim(),
                email: String(parsed.email || "Not provided").trim(),
                service: String(parsed.service || "General Inquiry").trim(),
                brief: String(parsed.brief || "").trim(),
                status: parsed.status || "New",
                createdAt: String(parsed.createdAt || "Recently"),
                timestamp: Number(parsed.timestamp) || Date.now(),
                notes: parsed.notes ? String(parsed.notes) : undefined,
              });
            }
          }
        } catch {}
      }
    }

    const local = getStoredInquiries();
    const map = new Map<string, ClientInquiry>();
    for (const inq of [...cloudInquiries, ...local]) {
      if (!map.has(inq.id) && !isFakeInquiry(inq)) {
        map.set(inq.id, {
          id: String(inq.id).trim(),
          name: String(inq.name || "Client").trim(),
          phone: String(inq.phone || "—").trim(),
          email: String(inq.email || "Not provided").trim(),
          service: String(inq.service || "General Inquiry").trim(),
          brief: String(inq.brief || "").trim(),
          status: inq.status || "New",
          createdAt: String(inq.createdAt || "Recently"),
          timestamp: Number(inq.timestamp) || Date.now(),
          notes: inq.notes ? String(inq.notes) : undefined,
        });
      }
    }
    const combined = Array.from(map.values()).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    saveInquiriesList(combined);
    return combined;
  } catch (err) {
    console.warn("Could not fetch inquiries from Supabase cloud:", err);
    return getStoredInquiries();
  }
}

/**
 * Update an inquiry in Supabase cloud database (e.g. status change or notes)
 */
export async function updateInquiryInCloud(inquiry: ClientInquiry): Promise<boolean> {
  try {
    const inqKey = `CREARE_INQUIRY_${inquiry.id}`;
    await supabasePublic.from("media").delete().eq("public_id", inqKey);
    const { error } = await supabasePublic.from("media").insert({
      public_id: inqKey,
      resource_type: "client_inquiry",
      url: JSON.stringify(inquiry),
      original_filename: inquiry.name,
    });

    const current = getStoredInquiries();
    const updated = current.map((q) => (q.id === inquiry.id ? inquiry : q));
    saveInquiriesList(updated);

    return !error;
  } catch (err) {
    console.warn("Could not update inquiry in cloud:", err);
    return false;
  }
}

/**
 * Delete an inquiry from Supabase cloud database
 */
export async function deleteInquiryFromCloud(inquiryId: string): Promise<boolean> {
  try {
    const inqKey = `CREARE_INQUIRY_${inquiryId}`;
    // Insert deletion tombstone
    await supabasePublic.from("media").insert({
      public_id: inqKey,
      resource_type: "client_inquiry",
      url: JSON.stringify({ id: inquiryId, isDeleted: true }),
      original_filename: `DELETED_${inquiryId}`,
    });

    const current = getStoredInquiries();
    const updated = current.filter((q) => q.id !== inquiryId);
    saveInquiriesList(updated);

    return true;
  } catch (err) {
    console.warn("Could not delete inquiry from cloud:", err);
    return false;
  }
}
