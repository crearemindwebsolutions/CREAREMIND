import { useState } from "react";
import {
  X,
  Layers,
  CheckCircle2,
  Clock,
  Plus,
  Trash2,
  Calendar,
  Sparkles,
  DollarSign,
  ShieldCheck,
  Building2,
  ArrowRight,
  Check,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  type AdminInvoice,
  type InvoicePaymentPhase,
  type PaymentPhaseStatus,
  getInvoiceProjectName,
  getInvoicePaidAmount,
  saveInvoiceToCloud,
  saveInvoicesList,
  getStoredInvoices,
} from "@/lib/admin-invoices";
import { recordAdminLog } from "@/lib/admin-logs";

interface InvoicePhasesModalProps {
  invoice: AdminInvoice | null;
  isOpen: boolean;
  onClose: () => void;
  onSavePhases: (updatedInvoice: AdminInvoice) => void;
  adminEmail: string;
}

export function InvoicePhasesModal({
  invoice,
  isOpen,
  onClose,
  onSavePhases,
  adminEmail,
}: InvoicePhasesModalProps) {
  if (!isOpen || !invoice) return null;

  const total = invoice.total || 0;
  const projectName = getInvoiceProjectName(invoice);

  const [phases, setPhases] = useState<InvoicePaymentPhase[]>(() => {
    if (invoice.phases && invoice.phases.length > 0) {
      return invoice.phases;
    }
    // Default 3-phase split (40% / 40% / 20%)
    const p1 = Math.round(total * 0.40);
    const p2 = Math.round(total * 0.40);
    const p3 = Math.max(0, total - p1 - p2);
    const today = new Date().toISOString().split("T")[0];

    return [
      {
        id: `phase-1-${Date.now()}`,
        name: "Phase 1: Project Kickoff & UI Prototype (40%)",
        percentage: 40,
        amount: p1,
        dueDate: today,
        status: invoice.status === "Paid" ? "Paid" : "Paid",
      },
      {
        id: `phase-2-${Date.now() + 1}`,
        name: "Phase 2: Core Development & Client Review (40%)",
        percentage: 40,
        amount: p2,
        dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
        status: "Pending",
      },
      {
        id: `phase-3-${Date.now() + 2}`,
        name: "Phase 3: Final QA, Deployment & Handover (20%)",
        percentage: 20,
        amount: p3,
        dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
        status: "Pending",
      },
    ];
  });

  const [isSaving, setIsSaving] = useState(false);

  // Totals calculations
  const totalPhaseAmount = phases.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
  const totalPhasePercentage = phases.reduce((acc, p) => acc + (Number(p.percentage) || 0), 0);
  const paidPhasesAmount = phases
    .filter((p) => p.status === "Paid")
    .reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
  const pendingPhasesAmount = total - paidPhasesAmount;
  const paidCount = phases.filter((p) => p.status === "Paid").length;
  const progressPercent = total > 0 ? Math.min(100, Math.round((paidPhasesAmount / total) * 100)) : 0;

  // Handlers
  const handleUpdatePhase = (id: string, updates: Partial<InvoicePaymentPhase>) => {
    setPhases((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const updated = { ...p, ...updates };

        // If percentage updated, recalculate amount
        if ("percentage" in updates && updates.percentage !== undefined) {
          const pct = Number(updates.percentage) || 0;
          updated.amount = Math.round((pct / 100) * total);
        }
        // If amount updated, recalculate percentage
        if ("amount" in updates && updates.amount !== undefined) {
          const amt = Number(updates.amount) || 0;
          updated.percentage = total > 0 ? parseFloat(((amt / total) * 100).toFixed(1)) : 0;
        }

        return updated;
      })
    );
  };

  const handleToggleStatus = (id: string) => {
    setPhases((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const nextStatus: PaymentPhaseStatus = p.status === "Paid" ? "Pending" : "Paid";
        return {
          ...p,
          status: nextStatus,
          paidAt: nextStatus === "Paid" ? new Date().toISOString().split("T")[0] : undefined,
        };
      })
    );
  };

  const handleAddPhase = () => {
    const assignedPct = phases.reduce((acc, p) => acc + (Number(p.percentage) || 0), 0);
    const remainderPct = Math.max(0, 100 - assignedPct);
    const remainderAmt = Math.max(0, total - totalPhaseAmount);

    const newPhase: InvoicePaymentPhase = {
      id: `phase-${Date.now()}`,
      name: `Phase ${phases.length + 1}: Milestone Deliverable`,
      percentage: remainderPct,
      amount: remainderAmt,
      dueDate: new Date(Date.now() + (phases.length + 1) * 10 * 86400000).toISOString().split("T")[0],
      status: "Pending",
    };

    setPhases((prev) => [...prev, newPhase]);
  };

  const handleRemovePhase = (id: string) => {
    if (phases.length <= 1) return;
    setPhases((prev) => prev.filter((p) => p.id !== id));
  };

  // Quick Preset Helper
  const applyPreset = (shares: Array<{ name: string; pct: number; daysFromNow: number }>) => {
    let allocated = 0;
    const now = Date.now();

    const newPhases = shares.map((s, idx) => {
      const isLast = idx === shares.length - 1;
      const amt = isLast ? (total - allocated) : Math.round((s.pct / 100) * total);
      allocated += amt;

      return {
        id: `phase-${idx + 1}-${Date.now()}`,
        name: s.name,
        percentage: s.pct,
        amount: amt,
        dueDate: new Date(now + s.daysFromNow * 86400000).toISOString().split("T")[0],
        status: idx === 0 ? ("Paid" as PaymentPhaseStatus) : ("Pending" as PaymentPhaseStatus),
      };
    });

    setPhases(newPhases);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const isAllPaid = paidPhasesAmount >= total && phases.length > 0;
      const nextStatus = isAllPaid ? "Paid" : paidPhasesAmount > 0 ? "Partial" : "Pending";

      const updatedInvoice: AdminInvoice = {
        ...invoice,
        isPhaseWise: true,
        phases,
        amountPaid: paidPhasesAmount,
        status: nextStatus,
      };

      // 1. Notify parent
      onSavePhases(updatedInvoice);

      // 2. Persist in localStorage
      const stored = getStoredInvoices();
      const updatedList = stored.map((i) => (i.id === updatedInvoice.id ? updatedInvoice : i));
      saveInvoicesList(updatedList);

      // 3. Save to Cloud
      await saveInvoiceToCloud(updatedInvoice);

      // 4. Record Admin Log
      recordAdminLog(
        adminEmail,
        "Updated Payment Phases",
        "Invoices",
        `Configured ${phases.length} payment phases for ${invoice.invoiceNumber} (${paidCount}/${phases.length} Paid • ₹${paidPhasesAmount.toLocaleString("en-IN")} collected)`
      );

      toast.success(
        `Milestone payment schedule updated! ${paidCount} of ${phases.length} phases paid (₹${paidPhasesAmount.toLocaleString("en-IN")}).`
      );
      onClose();
    } catch (err) {
      console.error("Failed to save payment phases:", err);
      toast.error("Could not save payment phases");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl border border-neutral-200 bg-white text-neutral-900 shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 bg-neutral-900 px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                Phase-Wise / Milestone Payment Schedule
              </h2>
              <p className="text-xs text-neutral-400">
                {invoice.invoiceNumber} • {projectName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 max-h-[76vh] overflow-y-auto">
          {/* Milestone Financial Progress Card */}
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50/80 p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-neutral-400 font-semibold">
                  Total Project Value
                </span>
                <p className="text-2xl font-bold text-neutral-950 font-sans tracking-tight tabular-nums">
                  ₹{total.toLocaleString("en-IN")}
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs font-sans">
                <div>
                  <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Collected</span>
                  <span className="font-bold text-emerald-700 text-sm tabular-nums">
                    ₹{paidPhasesAmount.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="border-l border-neutral-200 pl-4">
                  <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Balance Due</span>
                  <span className="font-bold text-amber-700 text-sm tabular-nums">
                    ₹{pendingPhasesAmount.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="text-neutral-500 font-medium">
                  {paidCount} of {phases.length} Phases Paid ({progressPercent}%)
                </span>
                <span className="text-emerald-700 font-semibold font-sans tabular-nums">
                  30% Company Wallet: +₹{Math.round(paidPhasesAmount * 0.30).toLocaleString("en-IN")} Realized
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-neutral-200 overflow-hidden">
                <div
                  className="h-full bg-emerald-600 transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[11px] font-medium text-neutral-400 mr-1 flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-amber-500" /> Presets:
            </span>
            <button
              type="button"
              onClick={() =>
                applyPreset([
                  { name: "Phase 1: 50% Advance & Kickoff", pct: 50, daysFromNow: 0 },
                  { name: "Phase 2: 50% Final Delivery & Launch", pct: 50, daysFromNow: 21 },
                ])
              }
              className="rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 px-2.5 py-1 text-[11px] font-medium text-neutral-700 transition-colors cursor-pointer shadow-2xs"
            >
              50% Advance / 50% Handover
            </button>
            <button
              type="button"
              onClick={() =>
                applyPreset([
                  { name: "Phase 1: Project Kickoff & UI (40%)", pct: 40, daysFromNow: 0 },
                  { name: "Phase 2: Beta Demo & Testing (40%)", pct: 40, daysFromNow: 14 },
                  { name: "Phase 3: Final Launch & Handover (20%)", pct: 20, daysFromNow: 30 },
                ])
              }
              className="rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 px-2.5 py-1 text-[11px] font-medium text-neutral-700 transition-colors cursor-pointer shadow-2xs"
            >
              40% / 40% / 20% Standard
            </button>
            <button
              type="button"
              onClick={() =>
                applyPreset([
                  { name: "Phase 1: Advance Booking (30%)", pct: 30, daysFromNow: 0 },
                  { name: "Phase 2: Milestone Delivery (40%)", pct: 40, daysFromNow: 15 },
                  { name: "Phase 3: Final Handover (30%)", pct: 30, daysFromNow: 30 },
                ])
              }
              className="rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 px-2.5 py-1 text-[11px] font-medium text-neutral-700 transition-colors cursor-pointer shadow-2xs"
            >
              30% / 40% / 30% Delivery
            </button>
          </div>

          {/* Phase Rows */}
          <div className="space-y-3">
            {phases.map((phase, idx) => {
              const isPaid = phase.status === "Paid";

              return (
                <div
                  key={phase.id}
                  className={`rounded-xl border p-3.5 transition-all space-y-3 ${
                    isPaid
                      ? "border-emerald-200 bg-emerald-50/30"
                      : "border-neutral-200 bg-white hover:border-neutral-300"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-neutral-900 text-white font-bold text-xs font-sans">
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        value={phase.name}
                        onChange={(e) => handleUpdatePhase(phase.id, { name: e.target.value })}
                        placeholder="Phase title e.g. Phase 1: Advance & UI Design"
                        className="flex-1 rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 text-xs text-neutral-900 font-semibold focus:border-neutral-900 focus:outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(phase.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          isPaid
                            ? "bg-emerald-600 text-white shadow-2xs hover:bg-emerald-700"
                            : "bg-amber-100 text-amber-800 hover:bg-amber-200"
                        }`}
                        title="Click to toggle Paid / Pending"
                      >
                        {isPaid ? (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Paid</span>
                          </>
                        ) : (
                          <>
                            <Clock className="h-3.5 w-3.5" />
                            <span>Mark Paid</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRemovePhase(phase.id)}
                        disabled={phases.length <= 1}
                        className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:pointer-events-none"
                        title="Remove Phase"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Financial Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
                    <div>
                      <label className="text-[10px] uppercase font-semibold text-neutral-400 block mb-1">
                        Percentage of Project
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="any"
                          value={phase.percentage}
                          onChange={(e) => handleUpdatePhase(phase.id, { percentage: Number(e.target.value) })}
                          className="w-full rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 text-xs text-neutral-900 font-sans font-bold tabular-nums pr-6 text-right focus:border-neutral-900 focus:outline-none"
                        />
                        <span className="absolute right-2 top-2 text-xs text-neutral-400 pointer-events-none">
                          %
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-semibold text-neutral-400 block mb-1">
                        Phase Amount (₹)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          value={phase.amount}
                          onChange={(e) => handleUpdatePhase(phase.id, { amount: Number(e.target.value) })}
                          className="w-full rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 text-xs text-neutral-900 font-sans font-bold tabular-nums pl-6 focus:border-neutral-900 focus:outline-none"
                        />
                        <span className="absolute left-2.5 top-2 text-xs text-neutral-400 pointer-events-none">
                          ₹
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-semibold text-neutral-400 block mb-1">
                        Target Due Date
                      </label>
                      <input
                        type="date"
                        value={phase.dueDate || ""}
                        onChange={(e) => handleUpdatePhase(phase.id, { dueDate: e.target.value })}
                        className="w-full rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 text-xs text-neutral-900 font-sans focus:border-neutral-900 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add Phase & Validation Status */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={handleAddPhase}
              className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-800 shadow-2xs hover:bg-neutral-50 transition-colors cursor-pointer w-fit"
            >
              <Plus className="h-3.5 w-3.5 text-neutral-500" />
              Add Milestone Phase
            </button>

            <div className="text-xs">
              {Math.abs(totalPhasePercentage - 100) < 0.1 ? (
                <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                  <Check className="h-3.5 w-3.5" />
                  100% Total Allocated Across Phases
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-amber-700 font-semibold bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
                  <AlertCircle className="h-3.5 w-3.5" />
                  Total is {totalPhasePercentage}% (₹{totalPhaseAmount.toLocaleString("en-IN")})
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-neutral-100 bg-neutral-50 px-6 py-4">
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Marking phases as Paid updates invoice status &amp; Company Wallet in real time</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-900 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-neutral-800 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Layers className="h-3.5 w-3.5 text-blue-400" />
              {isSaving ? "Saving Phases..." : "Save Milestone Schedule"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
