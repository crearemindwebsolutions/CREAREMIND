import { supabase } from "@/integrations/supabase/client";

export type ExpenseCategory =
  | "Cloud & Hosting"
  | "Software & Subscriptions"
  | "Hardware & Equipment"
  | "Marketing & Advertising"
  | "Office & Operations"
  | "Travel & Client Meeting"
  | "Team Food & Perks"
  | "Legal, Tax & Compliance"
  | "Miscellaneous";

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "Cloud & Hosting",
  "Software & Subscriptions",
  "Hardware & Equipment",
  "Marketing & Advertising",
  "Office & Operations",
  "Travel & Client Meeting",
  "Team Food & Perks",
  "Legal, Tax & Compliance",
  "Miscellaneous",
];

export interface WalletExpense {
  id: string; // e.g. "EXP-2026-001"
  title: string;
  amount: number;
  category: ExpenseCategory;
  spentBy: string; // e.g. "Ajith", "Gowthaman PR", or admin email
  date: string; // YYYY-MM-DD
  createdAt: number; // Unix timestamp
  invoiceRef?: string; // Optional linked invoice or project
  notes?: string;
  receiptUrl?: string;
  status: "Audited" | "Approved";
}

const STORAGE_KEY = "creare_mind_wallet_expenses";

export function getStoredExpenses(): WalletExpense[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveExpensesList(expenses: WalletExpense[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
  } catch (err) {
    console.error("Failed to save wallet expenses to localStorage:", err);
  }
}

/**
 * Fetch expenses from Supabase cloud database
 */
export async function fetchExpensesFromCloud(): Promise<WalletExpense[]> {
  try {
    const { data, error } = await supabase
      .from("media")
      .select("*")
      .eq("resource_type", "company_expense");

    const cloudExpenses: WalletExpense[] = [];
    const seenIds = new Set<string>();

    if (!error && Array.isArray(data)) {
      for (const row of data) {
        try {
          if (row.url) {
            const parsed = JSON.parse(row.url) as WalletExpense & { isDeleted?: boolean };
            if (parsed && parsed.id) {
              if (seenIds.has(parsed.id)) continue;
              seenIds.add(parsed.id);
              if (parsed.isDeleted) continue;
              cloudExpenses.push(parsed);
            }
          }
        } catch {}
      }
    }

    const local = getStoredExpenses();
    const map = new Map<string, WalletExpense>();
    for (const exp of [...cloudExpenses, ...local]) {
      if (!map.has(exp.id)) {
        map.set(exp.id, exp);
      }
    }

    const combined = Array.from(map.values()).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    saveExpensesList(combined);
    return combined;
  } catch (err) {
    console.warn("Could not fetch wallet expenses from Supabase cloud:", err);
    return getStoredExpenses();
  }
}

/**
 * Save an expense to Supabase cloud database
 */
export async function saveExpenseToCloud(expense: WalletExpense): Promise<boolean> {
  try {
    const expKey = `CREARE_EXPENSE_${expense.id}`;
    await supabase.from("media").delete().eq("public_id", expKey);
    const { error } = await supabase.from("media").insert({
      public_id: expKey,
      resource_type: "company_expense",
      url: JSON.stringify(expense),
      original_filename: expense.title,
    });

    const current = getStoredExpenses();
    const updated = [expense, ...current.filter((e) => e.id !== expense.id)];
    saveExpensesList(updated);

    return !error;
  } catch (err) {
    console.warn("Could not save wallet expense to cloud:", err);
    return false;
  }
}

/**
 * Delete an expense from Supabase cloud database
 */
export async function deleteExpenseFromCloud(expenseId: string): Promise<boolean> {
  try {
    const expKey = `CREARE_EXPENSE_${expenseId}`;
    await supabase.from("media").insert({
      public_id: expKey,
      resource_type: "company_expense",
      url: JSON.stringify({ id: expenseId, isDeleted: true }),
      original_filename: `DELETED_${expenseId}`,
    });

    const current = getStoredExpenses();
    const updated = current.filter((e) => e.id !== expenseId);
    saveExpensesList(updated);

    return true;
  } catch (err) {
    console.warn("Could not delete wallet expense from cloud:", err);
    return false;
  }
}

/**
 * Total expenses recorded
 */
export function getTotalExpensesAmount(expenses: WalletExpense[]): number {
  return expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
}
