import { productsMenu, solutions, footerCols } from "./data";
import h1 from "@/assets/hero-1.jpg";
import h2 from "@/assets/hero-2.jpg";
import h3 from "@/assets/hero-3.jpg";
import inv from "@/assets/invoicing.jpg";
import pf from "@/assets/portfolio.jpg";
import tpl1 from "@/assets/tpl-1.jpg";
import tpl2 from "@/assets/tpl-2.jpg";
import card1 from "@/assets/card-1.jpg";

export const IMAGES = [h1, inv, pf, tpl1, h2, tpl2, card1, h3];

export const slugify = (s: string) =>
  s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export type PageKind = "product" | "solution" | "page";
export type PageEntry = { name: string; slug: string; kind: PageKind; group: string; img: string };

/** Hand-written taglines; everything else falls back to generated copy. */
const TAGLINES: Record<string, string> = {
  "Web Development": "Fast, attractive websites and online stores designed to turn visitors into paying customers.",
  "Mobile Apps": "Custom iPhone & Android apps published on app stores so your customers can buy and book with one tap.",
  "Billing Systems for Shops": "Lightning-fast computerized billing, barcode scanning, and inventory tracking for your retail store.",
  "POS Software": "Fast counter checkout, thermal GST receipts, and offline billing that never stops even without internet.",
  "Social Media Management": "Daily branded posters, viral Instagram Reels, and audience growth handled completely by our team.",
  "Video Editing & Reels": "Attention-grabbing promo reels and commercial video ads that hook buyers in the first 3 seconds.",
  "Custom Software": "Tailor-made private software that automates your daily paperwork, invoicing, and staff tasks.",
  "E-Commerce Solutions": "Clean, high-converting online stores with instant UPI, Google Pay & Card checkout for your products.",
  "UI/UX Design": "Preview interactive clickable screens of your website or app before writing a single line of code.",
  "Invoicing & Payments": "Generate professional GST invoices instantly with WhatsApp delivery and automatic payment tracking.",
  "Inventory Management": "Track live stock quantities across all your shops and warehouses with low-stock alerts.",
  "Custom CRM & ERP": "Automate daily customer follow-ups, staff tasks, and orders without messy Excel sheets.",
  "API & Integrations": "Seamlessly connect WhatsApp, SMS gateways, barcode scanners, and payment links into your business.",
  "Content Creation": "Professional photography, branded graphic designs, and compelling captions for your products.",
  "Brand Identity & Ads": "Distinctive logos, color palettes, and targeted ad creatives that make your brand stand out.",
  "Client Portal": "A dedicated private dashboard for your clients to view invoices, orders, and project progress.",
  "Project Tracker": "Live milestone tracking and progress updates so you always know when deliverables arrive.",
  "Tech Consultation": "Speak directly with our senior experts to plan the right software and tools for your business.",
  "Maintenance & SLA": "Worry-free daily backups, uptime monitoring, and priority WhatsApp assistance for your business.",
  "Consultation & Scope": "Free 30-minute strategy session to map out the exact software, timeline, and cost for your project.",
  "Development Process": "Transparent milestones, live demo previews, and on-time launches with zero surprise delays.",
  "Dedicated Teams": "Direct access to our in-house designers, developers, and editors focused on your growth.",
  "Case Studies": "See how local businesses and brands scaled their sales with Creare Mind software and marketing.",
  "Hire our Team": "Work directly with our experienced in-house specialists on fixed-price or monthly retainer terms.",
  "Customer Examples": "Explore real websites, mobile apps, and billing systems we built for actual business owners.",
  "Client Case Studies": "Detailed business case studies showing measurable results and increased revenue.",
  "Free Project Estimation": "Get an accurate, transparent cost estimate and timeline for your website, app, or software.",
  "ROI Calculator": "Calculate how much time and money our automation and marketing will save your business.",
  "Engineering Blog": "Practical business insights, retail tech tips, and digital growth strategies from our team.",
  "Tech Stack Guide": "An easy-to-understand breakdown of the modern, reliable tools we use to run your systems.",
  Webinars: "Free online sessions showing business owners how to use digital tools, billing systems, and social media to scale.",
  Forum: "Connect with fellow entrepreneurs, share business growth tips, and ask questions directly to our team.",
  Blog: "Helpful business articles, case studies, and practical guides on growing your shop or brand.",
  "Hire an Expert": "Hire dedicated in-house designers, software developers, or video editors for your company.",
  "SEO & Search Growth": "Rank your business at the top of Google so local customers find and call you first.",
  Websites: "Modern mobile-friendly websites built to attract local buyers, load in 1 second, and boost sales.",
  Domains: "Fast domain name registration and secure setup for your business website.",
  Services: "Custom websites, mobile apps, shop billing, video ads, and social media growth for your business.",
  About: "A dedicated in-house team of developers, designers, and video editors helping businesses scale.",
  "Contact Us": "Book a free 30-minute discovery call or chat with our team on WhatsApp within 24 hours.",
};

function build(): PageEntry[] {
  const map = new Map<string, PageEntry>();
  const add = (name: string, kind: PageKind, group: string) => {
    const slug = slugify(name);
    if (map.has(slug) || slug === "pricing" || slug === "website-templates" || slug === "services" || slug === "our-services" || slug === "careers") return;
    map.set(slug, { name, slug, kind, group, img: IMAGES[map.size % IMAGES.length]! });
  };
  Object.entries(productsMenu).forEach(([g, list]) => list.forEach((n) => add(n, "product", g)));
  solutions.forEach((n) => add(n, "solution", "Solutions"));
  footerCols.flat().forEach((g) => {
    const kind: PageKind = g.h === "Products" ? "product" : g.h === "Solutions" ? "solution" : "page";
    g.links.forEach((n) => add(n, kind, g.h));
  });
  ["Forum", "Webinars", "Blog", "Hire an Expert"].forEach((n) => add(n, "page", "Resources"));
  return [...map.values()];
}

export const PAGES = build();
export const getPage = (slug: string) => PAGES.find((p) => p.slug === slug);
export const tagline = (p: PageEntry) =>
  TAGLINES[p.name] ??
  (p.kind === "solution"
    ? `Proven digital software, shop billing, and marketing systems built for ${p.name.toLowerCase()}.`
    : p.kind === "product"
      ? `Easy-to-use ${p.name.toLowerCase()} designed to save you time and grow your business sales.`
      : `Everything you need to know about partnering with Creare Mind for ${p.name.toLowerCase()}.`);

/** Route target for any menu/footer label. */
export function linkFor(name: string): { to: string; params?: { slug: string } } {
  const s = slugify(name);
  if (s === "about" || s === "about-us") return { to: "/about" };
  return { to: "/contact" };
}
