import React, { useState } from "react";
import {
  Megaphone,
  BellRing,
  CheckCircle2,
  Clock,
  User,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import type { AnnouncementItem } from "@/lib/intern-data";

interface InternAnnouncementsViewProps {
  announcements: AnnouncementItem[];
  onMarkRead: (id: string) => void;
}

export function InternAnnouncementsView({
  announcements,
  onMarkRead,
}: InternAnnouncementsViewProps) {
  const [filter, setFilter] = useState<"All" | "Unread">("All");

  const filteredAnnouncements = announcements.filter((a) => {
    if (filter === "Unread") return a.unread;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-neutral-200/80 bg-white p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-2.5 py-0.5 text-[11px] font-semibold text-neutral-800 border border-neutral-200">
              <Megaphone className="h-3 w-3 text-neutral-700" />
              <span>Studio Communications</span>
            </div>
            <h2 className="mt-2 text-lg sm:text-xl font-bold text-neutral-900">
              Company &amp; Engineering Announcements
            </h2>
            <p className="mt-0.5 text-xs text-neutral-500">
              Official studio releases, engineering tech talks, sprint demos, and holiday notices.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter("All")}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                filter === "All"
                  ? "bg-neutral-900 text-white shadow-xs"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              }`}
            >
              All ({announcements.length})
            </button>
            <button
              onClick={() => setFilter("Unread")}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                filter === "Unread"
                  ? "bg-neutral-900 text-white shadow-xs"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              }`}
            >
              Unread ({announcements.filter((a) => a.unread).length})
            </button>
          </div>
        </div>
      </div>

      {/* Announcements Feed */}
      <div className="space-y-4">
        {filteredAnnouncements.length === 0 ? (
          <div className="rounded-xl border border-neutral-200 bg-white p-12 text-center text-neutral-400 text-xs shadow-xs space-y-1">
            <Megaphone className="h-6 w-6 mx-auto mb-2 text-neutral-300" />
            <p className="font-semibold text-neutral-700">No studio announcements published yet</p>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              Official releases, engineering updates, and studio notices will appear here.
            </p>
          </div>
        ) : (
          filteredAnnouncements.map((item) => (
            <div
              key={item.id}
              className={`rounded-xl border p-5 transition-all bg-white shadow-xs ${
                item.unread
                  ? "border-neutral-900 ring-1 ring-neutral-200"
                  : "border-neutral-200/80 hover:border-neutral-300"
              }`}
            >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="rounded bg-neutral-100 px-2 py-0.5 text-[10px] font-mono font-bold uppercase text-neutral-600">
                  {item.category}
                </span>
                {item.priority === "Urgent" && (
                  <span className="rounded bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                    Important
                  </span>
                )}
                {item.unread && (
                  <span className="rounded-full bg-neutral-900 px-2 py-0.2 text-[9.5px] font-semibold text-white">
                    New
                  </span>
                )}
              </div>

              <span className="text-xs text-neutral-400 font-mono">{item.timestamp}</span>
            </div>

            <h3 className="mt-2.5 text-base font-bold text-neutral-900">{item.title}</h3>

            <p className="mt-2 text-xs sm:text-sm text-neutral-700 leading-relaxed bg-neutral-50/50 p-3.5 rounded-lg border border-neutral-100">
              {item.content}
            </p>

            <div className="mt-4 pt-3 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-neutral-600 font-medium">
                <span className="h-6 w-6 rounded-full bg-neutral-900 text-white text-[10px] font-bold grid place-items-center font-mono">
                  {item.author[0]}
                </span>
                <span>
                  {item.author} &bull;{" "}
                  <span className="text-neutral-400 font-normal">{item.authorRole}</span>
                </span>
              </div>

              {item.unread && (
                <button
                  onClick={() => onMarkRead(item.id)}
                  className="rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 px-3 py-1 text-xs font-semibold text-neutral-700 shadow-2xs transition-colors cursor-pointer"
                >
                  Mark as Read
                </button>
              )}
            </div>
          </div>
        )))}
      </div>
    </div>
  );
}

