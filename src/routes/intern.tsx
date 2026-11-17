import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useSession } from "@/hooks/use-session";
import {
  isInternOrAdmin,
  fetchUsersFromCloud,
  getStoredUsers,
  getUserRoleAsync,
  type ManagedUser,
} from "@/lib/admin-users";
import { useInternStore } from "@/lib/use-intern-store";
import type { InternTask, InternProject } from "@/lib/intern-data";
import { InternSidebar, type InternNavTab } from "@/components/intern/InternSidebar";
import { InternHeader } from "@/components/intern/InternHeader";
import { InternOverviewView } from "@/components/intern/InternOverviewView";
import { InternTasksView } from "@/components/intern/InternTasksView";
import { InternProjectsView } from "@/components/intern/InternProjectsView";
import { InternCalendarView } from "@/components/intern/InternCalendarView";
import { InternAttendanceView } from "@/components/intern/InternAttendanceView";
import { InternPerformanceView } from "@/components/intern/InternPerformanceView";
import { InternResourcesView } from "@/components/intern/InternResourcesView";
import { InternAnnouncementsView } from "@/components/intern/InternAnnouncementsView";
import { InternProfileView } from "@/components/intern/InternProfileView";
import { InternHelpView, InternSettingsView } from "@/components/intern/InternHelpView";
import { InternTaskDetailModal } from "@/components/intern/InternTaskDetailModal";
import { InternBottomBar } from "@/components/intern/InternBottomBar";
import { InternSkeleton } from "@/components/ui/SiteSkeletons";
import { ShieldCheck, Lock, AlertCircle, ArrowRight, UserX, Loader2, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/intern")({
  head: () => ({
    meta: [
      { title: "Intern Workspace — Creare Mind Studio" },
      {
        name: "description",
        content:
          "Official engineering, design, and software development intern workspace for Creare Mind.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: InternWorkspaceGate,
  pendingComponent: InternSkeleton,
});

function InternWorkspaceGate() {
  const { user, ready } = useSession();
  const [cachedUsers, setCachedUsers] = useState<ManagedUser[]>(() => getStoredUsers());
  const [isVerifying, setIsVerifying] = useState(true);
  const [cloudRole, setCloudRole] = useState<string | null>(null);

  // Authoritatively sync cloud directory and check user role directly from Supabase
  useEffect(() => {
    if (!user?.email) {
      if (ready) setIsVerifying(false);
      return;
    }

    let isMounted = true;
    Promise.all([
      getUserRoleAsync(user.email),
      fetchUsersFromCloud(),
    ])
      .then(([role, users]) => {
        if (isMounted) {
          setCloudRole(role);
          setCachedUsers(users);
          setIsVerifying(false);
        }
      })
      .catch(() => {
        if (isMounted) setIsVerifying(false);
      });

    return () => {
      isMounted = false;
    };
  }, [user?.email, ready]);

  // Loading state while auth session or cloud directory resolves
  if (!ready || isVerifying) {
    return <InternSkeleton />;
  }

  // 1. Not Authenticated: Show friendly authentication required card
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8F7F4] px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border border-neutral-200/80 bg-white p-7 sm:p-8 shadow-xs text-center space-y-6">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-neutral-100 text-neutral-900 ring-1 ring-neutral-200">
            <ShieldCheck className="h-7 w-7 text-neutral-800" />
          </div>

          <div className="space-y-2">
            <h1 className="font-['Plus_Jakarta_Sans',sans-serif] text-xl font-bold tracking-tight text-neutral-900">
              Intern Authentication Required
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed">
              The Creare Mind Intern Workspace is restricted to authorized interns and personnel.
              Please sign in with your credentials to proceed.
            </p>
          </div>

          <div className="pt-2 space-y-3">
            <Link
              to="/auth"
              search={{ redirect: "/intern" }}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-900 px-4 py-3 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <span>Sign In to Intern Workspace</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              to="/"
              className="inline-block text-xs font-semibold text-neutral-500 hover:text-neutral-900 transition-colors"
            >
              Return to Website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. Authenticated: Check role permission
  const authResult = isInternOrAdmin(user, cachedUsers);
  const isAllowed =
    authResult.allowed ||
    cloudRole === "Intern" ||
    cloudRole === "Admin" ||
    cloudRole === "Super Admin";

  // If user is not appointed as an Intern or Admin: Show access restricted screen
  if (!isAllowed) {
    const userRole = cloudRole || authResult.role || "Customer / Client";

    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8F7F4] px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border border-neutral-200/80 bg-white p-7 sm:p-8 shadow-xs text-center space-y-6">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-amber-50 text-amber-600 ring-1 ring-amber-200">
            <Lock className="h-7 w-7 text-amber-600" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700 border border-amber-200">
              <AlertCircle className="h-3 w-3 text-amber-600" />
              <span>Intern Appointment Required</span>
            </div>

            <h1 className="font-['Plus_Jakarta_Sans',sans-serif] text-xl font-bold tracking-tight text-neutral-900">
              Workspace Access Restricted
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed">
              You are signed in as <strong className="text-neutral-800 font-medium">{user.email}</strong> with role <span className="font-semibold text-neutral-700">[{userRole}]</span>.
            </p>
          </div>

          <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-4 text-left text-xs text-neutral-600 space-y-1.5 leading-relaxed">
            <p className="font-semibold text-neutral-800">How to get access:</p>
            <p>
              1. Your account must be appointed as an <strong>Intern</strong> by an administrator in the Creare Mind Admin Panel.
            </p>
            <p>
              2. If you are an accepted intern, please inform your engineering mentor to update your role in <strong>User Management</strong>.
            </p>
          </div>

          <div className="pt-2 space-y-3">
            <Link
              to="/auth"
              search={{ redirect: "/intern" }}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-900 px-4 py-3 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <span>Sign In with Different Account</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              to="/"
              className="inline-block text-xs font-semibold text-neutral-500 hover:text-neutral-900 transition-colors"
            >
              Return to Website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const effectiveManagedUser: ManagedUser =
    authResult.managedUser ||
    cachedUsers.find((u) => u.email.toLowerCase() === user.email?.toLowerCase()) || {
      id: user.id ? user.id.slice(0, 8) : "10000001",
      name:
        (user.user_metadata?.full_name as string) ||
        (user.user_metadata?.name as string) ||
        user.email?.split("@")[0] ||
        "Intern",
      email: user.email?.toLowerCase() || "",
      phone: "—",
      provider: (user.app_metadata?.provider === "google" ? "Google OAuth" : "Email / Password") as ManagedUser["provider"],
      role: (cloudRole as ManagedUser["role"]) || "Intern",
      joinedDate: "Recently",
    };

  // 3. Authorized Intern or Admin: Render full Intern Workspace
  return (
    <InternWorkspacePage
      user={user}
      managedUser={effectiveManagedUser}
    />
  );
}

interface InternWorkspacePageProps {
  user: any;
  managedUser: ManagedUser | null;
}

function InternWorkspacePage({ user, managedUser }: InternWorkspacePageProps) {
  const store = useInternStore({ user, managedUser });
  const [currentTab, setCurrentTab] = useState<InternNavTab>("home");
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchPageQuery, setSearchPageQuery] = useState("");
  const [selectedTaskModal, setSelectedTaskModal] = useState<InternTask | null>(null);

  // If search query is typed, switch to work if on home
  useEffect(() => {
    if (searchQuery.trim() && currentTab === "home") {
      setCurrentTab("work");
    }
  }, [searchQuery, currentTab]);

  return (
    <div className="flex min-h-screen bg-[#F8F7F4] text-[#111111] font-sans antialiased selection:bg-neutral-900 selection:text-white">
      {/* 1. Persistent Left Sidebar */}
      <InternSidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        isOpenMobile={isOpenMobile}
        onCloseMobile={() => setIsOpenMobile(false)}
        profile={store.profile}
        searchPageQuery={searchPageQuery}
        onSearchPageChange={setSearchPageQuery}
      />

      {/* 2. Main Content Wrapper */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <InternHeader
          currentTab={currentTab}
          onSelectTab={(tab) => {
            setCurrentTab(tab);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          onOpenMobileSidebar={() => setIsOpenMobile(true)}
          profile={store.profile}
          announcements={store.announcements}
          onMarkAnnouncementRead={store.markAnnouncementRead}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Scrollable Page Content Area with Bottom Padding for Utility Bar */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto pb-20">
          {currentTab === "home" && (
            <InternOverviewView
              profile={store.profile}
              tasks={store.tasks}
              projects={store.projects}
              schedule={store.schedule}
              onSelectTab={(tab) => {
                setCurrentTab(tab);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              onOpenTaskModal={(task) => setSelectedTaskModal(task)}
              onOpenProjectModal={() => {
                setCurrentTab("projects");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          )}

          {currentTab === "work" && (
            <InternTasksView
              tasks={store.tasks}
              onUpdateStatus={store.updateTaskStatus}
              onSubmitWork={store.submitTaskWork}
              onOpenTaskModal={(task) => setSelectedTaskModal(task)}
            />
          )}

          {currentTab === "projects" && (
            <InternProjectsView
              projects={store.projects}
              onOpenProjectModal={() => {}}
            />
          )}

          {(currentTab === "calendar" || currentTab === "planner") && (
            <InternCalendarView schedule={store.schedule} />
          )}

          {(currentTab === "attendance" || currentTab === "leave") && (
            <InternAttendanceView
              attendance={store.attendance}
              isCheckedIn={store.isCheckedIn}
              checkInTime={store.checkInTime}
              checkOutTime={store.checkOutTime}
              onToggleCheckIn={store.toggleCheckIn}
            />
          )}

          {(currentTab === "community" || currentTab === "feed" || currentTab === "reels") && (
            <InternAnnouncementsView
              announcements={store.announcements}
              onMarkRead={store.markAnnouncementRead}
            />
          )}

          {currentTab === "performance" && (
            <InternPerformanceView
              profile={store.profile}
              tasks={store.tasks}
              attendance={store.attendance}
            />
          )}

          {currentTab === "resources" && (
            <InternResourcesView resources={store.resources} />
          )}

          {currentTab === "profile" && (
            <InternProfileView
              profile={store.profile}
              onUpdateProfile={store.updateProfile}
            />
          )}

          {currentTab === "help" && <InternHelpView profile={store.profile} />}

          {currentTab === "settings" && <InternSettingsView profile={store.profile} />}
        </main>
      </div>

      {/* 3. Fixed Bottom Utility Bar */}
      <InternBottomBar
        profile={store.profile}
        onOpenHelp={() => setCurrentTab("help")}
        onOpenSearch={() => {
          const el = document.querySelector<HTMLInputElement>("input[placeholder='Search...']");
          if (el) el.focus();
        }}
      />

      {/* Task Details & Work Submission Modal */}
      {selectedTaskModal && (
        <InternTaskDetailModal
          task={selectedTaskModal}
          onClose={() => setSelectedTaskModal(null)}
          onUpdateStatus={(id, status) => {
            store.updateTaskStatus(id, status);
            setSelectedTaskModal((prev) => (prev ? { ...prev, status } : null));
          }}
          onSubmitWork={(id, data) => {
            store.submitTaskWork(id, data);
            setSelectedTaskModal((prev) =>
              prev
                ? {
                    ...prev,
                    status: "Under Review",
                    submission: {
                      notes: data.notes,
                      link: data.link,
                      submittedAt: "Just now",
                      fileCount: data.fileCount || 1,
                    },
                  }
                : null
            );
          }}
        />
      )}
    </div>
  );
}
