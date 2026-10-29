import { useEffect, useRef, useState, useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import { linkFor } from "./registry";
import { ArrowRight, Check, Play, Pause } from "lucide-react";
import { useSiteContent } from "@/lib/site-content";
import { AdaptiveMedia } from "@/components/ui/adaptive-media";

import tplAgency from "@/assets/templates/tpl-agency.jpg";
import tplFashion from "@/assets/templates/tpl-fashion.jpg";
import tplSneakers from "@/assets/templates/tpl-ecom-sneakers.jpg";
import tplArch from "@/assets/templates/tpl-architecture.jpg";
import tplCreative from "@/assets/templates/tpl-creative-dev.jpg";
import tplPos from "@/assets/templates/tpl-pos.jpg";
import tplMobile from "@/assets/templates/tpl-mobile.jpg";
import tplSaas from "@/assets/templates/tpl-saas.jpg";
import tplDashboard from "@/assets/templates/tpl-ecom-dashboard.jpg";
import tplUiSystem from "@/assets/templates/tpl-ui-system.jpg";
import tplEditorial from "@/assets/templates/tpl-editorial.jpg";
import tplCeramics from "@/assets/templates/tpl-ecom-ceramics.jpg";

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
    tab: "Services",
    page: "Web Development",
    serifTitle: "Offer services",
    subtitle: "Promote your experiences and offerings, collect attendee information, and get paid for your work.",
    bgImage: tplAgency,
    theme: "dark",
    mockupHeader: "ACHELOUS SPA",
    mockupNav: ["SERVICES", "PACKAGES", "THE SPA"],
    mockupCta: "BOOK APPOINTMENT",
    mockupTitle: "OUR RETREATS",
    mockupMainImage: tplCreative,
    mockupSideTop: tplArch,
    mockupSideBottom: tplCeramics,
    badgeLeft: {
      type: "file",
      thumb: tplArch,
      label: "abstract.jpg",
    },
    badgeRight: {
      type: "invoice",
      invoiceNum: "INVOICE #2371",
      amount: "$1,350.00",
      cta: "PAY INVOICE",
    },
  },
  {
    tab: "Online Store",
    page: "Web Development",
    serifTitle: "Sell products",
    subtitle: "Merchandise your products, manage inventory and orders, and offer multiple express payment methods.",
    bgImage: tplSneakers,
    theme: "dark",
    mockupHeader: "STUDIO STORE",
    mockupNav: ["CATALOG", "LOOKBOOK"],
    mockupCta: "SHOP NOW",
    mockupTitle: "COLLECTION 2026",
    mockupMainImage: tplCeramics,
    mockupSideTop: tplCreative,
    mockupSideBottom: tplArch,
    badgeLeft: {
      type: "file",
      thumb: tplCeramics,
      label: "catalog_v4.png",
    },
    badgeRight: {
      type: "layouts",
      label: "Payment Methods",
      thumbs: [tplCeramics, tplCreative],
    },
  },
  {
    tab: "Invoicing",
    page: "Billing Systems for Shops",
    serifTitle: "Invoice clients",
    subtitle: "Legitimize your business and get paid with professional proposals, computerized billing, and live inventory.",
    bgImage: tplPos,
    theme: "cream", // Matches Squarespace's cream invoice card!
    mockupHeader: "HEIKKI INTERIORS",
    mockupNav: ["PROPOSAL", "CONTRACT"],
    mockupCta: "DUE TODAY",
    mockupTitle: "Materials sourcing and curation",
    mockupMainImage: tplCeramics,
    mockupSideTop: tplPos,
    mockupSideBottom: tplDashboard,
    badgeLeft: {
      type: "billed",
      label: "Billed to",
      sub: "Madison Somil (madison@example.com)",
    },
    badgeRight: {
      type: "paid_pill",
      label: "#0001",
      amount: "$500.00",
      sub: "Paid",
    },
  },
  {
    tab: "Mobile Apps",
    page: "Mobile Apps",
    serifTitle: "Launch native mobile apps",
    subtitle: "Custom iOS and Android apps with biometric login, instant push notifications, and seamless offline data sync.",
    bgImage: tplMobile,
    theme: "dark",
    mockupHeader: "LUMEN APP",
    mockupNav: ["FEED", "EXPLORE"],
    mockupCta: "INSTALL",
    mockupTitle: "NATIVE IOS & ANDROID",
    mockupMainImage: tplMobile,
    mockupSideTop: tplCreative,
    mockupSideBottom: tplArch,
    badgeLeft: {
      type: "file",
      thumb: tplMobile,
      label: "app-build-v2.ipa",
    },
    badgeRight: {
      type: "metric",
      label: "App Store Rating",
      value: "4.9 ★",
      sub: "14.2k active installs",
    },
  },
  {
    tab: "Social Media",
    page: "Social Media Management",
    serifTitle: "Scale your social media",
    subtitle: "Daily branded graphics, high-retention viral reels, engaging carousels, and rapid follower growth for your brand.",
    bgImage: tplFashion,
    theme: "dark",
    mockupHeader: "STUDIO CREATIVE",
    mockupNav: ["CALENDAR", "ANALYTICS"],
    mockupCta: "SCHEDULE",
    mockupTitle: "VIRAL FEED & REELS",
    mockupMainImage: tplFashion,
    mockupSideTop: tplCreative,
    mockupSideBottom: tplArch,
    badgeLeft: {
      type: "file",
      thumb: tplFashion,
      label: "reel_final_v3.mp4",
    },
    badgeRight: {
      type: "metric",
      label: "Account Reach",
      value: "+340% 🚀",
      sub: "82.4k views this week",
    },
  },
  {
    tab: "Video Editing",
    page: "Video Editing & Reels",
    serifTitle: "Produce viral video ads",
    subtitle: "Scroll-stopping Instagram Reels, YouTube Shorts, and promo commercials with animated kinetic captions.",
    bgImage: tplCreative,
    theme: "dark",
    mockupHeader: "TIMELINE PRO",
    mockupNav: ["SEQUENCE", "COLOR"],
    mockupCta: "EXPORT 4K",
    mockupTitle: "CINEMATIC 4K EDIT",
    mockupMainImage: tplCreative,
    mockupSideTop: tplEditorial,
    mockupSideBottom: tplArch,
    badgeLeft: {
      type: "file",
      thumb: tplEditorial,
      label: "color_grade.cube",
    },
    badgeRight: {
      type: "metric",
      label: "Retention Rate",
      value: "84.2%",
      sub: "1.2M total views",
    },
  },
  {
    tab: "Portfolio",
    page: "UI/UX Design",
    serifTitle: "Showcase your work",
    subtitle: "Build a portfolio website to highlight projects, share your story, and help clients get in contact.",
    bgImage: tplArch,
    theme: "dark",
    mockupHeader: "NIA DESIGN",
    mockupNav: ["WORK", "ABOUT"],
    mockupCta: "CONTACT",
    mockupTitle: "NIA DESIGN",
    mockupMainImage: tplArch,
    mockupSideTop: tplCreative,
    mockupSideBottom: tplCeramics,
    badgeLeft: {
      type: "file",
      thumb: tplArch,
      label: "abstract.jpg",
    },
    badgeRight: {
      type: "layouts",
      label: "Layouts",
      thumbs: [tplArch, tplCreative],
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

  // Autoplay functionality matching Squarespace controls - only runs when user is looking at this section and not interacting
  useEffect(() => {
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
          data-lenis-prevent="true"
          className="no-scrollbar flex max-w-full items-center gap-1 sm:gap-2 overflow-x-auto py-1"
          style={{
            WebkitOverflowScrolling: "touch",
            touchAction: "pan-x pan-y",
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
          data-lenis-prevent="true"
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
          className="no-scrollbar flex snap-x snap-mandatory gap-4 sm:gap-5 md:gap-7 overflow-x-auto px-[6vw] overscroll-x-contain py-4"
          style={{
            WebkitOverflowScrolling: "touch",
            touchAction: "pan-x pan-y",
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
                className={`group cursor-pointer relative aspect-[16/10.2] min-h-[440px] sm:min-h-[500px] md:min-h-[540px] w-[86vw] sm:w-[76vw] shrink-0 snap-center overflow-hidden rounded-xl md:rounded-[8px] isolate transition-all duration-700 ease-expo md:w-[64vw] lg:w-[62vw] md:max-w-[960px] select-none opacity-100 ${
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
