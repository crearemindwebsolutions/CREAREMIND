import { useState, useMemo } from "react";
import {
  Wallet,
  Building2,
  Users,
  DollarSign,
  TrendingUp,
  Receipt,
  PieChart,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Sparkles,
  RefreshCw,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import {
  type AdminInvoice,
  getInvoiceCompanyShare,
  getInvoiceTeamShare,
  getInvoiceProjectName,
  fetchInvoicesFromCloud,
} from "@/lib/admin-invoices";
import { InvoiceSplitModal } from "./InvoiceSplitModal";

interface AdminWalletViewProps {
  invoices: AdminInvoice[];
  onInvoicesChange: (updated: AdminInvoice[]) => void;
  adminEmail: string;
  onNavigateTab: (tabId: string) => void;
}

export function AdminWalletView({
  invoices,
  onInvoicesChange,
  adminEmail,
  onNavigateTab,
}: AdminWalletViewProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [activeSubTab, setActiveSubTab] = useState<"projects" | "partners">("projects");
  const [selectedInvoiceForSplit, setSelectedInvoiceForSplit] = useState<AdminInvoice | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Calculations
  const totalInvoicedGross = invoices.reduce((acc, inv) => acc + (inv.total || 0), 0);
  const totalCompanyShareGross = invoices.reduce((acc, inv) => acc + getInvoiceCompanyShare(inv), 0);
  const totalTeamShareGross = invoices.reduce((acc, inv) => acc + getInvoiceTeamShare(inv), 0);

  // Realized vs Pending
  const paidInvoices = invoices.filter((i) => i.status === "Paid");
  const realizedCompanyShare = paidInvoices.reduce((acc, inv) => acc + getInvoiceCompanyShare(inv), 0);
  const realizedTeamShare = paidInvoices.reduce((acc, inv) => acc + getInvoiceTeamShare(inv), 0);
  const pendingCompanyShare = totalCompanyShareGross - realizedCompanyShare;

  // Filtered invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      if (!inv) return false;
      const q = search.toLowerCase().trim();
      const projName = getInvoiceProjectName(inv).toLowerCase();
      const clientName = (inv.clientName || "").toLowerCase();
      const clientCompany = (inv.clientCompany || "").toLowerCase();
      const invNum = (inv.invoiceNumber || "").toLowerCase();
      const memberNames = (inv.split?.members || []).map((m) => m.name.toLowerCase()).join(" ");

      const matchesSearch =
        !q ||
        projName.includes(q) ||
        clientName.includes(q) ||
        clientCompany.includes(q) ||
        invNum.includes(q) ||
        memberNames.includes(q);

      const matchesStatus = statusFilter === "All" || inv.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [invoices, search, statusFilter]);

  // Aggregated Partner Payouts across all invoices
  const partnerBreakdown = useMemo(() => {
    const map = new Map<
      string,
      {
        name: string;
        totalAmount: number;
        paidAmount: number;
        pendingAmount: number;
        projectCount: number;
        projects: string[];
      }
    >();

    invoices.forEach((inv) => {
      const projName = getInvoiceProjectName(inv);
      const isPaid = inv.status === "Paid";
      const totalTeam = getInvoiceTeamShare(inv);

      if (inv.split?.members && inv.split.members.length > 0) {
        inv.split.members.forEach((m) => {
          const name = m.name.trim() || "Unassigned Partner";
          const current = map.get(name) || {
            name,
            totalAmount: 0,
            paidAmount: 0,
            pendingAmount: 0,
            projectCount: 0,
            projects: [],
          };
          current.totalAmount += m.amount || 0;
          if (isPaid) {
            current.paidAmount += m.amount || 0;
          } else {
            current.pendingAmount += m.amount || 0;
          }
          if (!current.projects.includes(projName)) {
            current.projects.push(projName);
            current.projectCount += 1;
          }
          map.set(name, current);
        });
      } else {
        // Fallback default: Team 70% unassigned to specific member
        const defaultName = "Team Reserve (70%)";
        const current = map.get(defaultName) || {
          name: defaultName,
          totalAmount: 0,
          paidAmount: 0,
          pendingAmount: 0,
          projectCount: 0,
          projects: [],
        };
        current.totalAmount += totalTeam;
        if (isPaid) {
          current.paidAmount += totalTeam;
        } else {
          current.pendingAmount += totalTeam;
        }
        if (!current.projects.includes(projName)) {
          current.projects.push(projName);
          current.projectCount += 1;
        }
        map.set(defaultName, current);
      }
    });

    return Array.from(map.values()).sort((a, b) => b.totalAmount - a.totalAmount);
  }, [invoices]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const cloud = await fetchInvoicesFromCloud();
      onInvoicesChange(cloud);
      toast.success("Wallet & revenue ledger refreshed from cloud");
    } catch {
      toast.error("Could not sync latest ledger");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSaveSplit = (updated: AdminInvoice) => {
    const nextList = invoices.map((inv) => (inv.id === updated.id ? updated : inv));
    onInvoicesChange(nextList);
  };

  return (
    <div className="space-y-6">
      {/* Wallet Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-neutral-950 flex items-center gap-2">
                Company Wallet &amp; Revenue Ledger
                <span className="rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-0.5 text-[11px] font-mono font-bold">
                  30% Corporate Reserve
                </span>
              </h1>
              <p className="text-xs text-neutral-500 mt-0.5">
                30% of all generated invoice revenue is automatically credited to the Creare Mind Company Wallet, while the remaining 70% is distributed to designated partners.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-xs font-semibold text-neutral-700 shadow-2xs hover:bg-neutral-50 transition-colors cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh Ledger
          </button>
          <button
            onClick={() => onNavigateTab("invoices")}
            className="inline-flex items-center gap-1.5 rounded-xl bg-neutral-900 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <Receipt className="h-3.5 w-3.5" />
            View Invoices
          </button>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Company Share Card */}
        <div className="rounded-2xl border-2 border-emerald-500/40 bg-gradient-to-br from-emerald-50/80 via-white to-emerald-50/20 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-800 font-bold">
              Company Wallet (30%)
            </span>
            <div className="rounded-xl bg-emerald-600 text-white p-2 shadow-xs">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-emerald-950 font-mono tracking-tight">
              ₹{totalCompanyShareGross.toLocaleString("en-IN")}
            </p>
            <p className="text-[11px] text-emerald-700 mt-1 font-medium flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              Auto-credited from {invoices.length} invoices
            </p>
          </div>
        </div>

        {/* Realized Company Inflow */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 font-bold">
              Settled / Realized Inflow
            </span>
            <div className="rounded-xl bg-blue-50 text-blue-600 p-2 border border-blue-100">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-neutral-900 font-mono tracking-tight">
              ₹{realizedCompanyShare.toLocaleString("en-IN")}
            </p>
            <p className="text-[11px] text-neutral-500 mt-1">
              From {paidInvoices.length} fully settled invoices
            </p>
          </div>
        </div>

        {/* Partner / Team Distributions */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 font-bold">
              Partner Distributions (70%)
            </span>
            <div className="rounded-xl bg-purple-50 text-purple-600 p-2 border border-purple-100">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-neutral-900 font-mono tracking-tight">
              ₹{totalTeamShareGross.toLocaleString("en-IN")}
            </p>
            <p className="text-[11px] text-neutral-500 mt-1">
              Allocated across {partnerBreakdown.length} team members
            </p>
          </div>
        </div>

        {/* Total Invoiced Volume */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 font-bold">
              Total Invoiced Billing
            </span>
            <div className="rounded-xl bg-amber-50 text-amber-600 p-2 border border-amber-100">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-neutral-900 font-mono tracking-tight">
              ₹{totalInvoicedGross.toLocaleString("en-IN")}
            </p>
            <p className="text-[11px] text-neutral-500 mt-1">
              ₹{pendingCompanyShare.toLocaleString("en-IN")} company share pending
            </p>
          </div>
        </div>
      </div>

      {/* Main Ledger Section */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs space-y-5">
        {/* Sub-tab navigation and search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveSubTab("projects")}
              className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
                activeSubTab === "projects"
                  ? "bg-neutral-900 text-white shadow-xs"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900"
              }`}
            >
              🏢 Project Revenue Ledger ({invoices.length})
            </button>
            <button
              onClick={() => setActiveSubTab("partners")}
              className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
                activeSubTab === "partners"
                  ? "bg-neutral-900 text-white shadow-xs"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900"
              }`}
            >
              👥 Partner Payout Breakdown ({partnerBreakdown.length})
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search project, invoice, or partner..."
                className="w-full sm:w-64 rounded-xl border border-neutral-200 bg-neutral-50/50 pl-9 pr-3 py-1.5 text-xs text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-neutral-900 focus:outline-none"
              />
            </div>

            {activeSubTab === "projects" && (
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border border-neutral-200 bg-white px-3 py-1.5 text-xs text-neutral-700 font-medium focus:border-neutral-900 focus:outline-none cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Partial">Partial</option>
              </select>
            )}
          </div>
        </div>

        {/* View 1: Project Company Revenue Ledger */}
        {activeSubTab === "projects" && (
          <div>
            {filteredInvoices.length === 0 ? (
              <div className="text-center py-12 text-neutral-500">
                <Wallet className="h-10 w-10 text-neutral-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-neutral-800">No project invoices found</p>
                <p className="text-xs text-neutral-400 mt-1">
                  Create client invoices in the Quotations &amp; Invoices tab to see automatic 30% company allocations.
                </p>
                <button
                  onClick={() => onNavigateTab("invoices")}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-neutral-900 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-neutral-800 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Create First Invoice
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-neutral-200 bg-neutral-50 text-[10px] font-mono uppercase tracking-wider text-neutral-500">
                      <th className="px-4 py-3">Project / Client Name</th>
                      <th className="px-4 py-3">Invoice &amp; Date</th>
                      <th className="px-4 py-3 text-right">Invoice Total</th>
                      <th className="px-4 py-3 text-right bg-emerald-50/50 text-emerald-950 font-bold border-x border-emerald-100">
                        Company Share (30%)
                      </th>
                      <th className="px-4 py-3">Team Distribution (70%)</th>
                      <th className="px-4 py-3 text-center">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {filteredInvoices.map((inv) => {
                      const projName = getInvoiceProjectName(inv);
                      const compShare = getInvoiceCompanyShare(inv);
                      const teamShare = getInvoiceTeamShare(inv);
                      const hasCustomSplit = inv.split?.members && inv.split.members.length > 0;

                      return (
                        <tr key={inv.id} className="hover:bg-neutral-50/80 transition-colors">
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2">
                              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-neutral-900 text-white font-bold text-xs">
                                {projName.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-bold text-neutral-900">{projName}</p>
                                <p className="text-[11px] text-neutral-500">
                                  {inv.clientName} {inv.clientCompany ? `• ${inv.clientCompany}` : ""}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="font-mono font-semibold text-neutral-900">{inv.invoiceNumber}</span>
                            <p className="text-[11px] text-neutral-400">{inv.issueDate}</p>
                          </td>
                          <td className="px-4 py-3.5 text-right font-mono font-bold text-neutral-950">
                            ₹{(inv.total || 0).toLocaleString("en-IN")}
                          </td>
                          <td className="px-4 py-3.5 text-right bg-emerald-50/40 border-x border-emerald-100">
                            <span className="font-mono font-extrabold text-emerald-700 text-sm">
                              +₹{compShare.toLocaleString("en-IN")}
                            </span>
                            <p className="text-[10px] text-emerald-600 font-medium">30% to Wallet</p>
                          </td>
                          <td className="px-4 py-3.5">
                            <div>
                              <span className="font-mono font-bold text-neutral-900">
                                ₹{teamShare.toLocaleString("en-IN")}
                              </span>
                              {hasCustomSplit ? (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {inv.split!.members.map((m) => (
                                    <span
                                      key={m.id}
                                      className="inline-flex items-center gap-1 rounded-md bg-blue-50 text-blue-700 px-1.5 py-0.5 text-[10px] font-medium border border-blue-200/60"
                                    >
                                      <span>{m.name}:</span>
                                      <span className="font-mono font-bold">₹{m.amount.toLocaleString("en-IN")}</span>
                                      <span className="text-[9px] text-blue-500">({m.percentageOfTeam}%)</span>
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-[11px] text-neutral-400 mt-0.5 italic">
                                  Default 70% pool (Click Split to assign names)
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-center">
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
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <button
                              onClick={() => setSelectedInvoiceForSplit(inv)}
                              className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
                                hasCustomSplit
                                  ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                                  : "bg-neutral-100 text-neutral-800 hover:bg-neutral-200 border border-neutral-300/80"
                              }`}
                              title="Configure or adjust revenue split"
                            >
                              <PieChart className="h-3 w-3 text-emerald-600" />
                              <span>{hasCustomSplit ? "Edit Split" : "Split"}</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* View 2: Partner / Member Payout Breakdown */}
        {activeSubTab === "partners" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {partnerBreakdown.map((partner) => (
                <div
                  key={partner.name}
                  className="rounded-xl border border-neutral-200 bg-neutral-50/50 p-4 space-y-3 hover:bg-white transition-all shadow-2xs"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-xs shadow-xs">
                        {partner.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-neutral-900 text-sm">{partner.name}</h4>
                        <p className="text-[11px] text-neutral-500">
                          {partner.projectCount} project{partner.projectCount !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <span className="rounded-full bg-blue-100 text-blue-800 px-2 py-0.5 text-[10px] font-bold font-mono">
                      Partner Share
                    </span>
                  </div>

                  <div className="rounded-lg bg-white p-3 border border-neutral-200/80 space-y-2">
                    <div className="flex justify-between items-baseline">
                      <span className="text-[11px] text-neutral-500">Total Allocated:</span>
                      <span className="font-mono font-black text-neutral-950 text-base">
                        ₹{partner.totalAmount.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex justify-between items-baseline text-[11px]">
                      <span className="text-emerald-700">Settled (Paid):</span>
                      <span className="font-mono font-bold text-emerald-700">
                        ₹{partner.paidAmount.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex justify-between items-baseline text-[11px]">
                      <span className="text-amber-700">Pending Milestone:</span>
                      <span className="font-mono font-bold text-amber-700">
                        ₹{partner.pendingAmount.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] uppercase font-mono tracking-wider text-neutral-400 font-semibold mb-1">
                      Assigned Projects:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {partner.projects.map((p) => (
                        <span
                          key={p}
                          className="rounded-md bg-neutral-200/70 text-neutral-800 px-2 py-0.5 text-[10px] font-medium"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Invoice Split Modal */}
      {selectedInvoiceForSplit && (
        <InvoiceSplitModal
          invoice={selectedInvoiceForSplit}
          isOpen={true}
          onClose={() => setSelectedInvoiceForSplit(null)}
          onSaveSplit={handleSaveSplit}
          adminEmail={adminEmail}
        />
      )}
    </div>
  );
}
