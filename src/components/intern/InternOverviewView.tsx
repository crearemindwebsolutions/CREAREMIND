import React from "react";
import {
  User,
  Briefcase,
  Info,
  CheckCircle2,
  Zap,
  Calendar,
  Clock,
  ArrowRight,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import type {
  InternProfile,
  InternTask,
  InternProject,
  ScheduleItem,
} from "@/lib/intern-data";
import type { InternNavTab } from "./InternSidebar";

interface InternOverviewViewProps {
  profile: InternProfile;
  tasks: InternTask[];
  projects: InternProject[];
  schedule: ScheduleItem[];
  onSelectTab: (tab: InternNavTab) => void;
  onOpenTaskModal: (task: InternTask) => void;
  onOpenProjectModal: () => void;
}

export function InternOverviewView({
  profile,
  tasks,
  projects,
  schedule,
  onSelectTab,
  onOpenTaskModal,
  onOpenProjectModal,
}: InternOverviewViewProps) {
  // Dynamic greeting based on current local hour
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  // Formatted date matching "Saturday, November 14, 2026"
  const formattedDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const initials = (profile.name || "Intern")
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "IN";

  const firstName = profile.name ? profile.name.split(" ")[0] : "Intern";

  const activeProjectsCount = projects.filter((p) => p.status !== "Completed").length;
  const dueTodayCount = tasks.filter((t) => t.status !== "Completed").length;
  const completedThisWeekCount = tasks.filter((t) => t.status === "Completed").length;

  return (
    <div className="space-y-5">
      {/* 1. Welcome Card Matching Creare Mind Web Colors */}
      <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            {/* Signature Creare Mind Black / Charcoal Initials Circle */}
            <div className="grid h-12 w-12 place-items-center rounded-full bg-neutral-900 text-white font-['Plus_Jakarta_Sans',sans-serif] font-bold text-sm shadow-xs shrink-0 ring-1 ring-neutral-800">
              {initials}
            </div>

            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-neutral-900 leading-tight">
                {greeting}, {firstName}
              </h2>

              <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-neutral-500">
                <span className="flex items-center gap-1.5 font-medium text-neutral-700">
                  <User className="h-3.5 w-3.5 text-neutral-400" />
                  {profile.role || "Intern Engineer"}
                </span>
                <span className="text-neutral-300">&bull;</span>
                <span className="flex items-center gap-1.5 text-neutral-500">
                  <Briefcase className="h-3.5 w-3.5 text-neutral-400" />
                  {profile.company || "Creare Mind Engineering"}
                </span>
              </div>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs font-normal text-neutral-400">
              {formattedDate}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Four Metric KPI Cards (2x2 Grid with Creare Mind Color Palette & Modern Geometric Numbers) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Card 1: MY ACTIVE PROJECTS */}
        <div
          onClick={() => onSelectTab("projects")}
          className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs hover:border-neutral-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="font-['Plus_Jakarta_Sans',sans-serif] text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
              MY ACTIVE PROJECTS
            </span>
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-neutral-100 text-neutral-700 group-hover:bg-neutral-900 group-hover:text-white transition-colors">
              <Briefcase className="h-4 w-4" />
            </div>
          </div>

          <div className="mt-3">
            <span className="font-['Plus_Jakarta_Sans',sans-serif] text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 tabular-nums">
              {projects.length > 0 ? activeProjectsCount : "—"}
            </span>
          </div>

          <div className="mt-2 text-xs font-semibold text-emerald-600 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span>{projects.length > 0 ? `${activeProjectsCount} Active` : "Not available yet"}</span>
          </div>
        </div>

        {/* Card 2: TASKS DUE TODAY */}
        <div
          onClick={() => onSelectTab("work")}
          className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs hover:border-neutral-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="font-['Plus_Jakarta_Sans',sans-serif] text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
              TASKS DUE TODAY
            </span>
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-neutral-100 text-neutral-700 group-hover:bg-neutral-900 group-hover:text-white transition-colors">
              <Info className="h-4 w-4" />
            </div>
          </div>

          <div className="mt-3">
            <span className="font-['Plus_Jakarta_Sans',sans-serif] text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 tabular-nums">
              {dueTodayCount}
            </span>
          </div>

          <div className="mt-2 text-xs font-semibold text-emerald-600 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span>From your workspace</span>
          </div>
        </div>

        {/* Card 3: COMPLETED THIS WEEK */}
        <div
          onClick={() => onSelectTab("work")}
          className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs hover:border-neutral-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="font-['Plus_Jakarta_Sans',sans-serif] text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
              COMPLETED THIS WEEK
            </span>
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-neutral-100 text-neutral-700 group-hover:bg-neutral-900 group-hover:text-white transition-colors">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>

          <div className="mt-3">
            <span className="font-['Plus_Jakarta_Sans',sans-serif] text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 tabular-nums">
              {completedThisWeekCount}
            </span>
          </div>

          <div className="mt-2 text-xs font-semibold text-emerald-600 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span>From your workspace</span>
          </div>
        </div>

        {/* Card 4: TEAM VELOCITY */}
        <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs hover:border-neutral-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="font-['Plus_Jakarta_Sans',sans-serif] text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
              TEAM VELOCITY
            </span>
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-neutral-100 text-neutral-700">
              <Zap className="h-4 w-4" />
            </div>
          </div>

          <div className="mt-3">
            <span className="font-['Plus_Jakarta_Sans',sans-serif] text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 tabular-nums">
              —
            </span>
          </div>

          <div className="mt-2 text-xs font-semibold text-emerald-600 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span>Not available yet</span>
          </div>
        </div>
      </div>

      {/* 3. My Productivity This Week Card */}
      <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs space-y-2">
        <h3 className="text-sm font-bold text-neutral-900">
          My Productivity This Week
        </h3>
        <p className="text-xs text-neutral-400">
          Productivity data has not been recorded yet.
        </p>
      </div>

      {/* 4. Active Tasks & Quick Jump Section */}
      <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-neutral-900">Sprint Assignments</h3>
            <p className="text-xs text-neutral-400">
              Current tasks ready for implementation and review.
            </p>
          </div>
          <button
            onClick={() => onSelectTab("work")}
            className="text-xs font-semibold text-neutral-900 hover:underline cursor-pointer"
          >
            View All Tasks &rarr;
          </button>
        </div>

        <div className="space-y-2.5">
          {tasks.length === 0 ? (
            <div className="py-8 text-center text-neutral-400 text-xs space-y-1">
              <p className="font-semibold text-neutral-700">No active sprint tasks assigned</p>
              <p className="text-[11px] text-neutral-400">
                Sprint tasks assigned by your engineering mentor will appear here.
              </p>
            </div>
          ) : (
            tasks.slice(0, 3).map((task) => (
              <div
                key={task.id}
                onClick={() => onOpenTaskModal(task)}
                className="flex items-center justify-between p-3 rounded-xl border border-neutral-100 hover:border-neutral-200 hover:bg-neutral-50/60 transition-all cursor-pointer group"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-neutral-400 font-semibold font-mono">
                      {task.id}
                    </span>
                    <span className="rounded bg-neutral-100 px-1.5 py-0.2 text-[9.5px] font-semibold text-neutral-700">
                      {task.priority}
                    </span>
                    <span className="text-neutral-300 text-[10px]">&bull;</span>
                    <span className="text-[11px] text-neutral-500 truncate">{task.project}</span>
                  </div>
                  <h4 className="mt-0.5 text-xs sm:text-sm font-semibold text-neutral-900 group-hover:text-neutral-700 transition-colors truncate">
                    {task.title}
                  </h4>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-[10px] font-medium text-neutral-700">
                    {task.status}
                  </span>
                  <ChevronRight className="h-4 w-4 text-neutral-400 group-hover:text-neutral-700" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
