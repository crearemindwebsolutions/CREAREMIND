import { useMemo, useState, useEffect } from "react";
import {
  TrendingUp,
  Inbox,
  Briefcase,
  DollarSign,
  Sparkles,
  MessageSquare,
  Search,
  ExternalLink,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { ClientInquiry } from "@/lib/inquiries";
import type { AdminProject } from "@/lib/admin-projects";
import type { AdminInvoice } from "@/lib/admin-invoices";

interface AdminAnalyticsViewProps {
  inquiries: ClientInquiry[];
  projects: AdminProject[];
  invoices: AdminInvoice[];
  onNavigateTab: (tabId: string) => void;
}

export function AdminAnalyticsView({
  inquiries,
  projects,
  invoices,
  onNavigateTab,
}: AdminAnalyticsViewProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // 100% Real-time Production Metrics
  const totalInquiries = inquiries.length;
  const newInquiries = inquiries.filter((i) => i.status === "New").length;
  const inProgressInquiries = inquiries.filter(
    (i) => i.status === "In Progress" || i.status === "Contacted"
  ).length;

  const activeProjects = projects.filter(
    (p) => p.stage !== "Completed" && p.stage !== "Maintenance"
  ).length;

  const totalInvoiced = invoices.reduce((acc, inv) => acc + (inv.total || 0), 0);
  const totalCollected = invoices.reduce((acc, inv) => acc + (inv.amountPaid || 0), 0);

  const conversionRate =
    totalInquiries > 0
      ? Math.round(((totalInquiries - newInquiries) / totalInquiries) * 100)
      : 0;

  // Real-time Monthly Trend grouped by genuine inquiries & invoices
  const trendData = useMemo(() => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date();
    const result = [];

    // Last 6 calendar months
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mName = monthNames[d.getMonth()];
      const year = d.getFullYear();
      const monthIdx = d.getMonth();

      // Count genuine inquiries in this month
      const monthInquiries = inquiries.filter((inq) => {
        const inqDate = new Date(inq.timestamp || inq.createdAt);
        return inqDate.getFullYear() === year && inqDate.getMonth() === monthIdx;
      }).length;

      // Sum genuine invoices issued in this month
      const monthRevenue = invoices
        .filter((inv) => {
          const invDate = new Date(inv.issueDate || inv.createdAt);
          return invDate.getFullYear() === year && invDate.getMonth() === monthIdx;
        })
        .reduce((sum, inv) => sum + (inv.total || 0), 0);

      result.push({
        month: mName,
        inquiries: monthInquiries,
        revenue: monthRevenue,
      });
    }

    return result;
  }, [inquiries, invoices]);

  // Real-time Service Demand Breakdown derived strictly from actual inquiries
  const serviceStats = useMemo(() => {
    if (inquiries.length === 0) return [];

    const map = new Map<string, number>();
    for (const inq of inquiries) {
      const s = (inq.service || "General Inquiry").trim();
      map.set(s, (map.get(s) || 0) + 1);
    }

    const sorted = Array.from(map.entries()).map(([name, count]) => ({
      name,
      count,
      percent: Math.round((count / inquiries.length) * 100),
    }));

    return sorted.sort((a, b) => b.count - a.count);
  }, [inquiries]);

  const hasActivity = totalInquiries > 0 || invoices.length > 0 || projects.length > 0;

  return (
    <div className="space-y-6 text-neutral-900">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-neutral-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-medium text-emerald-800">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Production Analytics
            </span>
            <span className="text-xs text-neutral-400 font-mono">Real-time Feed</span>
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
            Executive Analytics &amp; Pipeline
          </h1>
          <p className="mt-1 text-xs text-neutral-500">
            Real-time business performance derived strictly from live website submissions and customer invoices.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onNavigateTab("invoices")}
            className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 px-3.5 py-2 text-xs font-semibold text-neutral-700 shadow-xs cursor-pointer transition-colors"
          >
            <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
            New Invoice
          </button>
          <button
            onClick={() => onNavigateTab("projects")}
            className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 px-3.5 py-2 text-xs font-semibold text-neutral-700 shadow-xs cursor-pointer transition-colors"
          >
            <Briefcase className="h-3.5 w-3.5 text-blue-600" />
            Track Projects
          </button>
          <button
            onClick={() => onNavigateTab("comms")}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3.5 py-2 text-xs font-semibold text-white shadow-xs cursor-pointer transition-colors"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            WhatsApp Client
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Inquiries */}
        <div
          onClick={() => onNavigateTab("inquiries")}
          className="group relative cursor-pointer overflow-hidden rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs transition-all hover:border-emerald-400 hover:shadow-md"
        >
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-neutral-400">
              Total Inquiries
            </span>
            <div className="rounded-xl bg-blue-50 p-2 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Inbox className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-neutral-900">
              {totalInquiries}
            </span>
            {newInquiries > 0 ? (
              <span className="text-xs font-semibold text-emerald-600">
                +{newInquiries} new
              </span>
            ) : (
              <span className="text-xs font-mono text-neutral-400">0 pending</span>
            )}
          </div>
          <p className="mt-1 text-xs text-neutral-500">
            {inProgressInquiries > 0
              ? `${inProgressInquiries} in active discussion`
              : "Form submissions on /contact"}
          </p>
        </div>

        {/* Card 2: Active Projects */}
        <div
          onClick={() => onNavigateTab("projects")}
          className="group relative cursor-pointer overflow-hidden rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs transition-all hover:border-blue-400 hover:shadow-md"
        >
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-neutral-400">
              Active Projects
            </span>
            <div className="rounded-xl bg-blue-50 p-2 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Briefcase className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-neutral-900">
              {activeProjects}
            </span>
            <span className="text-xs text-neutral-400 font-mono">
              of {projects.length} total
            </span>
          </div>
          <p className="mt-1 text-xs text-neutral-500">
            {activeProjects > 0 ? "Deliverables in progress" : "No active projects"}
          </p>
        </div>

        {/* Card 3: Invoiced Pipeline */}
        <div
          onClick={() => onNavigateTab("invoices")}
          className="group relative cursor-pointer overflow-hidden rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs transition-all hover:border-emerald-400 hover:shadow-md"
        >
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-neutral-400">
              Gross Invoiced
            </span>
            <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-2xl font-bold tracking-tight text-neutral-900">
              ₹{totalInvoiced.toLocaleString("en-IN")}
            </span>
          </div>
          <p className="mt-1 text-xs text-emerald-600 font-medium">
            ₹{totalCollected.toLocaleString("en-IN")} collected
          </p>
        </div>

        {/* Card 4: Conversion Rate & SEO */}
        <div
          onClick={() => onNavigateTab("seo")}
          className="group relative cursor-pointer overflow-hidden rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs transition-all hover:border-purple-400 hover:shadow-md"
        >
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-neutral-400">
              Conversion Rate
            </span>
            <div className="rounded-xl bg-purple-50 p-2 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-neutral-900">
              {conversionRate}%
            </span>
          </div>
          <p className="mt-1 text-xs text-neutral-500">
            {totalInquiries > 0
              ? `${totalInquiries - newInquiries} of ${totalInquiries} inquiries engaged`
              : "Awaiting incoming leads"}
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Revenue & Inquiry Trajectory */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
            <div>
              <h3 className="font-bold text-neutral-900 text-sm">Monthly Demand &amp; Revenue Velocity</h3>
              <p className="text-xs text-neutral-500">Real inquiry volume vs issued invoice totals</p>
            </div>
            <span className="rounded-md bg-neutral-100 px-2.5 py-1 text-[11px] font-mono font-medium text-neutral-600">
              Last 6 Months
            </span>
          </div>

          <div className="mt-6 h-64 w-full">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#6B7280" }} stroke="#E5E7EB" />
                  <YAxis tick={{ fontSize: 12, fill: "#6B7280" }} stroke="#E5E7EB" />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-xl border border-neutral-200 bg-white p-3 shadow-lg text-xs">
                            <p className="font-bold text-neutral-900">{payload[0].payload.month}</p>
                            <p className="text-emerald-600 font-semibold mt-1">
                              Revenue: ₹{payload[0].payload.revenue.toLocaleString("en-IN")}
                            </p>
                            <p className="text-neutral-500">
                              Inquiries: {payload[0].payload.inquiries} leads
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#059669"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#revenueGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full rounded-xl bg-neutral-50 border border-dashed border-neutral-200 grid place-items-center text-xs text-neutral-400">
                Loading analytics visualization…
              </div>
            )}
          </div>
        </div>

        {/* Real Service Demand Breakdown */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
              <div>
                <h3 className="font-bold text-neutral-900 text-sm">Services Intake Distribution</h3>
                <p className="text-xs text-neutral-500">Live breakdown by client inquiry category</p>
              </div>
            </div>

            <div className="mt-4">
              {serviceStats.length === 0 ? (
                <div className="py-10 text-center space-y-2">
                  <Inbox className="h-8 w-8 text-neutral-300 mx-auto" />
                  <p className="text-xs font-semibold text-neutral-700">No inquiry tickets yet</p>
                  <p className="text-[11px] text-neutral-400 max-w-xs mx-auto leading-relaxed">
                    When visitors submit project requirements on /contact, real category distributions will automatically render here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {serviceStats.map((item) => (
                    <div key={item.name} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-neutral-800">{item.name}</span>
                        <span className="text-neutral-500 font-mono font-semibold">
                          {item.count} leads ({item.percent}%)
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-neutral-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-neutral-900 transition-all duration-500"
                          style={{ width: `${item.percent}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-neutral-200 bg-neutral-50 p-3.5">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-neutral-700 shrink-0" />
              <p className="text-xs font-bold text-neutral-900">Production Mode Active</p>
            </div>
            <p className="mt-1 text-[11px] text-neutral-600 leading-relaxed">
              All metrics update dynamically in real time from direct client inquiries, active engineering projects, and tax invoices.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Operations Row */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <span className="inline-block rounded-md bg-neutral-100 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-neutral-600 font-semibold">
              Agency Fast Dispatch
            </span>
            <h3 className="text-base font-bold text-neutral-900">Creare Mind Operations Hub</h3>
            <p className="text-xs text-neutral-500 max-w-xl">
              Quickly send formal quotations, deploy milestone staging updates, or dispatch WhatsApp receipts directly to clients without leaving the admin panel.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigateTab("comms")}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition-colors cursor-pointer"
            >
              <MessageSquare className="h-4 w-4" />
              WhatsApp Message Center
            </button>
            <button
              onClick={() => onNavigateTab("seo")}
              className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 px-4 py-2.5 text-xs font-semibold text-neutral-800 shadow-xs transition-colors cursor-pointer"
            >
              <Search className="h-4 w-4" />
              Google SERP &amp; SEO Tools
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
