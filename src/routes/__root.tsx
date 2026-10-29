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

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
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
      { title: "Creare Mind" },
      { name: "description", content: "Software development, mobile apps, shop billing systems, video editing & social media management by Creare Mind." },
    ],
    links: [
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
      { rel: "icon", href: "/favicon.png", type: "image/png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark" style={{ backgroundColor: "#07080a" }}>
      <head>
        <HeadContent />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              html, body {
                background-color: #07080a !important;
                color: #ffffff;
                margin: 0;
                padding: 0;
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
      <body style={{ backgroundColor: "#07080a" }}>
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

  return (
    <QueryClientProvider client={queryClient}>
      <CurrencyProvider>
        {!isAdminRoute && <SitePreloader />}
        {/* Smooth scroll and site header are disabled on admin console */}
        {!isAdminRoute && <SmoothScroll />}
        {!isAdminRoute && <Header />}
        <Outlet />
        {isHome && <Footer />}
        <Toaster position="top-center" richColors closeButton />
      </CurrencyProvider>
    </QueryClientProvider>
  );
}
