import React, { useState } from "react";
import {
  CheckCircle2,
  TrendingUp,
  Clock,
  Target,
  Sparkles,
  AlertCircle,
  Plus,
  ArrowUpRight,
  FileText,
  Calendar,
  FolderKanban,
  Check,
  Copy,
  ExternalLink,
  X,
  UserCheck,
  Shield,
  Award,
} from "lucide-react";
import type {
  InternProfile,
  InternTask,
  InternProject,
  ScheduleItem,
  AttendanceDay,
} from "@/lib/intern-data";
import type { InternNavTab } from "./InternSidebar";
import { toast } from "sonner";

interface InternOverviewViewProps {
  profile: InternProfile;
  tasks: InternTask[];
  projects: InternProject[];
  schedule: ScheduleItem[];
  attendance?: AttendanceDay[];
  isCheckedIn?: boolean;
  checkInTime?: string;
  checkOutTime?: string;
  onToggleCheckIn?: () => void;
  onSelectTab: (tab: InternNavTab) => void;
  onOpenTaskModal: (task: InternTask) => void;
  onOpenProjectModal: () => void;
  onAddTask?: (task: { title: string; project?: string; priority?: "High" | "Medium" | "Low"; dueDate?: string }) => void;
}

export function InternOverviewView({
  profile,
  tasks,
  projects,
  schedule,
  attendance = [],
  isCheckedIn = false,
  checkInTime = "",
  checkOutTime = "",
  onToggleCheckIn,
  onSelectTab,
  onOpenTaskModal,
  onOpenProjectModal,
  onAddTask,
}: InternOverviewViewProps) {
  // Modal states
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showOfferLetterModal, setShowOfferLetterModal] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  // New task form fields
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskProject, setNewTaskProject] = useState(projects[0]?.name || "Core Platform");
  const [newTaskPriority, setNewTaskPriority] = useState<"High" | "Medium" | "Low">("Medium");
  const [newTaskDueDate, setNewTaskDueDate] = useState("Tomorrow, 5:00 PM");

  // Dynamic greeting based on current local hour
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const firstName = profile.name ? profile.name.split(" ")[0] : "Intern";

  // Calculations
  const activeTasks = tasks.filter((t) => t.status !== "Completed");
  const completedTasks = tasks.filter((t) => t.status === "Completed");
  const activeTasksCount = activeTasks.length;
  const completedTasksCount = completedTasks.length;
  const totalTasksCount = tasks.length;
  const completionRate =
    totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;
  const daysPresent = attendance.filter((a) => a.status === "present").length;
  const deadlinesAtRisk = tasks.filter(
    (t) => t.priority === "High" && t.status !== "Completed"
  ).length;
  const savedScheduleCount = schedule.length;

  const handleCopyId = () => {
    if (!profile.id) return;
    navigator.clipboard.writeText(profile.id);
    setCopiedId(true);
    toast.success("Intern ID copied to clipboard!");
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) {
      toast.error("Please enter a task title");
      return;
    }
    if (onAddTask) {
      onAddTask({
        title: newTaskTitle.trim(),
        project: newTaskProject,
        priority: newTaskPriority,
        dueDate: newTaskDueDate,
      });
      toast.success("Task added to your daily planner!");
    }
    setNewTaskTitle("");
    setShowAddTaskModal(false);
  };

  return (
    <div className="space-y-6">
      {/* 1. TOP BANNER: AI Morning Brief Card (Matching reference screenshot) */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-700 p-6 sm:p-7 text-white shadow-md relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-72 h-72 rounded-full bg-white/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-[11px] font-medium text-emerald-50">
            <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
            <span>AI morning brief</span>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {greeting}, {firstName}! ☀️
            </h1>
            <p className="text-xs sm:text-sm text-emerald-50/90 mt-1 max-w-2xl leading-relaxed">
              You have <span className="font-bold text-white">{activeTasksCount} active tasks</span> and{" "}
              <span className="font-bold text-white">{savedScheduleCount} saved schedule items</span>. Stay
              focused on your highest-impact work.
            </p>
          </div>

          {/* 3 Status Badges from Screenshot */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-white font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
              <span>{activeTasksCount} Tasks Active</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-white font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />
              <span>{completedTasksCount} Tasks Completed</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-white font-medium">
              <AlertCircle className="w-3.5 h-3.5 text-amber-200" />
              <span>{deadlinesAtRisk} Deadlines At Risk</span>
            </span>
          </div>
        </div>
      </div>

      {/* 2. 4 METRIC CARDS ROW (Exact replica of screenshot) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Card 1: Completed tasks */}
        <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-600">Completed tasks</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 grid place-items-center text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-neutral-900">{completedTasksCount}</div>
            <p className="text-[11px] text-neutral-400 mt-0.5">of assigned tasks</p>
          </div>
        </div>

        {/* Card 2: Completion rate */}
        <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-600">Completion rate</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 grid place-items-center text-blue-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-neutral-900">
              {tasks.length > 0 ? `${completionRate}%` : "—"}
            </div>
            <p className="text-[11px] text-neutral-400 mt-0.5">of assigned tasks</p>
          </div>
        </div>

        {/* Card 3: Attendance */}
        <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-600">Attendance</span>
            <div
              className={`w-8 h-8 rounded-xl ${
                isCheckedIn
                  ? "bg-emerald-50 border border-emerald-200 text-emerald-600"
                  : "bg-amber-50 border border-amber-200 text-amber-600"
              } grid place-items-center transition-colors`}
            >
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-neutral-900">
              {daysPresent > 0 ? daysPresent : "0"}
            </div>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              {daysPresent > 0
                ? `${daysPresent} day${daysPresent > 1 ? "s" : ""} present this month`
                : "days present this month"}
            </p>
          </div>
        </div>

        {/* Card 4: Delayed tasks */}
        <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-600">Delayed tasks</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-200 grid place-items-center text-purple-600">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-neutral-900">{deadlinesAtRisk}</div>
            <p className="text-[11px] text-neutral-400 mt-0.5">based on task deadlines</p>
          </div>
        </div>
      </div>

      {/* 3. MAIN CONTENT: 2 COLUMNS (Matching screenshot) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: 2 SPANS (Today's tasks & My Projects) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card: Today's tasks */}
          <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4 mb-4">
              <div>
                <h2 className="text-base font-bold text-neutral-900">Today's tasks</h2>
                <p className="text-xs text-neutral-400 mt-0.5">Deliverables and action items scheduled for today</p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddTaskModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-xs font-semibold text-neutral-800 shadow-2xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add task</span>
              </button>
            </div>

            {/* If caught up (all active tasks done) */}
            {activeTasks.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 grid place-items-center text-emerald-600 mb-3 shadow-2xs">
                  <Check className="w-6 h-6 stroke-[2.5]" />
                </div>
                <h3 className="text-sm font-bold text-neutral-900">You're all caught up.</h3>
                <p className="text-xs text-neutral-400 mt-1 max-w-sm">
                  No pending deliverables for today. Review your active projects or sync with your mentor.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeTasks.slice(0, 5).map((task) => (
                  <div
                    key={task.id}
                    onClick={() => onOpenTaskModal(task)}
                    className="p-3.5 rounded-xl border border-neutral-200/80 hover:border-neutral-900/30 bg-neutral-50/50 hover:bg-white transition-all cursor-pointer flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-5 h-5 rounded-md border border-neutral-300 grid place-items-center group-hover:border-neutral-900 shrink-0">
                        {task.status === "Completed" && <Check className="w-3.5 h-3.5 text-neutral-900" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-neutral-900 truncate group-hover:text-emerald-700 transition-colors">
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 text-[10.5px] text-neutral-500 mt-0.5">
                          <span className="font-mono">{task.project}</span>
                          <span>&bull;</span>
                          <span>Due: {task.dueDate}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wider ${
                          task.priority === "High"
                            ? "bg-red-50 text-red-700 border border-red-200"
                            : task.priority === "Medium"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-blue-50 text-blue-700 border border-blue-200"
                        }`}
                      >
                        {task.priority}
                      </span>
                      <span className="text-xs text-neutral-400 group-hover:text-neutral-900 transition-colors font-medium">
                        View &rarr;
                      </span>
                    </div>
                  </div>
                ))}

                {activeTasks.length > 5 && (
                  <button
                    type="button"
                    onClick={() => onSelectTab("work")}
                    className="w-full py-2 text-center text-xs font-semibold text-neutral-600 hover:text-neutral-900 hover:underline cursor-pointer"
                  >
                    View all {activeTasks.length} tasks &rarr;
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Card: Assigned Engineering Projects */}
          <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4 mb-4">
              <div>
                <h2 className="text-base font-bold text-neutral-900">My Projects</h2>
                <p className="text-xs text-neutral-400 mt-0.5">Active Creare Mind client and internal projects</p>
              </div>

              <button
                type="button"
                onClick={() => onSelectTab("projects")}
                className="text-xs font-semibold text-neutral-700 hover:text-neutral-900 hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <span>View all projects</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {projects.slice(0, 2).map((project) => (
                <div
                  key={project.id}
                  onClick={() => onSelectTab("projects")}
                  className="p-4 rounded-xl border border-neutral-200/80 hover:border-neutral-900/40 bg-white hover:bg-neutral-50/50 transition-all cursor-pointer space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-neutral-900">{project.name}</h4>
                      <p className="text-[11px] text-neutral-500 mt-0.5 line-clamp-1">{project.description}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
                      {project.status}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-[10.5px] font-mono text-neutral-500 mb-1">
                      <span>Progress</span>
                      <span className="font-bold text-neutral-900">{project.progress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-neutral-900 rounded-full transition-all duration-300"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10.5px] text-neutral-400 pt-1 border-t border-neutral-100">
                    <span>Mentor: {project.mentor}</span>
                    <span>Due: {project.deadline}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: 1 SPAN (Saved schedule, Quick actions, Credentials) */}
        <div className="space-y-6">
          {/* Card: Saved schedule (Matching screenshot) */}
          <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3 mb-3">
              <h3 className="text-xs font-bold text-neutral-900">Saved schedule</h3>
              <button
                type="button"
                onClick={() => onSelectTab("calendar")}
                className="text-[11px] font-semibold text-neutral-500 hover:text-neutral-900 hover:underline"
              >
                Calendar &rarr;
              </button>
            </div>

            {schedule.length === 0 ? (
              <div className="py-8 text-center text-xs text-neutral-400">
                No schedule items have been added.
              </div>
            ) : (
              <div className="space-y-2.5">
                {schedule.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-xl border border-neutral-100 bg-neutral-50/60 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between font-semibold text-neutral-800">
                      <span className="truncate">{item.title}</span>
                      <span className="text-[10px] font-mono text-neutral-500 shrink-0">{item.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10.5px] text-neutral-500">
                      <span>{item.duration}</span>
                      <span>&bull;</span>
                      <span className="truncate">{item.location}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Card: Quick actions (Matching screenshot) */}
          <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-neutral-900">Quick actions</h3>

            <div className="grid grid-cols-1 gap-2 text-xs">
              <button
                type="button"
                onClick={() => onSelectTab("work")}
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-neutral-200/80 hover:border-neutral-900 hover:bg-neutral-50 transition-colors cursor-pointer font-semibold text-neutral-800"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>My tasks</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-neutral-400" />
              </button>

              <button
                type="button"
                onClick={() => onSelectTab("projects")}
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-neutral-200/80 hover:border-neutral-900 hover:bg-neutral-50 transition-colors cursor-pointer font-semibold text-neutral-800"
              >
                <div className="flex items-center gap-2">
                  <FolderKanban className="w-4 h-4 text-blue-600" />
                  <span>My projects</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-neutral-400" />
              </button>

              <button
                type="button"
                onClick={onToggleCheckIn ? onToggleCheckIn : () => onSelectTab("attendance")}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition-colors cursor-pointer font-semibold ${
                  isCheckedIn
                    ? "border-emerald-300 bg-emerald-50 text-emerald-900 hover:bg-emerald-100/70"
                    : "border-neutral-200/80 hover:border-neutral-900 hover:bg-neutral-50 text-neutral-800"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Clock className={`w-4 h-4 ${isCheckedIn ? "text-emerald-600" : "text-amber-600"}`} />
                  <span>
                    {isCheckedIn
                      ? `Clocked In (${checkInTime || "Active"})`
                      : "Daily Attendance Clock-In"}
                  </span>
                </div>
                <ArrowUpRight className={`w-4 h-4 ${isCheckedIn ? "text-emerald-700" : "text-neutral-400"}`} />
              </button>

              <button
                type="button"
                onClick={() => setShowOfferLetterModal(true)}
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 transition-colors cursor-pointer font-semibold text-emerald-900"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-700" />
                  <span>Offer Letter & Credentials</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-emerald-700" />
              </button>
            </div>
          </div>

          {/* Card: Official Internship Credentials */}
          <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-semibold">
                Intern Identification
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <Shield className="w-3 h-3 text-emerald-600" />
                <span>Verified</span>
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-neutral-100">
                <span className="text-neutral-500">8-Digit Intern ID:</span>
                <div className="flex items-center gap-1.5 font-mono font-bold text-neutral-900">
                  <span>{profile.id || "00000000"}</span>
                  <button
                    type="button"
                    onClick={handleCopyId}
                    className="p-1 rounded hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
                    title="Copy Intern ID"
                  >
                    {copiedId ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-neutral-100">
                <span className="text-neutral-500">Role Title:</span>
                <span className="font-semibold text-neutral-800">{profile.role || "Intern"}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-neutral-100">
                <span className="text-neutral-500">Assigned Mentor:</span>
                <span className="font-semibold text-neutral-800">{profile.mentorName || "Gowthaman PR"}</span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-neutral-500">College / Dept:</span>
                <span className="font-semibold text-neutral-800 truncate max-w-[150px]">
                  {profile.college && profile.college !== "—" ? profile.college : "—"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: ADD TASK */}
      {showAddTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-neutral-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-neutral-800" />
                <h3 className="text-base font-semibold text-neutral-900">Add New Task</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddTaskModal(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-500 mb-1 font-semibold">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g. Implement Responsive Navbar with Dark Mode"
                  className="w-full h-10 px-3 rounded-xl border border-neutral-200 text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-neutral-900 shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-500 mb-1 font-semibold">
                  Assigned Project
                </label>
                <input
                  type="text"
                  value={newTaskProject}
                  onChange={(e) => setNewTaskProject(e.target.value)}
                  placeholder="e.g. Creare Mind Studio Platform"
                  className="w-full h-10 px-3 rounded-xl border border-neutral-200 text-neutral-900 outline-none focus:border-neutral-900 shadow-2xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-500 mb-1 font-semibold">
                    Priority
                  </label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as any)}
                    className="w-full h-10 px-3 rounded-xl border border-neutral-200 text-neutral-900 outline-none focus:border-neutral-900 shadow-2xs cursor-pointer"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-500 mb-1 font-semibold">
                    Due Date
                  </label>
                  <input
                    type="text"
                    value={newTaskDueDate}
                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                    placeholder="Tomorrow, 5:00 PM"
                    className="w-full h-10 px-3 rounded-xl border border-neutral-200 text-neutral-900 outline-none focus:border-neutral-900 shadow-2xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowAddTaskModal(false)}
                  className="px-4 py-2 rounded-xl border border-neutral-200 text-neutral-600 hover:bg-neutral-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-semibold shadow-xs"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: OFFICIAL OFFER LETTER VIEWER */}
      {showOfferLetterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 sm:p-8 shadow-2xl border border-neutral-200 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-600" />
                <h3 className="text-lg font-bold text-neutral-900">Official Internship Appointment Letter</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowOfferLetterModal(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Formal Letter Document Preview */}
            <div className="p-6 sm:p-8 rounded-xl border border-neutral-200 bg-[#FAF9F6] text-neutral-800 space-y-5 font-serif text-sm leading-relaxed shadow-xs">
              <div className="flex items-center justify-between border-b border-neutral-300 pb-4">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-neutral-900 font-sans">
                    CREARE MIND STUDIO
                  </h2>
                  <p className="text-xs font-sans text-neutral-500">
                    Innovative Software & Web Engineering Solutions &bull; Coimbatore / Chennai, India
                  </p>
                </div>
                <div className="text-right font-sans text-xs text-neutral-500">
                  <p className="font-mono font-bold text-neutral-900">REF: CM-INT-{profile.id || "00000000"}</p>
                  <p>Date: {new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</p>
                </div>
              </div>

              <div>
                <p className="font-sans font-bold text-neutral-900">Dear {profile.name || "Intern Candidate"},</p>
                <p className="mt-2">
                  On behalf of <strong>Creare Mind Studio</strong>, we are pleased to offer you an official
                  appointment as a <strong>{profile.role || "Intern"}</strong>.
                </p>
              </div>

              <div className="bg-white p-4 rounded-lg border border-neutral-200 space-y-2 font-sans text-xs">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Intern ID:</span>
                  <span className="font-mono font-bold text-neutral-900">{profile.id || "00000000"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Department:</span>
                  <span className="font-semibold text-neutral-900">{profile.department || "Engineering"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Assigned Mentor:</span>
                  <span className="font-semibold text-neutral-900">{profile.mentorName || "Gowthaman PR"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Duration & Term:</span>
                  <span className="font-semibold text-neutral-900">{profile.startDate && profile.startDate !== "—" ? profile.startDate : "Commencement"} to {profile.endDate && profile.endDate !== "—" ? profile.endDate : "Completion"}</span>
                </div>
              </div>

              <p>
                You will be working on modern web architectures, API integrations, and cloud solutions. We are
                confident that your technical skills will create lasting value for our clients.
              </p>

              <div className="pt-4 border-t border-neutral-300 flex items-end justify-between font-sans">
                <div>
                  <p className="font-bold text-neutral-900">Gowthaman PR</p>
                  <p className="text-xs text-neutral-500">Founder & Chief Technology Officer, Creare Mind</p>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-mono font-bold">
                    Official Creare Mind Verified
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-6">
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 rounded-xl bg-neutral-900 text-white text-xs font-semibold hover:bg-neutral-800 shadow-xs cursor-pointer"
              >
                Print / Save PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
