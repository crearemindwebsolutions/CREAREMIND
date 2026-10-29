import { Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles } from "lucide-react";
import { WorksWheel, type WorksWheelItem } from "@/components/ui/works-wheel";

import tplAgency from "@/assets/templates/tpl-agency.jpg";
import tplSneakers from "@/assets/templates/tpl-ecom-sneakers.jpg";
import tplCoffee from "@/assets/templates/tpl-ecom-coffee.jpg";
import tplJewelry from "@/assets/templates/tpl-ecom-jewelry.jpg";
import tplPos from "@/assets/templates/tpl-pos.jpg";
import tplBeauty from "@/assets/templates/tpl-ecom-beauty.jpg";
import tplCeramics from "@/assets/templates/tpl-ecom-ceramics.jpg";
import tplEyewear from "@/assets/templates/tpl-ecom-eyewear.jpg";
import tplDesignSystem from "@/assets/tpl-2.jpg";

const CREARE_WORKS: WorksWheelItem[] = [
  {
    title: "Aether Motion Showcase",
    image: tplAgency,
    href: "/templates",
    category: "Custom Website & Motion",
    highlight: "WebGL 3D Architecture • 99/100 Performance",
    description: "A fluid digital portfolio crafted with real-time motion shaders, dynamic typography, and responsive micro-interactions for an international production studio.",
  },
  {
    title: "Hyperdrive Sneaker Lab",
    image: tplSneakers,
    href: "/templates",
    category: "Streetwear & Video",
    highlight: "3D Product Configurator • Sub-100ms Checkout",
    description: "High-conversion footwear storefront featuring synchronized 4K video loops, interactive drop timers, and bespoke Shopify Headless checkout.",
  },
  {
    title: "Amber & Ash Coffee",
    image: tplCoffee,
    href: "/templates",
    category: "Retail & Commerce",
    highlight: "Recurring Subscription Engine • 42% AOV Growth",
    description: "E-commerce experience for a specialty roastery, complete with personalized bean preference quizzes and automated recurring delivery management.",
  },
  {
    title: "Solis High Jewelry",
    image: tplJewelry,
    href: "/templates",
    category: "Luxury Boutique",
    highlight: "Ultra-HD Macro Zoom • VIP Concierge Booking",
    description: "Editorial digital flagship tailored for an elite jewelry house, blending high-contrast minimalism with private VIP consultation scheduling.",
  },
  {
    title: "QuickCart POS System",
    image: tplPos,
    href: "/templates",
    category: "Shop Billing POS",
    highlight: "Offline Sync • Thermal Printing • Barcode Matrix",
    description: "Enterprise-grade point-of-sale platform built for fast-paced retail shops, supermarkets, and boutiques with split-second barcode scanning.",
  },
  {
    title: "Luminuxe Skincare",
    image: tplBeauty,
    href: "/templates",
    category: "Botanical Beauty",
    highlight: "Ingredient Transparency Engine • Shade Matcher AI",
    description: "D2C skincare storefront emphasizing botanical purity, clinical trial visualizations, and custom skin diagnostic routines.",
  },
  {
    title: "Terra & Stone Pottery",
    image: tplCeramics,
    href: "/templates",
    category: "Ceramic Studio",
    highlight: "Limited Drop Mechanics • Workshop Reservations",
    description: "Earth-toned digital gallery for a handcrafted ceramics studio, facilitating one-off studio drop releases and seasonal class bookings.",
  },
  {
    title: "Verve Italian Optics",
    image: tplEyewear,
    href: "/templates",
    category: "Custom Eyeworks",
    highlight: "Virtual Frame Try-On • Prescription Lens Builder",
    description: "Milan-inspired optical boutique featuring precision frame configurators, lens tier customization, and international multi-currency billing.",
  },
  {
    title: "Canvas Design Systems",
    image: tplDesignSystem,
    href: "/templates",
    category: "SaaS & Dashboards",
    highlight: "Design Token Automation • Real-Time Data Streams",
    description: "Scalable design system platform and analytics suite engineered for high-growth tech teams to harmonize product interfaces across multi-repo environments.",
  },
];

import { useSiteContent } from "@/lib/site-content";

export function WorksWheelSection() {
  const { content } = useSiteContent();

  const items = content.worksWheel?.items?.length
    ? content.worksWheel.items
    : CREARE_WORKS;
  const label = content.worksWheel?.label || "Creare '26";
  const heading = content.worksWheel?.heading || "Selected works & systems";
  const subtitle =
    content.worksWheel?.subtitle ||
    "Explore our client archive of bespoke digital systems, commercial e-commerce, and high-impact applications.";

  return (
    <section
      id="works-wheel-section"
      className="relative bg-black text-white min-h-[920px] lg:min-h-[980px] w-full border-t border-white/10 overflow-hidden select-none py-16 sm:py-20 md:py-24 flex flex-col justify-between"
    >
      {/* Background radial glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,rgba(99,102,241,0.09)_0%,rgba(0,0,0,0.95)_75%)]" />

      {/* Top Section Header (Integrated into document flow - no overlap) */}
      <div className="relative z-20 mx-auto max-w-[1560px] w-full px-5 md:px-10 mb-8 sm:mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-400 mb-3 font-semibold">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              <span>{label} • Client Archive</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-white leading-[1.08]">
              {heading}
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-neutral-400 leading-relaxed max-w-xl">
              {subtitle}
            </p>
          </div>

          <div className="shrink-0">
            <Link
              to="/templates"
              className="group inline-flex items-center gap-2 rounded-xl bg-white text-black px-5 py-2.5 text-xs font-semibold uppercase tracking-wider hover:bg-neutral-200 transition-all shadow-md active:scale-95"
            >
              <span>View All Projects</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>

      {/* Center Stage Showcase */}
      <div className="relative z-20 flex-1 flex flex-col justify-center w-full">
        <WorksWheel
          items={items}
          label={label}
          action="Explore Work"
          className="size-full"
        />
      </div>
    </section>
  );
}

export default WorksWheelSection;
