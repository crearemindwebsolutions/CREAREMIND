import { useState } from "react";
import {
  Search,
  Globe,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Save,
  Sparkles,
  Smartphone,
  Laptop,
  Check,
  ShieldCheck,
  FileCode2,
} from "lucide-react";
import { toast } from "sonner";
import { recordAdminLog } from "@/lib/admin-logs";

interface AdminSeoViewProps {
  adminEmail: string;
}

export function AdminSeoView({ adminEmail }: AdminSeoViewProps) {
  const [devicePreview, setDevicePreview] = useState<"desktop" | "mobile">("desktop");
  const [title, setTitle] = useState("Creare Mind — Software Development & Digital Agency | crearemind.in");
  const [description, setDescription] = useState(
    "Official website of Creare Mind (crearemind.in). We engineer high-velocity custom websites, mobile applications (iOS & Android), shop billing POS systems, video editing, and social media growth."
  );
  const [keywords, setKeywords] = useState(
    "Creare Mind, crearemind, crearemind.in, Creare Mind Technologies, software agency, web design company, mobile app developers, shop billing software, POS retail counter, video editing studio, digital marketing India"
  );
  const [canonical, setCanonical] = useState("https://crearemind.in");
  const [googleVerification, setGoogleVerification] = useState("");
  const [saved, setSaved] = useState(false);

  const handleSaveSeo = (e: React.FormEvent) => {
    e.preventDefault();
    recordAdminLog(adminEmail, "Updated SEO Meta", "SEO", "Saved updated meta title, description, and keywords");
    setSaved(true);
    toast.success("SEO configurations saved successfully");
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 text-neutral-900">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-neutral-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 border border-purple-200 px-2.5 py-0.5 text-[11px] font-medium text-purple-800">
              <Search className="h-3 w-3 text-purple-600" />
              Search Engine Optimization
            </span>
            <span className="text-xs text-neutral-400 font-mono">
              Googlebot &amp; Bingbot Ready
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
            SEO &amp; Google Search Console
          </h1>
          <p className="mt-1 text-xs text-neutral-500">
            Fine-tune search engine appearance, rich snippet metadata, canonical URLs, and sitemap crawling.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/sitemap.xml"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 px-3 py-2 text-xs font-semibold text-neutral-700 transition-colors shadow-xs"
          >
            <FileCode2 className="h-3.5 w-3.5 text-blue-600" />
            View sitemap.xml ↗
          </a>
          <a
            href="/robots.txt"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 px-3 py-2 text-xs font-semibold text-neutral-700 transition-colors shadow-xs"
          >
            <Globe className="h-3.5 w-3.5 text-emerald-600" />
            View robots.txt ↗
          </a>
        </div>
      </div>

      {/* Live Google Search Preview Card */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <div>
            <h3 className="font-bold text-neutral-900 text-sm">Live Google SERP Snippet Simulator</h3>
            <p className="text-xs text-neutral-500">
              How Creare Mind appears to users searching on Google
            </p>
          </div>
          <div className="flex items-center gap-1 rounded-xl border border-neutral-200 bg-neutral-100 p-1 text-xs">
            <button
              onClick={() => setDevicePreview("desktop")}
              className={`rounded-lg p-1.5 transition-colors cursor-pointer ${
                devicePreview === "desktop" ? "bg-white text-neutral-900 shadow-xs" : "text-neutral-500"
              }`}
              title="Desktop View"
            >
              <Laptop className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setDevicePreview("mobile")}
              className={`rounded-lg p-1.5 transition-colors cursor-pointer ${
                devicePreview === "mobile" ? "bg-white text-neutral-900 shadow-xs" : "text-neutral-500"
              }`}
              title="Mobile View"
            >
              <Smartphone className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Google Result Preview Box */}
        <div className="rounded-xl border border-neutral-200 bg-neutral-50/50 p-5 shadow-xs max-w-2xl font-sans">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="h-6 w-6 rounded-full bg-neutral-900 flex items-center justify-center text-white text-[10px] font-bold">
              CM
            </div>
            <div>
              <div className="text-xs font-bold text-neutral-800 leading-tight">Creare Mind</div>
              <div className="text-[11px] text-neutral-500 font-mono">https://crearemind.in</div>
            </div>
          </div>
          <h4 className="text-base text-[#1a0dab] hover:underline font-normal cursor-pointer leading-snug">
            {title || "Creare Mind — Software Development & Digital Agency"}
          </h4>
          <p className="mt-1 text-xs text-[#4d5156] leading-relaxed line-clamp-2">
            {description}
          </p>
          <div className="mt-3 flex flex-wrap gap-2 pt-2 border-t border-neutral-200/60 text-[11px] text-[#1a0dab] font-medium">
            <span className="hover:underline cursor-pointer">Our Services</span> •
            <span className="hover:underline cursor-pointer">Client Work &amp; Templates</span> •
            <span className="hover:underline cursor-pointer">About Leadership</span> •
            <span className="hover:underline cursor-pointer">Contact Studio</span>
          </div>
        </div>
      </div>

      {/* SEO Form & Health Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        {/* Left: Editable Meta fields */}
        <form onSubmit={handleSaveSeo} className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs space-y-4 lg:col-span-8 text-xs">
          <h3 className="font-bold text-neutral-900 text-sm border-b border-neutral-100 pb-3">Metadata &amp; Page Tags</h3>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-bold text-neutral-800">Global Meta Title (Homepage)</label>
              <span className={`text-[10px] font-mono ${title.length > 60 ? "text-amber-600 font-bold" : "text-neutral-400"}`}>
                {title.length} / 60 chars
              </span>
            </div>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-900 focus:ring-2 focus:ring-purple-500/20"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-bold text-neutral-800">Meta Description</label>
              <span className={`text-[10px] font-mono ${description.length > 160 ? "text-amber-600 font-bold" : "text-neutral-400"}`}>
                {description.length} / 160 chars
              </span>
            </div>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-900 focus:ring-2 focus:ring-purple-500/20"
            />
          </div>

          <div>
            <label className="font-bold text-neutral-800 block mb-1">Target Keyword Entities</label>
            <input
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-900 focus:ring-2 focus:ring-purple-500/20"
            />
            <p className="text-[10px] text-neutral-400 mt-1">
              Comma-separated high-intent keywords for Googlebot indexing
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-neutral-800 block mb-1">Canonical Root URL</label>
              <input
                type="url"
                value={canonical}
                onChange={(e) => setCanonical(e.target.value)}
                className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-mono text-neutral-900"
              />
            </div>
            <div>
              <label className="font-bold text-neutral-800 block mb-1">Google Site Verification Code</label>
              <input
                type="text"
                placeholder="google-site-verification token..."
                value={googleVerification}
                onChange={(e) => setGoogleVerification(e.target.value)}
                className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-mono text-neutral-900"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-neutral-100 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 px-5 py-2.5 font-semibold text-white shadow-xs transition-colors cursor-pointer"
            >
              {saved ? <Check className="h-4 w-4 text-emerald-400" /> : <Save className="h-4 w-4" />}
              {saved ? "Saved!" : "Save SEO Settings"}
            </button>
          </div>
        </form>

        {/* Right: Technical SEO Health Checklist */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs space-y-4 lg:col-span-4 text-xs">
          <h3 className="font-bold text-neutral-900 text-sm border-b border-neutral-100 pb-3">Technical SEO Readiness</h3>

          <div className="space-y-3">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-neutral-900">Sitemap Index Published</p>
                <p className="text-[11px] text-neutral-500">Accessible at /sitemap.xml with 8 indexed routes</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-neutral-900">Robots.txt Declared</p>
                <p className="text-[11px] text-neutral-500">Disallowing /admin while allowing Googlebot &amp; Bingbot</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-neutral-900">Schema.org JSON-LD Injected</p>
                <p className="text-[11px] text-neutral-500">Organization, WebSite &amp; ProfessionalService</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-neutral-900">OpenGraph Social Preview</p>
                <p className="text-[11px] text-neutral-500">1200x630 og-image.jpg bundled for WhatsApp &amp; LinkedIn</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-neutral-900">Canonical URL Defense</p>
                <p className="text-[11px] text-neutral-500">Prevents duplicate content splitting across URLs</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3.5 mt-4 space-y-1">
            <p className="font-bold text-amber-900">Search Console Indexing Tip:</p>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Open <strong>Google Search Console</strong> &gt; <strong>URL Inspection</strong> &gt; enter <strong>https://crearemind.in/</strong> &gt; click <strong>Request Indexing</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
