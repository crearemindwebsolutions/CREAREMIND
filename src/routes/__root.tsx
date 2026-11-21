import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { Header } from "../components/site/Header";
import { Footer } from "../components/site/Footer";
import { SmoothScroll } from "../components/site/SmoothScroll";
import { CurrencyProvider } from "../hooks/use-currency";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Toaster } from "../components/ui/sonner";
import { SitePreloader } from "../components/site/SitePreloader";
import { RootPendingSkeleton } from "../components/ui/SiteSkeletons";
import { SCHEMA_ORGANIZATION, SITE_URL, DEFAULT_OG_IMAGE } from "../lib/seo";
import { useSession } from "../hooks/use-session";
import { syncSessionUserToCloud } from "../lib/admin-users";

// Catch chunk load failures across new deployments and automatically reload with newest assets
if (typeof window !== "undefined") {
  window.addEventListener("vite:preloadError", (event) => {
    event.preventDefault();
    console.warn("Vite preload error detected. Reloading page to load latest version...", event);
    const reloadKey = "chunk_preload_reload";
    const last = sessionStorage.getItem(reloadKey);
    const now = Date.now();
    if (!last || now - Number(last) > 8000) {
      sessionStorage.setItem(reloadKey, String(now));
      window.location.reload();
    }
  });
}

function GlobalUserSessionSync() {
  const { user } = useSession();
  useEffect(() => {
    if (user?.email) {
      syncSessionUserToCloud(user).catch(() => {});
    }
  }, [user]);
  return null;
}

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;
  const isChunkError = /dynamically imported module|failed to fetch dynamically imported module|loading chunk|failed to fetch/i.test(errorMessage);

  // Auto reload once on chunk mismatch across deployments
  useEffect(() => {
    if (isChunkError && typeof window !== "undefined") {
      const reloadKey = "root_chunk_error_reload";
      const last = sessionStorage.getItem(reloadKey);
      const now = Date.now();
      if (!last || now - Number(last) > 8000) {
        sessionStorage.setItem(reloadKey, String(now));
        window.location.reload();
      }
    }
  }, [isChunkError]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <div className="max-w-2xl w-full text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>

        {errorMessage && (
          <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-left overflow-auto max-h-60 text-xs font-mono text-red-600 dark:text-red-400">
            <p className="font-bold">{errorMessage}</p>
            {errorStack && <pre className="mt-2 text-[10px] text-muted-foreground whitespace-pre-wrap">{errorStack}</pre>}
          </div>
        )}

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              if (isChunkError && typeof window !== "undefined") {
                window.location.reload();
              } else {
                router.invalidate();
                reset();
              }
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Creare Mind — Software Development & Digital Agency | crearemind.in" },
      {
        name: "description",
        content:
          "Creare Mind (crearemind.in) builds custom websites, mobile apps, shop billing POS systems, video editing & social media management for ambitious businesses.",
      },
      {
        name: "keywords",
        content:
          "Creare Mind, crearemind, crearemind.in, Creare Mind Technologies, software company India, custom software development, mobile apps iOS Android, shop billing POS software, retail billing machine, video editing reels, social media management",
      },
      { name: "author", content: "Creare Mind" },
      { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" },
      { property: "og:site_name", content: "Creare Mind" },
      { property: "og:type", content: "website" },
      { property: "og:url", content: SITE_URL },
      { property: "og:image", content: DEFAULT_OG_IMAGE },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@crearemind" },
      { name: "theme-color", content: "#07080a" },
    ],
    links: [
      { rel: "canonical", href: SITE_URL },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Syne:wght@600;700&family=Newsreader:opsz,wght@6..72,400;6..72,500;6..72,600&family=Lora:wght@400;500;600&family=Cormorant+Garamond:wght@400;500;600&family=EB+Garamond:wght@400;500;600&family=Fraunces:opsz,wght@9..144,400;9..144,500&family=Inter+Tight:wght@400;500;600;700;900&display=swap",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "shortcut icon", href: "/favicon.ico" },
      { rel: "icon", href: "/favicon.ico", sizes: "any" },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
      { rel: "icon", href: "/favicon-48x48.png", type: "image/png", sizes: "48x48" },
      { rel: "icon", href: "/favicon-96x96.png", type: "image/png", sizes: "96x96" },
      { rel: "icon", href: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { rel: "icon", href: "/icon-512.png", type: "image/png", sizes: "512x512" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png", sizes: "180x180" },
      { rel: "manifest", href: "/site.webmanifest" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  pendingComponent: RootPendingSkeleton,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(SCHEMA_ORGANIZATION),
          }}
        />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              @media screen {
                html, body {
                  background-color: #07080a !important;
                  color: #ffffff;
                  margin: 0;
                  padding: 0;
                }
              }
              @media print {
                html, body {
                  background: #ffffff !important;
                  background-color: #ffffff !important;
                  color: #000000 !important;
                  margin: 0 !important;
                  padding: 0 !important;
                }
              }
              /* Eliminate flash of unstyled video and media on page refresh */
              video[data-hero-video]:not([data-active="true"]) {
                opacity: 0 !important;
                display: none !important;
              }
              video[data-hero-video][data-active="true"] {
                opacity: 1 !important;
                display: block !important;
              }
            `,
          }}
        />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isHome = pathname === "/";
  const isAdminRoute = pathname.startsWith("/admin");
  const isInternRoute = pathname.startsWith("/intern");
  const isStandaloneApp = isAdminRoute || isInternRoute;

  // Manage light vs dark theme for standalone portals (Admin & Intern Dashboard in Creare Mind #F8F7F4)
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (isStandaloneApp) {
      document.documentElement.classList.remove("dark");
      document.documentElement.style.setProperty("background-color", "#F8F7F4", "important");
      document.body.style.setProperty("background-color", "#F8F7F4", "important");
      document.body.style.setProperty("color", "#111111", "important");
    } else {
      document.documentElement.classList.add("dark");
      document.documentElement.style.setProperty("background-color", "#07080a", "important");
      document.body.style.setProperty("background-color", "#07080a", "important");
      document.body.style.setProperty("color", "#ffffff", "important");
    }
  }, [isStandaloneApp]);

  return (
    <QueryClientProvider client={queryClient}>
      <CurrencyProvider>
        <GlobalUserSessionSync />
        {!isStandaloneApp && <SitePreloader />}
        {/* Smooth scroll and site header are disabled on admin and intern portals */}
        {!isStandaloneApp && <SmoothScroll />}
        {!isStandaloneApp && <Header />}
        <Outlet />
        {isHome && <Footer />}
        <Toaster position="top-center" richColors closeButton />
      </CurrencyProvider>
    </QueryClientProvider>
  );
}
