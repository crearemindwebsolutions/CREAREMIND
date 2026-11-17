import { useState } from "react";
import {
  Activity,
  Search,
  Filter,
  Trash2,
  Clock,
  User,
  Shield,
  FileText,
  Briefcase,
  DollarSign,
  Search as SearchIcon,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { getAdminLogs, type AdminLogEntry } from "@/lib/admin-logs";

export function AdminLogsView() {
  const [logs, setLogs] = useState<AdminLogEntry[]>(() => getAdminLogs());
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");

  const filteredLogs = logs.filter((log) => {
    if (!log) return false;
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      String(log.action || "").toLowerCase().includes(q) ||
      String(log.details || "").toLowerCase().includes(q) ||
      String(log.adminEmail || "").toLowerCase().includes(q);
    const matchesCategory = categoryFilter === "All" || log.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleClearLogs = () => {
    if (!confirm("Clear audit log history?")) return;
    localStorage.removeItem("creare_admin_audit_logs");
    setLogs([]);
    toast.success("Audit trail cleared");
  };

  const handleRefresh = () => {
    setLogs(getAdminLogs());
    toast.success("Audit trail refreshed");
  };

  const getCategoryBadgeClass = (cat: AdminLogEntry["category"]) => {
    switch (cat) {
      case "Projects":
        return "bg-blue-50 border border-blue-200 text-blue-800";
      case "Invoices":
        return "bg-emerald-50 border border-emerald-200 text-emerald-800";
      case "Inquiries":
        return "bg-amber-50 border border-amber-200 text-amber-800";
      case "SEO":
        return "bg-purple-50 border border-purple-200 text-purple-800";
      default:
        return "bg-neutral-100 text-neutral-700";
    }
  };

  return (
    <div className="space-y-6 text-neutral-900">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-neutral-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 border border-neutral-200 px-2.5 py-0.5 text-[11px] font-medium text-neutral-700">
              <Activity className="h-3 w-3 text-neutral-600" />
              Security &amp; Audit Trail
            </span>
            <span className="text-xs text-neutral-400 font-mono">
              Immutable Admin History
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
            Admin Activity Logs
          </h1>
          <p className="mt-1 text-xs text-neutral-500">
            Monitor administrative operations, client status updates, and content modifications.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 px-3.5 py-2 text-xs font-semibold text-neutral-700 shadow-xs transition-colors cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5 text-neutral-500" />
            Refresh
          </button>
          {logs.length > 0 && (
            <button
              onClick={handleClearLogs}
              className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 px-3.5 py-2 text-xs font-semibold text-red-700 transition-colors cursor-pointer shadow-xs"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear History
            </button>
          )}
        </div>
      </div>

      {/* Filter Strip */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
          <input
            type="text"
            placeholder="Search action, admin email, or details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-neutral-200 bg-white pl-9 pr-4 py-2 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {["All", "Projects", "Invoices", "Inquiries", "SEO", "System"].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`rounded-xl px-3 py-1 text-xs font-semibold transition-colors cursor-pointer border ${
                categoryFilter === cat
                  ? "bg-neutral-900 text-white border-neutral-900"
                  : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Table in Pure Light Theme */}
      <div className="rounded-2xl border border-neutral-200 bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-neutral-200 bg-neutral-50 font-semibold text-neutral-500 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Details</th>
                <th className="px-4 py-3">Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-mono text-[11px]">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-neutral-400 font-sans">
                    No activity logs recorded
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="px-4 py-3 text-neutral-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString("en-IN", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${getCategoryBadgeClass(log.category)}`}>
                        {log.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-neutral-900 font-sans">
                      {log.action}
                    </td>
                    <td className="px-4 py-3 text-neutral-600 font-sans max-w-md truncate">
                      {log.details}
                    </td>
                    <td className="px-4 py-3 text-neutral-400 text-[10px]">
                      {log.adminEmail}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
