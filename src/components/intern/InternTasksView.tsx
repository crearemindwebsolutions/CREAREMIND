import React, { useState } from "react";
import {
  Search,
  Filter,
  CheckSquare,
  Clock,
  AlertCircle,
  CheckCircle2,
  Paperclip,
  ExternalLink,
  ChevronDown,
  LayoutList,
  LayoutGrid,
  Send,
  Upload,
  ArrowUpDown,
  FileText,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import type { InternTask } from "@/lib/intern-data";

interface InternTasksViewProps {
  tasks: InternTask[];
  onUpdateStatus: (taskId: string, status: InternTask["status"]) => void;
  onSubmitWork: (
    taskId: string,
    data: { notes: string; link: string; fileCount?: number }
  ) => void;
  onOpenTaskModal: (task: InternTask) => void;
}

export function InternTasksView({
  tasks,
  onUpdateStatus,
  onSubmitWork,
  onOpenTaskModal,
}: InternTasksViewProps) {
  const [viewMode, setViewMode] = useState<"list" | "card">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [selectedPriority, setSelectedPriority] = useState<string>("All");
  const [selectedProject, setSelectedProject] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"deadline" | "priority">("deadline");

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    if (selectedStatus !== "All" && t.status !== selectedStatus) return false;
    if (selectedPriority !== "All" && t.priority !== selectedPriority) return false;
    if (selectedProject !== "All" && t.project !== selectedProject) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.project.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const uniqueProjects = Array.from(new Set(tasks.map((t) => t.project)));

  return (
    <div className="space-y-5">
      {/* Top Filter and View Mode Bar */}
      <div className="rounded-xl border border-neutral-200/80 bg-white p-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by task title, keyword, ID..."
              className="w-full rounded-lg border border-neutral-200 bg-neutral-50/70 py-2 pl-9 pr-3 text-xs text-neutral-900 placeholder-neutral-400 focus:border-neutral-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-neutral-900/10 transition-all"
            />
          </div>

          {/* Controls: Filters & Toggle */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 text-xs text-neutral-700 focus:border-neutral-900 focus:outline-hidden"
            >
              <option value="All">All Statuses</option>
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Under Review">Under Review</option>
              <option value="Completed">Completed</option>
            </select>

            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 text-xs text-neutral-700 focus:border-neutral-900 focus:outline-hidden"
            >
              <option value="All">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 text-xs text-neutral-700 focus:border-neutral-900 focus:outline-hidden max-w-[150px] truncate"
            >
              <option value="All">All Projects</option>
              {uniqueProjects.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>

            {/* List / Card Toggle */}
            <div className="flex items-center rounded-lg border border-neutral-200 bg-neutral-50 p-0.5">
              <button
                onClick={() => setViewMode("list")}
                title="List view"
                className={`rounded-md p-1.5 transition-colors cursor-pointer ${
                  viewMode === "list"
                    ? "bg-white text-neutral-900 shadow-2xs font-semibold"
                    : "text-neutral-500 hover:text-neutral-900"
                }`}
              >
                <LayoutList className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("card")}
                title="Card / Grid view"
                className={`rounded-md p-1.5 transition-colors cursor-pointer ${
                  viewMode === "card"
                    ? "bg-white text-neutral-900 shadow-2xs font-semibold"
                    : "text-neutral-500 hover:text-neutral-900"
                }`}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Active Filter Chips & Task Counter */}
        <div className="mt-3 flex items-center justify-between text-xs text-neutral-500 border-t border-neutral-100 pt-2.5">
          <span>
            Showing <strong className="text-neutral-900 font-semibold">{filteredTasks.length}</strong> of{" "}
            {tasks.length} assigned tasks
          </span>
          {(selectedStatus !== "All" || selectedPriority !== "All" || selectedProject !== "All") && (
            <button
              onClick={() => {
                setSelectedStatus("All");
                setSelectedPriority("All");
                setSelectedProject("All");
                setSearchQuery("");
              }}
              className="text-neutral-900 hover:underline font-semibold cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Task Content: List View vs. Card View */}
      {viewMode === "list" ? (
        /* LIST VIEW */
        <div className="overflow-hidden rounded-xl border border-neutral-200/80 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-neutral-200/80 bg-neutral-50/70 text-neutral-500 font-mono text-[10px] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Task Title &amp; ID</th>
                  <th className="py-3 px-4">Project</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-neutral-400">
                      No tasks found matching your filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((task) => {
                    const priorityColor = {
                      High: "bg-rose-50 text-rose-700 border-rose-200",
                      Medium: "bg-amber-50 text-amber-700 border-amber-200",
                      Low: "bg-neutral-100 text-neutral-600 border-neutral-200",
                    }[task.priority];

                    const statusBadge = {
                      "Not Started": "bg-neutral-100 text-neutral-600 border border-neutral-200",
                      "In Progress": "bg-neutral-100 text-neutral-800 font-semibold border border-neutral-200",
                      "Under Review": "bg-amber-50 text-amber-800 font-semibold border border-amber-200",
                      Completed: "bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200",
                    }[task.status];

                    return (
                      <tr
                        key={task.id}
                        className="hover:bg-neutral-50/70 transition-colors group cursor-pointer"
                        onClick={() => onOpenTaskModal(task)}
                      >
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10.5px] font-semibold text-neutral-400">
                              {task.id}
                            </span>
                            {task.submission && (
                              <span className="rounded bg-emerald-50 px-1 py-0.2 text-[9px] font-semibold text-emerald-700 border border-emerald-200">
                                Submitted
                              </span>
                            )}
                          </div>
                          <p className="mt-0.5 font-semibold text-neutral-900 group-hover:text-neutral-600 transition-colors line-clamp-1">
                            {task.title}
                          </p>
                        </td>

                        <td className="py-3.5 px-4 text-neutral-600 font-medium max-w-[180px] truncate">
                          {task.project}
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`rounded border px-2 py-0.5 text-[10px] font-semibold ${priorityColor}`}
                          >
                            {task.priority}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-neutral-600 font-mono text-[11px]">
                          {task.dueDate}
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] ${statusBadge}`}
                          >
                            {task.status}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenTaskModal(task);
                            }}
                            className="rounded-lg bg-neutral-900 hover:bg-neutral-800 px-3 py-1 text-xs font-semibold text-white shadow-2xs transition-colors cursor-pointer"
                          >
                            View &amp; Submit
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* CARD / GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.map((task) => {
            const priorityColor = {
              High: "bg-rose-50 text-rose-700 border-rose-200",
              Medium: "bg-amber-50 text-amber-700 border-amber-200",
              Low: "bg-neutral-100 text-neutral-600 border-neutral-200",
            }[task.priority];

            const statusBadge = {
              "Not Started": "bg-neutral-100 text-neutral-600 border border-neutral-200",
              "In Progress": "bg-neutral-100 text-neutral-800 font-semibold border border-neutral-200",
              "Under Review": "bg-amber-50 text-amber-800 font-semibold border border-amber-200",
              Completed: "bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200",
            }[task.status];

            return (
              <div
                key={task.id}
                onClick={() => onOpenTaskModal(task)}
                className="rounded-xl border border-neutral-200/80 bg-white p-4 shadow-xs hover:border-neutral-400 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-mono text-neutral-400 font-semibold">{task.id}</span>
                    <span
                      className={`rounded border px-2 py-0.5 text-[9.5px] font-semibold ${priorityColor}`}
                    >
                      {task.priority} Priority
                    </span>
                  </div>

                  <h3 className="mt-2 text-sm font-bold text-neutral-900 group-hover:text-neutral-600 transition-colors line-clamp-2">
                    {task.title}
                  </h3>

                  <p className="mt-1 text-xs text-neutral-500 line-clamp-2 leading-relaxed">
                    {task.description}
                  </p>

                  <div className="mt-3 text-[11px] text-neutral-500 font-medium truncate">
                    Project: <span className="text-neutral-700">{task.project}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 font-mono">
                    <Clock className="h-3 w-3 text-neutral-400" />
                    <span>{task.dueDate}</span>
                  </div>

                  <span className={`rounded-full px-2 py-0.5 text-[10px] ${statusBadge}`}>
                    {task.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

