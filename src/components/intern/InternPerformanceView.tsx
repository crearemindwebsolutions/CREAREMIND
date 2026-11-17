import React from "react";
import {
  TrendingUp,
  Award,
  Star,
  CheckCircle2,
  Code2,
  Zap,
  Target,
  Sparkles,
  BarChart3,
  ShieldCheck,
  Clock,
} from "lucide-react";
import type { InternProfile, InternTask, AttendanceDay } from "@/lib/intern-data";

interface InternPerformanceViewProps {
  profile: InternProfile;
  tasks: InternTask[];
  attendance: AttendanceDay[];
}

export function InternPerformanceView({
  profile,
  tasks,
  attendance,
}: InternPerformanceViewProps) {
  const completedTasks = tasks.filter((t) => t.status === "Completed");
  const totalTasks = tasks.length;
  const taskCompletionRate =
    totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;
  const presentDays = attendance.filter((a) => a.status === "present").length;

  const skillsList = profile.skills && profile.skills.length > 0 ? profile.skills : ["React", "TypeScript", "Tailwind CSS", "Git"];

  return (
    <div className="space-y-6">
      {/* Top Overall Rating Hero Card */}
      <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-2.5 py-0.5 text-[11px] font-semibold text-neutral-800 border border-neutral-200">
              <Award className="h-3.5 w-3.5 text-neutral-700" />
              <span>Sprint Evaluation Cycle 01</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-900">
              {totalTasks > 0
                ? `Task Velocity: ${taskCompletionRate}% Completed`
                : "Sprint Review in Progress"}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500">
              Evaluated on sprint deliverables, engineering quality, PR reviews, and shift attendance.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-neutral-50 p-4 rounded-xl border border-neutral-200 shrink-0">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-neutral-900 text-white font-['Plus_Jakarta_Sans',sans-serif] font-bold text-lg shadow-xs tabular-nums">
              {completedTasks.length > 0 ? "5.0" : "—"}
            </div>
            <div>
              <div className="flex items-center gap-1 text-amber-500">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="h-3.5 w-3.5 fill-amber-400" />
                ))}
              </div>
              <span className="text-xs font-semibold text-neutral-800 block mt-0.5">
                {completedTasks.length > 0 ? "Good Progress" : "First Review Pending"}
              </span>
              <span className="text-[10px] text-neutral-400 font-['Plus_Jakarta_Sans',sans-serif]">
                Mentor: {profile.mentorName || "Gowthaman PR"}
              </span>
            </div>
          </div>
        </div>

        {/* 4 Score Gauges */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-neutral-100">
          <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-100">
            <span className="font-['Plus_Jakarta_Sans',sans-serif] text-[10px] uppercase tracking-wider text-neutral-400 block font-semibold">
              Tasks Completed
            </span>
            <span className="font-['Plus_Jakarta_Sans',sans-serif] text-xl font-bold text-neutral-900 tabular-nums mt-0.5 block">
              {completedTasks.length} / {totalTasks}
            </span>
            <span className="text-[10.5px] text-neutral-500 font-medium block mt-0.5">
              {totalTasks > 0 ? `${taskCompletionRate}% completed` : "No tasks assigned"}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-100">
            <span className="font-['Plus_Jakarta_Sans',sans-serif] text-[10px] uppercase tracking-wider text-neutral-400 block font-semibold">
              Shifts Present
            </span>
            <span className="font-['Plus_Jakarta_Sans',sans-serif] text-xl font-bold text-neutral-900 tabular-nums mt-0.5 block">
              {presentDays} Days
            </span>
            <span className="text-[10.5px] text-emerald-600 font-medium block mt-0.5">
              Verified daily logs
            </span>
          </div>

          <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-100">
            <span className="font-['Plus_Jakarta_Sans',sans-serif] text-[10px] uppercase tracking-wider text-neutral-400 block font-semibold">
              Active Sprints
            </span>
            <span className="font-['Plus_Jakarta_Sans',sans-serif] text-xl font-bold text-neutral-900 tabular-nums mt-0.5 block">
              {tasks.filter((t) => t.status !== "Completed").length} Active
            </span>
            <span className="text-[10.5px] text-neutral-500 font-medium block mt-0.5">
              Under development
            </span>
          </div>

          <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-100">
            <span className="font-['Plus_Jakarta_Sans',sans-serif] text-[10px] uppercase tracking-wider text-neutral-400 block font-semibold">
              Code Quality
            </span>
            <span className="font-['Plus_Jakarta_Sans',sans-serif] text-xl font-bold text-neutral-900 tabular-nums mt-0.5 block">
              100%
            </span>
            <span className="text-[10.5px] text-emerald-600 font-medium block mt-0.5">
              Conventional commits
            </span>
          </div>
        </div>
      </div>

      {/* Technical Skill Growth & Stack */}
      <div className="rounded-xl border border-neutral-200/80 bg-white p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-neutral-900">
              Technical Skill Growth &amp; Competencies
            </h3>
            <p className="text-xs text-neutral-500">
              Core engineering tools practiced during internship sprints.
            </p>
          </div>
          <span className="rounded-lg bg-neutral-100 px-2.5 py-1 text-xs font-['Plus_Jakarta_Sans',sans-serif] font-medium text-neutral-600">
            {skillsList.length} Core Skills
          </span>
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          {skillsList.map((skill, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50/50 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-900">{skill}</span>
                <span className="rounded bg-neutral-100 border border-neutral-200 px-1.5 py-0.5 text-[10px] font-bold text-neutral-800 font-['Plus_Jakarta_Sans',sans-serif]">
                  Active
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-neutral-200 overflow-hidden">
                <div
                  className="h-full rounded-full bg-neutral-900 transition-all duration-700"
                  style={{ width: "90%" }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-neutral-400">
                <span>Production Stack</span>
                <span>Verified via GitHub PR reviews</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sprint History Timeline */}
      <div className="rounded-xl border border-neutral-200/80 bg-white shadow-xs overflow-hidden">
        <div className="border-b border-neutral-200 p-4 bg-neutral-50/70">
          <h3 className="text-sm font-bold text-neutral-900">Sprint History Timeline</h3>
          <p className="text-[11px] text-neutral-500">
            Bi-weekly milestone evaluations logged since internship commencement.
          </p>
        </div>

        <div className="p-8 text-center text-neutral-400 space-y-2">
          <Clock className="h-8 w-8 mx-auto text-neutral-300" />
          <p className="text-xs font-semibold text-neutral-700">Sprint 01 Review in Progress</p>
          <p className="text-[11px] text-neutral-500 max-w-sm mx-auto">
            Sprint evaluation scores and milestone ratings will be posted here by your mentor following the first bi-weekly sprint review.
          </p>
        </div>
      </div>
    </div>
  );
}
