import { useState } from "react";
import {
  DollarSign,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Printer,
  Share2,
  Edit3,
  Trash2,
  X,
  Check,
  FileText,
  AlertCircle,
  Copy,
  ExternalLink,
  Receipt,
  RefreshCw,
  PieChart,
  Layers,
  Sparkles,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import {
  type AdminInvoice,
  type InvoiceItem,
  type InvoiceStatus,
  type InvoiceType,
  type InvoicePaymentPhase,
  saveInvoicesList,
  fetchInvoicesFromCloud,
  buildDefaultInvoiceSplit,
  buildDefaultPhases,
  getInvoicePaidAmount,
} from "@/lib/admin-invoices";
import { recordAdminLog } from "@/lib/admin-logs";
import { buildWhatsAppLink } from "@/lib/admin-comms";
import { InvoiceSplitModal } from "./InvoiceSplitModal";
import { InvoicePhasesModal } from "./InvoicePhasesModal";

interface AdminInvoicesViewProps {
  invoices: AdminInvoice[];
  onInvoicesChange: (updated: AdminInvoice[]) => void;
  adminEmail: string;
}

export function AdminInvoicesView({
  invoices,
  onInvoicesChange,
  adminEmail,
}: AdminInvoicesViewProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState<AdminInvoice | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<AdminInvoice | null>(null);
  const [splitInvoice, setSplitInvoice] = useState<AdminInvoice | null>(null);
  const [phasesModalInvoice, setPhasesModalInvoice] = useState<AdminInvoice | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Form states
  const [formType, setFormType] = useState<InvoiceType>("Tax Invoice");
  const [formNumber, setFormNumber] = useState("");
  const [formClientName, setFormClientName] = useState("");
  const [formClientCompany, setFormClientCompany] = useState("");
  const [formClientEmail, setFormClientEmail] = useState("");
  const [formClientPhone, setFormClientPhone] = useState("");
  const [formClientGst, setFormClientGst] = useState("");
  const [formIssueDate, setFormIssueDate] = useState(new Date().toISOString().split("T")[0]);
  const [formDueDate, setFormDueDate] = useState("2026-12-05");
  const [formStatus, setFormStatus] = useState<InvoiceStatus>("Pending");
  const [formGstPercent, setFormGstPercent] = useState(18);
  const [formNotes, setFormNotes] = useState("Thank you for choosing Creare Mind. 100% bug-free warranty included.");
  const [formItems, setFormItems] = useState<InvoiceItem[]>([
    { id: "1", description: "Custom Software Engineering / Web Platform", quantity: 1, rate: 45000, amount: 45000 },
  ]);
  const [formIsPhaseWise, setFormIsPhaseWise] = useState(false);
  const [formPhases, setFormPhases] = useState<InvoicePaymentPhase[]>([]);

  // Aggregate metrics
  const totalBilled = invoices.reduce((acc, inv) => acc + (inv.total || 0), 0);
  const totalCollected = invoices.reduce((acc, inv) => acc + (inv.amountPaid || 0), 0);
  const totalDue = totalBilled - totalCollected;

  const filteredInvoices = invoices.filter((inv) => {
    if (!inv) return false;
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      String(inv.invoiceNumber || "").toLowerCase().includes(q) ||
      String(inv.clientName || "").toLowerCase().includes(q) ||
      String(inv.clientCompany || "").toLowerCase().includes(q);
    const matchesStatus = statusFilter === "All" || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const openNewModal = () => {
    setEditingInvoice(null);
    const randNum = Math.floor(100 + Math.random() * 900);
    setFormType("Tax Invoice");
    setFormNumber(`CM/2026/${randNum}`);
    setFormClientName("");
    setFormClientCompany("");
    setFormClientEmail("");
    setFormClientPhone("");
    setFormClientGst("");
    setFormIssueDate(new Date().toISOString().split("T")[0]);
    setFormDueDate("2026-12-05");
    setFormStatus("Pending");
    setFormGstPercent(18);
    setFormNotes("Thank you for partnering with Creare Mind.");
    setFormItems([
      { id: "1", description: "Web Platform Development & API Setup", quantity: 1, rate: 50000, amount: 50000 },
    ]);
    setFormIsPhaseWise(true);
    setFormPhases(buildDefaultPhases(59000));
    setIsModalOpen(true);
  };

  const openEditModal = (inv: AdminInvoice) => {
    setEditingInvoice(inv);
    setFormType(inv.type);
    setFormNumber(inv.invoiceNumber);
    setFormClientName(inv.clientName);
    setFormClientCompany(inv.clientCompany || "");
    setFormClientEmail(inv.clientEmail);
    setFormClientPhone(inv.clientPhone);
    setFormClientGst(inv.clientGst || "");
    setFormIssueDate(inv.issueDate);
    setFormDueDate(inv.dueDate);
    setFormStatus(inv.status);
    setFormGstPercent(inv.gstPercent);
    setFormNotes(inv.notes || "");
    setFormItems(inv.items);
    setFormIsPhaseWise(!!inv.isPhaseWise);
    setFormPhases(
      inv.phases && inv.phases.length > 0 ? inv.phases : buildDefaultPhases(inv.total || 50000)
    );
    setIsModalOpen(true);
  };

  const handleAddItem = () => {
    setFormItems([
      ...formItems,
      {
        id: `item-${Date.now()}`,
        description: "Additional Milestone / Deliverable",
        quantity: 1,
        rate: 10000,
        amount: 10000,
      },
    ]);
  };

  const handleUpdateItem = (id: string, field: "description" | "quantity" | "rate", val: any) => {
    setFormItems(
      formItems.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: val };
        if (field === "quantity" || field === "rate") {
          updated.amount = Number(updated.quantity) * Number(updated.rate);
        }
        return updated;
      })
    );
  };

  const handleRemoveItem = (id: string) => {
    if (formItems.length <= 1) return;
    setFormItems(formItems.filter((i) => i.id !== id));
  };

  const handleSaveInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formClientName.trim() || !formNumber.trim()) {
      toast.error("Please provide client name and invoice number");
      return;
    }

    const subtotal = formItems.reduce((acc, i) => acc + (i.amount || 0), 0);
    const gstAmount = Math.round((subtotal * formGstPercent) / 100);
    const total = subtotal + gstAmount;

    // Phase-wise calculations
    const phasePaidSum = formIsPhaseWise && formPhases.length > 0
      ? formPhases.filter((p) => p.status === "Paid").reduce((acc, p) => acc + (p.amount || 0), 0)
      : (formStatus === "Paid" ? total : 0);
    const effectiveAmountPaid = formIsPhaseWise ? phasePaidSum : (formStatus === "Paid" ? total : 0);
    const effectiveStatus: InvoiceStatus = formIsPhaseWise
      ? (phasePaidSum >= total && formPhases.length > 0 ? "Paid" : phasePaidSum > 0 ? "Partial" : "Pending")
      : formStatus;

    if (editingInvoice) {
      const updated = invoices.map((inv) => {
        if (inv.id !== editingInvoice.id) return inv;
        const companyAmount = Math.round(total * 0.30);
        const teamAmount = total - companyAmount;
        const updatedSplit = inv.split
          ? {
              ...inv.split,
              projectName: formClientCompany || formClientName || inv.split.projectName || "Project",
              companyPercentage: 30,
              companyAmount,
              teamPercentage: 70,
              teamAmount,
              members: (inv.split.members || []).map((m) => ({
                ...m,
                amount: Math.round(((m.percentageOfTeam || 0) / 100) * teamAmount),
              })),
              updatedAt: new Date().toISOString(),
            }
          : buildDefaultInvoiceSplit(total, formClientCompany, formClientName, formItems[0]?.description);

        return {
          ...inv,
          type: formType,
          invoiceNumber: formNumber,
          clientName: formClientName,
          clientCompany: formClientCompany,
          clientEmail: formClientEmail,
          clientPhone: formClientPhone,
          clientGst: formClientGst,
          issueDate: formIssueDate || inv.issueDate,
          dueDate: formDueDate || inv.dueDate,
          status: effectiveStatus,
          items: formItems,
          subtotal,
          gstPercent: formGstPercent,
          gstAmount,
          total,
          amountPaid: effectiveAmountPaid,
          notes: formNotes,
          split: updatedSplit,
          isPhaseWise: formIsPhaseWise,
          phases: formIsPhaseWise ? formPhases : inv.phases,
        };
      });
      onInvoicesChange(updated);
      saveInvoicesList(updated);
      recordAdminLog(adminEmail, "Updated Invoice", "Invoices", `Updated ${formNumber} for ${formClientName}`);
      toast.success("Invoice updated successfully");
    } else {
      const initialSplit = buildDefaultInvoiceSplit(total, formClientCompany, formClientName, formItems[0]?.description);
      const newInv: AdminInvoice = {
        id: `CM-INV-2026-${Math.floor(100 + Math.random() * 900)}`,
        type: formType,
        invoiceNumber: formNumber,
        clientName: formClientName,
        clientCompany: formClientCompany,
        clientEmail: formClientEmail,
        clientPhone: formClientPhone,
        clientGst: formClientGst,
        issueDate: formIssueDate || new Date().toISOString().split("T")[0]!,
        dueDate: formDueDate || new Date().toISOString().split("T")[0]!,
        status: effectiveStatus,
        items: formItems,
        subtotal,
        gstPercent: formGstPercent,
        gstAmount,
        total,
        amountPaid: effectiveAmountPaid,
        currency: "INR",
        notes: formNotes,
        upiId: "8072719603@upi",
        createdAt: Date.now(),
        split: initialSplit,
        isPhaseWise: formIsPhaseWise,
        phases: formIsPhaseWise ? formPhases : undefined,
      };
      const updated = [newInv, ...invoices];
      onInvoicesChange(updated);
      saveInvoicesList(updated);
      recordAdminLog(
        adminEmail,
        "Generated Invoice",
        "Invoices",
        `Generated ${newInv.invoiceNumber} (₹${total.toLocaleString("en-IN")}) • 30% Company Wallet share = ₹${initialSplit.companyAmount.toLocaleString("en-IN")}`
      );
      toast.success(
        `Invoice generated! 30% (₹${initialSplit.companyAmount.toLocaleString("en-IN")}) automatically credited to Company Wallet.`
      );
    }

    setIsModalOpen(false);
  };

  const handleDeleteInvoice = (id: string, num: string) => {
    if (!confirm(`Delete invoice ${num}?`)) return;
    const updated = invoices.filter((i) => i.id !== id);
    onInvoicesChange(updated);
    saveInvoicesList(updated);
    recordAdminLog(adminEmail, "Deleted Invoice", "Invoices", `Deleted invoice ${num}`);
    toast.success("Invoice removed");
  };

  const handleWhatsAppInvoice = (inv: AdminInvoice) => {
    const text = `Hello ${inv.clientName}, your Creare Mind invoice ${inv.invoiceNumber} for ₹${inv.total.toLocaleString("en-IN")} is ready. You can complete settlement via UPI: 8072719603@upi or bank transfer. Contact: +91 80727 19603.`;
    const url = buildWhatsAppLink(inv.clientPhone, text);
    window.open(url, "_blank");
  };

  return (
    <div className="space-y-6 text-neutral-900">
      {/* Top Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-neutral-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-medium text-emerald-800">
              <Receipt className="h-3 w-3 text-emerald-600" />
              Financial &amp; Billing Desk
            </span>
            <span className="text-xs text-neutral-400 font-mono">
              UPI 8072719603@upi Active
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
            Quotations &amp; GST Invoices
          </h1>
          <p className="mt-1 text-xs text-neutral-500">
            Generate printable GST tax invoices, formal quotations, and dispatch payment receipts.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={async () => {
              setIsRefreshing(true);
              try {
                const cloud = await fetchInvoicesFromCloud();
                onInvoicesChange(cloud);
                toast.success(`Invoices refreshed (${cloud.length} total)`);
              } finally {
                setIsRefreshing(false);
              }
            }}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 px-3 py-2 text-xs font-semibold text-neutral-700 shadow-xs transition-colors cursor-pointer disabled:opacity-60"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-neutral-500 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={openNewModal}
            className="inline-flex items-center gap-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            Create Invoice / Quote
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-xs">
          <span className="text-[10px] font-mono font-semibold text-neutral-400 uppercase">Total Invoiced</span>
          <div className="mt-1 text-2xl font-bold text-neutral-900">
            ₹{totalBilled.toLocaleString("en-IN")}
          </div>
          <p className="mt-0.5 text-xs text-neutral-500">{invoices.length} invoices generated</p>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-xs">
          <span className="text-[10px] font-mono font-semibold text-neutral-400 uppercase">Total Collected</span>
          <div className="mt-1 text-2xl font-bold text-emerald-700">
            ₹{totalCollected.toLocaleString("en-IN")}
          </div>
          <p className="mt-0.5 text-xs text-emerald-600 font-medium">Settled via UPI / Bank</p>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-xs">
          <span className="text-[10px] font-mono font-semibold text-neutral-400 uppercase">Pending Balance</span>
          <div className="mt-1 text-2xl font-bold text-amber-600">
            ₹{totalDue.toLocaleString("en-IN")}
          </div>
          <p className="mt-0.5 text-xs text-neutral-500">Awaiting milestone completion</p>
        </div>
      </div>

      {/* Filter / Search Strip */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
          <input
            type="text"
            placeholder="Search invoice number, client name, or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-neutral-200 bg-white pl-9 pr-4 py-2 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {["All", "Paid", "Pending", "Partial", "Draft"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`rounded-xl px-3 py-1 text-xs font-semibold transition-colors cursor-pointer border ${
                statusFilter === st
                  ? "bg-neutral-900 text-white border-neutral-900"
                  : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices Table or Clean Empty State */}
      {invoices.length === 0 ? (
        <div className="rounded-2xl border border-neutral-200 bg-white p-12 text-center shadow-xs space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200">
            <Receipt className="h-7 w-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-neutral-900">No Quotations or Invoices Created Yet</h3>
            <p className="mt-1 text-xs text-neutral-500 max-w-md mx-auto leading-relaxed">
              Generate official GST tax invoices, formal quotations, and printable payment receipts for your clients with automatic 18% GST calculation and UPI settlement info.
            </p>
          </div>
          <button
            onClick={openNewModal}
            className="inline-flex items-center gap-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 px-4 py-2.5 text-xs font-semibold text-white shadow-xs cursor-pointer transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Create First Invoice / Quote
          </button>
        </div>
      ) : (
        <div className="rounded-2xl border border-neutral-200 bg-white overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-neutral-200 bg-neutral-50 font-semibold text-neutral-500 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">Document #</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Issue Date</th>
                  <th className="px-4 py-3">Total Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="px-4 py-3.5 font-sans font-semibold text-neutral-900">
                      {inv.invoiceNumber}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-neutral-900">{inv.clientName}</div>
                      {inv.clientCompany && (
                        <div className="text-[11px] text-neutral-500">{inv.clientCompany}</div>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="rounded-md bg-neutral-100 px-2 py-0.5 text-[11px] font-semibold text-neutral-700">
                        {inv.type}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-neutral-500 font-sans">
                      {inv.issueDate}
                    </td>
                    <td className="px-4 py-3.5 font-sans font-bold text-neutral-900 tabular-nums">
                      ₹{inv.total.toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-col items-start gap-1">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            inv.status === "Paid"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : inv.status === "Pending"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-blue-50 text-blue-700 border border-blue-200"
                          }`}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                          {inv.status}
                        </span>
                        {inv.isPhaseWise && inv.phases && inv.phases.length > 0 && (
                          <span className="text-[10px] text-blue-700 font-sans font-medium flex items-center gap-1">
                            <Layers className="h-2.5 w-2.5 text-blue-500" />
                            {inv.phases.filter((p) => p.status === "Paid").length}/{inv.phases.length} Phases Paid
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setPreviewInvoice(inv)}
                          className="rounded-md p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
                          title="Preview & Print Invoice"
                        >
                          <Printer className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setSplitInvoice(inv)}
                          className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold transition-all cursor-pointer ${
                            inv.split?.members && inv.split.members.length > 0
                              ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                              : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 border border-neutral-300/80"
                          }`}
                          title="Revenue Split (30% Company / 70% Team)"
                        >
                          <PieChart className="h-3 w-3 text-emerald-600" />
                          <span>Split</span>
                          {inv.split?.members && inv.split.members.length > 0 ? (
                            <span className="rounded-full bg-emerald-200/80 px-1 text-[9px] font-sans font-bold text-emerald-900">
                              {inv.split.members.length}
                            </span>
                          ) : null}
                        </button>
                        <button
                          onClick={() => setPhasesModalInvoice(inv)}
                          className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold transition-all cursor-pointer ${
                            inv.isPhaseWise && inv.phases && inv.phases.length > 0
                              ? "bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
                              : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 border border-neutral-300/80"
                          }`}
                          title="Manage Phase-Wise / Milestone Payments"
                        >
                          <Layers className="h-3 w-3 text-blue-600" />
                          <span>Phases</span>
                          {inv.isPhaseWise && inv.phases && inv.phases.length > 0 ? (
                            <span className="rounded-full bg-blue-200/80 px-1 text-[9px] font-sans font-bold text-blue-900">
                              {inv.phases.filter((p) => p.status === "Paid").length}/{inv.phases.length}
                            </span>
                          ) : null}
                        </button>
                        <button
                          onClick={() => handleWhatsAppInvoice(inv)}
                          className="rounded-md p-1.5 text-emerald-600 hover:bg-emerald-50"
                          title="Send via WhatsApp"
                        >
                          <Share2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => openEditModal(inv)}
                          className="rounded-md p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
                          title="Edit Invoice"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteInvoice(inv.id, inv.invoiceNumber)}
                          className="rounded-md p-1.5 text-neutral-400 hover:bg-red-50 hover:text-red-600"
                          title="Delete Invoice"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PRINTABLE / PREVIEW INVOICE MODAL */}
      {previewInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl border border-neutral-200 bg-white text-neutral-900 p-8 shadow-2xl max-h-[92vh] overflow-y-auto">
            {/* Modal Controls */}
            <div className="no-print flex items-center justify-between pb-4 border-b border-neutral-100 mb-6">
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                Invoice Document Preview
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-900 text-white px-3 py-1.5 text-xs font-semibold shadow-xs hover:bg-neutral-800 cursor-pointer"
                >
                  <Printer className="h-3.5 w-3.5" />
                  Print / Save PDF
                </button>
                <button
                  onClick={() => setPreviewInvoice(null)}
                  className="rounded-lg p-1.5 text-neutral-400 hover:text-neutral-900"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Invoice Printable Document */}
            <div className="space-y-6 text-xs text-neutral-900">
              {/* Header */}
              <div className="flex justify-between items-start border-b border-neutral-200 pb-6">
                <div>
                  <h2 className="text-xl font-black tracking-tight text-neutral-950 font-sans">
                    CREARE MIND
                  </h2>
                  <p className="text-[11px] text-neutral-500 mt-1">Software &amp; Digital Solutions Studio</p>
                  <p className="text-[11px] text-neutral-500">Website: https://crearemind.in</p>
                  <p className="text-[11px] text-neutral-500">Phone: +91 80727 19603</p>
                  <p className="text-[11px] text-neutral-500">Email: crearemindwebsolutions@gmail.com</p>
                </div>

                <div className="text-right">
                  <span className="inline-block rounded-md bg-neutral-100 px-3 py-1 font-bold text-neutral-900 uppercase tracking-wider text-xs">
                    {previewInvoice.type}
                  </span>
                  <p className="mt-2 font-mono font-bold text-neutral-900 text-sm">
                    {previewInvoice.invoiceNumber}
                  </p>
                  <p className="text-[11px] text-neutral-500 mt-1">Date: {previewInvoice.issueDate}</p>
                  <p className="text-[11px] text-neutral-500">Due: {previewInvoice.dueDate}</p>
                </div>
              </div>

              {/* Bill To */}
              <div className="border-b border-neutral-200 pb-6">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                  Billed To:
                </span>
                <p className="text-sm font-bold text-neutral-900">{previewInvoice.clientName}</p>
                {previewInvoice.clientCompany && (
                  <p className="text-xs text-neutral-600 font-medium">{previewInvoice.clientCompany}</p>
                )}
                <p className="text-xs text-neutral-500">Phone: {previewInvoice.clientPhone}</p>
                {previewInvoice.clientEmail && (
                  <p className="text-xs text-neutral-500">Email: {previewInvoice.clientEmail}</p>
                )}
                {previewInvoice.clientGst && (
                  <p className="text-xs font-mono font-medium text-neutral-700">GST: {previewInvoice.clientGst}</p>
                )}
              </div>

              {/* Items Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="border-b border-neutral-200 bg-neutral-50 text-[10px] font-bold uppercase text-neutral-500">
                    <tr>
                      <th className="py-2.5 px-3">Description</th>
                      <th className="py-2.5 px-3 text-center">Qty</th>
                      <th className="py-2.5 px-3 text-right">Rate</th>
                      <th className="py-2.5 px-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {previewInvoice.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-3 px-3 font-semibold text-neutral-900">{item.description}</td>
                        <td className="py-3 px-3 text-center font-sans tabular-nums">{item.quantity}</td>
                        <td className="py-3 px-3 text-right font-sans tabular-nums">₹{item.rate.toLocaleString("en-IN")}</td>
                        <td className="py-3 px-3 text-right font-sans font-bold text-neutral-900 tabular-nums">
                          ₹{item.amount.toLocaleString("en-IN")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals Summary */}
              <div className="flex justify-end pt-2">
                <div className="w-72 space-y-2 text-xs">
                  <div className="flex justify-between text-neutral-600">
                    <span>Subtotal:</span>
                    <span className="font-sans font-semibold tabular-nums">₹{previewInvoice.subtotal.toLocaleString("en-IN")}</span>
                  </div>
                  {previewInvoice.gstPercent > 0 && (
                    <div className="flex justify-between text-neutral-600">
                      <span>GST ({previewInvoice.gstPercent}%):</span>
                      <span className="font-sans font-semibold tabular-nums">₹{previewInvoice.gstAmount.toLocaleString("en-IN")}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-black text-neutral-950 border-t border-neutral-200 pt-2">
                    <span>Total Project Value:</span>
                    <span className="font-sans tabular-nums">₹{previewInvoice.total.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>

              {/* Milestone / Phase-Wise Payment Schedule */}
              {previewInvoice.isPhaseWise && previewInvoice.phases && previewInvoice.phases.length > 0 && (
                <div className="rounded-xl border border-neutral-200 overflow-hidden space-y-0">
                  <div className="bg-neutral-50 px-3.5 py-2.5 border-b border-neutral-200 flex justify-between items-center">
                    <span className="font-bold text-neutral-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <Layers className="h-3.5 w-3.5 text-blue-600" />
                      Milestone / Phase-Wise Payment Schedule
                    </span>
                    <span className="text-[11px] text-neutral-600 font-semibold font-sans">
                      {previewInvoice.phases.filter(p => p.status === "Paid").length} of {previewInvoice.phases.length} Phases Paid
                    </span>
                  </div>
                  <table className="w-full text-left text-xs">
                    <thead className="bg-neutral-100/60 border-b border-neutral-200 text-[10px] uppercase text-neutral-500 font-bold">
                      <tr>
                        <th className="py-2 px-3">#</th>
                        <th className="py-2 px-3">Milestone Deliverable / Phase</th>
                        <th className="py-2 px-3">Target Date</th>
                        <th className="py-2 px-3 text-right">Share (%)</th>
                        <th className="py-2 px-3 text-right">Phase Amount</th>
                        <th className="py-2 px-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {previewInvoice.phases.map((phase, idx) => (
                        <tr key={phase.id} className={phase.status === "Paid" ? "bg-emerald-50/30" : ""}>
                          <td className="py-2 px-3 font-bold text-neutral-400 font-sans">{idx + 1}</td>
                          <td className="py-2 px-3 font-semibold text-neutral-900">{phase.name}</td>
                          <td className="py-2 px-3 text-neutral-500 text-[11px] font-sans">{phase.dueDate || "On Milestone"}</td>
                          <td className="py-2 px-3 text-right text-neutral-600 font-sans tabular-nums">{phase.percentage}%</td>
                          <td className="py-2 px-3 text-right font-bold text-neutral-950 font-sans tabular-nums">
                            ₹{phase.amount.toLocaleString("en-IN")}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              phase.status === "Paid"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-800"
                            }`}>
                              {phase.status === "Paid" ? "✓ PAID" : "PENDING"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="bg-neutral-50 px-3.5 py-2.5 border-t border-neutral-200 flex justify-between items-center text-xs">
                    <span className="text-neutral-600">
                      Amount Paid to Date: <strong className="text-emerald-700 font-sans font-bold tabular-nums">₹{getInvoicePaidAmount(previewInvoice).toLocaleString("en-IN")}</strong>
                    </span>
                    <span className="text-neutral-600">
                      Outstanding Balance: <strong className="text-amber-700 font-sans font-bold tabular-nums">₹{Math.max(0, previewInvoice.total - getInvoicePaidAmount(previewInvoice)).toLocaleString("en-IN")}</strong>
                    </span>
                  </div>
                </div>
              )}

              {/* Settlement Instructions */}
              <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 space-y-1 text-[11px] text-neutral-600">
                <p className="font-bold text-neutral-900">Payment &amp; Transfer Details:</p>
                <p>Instant UPI ID: <strong className="font-mono text-neutral-900">8072719603@upi</strong></p>
                <p>Support / Verification Desk: <strong className="text-neutral-900">+91 80727 19603</strong></p>
                <p className="text-[10px] text-neutral-400 pt-1">
                  * All deliverable code, domain ownership, and software credentials transfer upon full settlement.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT INVOICE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
              <h3 className="text-base font-bold text-neutral-900">
                {editingInvoice ? `Edit Invoice: ${editingInvoice.invoiceNumber}` : "Create Quotation or Tax Invoice"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-neutral-400 hover:text-neutral-900"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveInvoice} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-neutral-800 block mb-1">Document Type</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as any)}
                    className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-900"
                  >
                    <option value="Tax Invoice">Tax Invoice</option>
                    <option value="Formal Quotation">Formal Quotation</option>
                    <option value="Proforma Invoice">Proforma Invoice</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-neutral-800 block mb-1">Invoice Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="CM/2026/099"
                    value={formNumber}
                    onChange={(e) => setFormNumber(e.target.value)}
                    className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-mono text-neutral-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-neutral-800 block mb-1">Client Contact Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Anand Sharma"
                    value={formClientName}
                    onChange={(e) => setFormClientName(e.target.value)}
                    className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-neutral-800 block mb-1">Company / Store Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Royal Textiles Pvt Ltd"
                    value={formClientCompany}
                    onChange={(e) => setFormClientCompany(e.target.value)}
                    className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-neutral-800 block mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+91 98401 23456"
                    value={formClientPhone}
                    onChange={(e) => setFormClientPhone(e.target.value)}
                    className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-neutral-800 block mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="billing@client.com"
                    value={formClientEmail}
                    onChange={(e) => setFormClientEmail(e.target.value)}
                    className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-neutral-800 block mb-1">GST Number (Optional)</label>
                  <input
                    type="text"
                    placeholder="33AAAAA0000A1Z5"
                    value={formClientGst}
                    onChange={(e) => setFormClientGst(e.target.value)}
                    className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-mono text-neutral-900"
                  />
                </div>
              </div>

              {/* Items Builder */}
              <div className="border border-neutral-200 rounded-xl p-3 bg-neutral-50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-neutral-900">Line Items</span>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="inline-flex items-center gap-1 rounded-md bg-neutral-900 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-neutral-800 cursor-pointer"
                  >
                    <Plus className="h-3 w-3" /> Add Item
                  </button>
                </div>

                {formItems.map((item, idx) => (
                  <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-6">
                      <input
                        type="text"
                        placeholder="Deliverable description"
                        value={item.description}
                        onChange={(e) => handleUpdateItem(item.id, "description", e.target.value)}
                        className="w-full rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 text-xs text-neutral-900"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        min="1"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => handleUpdateItem(item.id, "quantity", Number(e.target.value))}
                        className="w-full rounded-lg border border-neutral-200 bg-white px-2 py-1.5 text-xs text-center font-mono text-neutral-900"
                      />
                    </div>
                    <div className="col-span-3">
                      <input
                        type="number"
                        placeholder="Rate ₹"
                        value={item.rate}
                        onChange={(e) => handleUpdateItem(item.id, "rate", Number(e.target.value))}
                        className="w-full rounded-lg border border-neutral-200 bg-white px-2 py-1.5 text-xs text-right font-mono text-neutral-900"
                      />
                    </div>
                    <div className="col-span-1 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-1 rounded-md text-neutral-400 hover:text-red-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-neutral-800 block mb-1">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-900"
                  >
                    <option value="Pending">Pending Payment</option>
                    <option value="Paid">Paid in Full</option>
                    <option value="Partial">Partially Paid</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-neutral-800 block mb-1">GST Rate</label>
                  <select
                    value={formGstPercent}
                    onChange={(e) => setFormGstPercent(Number(e.target.value))}
                    className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-900"
                  >
                    <option value={18}>18% GST (Standard)</option>
                    <option value={0}>0% (Exempt / SEZ / Export)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-neutral-800 block mb-1">Due Date</label>
                  <input
                    type="date"
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-900"
                  />
                </div>
              </div>

              {/* Milestone & Phase-Wise Payments Toggle & Builder */}
              <div className="rounded-xl border border-neutral-200 bg-neutral-50/70 p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="phase-wise-toggle"
                      checked={formIsPhaseWise}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setFormIsPhaseWise(checked);
                        if (checked && formPhases.length === 0) {
                          const currentSubtotal = formItems.reduce((acc, i) => acc + (i.amount || 0), 0);
                          const currentTotal = currentSubtotal + Math.round((currentSubtotal * formGstPercent) / 100);
                          setFormPhases(buildDefaultPhases(currentTotal || 50000));
                        }
                      }}
                      className="h-4 w-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <label htmlFor="phase-wise-toggle" className="font-bold text-neutral-900 cursor-pointer flex items-center gap-1.5">
                      <Layers className="h-4 w-4 text-blue-600" />
                      <span>Phase-Wise / Milestone Payment Schedule</span>
                    </label>
                  </div>
                  {formIsPhaseWise && (
                    <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full font-sans">
                      {formPhases.filter(p => p.status === "Paid").length} of {formPhases.length} Phases Paid
                    </span>
                  )}
                </div>

                {formIsPhaseWise && (
                  <div className="space-y-3 pt-1">
                    <p className="text-[11px] text-neutral-500">
                      Split this project invoice into milestone payments (e.g. 40% Advance, 40% Beta Demo, 20% Final Launch).
                    </p>

                    {/* Quick Presets */}
                    <div className="flex flex-wrap items-center gap-1.5 text-xs">
                      <span className="text-[10px] font-semibold text-neutral-400 uppercase">Presets:</span>
                      <button
                        type="button"
                        onClick={() => {
                          const subtotalVal = formItems.reduce((acc, i) => acc + (i.amount || 0), 0);
                          const totalVal = subtotalVal + Math.round((subtotalVal * formGstPercent) / 100);
                          const p1 = Math.round(totalVal * 0.5);
                          const p2 = totalVal - p1;
                          setFormPhases([
                            { id: `phase-1-${Date.now()}`, name: "Phase 1: 50% Advance & Kickoff", percentage: 50, amount: p1, dueDate: formIssueDate, status: "Paid" },
                            { id: `phase-2-${Date.now() + 1}`, name: "Phase 2: 50% Final Delivery & Handover", percentage: 50, amount: p2, dueDate: formDueDate, status: "Pending" },
                          ]);
                        }}
                        className="rounded-lg border border-neutral-200 bg-white hover:bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-700 cursor-pointer shadow-2xs"
                      >
                        50% / 50% Split
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const subtotalVal = formItems.reduce((acc, i) => acc + (i.amount || 0), 0);
                          const totalVal = subtotalVal + Math.round((subtotalVal * formGstPercent) / 100);
                          const p1 = Math.round(totalVal * 0.4);
                          const p2 = Math.round(totalVal * 0.4);
                          const p3 = Math.max(0, totalVal - p1 - p2);
                          setFormPhases([
                            { id: `phase-1-${Date.now()}`, name: "Phase 1: Project Kickoff & UI (40%)", percentage: 40, amount: p1, dueDate: formIssueDate, status: "Paid" },
                            { id: `phase-2-${Date.now() + 1}`, name: "Phase 2: Beta Demo & Testing (40%)", percentage: 40, amount: p2, dueDate: formDueDate, status: "Pending" },
                            { id: `phase-3-${Date.now() + 2}`, name: "Phase 3: Final Launch & Handover (20%)", percentage: 20, amount: p3, dueDate: formDueDate, status: "Pending" },
                          ]);
                        }}
                        className="rounded-lg border border-neutral-200 bg-white hover:bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-700 cursor-pointer shadow-2xs"
                      >
                        40% / 40% / 20% Standard
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const subtotalVal = formItems.reduce((acc, i) => acc + (i.amount || 0), 0);
                          const totalVal = subtotalVal + Math.round((subtotalVal * formGstPercent) / 100);
                          const p1 = Math.round(totalVal * 0.3);
                          const p2 = Math.round(totalVal * 0.4);
                          const p3 = Math.max(0, totalVal - p1 - p2);
                          setFormPhases([
                            { id: `phase-1-${Date.now()}`, name: "Phase 1: Advance Booking (30%)", percentage: 30, amount: p1, dueDate: formIssueDate, status: "Paid" },
                            { id: `phase-2-${Date.now() + 1}`, name: "Phase 2: Core Milestone (40%)", percentage: 40, amount: p2, dueDate: formDueDate, status: "Pending" },
                            { id: `phase-3-${Date.now() + 2}`, name: "Phase 3: Handover & Deployment (30%)", percentage: 30, amount: p3, dueDate: formDueDate, status: "Pending" },
                          ]);
                        }}
                        className="rounded-lg border border-neutral-200 bg-white hover:bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-700 cursor-pointer shadow-2xs"
                      >
                        30% / 40% / 30% Milestone
                      </button>
                    </div>

                    {/* Phase Items List */}
                    <div className="space-y-2">
                      {formPhases.map((phase, pIdx) => {
                        const subtotalVal = formItems.reduce((acc, i) => acc + (i.amount || 0), 0);
                        const totalVal = subtotalVal + Math.round((subtotalVal * formGstPercent) / 100);

                        return (
                          <div key={phase.id} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 rounded-lg border border-neutral-200 bg-white p-2">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-neutral-900 text-white font-bold text-[10px] font-sans">
                              {pIdx + 1}
                            </span>
                            <input
                              type="text"
                              value={phase.name}
                              onChange={(e) => {
                                const val = e.target.value;
                                setFormPhases(prev => prev.map(p => p.id === phase.id ? { ...p, name: val } : p));
                              }}
                              placeholder="Milestone title"
                              className="flex-1 rounded-md border border-neutral-200 bg-white px-2 py-1 text-xs text-neutral-900 font-medium"
                            />
                            <div className="w-20">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={phase.percentage}
                                onChange={(e) => {
                                  const pct = Number(e.target.value) || 0;
                                  const amt = Math.round((pct / 100) * totalVal);
                                  setFormPhases(prev => prev.map(p => p.id === phase.id ? { ...p, percentage: pct, amount: amt } : p));
                                }}
                                className="w-full rounded-md border border-neutral-200 bg-white px-2 py-1 text-xs text-right font-sans tabular-nums"
                                placeholder="%"
                              />
                            </div>
                            <div className="w-28">
                              <input
                                type="number"
                                value={phase.amount}
                                onChange={(e) => {
                                  const amt = Number(e.target.value) || 0;
                                  const pct = totalVal > 0 ? parseFloat(((amt / totalVal) * 100).toFixed(1)) : 0;
                                  setFormPhases(prev => prev.map(p => p.id === phase.id ? { ...p, amount: amt, percentage: pct } : p));
                                }}
                                className="w-full rounded-md border border-neutral-200 bg-white px-2 py-1 text-xs text-right font-sans font-bold tabular-nums"
                                placeholder="₹"
                              />
                            </div>
                            <div className="w-24">
                              <button
                                type="button"
                                onClick={() => {
                                  const nextStatus = phase.status === "Paid" ? "Pending" : "Paid";
                                  setFormPhases(prev => prev.map(p => p.id === phase.id ? { ...p, status: nextStatus } : p));
                                }}
                                className={`w-full py-1 text-[10px] font-bold rounded-md transition-colors cursor-pointer ${
                                  phase.status === "Paid"
                                    ? "bg-emerald-600 text-white"
                                    : "bg-amber-100 text-amber-800 hover:bg-amber-200"
                                }`}
                              >
                                {phase.status === "Paid" ? "✓ Paid" : "Pending"}
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                if (formPhases.length <= 1) return;
                                setFormPhases(prev => prev.filter(p => p.id !== phase.id));
                              }}
                              className="p-1 text-neutral-400 hover:text-red-600 rounded-md"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const subtotalVal = formItems.reduce((acc, i) => acc + (i.amount || 0), 0);
                        const totalVal = subtotalVal + Math.round((subtotalVal * formGstPercent) / 100);
                        const sumPct = formPhases.reduce((acc, p) => acc + (Number(p.percentage) || 0), 0);
                        const remPct = Math.max(0, 100 - sumPct);
                        const remAmt = Math.max(0, totalVal - formPhases.reduce((acc, p) => acc + (Number(p.amount) || 0), 0));
                        setFormPhases([
                          ...formPhases,
                          {
                            id: `phase-${Date.now()}`,
                            name: `Phase ${formPhases.length + 1}: Final Deliverable`,
                            percentage: remPct,
                            amount: remAmt,
                            dueDate: formDueDate,
                            status: "Pending",
                          },
                        ]);
                      }}
                      className="inline-flex items-center gap-1 rounded-md border border-neutral-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-neutral-700 hover:bg-neutral-50 cursor-pointer shadow-2xs"
                    >
                      <Plus className="h-3 w-3" /> Add Phase
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 px-4 py-2 font-semibold text-neutral-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-neutral-900 hover:bg-neutral-800 px-5 py-2 font-semibold text-white"
                >
                  {editingInvoice ? "Save Changes" : "Generate Invoice"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INVOICE SPLIT MODAL (30% COMPANY / 70% PARTNERS) */}
      {splitInvoice && (
        <InvoiceSplitModal
          invoice={splitInvoice}
          isOpen={true}
          onClose={() => setSplitInvoice(null)}
          onSaveSplit={(updated) => {
            const next = invoices.map((i) => (i.id === updated.id ? updated : i));
            onInvoicesChange(next);
            setSplitInvoice(null);
          }}
          adminEmail={adminEmail}
        />
      )}

      {/* INVOICE PAYMENT PHASES MODAL */}
      {phasesModalInvoice && (
        <InvoicePhasesModal
          invoice={phasesModalInvoice}
          isOpen={true}
          onClose={() => setPhasesModalInvoice(null)}
          onSavePhases={(updated) => {
            const next = invoices.map((i) => (i.id === updated.id ? updated : i));
            onInvoicesChange(next);
            setPhasesModalInvoice(null);
          }}
          adminEmail={adminEmail}
        />
      )}
    </div>
  );
}
