import { Skeleton } from "@/components/ui/skeleton";

/**
 * Universal content page skeleton for Creare Mind public routes
 * (Services, Templates, About, Careers, Contact, Legal, and dynamic $slug pages)
 */
export function PageSkeleton() {
  return (
    <div className="min-h-screen bg-[#07080a] text-white px-5 pb-24 pt-28 sm:pt-36">
      <div className="mx-auto max-w-6xl space-y-12 animate-in fade-in duration-300">
        {/* Top Tag & Title Skeleton */}
        <div className="space-y-4 max-w-2xl">
          <Skeleton variant="dark" className="h-5 w-28 rounded-full" />
          <Skeleton variant="dark" className="h-10 sm:h-14 w-full sm:w-3/4 rounded-2xl" />
          <Skeleton variant="dark" className="h-4 sm:h-5 w-5/6 rounded-lg" />
          <Skeleton variant="dark" className="h-4 sm:h-5 w-2/3 rounded-lg" />
        </div>

        {/* Buttons / Actions Skeleton */}
        <div className="flex flex-wrap gap-3 pt-2">
          <Skeleton variant="dark" className="h-11 w-36 rounded-xl" />
          <Skeleton variant="dark" className="h-11 w-44 rounded-xl" />
        </div>

        {/* Hero Visual Container Skeleton */}
        <div className="relative rounded-3xl border border-white/10 bg-white/[0.02] p-4 sm:p-6 overflow-hidden">
          <Skeleton variant="dark" className="aspect-video w-full rounded-2xl" />
        </div>

        {/* Feature / Information Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 space-y-4"
            >
              <Skeleton variant="dark" className="h-10 w-10 rounded-xl" />
              <Skeleton variant="dark" className="h-6 w-3/4 rounded-lg" />
              <Skeleton variant="dark" className="h-4 w-full rounded-md" />
              <Skeleton variant="dark" className="h-4 w-5/6 rounded-md" />
              <Skeleton variant="dark" className="h-4 w-1/2 rounded-md pt-2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Homepage Luxury Skeleton Loader
 */
export function HomeSkeleton() {
  return (
    <div className="min-h-screen bg-[#07080a] text-white px-5 pb-24 pt-28 sm:pt-36">
      <div className="mx-auto max-w-7xl space-y-16 animate-in fade-in duration-300">
        {/* Hero Section */}
        <div className="text-center mx-auto max-w-3xl space-y-5 pt-8">
          <div className="flex justify-center">
            <Skeleton variant="dark" className="h-6 w-36 rounded-full" />
          </div>
          <Skeleton variant="dark" className="h-12 sm:h-20 w-full rounded-2xl mx-auto" />
          <Skeleton variant="dark" className="h-5 sm:h-6 w-4/5 rounded-lg mx-auto" />
          <div className="flex justify-center gap-4 pt-4">
            <Skeleton variant="dark" className="h-12 w-40 rounded-full" />
            <Skeleton variant="dark" className="h-12 w-36 rounded-full" />
          </div>
        </div>

        {/* Hero Media Showcase Skeleton */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-4 sm:p-6">
          <Skeleton variant="dark" className="aspect-[16/9] w-full rounded-2xl" />
        </div>

        {/* 4 Feature Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-3">
              <Skeleton variant="dark" className="h-8 w-8 rounded-lg" />
              <Skeleton variant="dark" className="h-5 w-2/3 rounded-md" />
              <Skeleton variant="dark" className="h-3.5 w-full rounded-md" />
              <Skeleton variant="dark" className="h-3.5 w-4/5 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * User Profile Skeleton (`/profile`)
 */
export function ProfileSkeleton() {
  return (
    <section className="min-h-screen bg-[#F8F7F4] px-5 pb-24 pt-28 text-neutral-900 md:px-10 lg:pt-36">
      <div className="mx-auto max-w-5xl space-y-8 animate-in fade-in duration-300">
        {/* Breadcrumb Skeleton */}
        <div className="flex items-center justify-between border-b border-neutral-200/80 pb-4">
          <div className="flex items-center gap-2">
            <Skeleton variant="light" className="h-4 w-14 rounded-md" />
            <span className="text-neutral-400">/</span>
            <Skeleton variant="light" className="h-4 w-28 rounded-md" />
          </div>
          <Skeleton variant="light" className="h-6 w-24 rounded-full" />
        </div>

        {/* Hero Profile Identity Card Skeleton */}
        <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 md:p-8 shadow-xs">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <Skeleton variant="light" className="h-20 w-20 md:h-24 md:w-24 rounded-full shrink-0" />
              <div className="space-y-2.5">
                <div className="flex items-center gap-3">
                  <Skeleton variant="light" className="h-7 w-48 rounded-lg" />
                  <Skeleton variant="light" className="h-5 w-24 rounded-full" />
                </div>
                <Skeleton variant="light" className="h-4 w-40 rounded-md" />
                <div className="flex items-center gap-3 pt-1">
                  <Skeleton variant="light" className="h-5 w-28 rounded-md" />
                  <Skeleton variant="light" className="h-4 w-24 rounded-md" />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Skeleton variant="light" className="h-10 w-32 rounded-xl" />
              <Skeleton variant="light" className="h-10 w-24 rounded-xl" />
            </div>
          </div>
        </div>

        {/* Tabs Bar Skeleton */}
        <div className="flex gap-2 border-b border-neutral-200/80 pb-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} variant="light" className="h-9 w-32 rounded-lg" />
          ))}
        </div>

        {/* Details Grid Skeleton */}
        <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 md:p-8 space-y-6">
          <div className="flex justify-between items-center border-b border-neutral-100 pb-5">
            <div className="space-y-2">
              <Skeleton variant="light" className="h-6 w-44 rounded-lg" />
              <Skeleton variant="light" className="h-4 w-80 rounded-md" />
            </div>
            <Skeleton variant="light" className="h-9 w-36 rounded-lg" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl border border-neutral-100 bg-[#FAF9F6] p-4 space-y-2.5">
                <Skeleton variant="light" className="h-4 w-24 rounded-md" />
                <Skeleton variant="light" className="h-5 w-36 rounded-md" />
                <Skeleton variant="light" className="h-3 w-44 rounded-md" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Admin Console Skeleton Loader (`/admin`)
 */
export function AdminSkeleton() {
  return (
    <div className="min-h-screen bg-[#F8F7F4] text-neutral-900 px-4 sm:px-8 py-6 space-y-6 animate-in fade-in duration-300">
      {/* Top Banner Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-200 pb-5">
        <div className="flex items-center gap-3">
          <Skeleton variant="light" className="h-10 w-10 rounded-xl" />
          <div className="space-y-1.5">
            <Skeleton variant="light" className="h-6 w-48 rounded-lg" />
            <Skeleton variant="light" className="h-3.5 w-64 rounded-md" />
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <Skeleton variant="light" className="h-9 w-28 rounded-xl" />
          <Skeleton variant="light" className="h-9 w-36 rounded-xl" />
        </div>
      </div>

      {/* 4 Summary Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-2xl border border-neutral-200 bg-white p-5 space-y-3 shadow-2xs">
            <div className="flex justify-between items-center">
              <Skeleton variant="light" className="h-4 w-24 rounded-md" />
              <Skeleton variant="light" className="h-8 w-8 rounded-lg" />
            </div>
            <Skeleton variant="light" className="h-8 w-16 rounded-md" />
            <Skeleton variant="light" className="h-3.5 w-32 rounded-md" />
          </div>
        ))}
      </div>

      {/* Navigation Tabs Bar Skeleton */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} variant="light" className="h-10 w-28 rounded-xl shrink-0" />
        ))}
      </div>

      {/* Main Table / Content Area Skeleton */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <Skeleton variant="light" className="h-10 w-full sm:w-72 rounded-xl" />
          <div className="flex gap-2">
            <Skeleton variant="light" className="h-10 w-32 rounded-xl" />
            <Skeleton variant="light" className="h-10 w-28 rounded-xl" />
          </div>
        </div>

        {/* Table Rows Skeleton */}
        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-xl border border-neutral-100 bg-[#FAF9F6] p-4"
            >
              <div className="flex items-center gap-3">
                <Skeleton variant="light" className="h-9 w-9 rounded-full" />
                <div className="space-y-1.5">
                  <Skeleton variant="light" className="h-4 w-40 rounded-md" />
                  <Skeleton variant="light" className="h-3 w-56 rounded-md" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Skeleton variant="light" className="h-6 w-20 rounded-full" />
                <Skeleton variant="light" className="h-8 w-24 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Intern Workspace Skeleton Loader (`/intern`)
 */
export function InternSkeleton() {
  return (
    <div className="flex min-h-screen bg-[#F8F7F4] text-neutral-900 animate-in fade-in duration-300">
      {/* Sidebar Skeleton (Desktop) */}
      <aside className="hidden lg:flex w-64 flex-col justify-between border-r border-neutral-200 bg-white p-5 shrink-0">
        <div className="space-y-6">
          {/* Logo Skeleton */}
          <div className="flex items-center gap-2.5 pb-2">
            <Skeleton variant="light" className="h-9 w-9 rounded-xl" />
            <div className="space-y-1">
              <Skeleton variant="light" className="h-4 w-28 rounded-md" />
              <Skeleton variant="light" className="h-3 w-20 rounded-md" />
            </div>
          </div>

          {/* Navigation Items */}
          <div className="space-y-1.5">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <Skeleton key={i} variant="light" className="h-10 w-full rounded-xl" />
            ))}
          </div>
        </div>

        {/* Bottom Profile Footer */}
        <div className="flex items-center gap-3 pt-4 border-t border-neutral-100">
          <Skeleton variant="light" className="h-10 w-10 rounded-full" />
          <div className="space-y-1.5">
            <Skeleton variant="light" className="h-3.5 w-24 rounded-md" />
            <Skeleton variant="light" className="h-2.5 w-16 rounded-md" />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-8 space-y-6">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between pb-2">
          <div className="space-y-1">
            <Skeleton variant="light" className="h-6 w-44 rounded-lg" />
            <Skeleton variant="light" className="h-3.5 w-24 rounded-md" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton variant="light" className="h-9 w-48 rounded-xl hidden sm:block" />
            <Skeleton variant="light" className="h-9 w-9 rounded-full" />
            <Skeleton variant="light" className="h-9 w-9 rounded-full" />
          </div>
        </div>

        {/* Welcome Hero Banner Skeleton */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xs space-y-3">
          <div className="flex items-center gap-4">
            <Skeleton variant="light" className="h-14 w-14 rounded-2xl shrink-0" />
            <div className="space-y-2">
              <Skeleton variant="light" className="h-6 w-60 rounded-lg" />
              <Skeleton variant="light" className="h-3.5 w-40 rounded-md" />
            </div>
          </div>
        </div>

        {/* 4 Summary Stats Cards Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-2xl border border-neutral-200 bg-white p-5 space-y-3 shadow-2xs">
              <div className="flex justify-between items-center">
                <Skeleton variant="light" className="h-3.5 w-28 rounded-md" />
                <Skeleton variant="light" className="h-7 w-7 rounded-lg" />
              </div>
              <Skeleton variant="light" className="h-8 w-14 rounded-md" />
              <Skeleton variant="light" className="h-3 w-32 rounded-md" />
            </div>
          ))}
        </div>

        {/* Task & Project Workspace Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xs space-y-4">
            <div className="flex justify-between items-center border-b border-neutral-100 pb-4">
              <Skeleton variant="light" className="h-5 w-32 rounded-md" />
              <Skeleton variant="light" className="h-8 w-24 rounded-lg" />
            </div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl border border-neutral-100 bg-[#FAF9F6] p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <Skeleton variant="light" className="h-4 w-48 rounded-md" />
                  <Skeleton variant="light" className="h-5 w-16 rounded-full" />
                </div>
                <Skeleton variant="light" className="h-3 w-36 rounded-md" />
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xs space-y-4">
            <Skeleton variant="light" className="h-5 w-36 rounded-md" />
            {[1, 2].map((i) => (
              <div key={i} className="rounded-xl border border-neutral-100 bg-[#FAF9F6] p-4 space-y-3">
                <Skeleton variant="light" className="h-4 w-28 rounded-md" />
                <Skeleton variant="light" className="h-2 w-full rounded-full" />
                <Skeleton variant="light" className="h-3 w-20 rounded-md" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

/**
 * Authentication Skeleton (`/auth`)
 * Displayed during Google OAuth round-trips, login state verification, and role redirects
 */
export function AuthSkeleton({ message = "Signing you in securely…" }: { message?: string }) {
  return (
    <section className="grid min-h-screen place-items-center bg-paper px-5 pb-20 pt-32 text-ink">
      <div className="w-full max-w-md space-y-6 animate-in fade-in duration-200">
        {/* Brand Header Placeholder */}
        <div className="flex items-center gap-3">
          <Skeleton variant="dark" className="h-7 w-7 rounded-full shrink-0" />
          <Skeleton variant="light" className="h-4 w-28 rounded-md" />
        </div>

        {/* Title & Subtitle */}
        <div className="space-y-2 pt-2">
          <Skeleton variant="light" className="h-10 sm:h-12 w-3/4 rounded-xl" />
          <Skeleton variant="light" className="h-4 w-5/6 rounded-md" />
        </div>

        {/* Dynamic Status Banner */}
        <div className="flex items-center gap-3.5 rounded-xl border border-ink/10 bg-paper-2/70 p-4 shadow-2xs">
          <div className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-ink/20 border-t-ink" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-ink">{message}</p>
            <p className="text-[11px] text-ink-muted">Verifying credentials and loading your workspace…</p>
          </div>
        </div>

        {/* Google OAuth Button Placeholder */}
        <Skeleton variant="light" className="h-12 w-full rounded-md border border-ink/10" />

        {/* Divider */}
        <div className="my-6 flex items-center gap-4">
          <div className="h-px flex-1 bg-ink/10" />
          <Skeleton variant="light" className="h-3 w-6 rounded-xs" />
          <div className="h-px flex-1 bg-ink/10" />
        </div>

        {/* Form Inputs Skeletons */}
        <div className="space-y-3.5">
          <Skeleton variant="light" className="h-12 w-full rounded-md" />
          <Skeleton variant="light" className="h-12 w-full rounded-md" />
        </div>

        {/* Action Button Skeleton */}
        <Skeleton variant="dark" className="h-12 w-full rounded-md" />

        {/* Footer Helper Links */}
        <div className="pt-2 flex justify-center">
          <Skeleton variant="light" className="h-4 w-36 rounded-md" />
        </div>
      </div>
    </section>
  );
}

/**
 * Universal Route Pending Component.
 * Automatically inspects current URL and serves the matching skeleton loader!
 */
export function RootPendingSkeleton() {
  if (typeof window !== "undefined") {
    const path = window.location.pathname;
    if (path.startsWith("/admin")) return <AdminSkeleton />;
    if (path.startsWith("/intern")) return <InternSkeleton />;
    if (path.startsWith("/profile")) return <ProfileSkeleton />;
    if (path.startsWith("/auth")) return <AuthSkeleton />;
    if (path === "/") return <HomeSkeleton />;
  }
  return <PageSkeleton />;
}

