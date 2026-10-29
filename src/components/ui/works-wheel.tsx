"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  Sparkles,
  Lock,
  Layers,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AdaptiveMedia } from "@/components/ui/adaptive-media";

export interface WorksWheelItem {
  id?: string;
  title: string;
  image: string;
  href?: string;
  category?: string;
  highlight?: string;
  description?: string;
}

export const DEFAULT_WORKS_ITEMS: WorksWheelItem[] = [
  {
    title: "Aether Motion Showcase",
    image:
      "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80",
    href: "/templates",
    category: "Custom Website & Motion",
    highlight: "WebGL 3D Architecture • 99/100 Performance",
    description:
      "A fluid digital portfolio crafted with real-time motion shaders, dynamic typography, and responsive micro-interactions for an international production studio.",
  },
  {
    title: "Hyperdrive Sneaker Lab",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80",
    href: "/templates",
    category: "Streetwear & Video",
    highlight: "3D Product Configurator • Sub-100ms Checkout",
    description:
      "High-conversion footwear storefront featuring synchronized 4K video loops, interactive drop timers, and bespoke Shopify Headless checkout.",
  },
  {
    title: "Amber & Ash Coffee",
    image:
      "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80",
    href: "/templates",
    category: "Retail & Commerce",
    highlight: "Recurring Subscription Engine • 42% AOV Growth",
    description:
      "E-commerce experience for a specialty roastery, complete with personalized bean preference quizzes and automated recurring delivery management.",
  },
  {
    title: "Solis High Jewelry",
    image:
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&q=80",
    href: "/templates",
    category: "Luxury Boutique",
    highlight: "Ultra-HD Macro Zoom • VIP Concierge Booking",
    description:
      "Editorial digital flagship tailored for an elite jewelry house, blending high-contrast minimalism with private VIP consultation scheduling.",
  },
  {
    title: "QuickCart POS System",
    image:
      "https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=1200&q=80",
    href: "/templates",
    category: "Shop Billing POS",
    highlight: "Offline Sync • Thermal Printing • Barcode Matrix",
    description:
      "Enterprise-grade point-of-sale platform built for fast-paced retail shops, supermarkets, and boutiques with split-second barcode scanning.",
  },
  {
    title: "Luminuxe Skincare",
    image:
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80",
    href: "/templates",
    category: "Botanical Beauty",
    highlight: "Ingredient Transparency Engine • Shade Matcher AI",
    description:
      "D2C skincare storefront emphasizing botanical purity, clinical trial visualizations, and custom skin diagnostic routines.",
  },
  {
    title: "Terra & Stone Pottery",
    image:
      "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1200&q=80",
    href: "/templates",
    category: "Ceramic Studio",
    highlight: "Limited Drop Mechanics • Workshop Reservations",
    description:
      "Earth-toned digital gallery for a handcrafted ceramics studio, facilitating one-off studio drop releases and seasonal class bookings.",
  },
  {
    title: "Verve Italian Optics",
    image:
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1200&q=80",
    href: "/templates",
    category: "Custom Eyeworks",
    highlight: "Virtual Frame Try-On • Prescription Lens Builder",
    description:
      "Milan-inspired optical boutique featuring precision frame configurators, lens tier customization, and international multi-currency billing.",
  },
  {
    title: "Canvas Design Systems",
    image:
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80",
    href: "/templates",
    category: "SaaS & Dashboards",
    highlight: "Design Token Automation • Real-Time Data Streams",
    description:
      "Scalable design system platform and analytics suite engineered for high-growth tech teams to harmonize product interfaces across multi-repo environments.",
  },
];

export interface WorksWheelProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "children"> {
  items?: WorksWheelItem[];
  label?: string;
  action?: string;
  headerRef?: React.RefObject<HTMLElement | null>;
  onTurnChange?: (turn: number, m: number) => void;
}

export function WorksWheel({
  items = DEFAULT_WORKS_ITEMS,
  label = "Selected Works",
  action = "Explore Project",
  className,
  onTurnChange,
  ...props
}: WorksWheelProps) {
  const navigate = useNavigate();
  const [active, setActive] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const total = items.length;
  const activeItem = items[active] || items[0];

  const listContainerRef = useRef<HTMLDivElement>(null);
  const activeItemRef = useRef<HTMLButtonElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  // 3D Interactive Mouse Tilt
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    // Calculate tilt angles (subtle ±4 deg)
    const tiltX = ((centerY - y) / centerY) * 4;
    const tiltY = ((x - centerX) / centerX) * 5;
    setTilt({ x: tiltX, y: tiltY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  // Drag & Swipe handling
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const goTo = useCallback(
    (idx: number) => {
      const nextIdx = (idx + total) % total;
      if (nextIdx === active) return;
      setIsTransitioning(true);
      setActive(nextIdx);
      if (onTurnChange) {
        onTurnChange(nextIdx, 1);
      }
      setTimeout(() => setIsTransitioning(false), 350);
    },
    [total, onTurnChange, active]
  );

  const prev = useCallback(() => goTo(active - 1), [goTo, active]);
  const next = useCallback(() => goTo(active + 1), [goTo, active]);

  // Scroll active item into view in right column list
  useEffect(() => {
    if (activeItemRef.current && listContainerRef.current) {
      activeItemRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [active]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!stageRef.current) return;
      const rect = stageRef.current.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      if (!inView) return;

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        next();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [prev, next]);

  // Pointer drag/swipe events
  const handlePointerDown = (e: React.PointerEvent) => {
    touchStartX.current = e.clientX;
    touchStartY.current = e.clientY;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (touchStartX.current === null) return;
    const diffX = e.clientX - touchStartX.current;
    const diffY = touchStartY.current ? e.clientY - touchStartY.current : 0;

    // Trigger only if horizontal swipe dominates
    if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX < 0) {
        next();
      } else {
        prev();
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  const projectSlug = activeItem.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");

  return (
    <div
      ref={stageRef}
      className={cn(
        "relative w-full flex flex-col justify-between overflow-hidden bg-transparent text-white select-none",
        className
      )}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      {...props}
    >
      {/* 3-Column Luxury Masterpiece Grid */}
      <div className="relative z-20 mx-auto max-w-[1560px] w-full px-5 md:px-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* ============================================================ */}
        {/* LEFT COLUMN: ACTIVE PROJECT EDITORIAL METADATA               */}
        {/* ============================================================ */}
        <div className="lg:col-span-4 flex flex-col justify-center space-y-5 text-left order-2 lg:order-1">
          {/* Index & Category Pill */}
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded-md bg-white/10 text-white border border-white/15">
              {String(active + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-[11px] font-mono uppercase tracking-[0.18em] text-indigo-400 font-medium">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              <span>{activeItem.category || "Client Showcase"}</span>
            </span>
          </div>

          {/* Project Title */}
          <div>
            <h3
              className={cn(
                "text-3xl sm:text-4xl lg:text-[40px] font-medium tracking-tight text-white leading-[1.08] transition-all duration-300",
                isTransitioning && "opacity-40 translate-y-1"
              )}
            >
              {activeItem.title}
            </h3>

            {/* Highlight Badges */}
            {activeItem.highlight && (
              <div className="mt-3 flex items-center gap-1.5 text-[11px] font-mono text-indigo-300/90 tracking-wide">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>{activeItem.highlight}</span>
              </div>
            )}

            {/* Description */}
            <p
              className={cn(
                "mt-3 text-xs sm:text-sm text-neutral-400 leading-relaxed max-w-md transition-all duration-300",
                isTransitioning && "opacity-40"
              )}
            >
              {activeItem.description ||
                "Engineered with bespoke design systems, conversion-driven architecture, and responsive precision."}
            </p>
          </div>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-wrap items-center gap-4">
            <Link
              to={activeItem.href || "/templates"}
              className="group inline-flex items-center gap-2 rounded-xl bg-white text-black px-5 py-2.5 text-xs font-semibold uppercase tracking-wider shadow-xl hover:bg-neutral-200 active:scale-95 transition-all"
            >
              <span>{action}</span>
              <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>

            <Link
              to="/templates"
              className="group inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-neutral-400 hover:text-white transition-colors"
            >
              <span>All Projects</span>
              <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
            </Link>
          </div>
        </div>

        {/* ============================================================ */}
        {/* CENTER COLUMN: LUXURY STUDIO LAPTOP DISPLAY                  */}
        {/* ============================================================ */}
        <div className="lg:col-span-5 relative flex items-center justify-center order-1 lg:order-2 py-4">
          <div
            className="relative w-full max-w-[560px] cursor-pointer group"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={() => navigate({ to: activeItem.href || "/templates" })}
            style={{
              perspective: "1200px",
            }}
          >
            {/* Ambient Back Glow */}
            <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/20 via-purple-500/15 to-blue-500/20 rounded-3xl blur-2xl -z-10 opacity-70 group-hover:opacity-90 transition-opacity duration-500" />

            {/* Realistic Laptop Chassis & Screen */}
            <div
              className="relative w-full aspect-[16/10.5] rounded-2xl bg-[#0c0d12] p-2.5 sm:p-3 border border-white/20 shadow-[0_30px_90px_-20px_rgba(0,0,0,0.95)] ring-1 ring-white/10 transition-transform duration-300 ease-out"
              style={{
                transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                transformStyle: "preserve-3d",
              }}
            >
              {/* Laptop Screen Frame */}
              <div className="relative size-full rounded-xl overflow-hidden bg-neutral-950 flex flex-col border border-white/10 shadow-inner">
                {/* Browser / OS Top Bar */}
                <div className="h-6 sm:h-7 px-3 bg-[#16171d] border-b border-white/10 flex items-center justify-between shrink-0 select-none">
                  {/* Traffic Light Dots */}
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]/80" />
                  </div>

                  {/* Browser URL Pill */}
                  <div className="flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/5 border border-white/5 text-[9px] sm:text-[10px] font-mono text-neutral-400">
                    <Lock className="w-2.5 h-2.5 text-indigo-400" />
                    <span className="truncate max-w-[140px] sm:max-w-[200px]">
                      creare.agency/${projectSlug}
                    </span>
                  </div>

                  {/* Right Icons */}
                  <div className="w-8 flex justify-end">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400/80 shadow-[0_0_6px_rgba(129,140,248,0.8)]" />
                  </div>
                </div>

                {/* Display Viewport */}
                <div className="relative flex-1 w-full overflow-hidden bg-neutral-900 group">
                  <div
                    className={cn(
                      "size-full transition-all duration-500 ease-out",
                      isTransitioning ? "opacity-30 scale-[0.98]" : "opacity-100 scale-100"
                    )}
                  >
                    <AdaptiveMedia
                      src={activeItem.image}
                      alt={activeItem.title}
                      loading="eager"
                      className="size-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  </div>

                  {/* Glass Screen Reflection Sheen */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.04] to-white/[0.12] pointer-events-none" />

                  {/* Hover Floating Action Badge */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-black/30 backdrop-blur-[2px]">
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/90 text-black text-xs font-semibold shadow-2xl backdrop-blur-md transform translate-y-2 group-hover:translate-y-0 transition-transform">
                      <span>View Project Live</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>

              {/* Laptop Notch & Bottom Base Lip */}
              <div className="absolute -bottom-2.5 inset-x-8 h-2 bg-gradient-to-b from-neutral-700 via-neutral-800 to-neutral-950 rounded-b-xl border-t border-white/20 shadow-md">
                <div className="w-16 h-1 bg-neutral-600/60 mx-auto rounded-full mt-0.5" />
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* RIGHT COLUMN: INTERACTIVE ARCHIVE INDEX                     */}
        {/* ============================================================ */}
        <div className="lg:col-span-3 hidden lg:flex flex-col text-right order-3 max-h-[420px]">
          <div className="mb-3 pb-2.5 border-b border-white/10 flex items-center justify-between text-neutral-400">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] font-semibold text-neutral-300 flex items-center gap-1.5">
              <Layers className="w-3 h-3 text-indigo-400" />
              <span>Archive Index</span>
            </span>
            <span className="text-[10px] font-mono text-neutral-400">
              {String(active + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
            </span>
          </div>

          <div
            ref={listContainerRef}
            className="no-scrollbar space-y-1.5 overflow-y-auto pr-1"
          >
            {items.map((item, idx) => {
              const isActive = idx === active;
              return (
                <button
                  key={item.title + idx}
                  ref={isActive ? activeItemRef : null}
                  type="button"
                  onClick={() => goTo(idx)}
                  className={cn(
                    "group w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl text-xs tracking-tight transition-all cursor-pointer text-left",
                    isActive
                      ? "bg-white/12 text-white font-semibold border border-white/20 shadow-md backdrop-blur-md"
                      : "text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent"
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={cn(
                        "text-[10px] font-mono transition-colors",
                        isActive ? "text-indigo-400 font-bold" : "text-neutral-600 group-hover:text-neutral-400"
                      )}
                    >
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <span className="truncate">{item.title}</span>
                  </div>

                  {isActive ? (
                    <span className="w-2 h-2 rounded-full bg-indigo-400 shrink-0 shadow-[0_0_10px_rgba(129,140,248,1)]" />
                  ) : (
                    <span className="text-[9px] font-mono uppercase tracking-wider text-neutral-600 group-hover:text-neutral-400 shrink-0">
                      View
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* BOTTOM NAVIGATION DOCK                                       */}
      {/* ============================================================ */}
      <div className="relative z-30 mt-8 sm:mt-10 flex items-center justify-center">
        <div className="inline-flex items-center gap-4 px-4 py-2 rounded-full bg-neutral-900/90 border border-white/15 backdrop-blur-xl shadow-2xl">
          {/* Prev Button */}
          <button
            type="button"
            aria-label="Previous project"
            onClick={prev}
            className="w-8 h-8 rounded-full grid place-items-center text-neutral-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer active:scale-90"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Counter Display */}
          <div className="flex items-center gap-1.5 font-mono text-xs font-semibold px-2">
            <span className="text-white">{String(active + 1).padStart(2, "0")}</span>
            <span className="text-neutral-500">/</span>
            <span className="text-neutral-400">{String(total).padStart(2, "0")}</span>
          </div>

          {/* Interactive Progress Indicators */}
          <div className="hidden sm:flex items-center gap-1.5 px-1">
            {items.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Jump to project ${i + 1}`}
                onClick={() => goTo(i)}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300 cursor-pointer",
                  i === active ? "w-6 bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" : "w-1.5 bg-white/20 hover:bg-white/40"
                )}
              />
            ))}
          </div>

          {/* Next Button */}
          <button
            type="button"
            aria-label="Next project"
            onClick={next}
            className="w-8 h-8 rounded-full grid place-items-center text-neutral-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer active:scale-90"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default WorksWheel;
