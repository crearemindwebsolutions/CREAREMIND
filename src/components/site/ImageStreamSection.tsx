import { Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, Layers } from "lucide-react";
import { ImageStreamHero, type StreamImage } from "@/components/ui/image-stream-hero";
import { useSiteContent } from "@/lib/site-content";

import tplWebDesign from "@/assets/templates/tpl-web-design.jpg";
import tplCyberTech from "@/assets/templates/tpl-cyber-tech.jpg";
import tplMobileApp from "@/assets/templates/tpl-mobile-app.jpg";
import tplAnalyticsChart from "@/assets/templates/tpl-analytics-chart.jpg";
import tplPos from "@/assets/templates/tpl-pos.jpg";
import tplSaas from "@/assets/templates/tpl-saas.jpg";
import tplMobile from "@/assets/templates/tpl-mobile.jpg";
import tplEcomDashboard from "@/assets/templates/tpl-ecom-dashboard.jpg";
import tplUiSystem from "@/assets/templates/tpl-ui-system.jpg";
import tplAgency from "@/assets/templates/tpl-agency.jpg";

const STREAM_IMAGES: StreamImage[] = [
  {
    src: tplWebDesign,
    alt: "Modern Web Application Architecture & Cloud Engineering — Creare Mind",
  },
  {
    src: tplCyberTech,
    alt: "Zero-Trust Cloud Infrastructure & API Microservices — Creare Mind",
  },
  {
    src: tplMobileApp,
    alt: "Cross-Platform Mobile App Engineering & Biometrics — Creare Mind",
  },
  {
    src: tplAnalyticsChart,
    alt: "Enterprise Executive Analytics & Real-Time Telemetry — Creare Mind",
  },
  {
    src: tplPos,
    alt: "Retail Touchscreen POS Terminal & Thermal Billing System — Creare Mind",
  },
  {
    src: tplSaas,
    alt: "Multi-Tenant Enterprise SaaS Platform & Client Ledger — Creare Mind",
  },
  {
    src: tplMobile,
    alt: "FinTech Native Mobile Application & Instant UPI Checkout — Creare Mind",
  },
  {
    src: tplEcomDashboard,
    alt: "Real-Time Telemetry & Systems Observability Dashboard — Creare Mind",
  },
  {
    src: tplUiSystem,
    alt: "Design Tokens, Figma Architecture & Accessible UI Kit — Creare Mind",
  },
  {
    src: tplAgency,
    alt: "Full-Stack Software Engineering Studio Showcase — Creare Mind",
  },
];

export function ImageStreamSection() {
  const { content } = useSiteContent();
  const streamImages: StreamImage[] = content.streamImages?.items?.length
    ? content.streamImages.items.map((item) => ({ src: item.src, alt: item.alt }))
    : STREAM_IMAGES;

  return (
    <section className="relative overflow-hidden bg-black text-white border-y border-white/10 select-none">
      <ImageStreamHero
        images={streamImages}
        cards={6}
        speed={24}
        axis={50}
        path={{
          cardWidth: 15,
          cardHeight: 22,
          cardRadius: 0.8,
        }}
        className="h-[620px] sm:h-[680px] md:h-[750px] lg:h-[800px] w-full bg-black text-white"
      >
        {/* Ambient radial vignette for focused center typography */}
        <div className="pointer-events-none absolute inset-0 z-[5] bg-radial-[circle_at_center,transparent_20%,rgba(0,0,0,0.85)_100%]" />
        
        {/* Soft edge gradient fades */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black via-black/60 to-transparent z-[6]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black via-black/70 to-transparent z-[6]" />
        
        {/* Ambient deep blue atmospheric glow along bottom corridor */}
        <div className="pointer-events-none absolute -bottom-16 inset-x-0 h-48 bg-gradient-to-t from-sky-600/25 via-blue-900/15 to-transparent blur-3xl z-[6]" />

        {/* Foreground Content Card Overlay */}
        <div className="relative z-10 flex h-full flex-col items-center justify-between px-5 pt-12 sm:pt-16 pb-16 sm:pb-20 text-center pointer-events-none">
          {/* Top Pill Header */}
          <div className="pointer-events-auto">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-black/70 px-4 py-1.5 text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-white shadow-lg backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
              <span>Production Corridor • 120+ Deployments</span>
            </span>
          </div>

          {/* Centered Typography & Impact Message */}
          <div className="relative max-w-3xl px-6 py-2 pointer-events-auto">
            <div className="pointer-events-none absolute inset-0 -inset-x-8 rounded-3xl bg-black/75 blur-2xl -z-10" />
            <h2 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl text-white leading-[1.08] drop-shadow-md">
              Your work, <br />
              front and centre.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-balance text-xs sm:text-sm md:text-base text-neutral-300 leading-relaxed drop-shadow-sm">
              Every system, app, and platform we engineer is built for extreme velocity, conversion,
              and total source code ownership.
            </p>
          </div>

          {/* Bottom Action Bar */}
          <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-2">
            <Link
              to="/templates"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3 text-xs sm:text-sm font-semibold tracking-wider text-black shadow-xl transition-all duration-300 hover:bg-neutral-200 hover:scale-105 active:scale-95"
            >
              <span>EXPLORE ALL CLIENT WORK</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-neutral-900/80 px-7 py-3 text-xs sm:text-sm font-semibold tracking-wider text-white backdrop-blur-md transition-all duration-300 hover:border-white/40 hover:bg-neutral-800 hover:scale-105 active:scale-95"
            >
              <Layers className="h-4 w-4" />
              <span>START A PROJECT</span>
            </Link>
          </div>
        </div>
      </ImageStreamHero>
    </section>
  );
}

export default ImageStreamSection;
