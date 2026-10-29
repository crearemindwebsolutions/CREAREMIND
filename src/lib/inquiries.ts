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
  const id = String(item.id || "").trim();
  const name = String(item.name || "").trim().toLowerCase();
  const email = String(item.email || "").trim().toLowerCase();

  if (FAKE_SAMPLE_IDS.has(id)) return true;
  if (FAKE_SAMPLE_NAMES.has(name)) return true;
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

  // 1. Persist to Admin storage
  try {
    const currentList = getStoredInquiries();
    const updated = [record, ...currentList.filter((q) => q.id !== record.id)];
    saveInquiriesList(updated);
  } catch (err) {
    console.error("Error persisting inquiry to admin storage:", err);
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
