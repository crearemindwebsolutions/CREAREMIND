import { useState, useEffect } from "react";
import {
  X,
  PieChart,
  Building2,
  Users,
  Plus,
  Trash2,
  Check,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Wallet,
  Receipt,
  HelpCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  type AdminInvoice,
  type InvoiceMemberSplit,
  type InvoiceSplitData,
  getInvoiceProjectName,
  saveInvoiceToCloud,
  saveInvoicesList,
  getStoredInvoices,
} from "@/lib/admin-invoices";
import { recordAdminLog } from "@/lib/admin-logs";

interface InvoiceSplitModalProps {
  invoice: AdminInvoice | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveSplit: (updatedInvoice: AdminInvoice) => void;
  adminEmail: string;
}

const COMMON_PARTNERS = [
  "Gowthaman PR",
  "Ajith",
  "Dheepan Raj",
  "Lead Developer",
  "UI/UX Designer",
];

export function InvoiceSplitModal({
  invoice,
  isOpen,
  onClose,
  onSaveSplit,
  adminEmail,
}: InvoiceSplitModalProps) {
  if (!isOpen || !invoice) return null;

  const total = invoice.total || 0;
  const companyPercentage = 30;
  const teamPercentage = 70;
  const companyAmount = Math.round(total * 0.30);
  const teamAmount = total - companyAmount;

  const [projectName, setProjectName] = useState(() => getInvoiceProjectName(invoice));
  const [members, setMembers] = useState<InvoiceMemberSplit[]>(() => {
    if (invoice.split?.members && invoice.split.members.length > 0) {
      return invoice.split.members;
    }
    // Default: two founders / partners 50/50 split of the 70% pool
    return [
      {
        id: "mem-1",
        name: "Gowthaman PR",
        percentageOfTeam: 50,
        percentageOfTotal: 35,
        amount: Math.round(teamAmount * 0.50),
      },
      {
        id: "mem-2",
        name: "Ajith",
        percentageOfTeam: 50,
        percentageOfTotal: 35,
        amount: teamAmount - Math.round(teamAmount * 0.50),
      },
    ];
  });
  const [splitNotes, setSplitNotes] = useState(() => invoice.split?.notes || "");
  const [isSaving, setIsSaving] = useState(false);

  // Recalculate member amounts whenever teamAmount or member percentages change
  const handleUpdatePercentage = (id: string, newPercentStr: string) => {
    const val = parseFloat(newPercentStr) || 0;
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        const pctOfTotal = (val * 0.70);
        const amt = Math.round((val / 100) * teamAmount);
        return {
          ...m,
          percentageOfTeam: val,
          percentageOfTotal: parseFloat(pctOfTotal.toFixed(1)),
          amount: amt,
        };
      })
    );
  };

  const handleUpdateName = (id: string, name: string) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, name } : m))
    );
  };

  const handleRemoveMember = (id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const handleAddMember = () => {
    const assignedSum = members.reduce((acc, m) => acc + (Number(m.percentageOfTeam) || 0), 0);
    const remainder = Math.max(0, 100 - assignedSum);
    const newId = `mem-${Date.now()}`;
    const newMem: InvoiceMemberSplit = {
      id: newId,
      name: "",
      percentageOfTeam: remainder,
      percentageOfTotal: parseFloat((remainder * 0.70).toFixed(1)),
      amount: Math.round((remainder / 100) * teamAmount),
    };
    setMembers((prev) => [...prev, newMem]);
  };

  // Quick Preset Handlers
  const applyEqualSplit = (count: number, names: string[]) => {
    const each = parseFloat((100 / count).toFixed(2));
    const newMembers: InvoiceMemberSplit[] = [];
    let allocatedAmt = 0;

    for (let i = 0; i < count; i++) {
      const isLast = i === count - 1;
      const pct = isLast ? parseFloat((100 - each * (count - 1)).toFixed(2)) : each;
      const amt = isLast ? (teamAmount - allocatedAmt) : Math.round((pct / 100) * teamAmount);
      allocatedAmt += amt;

      newMembers.push({
        id: `mem-${i + 1}-${Date.now()}`,
        name: names[i] || `Partner ${i + 1}`,
        percentageOfTeam: pct,
        percentageOfTotal: parseFloat((pct * 0.70).toFixed(1)),
        amount: amt,
      });
    }
    setMembers(newMembers);
  };

  const totalAssignedTeamPct = members.reduce((acc, m) => acc + (Number(m.percentageOfTeam) || 0), 0);
  const totalAssignedInvoicePct = parseFloat((totalAssignedTeamPct * 0.70).toFixed(1));
  const isTeamExact100 = Math.abs(totalAssignedTeamPct - 100) < 0.05;
  const isTeamOver = totalAssignedTeamPct > 100.05;
  const remainingTeamPct = parseFloat((100 - totalAssignedTeamPct).toFixed(1));

  const handleSave = async () => {
    if (!projectName.trim()) {
      toast.error("Please enter a valid project name");
      return;
    }
    if (members.length === 0) {
      toast.error("Please add at least one partner/team member for the 70% split");
      return;
    }
    if (isTeamOver) {
      toast.error(`Allocations total ${totalAssignedTeamPct}%. Must not exceed 100% of the team pool.`);
      return;
    }

    setIsSaving(true);
    try {
      const splitPayload: InvoiceSplitData = {
        projectName: projectName.trim(),
        companyPercentage: 30,
        companyAmount,
        teamPercentage: 70,
        teamAmount,
        members: members.map((m) => ({
          ...m,
          name: m.name.trim() || "Partner",
          percentageOfTeam: Number(m.percentageOfTeam) || 0,
          percentageOfTotal: parseFloat(((Number(m.percentageOfTeam) || 0) * 0.70).toFixed(2)),
          amount: Math.round(((Number(m.percentageOfTeam) || 0) / 100) * teamAmount),
        })),
        notes: splitNotes.trim(),
        updatedAt: new Date().toISOString(),
      };

      const updatedInvoice: AdminInvoice = {
        ...invoice,
        split: splitPayload,
      };

      // 1. Update parent state
      onSaveSplit(updatedInvoice);

      // 2. Persist to localStorage
      const stored = getStoredInvoices();
      const updatedList = stored.map((inv) => (inv.id === updatedInvoice.id ? updatedInvoice : inv));
      saveInvoicesList(updatedList);

      // 3. Sync to Supabase Cloud
      await saveInvoiceToCloud(updatedInvoice);

      // 4. Log Admin Action
      recordAdminLog(
        adminEmail,
        "Configured Revenue Split",
        "Company Wallet",
        `Split 30% (₹${companyAmount.toLocaleString("en-IN")}) to Company Wallet & 70% (₹${teamAmount.toLocaleString("en-IN")}) across ${members.length} partners for project "${projectName.trim()}"`
      );

      toast.success(
        `Revenue split saved! ₹${companyAmount.toLocaleString("en-IN")} credited to Company Wallet under "${projectName.trim()}".`
      );
      onClose();
    } catch (err) {
      console.error("Failed to save revenue split:", err);
      toast.error("Could not save revenue split. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl border border-neutral-200 bg-white text-neutral-900 shadow-2xl overflow-hidden my-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 bg-neutral-900 px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <PieChart className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                Revenue Split &amp; Company Wallet Allocation
              </h2>
              <p className="text-xs text-neutral-400">
                Invoice {invoice.invoiceNumber} • 30% Company Reserve &amp; 70% Partner Distribution
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

        {/* Modal Content */}
        <div className="p-6 space-y-5 max-h-[78vh] overflow-y-auto">
          {/* Invoice Summary Card */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-xl border border-neutral-200 bg-neutral-50/80 p-3.5">
            <div>
              <p className="text-[10px] uppercase font-mono tracking-wider text-neutral-400 font-semibold">
                Invoice Reference
              </p>
              <p className="text-xs font-bold text-neutral-900 mt-0.5">{invoice.invoiceNumber}</p>
              <p className="text-[11px] text-neutral-500">
                {invoice.clientName} {invoice.clientCompany ? `(${invoice.clientCompany})` : ""}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-mono tracking-wider text-neutral-400 font-semibold">
                Total Invoice Gross
              </p>
              <p className="text-sm font-extrabold text-neutral-950 mt-0.5 font-mono">
                ₹{total.toLocaleString("en-IN")}
              </p>
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold mt-1 ${
                invoice.status === "Paid"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-amber-100 text-amber-800"
              }`}>
                ● {invoice.status}
              </span>
            </div>
            <div>
              <label className="text-[10px] uppercase font-mono tracking-wider text-neutral-400 font-semibold block">
                Project Name in Wallet *
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g. Royal Fashion E-Commerce"
                className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-2.5 py-1 text-xs text-neutral-900 font-medium focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </div>
          </div>

          {/* Section 1: Company Wallet Share (30% - Locked & Highlighted) */}
          <div className="rounded-xl border-2 border-emerald-500/40 bg-gradient-to-br from-emerald-50/70 via-white to-emerald-50/30 p-4 relative overflow-hidden shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-950">
                      🏢 Creare Mind Company Wallet
                    </h3>
                    <span className="rounded-full bg-emerald-600 text-white px-2 py-0.5 text-[10px] font-bold font-mono">
                      30% Automatic
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-800 mt-0.5">
                    Transferred directly to company treasury ledger under project:{" "}
                    <span className="font-semibold text-emerald-950 underline decoration-emerald-300">
                      {projectName || "Creare Mind Project"}
                    </span>
                  </p>
                </div>
              </div>

              <div className="text-right sm:pl-4 sm:border-l sm:border-emerald-200">
                <p className="text-[10px] uppercase font-mono tracking-wider text-emerald-700 font-semibold">
                  Company Share (30%)
                </p>
                <p className="text-lg font-black text-emerald-950 font-mono tracking-tight">
                  +₹{companyAmount.toLocaleString("en-IN")}
                </p>
                <p className="text-[10px] text-emerald-600 font-medium">Automatic Company Cut</p>
              </div>
            </div>
          </div>

          {/* Section 2: Partner / Team Share (70% - Custom Percentage Split) */}
          <div className="rounded-xl border border-neutral-200 bg-white p-4 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                  <Users className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
                    👥 Team &amp; Partner Distribution
                    <span className="rounded-full bg-blue-100 text-blue-800 px-2 py-0.2 text-[10px] font-bold font-mono">
                      70% Pool
                    </span>
                  </h3>
                  <p className="text-[11px] text-neutral-500">
                    Assign partner names and their percentage share of the 70% pool.
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-mono text-neutral-500 uppercase">Available Pool: </span>
                <span className="text-xs font-bold text-neutral-900 font-mono">
                  ₹{teamAmount.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-[11px] font-medium text-neutral-400 mr-1 flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-amber-500" /> Presets:
              </span>
              <button
                type="button"
                onClick={() => applyEqualSplit(2, ["Gowthaman PR", "Ajith"])}
                className="rounded-lg border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 px-2.5 py-1 text-[11px] font-medium text-neutral-700 transition-colors cursor-pointer"
              >
                50/50 Gowthaman &amp; Ajith
              </button>
              <button
                type="button"
                onClick={() => applyEqualSplit(3, ["Gowthaman PR", "Ajith", "Dheepan Raj"])}
                className="rounded-lg border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 px-2.5 py-1 text-[11px] font-medium text-neutral-700 transition-colors cursor-pointer"
              >
                3-Way Equal (33.3% each)
              </button>
              <button
                type="button"
                onClick={() => applyEqualSplit(1, ["Gowthaman PR"])}
                className="rounded-lg border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 px-2.5 py-1 text-[11px] font-medium text-neutral-700 transition-colors cursor-pointer"
              >
                Single Lead (100%)
              </button>
            </div>

            {/* Member Rows */}
            <div className="space-y-2.5">
              {members.map((member, idx) => (
                <div
                  key={member.id}
                  className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50/50 p-2.5 transition-all hover:bg-neutral-50"
                >
                  <div className="flex-1 min-w-[140px]">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[10px] font-mono text-neutral-400 font-bold">#{idx + 1}</span>
                      <label className="text-[10px] font-medium text-neutral-600">Partner / Member Name</label>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        value={member.name}
                        onChange={(e) => handleUpdateName(member.id, e.target.value)}
                        placeholder="e.g. Gowthaman PR"
                        list={`partners-list-${member.id}`}
                        className="w-full rounded-lg border border-neutral-300 bg-white px-2.5 py-1.5 text-xs text-neutral-900 font-medium focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                      />
                      <datalist id={`partners-list-${member.id}`}>
                        {COMMON_PARTNERS.map((p) => (
                          <option key={p} value={p} />
                        ))}
                      </datalist>
                    </div>
                  </div>

                  <div className="w-full sm:w-28">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] font-medium text-neutral-600">Share of 70%</label>
                      <span className="text-[10px] font-mono text-neutral-400">%</span>
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="any"
                        value={member.percentageOfTeam}
                        onChange={(e) => handleUpdatePercentage(member.id, e.target.value)}
                        className="w-full rounded-lg border border-neutral-300 bg-white px-2.5 py-1.5 text-xs text-neutral-900 font-mono font-bold focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 text-right pr-6"
                      />
                      <span className="absolute right-2 top-2 text-xs font-mono text-neutral-400 pointer-events-none">
                        %
                      </span>
                    </div>
                  </div>

                  <div className="w-full sm:w-32 bg-white rounded-lg border border-neutral-200/80 p-1.5 text-right flex sm:flex-col justify-between items-center sm:items-end">
                    <span className="text-[9px] font-mono text-neutral-400 uppercase">
                      {member.percentageOfTotal}% of total
                    </span>
                    <span className="text-xs font-bold text-neutral-900 font-mono">
                      ₹{member.amount.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveMember(member.id)}
                    disabled={members.length <= 1}
                    className="self-center p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:pointer-events-none"
                    title="Remove partner"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Member Button & Allocation Status */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={handleAddMember}
                className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-800 shadow-2xs hover:bg-neutral-50 transition-colors cursor-pointer w-fit"
              >
                <Plus className="h-3.5 w-3.5 text-neutral-500" />
                Add Team Member
              </button>

              <div className="flex items-center gap-2">
                {isTeamExact100 ? (
                  <div className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                    <Check className="h-3.5 w-3.5" />
                    <span>100% of Team Pool Allocated ({totalAssignedInvoicePct}% of Invoice)</span>
                  </div>
                ) : isTeamOver ? (
                  <div className="inline-flex items-center gap-1.5 text-xs font-medium text-red-700 bg-red-50 border border-red-200 px-2.5 py-1 rounded-lg">
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span>Total {totalAssignedTeamPct}%. Exceeds 100% pool!</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span>{remainingTeamPct}% unassigned (₹{Math.round((remainingTeamPct / 100) * teamAmount).toLocaleString("en-IN")})</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Optional Split Notes */}
          <div>
            <label className="text-[11px] font-medium text-neutral-500 block mb-1">
              Internal Payout Notes / Milestone Memo (Optional)
            </label>
            <input
              type="text"
              value={splitNotes}
              onChange={(e) => setSplitNotes(e.target.value)}
              placeholder="e.g. Sprint 1 delivery payout, settled via UPI / IMPS"
              className="w-full rounded-lg border border-neutral-200 bg-neutral-50/50 px-3 py-1.5 text-xs text-neutral-800 focus:bg-white focus:border-neutral-900 focus:outline-none"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-neutral-100 bg-neutral-50 px-6 py-4">
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>30% directly booked to Creare Mind Company Wallet</span>
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
              disabled={isSaving || isTeamOver}
              className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-900 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-neutral-800 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Wallet className="h-3.5 w-3.5 text-emerald-400" />
              {isSaving ? "Saving Split..." : "Save Split & Update Wallet"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
