import { supabase } from "@/integrations/supabase/client";

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export type InvoiceStatus = "Paid" | "Pending" | "Partial" | "Overdue" | "Draft";
export type InvoiceType = "Tax Invoice" | "Formal Quotation" | "Proforma Invoice";

export interface InvoiceMemberSplit {
  id: string;
  name: string;
  percentageOfTeam: number; // e.g. 50 (of the 70% pool)
  percentageOfTotal: number; // e.g. 35 (of total invoice)
  amount: number; // calculated INR
}

export interface InvoiceSplitData {
  projectName: string;
  companyPercentage: number; // 30
  companyAmount: number; // 30% of total
  teamPercentage: number; // 70
  teamAmount: number; // 70% of total
  members: InvoiceMemberSplit[];
  notes?: string;
  updatedAt?: string;
}

export interface AdminInvoice {
  id: string; // e.g. "CM-INV-2026-081"
  type: InvoiceType;
  invoiceNumber: string;
  clientName: string;
  clientCompany?: string;
  clientEmail: string;
  clientPhone: string;
  clientGst?: string;
  issueDate: string; // YYYY-MM-DD
  dueDate: string;
  status: InvoiceStatus;
  items: InvoiceItem[];
  subtotal: number;
  gstPercent: number; // 18 or 0
  gstAmount: number;
  total: number;
  amountPaid: number;
  currency: "INR" | "USD" | "EUR";
  notes?: string;
  paymentBankDetails?: string;
  upiId?: string;
  createdAt: number;
  split?: InvoiceSplitData;
}

export function getInvoiceCompanyShare(invoice: AdminInvoice): number {
  if (invoice.split && typeof invoice.split.companyAmount === "number") {
    return invoice.split.companyAmount;
  }
  return Math.round((invoice.total || 0) * 0.30);
}

export function getInvoiceTeamShare(invoice: AdminInvoice): number {
  if (invoice.split && typeof invoice.split.teamAmount === "number") {
    return invoice.split.teamAmount;
  }
  return Math.round((invoice.total || 0) * 0.70);
}

export function getInvoiceProjectName(invoice: AdminInvoice): string {
  if (invoice.split?.projectName && invoice.split.projectName.trim()) {
    return invoice.split.projectName.trim();
  }
  if (invoice.clientCompany && invoice.clientCompany.trim()) {
    return invoice.clientCompany.trim();
  }
  if (invoice.clientName && invoice.clientName.trim()) {
    return invoice.clientName.trim();
  }
  if (invoice.items && invoice.items[0]?.description?.trim()) {
    return invoice.items[0].description.trim();
  }
  return "Creare Mind Project";
}

export function buildDefaultInvoiceSplit(
  total: number,
  clientCompany?: string,
  clientName?: string,
  itemDesc?: string
): InvoiceSplitData {
  const companyAmount = Math.round(total * 0.30);
  const teamAmount = total - companyAmount;
  const projectName =
    (clientCompany && clientCompany.trim()) ||
    (clientName && clientName.trim()) ||
    (itemDesc && itemDesc.trim()) ||
    "Creare Mind Project";

  return {
    projectName,
    companyPercentage: 30,
    companyAmount,
    teamPercentage: 70,
    teamAmount,
    members: [],
    updatedAt: new Date().toISOString(),
  };
}

const STORAGE_KEY = "creare_admin_invoices";

const FAKE_INVOICE_IDS = new Set(["CM-INV-2026-001", "CM-INV-2026-002"]);

export function isFakeInvoice(item: any): boolean {
  if (!item) return true;
  const id = String(item.id || "").trim();
  const num = String(item.invoiceNumber || "").trim();
  const client = String(item.clientName || "").toLowerCase();
  if (FAKE_INVOICE_IDS.has(id)) return true;
  if (num === "CM/2026/089" || num === "CM/QT-2026/042") return true;
  if (client.includes("royal textiles") || client.includes("aura haute")) return true;
  return false;
}

export function getStoredInvoices(): AdminInvoice[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Strip out any fake/sample items from previous versions
        const genuine = parsed.filter((inv) => !isFakeInvoice(inv));
        if (genuine.length !== parsed.length) {
          saveInvoicesList(genuine);
        }
        return genuine;
      }
    }
  } catch (e) {
    console.warn("Failed to load admin invoices from localStorage:", e);
  }
  return [];
}

export function saveInvoicesList(invoices: AdminInvoice[]): void {
  if (typeof window === "undefined") return;
  try {
    const realOnly = invoices.filter((inv) => !isFakeInvoice(inv));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(realOnly));
    window.dispatchEvent(new CustomEvent("creare_invoices_updated", { detail: realOnly }));
  } catch (e) {
    console.error("Failed to save admin invoices to localStorage:", e);
  }
}

/**
 * Synchronize full invoices collection to cloud
 */
export async function syncAllInvoicesToCloud(invoices: AdminInvoice[]): Promise<void> {
  try {
    for (const inv of invoices) {
      await saveInvoiceToCloud(inv);
    }
  } catch (e) {
    console.warn("Failed to sync invoices to cloud:", e);
  }
}

/**
 * Fetch all invoices from Supabase cloud database
 */
export async function fetchInvoicesFromCloud(): Promise<AdminInvoice[]> {
  try {
    const { data, error } = await supabase
      .from("media")
      .select("url, created_at")
      .eq("resource_type", "admin_invoice")
      .order("created_at", { ascending: false });

    const cloudInvoices: AdminInvoice[] = [];
    const seenIds = new Set<string>();
    if (!error && Array.isArray(data)) {
      for (const row of data) {
        try {
          if (row.url) {
            const parsed = JSON.parse(row.url) as AdminInvoice & { isDeleted?: boolean };
            if (parsed && parsed.id) {
              if (seenIds.has(parsed.id)) continue;
              seenIds.add(parsed.id);
              if (parsed.isDeleted) continue;
              if (!isFakeInvoice(parsed)) {
                cloudInvoices.push(parsed);
              }
            }
          }
        } catch {}
      }
    }

    const local = getStoredInvoices();
    const map = new Map<string, AdminInvoice>();
    for (const inv of [...cloudInvoices, ...local]) {
      if (!map.has(inv.id)) {
        map.set(inv.id, inv);
      }
    }
    const combined = Array.from(map.values()).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    saveInvoicesList(combined);
    return combined;
  } catch (err) {
    console.warn("Could not fetch invoices from Supabase cloud:", err);
    return getStoredInvoices();
  }
}

/**
 * Save an invoice to Supabase cloud database
 */
export async function saveInvoiceToCloud(invoice: AdminInvoice): Promise<boolean> {
  try {
    const invKey = `CREARE_INVOICE_${invoice.id}`;
    await supabase.from("media").delete().eq("public_id", invKey);
    const { error } = await supabase.from("media").insert({
      public_id: invKey,
      resource_type: "admin_invoice",
      url: JSON.stringify(invoice),
      original_filename: invoice.invoiceNumber,
    });

    const current = getStoredInvoices();
    const updated = [invoice, ...current.filter((i) => i.id !== invoice.id)];
    saveInvoicesList(updated);

    return !error;
  } catch (err) {
    console.warn("Could not save invoice to cloud:", err);
    return false;
  }
}

/**
 * Delete an invoice from Supabase cloud database
 */
export async function deleteInvoiceFromCloud(invoiceId: string): Promise<boolean> {
  try {
    const invKey = `CREARE_INVOICE_${invoiceId}`;
    // Insert deletion tombstone
    await supabase.from("media").insert({
      public_id: invKey,
      resource_type: "admin_invoice",
      url: JSON.stringify({ id: invoiceId, isDeleted: true }),
      original_filename: `DELETED_${invoiceId}`,
    });

    const current = getStoredInvoices();
    const updated = current.filter((i) => i.id !== invoiceId);
    saveInvoicesList(updated);

    return true;
  } catch (err) {
    console.warn("Could not delete invoice from cloud:", err);
    return false;
  }
}
