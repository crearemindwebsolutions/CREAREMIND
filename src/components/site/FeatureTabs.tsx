import { useEffect, useRef, useState, useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import { linkFor } from "./registry";
import { ArrowRight, Check, Play, Pause } from "lucide-react";
import { useSiteContent } from "@/lib/site-content";
import { AdaptiveMedia } from "@/components/ui/adaptive-media";

import tplAgency from "@/assets/templates/tpl-agency.jpg";
import tplWebDesign from "@/assets/templates/tpl-web-design.jpg";
import tplCyberTech from "@/assets/templates/tpl-cyber-tech.jpg";
import tplMobileApp from "@/assets/templates/tpl-mobile-app.jpg";
import tplAnalyticsChart from "@/assets/templates/tpl-analytics-chart.jpg";
import tplPos from "@/assets/templates/tpl-pos.jpg";
import tplMobile from "@/assets/templates/tpl-mobile.jpg";
import tplSaas from "@/assets/templates/tpl-saas.jpg";
import tplDashboard from "@/assets/templates/tpl-ecom-dashboard.jpg";
import tplUiSystem from "@/assets/templates/tpl-ui-system.jpg";
import tplCreativeDev from "@/assets/templates/tpl-creative-dev.jpg";

interface CardItem {
  tab: string;
  page: string;
  serifTitle: string;
  subtitle: string;
  bgImage: string;
  theme?: "dark" | "cream";
  mockupHeader: string;
  mockupNav: string[];
  mockupCta: string;
  mockupTitle: string;
  mockupMainImage: string;
  mockupSideTop: string;
  mockupSideBottom: string;
  badgeLeft: {
    type: "file" | "billed";
    thumb?: string;
    label: string;
    sub?: string;
  };
  badgeRight: {
    type: "layouts" | "invoice" | "metric" | "paid_pill";
    label?: string;
    invoiceNum?: string;
    amount?: string;
    cta?: string;
    value?: string;
    sub?: string;
    thumbs?: string[];
  };
}

const CARDS: CardItem[] = [
  {
    tab: "Web Platforms",
    page: "Web Development",
    serifTitle: "High-velocity web platforms",
    subtitle: "Custom Next.js & React web applications with edge caching, automated SEO, WhatsApp checkout, and payment gateways.",
    bgImage: tplWebDesign,
    theme: "dark",
    mockupHeader: "DEV PLATFORM",
    mockupNav: ["ARCHITECTURE", "SERVICES", "API"],
    mockupCta: "DEPLOY CLOUD",
    mockupTitle: "ENTERPRISE CLOUD SUITE",
    mockupMainImage: tplCyberTech,
    mockupSideTop: tplSaas,
    mockupSideBottom: tplAnalyticsChart,
    badgeLeft: {
      type: "file",
      thumb: tplCyberTech,
      label: "api_gateway.ts",
    },
    badgeRight: {
      type: "invoice",
      invoiceNum: "INVOICE #CM-2026",
      amount: "₹65,000",
      cta: "VIEW INVOICE",
    },
  },
  {
    tab: "Cloud & SaaS",
    page: "Web Development",
    serifTitle: "Scalable cloud SaaS systems",
    subtitle: "Full-stack software products with real-time multi-tenant databases, customer billing dashboards, and zero downtime.",
    bgImage: tplSaas,
    theme: "dark",
    mockupHeader: "CLOUD CONSOLE",
    mockupNav: ["CLUSTERS", "DATABASE", "MONITORING"],
    mockupCta: "DEPLOY PROD",
    mockupTitle: "SERVERLESS INFRASTRUCTURE",
    mockupMainImage: tplDashboard,
    mockupSideTop: tplCyberTech,
    mockupSideBottom: tplWebDesign,
    badgeLeft: {
      type: "file",
      thumb: tplSaas,
      label: "cluster_config.yml",
    },
    badgeRight: {
      type: "layouts",
      label: "DevOps Pipeline",
      thumbs: [tplSaas, tplCyberTech],
    },
  },
  {
    tab: "Shop Billing & POS",
    page: "Billing Systems for Shops",
    serifTitle: "Super-fast barcode POS billing",
    subtitle: "Legitimize and streamline your retail business with thermal GST printing, instant barcode lookups, and inventory alerts.",
    bgImage: tplPos,
    theme: "cream",
    mockupHeader: "CREARE POS DESK",
    mockupNav: ["CASHIER", "INVENTORY", "LEDGER"],
    mockupCta: "PRINT RECEIPT",
    mockupTitle: "Thermal Barcode Cashier",
    mockupMainImage: tplPos,
    mockupSideTop: tplAnalyticsChart,
    mockupSideBottom: tplDashboard,
    badgeLeft: {
      type: "billed",
      label: "Client Receipt",
      sub: "GST Invoice #CM/2026/894",
    },
    badgeRight: {
      type: "paid_pill",
      label: "#CM-894",
      amount: "₹45,000",
      sub: "Paid via UPI",
    },
  },
  {
    tab: "Mobile Apps",
    page: "Mobile Apps",
    serifTitle: "Native iOS & Android mobile apps",
    subtitle: "Custom cross-platform applications with biometric authentication, instant push alerts, offline syncing, and Google Play launch.",
    bgImage: tplMobile,
    theme: "dark",
    mockupHeader: "MOBILE ENGINEERING",
    mockupNav: ["MOBILE API", "DEVICE SYNC"],
    mockupCta: "INSTALL APP",
    mockupTitle: "NATIVE CROSS-PLATFORM",
    mockupMainImage: tplMobileApp,
    mockupSideTop: tplWebDesign,
    mockupSideBottom: tplCyberTech,
    badgeLeft: {
      type: "file",
      thumb: tplMobileApp,
      label: "app-build-v2.apk",
    },
    badgeRight: {
      type: "metric",
      label: "Play Store & App Store",
      value: "4.9 ★",
      sub: "25,000+ active installs",
    },
  },
  {
    tab: "UI/UX Systems",
    page: "UI/UX Design",
    serifTitle: "Design systems & interactive UI",
    subtitle: "Pixel-perfect Figma design tokens, animated micro-interactions, dark mode aesthetics, and robust component architecture.",
    bgImage: tplUiSystem,
    theme: "dark",
    mockupHeader: "NEO DESIGN SYSTEM",
    mockupNav: ["TOKENS", "COMPONENTS", "LAYOUT"],
    mockupCta: "FIGMA SPEC",
    mockupTitle: "ACCESSIBLE UI TOKENS",
    mockupMainImage: tplUiSystem,
    mockupSideTop: tplWebDesign,
    mockupSideBottom: tplCreativeDev,
    badgeLeft: {
      type: "file",
      thumb: tplUiSystem,
      label: "design-tokens.json",
    },
    badgeRight: {
      type: "metric",
      label: "Design Tokens",
      value: "100%",
      sub: "48+ production components",
    },
  },
  {
    tab: "APIs & Telemetry",
    page: "Web Development",
    serifTitle: "Real-time telemetry & API gateways",
    subtitle: "High-throughput microservices, sub-millisecond edge routes, live WebSocket connections, and real-time observability.",
    bgImage: tplAnalyticsChart,
    theme: "dark",
    mockupHeader: "API TELEMETRY",
    mockupNav: ["ENDPOINTS", "METRICS", "LATENCY"],
    mockupCta: "VIEW METRICS",
    mockupTitle: "HIGH-VELOCITY BACKEND",
    mockupMainImage: tplAnalyticsChart,
    mockupSideTop: tplCyberTech,
    mockupSideBottom: tplSaas,
    badgeLeft: {
      type: "file",
      thumb: tplAnalyticsChart,
      label: "telemetry.log",
    },
    badgeRight: {
      type: "metric",
      label: "API Latency",
      value: "< 24ms",
      sub: "99.99% system uptime",
    },
  },
  {
    tab: "DevOps & Cloud",
    page: "Web Development",
    serifTitle: "Automated CI/CD & cloud scaling",
    subtitle: "Automated deployment pipelines, Docker container orchestration, SSL/TLS hardening, and Vercel edge networks.",
    bgImage: tplCyberTech,
    theme: "dark",
    mockupHeader: "DEV PIPELINE",
    mockupNav: ["DOCKER", "KUBERNETES", "SECURITY"],
    mockupCta: "RUN BUILD",
    mockupTitle: "ZERO-DOWNTIME CI/CD",
    mockupMainImage: tplCyberTech,
    mockupSideTop: tplSaas,
    mockupSideBottom: tplUiSystem,
    badgeLeft: {
      type: "file",
      thumb: tplCyberTech,
      label: "docker-compose.prod.yml",
    },
    badgeRight: {
      type: "layouts",
      label: "Cloud Architecture",
      thumbs: [tplCyberTech, tplSaas],
    },
  },
];

export function FeatureTabs() {
  const { content } = useSiteContent();
  const heading = content.featureTabs?.heading || "Grow your business";
  const subtitle = content.featureTabs?.subtitle || "Everything from web & mobile development to shop billing and digital growth.";

  const items = useMemo(() => {
    return CARDS.map((defaultCard, i) => {
      const dynamic = content.featureTabs?.items?.[i];
      if (!dynamic) return defaultCard;
      return {
        ...defaultCard,
        tab: dynamic.tab || defaultCard.tab,
        serifTitle: dynamic.serifTitle || defaultCard.serifTitle,
        subtitle: dynamic.subtitle || defaultCard.subtitle,
        bgImage: dynamic.bgImage || defaultCard.bgImage,
        mockupHeader: dynamic.mockupHeader || defaultCard.mockupHeader,
        mockupTitle: dynamic.mockupTitle || defaultCard.mockupTitle,
        mockupMainImage: dynamic.mockupMainImage || defaultCard.mockupMainImage,
        mockupSideTop: dynamic.mockupSideTop || defaultCard.mockupSideTop,
        mockupSideBottom: dynamic.mockupSideBottom || defaultCard.mockupSideBottom,
      };
    });
  }, [content.featureTabs]);

  const sectionRef = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isTouching, setIsTouching] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const dragging = useRef<{ x: number; s: number } | null>(null);
  const touchStartX = useRef<number | null>(null);
  const touchMoved = useRef(false);
  const isProgrammatic = useRef(false);
  const snapT = useRef<number | undefined>(undefined);
  const moved = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(!!entry?.isIntersecting);
      },
      { threshold: 0.1 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const onScroll = () => {
    if (isProgrammatic.current) return;
    const el = track.current;
    if (!el) return;
    const cards = Array.from(el.children) as HTMLElement[];
    const center = el.scrollLeft + el.clientWidth / 2;
    let best = 0;
    let dist = Infinity;
    cards.forEach((c, i) => {
      const d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - center);
      if (d < dist) {
        dist = d;
        best = i;
      }
    });
    if (best !== active) {
      setActive(best);
      const tabEl = tabRefs.current[best];
      const navEl = tabEl?.parentElement;
      if (navEl && tabEl) {
        navEl.scrollTo({
          left: tabEl.offsetLeft - (navEl.clientWidth - tabEl.offsetWidth) / 2,
          behavior: "smooth",
        });
      }
    }
  };

  const open = (name: string) => {
    const l = linkFor(name);
    if (l.params) navigate({ to: "/$slug", params: l.params });
    else navigate({ to: l.to as any });
  };

  const toCard = (i: number) => {
    const el = track.current;
    if (!el) return;
    const targetIdx = Math.max(0, Math.min(items.length - 1, i));
    const c = el.children[targetIdx] as HTMLElement;
    if (!c) return;

    isProgrammatic.current = true;
    setActive(targetIdx);

    el.style.scrollSnapType = "none";
    el.scrollTo({
      left: c.offsetLeft - (el.clientWidth - c.offsetWidth) / 2,
      behavior: "smooth",
    });

    // Safely scroll ONLY the horizontal category navbar container, NEVER the window/page
    const tabEl = tabRefs.current[targetIdx];
    const navEl = tabEl?.parentElement;
    if (navEl && tabEl) {
      navEl.scrollTo({
        left: tabEl.offsetLeft - (navEl.clientWidth - tabEl.offsetWidth) / 2,
        behavior: "smooth",
      });
    }

    window.clearTimeout(snapT.current);
    snapT.current = window.setTimeout(() => {
      if (el) el.style.scrollSnapType = "";
      isProgrammatic.current = false;
    }, 700);
  };

  // Autoplay functionality matching Squarespace controls - only runs when user is looking at this section on desktop
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 640) return;
    if (!isPlaying || isHovered || isTouching || !isVisible) return;
    const timer = setInterval(() => {
      toCard((active + 1) % items.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [isPlaying, isHovered, isTouching, isVisible, active, items.length]);

  return (
    <section ref={sectionRef} className="relative bg-paper text-ink py-20 md:py-28 overflow-hidden">
      {/* Squarespace Headline & Subtitle */}
      <div data-reveal="stagger" className="px-5 text-center max-w-4xl mx-auto">
        <h2 className="text-4xl font-normal text-ink md:text-5xl lg:text-[54px] tracking-tight font-sans">
          {heading}
        </h2>
        <p className="mt-3 text-ink-muted text-base md:text-lg font-light">
          {subtitle}
        </p>
      </div>

      {/* Squarespace Minimalist Clean Category Navigation */}
      <div className="sticky top-20 z-20 mt-8 sm:mt-10 flex justify-center px-4">
        <nav
          className="no-scrollbar flex max-w-full items-center gap-1 sm:gap-2 overflow-x-auto py-1"
          style={{
            WebkitOverflowScrolling: "touch",
            overscrollBehaviorY: "auto",
          }}
        >
          {items.map((c, i) => {
            const isTabActive = active === i;
            return (
              <button
                key={c.tab}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                onClick={() => toCard(i)}
                className={`whitespace-nowrap px-4 py-1.5 sm:px-5 sm:py-2 text-[14px] sm:text-[15px] font-normal transition-all duration-300 rounded-full ${
                  isTabActive
                    ? "bg-ink/[0.09] text-ink font-medium"
                    : "text-ink/65 hover:text-ink hover:bg-ink/[0.04]"
                }`}
              >
                {c.tab}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Squarespace-Style Carousel Track with Spatial Depth and Motion */}
      <div
        className="group/car relative mt-8 sm:mt-10"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          ref={track}
          onScroll={onScroll}
          onTouchStart={(e) => {
            setIsTouching(true);
            touchStartX.current = e.touches[0]?.clientX ?? null;
            touchMoved.current = false;
          }}
          onTouchMove={(e) => {
            if (
              touchStartX.current !== null &&
              e.touches[0] &&
              Math.abs(e.touches[0].clientX - touchStartX.current) > 8
            ) {
              touchMoved.current = true;
            }
          }}
          onTouchEnd={() => {
            setIsTouching(false);
            touchStartX.current = null;
          }}
          onTouchCancel={() => {
            setIsTouching(false);
            touchStartX.current = null;
          }}
          onPointerDown={(e) => {
            if (e.pointerType !== "mouse") return;
            isProgrammatic.current = false;
            moved.current = false;
            dragging.current = { x: e.clientX, s: track.current!.scrollLeft };
          }}
          onPointerMove={(e) => {
            if (e.pointerType !== "mouse" || !dragging.current) return;
            if (Math.abs(e.clientX - dragging.current.x) > 6)
              moved.current = true;
            if (moved.current)
              track.current!.scrollLeft =
                dragging.current.s - (e.clientX - dragging.current.x);
          }}
          onPointerUp={(e) => {
            if (e.pointerType !== "mouse") return;
            if (dragging.current) {
              dragging.current = null;
              if (moved.current) onScroll();
            }
          }}
          onPointerLeave={(e) => {
            if (e.pointerType === "mouse") dragging.current = null;
          }}
          className="no-scrollbar flex snap-x snap-mandatory gap-4 sm:gap-5 md:gap-7 overflow-x-auto px-[8vw] md:px-[6vw] py-4"
          style={{
            WebkitOverflowScrolling: "touch",
            overscrollBehaviorY: "auto",
            overscrollBehaviorX: "contain",
          }}
        >
          {items.map((c, i) => {
            const isActive = active === i;
            const isCream = c.theme === "cream";
            return (
              <article
                key={c.tab}
                onClick={() => {
                  if (moved.current || touchMoved.current) return;
                  if (!isActive) {
                    toCard(i);
                  } else {
                    open(c.page);
                  }
                }}
                className={`group cursor-pointer relative aspect-[16/10.2] min-h-[440px] sm:min-h-[500px] md:min-h-[540px] w-[84vw] sm:w-[76vw] shrink-0 snap-center overflow-hidden rounded-xl md:rounded-[8px] isolate transition-all duration-700 ease-expo md:w-[64vw] lg:w-[62vw] md:max-w-[960px] select-none opacity-100 ${
                  isActive
                    ? "scale-100 shadow-[0_28px_60px_-15px_rgba(0,0,0,0.25)] ring-1 ring-ink/10"
                    : "scale-100 shadow-[0_16px_40px_-15px_rgba(0,0,0,0.2)] hover:shadow-2xl"
                }`}
              >
                {/* Atmospheric Background Media (Image or Video) */}
                <AdaptiveMedia
                  src={c.bgImage}
                  alt=""
                  loading="lazy"
                  draggable={false}
                  className={`absolute inset-0 h-full w-full object-cover rounded-[inherit] transition-transform duration-700 ease-expo ${
                    isActive ? "scale-105" : "scale-100"
                  }`}
                />
                {/* Subtle Contrast Vignette */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/20 to-black/60 pointer-events-none rounded-[inherit]" />

                {/* Top-Left Editorial Serif Headline & Subtitle */}
                <div className="relative z-10 p-6 sm:p-9 md:p-11 pointer-events-none">
                  <h3
                    style={{
                      fontVariationSettings: "'opsz' 72",
                      fontSize: "clamp(24px, 2.6vw, 34px)",
                      lineHeight: 1.16,
                    }}
                    className="font-serif text-2xl sm:text-3xl md:text-[34px] font-normal tracking-tight text-white leading-tight opacity-100 block"
                  >
                    {c.serifTitle}
                  </h3>
                  {/* Paragraph hidden on mobile, visible on laptop/desktop */}
                  <p
                    style={{
                      fontSize: "clamp(13px, 1.05vw, 14.5px)",
                      lineHeight: 1.5,
                    }}
                    className="hidden md:block mt-2.5 max-w-[340px] sm:max-w-[380px] text-xs sm:text-[13px] md:text-sm font-normal text-white/90 leading-relaxed font-sans opacity-90"
                  >
                    {c.subtitle}
                  </p>
                </div>

                

                {/* Bottom-Right Translucent Action Button matching Squarespace */}
                <button
                  type="button"
                  aria-label={`Open ${c.page}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    open(c.page);
                  }}
                  className="absolute bottom-5 right-5 sm:bottom-6 sm:right-6 z-20 grid h-8 w-8 sm:h-9 sm:w-9 place-items-center rounded-full bg-white/20 hover:bg-white text-white hover:text-black backdrop-blur-md border border-white/30 shadow-[0_4px_16px_rgba(0,0,0,0.25)] transition-all duration-300 group-hover:scale-110 active:scale-95"
                >
                  <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </button>
              </article>
            );
          })}
        </div>

        {/* Bottom Indicators & Autoplay Control matching Squarespace */}
        <div className="mt-8 flex items-center justify-center gap-3">
          <div className="flex items-center gap-1.5 rounded-full bg-ink/[0.08] px-3.5 py-1.5 backdrop-blur-sm">
            {CARDS.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => toCard(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`transition-all duration-300 rounded-full ${
                  active === i
                    ? "w-6 h-1.5 bg-ink"
                    : "w-1.5 h-1.5 bg-ink/30 hover:bg-ink/60"
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => setIsPlaying((p) => !p)}
            aria-label={isPlaying ? "Pause autoplay" : "Play autoplay"}
            className="grid h-7 w-7 place-items-center rounded-full text-ink/60 hover:text-ink hover:bg-ink/[0.06] transition-all"
          >
            {isPlaying ? (
              <Pause className="h-3.5 w-3.5" />
            ) : (
              <Play className="h-3.5 w-3.5 fill-current" />
            )}
          </button>
        </div>
      </div>
    </section>
  );
}
