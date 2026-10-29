import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { ClosingCta } from "@/components/site/PageBlocks";
import { GetStartedLink } from "@/components/site/GetStartedLink";
import PerspectiveTunnelHero, { type TunnelItem } from "@/components/ui/perspective-tunnel-hero";
import { useSiteContent } from "@/lib/site-content";
import { AdaptiveMedia } from "@/components/ui/adaptive-media";

import tplFashion from "@/assets/templates/tpl-fashion.jpg";
import tplAgency from "@/assets/templates/tpl-agency.jpg";
import tplSneakers from "@/assets/templates/tpl-ecom-sneakers.jpg";
import tplCoffee from "@/assets/templates/tpl-ecom-coffee.jpg";
import tplJewelry from "@/assets/templates/tpl-ecom-jewelry.jpg";
import tplPantry from "@/assets/templates/tpl-ecom-pantry.jpg";
import tplPos from "@/assets/templates/tpl-pos.jpg";
import tplBeauty from "@/assets/templates/tpl-ecom-beauty.jpg";
import tplCeramics from "@/assets/templates/tpl-ecom-ceramics.jpg";
import tplEyewear from "@/assets/templates/tpl-ecom-eyewear.jpg";
import tplMobileApp from "@/assets/templates/tpl-ecom-mobile.jpg";
import tplAudio from "@/assets/templates/tpl-ecom-audio.jpg";
import tplFurniture from "@/assets/templates/tpl-ecom-furniture.jpg";
import tplDesignSystem from "@/assets/tpl-2.jpg";

export const Route = createFileRoute("/templates")({
  head: () => ({
    meta: [
      { title: "Our Work & Deliverables — Creare Mind" },
      {
        name: "description",
        content:
          "Explore custom websites, mobile apps, shop billing systems, and creative media built by Creare Mind.",
      },
      { property: "og:title", content: "Our Work & Deliverables — Creare Mind" },
      {
        property: "og:description",
        content:
          "Explore custom websites, mobile apps, shop billing systems, and creative media built by Creare Mind.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TemplatesPage,
});

const TEMPLATE_CATEGORIES = [
  "All",
  "Custom Websites",
  "Mobile Apps",
  "Shop Billing POS",
  "Social Media & Video",
  "SaaS & Dashboards",
  "Retail & Commerce",
];

export interface TemplateItem {
  name: string;
  img: string;
  cat: string;
  colorTheme: string;
  swatches: string[];
  tagline: string;
}

const TEMPLATES: TemplateItem[] = [
  {
    name: "Aether Design & Motion",
    img: tplAgency,
    cat: "Custom Websites",
    colorTheme: "Vibrant Safety Orange",
    swatches: ["#EA580C", "#0F172A", "#FFFFFF"],
    tagline: "High-impact Swiss editorial digital showcase with bold safety orange & stark black typography.",
  },
  {
    name: "Hyperdrive Sneaker Lab",
    img: tplSneakers,
    cat: "Social Media & Video",
    colorTheme: "Electric Cobalt & Neon",
    swatches: ["#2563EB", "#06B6D4", "#F8FAFC"],
    tagline: "Vibrant urban streetwear drops with electric cobalt blue sneakers & high-voltage product cards.",
  },
  {
    name: "Amber & Ash Coffee Roasters",
    img: tplCoffee,
    cat: "Retail & Commerce",
    colorTheme: "Forest Green & Copper",
    swatches: ["#15803D", "#B45309", "#FEF3C7"],
    tagline: "Specialty single-origin coffee subscriptions with rich British racing green & warm copper tones.",
  },
  {
    name: "Solis High Jewelry",
    img: tplJewelry,
    cat: "Retail & Commerce",
    colorTheme: "Royal Sapphire & Gold",
    swatches: ["#1E40AF", "#EAB308", "#FFFBEB"],
    tagline: "Bespoke diamond & royal sapphire jewelry boutique with warm champagne marble lookbooks.",
  },
  {
    name: "Nature's Larder Pantry",
    img: tplPantry,
    cat: "Retail & Commerce",
    colorTheme: "Honey Amber & Olive",
    swatches: ["#D97706", "#65A30D", "#FFFBEB"],
    tagline: "Artisan sourdough, raw organic honey & cold-pressed olive oils in a warm golden-hour aesthetic.",
  },
  {
    name: "QuickCart Retail POS",
    img: tplPos,
    cat: "Shop Billing POS",
    colorTheme: "Fresh Cyan & Pure White",
    swatches: ["#0284C7", "#22C55E", "#FFFFFF"],
    tagline: "Modern iPad cashier register with fresh cyan & emerald status alerts, thermal GST receipts.",
  },
  {
    name: "Luminuxe Botanical Skincare",
    img: tplBeauty,
    cat: "Custom Websites",
    colorTheme: "Rose Quartz & Ivory",
    swatches: ["#E11D48", "#FDE047", "#FFF7ED"],
    tagline: "Radiant botanical beauty storefront with sunlit travertine stone & soft rose gold accents.",
  },
  {
    name: "Terra & Stone Studio Pottery",
    img: tplCeramics,
    cat: "Social Media & Video",
    colorTheme: "Terracotta & Warm Clay",
    swatches: ["#C2410C", "#D97706", "#FAFAF9"],
    tagline: "Hand-thrown ceramic tableware & sculptured pottery with earthy terracotta and natural clay glazes.",
  },
  {
    name: "Verve Acetate Eyeworks",
    img: tplEyewear,
    cat: "Custom Websites",
    colorTheme: "Amber Tortoise & Moss",
    swatches: ["#B45309", "#4D7C0F", "#F5F5F4"],
    tagline: "Handcrafted Italian acetate sunglasses & optical frames lookbooks on sun-drenched limestone.",
  },
  {
    name: "Mira London Mobile Boutique",
    img: tplMobileApp,
    cat: "Mobile Apps",
    colorTheme: "Blush Champagne & Gold",
    swatches: ["#FB7185", "#CA8A04", "#FFFFFF"],
    tagline: "Native iOS luxury fashion experience with gold-embossed packaging & 1-tap express checkout.",
  },
  {
    name: "Audiofile Acoustic Systems",
    img: tplAudio,
    cat: "Custom Websites",
    colorTheme: "Modern Silver & Walnut",
    swatches: ["#64748B", "#334155", "#F8FAFC"],
    tagline: "Audiophile studio headphones, integrated amplifiers & brushed silver sound gear store.",
  },
  {
    name: "Aura Apparel & Linen",
    img: tplFashion,
    cat: "Retail & Commerce",
    colorTheme: "Warm Linen & Sand",
    swatches: ["#A8A29E", "#78716C", "#FAF5EF"],
    tagline: "Minimalist luxury linen fashion e-commerce with seasonal lookbooks & one-click checkout.",
  },
  {
    name: "Nordic Nest Modern Living",
    img: tplFurniture,
    cat: "Retail & Commerce",
    colorTheme: "Scandinavian Oak & White",
    swatches: ["#D97706", "#78716C", "#FFFFFF"],
    tagline: "Clean Scandinavian oak furniture, linen lighting & architectural interior design showcase.",
  },
  {
    name: "Canvas UI/UX Design System",
    img: tplDesignSystem,
    cat: "SaaS & Dashboards",
    colorTheme: "Cobalt Blue & Canary Yellow",
    swatches: ["#2563EB", "#FACC15", "#F8FAFC"],
    tagline: "Interactive e-commerce design system, wireframe prototypes & component library on natural desk.",
  },
];

const TUNNEL_CARDS: TunnelItem[] = [
  {
    src: tplAgency,
    title: "Aether Design & Motion",
    category: "Custom Websites",
  },
  {
    src: tplSneakers,
    title: "Hyperdrive Sneaker Lab",
    category: "Social Media & Video",
  },
  {
    src: tplCoffee,
    title: "Amber & Ash Coffee Roasters",
    category: "Retail & Commerce",
  },
  {
    src: tplJewelry,
    title: "Solis High Jewelry",
    category: "Retail & Commerce",
  },
  {
    src: tplPos,
    title: "QuickCart Retail POS",
    category: "Shop Billing POS",
  },
  {
    src: tplBeauty,
    title: "Luminuxe Botanical Skincare",
    category: "Custom Websites",
  },
  {
    src: tplCeramics,
    title: "Terra & Stone Studio Pottery",
    category: "Social Media & Video",
  },
  {
    src: tplEyewear,
    title: "Verve Italian Eyeworks",
    category: "Custom Websites",
  },
  {
    src: tplDesignSystem,
    title: "Canvas UI Design System",
    category: "SaaS & Dashboards",
  },
];

function TemplatesPage() {
  const { content } = useSiteContent();
  const [cat, setCat] = useState("All");

  const templateItems = useMemo<TemplateItem[]>(() => {
    if (!content.templates?.items?.length) return TEMPLATES;
    return content.templates.items.map((saved, idx) => {
      const match = TEMPLATES.find((t) => t.name.toLowerCase() === saved.name.toLowerCase()) || TEMPLATES[idx] || TEMPLATES[0];
      return {
        name: saved.name || match?.name || "Creare Project",
        img: saved.img || match?.img || tplAgency,
        cat: saved.cat || match?.cat || "Custom Websites",
        colorTheme: match?.colorTheme || "Bespoke Palette",
        swatches: match?.swatches || ["#1E293B", "#64748B", "#F8FAFC"],
        tagline: saved.tagline || match?.tagline || "",
      };
    });
  }, [content.templates?.items]);

  const list = cat === "All" ? templateItems : templateItems.filter((t) => t.cat === cat);

  const dynamicTunnelCards = useMemo<TunnelItem[]>(() => {
    return templateItems.slice(0, 9).map((t) => ({
      src: t.img,
      title: t.name,
      category: t.cat,
    }));
  }, [templateItems]);

  const heading = content.templates?.heading || "Our work & client projects";
  const subtitle = content.templates?.subtitle || "Explore custom websites, mobile applications, shop billing systems, and social growth campaigns delivered by our team.";

  const handleCardSelect = (item: TunnelItem) => {
    if (item.category && TEMPLATE_CATEGORIES.includes(item.category)) {
      setCat(item.category);
    }
    const target = document.getElementById("work-gallery");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <PerspectiveTunnelHero
        images={dynamicTunnelCards}
        badge="Creare Mind Project Archive"
        titleLine1="INTO THE"
        titleLine2="ETHER."
        subtitle="Scroll your mouse wheel or trackpad to fly through our spatial 3D corridor of client works."
        scrollTargetId="work-gallery"
        onCardSelect={handleCardSelect}
      />

      <section id="work-gallery" className="relative z-20 bg-[#EAE9E7] px-5 pb-24 pt-20 md:pt-28 text-neutral-900 md:px-10 scroll-mt-20">
        <div className="mx-auto max-w-[1360px]">
          <div data-reveal="stagger" className="max-w-3xl">
            <h1 className="text-5xl font-medium leading-[1.05] tracking-[-0.03em] text-neutral-900 md:text-[80px]">{heading}</h1>
            <p className="mt-6 max-w-xl text-lg text-neutral-600">{subtitle}</p>
          </div>
          <div className="no-scrollbar sticky top-16 md:top-20 z-20 mt-14 flex gap-2 overflow-x-auto bg-[#EAE9E7]/95 backdrop-blur-md py-3.5">
            {TEMPLATE_CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  cat === c
                    ? "bg-neutral-900 text-[#FAF8F5] shadow-sm"
                    : "bg-black/5 text-neutral-700 hover:bg-black/10 border border-black/5"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="mt-8 sm:mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
            {list.map((t) => (
              <GetStartedLink key={t.name} className="group block">
                <div className="relative overflow-hidden rounded-xl isolate bg-[#FAF8F5] shadow-sm transition-all duration-500 ease-expo group-hover:-translate-y-1.5 group-hover:shadow-2xl border border-black/8 group-hover:border-black/15">
                  <AdaptiveMedia
                    src={t.img}
                    alt={`${t.name} template preview`}
                    className="aspect-[16/9] w-full object-cover object-top rounded-[inherit] transition-transform duration-700 ease-expo group-hover:scale-[1.03]"
                  />
                </div>
                <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 sm:gap-3">
                  <p className="text-base sm:text-lg font-semibold sm:font-medium tracking-tight text-neutral-900 group-hover:text-black transition-colors line-clamp-1 sm:line-clamp-none">
                    {t.name}
                  </p>
                  <span className="self-start sm:self-auto shrink-0 rounded-full border border-black/10 bg-black/5 px-2.5 py-0.5 text-[11px] font-medium text-neutral-600">
                    {t.cat}
                  </span>
                </div>
                {t.tagline && (
                  <p className="mt-1.5 text-xs sm:text-[13px] leading-relaxed text-neutral-600 line-clamp-2">
                    {t.tagline}
                  </p>
                )}
              </GetStartedLink>
            ))}
          </div>
        </div>
      </section>
      <ClosingCta theme="cream" />
    </>
  );
}
