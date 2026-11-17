export interface AdminLogEntry {
  id: string;
  adminEmail: string;
  action: string;
  category: "Inquiries" | "Projects" | "Invoices" | "Content" | "Users" | "SEO" | "System";
  details: string;
  timestamp: number;
}

const STORAGE_KEY = "creare_admin_audit_logs";

export function getAdminLogs(): AdminLogEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Filter out dummy/sample logs
        return parsed.filter(
          (log) =>
            log &&
            log.action !== "System Initialization" &&
            log.action !== "SEO Tags Deployed"
        );
      }
    }
  } catch (e) {
    console.warn("Failed to load admin logs:", e);
  }
  return [];
}

export function recordAdminLog(
  adminEmail: string,
  action: string,
  category: AdminLogEntry["category"],
  details: string
): void {
  if (typeof window === "undefined") return;
  try {
    const current = getAdminLogs();
    const newEntry: AdminLogEntry = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      adminEmail: adminEmail || "admin@crearemind.in",
      action,
      category,
      details,
      timestamp: Date.now(),
    };
    const updated = [newEntry, ...current].slice(0, 100); // Keep latest 100
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to record admin log:", e);
  }
}
