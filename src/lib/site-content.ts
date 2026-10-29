import { useEffect, useState, useCallback } from "react";

import tplAgency from "@/assets/templates/tpl-agency.jpg";
import tplSneakers from "@/assets/templates/tpl-ecom-sneakers.jpg";
import tplCoffee from "@/assets/templates/tpl-ecom-coffee.jpg";
import tplJewelry from "@/assets/templates/tpl-ecom-jewelry.jpg";
import tplPos from "@/assets/templates/tpl-pos.jpg";
import tplBeauty from "@/assets/templates/tpl-ecom-beauty.jpg";
import tplCeramics from "@/assets/templates/tpl-ecom-ceramics.jpg";
import tplEyewear from "@/assets/templates/tpl-ecom-eyewear.jpg";
import tplFashion from "@/assets/templates/tpl-fashion.jpg";
import tplSaas from "@/assets/templates/tpl-saas.jpg";
import tplArch from "@/assets/templates/tpl-architecture.jpg";
import tplCreative from "@/assets/templates/tpl-creative-dev.jpg";
import tplMobile from "@/assets/templates/tpl-mobile.jpg";
import tplDashboard from "@/assets/templates/tpl-ecom-dashboard.jpg";
import tplEditorial from "@/assets/templates/tpl-editorial.jpg";
import tplDesignSystem from "@/assets/templates/tpl-ui-system.jpg";

import {
  getDeletedMediaKeys,
  fetchUserMedia,
  syncSiteContentToCloud,
  fetchSiteContentFromCloud,
} from "./cloudinary";

/**
 * Verified active hero background videos loaded from Cloudinary database.
 * Strictly excludes AI placeholder or legacy demo videos.
 */
export const DATABASE_HERO_VIDEOS: string[] = [
  "https://res.cloudinary.com/nf3aubag/video/upload/v1793200801/mp0tttrju4iqomdfmvrt.mp4",
  "https://res.cloudinary.com/nf3aubag/video/upload/v1793200805/bmr8uqtacuzf5gzuxrzk.mp4",
  "https://res.cloudinary.com/nf3aubag/video/upload/v1793195604/eiqipvpk3yzfzd5yrdpz.mp4",
  "https://res.cloudinary.com/nf3aubag/video/upload/v1793195634/f8gjqj6q4vbspsnejzi8.mp4",
  "https://res.cloudinary.com/nf3aubag/video/upload/v1793195693/kbvogg7s46xlwzhomapq.mp4",
  "https://res.cloudinary.com/nf3aubag/video/upload/v1793201397/wytfci2u18fb5r1nsjan.mp4",
  "https://res.cloudinary.com/nf3aubag/video/upload/v1793201470/zpdjlrzapbdimjuvmkoj.mp4",
];

export const LEGACY_AI_MEDIA_BLACKLIST = new Set([
  "gm33q3bquos8hs0fwrzo",
  "https://res.cloudinary.com/nf3aubag/video/upload/v1792673383/gm33q3bquos8hs0fwrzo.mp4",
  "kwkab3etojeikeclxnx5",
  "https://res.cloudinary.com/nf3aubag/video/upload/v1792673369/kwkab3etojeikeclxnx5.mp4",
  "jum4pj3cdzvninwtdvfp",
  "https://res.cloudinary.com/nf3aubag/video/upload/v1792673414/jum4pj3cdzvninwtdvfp.mp4",
  "kwfqzovj8xfkvvph1z1y",
  "https://res.cloudinary.com/nf3aubag/video/upload/v1792673361/kwfqzovj8xfkvvph1z1y.mp4",
  "ow7c0uatyd1bx6hl7skg",
  "https://res.cloudinary.com/nf3aubag/video/upload/v1792673430/ow7c0uatyd1bx6hl7skg.mp4",
  "qhs7uxfjnmhclfsvl92g",
  "https://res.cloudinary.com/nf3aubag/video/upload/v1792673450/qhs7uxfjnmhclfsvl92g.mp4",
  "vlln111ls8isi7ydnxpe",
  "https://res.cloudinary.com/nf3aubag/video/upload/v1792673465/vlln111ls8isi7ydnxpe.mp4",
  "frzn8lxk1eefwk2yplhp",
  "https://res.cloudinary.com/nf3aubag/video/upload/v1792673486/frzn8lxk1eefwk2yplhp.mp4",
]);

/**
 * Detect whether a media URL points to a video file or Cloudinary video resource.
 */
export function isVideoMedia(url?: string | null): boolean {
  if (!url || typeof url !== "string") return false;
  const clean = url.split("?")[0].toLowerCase();
  return (
    clean.endsWith(".mp4") ||
    clean.endsWith(".webm") ||
    clean.endsWith(".mov") ||
    clean.endsWith(".m4v") ||
    clean.endsWith(".ogg") ||
    url.includes("/video/upload/") ||
    url.includes("resource_type=video") ||
    url.startsWith("data:video/")
  );
}

export interface WheelItemData {
  id?: string;
  title: string;
  category: string;
  image: string;
  href: string;
}

export interface TemplateItemData {
  id?: string;
  name: string;
  cat: string;
  tagline: string;
  img: string;
}

export interface FeatureCardItemData {
  id?: string;
  t: string;
  d: string;
  img: string;
  link: string;
}

export interface FeatureTabItemData {
  id?: string;
  tab: string;
  page: string;
  serifTitle: string;
  subtitle: string;
  bgImage: string;
  theme?: "dark" | "cream";
  mockupHeader: string;
  mockupTitle: string;
  mockupMainImage: string;
  mockupSideTop: string;
  mockupSideBottom: string;
}

export interface HeroCardData {
  id: string;
  name: string;
  title?: string;
  subtitle?: string;
  image: string;
  image2?: string;
  image3?: string;
}

export interface ServiceCardData {
  id: string;
  category: string;
  title: string;
  subtitle?: string;
  description?: string;
  img: string;
  turnaround?: string;
}

export interface StreamImageData {
  id?: string;
  src: string;
  alt: string;
}

export interface SiteContent {
  branding: {
    name: string;
    tagline: string;
    phone: string;
    email: string;
    address: string;
    workingHours: string;
    instagramUrl: string;
    linkedinUrl: string;
    youtubeUrl: string;
    githubUrl: string;
    announcement: {
      enabled: boolean;
      text: string;
      linkText: string;
      linkUrl: string;
    };
  };
  hero: {
    badge: string;
    heading: string;
    subheading: string;
    ctaPrimaryText: string;
    ctaPrimaryLink: string;
    ctaSecondaryText: string;
    ctaSecondaryLink: string;
    videos: string[];
    cards: HeroCardData[];
  };
  worksWheel: {
    label: string;
    heading: string;
    subtitle: string;
    items: WheelItemData[];
  };
  templates: {
    heading: string;
    subtitle: string;
    items: TemplateItemData[];
  };
  featureCards: {
    heading: string;
    items: FeatureCardItemData[];
  };
  featureTabs: {
    heading: string;
    subtitle: string;
    items: FeatureTabItemData[];
  };
  services: {
    items: ServiceCardData[];
  };
  streamImages: {
    items: StreamImageData[];
  };
}

export const DEFAULT_SITE_CONTENT: SiteContent = {
  branding: {
    name: "CREARE MIND",
    tagline: "Software & Digital Experiences",
    phone: "+91 80727 19603",
    email: "crearemindwebsolutions@gmail.com",
    address: "Coimbatore, Tamil Nadu, India",
    workingHours: "Mon – Sat: 9:00 AM – 7:00 PM IST",
    instagramUrl: "https://instagram.com/crearemind",
    linkedinUrl: "https://linkedin.com/company/crearemind",
    youtubeUrl: "https://youtube.com/@crearemind",
    githubUrl: "https://github.com/crearemind",
    announcement: {
      enabled: true,
      text: "Accepting new digital projects & custom software clients for 2026",
      linkText: "Get in touch",
      linkUrl: "/contact",
    },
  },
  hero: {
    badge: "CREARE MIND · 2026 EDITION",
    heading: "We build digital systems that move markets.",
    subheading: "Custom software, shop billing POS, mobile applications, and viral social media production for modern brands.",
    ctaPrimaryText: "Explore Works",
    ctaPrimaryLink: "/templates",
    ctaSecondaryText: "Start a Project",
    ctaSecondaryLink: "/contact",
    videos: DATABASE_HERO_VIDEOS,
    cards: [
      {
        id: "card-vintage-tee",
        name: "Vintage Graphic Tee Showcase",
        title: "Vintage Graphic Tee",
        subtitle: "Streetwear Editorial Apparel",
        image: "https://res.cloudinary.com/nf3aubag/image/upload/v1793205843/zr4hg3h2hcrphavqc0i2.jpg",
      },
      {
        id: "card-silk-sarees",
        name: "Silk Sarees Heritage",
        title: "Silk Sarees Heritage",
        subtitle: "Traditional Luxury Weaves",
        image: "https://res.cloudinary.com/nf3aubag/image/upload/v1793205854/ou6cb09gesi6j4c73mvu.jpg",
      },
      {
        id: "card-green-saree",
        name: "Green Silk Saree",
        title: "Green Silk Saree",
        subtitle: "Artisan Handloom Collection",
        image: "https://res.cloudinary.com/nf3aubag/image/upload/v1793205858/if3twjqxjdnczmkuqjuv.jpg",
      },
      {
        id: "card-chanderi-saree",
        name: "Chanderi Silk Saree",
        title: "Chanderi Silk Saree",
        subtitle: "Heritage Royal Drape",
        image: "https://res.cloudinary.com/nf3aubag/image/upload/v1793205861/kspcjbmwaxgfeocyrtd1.jpg",
      },
      {
        id: "card-striped-shirt",
        name: "Modern Striped Shirt",
        title: "Modern Striped Shirt",
        subtitle: "Contemporary Menswear",
        image: "https://res.cloudinary.com/nf3aubag/image/upload/v1793205864/ext18jxebvtokuiebvcw.jpg",
      },
      {
        id: "card-luxury-watch",
        name: "Chronos Titanium Watch",
        title: "Chronos Titanium Watch",
        subtitle: "Luxury Swiss Horology",
        image: "https://res.cloudinary.com/nf3aubag/image/upload/v1793204760/l6udoyphlwtmot00ngyr.jpg",
      },
    ],
  },
  worksWheel: {
    label: "Creare '26",
    heading: "Selected works & systems",
    subtitle: "Turn the 3D wheel with your mouse wheel, drag the drum, or select any project on the right to browse our client archive.",
    items: [
      {
        id: "wheel-1",
        title: "Aether Motion Showcase",
        image: tplAgency,
        href: "/templates",
        category: "Custom Website",
      },
      {
        id: "wheel-2",
        title: "Hyperdrive Sneaker Lab",
        image: tplSneakers,
        href: "/templates",
        category: "Streetwear & Video",
      },
      {
        id: "wheel-3",
        title: "Amber & Ash Coffee",
        image: tplCoffee,
        href: "/templates",
        category: "Retail & Commerce",
      },
      {
        id: "wheel-4",
        title: "Solis High Jewelry",
        image: tplJewelry,
        href: "/templates",
        category: "Luxury Boutique",
      },
      {
        id: "wheel-5",
        title: "QuickCart POS System",
        image: tplPos,
        href: "/templates",
        category: "Shop Billing POS",
      },
      {
        id: "wheel-6",
        title: "Luminuxe Skincare",
        image: tplBeauty,
        href: "/templates",
        category: "Botanical Beauty",
      },
      {
        id: "wheel-7",
        title: "Terra & Stone Pottery",
        image: tplCeramics,
        href: "/templates",
        category: "Ceramic Studio",
      },
      {
        id: "wheel-8",
        title: "Verve Italian Optics",
        image: tplEyewear,
        href: "/templates",
        category: "Custom Eyeworks",
      },
      {
        id: "wheel-9",
        title: "Canvas Design Systems",
        image: tplDesignSystem,
        href: "/templates",
        category: "SaaS & Dashboards",
      },
    ],
  },
  templates: {
    heading: "Templates & Client Deliverables",
    subtitle: "Every system engineered with meticulous attention to detail, micro-interactions, and conversion-ready architecture.",
    items: [
      {
        id: "tpl-1",
        name: "Aether Creative Agency",
        img: tplAgency,
        cat: "Custom Websites",
        tagline: "Editorial Swiss-style design portfolio with high-impact kinetic typography.",
      },
      {
        id: "tpl-2",
        name: "Hyperdrive Sneaker Lab",
        img: tplSneakers,
        cat: "Social Media & Video",
        tagline: "High-octane streetwear brand showcase with cinematic video loops.",
      },
      {
        id: "tpl-3",
        name: "Amber & Ash Coffee",
        img: tplCoffee,
        cat: "Retail & Commerce",
        tagline: "Artisan roastery e-commerce platform with subscription box ordering.",
      },
      {
        id: "tpl-4",
        name: "Solis High Jewelry",
        img: tplJewelry,
        cat: "Retail & Commerce",
        tagline: "Luxury diamond boutique portal with bespoke concierge consultation.",
      },
      {
        id: "tpl-5",
        name: "QuickCart Retail POS",
        img: tplPos,
        cat: "Shop Billing POS",
        tagline: "Touchscreen iPad cashier checkout with thermal GST receipt printing.",
      },
      {
        id: "tpl-6",
        name: "Luminuxe Botanical Beauty",
        img: tplBeauty,
        cat: "Retail & Commerce",
        tagline: "Organic skincare shop with ingredient breakdowns and customer reviews.",
      },
      {
        id: "tpl-7",
        name: "Terra & Stone Studio",
        img: tplCeramics,
        cat: "Custom Websites",
        tagline: "Handcrafted ceramics catalog with workshop booking integration.",
      },
      {
        id: "tpl-8",
        name: "Verve Italian Optics",
        img: tplEyewear,
        cat: "Retail & Commerce",
        tagline: "Handmade eyewear boutique with virtual try-on and prescription order flow.",
      },
      {
        id: "tpl-9",
        name: "Canvas Design Systems",
        img: tplSaas,
        cat: "SaaS & Dashboards",
        tagline: "Multi-branch enterprise revenue reports, tax ledger & sales charts.",
      },
    ],
  },
  featureCards: {
    heading: "Everything your business needs to grow",
    items: [
      {
        id: "fc-1",
        t: "Website Development",
        d: "Mobile-friendly websites with WhatsApp chat, online payments & Google search setup.",
        img: tplAgency,
        link: "/services#web-dev",
      },
      {
        id: "fc-2",
        t: "Mobile App Engineering",
        d: "Custom mobile apps on Google Play & App Store with push notifications & live tracking.",
        img: tplMobile,
        link: "/services#mobile-apps",
      },
      {
        id: "fc-3",
        t: "Billing & POS Systems",
        d: "Super-fast barcode billing, thermal GST receipts & live inventory tracking for retail shops.",
        img: tplPos,
        link: "/services#shop-billing",
      },
      {
        id: "fc-4",
        t: "Social Media Team",
        d: "Daily branded graphics, viral reels, engaging captions & organic follower growth.",
        img: tplFashion,
        link: "/services#social-media",
      },
      {
        id: "fc-5",
        t: "Video Production",
        d: "High-retention Instagram Reels & promo video ads with animated captions & sound effects.",
        img: tplCreative,
        link: "/services#video-editing",
      },
    ],
  },
  featureTabs: {
    heading: "Grow your business",
    subtitle: "Everything from web & mobile development to shop billing and digital growth.",
    items: [
      {
        id: "ft-1",
        tab: "Services",
        page: "Web Development",
        serifTitle: "Offer services",
        subtitle: "Promote your experiences and offerings, collect attendee information, and get paid for your work.",
        bgImage: tplAgency,
        theme: "dark",
        mockupHeader: "ACHELOUS SPA",
        mockupTitle: "OUR RETREATS",
        mockupMainImage: tplCreative,
        mockupSideTop: tplArch,
        mockupSideBottom: tplCeramics,
      },
      {
        id: "ft-2",
        tab: "Online Store",
        page: "Web Development",
        serifTitle: "Sell products",
        subtitle: "Merchandise your products, manage inventory and orders, and offer multiple express payment methods.",
        bgImage: tplSneakers,
        theme: "dark",
        mockupHeader: "STUDIO STORE",
        mockupTitle: "COLLECTION 2026",
        mockupMainImage: tplCeramics,
        mockupSideTop: tplCreative,
        mockupSideBottom: tplArch,
      },
      {
        id: "ft-3",
        tab: "Invoicing",
        page: "Billing Systems for Shops",
        serifTitle: "Invoice clients",
        subtitle: "Legitimize your business and get paid with professional proposals, computerized billing, and live inventory.",
        bgImage: tplPos,
        theme: "cream",
        mockupHeader: "HEIKKI INTERIORS",
        mockupTitle: "Materials sourcing and curation",
        mockupMainImage: tplCeramics,
        mockupSideTop: tplPos,
        mockupSideBottom: tplDashboard,
      },
      {
        id: "ft-4",
        tab: "Mobile Apps",
        page: "Mobile Apps",
        serifTitle: "Launch native mobile apps",
        subtitle: "Custom iOS and Android apps with biometric login, instant push notifications, and seamless offline data sync.",
        bgImage: tplMobile,
        theme: "dark",
        mockupHeader: "LUMEN APP",
        mockupTitle: "NATIVE IOS & ANDROID",
        mockupMainImage: tplMobile,
        mockupSideTop: tplCreative,
        mockupSideBottom: tplArch,
      },
      {
        id: "ft-5",
        tab: "Social Media",
        page: "Social Media Management",
        serifTitle: "Scale your social media",
        subtitle: "Daily branded graphics, high-retention viral reels, engaging carousels, and rapid follower growth for your brand.",
        bgImage: tplFashion,
        theme: "dark",
        mockupHeader: "STUDIO CREATIVE",
        mockupTitle: "VIRAL FEED & REELS",
        mockupMainImage: tplFashion,
        mockupSideTop: tplCreative,
        mockupSideBottom: tplArch,
      },
      {
        id: "ft-6",
        tab: "Video Editing",
        page: "Video Editing & Reels",
        serifTitle: "Produce viral video ads",
        subtitle: "Scroll-stopping Instagram Reels, YouTube Shorts, and promo commercials with animated kinetic captions.",
        bgImage: tplCreative,
        theme: "dark",
        mockupHeader: "TIMELINE PRO",
        mockupTitle: "CINEMATIC 4K EDIT",
        mockupMainImage: tplCreative,
        mockupSideTop: tplEditorial,
        mockupSideBottom: tplArch,
      },
      {
        id: "ft-7",
        tab: "Portfolio",
        page: "UI/UX Design",
        serifTitle: "Showcase your work",
        subtitle: "Build a portfolio website to highlight projects, share your story, and help clients get in contact.",
        bgImage: tplArch,
        theme: "dark",
        mockupHeader: "NIA DESIGN",
        mockupTitle: "NIA DESIGN",
        mockupMainImage: tplArch,
        mockupSideTop: tplCreative,
        mockupSideBottom: tplCeramics,
      },
    ],
  },
  services: {
    items: [
      {
        id: "web-dev",
        category: "Software & Web",
        title: "Custom Websites & Web Applications",
        subtitle: "Modern, high-converting websites designed to turn visitors into paying customers",
        description: "We design and build clean, attractive websites and online stores that look stunning on any smartphone, tablet, or computer.",
        img: tplAgency,
        turnaround: "1 – 3 Weeks",
      },
      {
        id: "mobile-apps",
        category: "Mobile Apps",
        title: "iOS & Android Mobile Apps",
        subtitle: "Custom apps for your business published directly on Google Play Store & Apple App Store",
        description: "Give your customers a seamless mobile app on their phone. Design, development, and store launch from start to finish.",
        img: tplMobile,
        turnaround: "3 – 5 Weeks",
      },
      {
        id: "shop-billing",
        category: "Retail & Billing POS",
        title: "Shop Billing & Retail POS Systems",
        subtitle: "Lightning-fast computerized billing, barcode scanning & inventory management for your store",
        description: "Cut down long customer queues, print professional thermal GST bills in 2 seconds, and track daily sales.",
        img: tplPos,
        turnaround: "1 – 2 Weeks",
      },
      {
        id: "social-media",
        category: "Social Media Growth",
        title: "Dedicated Social Media Management",
        subtitle: "Hands-free Instagram, Facebook & LinkedIn management that brings real inquiries to your business",
        description: "Our creative team takes full care of your brand online—planning high-performing content calendars and posting daily.",
        img: tplFashion,
        turnaround: "Monthly Dedicated Service",
      },
      {
        id: "video-editing",
        category: "Video & Motion",
        title: "Viral Video Editing & Commercial Ads",
        subtitle: "Attention-grabbing Instagram Reels, YouTube Shorts & promo videos that hook viewers in 3 seconds",
        description: "Turn raw smartphone clips or product photos into viral, cinematic short-form videos with subtitles and music.",
        img: tplCreative,
        turnaround: "48-Hour Delivery / Video",
      },
      {
        id: "custom-software",
        category: "Custom Software & Cloud",
        title: "Custom Business Software & Automation",
        subtitle: "Tailor-made software to automate your daily operations, billing, and staff workflows",
        description: "Automate manual paperwork, manage customer inquiries, track staff tasks, and generate automated invoices.",
        img: tplSaas,
        turnaround: "3 – 6 Weeks",
      },
    ],
  },
  streamImages: {
    items: [
      { id: "stream-1", src: tplCoffee, alt: "Amber & Ash Coffee — Specialty Roastery & E-Commerce Store" },
      { id: "stream-2", src: tplMobile, alt: "Mira Native Mobile App — iOS & Android Fintech Wallet" },
      { id: "stream-3", src: tplSneakers, alt: "Hyperdrive Sneaker Lab — Interactive 3D E-Commerce Drop" },
      { id: "stream-4", src: tplPos, alt: "QuickCart POS — High-Speed Retail Barcode & Thermal Billing" },
      { id: "stream-5", src: tplSaas, alt: "CloudScale Enterprise SaaS — Analytics & Billing Engine" },
      { id: "stream-6", src: tplFashion, alt: "Aura Luxury Linen — Editorial Seasonal E-Commerce" },
      { id: "stream-7", src: tplDashboard, alt: "Performance Analytics Dashboard — Real-time telemetry" },
      { id: "stream-8", src: tplAgency, alt: "Aether Motion Creative Studio — WebGL Experience" },
      { id: "stream-9", src: tplBeauty, alt: "Luminuxe Botanical Skincare — Luxury Digital Boutique" },
      { id: "stream-10", src: tplJewelry, alt: "Solis High Jewelry — Custom Diamond Craftsmanship" },
    ],
  },
};

const STORAGE_KEY = "creare_site_content_v1";
const EVENT_NAME = "creare_site_content_updated";

/**
 * Load saved site content or return default values.
 */
export function getSavedSiteContent(): SiteContent {
  if (typeof window === "undefined") return DEFAULT_SITE_CONTENT;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const deleted = getDeletedMediaKeys();

    const isCleanUrl = (url?: string | null): boolean => {
      if (!url || typeof url !== "string") return false;
      if (url.includes("/__l5e/")) return false;
      if (
        url.includes("hero-v1") ||
        url.includes("hero-v2") ||
        url.includes("hero-v3") ||
        url.includes("hero-1") ||
        url.includes("hero-2") ||
        url.includes("hero-3") ||
        url.includes("hero-library")
      ) return false;
      for (const bad of LEGACY_AI_MEDIA_BLACKLIST) {
        if (url.includes(bad)) return false;
      }
      if (deleted.has(url)) return false;
      return true;
    };

    if (!raw) return DEFAULT_SITE_CONTENT;
    const parsed = JSON.parse(raw);

    const savedVideos = (parsed.hero?.videos || []).filter(isCleanUrl);
    const heroVideos = savedVideos.length > 0 ? savedVideos : DATABASE_HERO_VIDEOS;

    // Immediately sanitize localStorage if any blacklisted or legacy videos exist in cache
    if (parsed.hero?.videos && (
      savedVideos.length !== parsed.hero.videos.length ||
      parsed.hero.videos.some((v: string) => !isCleanUrl(v))
    )) {
      try {
        parsed.hero.videos = heroVideos;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      } catch (err) {
        console.warn("Could not synchronize sanitized hero videos to localStorage:", err);
      }
    }

    // Reconcile services: ensure all canonical services (including web-dev: "Custom Websites & Web Applications")
    // are always present in canonical order, while preserving any user customizations (photos, turnaround times, etc.)
    const rawSavedServices: any[] = Array.isArray(parsed.services?.items)
      ? parsed.services.items
      : [];

    const reconciledServices = DEFAULT_SITE_CONTENT.services.items.map((canonical) => {
      const match = rawSavedServices.find(
        (s: any) => s.id === canonical.id || (s.title && s.title.toLowerCase() === canonical.title.toLowerCase())
      );
      if (match) {
        return {
          ...canonical,
          ...match,
          id: match.id || canonical.id,
          category: match.category || canonical.category,
          title: match.title || canonical.title,
        };
      }
      return canonical;
    });

    // Also preserve any extra custom services created by user
    for (const extra of rawSavedServices) {
      if (!reconciledServices.some((s) => s.id === extra.id)) {
        reconciledServices.push(extra);
      }
    }

    const cleanServices = reconciledServices.filter(
      (item: any) => !deleted.has(item.img) && !deleted.has(item.id || "")
    );

    // If localStorage was missing web-dev or had fewer items than canonical, heal localStorage immediately
    if (
      !rawSavedServices.some((s: any) => s.id === "web-dev") ||
      rawSavedServices.length < DEFAULT_SITE_CONTENT.services.items.length
    ) {
      try {
        parsed.services = {
          ...(parsed.services || {}),
          items: cleanServices,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      } catch (err) {
        console.warn("Could not synchronize reconciled services to localStorage:", err);
      }
    }

    return {
      branding: { ...DEFAULT_SITE_CONTENT.branding, ...(parsed.branding || {}) },
      hero: {
        ...DEFAULT_SITE_CONTENT.hero,
        ...(parsed.hero || {}),
        videos: heroVideos,
        cards: parsed.hero?.cards?.length ? parsed.hero.cards : DEFAULT_SITE_CONTENT.hero.cards,
      },
      worksWheel: {
        ...DEFAULT_SITE_CONTENT.worksWheel,
        ...(parsed.worksWheel || {}),
        items: (parsed.worksWheel?.items?.length ? parsed.worksWheel.items : DEFAULT_SITE_CONTENT.worksWheel.items).filter(
          (item: any) => !deleted.has(item.image) && !deleted.has(item.id || "")
        ),
      },
      templates: {
        ...DEFAULT_SITE_CONTENT.templates,
        ...(parsed.templates || {}),
        items: (parsed.templates?.items?.length ? parsed.templates.items : DEFAULT_SITE_CONTENT.templates.items).filter(
          (item: any) => !deleted.has(item.img) && !deleted.has(item.id || "")
        ),
      },
      featureCards: {
        ...DEFAULT_SITE_CONTENT.featureCards,
        ...(parsed.featureCards || {}),
        items: (parsed.featureCards?.items?.length ? parsed.featureCards.items : DEFAULT_SITE_CONTENT.featureCards.items).filter(
          (item: any) => !deleted.has(item.img) && !deleted.has(item.id || "")
        ),
      },
      featureTabs: {
        ...DEFAULT_SITE_CONTENT.featureTabs,
        ...(parsed.featureTabs || {}),
        items: (parsed.featureTabs?.items?.length ? parsed.featureTabs.items : DEFAULT_SITE_CONTENT.featureTabs.items).filter(
          (item: any) => !deleted.has(item.bgImage) && !deleted.has(item.id || "")
        ),
      },
      services: {
        ...DEFAULT_SITE_CONTENT.services,
        ...(parsed.services || {}),
        items: cleanServices,
      },
      streamImages: {
        ...DEFAULT_SITE_CONTENT.streamImages,
        ...(parsed.streamImages || {}),
        items: (parsed.streamImages?.items?.length ? parsed.streamImages.items : DEFAULT_SITE_CONTENT.streamImages.items).filter(
          (item: any) => !deleted.has(item.src) && !deleted.has(item.id || "")
        ),
      },
    };
  } catch (err) {
    console.error("Failed to parse site content from localStorage:", err);
    return DEFAULT_SITE_CONTENT;
  }
}

/**
 * Save site content to storage and notify all listening components.
 */
/**
 * Save site content to storage and notify all listening components.
 * Immediately pushes to Supabase database so live domains like crearemind.in
 * and all visiting users receive the updated photos and content.
 */
export function saveSiteContent(content: SiteContent): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: content }));
    syncSiteContentToCloud(content).catch((err) => {
      console.warn("Could not sync site content to Supabase cloud:", err);
    });
  } catch (err) {
    console.error("Failed to save site content:", err);
  }
}

/**
 * Reset site content back to defaults and publish to cloud.
 */
export function resetSiteContent(): SiteContent {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: DEFAULT_SITE_CONTENT }));
    syncSiteContentToCloud(DEFAULT_SITE_CONTENT).catch(console.warn);
  }
  return DEFAULT_SITE_CONTENT;
}

/**
 * React hook to read and observe dynamic site content.
 * Automatically synchronizes with Supabase database for live cloud updates across all domains.
 */
export function useSiteContent() {
  const [content, setContent] = useState<SiteContent>(getSavedSiteContent);

  useEffect(() => {
    // Initial sync from local storage
    setContent(getSavedSiteContent());

    // Fetch and sync globally published site content from Supabase cloud
    fetchSiteContentFromCloud()
      .then((cloudContent) => {
        if (cloudContent && typeof cloudContent === "object" && Object.keys(cloudContent).length > 2) {
          setContent((prev) => {
            const merged: SiteContent = {
              ...DEFAULT_SITE_CONTENT,
              ...prev,
              ...cloudContent,
              branding: {
                ...DEFAULT_SITE_CONTENT.branding,
                ...(prev.branding || {}),
                ...(cloudContent.branding || {}),
              },
              hero: {
                ...DEFAULT_SITE_CONTENT.hero,
                ...(prev.hero || {}),
                ...(cloudContent.hero || {}),
                cards:
                  cloudContent.hero?.cards?.length
                    ? cloudContent.hero.cards
                    : prev.hero?.cards?.length
                    ? prev.hero.cards
                    : DEFAULT_SITE_CONTENT.hero.cards,
              },
              services: {
                ...DEFAULT_SITE_CONTENT.services,
                ...(prev.services || {}),
                ...(cloudContent.services || {}),
                items:
                  cloudContent.services?.items?.length
                    ? cloudContent.services.items
                    : prev.services?.items?.length
                    ? prev.services.items
                    : DEFAULT_SITE_CONTENT.services.items,
              },
              templates: {
                ...DEFAULT_SITE_CONTENT.templates,
                ...(prev.templates || {}),
                ...(cloudContent.templates || {}),
                items:
                  cloudContent.templates?.items?.length
                    ? cloudContent.templates.items
                    : prev.templates?.items?.length
                    ? prev.templates.items
                    : DEFAULT_SITE_CONTENT.templates.items,
              },
              featureCards: {
                ...DEFAULT_SITE_CONTENT.featureCards,
                ...(prev.featureCards || {}),
                ...(cloudContent.featureCards || {}),
                items:
                  cloudContent.featureCards?.items?.length
                    ? cloudContent.featureCards.items
                    : prev.featureCards?.items?.length
                    ? prev.featureCards.items
                    : DEFAULT_SITE_CONTENT.featureCards.items,
              },
              featureTabs: {
                ...DEFAULT_SITE_CONTENT.featureTabs,
                ...(prev.featureTabs || {}),
                ...(cloudContent.featureTabs || {}),
                items:
                  cloudContent.featureTabs?.items?.length
                    ? cloudContent.featureTabs.items
                    : prev.featureTabs?.items?.length
                    ? prev.featureTabs.items
                    : DEFAULT_SITE_CONTENT.featureTabs.items,
              },
              streamImages: {
                ...DEFAULT_SITE_CONTENT.streamImages,
                ...(prev.streamImages || {}),
                ...(cloudContent.streamImages || {}),
                items:
                  cloudContent.streamImages?.items?.length
                    ? cloudContent.streamImages.items
                    : prev.streamImages?.items?.length
                    ? prev.streamImages.items
                    : DEFAULT_SITE_CONTENT.streamImages.items,
              },
            };
            if (typeof window !== "undefined") {
              try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
              } catch {}
            }
            return merged;
          });
        } else {
          // If cloud has no full config yet, check if local has customizations and push them to cloud
          const local = getSavedSiteContent();
          if (local && typeof local === "object") {
            syncSiteContentToCloud(local).catch(console.warn);
          }
        }
      })
      .catch((err) => {
        console.warn("Could not fetch global cloud content on mount:", err);
      });

    // Automatically sync active media from Supabase database and purge deleted media
    fetchUserMedia()
      .then((dbMedia) => {
        const activeDbVideos = dbMedia
          .filter((m) => m.resource_type === "video" || isVideoMedia(m.url))
          .map((m) => m.url);

        const deleted = getDeletedMediaKeys();

        setContent((prev) => {
          const isClean = (u?: string | null) =>
            u &&
            !deleted.has(u) &&
            !u.includes("/__l5e/") &&
            !u.includes("hero-v1") &&
            !u.includes("hero-v2") &&
            !u.includes("hero-v3") &&
            !u.includes("hero-1") &&
            !u.includes("hero-2") &&
            !u.includes("hero-3") &&
            !u.includes("hero-library");

          const cleanVideos = (prev.hero?.videos || []).filter(isClean);
          const finalVideos =
            cleanVideos.length > 0
              ? cleanVideos
              : activeDbVideos.length > 0
              ? activeDbVideos
              : DATABASE_HERO_VIDEOS;

          const updated: SiteContent = {
            ...prev,
            hero: {
              ...prev.hero,
              videos: finalVideos,
            },
          };

          if (JSON.stringify(prev.hero.videos) !== JSON.stringify(finalVideos)) {
            saveSiteContent(updated);
          }
          return updated;
        });
      })
      .catch((err) => {
        console.warn("Could not sync media from database:", err);
      });

    const handler = (e: Event) => {
      if ("detail" in e && (e as CustomEvent<SiteContent>).detail) {
        setContent((e as CustomEvent<SiteContent>).detail);
      } else {
        setContent(getSavedSiteContent());
      }
    };

    window.addEventListener(EVENT_NAME, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(EVENT_NAME, handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  const updateContent = useCallback((updater: (prev: SiteContent) => SiteContent) => {
    setContent((prev) => {
      const next = updater(prev);
      saveSiteContent(next);
      return next;
    });
  }, []);

  const updateSection = useCallback(<K extends keyof SiteContent>(
    section: K,
    data: Partial<SiteContent[K]>
  ) => {
    updateContent((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        ...data,
      },
    }));
  }, [updateContent]);

  return {
    content,
    updateContent,
    updateSection,
    resetToDefaults: () => {
      const reset = resetSiteContent();
      setContent(reset);
    },
  };
}
