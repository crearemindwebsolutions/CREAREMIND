import React, { useState, useEffect } from "react";
import {
  FolderKanban,
  Users,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
  GitBranch,
  FileCode,
  Sparkles,
  BookOpen,
  X,
  Target,
} from "lucide-react";
import type { InternProject } from "@/lib/intern-data";

interface InternProjectsViewProps {
  projects: InternProject[];
  onOpenProjectModal: (proj: InternProject) => void;
}

export function InternProjectsView({
  projects,
  onOpenProjectModal,
}: InternProjectsViewProps) {
  const [selectedProject, setSelectedProject] = useState<InternProject | null>(projects[0] || null);

  // Sync selectedProject if projects array changes
  useEffect(() => {
    if (!selectedProject && projects.length > 0) {
      setSelectedProject(projects[0]);
    }
  }, [projects, selectedProject]);

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="rounded-xl border border-neutral-200/80 bg-white p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-2.5 py-0.5 text-[11px] font-semibold text-neutral-800 border border-neutral-200">
              <FolderKanban className="h-3 w-3 text-neutral-700" />
              <span>Assigned Workspaces</span>
            </div>
            <h2 className="mt-2 text-lg sm:text-xl font-bold text-neutral-900">
              Active Project Workspaces
            </h2>
            <p className="mt-0.5 text-xs text-neutral-500">
              High-velocity digital engineering initiatives you are actively contributing to at Creare Mind.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs font-semibold text-neutral-700">
              {projects.length} Active {projects.length === 1 ? "Initiative" : "Initiatives"} Assigned
            </span>
          </div>
        </div>

        {/* Project Selector Tabs */}
        {projects.length > 0 && (
          <div className="mt-5 flex gap-2 border-b border-neutral-200 overflow-x-auto pb-1">
            {projects.map((proj) => {
              const isSelected = selectedProject?.id === proj.id;
              return (
                <button
                  key={proj.id}
                  onClick={() => setSelectedProject(proj)}
                  className={`flex items-center gap-2 border-b-2 px-3 py-2 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? "border-neutral-900 text-neutral-900"
                      : "border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-800"
                  }`}
                >
                  <span className="font-mono text-[10px] opacity-75">{proj.id}</span>
                  <span>{proj.name}</span>
                  <span className="rounded-full bg-neutral-100 px-1.5 py-0.2 text-[9.5px] font-mono text-neutral-600">
                    {proj.progress}%
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* When no projects assigned */}
      {projects.length === 0 || !selectedProject ? (
        <div className="rounded-2xl border border-neutral-200/80 bg-white p-12 text-center shadow-xs space-y-3">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-neutral-100 text-neutral-600">
            <FolderKanban className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-neutral-900">No Projects Assigned Yet</h3>
          <p className="max-w-md mx-auto text-xs text-neutral-500 leading-relaxed">
            You have not been assigned to a client initiative or studio project yet. When your engineering mentor attaches you to a codebase, its workspace, sprint milestones, and team members will appear here.
          </p>
        </div>
      ) : (
        /* Selected Project Full Workspace Detail */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Overview, Objectives, Milestones */}
        <div className="space-y-6 lg:col-span-2">
          {/* Main Info */}
          <div className="rounded-xl border border-neutral-200/80 bg-white p-5 shadow-xs space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <span className="rounded bg-neutral-100 px-2 py-0.5 font-mono text-[10px] font-semibold text-neutral-600">
                  {selectedProject.id} &bull; {selectedProject.status}
                </span>
                <h3 className="mt-2 text-lg font-bold text-neutral-900">
                  {selectedProject.name}
                </h3>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-neutral-400 block font-mono">TARGET LAUNCH</span>
                <span className="text-xs font-bold text-neutral-900 font-mono">
                  {selectedProject.deadline}
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed bg-neutral-50/60 p-4 rounded-xl border border-neutral-200/60">
              {selectedProject.description}
            </p>

            {/* Overall Progress */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-neutral-800 mb-1.5">
                <span>Production Completion</span>
                <span className="text-neutral-900 font-bold font-mono">
                  {selectedProject.progress}%
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-neutral-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-neutral-900 transition-all duration-700"
                  style={{ width: `${selectedProject.progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Milestones & Sprint Target Breakdown */}
          <div className="rounded-xl border border-neutral-200/80 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-neutral-900" />
                <h4 className="text-sm font-bold text-neutral-900">Sprint Milestones</h4>
              </div>
              <span className="text-[11px] text-neutral-400 font-mono">
                {selectedProject.milestones.filter((m) => m.completed).length}/
                {selectedProject.milestones.length} Completed
              </span>
            </div>

            <div className="mt-4 space-y-2.5">
              {selectedProject.milestones.map((milestone, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                    milestone.completed
                      ? "border-emerald-200 bg-emerald-50/40 text-neutral-800"
                      : "border-neutral-200 bg-white hover:border-neutral-300"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`grid h-5 w-5 place-items-center rounded-full text-white text-[10px] ${
                        milestone.completed ? "bg-emerald-600" : "bg-neutral-200 text-neutral-500"
                      }`}
                    >
                      {milestone.completed ? (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      ) : (
                        <span>{i + 1}</span>
                      )}
                    </div>
                    <span className="text-xs font-semibold">{milestone.title}</span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] font-mono">
                    <Clock className="h-3 w-3 text-neutral-400" />
                    <span className={milestone.completed ? "text-emerald-700" : "text-neutral-500"}>
                      {milestone.completed ? "Verified" : milestone.dueDate}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Team & Shared Resources */}
        <div className="space-y-6">
          {/* Team Members & Mentor */}
          <div className="rounded-xl border border-neutral-200/80 bg-white p-5 shadow-xs">
            <h4 className="text-sm font-bold text-neutral-900 flex items-center gap-2 border-b border-neutral-100 pb-3">
              <Users className="h-4 w-4 text-neutral-900" />
              Assigned Team &amp; Mentor
            </h4>

            <div className="mt-3.5 space-y-3">
              {selectedProject.teamMembers.map((member, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="grid h-8 w-8 place-items-center rounded-full bg-neutral-900 text-white text-xs font-bold ring-1 ring-neutral-800 shrink-0 font-mono">
                    {member.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-neutral-900 truncate">
                      {member.name}
                    </p>
                    <p className="text-[10.5px] text-neutral-500">{member.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shared Project Resources */}
          <div className="rounded-xl border border-neutral-200/80 bg-white p-5 shadow-xs">
            <h4 className="text-sm font-bold text-neutral-900 flex items-center gap-2 border-b border-neutral-100 pb-3">
              <BookOpen className="h-4 w-4 text-neutral-900" />
              Shared Project Resources
            </h4>

            <div className="mt-3.5 space-y-2">
              {selectedProject.resources.map((res, idx) => (
                <a
                  key={idx}
                  href={res.url}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => {
                    if (res.url === "#") {
                      e.preventDefault();
                      alert(`Accessing ${res.name} (${res.type}) for ${selectedProject.name}`);
                    }
                  }}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300 transition-colors group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="grid h-6 w-6 place-items-center rounded bg-neutral-100 text-neutral-800 text-[10px] font-mono group-hover:bg-neutral-900 group-hover:text-white transition-colors">
                      {res.type[0]}
                    </div>
                    <span className="text-xs font-semibold text-neutral-800 truncate group-hover:text-neutral-950">
                      {res.name}
                    </span>
                  </div>
                  <ExternalLink className="h-3.5 w-3.5 text-neutral-400 group-hover:text-neutral-900 shrink-0" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}

