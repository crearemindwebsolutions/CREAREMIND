"use client";

import { ImageStreamHero, type StreamImage } from "@/components/ui/image-stream-hero";
import { ArrowRight, Sparkles, Layers } from "lucide-react";

/**
 * Curated high-resolution images matching modern SaaS, e-commerce, and mobile app products.
 * Includes reliable Unsplash stock photography and CDN image fallbacks.
 */
export const DEMO_STREAM_IMAGES: StreamImage[] = [
  {
    src: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
    alt: "Performance analytics dashboard with dark theme metrics and charts",
  },
  {
    src: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1200&q=80",
    alt: "Modern mobile banking and fintech cryptocurrency wallet app",
  },
  {
    src: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80",
    alt: "Hyperdrive performance sneakers e-commerce 3D product showcase",
  },
  {
    src: "https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=1200&q=80",
    alt: "QuickCart modern POS checkout and automated retail terminal",
  },
  {
    src: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80",
    alt: "Creative web design studio digital platform and developer workspace",
  },
  {
    src: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80",
    alt: "Artisan specialty coffee roastery and subscription commerce",
  },
  {
    src: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&q=80",
    alt: "Luxury jewelry boutique and bespoke gold craftsmanship catalog",
  },
  {
    src: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80",
    alt: "Botanical skincare aesthetics and minimal wellness brand",
  },
  {
    src: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1200&q=80",
    alt: "Studio ceramics artisanal pottery showcase and exhibition",
  },
  {
    src: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1200&q=80",
    alt: "Handcrafted acetate eyewear editorial lookbook",
  },
  {
    src: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80",
    alt: "High-fidelity audio systems and acoustic engineering hardware",
  },
  {
    src: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80",
    alt: "Haute couture seasonal apparel and minimalist fashion house",
  },
];

// ONLY DEFAULT EXPORT WILL BE TREATED AS A DEMO BY COMPONENT PREVIEWS
export default function DemoOne() {
  return (
    <div className="w-full bg-black py-8">
      <ImageStreamHero
        images={DEMO_STREAM_IMAGES}
        cards={12}
        speed={20}
        axis={52}
        className="h-[620px] w-full rounded-2xl border border-white/10 bg-black text-white shadow-2xl"
      >
        {/* Ambient radial vignette & edge fades */}
        <div className="pointer-events-none absolute inset-0 z-[5] bg-radial-[circle_at_center,transparent_25%,rgba(0,0,0,0.85)_100%]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black via-black/60 to-transparent z-[6]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-black via-black/60 to-transparent z-[6]" />
        {/* Soft bottom atmospheric blue glow */}
        <div className="pointer-events-none absolute -bottom-16 inset-x-0 h-40 bg-gradient-to-t from-sky-600/20 via-blue-900/10 to-transparent blur-3xl z-[6]" />

        {/* Foreground Content Card Overlay */}
        <div className="relative z-10 flex h-full flex-col items-center justify-between px-6 py-12 text-center select-none pointer-events-none">
          {/* Top Pill Header */}
          <div className="pointer-events-auto">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-black/60 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-white shadow-lg backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
              Production Corridor • 120+ Deployments
            </span>
          </div>

          {/* Centered Typography */}
          <div className="relative max-w-2xl px-6 py-2 pointer-events-auto">
            <div className="pointer-events-none absolute inset-0 -inset-x-8 rounded-3xl bg-black/70 blur-2xl -z-10" />
            <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl text-white leading-[1.08] drop-shadow-md">
              Your work,
              <br />
              front and centre.
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-balance text-xs sm:text-sm md:text-base text-neutral-300 leading-relaxed drop-shadow-sm">
              Every system, app, and platform we engineer is built for extreme velocity, conversion,
              and total source code ownership.
            </p>
          </div>

          {/* Bottom Action Bar */}
          <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-3 sm:gap-4 pb-2">
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3 text-xs sm:text-sm font-semibold tracking-wider text-black shadow-xl transition-all duration-300 hover:bg-neutral-200 hover:scale-105 active:scale-95"
            >
              <span>EXPLORE ALL CLIENT WORK</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-neutral-900/80 px-7 py-3 text-xs sm:text-sm font-semibold tracking-wider text-white backdrop-blur-md transition-all duration-300 hover:border-white/40 hover:bg-neutral-800 hover:scale-105 active:scale-95"
            >
              <Layers className="h-4 w-4" />
              <span>START A PROJECT</span>
            </button>
          </div>
        </div>
      </ImageStreamHero>
    </div>
  );
}
