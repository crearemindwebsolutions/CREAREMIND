import { useState } from "react";
import {
  Sparkles,
  Users,
  Plus,
  Trash2,
  Edit2,
  Check,
  ExternalLink,
  RotateCcw,
  Save,
  Globe,
  Award,
  BookOpen,
  CheckCircle2,
  Linkedin,
  Instagram,
  Mail,
  X,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import {
  DEFAULT_SITE_CONTENT,
  type SiteContent,
  type AboutContentData,
  type FounderData,
  type AboutValueData,
  type AboutPrincipleData,
} from "@/lib/site-content";

interface AdminAboutPageViewProps {
  content: SiteContent;
  onUpdate: (section: "about", data: AboutContentData) => void;
}

export function AdminAboutPageView({ content, onUpdate }: AdminAboutPageViewProps) {
  const initialAbout: AboutContentData = content.about || DEFAULT_SITE_CONTENT.about;
  const [aboutData, setAboutData] = useState<AboutContentData>(initialAbout);

  // Active sub-tab inside the About editor
  const [subTab, setSubTab] = useState<"founders" | "mission" | "values" | "principles" | "cta">("founders");

  // Founder editing state
  const [editingFounderIndex, setEditingFounderIndex] = useState<number | null>(null);
  const [founderModalOpen, setFounderModalOpen] = useState(false);
  const [founderForm, setFounderForm] = useState<FounderData>({
    id: "",
    name: "",
    role: "",
    badge: "",
    tagline: "",
    image: "",
    bio: "",
    quote: "",
    quoteDesc: "",
    focus: [],
    email: "",
    linkedin: "",
    instagram: "",
  });
  const [newFocusTag, setNewFocusTag] = useState("");

  // Value editing state
  const [editingValueIndex, setEditingValueIndex] = useState<number | null>(null);
  const [valueModalOpen, setValueModalOpen] = useState(false);
  const [valueForm, setValueForm] = useState<AboutValueData>({ title: "", desc: "" });

  // Principle editing state
  const [editingPrincipleIndex, setEditingPrincipleIndex] = useState<number | null>(null);
  const [principleModalOpen, setPrincipleModalOpen] = useState(false);
  const [principleForm, setPrincipleForm] = useState<AboutPrincipleData>({ title: "", desc: "" });

  // Handle Save
  const handleSave = (updated?: AboutContentData) => {
    const toSave = updated || aboutData;
    onUpdate("about", toSave);
    toast.success("About page published and synced to cloud successfully!");
  };

  // Reset
  const handleReset = () => {
    if (confirm("Reset the About page content back to studio defaults?")) {
      setAboutData(DEFAULT_SITE_CONTENT.about);
      onUpdate("about", DEFAULT_SITE_CONTENT.about);
      toast.success("About page reset to studio defaults.");
    }
  };

  // Open Founder Modal
  const openEditFounder = (index: number) => {
    setEditingFounderIndex(index);
    setFounderForm({ ...aboutData.founders[index] });
    setFounderModalOpen(true);
  };

  const openNewFounder = () => {
    setEditingFounderIndex(null);
    setFounderForm({
      id: `founder-${Date.now()}`,
      name: "",
      role: "Lead Software Architect",
      badge: "LEAD ARCHITECT",
      tagline: "Software Engineer • Creare Mind",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80",
      bio: "Passionate software engineer building high-impact digital systems.",
      quote: "Crafting robust software with speed and precision.",
      quoteDesc: "Great software turns bold ideas into scalable reality.",
      focus: ["Full-Stack Web", "API Architecture", "Cloud Systems"],
      email: "crearemindwebsolutions@gmail.com",
      linkedin: "https://www.linkedin.com/company/creare-mind/",
      instagram: "https://www.instagram.com/crearemind.in",
    });
    setFounderModalOpen(true);
  };

  const handleSaveFounder = () => {
    if (!founderForm.name.trim()) {
      toast.error("Please enter a founder or leader name.");
      return;
    }
    const updatedFounders = [...aboutData.founders];
    if (editingFounderIndex !== null) {
      updatedFounders[editingFounderIndex] = founderForm;
    } else {
      updatedFounders.push(founderForm);
    }
    const updated = { ...aboutData, founders: updatedFounders };
    setAboutData(updated);
    setFounderModalOpen(false);
    handleSave(updated);
  };

  const handleDeleteFounder = (index: number) => {
    if (!confirm(`Delete ${aboutData.founders[index]?.name || "this leader"}?`)) return;
    const updatedFounders = aboutData.founders.filter((_, i) => i !== index);
    const updated = { ...aboutData, founders: updatedFounders };
    setAboutData(updated);
    handleSave(updated);
  };

  // Add Focus Tag chip
  const handleAddFocusTag = () => {
    if (!newFocusTag.trim()) return;
    if (!founderForm.focus.includes(newFocusTag.trim())) {
      setFounderForm({ ...founderForm, focus: [...founderForm.focus, newFocusTag.trim()] });
    }
    setNewFocusTag("");
  };

  const handleRemoveFocusTag = (tag: string) => {
    setFounderForm({
      ...founderForm,
      focus: founderForm.focus.filter((t) => t !== tag),
    });
  };

  // Value Handlers
  const openEditValue = (idx: number) => {
    setEditingValueIndex(idx);
    setValueForm({ ...aboutData.values[idx] });
    setValueModalOpen(true);
  };

  const openNewValue = () => {
    setEditingValueIndex(null);
    setValueForm({ title: "", desc: "" });
    setValueModalOpen(true);
  };

  const handleSaveValue = () => {
    if (!valueForm.title.trim()) {
      toast.error("Please enter a value title.");
      return;
    }
    const updatedValues = [...aboutData.values];
    if (editingValueIndex !== null) {
      updatedValues[editingValueIndex] = valueForm;
    } else {
      updatedValues.push(valueForm);
    }
    const updated = { ...aboutData, values: updatedValues };
    setAboutData(updated);
    setValueModalOpen(false);
    handleSave(updated);
  };

  const handleDeleteValue = (idx: number) => {
    const updatedValues = aboutData.values.filter((_, i) => i !== idx);
    const updated = { ...aboutData, values: updatedValues };
    setAboutData(updated);
    handleSave(updated);
  };

  // Principle Handlers
  const openEditPrinciple = (idx: number) => {
    setEditingPrincipleIndex(idx);
    setPrincipleForm({ ...aboutData.principles[idx] });
    setPrincipleModalOpen(true);
  };

  const openNewPrinciple = () => {
    setEditingPrincipleIndex(null);
    setPrincipleForm({ title: "", desc: "" });
    setPrincipleModalOpen(true);
  };

  const handleSavePrinciple = () => {
    if (!principleForm.title.trim()) {
      toast.error("Please enter a principle title.");
      return;
    }
    const updatedPrinciples = [...aboutData.principles];
    if (editingPrincipleIndex !== null) {
      updatedPrinciples[editingPrincipleIndex] = principleForm;
    } else {
      updatedPrinciples.push(principleForm);
    }
    const updated = { ...aboutData, principles: updatedPrinciples };
    setAboutData(updated);
    setPrincipleModalOpen(false);
    handleSave(updated);
  };

  const handleDeletePrinciple = (idx: number) => {
    const updatedPrinciples = aboutData.principles.filter((_, i) => i !== idx);
    const updated = { ...aboutData, principles: updatedPrinciples };
    setAboutData(updated);
    handleSave(updated);
  };

  return (
    <div className="space-y-6 text-neutral-900">
      {/* Top Banner & Action Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-neutral-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 text-[11px] font-medium text-indigo-800">
              <Award className="h-3 w-3 text-indigo-600" />
              Website CMS
            </span>
            <span className="text-xs text-neutral-400 font-mono">/about Page</span>
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
            About Us &amp; Founders Management
          </h1>
          <p className="mt-1 text-xs text-neutral-500">
            Edit leadership profiles, company story, core values, and working principles displayed on the public /about page.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href="/about"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 shadow-2xs transition-all cursor-pointer"
          >
            <Globe className="h-3.5 w-3.5" />
            <span>View Live Page</span>
            <ExternalLink className="h-3 w-3 text-neutral-400" />
          </a>

          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-50 shadow-2xs transition-all cursor-pointer"
            title="Reset to studio defaults"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={() => handleSave()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-neutral-900 text-white px-4 py-2 text-xs font-semibold shadow-xs hover:bg-black transition-all cursor-pointer"
          >
            <Save className="h-3.5 w-3.5" />
            <span>Publish Changes</span>
          </button>
        </div>
      </div>

      {/* Sub-navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-neutral-200 pb-3">
        {[
          { id: "founders", label: "Founders & Leadership", icon: Users, count: aboutData.founders.length },
          { id: "mission", label: "Origin & Mission Story", icon: BookOpen },
          { id: "values", label: "Core Values", icon: Sparkles, count: aboutData.values.length },
          { id: "principles", label: "Working Principles", icon: CheckCircle2, count: aboutData.principles.length },
          { id: "cta", label: "Closing CTA", icon: ArrowRight },
        ].map((t) => {
          const Icon = t.icon;
          const active = subTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setSubTab(t.id as any)}
              className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-medium transition-all cursor-pointer ${
                active
                  ? "bg-neutral-900 text-white font-semibold shadow-xs"
                  : "bg-white text-neutral-600 border border-neutral-200/80 hover:bg-neutral-50 hover:text-neutral-900"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{t.label}</span>
              {typeof t.count === "number" && (
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${active ? "bg-white/20 text-white" : "bg-neutral-100 text-neutral-600"}`}>
                  {t.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ─── TAB 1: FOUNDERS & LEADERSHIP ─── */}
      {subTab === "founders" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-500">
              Section Header &amp; Subtitle
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Section Badge</label>
                <input
                  type="text"
                  value={aboutData.badge}
                  onChange={(e) => setAboutData({ ...aboutData, badge: e.target.value })}
                  className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-xs text-neutral-900 focus:border-neutral-900 outline-none"
                  placeholder="e.g. Leadership & Vision"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Section Title</label>
                <input
                  type="text"
                  value={aboutData.heading}
                  onChange={(e) => setAboutData({ ...aboutData, heading: e.target.value })}
                  className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-xs text-neutral-900 focus:border-neutral-900 outline-none"
                  placeholder="e.g. Meet our founder & leadership"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Section Subtitle</label>
                <input
                  type="text"
                  value={aboutData.subtitle}
                  onChange={(e) => setAboutData({ ...aboutData, subtitle: e.target.value })}
                  className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-xs text-neutral-900 focus:border-neutral-900 outline-none"
                  placeholder="e.g. Architects and strategists with hands-on experience scaling systems..."
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-neutral-900">
              Leadership Profiles ({aboutData.founders.length})
            </h3>
            <button
              type="button"
              onClick={openNewFounder}
              className="inline-flex items-center gap-1.5 rounded-xl bg-neutral-900 text-white px-3.5 py-1.5 text-xs font-semibold hover:bg-black transition-all cursor-pointer shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Leader / Founder</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {aboutData.founders.map((f, idx) => (
              <div
                key={f.id || f.name || idx}
                className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-neutral-300 transition-all"
              >
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <img
                      src={f.image}
                      alt={f.name}
                      className="h-20 w-16 rounded-xl object-cover border border-neutral-200 shrink-0 bg-neutral-100"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="inline-block rounded-md bg-neutral-100 text-neutral-800 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider mb-1">
                        {f.badge || "LEADER"}
                      </span>
                      <h4 className="text-base font-bold text-neutral-900 truncate">{f.name}</h4>
                      <p className="text-xs font-medium text-neutral-600 truncate">{f.role}</p>
                      {f.email && <p className="text-[11px] text-neutral-400 truncate mt-0.5">{f.email}</p>}
                    </div>
                  </div>

                  <p className="text-xs text-neutral-600 line-clamp-3 leading-relaxed">{f.bio}</p>

                  {f.focus && f.focus.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {f.focus.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-neutral-100 text-neutral-700 px-2 py-0.5 text-[10px] font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between border-t border-neutral-100 pt-3">
                  <div className="flex items-center gap-2">
                    {f.linkedin && <Linkedin className="h-3.5 w-3.5 text-neutral-400" />}
                    {f.instagram && <Instagram className="h-3.5 w-3.5 text-neutral-400" />}
                    {f.email && <Mail className="h-3.5 w-3.5 text-neutral-400" />}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEditFounder(idx)}
                      className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 px-2.5 py-1 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
                    >
                      <Edit2 className="h-3 w-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteFounder(idx)}
                      className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── TAB 2: MISSION & ORIGIN STORY ─── */}
      {subTab === "mission" && (
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs space-y-5">
          <div>
            <h3 className="text-base font-bold text-neutral-900">Our Origin &amp; Mission Story</h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Edit the brand narrative explaining why Creare Mind was founded and how we partner with ambitious businesses.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Origin Eyebrow Badge</label>
              <input
                type="text"
                value={aboutData.originBadge}
                onChange={(e) => setAboutData({ ...aboutData, originBadge: e.target.value })}
                className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-xs text-neutral-900 focus:border-neutral-900 outline-none"
                placeholder="e.g. Our Origin & Mission"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Story Main Heading</label>
              <input
                type="text"
                value={aboutData.originHeading}
                onChange={(e) => setAboutData({ ...aboutData, originHeading: e.target.value })}
                className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-xs text-neutral-900 focus:border-neutral-900 outline-none"
                placeholder="e.g. Why we built Creare Mind"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-neutral-700 mb-1">First Story Paragraph</label>
              <textarea
                rows={3}
                value={aboutData.originParagraph1}
                onChange={(e) => setAboutData({ ...aboutData, originParagraph1: e.target.value })}
                className="w-full rounded-xl border border-neutral-200 p-3 text-xs text-neutral-900 focus:border-neutral-900 outline-none resize-none"
                placeholder="First narrative paragraph..."
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Second Story Paragraph</label>
              <textarea
                rows={3}
                value={aboutData.originParagraph2}
                onChange={(e) => setAboutData({ ...aboutData, originParagraph2: e.target.value })}
                className="w-full rounded-xl border border-neutral-200 p-3 text-xs text-neutral-900 focus:border-neutral-900 outline-none resize-none"
                placeholder="Second narrative paragraph..."
              />
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 3: CORE VALUES ─── */}
      {subTab === "values" && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-neutral-900">Core Values ({aboutData.values.length})</h3>
              <p className="text-xs text-neutral-500">The founding principles that guide our architecture and engineering cadence.</p>
            </div>
            <button
              type="button"
              onClick={openNewValue}
              className="inline-flex items-center gap-1.5 rounded-xl bg-neutral-900 text-white px-3.5 py-1.5 text-xs font-semibold hover:bg-black transition-all cursor-pointer shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Value</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {aboutData.values.map((v, idx) => (
              <div
                key={v.id || v.title || idx}
                className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs flex flex-col justify-between space-y-3"
              >
                <div>
                  <h4 className="text-sm font-bold text-neutral-900">{v.title}</h4>
                  <p className="text-xs text-neutral-600 mt-1 leading-relaxed">{v.desc}</p>
                </div>
                <div className="flex items-center justify-end gap-2 border-t border-neutral-100 pt-3">
                  <button
                    type="button"
                    onClick={() => openEditValue(idx)}
                    className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 px-2.5 py-1 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
                  >
                    <Edit2 className="h-3 w-3" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteValue(idx)}
                    className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── TAB 4: WORKING PRINCIPLES ─── */}
      {subTab === "principles" && (
        <div className="space-y-5">
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-500">
              Section Header &amp; Subtitle
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Principles Eyebrow Badge</label>
                <input
                  type="text"
                  value={aboutData.principlesBadge}
                  onChange={(e) => setAboutData({ ...aboutData, principlesBadge: e.target.value })}
                  className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-xs text-neutral-900 focus:border-neutral-900 outline-none"
                  placeholder="e.g. Our Principles"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Principles Heading</label>
                <input
                  type="text"
                  value={aboutData.principlesHeading}
                  onChange={(e) => setAboutData({ ...aboutData, principlesHeading: e.target.value })}
                  className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-xs text-neutral-900 focus:border-neutral-900 outline-none"
                  placeholder="e.g. How we work with our clients"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Principles Subtitle</label>
                <input
                  type="text"
                  value={aboutData.principlesSubtitle}
                  onChange={(e) => setAboutData({ ...aboutData, principlesSubtitle: e.target.value })}
                  className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-xs text-neutral-900 focus:border-neutral-900 outline-none"
                  placeholder="e.g. Clear commitments that eliminate risk, delay, and miscommunication."
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-neutral-900">Client Commitments ({aboutData.principles.length})</h3>
              <p className="text-xs text-neutral-500">The 4 commitments that eliminate delay and guarantee production stability.</p>
            </div>
            <button
              type="button"
              onClick={openNewPrinciple}
              className="inline-flex items-center gap-1.5 rounded-xl bg-neutral-900 text-white px-3.5 py-1.5 text-xs font-semibold hover:bg-black transition-all cursor-pointer shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Principle</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {aboutData.principles.map((c, idx) => (
              <div
                key={c.id || c.title || idx}
                className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-xs flex flex-col justify-between space-y-3"
              >
                <div>
                  <h4 className="text-sm font-bold text-neutral-900">{c.title}</h4>
                  <p className="text-xs text-neutral-600 mt-1 leading-relaxed">{c.desc}</p>
                </div>
                <div className="flex items-center justify-end gap-2 border-t border-neutral-100 pt-2.5">
                  <button
                    type="button"
                    onClick={() => openEditPrinciple(idx)}
                    className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 px-2 py-0.5 text-[11px] font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
                  >
                    <Edit2 className="h-3 w-3" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeletePrinciple(idx)}
                    className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2 py-0.5 text-[11px] font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── TAB 5: CLOSING CALL TO ACTION (CTA) ─── */}
      {subTab === "cta" && (
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs space-y-5">
          <div>
            <h3 className="text-base font-bold text-neutral-900">Closing CTA Banner</h3>
            <p className="text-xs text-neutral-500">
              Customize the closing invitation banner and buttons at the bottom of the /about page.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">CTA Eyebrow Badge</label>
              <input
                type="text"
                value={aboutData.ctaBadge}
                onChange={(e) => setAboutData({ ...aboutData, ctaBadge: e.target.value })}
                className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-xs text-neutral-900 focus:border-neutral-900 outline-none"
                placeholder="e.g. Start Your Project"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">CTA Main Heading</label>
              <input
                type="text"
                value={aboutData.ctaHeading}
                onChange={(e) => setAboutData({ ...aboutData, ctaHeading: e.target.value })}
                className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-xs text-neutral-900 focus:border-neutral-900 outline-none"
                placeholder="e.g. Ready to build something extraordinary?"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-neutral-700 mb-1">CTA Subtitle Description</label>
              <input
                type="text"
                value={aboutData.ctaSubtitle}
                onChange={(e) => setAboutData({ ...aboutData, ctaSubtitle: e.target.value })}
                className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-xs text-neutral-900 focus:border-neutral-900 outline-none"
                placeholder="e.g. Let's discuss your requirements..."
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Primary Button Text</label>
              <input
                type="text"
                value={aboutData.ctaPrimaryText}
                onChange={(e) => setAboutData({ ...aboutData, ctaPrimaryText: e.target.value })}
                className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-xs text-neutral-900 focus:border-neutral-900 outline-none"
                placeholder="e.g. Start a Conversation"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Primary Button Link</label>
              <input
                type="text"
                value={aboutData.ctaPrimaryLink}
                onChange={(e) => setAboutData({ ...aboutData, ctaPrimaryLink: e.target.value })}
                className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-xs text-neutral-900 focus:border-neutral-900 outline-none"
                placeholder="e.g. /contact"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Secondary Button Text</label>
              <input
                type="text"
                value={aboutData.ctaSecondaryText}
                onChange={(e) => setAboutData({ ...aboutData, ctaSecondaryText: e.target.value })}
                className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-xs text-neutral-900 focus:border-neutral-900 outline-none"
                placeholder="e.g. Explore All Services"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Secondary Button Link</label>
              <input
                type="text"
                value={aboutData.ctaSecondaryLink}
                onChange={(e) => setAboutData({ ...aboutData, ctaSecondaryLink: e.target.value })}
                className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-xs text-neutral-900 focus:border-neutral-900 outline-none"
                placeholder="e.g. /services"
              />
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: EDIT / ADD FOUNDER ─── */}
      {founderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl space-y-5 my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="text-base font-bold text-neutral-900">
                {editingFounderIndex !== null ? "Edit Leader Profile" : "Add Leader / Founder"}
              </h3>
              <button
                type="button"
                onClick={() => setFounderModalOpen(false)}
                className="rounded-lg p-1 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={founderForm.name}
                  onChange={(e) => setFounderForm({ ...founderForm, name: e.target.value })}
                  className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-neutral-900 focus:border-neutral-900 outline-none"
                  placeholder="e.g. Gowthaman PR"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Role Title *</label>
                <input
                  type="text"
                  value={founderForm.role}
                  onChange={(e) => setFounderForm({ ...founderForm, role: e.target.value })}
                  className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-neutral-900 focus:border-neutral-900 outline-none"
                  placeholder="e.g. Founder & Chief Executive Officer (CEO)"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Badge Tag</label>
                <input
                  type="text"
                  value={founderForm.badge}
                  onChange={(e) => setFounderForm({ ...founderForm, badge: e.target.value })}
                  className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-neutral-900 focus:border-neutral-900 outline-none"
                  placeholder="e.g. FOUNDER & CEO"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Tagline / Organization Subtitle</label>
                <input
                  type="text"
                  value={founderForm.tagline}
                  onChange={(e) => setFounderForm({ ...founderForm, tagline: e.target.value })}
                  className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-neutral-900 focus:border-neutral-900 outline-none"
                  placeholder="e.g. Founder & Visionary • Creare Mind"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-neutral-700 mb-1">Photo Image URL *</label>
                <input
                  type="text"
                  value={founderForm.image}
                  onChange={(e) => setFounderForm({ ...founderForm, image: e.target.value })}
                  className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-neutral-900 focus:border-neutral-900 outline-none font-mono text-[11px]"
                  placeholder="Enter Cloudinary or hosted image URL..."
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-neutral-700 mb-1">Narrative Biography *</label>
                <textarea
                  rows={4}
                  value={founderForm.bio}
                  onChange={(e) => setFounderForm({ ...founderForm, bio: e.target.value })}
                  className="w-full rounded-xl border border-neutral-200 p-3 text-neutral-900 focus:border-neutral-900 outline-none resize-none leading-relaxed"
                  placeholder="Describe career experience, technical mastery, and contributions..."
                />
              </div>

              <div className="sm:col-span-2 space-y-2">
                <label className="block font-semibold text-neutral-700">Core Areas of Mastery (Chips)</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {founderForm.focus.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-full bg-neutral-100 text-neutral-800 px-2.5 py-1 text-xs font-medium"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFocusTag(tag)}
                        className="hover:text-red-600 cursor-pointer"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newFocusTag}
                    onChange={(e) => setNewFocusTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddFocusTag();
                      }
                    }}
                    placeholder="Type a skill/focus and press enter or Add"
                    className="flex-1 rounded-xl border border-neutral-200 px-3 py-2 text-neutral-900 focus:border-neutral-900 outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddFocusTag}
                    className="rounded-xl bg-neutral-100 text-neutral-800 px-3 py-2 font-semibold hover:bg-neutral-200 transition-colors"
                  >
                    Add Chip
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Direct Email</label>
                <input
                  type="email"
                  value={founderForm.email}
                  onChange={(e) => setFounderForm({ ...founderForm, email: e.target.value })}
                  className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-neutral-900 focus:border-neutral-900 outline-none"
                  placeholder="e.g. crearemindwebsolutions@gmail.com"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">LinkedIn Profile URL</label>
                <input
                  type="text"
                  value={founderForm.linkedin || ""}
                  onChange={(e) => setFounderForm({ ...founderForm, linkedin: e.target.value })}
                  className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-neutral-900 focus:border-neutral-900 outline-none"
                  placeholder="https://linkedin.com/..."
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-neutral-700 mb-1">Instagram Profile URL</label>
                <input
                  type="text"
                  value={founderForm.instagram || ""}
                  onChange={(e) => setFounderForm({ ...founderForm, instagram: e.target.value })}
                  className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-neutral-900 focus:border-neutral-900 outline-none"
                  placeholder="https://instagram.com/..."
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-neutral-100 pt-3">
              <button
                type="button"
                onClick={() => setFounderModalOpen(false)}
                className="rounded-xl border border-neutral-200 px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveFounder}
                className="inline-flex items-center gap-1.5 rounded-xl bg-neutral-900 text-white px-4 py-2 text-xs font-semibold hover:bg-black transition-all cursor-pointer shadow-xs"
              >
                <Check className="h-3.5 w-3.5" />
                <span>Save Leader</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: EDIT / ADD VALUE ─── */}
      {valueModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-neutral-900">
              {editingValueIndex !== null ? "Edit Core Value" : "Add Core Value"}
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Value Title *</label>
                <input
                  type="text"
                  value={valueForm.title}
                  onChange={(e) => setValueForm({ ...valueForm, title: e.target.value })}
                  className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-neutral-900 focus:border-neutral-900 outline-none"
                  placeholder="e.g. Radical Craftsmanship"
                />
              </div>
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Description *</label>
                <textarea
                  rows={3}
                  value={valueForm.desc}
                  onChange={(e) => setValueForm({ ...valueForm, desc: e.target.value })}
                  className="w-full rounded-xl border border-neutral-200 p-3 text-neutral-900 focus:border-neutral-900 outline-none resize-none leading-relaxed"
                  placeholder="Value description..."
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-neutral-100 pt-3">
              <button
                type="button"
                onClick={() => setValueModalOpen(false)}
                className="rounded-xl border border-neutral-200 px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveValue}
                className="rounded-xl bg-neutral-900 text-white px-4 py-2 text-xs font-semibold hover:bg-black transition-all"
              >
                Save Value
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: EDIT / ADD PRINCIPLE ─── */}
      {principleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-neutral-900">
              {editingPrincipleIndex !== null ? "Edit Working Principle" : "Add Working Principle"}
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Principle Title *</label>
                <input
                  type="text"
                  value={principleForm.title}
                  onChange={(e) => setPrincipleForm({ ...principleForm, title: e.target.value })}
                  className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-neutral-900 focus:border-neutral-900 outline-none"
                  placeholder="e.g. Direct Founder Access"
                />
              </div>
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Description *</label>
                <textarea
                  rows={3}
                  value={principleForm.desc}
                  onChange={(e) => setPrincipleForm({ ...principleForm, desc: e.target.value })}
                  className="w-full rounded-xl border border-neutral-200 p-3 text-neutral-900 focus:border-neutral-900 outline-none resize-none leading-relaxed"
                  placeholder="Principle description..."
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-neutral-100 pt-3">
              <button
                type="button"
                onClick={() => setPrincipleModalOpen(false)}
                className="rounded-xl border border-neutral-200 px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePrinciple}
                className="rounded-xl bg-neutral-900 text-white px-4 py-2 text-xs font-semibold hover:bg-black transition-all"
              >
                Save Principle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
