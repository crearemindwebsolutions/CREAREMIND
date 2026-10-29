import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";
import {
  User,
  Mail,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Check,
  Copy,
  ExternalLink,
  Key,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  LogOut,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  Layers,
  FileCode2,
  Phone,
  Edit3,
  Upload,
  Settings,
} from "lucide-react";
import { isAdmin, PRIMARY_ADMIN_EMAIL } from "@/lib/admin";
import { format8DigitUserId } from "@/lib/user-id";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "My Profile & Account — Creare Mind" },
      { name: "description", content: "Manage your Creare Mind account profile and security settings." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ProfilePage,
});

interface PasswordRules {
  minLength: boolean;
  hasUpper: boolean;
  hasLower: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

function checkPasswordRules(pass: string): PasswordRules {
  return {
    minLength: pass.length >= 8,
    hasUpper: /[A-Z]/.test(pass),
    hasLower: /[a-z]/.test(pass),
    hasNumber: /[0-9]/.test(pass),
    hasSpecial: /[^A-Za-z0-9]/.test(pass),
  };
}

function isPasswordStrong(rules: PasswordRules): boolean {
  return (
    rules.minLength &&
    rules.hasUpper &&
    rules.hasLower &&
    rules.hasNumber &&
    rules.hasSpecial
  );
}

function getStrengthScore(rules: PasswordRules): number {
  return [
    rules.minLength,
    rules.hasUpper,
    rules.hasLower,
    rules.hasNumber,
    rules.hasSpecial,
  ].filter(Boolean).length;
}

type TabType = "overview" | "edit" | "security" | "workspace" | "admin";

function ProfilePage() {
  const { user, ready } = useSession();
  const navigate = useNavigate();
  const userIsAdmin = isAdmin(user);

  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [, setProfileLoading] = useState(true);

  // Profile fields
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarImgError, setAvatarImgError] = useState(false);

  // Update profile states
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // Password change states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // Copy feedback
  const [copiedId, setCopiedId] = useState(false);

  // Password rules
  const passwordRules = checkPasswordRules(newPassword);
  const passwordScore = getStrengthScore(passwordRules);
  const isPassValid = isPasswordStrong(passwordRules);

  // Redirect if unauthenticated
  useEffect(() => {
    if (ready && !user) {
      navigate({ to: "/auth", search: { redirect: "/profile" }, replace: true });
    }
  }, [ready, user, navigate]);

  // Load profile from Supabase
  useEffect(() => {
    if (!user) return;

    setProfileLoading(true);
    supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!error && data) {
          setFullName(data.full_name ?? user.user_metadata?.full_name ?? "");
        } else {
          setFullName(user.user_metadata?.full_name ?? "");
        }
        setPhone(user.user_metadata?.phone ?? user.phone ?? "");
        setProfileLoading(false);
      });
  }, [user]);

  const handleCopyId = () => {
    if (!user?.id) return;
    navigator.clipboard.writeText(eightDigitUserId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSavingProfile(true);
    setProfileMsg(null);

    try {
      // Update profiles table
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: user.id,
        full_name: fullName.trim(),
        updated_at: new Date().toISOString(),
      });

      if (profileError) throw profileError;

      // Also update auth user metadata
      await supabase.auth.updateUser({
        data: {
          full_name: fullName.trim(),
          phone: phone.trim(),
        },
      });

      setProfileMsg({ ok: true, text: "Profile details saved successfully!" });
    } catch (err: unknown) {
      const error = err as Error;
      setProfileMsg({ ok: false, text: error.message || "Failed to update profile." });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!currentPassword) {
      setPasswordMsg({
        ok: false,
        text: "Please enter your current password.",
      });
      return;
    }

    if (!isPassValid) {
      setPasswordMsg({
        ok: false,
        text: "Password must meet all 5 security requirements.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMsg({
        ok: false,
        text: "Passwords do not match. Please re-enter carefully.",
      });
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordMsg({
        ok: false,
        text: "New password cannot be the same as your current password.",
      });
      return;
    }

    setSavingPassword(true);
    setPasswordMsg(null);

    // Verify current password with Supabase for email accounts
    const isDev = typeof window !== "undefined" && !!localStorage.getItem("creare_dev_session");
    if (user.email && !isGoogleUser && !isDev) {
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (verifyError) {
        setSavingPassword(false);
        setPasswordMsg({
          ok: false,
          text: "Current password is incorrect. Please verify and try again.",
        });
        return;
      }
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    setSavingPassword(false);

    if (error) {
      setPasswordMsg({ ok: false, text: error.message });
    } else {
      setPasswordMsg({ ok: true, text: "Your password has been changed successfully!" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const handleSignOut = async () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("creare_dev_session");
    }
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  };

  if (!ready || !user) {
    return (
      <section className="grid min-h-screen place-items-center bg-paper px-5 py-32 text-ink">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-ink border-t-transparent" />
          <p className="text-sm text-ink-muted">Loading your profile…</p>
        </div>
      </section>
    );
  }

  const avatarInitial = (() => {
    if (fullName && fullName.trim()) {
      const parts = fullName.trim().split(/\s+/).filter(Boolean);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return parts[0].slice(0, 2).toUpperCase();
    }
    if (user?.email) {
      const namePart = user.email.split("@")[0];
      return namePart.slice(0, 2).toUpperCase();
    }
    return "CM";
  })();
  const avatarUrl = user.user_metadata?.avatar_url;
  const eightDigitUserId = format8DigitUserId(user.id);
  const isGoogleUser = user.app_metadata?.provider === "google";
  const joinedDate = user.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "Recently";

  const inputClass =
    "h-12 w-full border border-ink/20 bg-paper px-4 text-sm text-ink outline-none transition-colors focus:border-ink";

  return (
    <section className="min-h-screen bg-paper px-5 pb-24 pt-32 text-ink md:px-10 lg:pt-36">
      <div className="mx-auto max-w-5xl">
        {/* Breadcrumb / Top Bar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-ink/10 pb-4 text-xs text-ink-muted">
          <div className="flex items-center gap-2">
            <Link to="/" className="hover:text-ink">Home</Link>
            <span>/</span>
            <span className="font-medium text-ink">Account Profile</span>
          </div>
          <div className="flex items-center gap-3">
            {userIsAdmin && (
              <Link
                to="/admin"
                className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-[11px] font-semibold text-indigo-600 hover:bg-indigo-500/20 transition-colors"
              >
                <ShieldAlert className="h-3.5 w-3.5 text-indigo-600" />
                <span>Admin Console</span>
              </Link>
            )}
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-600/20 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
              Active Account
            </span>
          </div>
        </div>

        {/* Hero Profile Identity Card */}
        <div className="relative mb-10 overflow-hidden rounded-2xl border border-ink/15 bg-paper-2/70 p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
              {/* Avatar circle */}
              <div className="relative">
                {avatarUrl && !avatarImgError ? (
                  <img
                    src={avatarUrl}
                    alt=""
                    referrerPolicy="no-referrer"
                    crossOrigin="anonymous"
                    onError={() => setAvatarImgError(true)}
                    className="h-20 w-20 rounded-full border-2 border-ink/20 object-cover shadow-sm md:h-24 md:w-24"
                  />
                ) : (
                  <div className="grid h-20 w-20 place-items-center rounded-full border-2 border-neutral-300 bg-neutral-900 text-2xl font-bold tracking-wider text-white shadow-md md:h-24 md:w-24 md:text-3xl font-mono select-none">
                    {avatarInitial}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 grid h-7 w-7 place-items-center rounded-full border-2 border-paper bg-emerald-600 text-white shadow" title="Account Verified">
                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                </div>
              </div>

              {/* Name & Basic details */}
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
                    {fullName || "Creare Mind Member"}
                  </h1>
                  {userIsAdmin && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-amber-600">
                      <ShieldCheck className="h-3.5 w-3.5 text-amber-600" />
                      Administrator
                    </span>
                  )}
                </div>

                <p className="flex items-center gap-2 text-sm text-ink-muted">
                  <Mail className="h-3.5 w-3.5" />
                  <span>{user.email}</span>
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-ink-muted">
                  <button
                    type="button"
                    onClick={handleCopyId}
                    className="group inline-flex items-center gap-1.5 rounded border border-ink/15 bg-paper px-2 py-0.5 hover:border-ink hover:text-ink transition-colors"
                    title="Click to copy User ID"
                  >
                    <span className="font-mono text-[11px] font-semibold text-neutral-800">ID: {eightDigitUserId}</span>
                    {copiedId ? (
                      <Check className="h-3 w-3 text-emerald-600" />
                    ) : (
                      <Copy className="h-3 w-3 group-hover:scale-110 transition-transform" />
                    )}
                  </button>

                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Joined {joinedDate}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-2 md:pt-0">
              {userIsAdmin && (
                <Link
                  to="/admin"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-white shadow-md hover:from-indigo-500 hover:to-violet-500 transition-all hover:scale-[1.02] active:scale-95"
                >
                  <ShieldAlert className="h-3.5 w-3.5" />
                  <span>Enter Admin Panel</span>
                </Link>
              )}
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex items-center gap-2 border border-ink/20 bg-paper px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-ink transition-colors hover:bg-red-50 hover:border-red-400 hover:text-red-600"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8 flex flex-wrap gap-2 border-b border-ink/10 pb-3">
          {[
            { id: "overview", label: "Account Overview", icon: Sparkles },
            ...(userIsAdmin ? [{ id: "admin", label: "Admin Portal", icon: ShieldAlert }] : []),
            { id: "edit", label: "Edit Profile", icon: User },
            { id: "security", label: "Security & Credentials", icon: Key },
            { id: "workspace", label: "Services & Ecosystem", icon: Layers },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold tracking-wide transition-all ${
                  active
                    ? "bg-ink text-paper shadow-sm"
                    : "text-ink-muted hover:bg-paper-2 hover:text-ink"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab 1: Account Overview */}
        {activeTab === "overview" && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Account Details Card */}
            <div className="rounded-2xl border border-ink/15 bg-paper p-6 md:p-8">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between border-b border-ink/10 pb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="label-xs text-ink-muted">Account Profile</span>
                    <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
                      Verified Member
                    </span>
                  </div>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
                    {fullName || "Creare Mind User"}
                  </h2>
                  <p className="mt-1 text-sm text-ink-muted">
                    Your authenticated account for Creare Mind software development, apps, and digital services.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab("edit")}
                    className="btn-ink text-xs inline-flex items-center gap-2"
                  >
                    <span>Edit Profile Details</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Highlights Grid */}
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-xl border border-ink/10 bg-paper-2/50 p-4">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-emerald-600" />
                    <p className="text-xs font-medium text-ink-muted">Email Address</p>
                  </div>
                  <p className="mt-1.5 font-semibold text-sm truncate">{user.email}</p>
                  <p className="mt-1 text-[11px] text-ink-muted">Verified login credential</p>
                </div>

                <div className="rounded-xl border border-ink/10 bg-paper-2/50 p-4">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-emerald-600" />
                    <p className="text-xs font-medium text-ink-muted">Phone / WhatsApp</p>
                  </div>
                  <p className="mt-1.5 font-semibold text-sm">{phone || "Not added yet"}</p>
                  <p className="mt-1 text-[11px] text-ink-muted">Direct project communication channel</p>
                </div>

                <div className="rounded-xl border border-ink/10 bg-paper-2/50 p-4">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-emerald-600" />
                    <p className="text-xs font-medium text-ink-muted">Account Security</p>
                  </div>
                  <p className="mt-1.5 font-semibold text-sm">Protected & Encrypted</p>
                  <p className="mt-1 text-[11px] text-ink-muted">Argon2 / OAuth SSL 256-bit encryption</p>
                </div>
              </div>
            </div>

            {/* Quick Workspace Access Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <Link
                to="/services"
                className="group rounded-2xl border border-ink/15 bg-paper p-6 transition-all hover:border-ink hover:shadow-md"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink text-paper group-hover:scale-105 transition-transform">
                  <Layers className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-semibold text-base">Development Services</h3>
                <p className="mt-1.5 text-xs text-ink-muted">
                  Explore mobile apps, shop billing POS counters, video editing and custom web software.
                </p>
                <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-ink group-hover:gap-2.5 transition-all">
                  <span>Explore services</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </Link>

              <Link
                to="/templates"
                className="group rounded-2xl border border-ink/15 bg-paper p-6 transition-all hover:border-ink hover:shadow-md"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink text-paper group-hover:scale-105 transition-transform">
                  <FileCode2 className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-semibold text-base">Design Templates</h3>
                <p className="mt-1.5 text-xs text-ink-muted">
                  Browse modern, high-converting templates crafted for restaurants, clinics, and startups.
                </p>
                <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-ink group-hover:gap-2.5 transition-all">
                  <span>Browse templates</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </Link>

              <a
                href="https://wa.me/918072719603?text=Hello%20Creare%20Mind,%20I'd%20like%20to%20discuss%20a%20project."
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-2xl border border-ink/15 bg-paper p-6 transition-all hover:border-ink hover:shadow-md"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink text-paper group-hover:scale-105 transition-transform">
                  <Phone className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-semibold text-base">Direct Project Desk</h3>
                <p className="mt-1.5 text-xs text-ink-muted">
                  Chat directly with our engineering team on WhatsApp to discuss custom builds or project scope.
                </p>
                <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-ink group-hover:gap-2.5 transition-all">
                  <span>Open WhatsApp chat</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </a>
            </div>
          </div>
        )}

        {/* Tab: Admin Portal */}
        {activeTab === "admin" && userIsAdmin && (
          <div className="rounded-2xl border border-indigo-500/25 bg-paper p-6 md:p-8 animate-in fade-in duration-300 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-ink/10 pb-6">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-600 font-mono uppercase tracking-wider">
                    System Control Center
                  </span>
                  <span className="text-xs text-ink-muted">Master Admin: {PRIMARY_ADMIN_EMAIL}</span>
                </div>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl text-ink">
                  Creare Mind Admin Control Panel
                </h2>
                <p className="mt-1 text-sm text-ink-muted max-w-2xl">
                  Full administrative permissions to edit photos, videos, services, templates, and site configuration live across the entire website.
                </p>
              </div>

              <Link
                to="/admin"
                className="btn-ink text-xs inline-flex items-center gap-2 self-start sm:self-center"
              >
                <span>Launch Full Admin Console</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link
                to="/admin"
                className="group rounded-xl border border-ink/10 bg-paper-2/60 p-5 hover:border-indigo-500/40 hover:shadow-md transition-all"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 text-white group-hover:scale-105 transition-transform">
                  <Upload className="h-5 w-5" />
                </div>
                <h3 className="mt-3 font-semibold text-sm">Media & Videos</h3>
                <p className="mt-1 text-xs text-ink-muted leading-relaxed">
                  Upload photos and videos to Cloudinary CDN and assign them to any section.
                </p>
                <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-indigo-600 group-hover:gap-2 transition-all">
                  <span>Manage media</span>
                  <ArrowRight className="h-3 w-3" />
                </div>
              </Link>

              <Link
                to="/admin"
                className="group rounded-xl border border-ink/10 bg-paper-2/60 p-5 hover:border-indigo-500/40 hover:shadow-md transition-all"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 text-white group-hover:scale-105 transition-transform">
                  <Layers className="h-5 w-5" />
                </div>
                <h3 className="mt-3 font-semibold text-sm">Templates & Showcase</h3>
                <p className="mt-1 text-xs text-ink-muted leading-relaxed">
                  Edit the portfolio deliverables, mockups, titles, and categories across the website.
                </p>
                <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-indigo-600 group-hover:gap-2 transition-all">
                  <span>Manage templates</span>
                  <ArrowRight className="h-3 w-3" />
                </div>
              </Link>

              <Link
                to="/admin"
                className="group rounded-xl border border-ink/10 bg-paper-2/60 p-5 hover:border-indigo-500/40 hover:shadow-md transition-all"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 text-white group-hover:scale-105 transition-transform">
                  <Settings className="h-5 w-5" />
                </div>
                <h3 className="mt-3 font-semibold text-sm">Site Settings & Contact</h3>
                <p className="mt-1 text-xs text-ink-muted leading-relaxed">
                  Update global phone, address, top announcement banner, and social links.
                </p>
                <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-indigo-600 group-hover:gap-2 transition-all">
                  <span>Update site settings</span>
                  <ArrowRight className="h-3 w-3" />
                </div>
              </Link>
            </div>
          </div>
        )}

        {/* Tab 2: Edit Profile */}
        {activeTab === "edit" && (
          <div className="rounded-2xl border border-ink/15 bg-paper p-6 md:p-8 animate-in fade-in duration-300">
            <div className="mb-6 border-b border-ink/10 pb-4">
              <h2 className="text-xl font-semibold tracking-tight">Personal Information</h2>
              <p className="text-xs text-ink-muted mt-1">
                Update your display name, contact information, and public profile data.
              </p>
            </div>

            <form onSubmit={handleSaveProfile} className="max-w-xl space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    disabled
                    value={user.email}
                    className={`${inputClass} bg-paper-2 cursor-not-allowed pr-28`}
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600">
                    Verified
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-ink-muted">
                  Email address is linked to your authentication credentials and cannot be edited directly.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2">
                  Phone / WhatsApp Number (Optional)
                </label>
                <input
                  type="tel"
                  placeholder="+91 80727 19603"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={inputClass}
                />
                <p className="mt-1 text-[11px] text-ink-muted">
                  Used by our engineers to reach out via WhatsApp for project milestones and deliverables.
                </p>
              </div>

              {profileMsg && (
                <div
                  className={`flex items-center gap-2 rounded-lg p-3 text-xs ${
                    profileMsg.ok
                      ? "border border-emerald-500/20 bg-emerald-50 text-emerald-700"
                      : "border border-destructive/20 bg-red-50 text-destructive"
                  }`}
                >
                  {profileMsg.ok ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                  ) : (
                    <AlertCircle className="h-4 w-4 shrink-0" />
                  )}
                  <span>{profileMsg.text}</span>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="btn-ink disabled:opacity-50"
                >
                  {savingProfile ? "Saving changes…" : "Save Profile Details"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 3: Security & Password */}
        {activeTab === "security" && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Account Security Overview Card */}
            <div className="rounded-2xl border border-ink/15 bg-paper p-6 md:p-8">
              <div className="mb-6 border-b border-ink/10 pb-4">
                <h2 className="text-xl font-semibold tracking-tight">Security & Authentication</h2>
                <p className="text-xs text-ink-muted mt-1">
                  Manage your sign-in credentials, password complexity, and account integrity.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="rounded-xl border border-ink/10 bg-paper-2/50 p-4">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-emerald-600" />
                    <span className="text-xs font-medium text-ink-muted">Sign-in Method</span>
                  </div>
                  <p className="mt-1.5 font-semibold text-sm">
                    {isGoogleUser ? "Google OAuth 2.0" : "Email & Strong Password"}
                  </p>
                  <p className="mt-1 text-[11px] text-ink-muted">
                    {isGoogleUser
                      ? "Authenticated via Google Single Sign-On"
                      : "Secured with Argon2 / bcrypt password hashing"}
                  </p>
                </div>

                <div className="rounded-xl border border-ink/10 bg-paper-2/50 p-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-emerald-600" />
                    <span className="text-xs font-medium text-ink-muted">Session Status</span>
                  </div>
                  <p className="mt-1.5 font-semibold text-sm">Active & Encrypted</p>
                  <p className="mt-1 text-[11px] text-ink-muted">
                    SSL 256-bit encryption with Supabase JWT token refresh
                  </p>
                </div>
              </div>

              {/* Password Change Form */}
              <div className="border-t border-ink/10 pt-6">
                <h3 className="text-base font-semibold tracking-tight">Change Password</h3>
                <p className="text-xs text-ink-muted mt-1 mb-5">
                  Set a new strong password requiring uppercase, lowercase, numbers, and special characters.
                </p>

                <form onSubmit={handleChangePassword} className="max-w-xl space-y-4">
                  {/* Current Password */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        required
                        type={showCurrentPassword ? "text" : "password"}
                        placeholder="Enter current password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className={`${inputClass} pr-11`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword((v) => !v)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-muted transition-colors hover:text-ink focus:outline-none"
                        aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        required
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className={`${inputClass} pr-11`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword((v) => !v)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-muted transition-colors hover:text-ink focus:outline-none"
                        aria-label={showNewPassword ? "Hide password" : "Show password"}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Password Strength Checklist & Bar */}
                  {newPassword.length > 0 && (
                    <div className="space-y-2 rounded-lg border border-ink/10 bg-paper-2/60 p-3 text-xs animate-in fade-in duration-200">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-medium text-ink-muted">Password Strength</span>
                        <span
                          className={`text-[11px] font-semibold ${
                            passwordScore <= 2
                              ? "text-red-500"
                              : passwordScore < 5
                              ? "text-amber-500"
                              : "text-emerald-600"
                          }`}
                        >
                          {passwordScore <= 2 ? "Weak" : passwordScore < 5 ? "Moderate" : "Strong"}
                        </span>
                      </div>

                      {/* 5-segment bar */}
                      <div className="grid grid-cols-5 gap-1.5 h-1.5 w-full">
                        {[1, 2, 3, 4, 5].map((seg) => (
                          <div
                            key={seg}
                            className={`h-full rounded-full transition-all duration-300 ${
                              seg <= passwordScore
                                ? passwordScore <= 2
                                  ? "bg-red-500"
                                  : passwordScore < 5
                                  ? "bg-amber-500"
                                  : "bg-emerald-600"
                                : "bg-ink/10"
                            }`}
                          />
                        ))}
                      </div>

                      {/* Checklist */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1 text-[11px]">
                        {[
                          { met: passwordRules.minLength, text: "At least 8 characters" },
                          { met: passwordRules.hasUpper, text: "At least 1 uppercase (A-Z)" },
                          { met: passwordRules.hasLower, text: "At least 1 lowercase (a-z)" },
                          { met: passwordRules.hasNumber, text: "At least 1 number (0-9)" },
                          { met: passwordRules.hasSpecial, text: "At least 1 symbol (!@#$...)" },
                        ].map((req, i) => (
                          <div
                            key={i}
                            className={`flex items-center gap-1.5 transition-colors ${
                              req.met ? "text-emerald-600 font-medium" : "text-ink-muted"
                            }`}
                          >
                            <div
                              className={`grid h-3.5 w-3.5 shrink-0 place-items-center rounded-full transition-colors ${
                                req.met
                                  ? "bg-emerald-600 text-white"
                                  : "border border-ink/25 text-transparent"
                              }`}
                            >
                              <Check className="h-2 w-2 stroke-[3]" />
                            </div>
                            <span>{req.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        required
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Re-enter new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`${inputClass} pr-11`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((v) => !v)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-muted transition-colors hover:text-ink focus:outline-none"
                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {passwordMsg && (
                    <div
                      className={`flex items-center gap-2 rounded-lg p-3 text-xs ${
                        passwordMsg.ok
                          ? "border border-emerald-500/20 bg-emerald-50 text-emerald-700"
                          : "border border-destructive/20 bg-red-50 text-destructive"
                      }`}
                    >
                      {passwordMsg.ok ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                      ) : (
                        <AlertCircle className="h-4 w-4 shrink-0" />
                      )}
                      <span>{passwordMsg.text}</span>
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={savingPassword || !isPassValid || newPassword !== confirmPassword}
                      className="btn-ink disabled:opacity-50"
                    >
                      {savingPassword ? "Updating password…" : "Update Password"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Services & Ecosystem */}
        {activeTab === "workspace" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="rounded-2xl border border-ink/15 bg-paper p-6 md:p-8">
              <h2 className="text-xl font-semibold tracking-tight">Creare Mind Ecosystem</h2>
              <p className="text-xs text-ink-muted mt-1 mb-6">
                Quick access to dedicated modules, product suites, and direct engineering support.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-ink/10 bg-paper-2/40 p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Software Suite</span>
                    <span className="text-[11px] font-semibold text-emerald-600">Available</span>
                  </div>
                  <h3 className="mt-2 text-base font-semibold">Retail & Shop POS Billing</h3>
                  <p className="mt-1 text-xs text-ink-muted">
                    Fast barcode scanning, GST receipt printing, inventory tracking and offline-ready counter system.
                  </p>
                  <Link to="/services" className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold hover:underline">
                    <span>View POS details</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>

                <div className="rounded-xl border border-ink/10 bg-paper-2/40 p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Mobile Suite</span>
                    <span className="text-[11px] font-semibold text-emerald-600">Available</span>
                  </div>
                  <h3 className="mt-2 text-base font-semibold">Native iOS & Android Apps</h3>
                  <p className="mt-1 text-xs text-ink-muted">
                    Full lifecycle development from UI prototypes to App Store & Google Play Store release.
                  </p>
                  <Link to="/services" className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold hover:underline">
                    <span>View app engineering</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>

                <div className="rounded-xl border border-ink/10 bg-paper-2/40 p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Direct Channel</span>
                    <span className="text-[11px] font-semibold text-emerald-600">Live Support</span>
                  </div>
                  <h3 className="mt-2 text-base font-semibold">WhatsApp Project Desk</h3>
                  <p className="mt-1 text-xs text-ink-muted">
                    Get in touch with your assigned developer or manager directly for instant changes and feature requests.
                  </p>
                  <a
                    href="https://wa.me/918072719603?text=Hello%20Creare%20Mind%20team,%20I%20have%20an%20inquiry%20regarding%20my%20account."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:underline"
                  >
                    <span>Open WhatsApp Chat</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>

                <div className="rounded-xl border border-ink/10 bg-paper-2/40 p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Legal & Safety</span>
                    <span className="text-[11px] font-semibold text-ink-muted">Privacy First</span>
                  </div>
                  <h3 className="mt-2 text-base font-semibold">Terms & Data Protection</h3>
                  <p className="mt-1 text-xs text-ink-muted">
                    Review your account data rights, service level commitments, and security policies.
                  </p>
                  <div className="mt-4 flex items-center gap-4 text-xs font-semibold">
                    <Link to="/privacy" className="hover:underline">Privacy Policy</Link>
                    <Link to="/terms" className="hover:underline">Terms of Service</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
