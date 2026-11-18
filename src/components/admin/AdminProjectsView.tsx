import { useState } from "react";
import {
  Briefcase,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ExternalLink,
  Edit3,
  Trash2,
  ArrowRight,
  User,
  DollarSign,
  ChevronRight,
  Layers,
  X,
  Check,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import {
  type AdminProject,
  type ProjectStage,
  saveProjectsList,
  fetchProjectsFromCloud,
} from "@/lib/admin-projects";
import { recordAdminLog } from "@/lib/admin-logs";

interface AdminProjectsViewProps {
  projects: AdminProject[];
  onProjectsChange: (updated: AdminProject[]) => void;
  adminEmail: string;
}

const STAGES: ProjectStage[] = [
  "Discovery",
  "Design & Wireframe",
  "In Development",
  "Client Review & QA",
  "Completed",
];

export function AdminProjectsView({
  projects,
  onProjectsChange,
  adminEmail,
}: AdminProjectsViewProps) {
  const [search, setSearch] = useState("");
  const [selectedStage, setSelectedStage] = useState<string>("All");
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<AdminProject | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Form states for New / Edit Project
  const [formTitle, setFormTitle] = useState("");
  const [formClientName, setFormClientName] = useState("");
  const [formClientEmail, setFormClientEmail] = useState("");
  const [formClientPhone, setFormClientPhone] = useState("");
  const [formServiceType, setFormServiceType] = useState<AdminProject["serviceType"]>("Custom Website");
  const [formBudget, setFormBudget] = useState(50000);
  const [formStage, setFormStage] = useState<ProjectStage>("Discovery");
  const [formProgress, setFormProgress] = useState(25);
  const [formDeliveryDate, setFormDeliveryDate] = useState("2026-12-15");
  const [formLiveUrl, setFormLiveUrl] = useState("");
  const [formLead, setFormLead] = useState("Gowthaman");
  const [formNotes, setFormNotes] = useState("");

  const filteredProjects = projects.filter((p) => {
    if (!p) return false;
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      String(p.title || "").toLowerCase().includes(q) ||
      String(p.clientName || "").toLowerCase().includes(q) ||
      String(p.serviceType || "").toLowerCase().includes(q);
    const matchesStage = selectedStage === "All" || p.stage === selectedStage;
    return matchesSearch && matchesStage;
  });

  const openNewModal = () => {
    setEditingProject(null);
    setFormTitle("");
    setFormClientName("");
    setFormClientEmail("");
    setFormClientPhone("");
    setFormServiceType("Custom Website");
    setFormBudget(50000);
    setFormStage("Discovery");
    setFormProgress(20);
    setFormDeliveryDate("2026-12-15");
    setFormLiveUrl("");
    setFormLead("Gowthaman");
    setFormNotes("");
    setIsModalOpen(true);
  };

  const openEditModal = (p: AdminProject) => {
    setEditingProject(p);
    setFormTitle(p.title);
    setFormClientName(p.clientName);
    setFormClientEmail(p.clientEmail);
    setFormClientPhone(p.clientPhone);
    setFormServiceType(p.serviceType);
    setFormBudget(p.budget);
    setFormStage(p.stage);
    setFormProgress(p.progressPercent);
    setFormDeliveryDate(p.targetDeliveryDate);
    setFormLiveUrl(p.liveUrl || "");
    setFormLead(p.assignedLead);
    setFormNotes(p.notes || "");
    setIsModalOpen(true);
  };

  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formClientName.trim()) {
      toast.error("Please provide both project title and client name");
      return;
    }

    if (editingProject) {
      const updated = projects.map((p) =>
        p.id === editingProject.id
          ? {
              ...p,
              title: formTitle,
              clientName: formClientName,
              clientEmail: formClientEmail,
              clientPhone: formClientPhone,
              serviceType: formServiceType,
              budget: Number(formBudget),
              stage: formStage,
              progressPercent: Number(formProgress),
              targetDeliveryDate: formDeliveryDate,
              liveUrl: formLiveUrl,
              assignedLead: formLead,
              notes: formNotes,
            }
          : p
      );
      onProjectsChange(updated);
      saveProjectsList(updated);
      recordAdminLog(adminEmail, "Updated Project", "Projects", `Updated project ${editingProject.id} (${formTitle})`);
      toast.success("Project updated successfully");
    } else {
      const newPrj: AdminProject = {
        id: `CM-PRJ-${Math.floor(100 + Math.random() * 900)}`,
        title: formTitle,
        clientName: formClientName,
        clientEmail: formClientEmail,
        clientPhone: formClientPhone,
        serviceType: formServiceType,
        budget: Number(formBudget),
        currency: "INR",
        stage: formStage,
        progressPercent: Number(formProgress),
        startDate: new Date().toISOString().split("T")[0]!,
        targetDeliveryDate: formDeliveryDate,
        liveUrl: formLiveUrl,
        assignedLead: formLead,
        milestones: [
          { id: "m1", title: "Project Scope & Requirement Signoff", completed: true },
          { id: "m2", title: "Core Architecture & Design Approval", completed: false },
          { id: "m3", title: "Final Deployment & Quality Verification", completed: false },
        ],
        notes: formNotes,
        createdAt: Date.now(),
      };
      const updated = [newPrj, ...projects];
      onProjectsChange(updated);
      saveProjectsList(updated);
      recordAdminLog(adminEmail, "Created Project", "Projects", `Created project ${newPrj.id} (${newPrj.title}) for ${formClientName}`);
      toast.success("New project created and tracked");
    }

    setIsModalOpen(false);
  };

  const handleDeleteProject = (id: string, title: string) => {
    if (!confirm(`Delete project "${title}"?`)) return;
    const updated = projects.filter((p) => p.id !== id);
    onProjectsChange(updated);
    saveProjectsList(updated);
    recordAdminLog(adminEmail, "Deleted Project", "Projects", `Deleted project ${id} (${title})`);
    toast.success("Project deleted");
  };

  const handleAdvanceStage = (p: AdminProject) => {
    const currentIndex = STAGES.indexOf(p.stage);
    if (currentIndex >= 0 && currentIndex < STAGES.length - 1) {
      const nextStage = STAGES[currentIndex + 1];
      if (nextStage) {
        const nextProgress = Math.min(100, Math.round(((currentIndex + 2) / STAGES.length) * 100));
        const updated = projects.map((item) =>
          item.id === p.id ? { ...item, stage: nextStage, progressPercent: nextProgress } : item
        );
        onProjectsChange(updated);
        saveProjectsList(updated);
        recordAdminLog(adminEmail, "Advanced Project Stage", "Projects", `Advanced ${p.id} to ${nextStage}`);
        toast.success(`Project moved to ${nextStage}`);
      }
    }
  };

  return (
    <div className="space-y-6 text-neutral-900">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-neutral-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-[11px] font-medium text-blue-800">
              <Briefcase className="h-3 w-3 text-blue-600" />
              Engineering &amp; Client Projects
            </span>
            <span className="text-xs text-neutral-400 font-mono">
              {projects.length} Total Engagements
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
            Projects &amp; Milestone Tracker
          </h1>
          <p className="mt-1 text-xs text-neutral-500">
            Manage client deliverables, milestone checklists, deadlines, and staging deployment links.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex rounded-xl border border-neutral-200 bg-neutral-100 p-1 text-xs">
            <button
              onClick={() => setViewMode("kanban")}
              className={`rounded-lg px-3 py-1 font-semibold transition-colors cursor-pointer ${
                viewMode === "kanban" ? "bg-white text-neutral-900 shadow-xs" : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              Kanban Board
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`rounded-lg px-3 py-1 font-semibold transition-colors cursor-pointer ${
                viewMode === "list" ? "bg-white text-neutral-900 shadow-xs" : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              Table List
            </button>
          </div>

          <button
            onClick={async () => {
              setIsRefreshing(true);
              try {
                const cloud = await fetchProjectsFromCloud();
                onProjectsChange(cloud);
                toast.success(`Projects refreshed (${cloud.length} total)`);
              } finally {
                setIsRefreshing(false);
              }
            }}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 px-3 py-2 text-xs font-semibold text-neutral-700 shadow-xs transition-colors cursor-pointer disabled:opacity-60"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-neutral-500 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={openNewModal}
            className="inline-flex items-center gap-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            New Project
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
          <input
            type="text"
            placeholder="Search projects by title, client name, or tech..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-neutral-200 bg-white pl-9 pr-4 py-2 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-1">
          {["All", ...STAGES].map((stage) => {
            const count =
              stage === "All"
                ? projects.length
                : projects.filter((p) => p.stage === stage).length;
            const active = selectedStage === stage;
            return (
              <button
                key={stage}
                onClick={() => setSelectedStage(stage)}
                className={`rounded-xl px-3 py-1 text-xs font-semibold transition-colors cursor-pointer border ${
                  active
                    ? "bg-neutral-900 text-white border-neutral-900"
                    : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50"
                }`}
              >
                {stage} <span className="opacity-60 ml-0.5">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* KANBAN / LIST VIEW or CLEAN PRODUCTION EMPTY STATE */}
      {projects.length === 0 ? (
        <div className="rounded-2xl border border-neutral-200 bg-white p-12 text-center shadow-xs space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-200">
            <Briefcase className="h-7 w-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-neutral-900">No Client Projects Yet</h3>
            <p className="mt-1 text-xs text-neutral-500 max-w-md mx-auto leading-relaxed">
              When you onboard a client or confirm a project from an inquiry, click <strong>"+ New Project"</strong> to track deliverables, budget in ₹, and staging deployment links.
            </p>
          </div>
          <button
            onClick={openNewModal}
            className="inline-flex items-center gap-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 px-4 py-2.5 text-xs font-semibold text-white shadow-xs cursor-pointer transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Initialize First Project
          </button>
        </div>
      ) : viewMode === "kanban" ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5 items-start">
          {STAGES.map((stage) => {
            const stageProjects = filteredProjects.filter((p) => p.stage === stage);
            return (
              <div key={stage} className="rounded-2xl border border-neutral-200 bg-neutral-50/70 p-3 flex flex-col min-h-[500px]">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
                  <span className="text-xs font-bold text-neutral-900">{stage}</span>
                  <span className="rounded-full bg-neutral-200 px-2 py-0.5 text-[11px] font-mono font-semibold text-neutral-700">
                    {stageProjects.length}
                  </span>
                </div>

                <div className="mt-3 space-y-3 flex-1">
                  {stageProjects.length === 0 ? (
                    <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-neutral-300 text-center p-3">
                      <p className="text-[11px] text-neutral-400 font-medium">No projects in this stage</p>
                    </div>
                  ) : (
                    stageProjects.map((p) => (
                      <div
                        key={p.id}
                        className="rounded-xl border border-neutral-200 bg-white p-4 shadow-xs hover:border-blue-300 hover:shadow-md transition-all space-y-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="inline-block rounded-md bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-bold text-blue-800">
                            {p.serviceType}
                          </span>
                          <span className="text-[10px] font-mono text-neutral-700 font-bold">
                            ₹{p.budget.toLocaleString("en-IN")}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-xs font-bold text-neutral-900 line-clamp-1">{p.title}</h4>
                          <p className="text-[11px] text-neutral-500 mt-0.5 flex items-center gap-1">
                            <User className="h-3 w-3" /> {p.clientName}
                          </p>
                        </div>

                        {/* Progress bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] text-neutral-500 font-medium">
                            <span>Progress</span>
                            <span className="font-bold text-neutral-900">{p.progressPercent}%</span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-neutral-100 overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full transition-all"
                              style={{ width: `${p.progressPercent}%` }}
                            />
                          </div>
                        </div>

                        {/* Staging / Milestones info */}
                        <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-[10px] text-neutral-500">
                          <span className="flex items-center gap-1 font-mono">
                            <Clock className="h-3 w-3" /> Due {p.targetDeliveryDate}
                          </span>
                          {p.liveUrl && (
                            <a
                              href={p.liveUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 hover:underline flex items-center gap-0.5 font-semibold"
                            >
                              Live <ExternalLink className="h-2.5 w-2.5" />
                            </a>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="pt-2 border-t border-neutral-100 flex items-center justify-between gap-1">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => openEditModal(p)}
                              className="p-1 rounded-md text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
                              title="Edit project"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProject(p.id, p.title)}
                              className="p-1 rounded-md text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="Delete project"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          {stage !== "Completed" && (
                            <button
                              onClick={() => handleAdvanceStage(p)}
                              className="inline-flex items-center gap-1 rounded-md bg-neutral-100 hover:bg-neutral-900 hover:text-white px-2 py-1 text-[10px] font-semibold text-neutral-700 transition-colors cursor-pointer"
                              title="Advance to next stage"
                            >
                              Next <ArrowRight className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-neutral-200 bg-white overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-neutral-200 bg-neutral-50 font-semibold text-neutral-500 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">Project &amp; ID</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Service</th>
                  <th className="px-4 py-3">Budget</th>
                  <th className="px-4 py-3">Stage</th>
                  <th className="px-4 py-3">Progress</th>
                  <th className="px-4 py-3">Target Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredProjects.map((p) => (
                  <tr key={p.id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-neutral-900">{p.title}</div>
                      <div className="text-[11px] font-mono text-neutral-400">{p.id}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-neutral-800">{p.clientName}</div>
                      <div className="text-[11px] text-neutral-500">{p.clientPhone}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="rounded-md bg-blue-50 border border-blue-200 px-2 py-0.5 text-[11px] font-semibold text-blue-800">
                        {p.serviceType}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-mono font-bold text-neutral-900">
                      ₹{p.budget.toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="rounded-md bg-neutral-100 px-2 py-0.5 text-[11px] font-semibold text-neutral-700">
                        {p.stage}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-16 rounded-full bg-neutral-100 overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${p.progressPercent}%` }}
                          />
                        </div>
                        <span className="font-mono text-[11px] font-bold text-neutral-700">{p.progressPercent}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-neutral-500">
                      {p.targetDeliveryDate}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(p)}
                          className="rounded-md p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProject(p.id, p.title)}
                          className="rounded-md p-1.5 text-neutral-400 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-xl rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
              <h3 className="text-base font-bold text-neutral-900">
                {editingProject ? `Edit Project: ${editingProject.id}` : "Initialize New Client Project"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-neutral-400 hover:text-neutral-900"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProject} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="font-bold text-neutral-800 block mb-1">Project Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Modern Retail POS Counter & Cloud Sync"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-900 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-neutral-800 block mb-1">Client Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Royal Textiles"
                    value={formClientName}
                    onChange={(e) => setFormClientName(e.target.value)}
                    className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-900 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="font-bold text-neutral-800 block mb-1">Client Phone</label>
                  <input
                    type="text"
                    placeholder="+91 98401 23456"
                    value={formClientPhone}
                    onChange={(e) => setFormClientPhone(e.target.value)}
                    className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-900 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-neutral-800 block mb-1">Service Category</label>
                  <select
                    value={formServiceType}
                    onChange={(e) => setFormServiceType(e.target.value as any)}
                    className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-900"
                  >
                    <option value="Custom Website">Custom Website</option>
                    <option value="Mobile App">Mobile App (iOS/Android)</option>
                    <option value="Shop Billing POS">Shop Billing POS</option>
                    <option value="Video Editing & Reels">Video Editing &amp; Reels</option>
                    <option value="Custom Software / ERP">Custom Software / ERP</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-neutral-800 block mb-1">Budget (INR ₹)</label>
                  <input
                    type="number"
                    value={formBudget}
                    onChange={(e) => setFormBudget(Number(e.target.value))}
                    className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-neutral-800 block mb-1">Stage</label>
                  <select
                    value={formStage}
                    onChange={(e) => setFormStage(e.target.value as ProjectStage)}
                    className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-900"
                  >
                    {STAGES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-neutral-800 block mb-1">Progress (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formProgress}
                    onChange={(e) => setFormProgress(Number(e.target.value))}
                    className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-neutral-800 block mb-1">Target Delivery</label>
                  <input
                    type="date"
                    value={formDeliveryDate}
                    onChange={(e) => setFormDeliveryDate(e.target.value)}
                    className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-neutral-800 block mb-1">Live Demo / Staging URL</label>
                  <input
                    type="url"
                    placeholder="https://client-preview.crearemind.in"
                    value={formLiveUrl}
                    onChange={(e) => setFormLiveUrl(e.target.value)}
                    className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-neutral-800 block mb-1">Assigned Lead Engineer</label>
                  <select
                    value={formLead}
                    onChange={(e) => setFormLead(e.target.value)}
                    className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-900"
                  >
                    <option value="Gowthaman">Gowthaman (Lead Architect)</option>
                    <option value="Dheepan Raj">Dheepan Raj (Co-Founder &amp; Ops)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-neutral-800 block mb-1">Technical Notes / Specs</label>
                <textarea
                  rows={3}
                  placeholder="Key milestones, specific hardware integrations, thermal printer models, or API endpoints..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 px-4 py-2 font-semibold text-neutral-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-neutral-900 hover:bg-neutral-800 px-5 py-2 font-semibold text-white"
                >
                  {editingProject ? "Update Project" : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
