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
import tplWebDesign from "@/assets/templates/tpl-web-design.jpg";
import tplCyberTech from "@/assets/templates/tpl-cyber-tech.jpg";
import tplMobileApp from "@/assets/templates/tpl-mobile-app.jpg";
import tplAnalyticsChart from "@/assets/templates/tpl-analytics-chart.jpg";
import founderGowthaman from "@/assets/team/founder-gowthaman.png";
import cofounderDheepan from "@/assets/team/cofounder-dheepan-raj.jpg";

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

export interface FounderData {
  id?: string;
  name: string;
  role: string;
  badge: string;
  tagline: string;
  image: string;
  bio: string;
  quote?: string;
  quoteDesc?: string;
  focus: string[];
  linkedin?: string;
  instagram?: string;
  email: string;
}

export interface AboutValueData {
  id?: string;
  title: string;
  desc: string;
}

export interface AboutPrincipleData {
  id?: string;
  title: string;
  desc: string;
}

export interface AboutContentData {
  badge: string;
  heading: string;
  subtitle: string;
  founders: FounderData[];
  originBadge: string;
  originHeading: string;
  originParagraph1: string;
  originParagraph2: string;
  values: AboutValueData[];
  principlesBadge: string;
  principlesHeading: string;
  principlesSubtitle: string;
  principles: AboutPrincipleData[];
  ctaBadge: string;
  ctaHeading: string;
  ctaSubtitle: string;
  ctaPrimaryText: string;
  ctaPrimaryLink: string;
  ctaSecondaryText: string;
  ctaSecondaryLink: string;
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
  about: AboutContentData;
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
    phone: "+91 63820 68495",
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
        id: "card-web-platform",
        name: "Enterprise Web Platform",
        title: "Enterprise Web Platform",
        subtitle: "Full-Stack Next.js & React Architecture",
        image: tplWebDesign,
      },
      {
        id: "card-saas-cloud",
        name: "Cloud SaaS & Analytics Engine",
        title: "Cloud SaaS Engine",
        subtitle: "Real-time Telemetry & Microservices",
        image: tplSaas,
      },
      {
        id: "card-mobile-ecosystem",
        name: "Native iOS & Android Mobile Ecosystem",
        title: "Mobile App Ecosystem",
        subtitle: "Cross-Platform React Native & Offline Sync",
        image: tplMobileApp,
      },
      {
        id: "card-ui-system",
        name: "Modern UI Design System & Components",
        title: "Modern UI Design System",
        subtitle: "Tailwind CSS & Headless Components",
        image: tplDesignSystem,
      },
      {
        id: "card-pos-billing",
        name: "Retail Shop POS & Thermal Billing",
        title: "Shop Billing & POS Counter",
        subtitle: "High-Speed Barcode & GST Invoicing",
        image: tplPos,
      },
      {
        id: "card-cyber-api",
        name: "Cyber Security & Distributed API Gateway",
        title: "API Engine & Cloud Infra",
        subtitle: "Zero-Trust Cloud & Microservices",
        image: tplCyberTech,
      },
    ],
  },
  about: {
    badge: "Leadership & Vision",
    heading: "Meet our founder & leadership",
    subtitle: "Architects and strategists with hands-on experience scaling digital systems from zero to millions of transactions.",
    founders: [
      {
        id: "founder-gowthaman",
        name: "Gowthaman PR",
        role: "Founder & Chief Executive Officer (CEO)",
        badge: "FOUNDER & CEO",
        tagline: "Founder & Visionary • Creare Mind",
        image: founderGowthaman,
        quote: "Building the future of brands. One vision at a time.",
        quoteDesc: "Software is the ultimate competitive advantage for modern businesses. We don't build generic templates; we engineer robust digital engines that give our clients absolute market authority.",
        bio: "Gowthaman PR founded Creare Mind with a singular conviction: to engineer high-velocity digital products, enterprise platforms, and brand systems that give ambitious companies absolute market authority. Combining deep expertise in enterprise product strategy, cloud architecture, and client digital transformation, he directs the firm's long-term vision, design standards, and direct client partnerships worldwide. Under his leadership, Creare Mind has delivered 120+ production-grade software platforms across physical retail shops, modern healthcare networks, e-commerce brands, and high-growth startups.",
        focus: [
          "Product Strategy",
          "Enterprise Cloud Architecture",
          "Brand Systems & Narrative",
          "POS Billing Engineering",
          "System Scalability",
          "Client Growth Operations",
        ],
        linkedin: "https://www.linkedin.com/company/creare-mind/",
        instagram: "https://www.instagram.com/crearemind.in",
        email: "crearemindwebsolutions@gmail.com",
      },
      {
        id: "founder-dheepan",
        name: "Dheepan Raj",
        role: "Co-Founder & Strategic Director",
        badge: "CO-FOUNDER & STRATEGIC DIRECTOR",
        tagline: "Co-Founder & Strategy Leader • Creare Mind",
        image: cofounderDheepan,
        quote: "Turning bold ideas into real impact. The strategy behind the vision.",
        quoteDesc: "Execution turns vision into market dominance. At Creare Mind, we don't just craft ideas — we engineer strategic operations, resilient commercial infrastructure, and high-conversion client growth systems that deliver tangible business impact.",
        bio: "Dheepan Raj co-founded Creare Mind to turn ambitious concepts into scalable, revenue-generating commercial reality. Orchestrating strategic client operations, partnership ecosystems, and project delivery architectures, he ensures every engineering deployment creates real measurable value for our partners.",
        focus: [
          "Strategic Growth & Operations",
          "Business Architecture",
          "Client Partnership Ecosystems",
          "Product Delivery Cadence",
          "Commercial Scaling",
          "Operational Excellence",
        ],
        linkedin: "https://www.linkedin.com/company/creare-mind/",
        instagram: "https://www.instagram.com/crearemind.in",
        email: "crearemindwebsolutions@gmail.com",
      },
    ],
    originBadge: "Our Origin & Mission",
    originHeading: "Why we built Creare Mind",
    originParagraph1: "Most businesses looking to build digital tools face an agonizing dilemma: either pay astronomical agency retainers for slow delivery, or settle for fragile off-the-shelf templates that crumble as transaction volume grows.",
    originParagraph2: "We started Creare Mind to offer a fundamentally better path. We pair elite software architects with world-class product designers to deliver bespoke, production-grade solutions with high velocity, total transparency, and unwavering focus on your ROI.",
    values: [
      {
        id: "val-1",
        title: "Radical Craftsmanship",
        desc: "We write clean, strictly-typed code that is maintainable, modular, and built to stand the test of time — never bloated page-builder templates.",
      },
      {
        id: "val-2",
        title: "100% Client Code Ownership",
        desc: "You own all source code, design files, databases, and deployment pipelines. No locked-in vendor traps or proprietary black boxes.",
      },
      {
        id: "val-3",
        title: "High-Velocity Sprints",
        desc: "Structured weekly milestone demos, transparent communication via WhatsApp/Slack, and rapid shipping cadence without cutting corners.",
      },
      {
        id: "val-4",
        title: "End-to-End Partnership",
        desc: "From initial napkin wireframes and custom UI design to POS thermal hardware setup and viral social video production, we deliver the complete loop.",
      },
    ],
    principlesBadge: "Our Principles",
    principlesHeading: "How we work with our clients",
    principlesSubtitle: "Clear commitments that eliminate risk, delay, and miscommunication.",
    principles: [
      {
        id: "prin-1",
        title: "Direct Founder Access",
        desc: "You speak directly with founders and senior engineers who build your system. No account managers playing telephone.",
      },
      {
        id: "prin-2",
        title: "Strict Sprint Milestones",
        desc: "Every week features live working demos in a staging environment so you can test features as they are built.",
      },
      {
        id: "prin-3",
        title: "Hardware Verification",
        desc: "For POS and billing systems, we physically test receipt thermal printers, barcode scanners, and cash drawer triggers.",
      },
      {
        id: "prin-4",
        title: "Post-Launch Warranty",
        desc: "30 days of complimentary bug-fixing and cloud tuning post-deployment to ensure your rollout is 100% stable.",
      },
    ],
    ctaBadge: "Start Your Project",
    ctaHeading: "Ready to build something extraordinary?",
    ctaSubtitle: "Let's discuss your requirements, define your scope, and engineer software that drives real business revenue.",
    ctaPrimaryText: "Start a Conversation",
    ctaPrimaryLink: "/contact",
    ctaSecondaryText: "Explore All Services",
    ctaSecondaryLink: "/services",
  },
  worksWheel: {
    label: "Creare '26",
    heading: "Selected works & systems",
    subtitle: "Turn the 3D wheel with your mouse wheel, drag the drum, or select any project on the right to browse our client archive.",
    items: [
      {
        id: "wheel-1",
        title: "Nexus Web Architecture",
        image: tplWebDesign,
        href: "/services#web-dev",
        category: "Custom Web Platform",
      },
      {
        id: "wheel-2",
        title: "CyberTech API Gateway",
        image: tplCyberTech,
        href: "/services#web-dev",
        category: "Cloud Microservices",
      },
      {
        id: "wheel-3",
        title: "Nova Mobile Suite",
        image: tplMobileApp,
        href: "/services#mobile-apps",
        category: "iOS & Android Apps",
      },
      {
        id: "wheel-4",
        title: "CloudScale Enterprise SaaS",
        image: tplSaas,
        href: "/services#web-dev",
        category: "SaaS & Dashboards",
      },
      {
        id: "wheel-5",
        title: "QuickCart POS System",
        image: tplPos,
        href: "/services#shop-billing",
        category: "Shop Billing POS",
      },
      {
        id: "wheel-6",
        title: "Atlas Executive BI Dashboard",
        image: tplAnalyticsChart,
        href: "/services#web-dev",
        category: "Telemetry & Metrics",
      },
      {
        id: "wheel-7",
        title: "Neo Design Tokens & UI Kit",
        image: tplDesignSystem,
        href: "/services#ui-ux",
        category: "UI/UX Design System",
      },
      {
        id: "wheel-8",
        title: "Pulse FinTech & Wallet App",
        image: tplMobile,
        href: "/services#mobile-apps",
        category: "Mobile App Engineering",
      },
      {
        id: "wheel-9",
        title: "Aether Engineering Studio",
        image: tplAgency,
        href: "/services#web-dev",
        category: "Full-Stack Development",
      },
    ],
  },
  templates: {
    heading: "Templates & Client Deliverables",
    subtitle: "Every system engineered with meticulous attention to detail, micro-interactions, and conversion-ready architecture.",
    items: [
      {
        id: "tpl-1",
        name: "Nexus Web Architecture",
        img: tplWebDesign,
        cat: "Custom Websites",
        tagline: "Modern Next.js web application architecture with server-rendered UI and dynamic caching.",
      },
      {
        id: "tpl-2",
        name: "CyberTech API Gateway",
        img: tplCyberTech,
        cat: "Custom Websites",
        tagline: "Zero-trust microservices API platform with edge routing and developer portal.",
      },
      {
        id: "tpl-3",
        name: "Nova Mobile Suite",
        img: tplMobileApp,
        cat: "Mobile Apps",
        tagline: "Cross-platform iOS and Android mobile app with biometric auth and offline synchronization.",
      },
      {
        id: "tpl-4",
        name: "CloudScale Enterprise SaaS",
        img: tplSaas,
        cat: "SaaS & Dashboards",
        tagline: "Multi-tenant cloud platform with automated billing, analytics dashboards, and role-based access.",
      },
      {
        id: "tpl-5",
        name: "QuickCart Retail POS",
        img: tplPos,
        cat: "Shop Billing POS",
        tagline: "Touchscreen iPad cashier checkout with thermal GST receipt printing and barcode scanning.",
      },
      {
        id: "tpl-6",
        name: "Atlas Executive BI Dashboard",
        img: tplAnalyticsChart,
        cat: "SaaS & Dashboards",
        tagline: "Real-time enterprise metrics, revenue telemetry, and sales forecasting charts.",
      },
      {
        id: "tpl-7",
        name: "Neo Design Tokens & UI Kit",
        img: tplDesignSystem,
        cat: "Custom Websites",
        tagline: "Scalable design system with accessible components, Figma tokens, and dark mode.",
      },
      {
        id: "tpl-8",
        name: "Pulse FinTech & Wallet App",
        img: tplMobile,
        cat: "Mobile Apps",
        tagline: "High-velocity consumer finance mobile app with instant UPI payments and ledger.",
      },
      {
        id: "tpl-9",
        name: "Aether Engineering Studio",
        img: tplAgency,
        cat: "Custom Websites",
        tagline: "High-velocity software engineering studio showcase with case studies and interactive 3D.",
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
        img: tplWebDesign,
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
        t: "Cloud SaaS Platforms",
        d: "Full-stack cloud applications, automated billing ledgers, and secure database architecture.",
        img: tplSaas,
        link: "/services#web-dev",
      },
      {
        id: "fc-5",
        t: "UI/UX Design Systems",
        d: "High-conversion digital interfaces, interactive prototypes, and production-ready component libraries.",
        img: tplDesignSystem,
        link: "/services#ui-ux",
      },
    ],
  },
  featureTabs: {
    heading: "Grow your business",
    subtitle: "Everything from web & mobile development to shop billing and digital growth.",
    items: [
      {
        id: "ft-1",
        tab: "Web Platforms",
        page: "Web Development",
        serifTitle: "High-velocity web platforms",
        subtitle: "Custom Next.js & React web applications with edge caching, automated SEO, WhatsApp checkout, and payment gateways.",
        bgImage: tplWebDesign,
        theme: "dark",
        mockupHeader: "DEV PLATFORM",
        mockupTitle: "ENTERPRISE CLOUD SUITE",
        mockupMainImage: tplCyberTech,
        mockupSideTop: tplSaas,
        mockupSideBottom: tplAnalyticsChart,
      },
      {
        id: "ft-2",
        tab: "Cloud & SaaS",
        page: "Web Development",
        serifTitle: "Scalable cloud SaaS systems",
        subtitle: "Full-stack software products with real-time multi-tenant databases, customer billing dashboards, and zero downtime.",
        bgImage: tplSaas,
        theme: "dark",
        mockupHeader: "CLOUD CONSOLE",
        mockupTitle: "SERVERLESS INFRASTRUCTURE",
        mockupMainImage: tplDashboard,
        mockupSideTop: tplCyberTech,
        mockupSideBottom: tplWebDesign,
      },
      {
        id: "ft-3",
        tab: "Shop Billing & POS",
        page: "Billing Systems for Shops",
        serifTitle: "Super-fast barcode POS billing",
        subtitle: "Legitimize and streamline your retail business with thermal GST printing, instant barcode lookups, and inventory alerts.",
        bgImage: tplPos,
        theme: "cream",
        mockupHeader: "CREARE POS DESK",
        mockupTitle: "Thermal Barcode Cashier",
        mockupMainImage: tplPos,
        mockupSideTop: tplAnalyticsChart,
        mockupSideBottom: tplDashboard,
      },
      {
        id: "ft-4",
        tab: "Mobile Apps",
        page: "Mobile Apps",
        serifTitle: "Native iOS & Android mobile apps",
        subtitle: "Custom cross-platform applications with biometric authentication, instant push alerts, offline syncing, and Google Play launch.",
        bgImage: tplMobile,
        theme: "dark",
        mockupHeader: "MOBILE ENGINEERING",
        mockupTitle: "NATIVE CROSS-PLATFORM",
        mockupMainImage: tplMobileApp,
        mockupSideTop: tplWebDesign,
        mockupSideBottom: tplCyberTech,
      },
      {
        id: "ft-5",
        tab: "UI/UX Systems",
        page: "UI/UX Design",
        serifTitle: "Design systems & interactive UI",
        subtitle: "Pixel-perfect Figma design tokens, animated micro-interactions, dark mode aesthetics, and robust component architecture.",
        bgImage: tplDesignSystem,
        theme: "dark",
        mockupHeader: "NEO DESIGN SYSTEM",
        mockupTitle: "ACCESSIBLE UI TOKENS",
        mockupMainImage: tplDesignSystem,
        mockupSideTop: tplWebDesign,
        mockupSideBottom: tplCreative,
      },
      {
        id: "ft-6",
        tab: "APIs & Telemetry",
        page: "Web Development",
        serifTitle: "Real-time telemetry & API gateways",
        subtitle: "High-throughput microservices, sub-millisecond edge routes, live WebSocket connections, and real-time observability.",
        bgImage: tplAnalyticsChart,
        theme: "dark",
        mockupHeader: "API TELEMETRY",
        mockupTitle: "HIGH-VELOCITY BACKEND",
        mockupMainImage: tplAnalyticsChart,
        mockupSideTop: tplCyberTech,
        mockupSideBottom: tplSaas,
      },
      {
        id: "ft-7",
        tab: "DevOps & Cloud",
        page: "Web Development",
        serifTitle: "Automated CI/CD & cloud scaling",
        subtitle: "Automated deployment pipelines, Docker container orchestration, SSL/TLS hardening, and Vercel edge networks.",
        bgImage: tplCyberTech,
        theme: "dark",
        mockupHeader: "DEV PIPELINE",
        mockupTitle: "ZERO-DOWNTIME CI/CD",
        mockupMainImage: tplCyberTech,
        mockupSideTop: tplSaas,
        mockupSideBottom: tplDesignSystem,
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
      { id: "stream-1", src: tplWebDesign, alt: "Next.js & React Enterprise Web Platform" },
      { id: "stream-2", src: tplSaas, alt: "CloudScale Enterprise SaaS & Telemetry Dashboard" },
      { id: "stream-3", src: tplMobileApp, alt: "Mira iOS & Android Native Mobile Ecosystem" },
      { id: "stream-4", src: tplPos, alt: "QuickCart POS — High-Speed Retail Barcode & Thermal Billing" },
      { id: "stream-5", src: tplDesignSystem, alt: "Headless UI Design System & Component Architecture" },
      { id: "stream-6", src: tplCyberTech, alt: "Cyber Security & Distributed Cloud Architecture" },
      { id: "stream-7", src: tplDashboard, alt: "Performance Analytics Dashboard — Real-time Telemetry" },
      { id: "stream-8", src: tplAgency, alt: "Aether Motion Creative WebGL & 3D Interactive Web" },
      { id: "stream-9", src: tplAnalyticsChart, alt: "Real-Time Telemetry & Database Analytics Engine" },
      { id: "stream-10", src: tplCreative, alt: "Custom Software Engineering & Cloud Infrastructure" },
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

    const hasOutdatedApparelCards = (parsed.hero?.cards || []).some(
      (c: any) =>
        c.id?.includes("vintage") ||
        c.id?.includes("saree") ||
        c.id?.includes("shirt") ||
        c.name?.toLowerCase().includes("saree") ||
        c.name?.toLowerCase().includes("tee")
    );
    const validHeroCards =
      parsed.hero?.cards?.length && !hasOutdatedApparelCards
        ? parsed.hero.cards
        : DEFAULT_SITE_CONTENT.hero.cards;

    const hasOutdatedStreamImages = (parsed.streamImages?.items || []).some(
      (s: any) =>
        s.alt?.toLowerCase().includes("coffee") ||
        s.alt?.toLowerCase().includes("jewelry") ||
        s.alt?.toLowerCase().includes("linen") ||
        s.alt?.toLowerCase().includes("sneaker")
    );
    const validStreamItems =
      parsed.streamImages?.items?.length && !hasOutdatedStreamImages
        ? parsed.streamImages.items
        : DEFAULT_SITE_CONTENT.streamImages.items;

    const hasOutdatedWheel = (parsed.worksWheel?.items || []).some(
      (w: any) =>
        w.title?.toLowerCase().includes("sneaker") ||
        w.title?.toLowerCase().includes("coffee") ||
        w.title?.toLowerCase().includes("jewelry") ||
        w.title?.toLowerCase().includes("skincare") ||
        w.title?.toLowerCase().includes("pottery")
    );
    const validWorksWheel =
      parsed.worksWheel?.items?.length && !hasOutdatedWheel
        ? parsed.worksWheel.items.filter((item: any) => !deleted.has(item.image) && !deleted.has(item.id || ""))
        : DEFAULT_SITE_CONTENT.worksWheel.items;

    const hasOutdatedTemplates = (parsed.templates?.items || []).some(
      (t: any) =>
        t.name?.toLowerCase().includes("sneaker") ||
        t.name?.toLowerCase().includes("coffee") ||
        t.name?.toLowerCase().includes("jewelry") ||
        t.name?.toLowerCase().includes("beauty") ||
        t.name?.toLowerCase().includes("optics")
    );
    const validTemplates =
      parsed.templates?.items?.length && !hasOutdatedTemplates
        ? parsed.templates.items.filter((item: any) => !deleted.has(item.img) && !deleted.has(item.id || ""))
        : DEFAULT_SITE_CONTENT.templates.items;

    const hasOutdatedFeatureCards = (parsed.featureCards?.items || []).some(
      (fc: any) =>
        fc.t?.toLowerCase().includes("social media") ||
        fc.t?.toLowerCase().includes("video production")
    );
    const validFeatureCards =
      parsed.featureCards?.items?.length && !hasOutdatedFeatureCards
        ? parsed.featureCards.items.filter((item: any) => !deleted.has(item.img) && !deleted.has(item.id || ""))
        : DEFAULT_SITE_CONTENT.featureCards.items;

    const hasOutdatedFeatureTabs = (parsed.featureTabs?.items || []).some(
      (ft: any) =>
        ft.mockupHeader?.toLowerCase().includes("achelous") ||
        ft.mockupHeader?.toLowerCase().includes("heikki") ||
        ft.mockupHeader?.toLowerCase().includes("studio store")
    );
    const validFeatureTabs =
      parsed.featureTabs?.items?.length && !hasOutdatedFeatureTabs
        ? parsed.featureTabs.items.filter((item: any) => !deleted.has(item.bgImage) && !deleted.has(item.id || ""))
        : DEFAULT_SITE_CONTENT.featureTabs.items;

    return {
      branding: { ...DEFAULT_SITE_CONTENT.branding, ...(parsed.branding || {}) },
      hero: {
        ...DEFAULT_SITE_CONTENT.hero,
        ...(parsed.hero || {}),
        videos: heroVideos,
        cards: validHeroCards,
      },
      about: {
        ...DEFAULT_SITE_CONTENT.about,
        ...(parsed.about || {}),
        founders: parsed.about?.founders?.length ? parsed.about.founders : DEFAULT_SITE_CONTENT.about.founders,
        values: parsed.about?.values?.length ? parsed.about.values : DEFAULT_SITE_CONTENT.about.values,
        principles: parsed.about?.principles?.length ? parsed.about.principles : DEFAULT_SITE_CONTENT.about.principles,
      },
      worksWheel: {
        ...DEFAULT_SITE_CONTENT.worksWheel,
        ...(parsed.worksWheel || {}),
        items: validWorksWheel,
      },
      templates: {
        ...DEFAULT_SITE_CONTENT.templates,
        ...(parsed.templates || {}),
        items: validTemplates,
      },
      featureCards: {
        ...DEFAULT_SITE_CONTENT.featureCards,
        ...(parsed.featureCards || {}),
        items: validFeatureCards,
      },
      featureTabs: {
        ...DEFAULT_SITE_CONTENT.featureTabs,
        ...(parsed.featureTabs || {}),
        items: validFeatureTabs,
      },
      services: {
        ...DEFAULT_SITE_CONTENT.services,
        ...(parsed.services || {}),
        items: cleanServices,
      },
      streamImages: {
        ...DEFAULT_SITE_CONTENT.streamImages,
        ...(parsed.streamImages || {}),
        items: validStreamItems.filter(
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
              about: {
                ...DEFAULT_SITE_CONTENT.about,
                ...(prev.about || {}),
                ...(cloudContent.about || {}),
                founders:
                  cloudContent.about?.founders?.length
                    ? cloudContent.about.founders
                    : prev.about?.founders?.length
                    ? prev.about.founders
                    : DEFAULT_SITE_CONTENT.about.founders,
                values:
                  cloudContent.about?.values?.length
                    ? cloudContent.about.values
                    : prev.about?.values?.length
                    ? prev.about.values
                    : DEFAULT_SITE_CONTENT.about.values,
                principles:
                  cloudContent.about?.principles?.length
                    ? cloudContent.about.principles
                    : prev.about?.principles?.length
                    ? prev.about.principles
                    : DEFAULT_SITE_CONTENT.about.principles,
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
