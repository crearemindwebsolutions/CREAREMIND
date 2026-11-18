import React, { useState } from "react";
import {
  BookOpen,
  Search,
  FileText,
  Video,
  Download,
  ExternalLink,
  FolderCode,
  Sparkles,
  ShieldCheck,
  Tag,
} from "lucide-react";
import type { ResourceItem } from "@/lib/intern-data";

interface InternResourcesViewProps {
  resources: ResourceItem[];
}

export function InternResourcesView({ resources }: InternResourcesViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = ["All", "Guidelines", "Engineering", "Design", "Videos"];

  const filteredResources = resources.filter((res) => {
    if (selectedCategory !== "All" && res.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        res.title.toLowerCase().includes(q) ||
        res.description.toLowerCase().includes(q) ||
        res.format.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header & Filter Card */}
      <div className="rounded-xl border border-neutral-200/80 bg-white p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-2.5 py-0.5 text-[11px] font-semibold text-neutral-800 border border-neutral-200">
              <BookOpen className="h-3 w-3 text-neutral-700" />
              <span>Knowledge Base &amp; Specs</span>
            </div>
            <h2 className="mt-2 text-lg sm:text-xl font-bold text-neutral-900">
              Technical Resources &amp; Documentation
            </h2>
            <p className="mt-0.5 text-xs text-neutral-500">
              Official company manuals, architecture blueprints, design tokens, and onboarding videos.
            </p>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documentation &amp; guides..."
              className="w-full rounded-lg border border-neutral-200 bg-neutral-50/70 py-1.5 pl-9 pr-3 text-xs text-neutral-900 placeholder-neutral-400 focus:border-neutral-900 focus:bg-white focus:outline-hidden"
            />
          </div>
        </div>

        {/* Category Pill Filters */}
        <div className="mt-4 flex flex-wrap gap-2 pt-3 border-t border-neutral-100">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-neutral-900 text-white shadow-xs"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Resources Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredResources.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-neutral-200/80 bg-white p-12 text-center shadow-xs space-y-2">
            <BookOpen className="h-8 w-8 mx-auto text-neutral-300" />
            <h3 className="text-sm font-bold text-neutral-900">No Resources Found</h3>
            <p className="text-[11px] text-neutral-400 max-w-sm mx-auto">
              Technical documentation, engineering handbooks, and architecture guidelines will appear here when published.
            </p>
          </div>
        ) : (
          filteredResources.map((res) => {
            const formatBadgeColor = {
              PDF: "bg-neutral-100 text-neutral-800 border border-neutral-200",
              Doc: "bg-neutral-100 text-neutral-800 border border-neutral-200",
              Figma: "bg-neutral-100 text-neutral-800 border border-neutral-200",
              Video: "bg-amber-50 text-amber-800 border border-amber-200",
              Repo: "bg-emerald-50 text-emerald-800 border border-emerald-200",
            }[res.format];

            return (
              <div
                key={res.id}
                className="flex flex-col justify-between rounded-xl border border-neutral-200/80 bg-white p-4 shadow-xs hover:border-neutral-300 hover:shadow-xs transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span
                      className={`rounded px-1.5 py-0.5 text-[9.5px] font-bold font-mono ${formatBadgeColor}`}
                    >
                      {res.format}
                    </span>
                    <span className="text-[10px] text-neutral-400 font-mono">
                      {res.sizeOrDuration}
                    </span>
                  </div>

                  <h3 className="mt-2.5 text-sm font-bold text-neutral-900 group-hover:text-neutral-700 transition-colors">
                    {res.title}
                  </h3>

                  <p className="mt-1 text-xs text-neutral-500 leading-relaxed">
                    {res.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between">
                  <span className="rounded bg-neutral-100 px-2 py-0.5 text-[10px] text-neutral-600 font-medium">
                    {res.category}
                  </span>

                  <button
                    onClick={() => alert(`Opening resource: ${res.title}`)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-900 hover:text-neutral-700 transition-colors cursor-pointer"
                  >
                    <span>Access Resource</span>
                    <ExternalLink className="h-3 w-3" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

