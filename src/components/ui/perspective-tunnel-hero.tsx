"use client";

import {
  motion,
  useTransform,
  useReducedMotion,
  useMotionValue,
  useSpring,
  useScroll,
  type MotionValue,
} from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { Sparkles, ArrowDown, ChevronDown, ExternalLink } from "lucide-react";
import { lenisInstance } from "@/components/site/SmoothScroll";

export interface TunnelItem {
  src: string;
  title: string;
  category?: string;
}

export const DEFAULT_TUNNEL_IMAGES: TunnelItem[] = [
  {
    src: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80",
    title: "Aether Design & Motion",
    category: "Custom Websites",
  },
  {
    src: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80",
    title: "Hyperdrive Sneaker Lab",
    category: "Social Media & Video",
  },
  {
    src: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80",
    title: "Amber & Ash Coffee Roasters",
    category: "Retail & Commerce",
  },
  {
    src: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&q=80",
    title: "Solis High Jewelry",
    category: "Retail & Commerce",
  },
  {
    src: "https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=1200&q=80",
    title: "QuickCart Retail POS",
    category: "Shop Billing POS",
  },
  {
    src: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80",
    title: "Luminuxe Botanical Skincare",
    category: "Custom Websites",
  },
  {
    src: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1200&q=80",
    title: "Terra & Stone Studio Pottery",
    category: "Social Media & Video",
  },
  {
    src: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1200&q=80",
    title: "Verve Italian Eyeworks",
    category: "Custom Websites",
  },
  {
    src: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80",
    title: "Canvas UI Design System",
    category: "SaaS & Dashboards",
  },
];

interface TunnelCardData {
  item: TunnelItem;
  angleCos: number;
  angleSin: number;
  radiusFactorX: number;
  radiusFactorY: number;
  rotationZ: number;
  index: number;
}

const SPRING_CONFIG = { stiffness: 60, damping: 25, mass: 0.5 };

interface StageDimensions {
  width: number;
  height: number;
  isMobile: boolean;
}

function useCameraParallax(enabled: boolean) {
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, SPRING_CONFIG);
  const y = useSpring(rawY, SPRING_CONFIG);

  useEffect(() => {
    if (!enabled) return;
    const onMove = (e: PointerEvent) => {
      rawX.set((e.clientX / window.innerWidth - 0.5) * 2);
      rawY.set((e.clientY / window.innerHeight - 0.5) * 2);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [enabled, rawX, rawY]);

  return { x, y };
}

interface TunnelCardProps {
  card: TunnelCardData;
  progress: MotionValue<number>;
  pointer: { x: MotionValue<number>; y: MotionValue<number> };
  total: number;
  stage: StageDimensions;
  theme?: "cream" | "dark";
  onSelect?: (item: TunnelItem, index: number) => void;
}

function TunnelCard({ card, progress, pointer, total, stage, theme = "cream", onSelect }: TunnelCardProps) {
  const isCream = theme === "cream";
  const staggerSpan = 0.55;
  const start = (card.index / total) * (1 - staggerSpan);
  const end = start + staggerSpan;

  const localProgress = useTransform(progress, [start, end], [0, 1]);

  const farZ = stage.isMobile ? -1200 : -1700;
  const nearZ = stage.isMobile ? 350 : 500;
  const z = useTransform(localProgress, [0, 1], [farZ, nearZ]);

  const opacity = useTransform(localProgress, [0, 0.18, 0.82, 0.98], [0, 1, 1, 0]);

  const cardWidth = stage.isMobile
    ? Math.max(130, Math.min(180, stage.width * 0.38))
    : Math.max(180, Math.min(270, stage.width * 0.18));

  const baseX = card.angleCos * (stage.width * card.radiusFactorX);
  const baseY = card.angleSin * (stage.height * card.radiusFactorY);
  const panStrength = stage.isMobile ? 20 : 45;

  const transform = useTransform(
    [z, pointer.x, pointer.y],
    ([currZ, px, py]: (number | undefined)[]) => {
      const zVal = currZ ?? 0;
      const xVal = px ?? 0;
      const yVal = py ?? 0;
      const offsetX = baseX - xVal * panStrength;
      const offsetY = baseY - yVal * panStrength;
      return `translate3d(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px), ${zVal}px) rotateZ(${card.rotationZ}deg)`;
    }
  );

  return (
    <motion.div
      style={{
        width: cardWidth,
        transform,
        opacity,
        zIndex: card.index + 1,
      }}
      className="pointer-events-auto absolute left-1/2 top-1/2 aspect-[4/5] will-change-transform select-none cursor-pointer"
      onClick={() => onSelect?.(card.item, card.index)}
    >
      <div className={`group relative h-full w-full overflow-hidden rounded-[8px] bg-neutral-900 ${
        isCream
          ? "shadow-2xl shadow-neutral-900/25 ring-1 ring-black/10 hover:ring-black/35 hover:shadow-neutral-900/40"
          : "shadow-2xl shadow-black/80 ring-1 ring-white/15 hover:ring-indigo-400/80 hover:shadow-indigo-500/30"
      } transition-all duration-500`}>
        <img
          src={card.item.src}
          alt={card.item.title}
          draggable={false}
          className="h-full w-full object-cover rounded-[inherit] transition-transform duration-700 ease-out group-hover:scale-105"
        />
      </div>
    </motion.div>
  );
}

export interface PerspectiveTunnelHeroProps {
  images?: TunnelItem[];
  badge?: string;
  titleLine1?: string;
  titleLine2?: string;
  subtitle?: string;
  scrollTargetId?: string;
  scrollMode?: "page" | "wheel";
  theme?: "cream" | "dark";
  onCardSelect?: (item: TunnelItem, index: number) => void;
}

export default function PerspectiveTunnelHero({
  images = DEFAULT_TUNNEL_IMAGES,
  badge = "Warp Drive Sequence",
  titleLine1 = "INTO THE",
  titleLine2 = "ETHER.",
  subtitle = "Scroll your trackpad or mouse wheel to fly through our spatial 3D corridor.",
  scrollTargetId = "work-gallery",
  scrollMode = "page",
  theme = "cream",
  onCardSelect,
}: PerspectiveTunnelHeroProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const [stage, setStage] = useState<StageDimensions>({
    width: 1440,
    height: 900,
    isMobile: false,
  });

  const cards: TunnelCardData[] = useMemo(() => {
    return images.map((item, i) => {
      const goldenAngle = i * 137.5 * (Math.PI / 180);
      const radiusFactorX = 0.28 + (i % 3) * 0.08;
      const radiusFactorY = 0.26 + (i % 2) * 0.09;

      return {
        item,
        angleCos: Math.cos(goldenAngle),
        angleSin: Math.sin(goldenAngle),
        radiusFactorX,
        radiusFactorY,
        rotationZ: (i % 2 === 0 ? 1 : -1) * (3 + (i % 5) * 2),
        index: i,
      };
    });
  }, [images]);

  useEffect(() => {
    const updateDimensions = () => {
      setStage({
        width: window.innerWidth,
        height: window.innerHeight,
        isMobile: window.innerWidth < 768,
      });
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // 1. Natural page-scroll tracking using sticky container
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  const smoothPageProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 28,
    restDelta: 0.0005,
  });

  // 2. Standalone wheel-only mode fallback (for isolated preview demos)
  const rawWheelProgress = useMotionValue(0);
  const smoothWheelProgress = useSpring(rawWheelProgress, {
    stiffness: 80,
    damping: 30,
    restDelta: 0.0001,
  });

  useEffect(() => {
    if (scrollMode !== "wheel") return;
    const el = containerRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const current = rawWheelProgress.get();
      const delta = e.deltaY * 0.0008;
      rawWheelProgress.set(Math.min(1, Math.max(0, current + delta)));
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [scrollMode, rawWheelProgress]);

  const activeProgress = scrollMode === "page" ? smoothPageProgress : smoothWheelProgress;

  const pointer = useCameraParallax(!reduce);

  const titleScale = useTransform(activeProgress, [0, 0.5, 1], [0.75, 1, 1.35]);
  const titleOpacity = useTransform(activeProgress, [0, 0.12, 0.82, 1], [0.35, 1, 1, 0]);
  const promptOpacity = useTransform(activeProgress, [0, 0.15], [1, 0]);
  const exitHintOpacity = useTransform(activeProgress, [0.75, 0.95], [0, 1]);
  const exitHintY = useTransform(activeProgress, [0.75, 1], [15, 0]);

  const handleScrollDown = () => {
    if (scrollTargetId) {
      const target = document.getElementById(scrollTargetId);
      if (target) {
        if (lenisInstance) {
          lenisInstance.scrollTo(target, { offset: -60, duration: 1.0 });
        } else {
          target.scrollIntoView({ behavior: "smooth" });
        }
        return;
      }
    }
    if (trackRef.current) {
      const targetY = trackRef.current.offsetTop + trackRef.current.offsetHeight;
      if (lenisInstance) {
        lenisInstance.scrollTo(targetY, { offset: 0, duration: 1.0 });
      } else {
        window.scrollTo({ top: targetY, behavior: "smooth" });
      }
    }
  };

  const isPageMode = scrollMode === "page";
  const isCream = theme === "cream";

  return (
    <div
      ref={trackRef}
      className={`relative w-full ${isPageMode ? `h-[200vh] ${isCream ? "bg-[#EAE9E7]" : "bg-neutral-950"}` : "h-[100svh]"}`}
    >
      <div
        ref={containerRef}
        className={`${
          isPageMode ? "sticky top-0 h-[100svh]" : "relative h-full"
        } w-full overflow-hidden ${
          isCream ? "bg-[#EAE9E7] text-neutral-900" : "bg-neutral-950 text-white"
        } select-none flex items-center justify-center isolate`}
        style={{
          perspective: stage.isMobile ? "900px" : "1200px",
          transformStyle: "preserve-3d",
        }}
      >
        {/* Immersive Background Grid & Glow */}
        <div
          className={`pointer-events-none absolute inset-0 ${
            isCream
              ? "bg-[radial-gradient(rgba(0,0,0,0.12)_1px,transparent_1px)] opacity-60"
              : "bg-[radial-gradient(#1e1b4b_1px,transparent_1px)] opacity-70"
          } [background-size:28px_28px] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,#000_60%,transparent_100%)]`}
        />
        <div
          className={`pointer-events-none absolute inset-0 ${
            isCream
              ? "bg-[radial-gradient(circle_at_center,rgba(215,205,190,0.55)_0%,transparent_75%)]"
              : "bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.22)_0%,transparent_75%)]"
          }`}
        />

        {/* Depth Ring Guides */}
        <div
          className={`pointer-events-none absolute h-[48vmin] w-[48vmin] rounded-full border ${
            isCream ? "border-black/10" : "border-indigo-400/15"
          }`}
        />
        <div
          className={`pointer-events-none absolute h-[76vmin] w-[76vmin] rounded-full border border-dashed ${
            isCream ? "border-black/15" : "border-white/10"
          }`}
        />

        {/* Central Anchor Typography */}
        <motion.div
          style={{ scale: titleScale, opacity: titleOpacity }}
          className="pointer-events-none z-0 flex flex-col items-center text-center px-6 max-w-2xl"
        >
          <div
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-mono uppercase tracking-[0.3em] mb-4 backdrop-blur-sm ${
              isCream
                ? "border-black/15 bg-black/5 text-neutral-800"
                : "border-indigo-500/30 bg-indigo-500/10 text-indigo-300"
            }`}
          >
            <Sparkles className={`h-3 w-3 ${isCream ? "text-neutral-700" : "text-indigo-400"}`} />
            <span>{badge}</span>
          </div>
          <h1
            className={`text-5xl sm:text-7xl md:text-8xl font-bold tracking-tighter leading-[0.9] ${
              isCream
                ? "text-neutral-900 drop-shadow-sm"
                : "bg-gradient-to-b from-white via-white to-white/40 bg-clip-text text-transparent"
            }`}
          >
            {titleLine1}
            <br />
            {titleLine2}
          </h1>
          <p
            className={`mt-5 max-w-[40ch] text-sm sm:text-base leading-relaxed ${
              isCream ? "font-normal text-neutral-600" : "font-light text-neutral-400"
            }`}
          >
            {subtitle}
          </p>
        </motion.div>

        {/* Initial Scroll Prompt & Jump Button */}
        <motion.div
          style={{ opacity: promptOpacity }}
          className={`absolute bottom-8 z-20 flex flex-col items-center gap-2.5 text-xs font-mono uppercase tracking-[0.25em] ${
            isCream ? "text-neutral-500" : "text-neutral-400"
          }`}
        >
          <button
            onClick={handleScrollDown}
            className={`group pointer-events-auto flex flex-col items-center gap-2 transition-colors ${
              isCream ? "text-neutral-600 hover:text-neutral-900" : "text-neutral-400 hover:text-white"
            }`}
            aria-label="Scroll to explore projects"
          >
            <span className="text-[11px] tracking-[0.25em] transition-transform group-hover:translate-y-0.5">
              Scroll to Explore
            </span>
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full border backdrop-blur-sm transition-all duration-300 ${
                isCream
                  ? "border-black/15 bg-black/5 group-hover:border-black/35 group-hover:bg-black/10"
                  : "border-white/15 bg-white/5 group-hover:border-indigo-400 group-hover:bg-indigo-500/20"
              }`}
            >
              <ChevronDown
                className={`h-4 w-4 animate-bounce ${isCream ? "text-neutral-700" : "text-indigo-300"}`}
              />
            </div>
          </button>
        </motion.div>

        {/* Transition Hint when reaching end of corridor */}
        {isPageMode && (
          <motion.div
            style={{ opacity: exitHintOpacity, y: exitHintY }}
            className={`pointer-events-none absolute bottom-10 z-20 flex flex-col items-center gap-2 text-xs font-mono uppercase tracking-[0.25em] ${
              isCream ? "text-neutral-700" : "text-indigo-300"
            }`}
          >
            <span className={`text-[11px] tracking-[0.25em] ${isCream ? "text-neutral-800 font-semibold" : "text-indigo-200"}`}>
              Scroll into Project Gallery
            </span>
            <div
              className={`flex h-6 w-6 items-center justify-center rounded-full border backdrop-blur-sm ${
                isCream ? "border-black/25 bg-black/10" : "border-indigo-400/40 bg-indigo-500/20"
              }`}
            >
              <ArrowDown
                className={`h-3.5 w-3.5 animate-bounce ${isCream ? "text-neutral-800" : "text-indigo-300"}`}
              />
            </div>
          </motion.div>
        )}

        {/* 3D Z-Space Plane */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ transformStyle: "preserve-3d" }}
        >
          {cards.map((card) => (
            <TunnelCard
              key={card.index}
              card={card}
              progress={activeProgress}
              pointer={pointer}
              total={cards.length}
              stage={stage}
              theme={theme}
              onSelect={onCardSelect}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
