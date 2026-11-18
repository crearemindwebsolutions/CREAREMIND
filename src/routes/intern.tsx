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
import {
  fetchInternPasswordHashFromCloud,
  saveInternPassword,
  verifyInternPassword,
  isInternUnlocked,
  setInternUnlocked,
} from "@/lib/intern-auth";
import { useInternStore } from "@/lib/use-intern-store";
import type { InternTask } from "@/lib/intern-data";
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
import { LogoMark } from "@/components/site/Logo";
import {
  ShieldCheck,
  Lock,
  Unlock,
  AlertCircle,
  ArrowRight,
  Key,
  Eye,
  EyeOff,
  Check,
  Sparkles,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

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

  // Password & Security Lock states
  const [hasPassword, setHasPassword] = useState<boolean | null>(null);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [confirmPasswordInput, setConfirmPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
  const [showPasswordText, setShowPasswordText] = useState(false);

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
      fetchInternPasswordHashFromCloud(user.email),
    ])
      .then(([role, users, hash]) => {
        if (isMounted) {
          setCloudRole(role);
          setCachedUsers(users);
          setHasPassword(Boolean(hash));
          setIsUnlocked(isInternUnlocked(user.email!));
          setIsVerifying(false);
        }
      })
      .catch(() => {
        if (isMounted) setIsVerifying(false);
      });

    const handleLockChanged = (e: any) => {
      if (e.detail?.email?.toLowerCase() === user.email?.toLowerCase()) {
        setIsUnlocked(Boolean(e.detail.unlocked));
      }
    };
    window.addEventListener("creare_intern_lock_changed", handleLockChanged);

    return () => {
      isMounted = false;
      window.removeEventListener("creare_intern_lock_changed", handleLockChanged);
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
              1. Your account must be selected and appointed as an <strong>Intern</strong> by a Creare Mind Administrator in User Management.
            </p>
            <p>
              2. If you are an accepted intern, please inform your engineering mentor to update your role.
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
      id: user.id ? user.id.slice(0, 8) : "54360931",
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

  // 3. FIRST-TIME INTERN SETUP: Prompt to create a private workspace password
  if (hasPassword === false) {
    const handleSetupPassword = async (e: React.FormEvent) => {
      e.preventDefault();
      setPasswordError("");

      if (!passwordInput || passwordInput.trim().length < 6) {
        setPasswordError("Password must be at least 6 characters long.");
        return;
      }

      if (passwordInput !== confirmPasswordInput) {
        setPasswordError("Passwords do not match. Please verify.");
        return;
      }

      setIsSubmittingPassword(true);
      try {
        const email = user.email!.trim().toLowerCase();
        await saveInternPassword(email, passwordInput);
        setHasPassword(true);
        setIsUnlocked(true);
        toast.success(`Welcome ${effectiveManagedUser.name}! Your workspace password has been activated.`);
      } catch {
        setPasswordError("Failed to save password. Please try again.");
      } finally {
        setIsSubmittingPassword(false);
      }
    };

    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8F7F4] px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border border-neutral-200/80 bg-white p-7 sm:p-8 shadow-xl space-y-6">
          <div className="text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
              <Key className="h-6 w-6 text-emerald-600" />
            </div>

            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-mono uppercase tracking-wider font-semibold mb-2">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>First-Time Intern Setup</span>
              </span>
              <h1 className="text-xl font-bold tracking-tight text-neutral-900">
                Create Your Workspace Password
              </h1>
              <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                Welcome, <strong>{effectiveManagedUser.name}</strong>! Please choose a private password to secure your
                Creare Mind Intern Workspace and unlock your dashboard.
              </p>
            </div>
          </div>

          {/* Intern Verification Details Box */}
          <div className="p-3.5 rounded-xl border border-neutral-200/80 bg-neutral-50/70 text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-neutral-500">Selected Intern:</span>
              <span className="font-semibold text-neutral-800">{effectiveManagedUser.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Intern ID:</span>
              <span className="font-mono font-bold text-neutral-900">{effectiveManagedUser.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Email:</span>
              <span className="font-mono text-neutral-700">{effectiveManagedUser.email}</span>
            </div>
          </div>

          <form onSubmit={handleSetupPassword} className="space-y-4 text-xs">
            {passwordError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{passwordError}</span>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-500 mb-1 font-semibold">
                Create Access Password (min 6 characters) *
              </label>
              <div className="relative">
                <input
                  type={showPasswordText ? "text" : "password"}
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Enter your private password"
                  className="w-full h-11 px-3.5 pr-10 rounded-xl border border-neutral-200 bg-white text-xs text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-neutral-900 shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordText(!showPasswordText)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                >
                  {showPasswordText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-500 mb-1 font-semibold">
                Confirm Access Password *
              </label>
              <input
                type={showPasswordText ? "text" : "password"}
                required
                value={confirmPasswordInput}
                onChange={(e) => setConfirmPasswordInput(e.target.value)}
                placeholder="Re-enter your password"
                className="w-full h-11 px-3.5 rounded-xl border border-neutral-200 bg-white text-xs text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-neutral-900 shadow-2xs"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmittingPassword}
              className="w-full h-11 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
            >
              {isSubmittingPassword ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Securing Workspace...</span>
                </>
              ) : (
                <>
                  <Key className="w-4 h-4" />
                  <span>Set Password & Enter Dashboard</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 4. RETURNING INTERN / LOCKED SESSION: Prompt for Workspace Access Password
  if (hasPassword === true && !isUnlocked) {
    const handleUnlock = async (e: React.FormEvent) => {
      e.preventDefault();
      setPasswordError("");

      if (!passwordInput.trim()) {
        setPasswordError("Please enter your workspace access password.");
        return;
      }

      setIsSubmittingPassword(true);
      try {
        const email = user.email!.trim().toLowerCase();
        const valid = await verifyInternPassword(email, passwordInput);
        if (valid) {
          setIsUnlocked(true);
          setPasswordInput("");
          toast.success(`Welcome back, ${effectiveManagedUser.name}!`);
        } else {
          setPasswordError("Incorrect password. Please verify and try again.");
        }
      } catch {
        setPasswordError("Authentication verification error. Please retry.");
      } finally {
        setIsSubmittingPassword(false);
      }
    };

    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8F7F4] px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border border-neutral-200/80 bg-white p-7 sm:p-8 shadow-xl space-y-6">
          <div className="text-center space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-900 text-white shadow-md font-mono text-base font-bold">
              {effectiveManagedUser.name
                .split(" ")
                .filter(Boolean)
                .map((n) => n[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()}
            </div>

            <div>
              <h1 className="text-xl font-bold tracking-tight text-neutral-900">
                Unlock Intern Workspace
              </h1>
              <p className="text-xs text-neutral-500 mt-1">
                Enter your workspace access password to view your dashboard.
              </p>
            </div>
          </div>

          {/* Intern Profile Strip */}
          <div className="p-3.5 rounded-xl border border-neutral-200/80 bg-neutral-50/70 text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-neutral-900">{effectiveManagedUser.name}</span>
              <span className="font-mono text-[11px] font-bold text-neutral-700 bg-white px-2 py-0.5 rounded border border-neutral-200">
                ID: {effectiveManagedUser.id}
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 font-mono">{effectiveManagedUser.email}</p>
          </div>

          <form onSubmit={handleUnlock} className="space-y-4 text-xs">
            {passwordError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{passwordError}</span>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 font-semibold">
                  Workspace Access Password *
                </label>
              </div>
              <div className="relative">
                <input
                  type={showPasswordText ? "text" : "password"}
                  required
                  autoFocus
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Enter your workspace password"
                  className="w-full h-11 px-3.5 pr-10 rounded-xl border border-neutral-200 bg-white text-xs text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-neutral-900 shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordText(!showPasswordText)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                >
                  {showPasswordText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmittingPassword}
              className="w-full h-11 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
            >
              {isSubmittingPassword ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Password...</span>
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4" />
                  <span>Unlock Dashboard</span>
                </>
              )}
            </button>

            <div className="pt-2 text-center space-y-2">
              <p className="text-[11px] text-neutral-400">
                Forgot password? Contact your mentor (Gowthaman PR) or admin to reset it.
              </p>
              <Link
                to="/auth"
                search={{ redirect: "/intern" }}
                className="inline-block text-xs font-semibold text-neutral-500 hover:text-neutral-900"
              >
                Sign in with different account &rarr;
              </Link>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // 5. Authorized & Password Unlocked: Render the brand new, rich Intern Dashboard!
  return (
    <InternWorkspacePage
      user={user}
      managedUser={effectiveManagedUser}
      onLockWorkspace={() => setInternUnlocked(user.email!, false)}
    />
  );
}

interface InternWorkspacePageProps {
  user: any;
  managedUser: ManagedUser | null;
  onLockWorkspace: () => void;
}

function InternWorkspacePage({ user, managedUser, onLockWorkspace }: InternWorkspacePageProps) {
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
          onLockWorkspace={onLockWorkspace}
        />

        {/* Scrollable Page Content Area with Bottom Padding for Utility Bar */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto pb-20">
          {currentTab === "home" && (
            <InternOverviewView
              profile={store.profile}
              tasks={store.tasks}
              projects={store.projects}
              schedule={store.schedule}
              attendance={store.attendance}
              isCheckedIn={store.isCheckedIn}
              checkInTime={store.checkInTime}
              checkOutTime={store.checkOutTime}
              onToggleCheckIn={store.toggleCheckIn}
              onSelectTab={(tab) => {
                setCurrentTab(tab);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              onOpenTaskModal={(task) => setSelectedTaskModal(task)}
              onOpenProjectModal={() => {
                setCurrentTab("projects");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              onAddTask={store.addTask}
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
