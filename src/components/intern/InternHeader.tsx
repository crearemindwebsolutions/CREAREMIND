import React, { useState, useRef, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import {
  Menu,
  Moon,
  Sun,
  Calendar,
  Bell,
  MessageSquare,
  Search,
  ChevronDown,
  User,
  Settings,
  HelpCircle,
  LogOut,
  ExternalLink,
  Share2,
} from "lucide-react";
import type { InternProfile, AnnouncementItem } from "@/lib/intern-data";
import type { InternNavTab } from "./InternSidebar";

interface InternHeaderProps {
  currentTab: InternNavTab;
  onSelectTab: (tab: InternNavTab) => void;
  onOpenMobileSidebar: () => void;
  profile: InternProfile;
  announcements: AnnouncementItem[];
  onMarkAnnouncementRead: (id: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export function InternHeader({
  currentTab,
  onSelectTab,
  onOpenMobileSidebar,
  profile,
  announcements,
  onMarkAnnouncementRead,
  searchQuery,
  onSearchChange,
}: InternHeaderProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const unreadCount = announcements.filter((a) => a.unread).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="bg-white border-b border-neutral-200/80">
      {/* 1. Top Bar: Breadcrumb + Action Icons + Profile Badge */}
      <div className="flex h-14 items-center justify-between px-4 sm:px-8 border-b border-neutral-100">
        {/* Left: Mobile hamburger + Breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileSidebar}
            className="grid h-8 w-8 place-items-center rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-50 lg:hidden cursor-pointer"
            aria-label="Open sidebar"
          >
            <Menu className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-medium">
            <span className="hover:text-neutral-800 cursor-pointer">Dashboard</span>
            <span className="text-neutral-400 font-mono text-[11px]">&gt;</span>
            <span className="font-semibold text-neutral-900">Intern</span>
          </div>
        </div>

        {/* Right: Moon, Calendar, Bell, Chat, User Pill */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Moon Theme Toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="grid h-8 w-8 place-items-center rounded-lg text-neutral-600 hover:bg-neutral-100 transition-colors cursor-pointer"
            title="Toggle theme"
          >
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* Calendar Quick Link */}
          <button
            onClick={() => onSelectTab("calendar")}
            className="grid h-8 w-8 place-items-center rounded-lg text-neutral-600 hover:bg-neutral-100 transition-colors cursor-pointer"
            title="Calendar"
          >
            <Calendar className="h-4 w-4" />
          </button>

          {/* Notification Bell */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="relative grid h-8 w-8 place-items-center rounded-lg text-neutral-600 hover:bg-neutral-100 transition-colors cursor-pointer"
              title="Notifications"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" />
              )}
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 rounded-xl border border-neutral-200 bg-white p-2 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="flex items-center justify-between border-b border-neutral-100 px-3 py-2">
                  <span className="text-xs font-bold text-neutral-900">Notifications</span>
                  <span className="text-[10px] text-neutral-400 font-['Plus_Jakarta_Sans',sans-serif] font-semibold">{unreadCount} unread</span>
                </div>
                <div className="max-h-64 overflow-y-auto divide-y divide-neutral-100">
                  {announcements.length === 0 ? (
                    <div className="py-6 text-center text-xs text-neutral-400">
                      No notifications at this time.
                    </div>
                  ) : (
                    announcements.slice(0, 3).map((ann) => (
                      <div
                        key={ann.id}
                        onClick={() => {
                          onMarkAnnouncementRead(ann.id);
                          onSelectTab("feed");
                          setIsNotificationsOpen(false);
                        }}
                        className="p-2.5 hover:bg-neutral-50 transition-colors cursor-pointer"
                      >
                        <p className="text-xs font-semibold text-neutral-900 line-clamp-1">{ann.title}</p>
                        <p className="text-[11px] text-neutral-500 line-clamp-2 mt-0.5">{ann.content}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Messages Chat Icon */}
          <button
            onClick={() => onSelectTab("community")}
            className="grid h-8 w-8 place-items-center rounded-lg text-neutral-600 hover:bg-neutral-100 transition-colors cursor-pointer"
            title="Messages"
          >
            <MessageSquare className="h-4 w-4" />
          </button>

          {/* User Profile Pill - Creare Mind Studio */}
          <div className="relative ml-1" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 p-1 pr-2 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              <div className="grid h-7 w-7 place-items-center rounded-full bg-neutral-900 text-white text-xs font-['Plus_Jakarta_Sans',sans-serif] font-bold shrink-0">
                {profile.name ? profile.name[0].toUpperCase() : "I"}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-neutral-900 leading-tight">
                  {profile.name}
                </p>
                <p className="text-[10px] text-neutral-400 leading-tight">
                  Creare Mind Studio
                </p>
              </div>
              <ChevronDown className="h-3 w-3 text-neutral-400" />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-52 rounded-xl border border-neutral-200 bg-white p-1.5 shadow-lg z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="border-b border-neutral-100 px-3 py-2">
                  <p className="text-xs font-bold text-neutral-900">{profile.name}</p>
                  <p className="text-[10px] text-neutral-400 truncate">{profile.email}</p>
                </div>
                <div className="py-1 text-xs">
                  <button
                    onClick={() => {
                      onSelectTab("profile");
                      setIsProfileOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-neutral-700 hover:bg-neutral-50"
                  >
                    <User className="h-3.5 w-3.5 text-neutral-400" />
                    <span>My Profile</span>
                  </button>
                  <button
                    onClick={() => {
                      onSelectTab("settings");
                      setIsProfileOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-neutral-700 hover:bg-neutral-50"
                  >
                    <Settings className="h-3.5 w-3.5 text-neutral-400" />
                    <span>Settings</span>
                  </button>
                  <button
                    onClick={() => {
                      onSelectTab("help");
                      setIsProfileOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-neutral-700 hover:bg-neutral-50"
                  >
                    <HelpCircle className="h-3.5 w-3.5 text-neutral-400" />
                    <span>Need Help?</span>
                  </button>
                </div>
                <div className="border-t border-neutral-100 pt-1">
                  <Link
                    to="/auth"
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-neutral-700 hover:bg-neutral-100"
                  >
                    <LogOut className="h-3.5 w-3.5 text-neutral-500" />
                    <span>Sign Out</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Subheader: Big Page Title "Intern Workspace" + Search & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-4 sm:px-8 py-5">
        <div>
          <h1 className="text-2xl sm:text-[26px] font-bold tracking-tight text-neutral-900 leading-tight">
            Intern Workspace
          </h1>
          <p className="text-xs text-neutral-400 font-medium mt-0.5">Intern Portal</p>
        </div>

        {/* Right Search Input & Icons */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search..."
              className="w-44 sm:w-56 rounded-lg border border-neutral-200/90 bg-white py-1.5 pl-8.5 pr-2.5 text-xs text-neutral-900 placeholder-neutral-400 focus:border-neutral-900 focus:outline-hidden transition-all shadow-2xs"
            />
          </div>

          <button
            onClick={() => onSelectTab("feed")}
            className="grid h-8 w-8 place-items-center rounded-lg border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 transition-colors cursor-pointer shadow-2xs"
            title="Alerts"
          >
            <Bell className="h-3.5 w-3.5" />
          </button>

          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="grid h-8 w-8 place-items-center rounded-lg border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 transition-colors cursor-pointer shadow-2xs"
            title="Exit / Live site"
          >
            <Share2 className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
