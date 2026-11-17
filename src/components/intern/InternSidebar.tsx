import React from "react";
import { Link } from "@tanstack/react-router";
import {
  MessageSquare,
  Home,
  Newspaper,
  Film,
  ListTodo,
  Calendar,
  SunMedium,
  FolderKanban,
  Clock,
  Flag,
  Search,
  Settings,
  X,
  Sparkles,
} from "lucide-react";
import type { InternProfile } from "@/lib/intern-data";

export type InternNavTab =
  | "home"
  | "community"
  | "feed"
  | "reels"
  | "work"
  | "calendar"
  | "planner"
  | "projects"
  | "attendance"
  | "leave"
  | "profile"
  | "help"
  | "settings";

interface InternSidebarProps {
  currentTab: InternNavTab;
  onSelectTab: (tab: InternNavTab) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  profile: InternProfile;
  searchPageQuery: string;
  onSearchPageChange: (q: string) => void;
}

export function InternSidebar({
  currentTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
  profile,
  searchPageQuery,
  onSearchPageChange,
}: InternSidebarProps) {
  const topNavItems = [
    { id: "community" as const, label: "Community", icon: MessageSquare },
    { id: "home" as const, label: "Home", icon: Home, isHome: true },
    { id: "feed" as const, label: "My Feed", icon: Newspaper },
    { id: "reels" as const, label: "Reels", icon: Film },
  ];

  const workNavItems = [
    { id: "work" as const, label: "My Work", icon: ListTodo },
    { id: "calendar" as const, label: "Calendar", icon: Calendar },
    { id: "planner" as const, label: "Daily Planner", icon: SunMedium },
    { id: "projects" as const, label: "My Projects", icon: FolderKanban },
  ];

  const timeNavItems = [
    { id: "attendance" as const, label: "Attendance", icon: Clock },
    { id: "leave" as const, label: "Leave & Time Off", icon: Flag },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-neutral-900/40 backdrop-blur-2xs lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Persistent Left Sidebar - Creare Mind Warm Luxury Styling */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-60 flex-col border-r border-neutral-200/90 bg-white transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isOpenMobile ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        {/* Top Logo Section: Creare Mind Brand */}
        <div className="flex items-center justify-between p-4 pb-3 border-b border-neutral-100">
          <Link
            to="/"
            className="flex items-center gap-3 transition-opacity hover:opacity-85 min-w-0"
            onClick={onCloseMobile}
          >
            {/* Creare Mind Hexagon / Box Logo in Signature Neutral-900 / Black */}
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-neutral-900 text-white shadow-xs shrink-0">
              <span className="font-mono text-xs font-black tracking-tighter">CM</span>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-0.5">
                <span className="font-sans text-sm font-bold tracking-tight text-neutral-900 truncate">
                  CREARE MIND
                </span>
              </div>
              <p className="truncate text-[10.5px] text-neutral-400 leading-tight">
                Engineering Studio · Workspace
              </p>
            </div>
          </Link>

          <button
            onClick={onCloseMobile}
            className="grid h-7 w-7 place-items-center rounded-lg text-neutral-400 hover:bg-neutral-100 lg:hidden cursor-pointer"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Find a Page Search Input */}
        <div className="px-3 pt-3 pb-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
            <input
              type="text"
              value={searchPageQuery}
              onChange={(e) => onSearchPageChange(e.target.value)}
              placeholder="Find a page..."
              className="w-full rounded-lg border border-neutral-200/90 bg-white py-1.5 pl-8.5 pr-2.5 text-xs text-neutral-900 placeholder-neutral-400 focus:border-neutral-900 focus:outline-hidden transition-all shadow-2xs"
            />
          </div>
        </div>

        {/* Nav Sections Scrollable */}
        <div className="flex-1 overflow-y-auto px-2.5 py-1.5 space-y-4">
          {/* Top Group: Community, Home, Feed, Reels */}
          <div className="space-y-0.5">
            {topNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    onCloseMobile();
                  }}
                  className={`group flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs transition-all cursor-pointer ${
                    isActive
                      ? "bg-neutral-900 text-white font-semibold shadow-xs"
                      : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 font-medium"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`h-4 w-4 ${
                        isActive ? "text-white stroke-[2.2]" : "text-neutral-400 group-hover:text-neutral-700"
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {isActive && (
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* MY WORK Group */}
          <div className="space-y-0.5">
            <p className="px-3 pb-1 text-[10px] font-mono font-semibold uppercase tracking-wider text-neutral-400">
              MY WORK
            </p>
            {workNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    onCloseMobile();
                  }}
                  className={`group flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs transition-all cursor-pointer ${
                    isActive
                      ? "bg-neutral-900 text-white font-semibold shadow-xs"
                      : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 font-medium"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`h-4 w-4 ${
                        isActive ? "text-white stroke-[2.2]" : "text-neutral-400 group-hover:text-neutral-700"
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {isActive && (
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* MY TIME Group */}
          <div className="space-y-0.5">
            <p className="px-3 pb-1 text-[10px] font-mono font-semibold uppercase tracking-wider text-neutral-400">
              MY TIME
            </p>
            {timeNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    onCloseMobile();
                  }}
                  className={`group flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs transition-all cursor-pointer ${
                    isActive
                      ? "bg-neutral-900 text-white font-semibold shadow-xs"
                      : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 font-medium"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`h-4 w-4 ${
                        isActive ? "text-white stroke-[2.2]" : "text-neutral-400 group-hover:text-neutral-700"
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {isActive && (
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sidebar Footer User Pill */}
        <div className="p-3 border-t border-neutral-100 bg-neutral-50/50">
          <div
            onClick={() => {
              onSelectTab("profile");
              onCloseMobile();
            }}
            className="flex items-center justify-between rounded-xl p-1.5 transition-colors hover:bg-white cursor-pointer group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="grid h-8 w-8 place-items-center rounded-full bg-neutral-900 text-white text-[11px] font-['Plus_Jakarta_Sans',sans-serif] font-bold shrink-0">
                {(profile.name || "Intern")
                  .split(" ")
                  .filter(Boolean)
                  .map((p) => p[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2) || "IN"}
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-neutral-900 group-hover:text-neutral-700 transition-colors">
                  {profile.name}
                </p>
                <p className="truncate text-[10px] text-neutral-400">Account settings</p>
              </div>
            </div>

            <Settings className="h-4 w-4 text-neutral-400 group-hover:text-neutral-700 shrink-0" />
          </div>
        </div>
      </aside>
    </>
  );
}
