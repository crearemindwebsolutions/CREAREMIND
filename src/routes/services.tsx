import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { GetStartedLink } from "@/components/site/GetStartedLink";
import {
  Globe,
  Smartphone,
  Store,
  Video,
  Share2,
  Cpu,
  Check,
  ArrowRight,
  Clock,
  Sparkles,
  ShieldCheck,
  Layers,
  ChevronDown,
  Code2,
  Database,
  Workflow,
} from "lucide-react";

import tplAgency from "@/assets/templates/tpl-agency.jpg";
import tplMobile from "@/assets/templates/tpl-mobile.jpg";
import tplPos from "@/assets/templates/tpl-pos.jpg";
import tplFashion from "@/assets/templates/tpl-fashion.jpg";
import tplCreative from "@/assets/templates/tpl-creative-dev.jpg";
import tplSaas from "@/assets/templates/tpl-saas.jpg";
import { AdaptiveMedia } from "@/components/ui/adaptive-media";
import WavyBackground from "@/components/ui/blue-meshy-background";
import { useSiteContent } from "@/lib/site-content";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Our Services — Software, Mobile Apps & Digital Agency | Creare Mind" },
      {
        name: "description",
        content:
          "Explore Creare Mind's full suite of services: custom web development, mobile apps, shop billing POS systems, video editing, and dedicated social media management.",
      },
      { property: "og:title", content: "Our Services — Creare Mind Digital Agency" },
      {
        property: "og:description",
        content:
          "Custom web development, iOS & Android mobile apps, shop billing systems, video editing, and social media growth for ambitious businesses.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ServicesPage,
});

interface ServiceItem {
  id: string;
  category: string;
  title: string;
  subtitle: string;
  description: string;
  img: string;
  turnaround: string;
  icon: typeof Globe;
  deliverables: string[];
  techStack: string[];
  idealFor: string;
}

const SERVICES: ServiceItem[] = [
  {
    id: "web-dev",
    category: "Software & Web",
    title: "Custom Websites & Web Applications",
    subtitle: "Modern, high-converting websites designed to turn visitors into paying customers",
    description:
      "We design and build clean, attractive websites and online stores that look stunning on any smartphone, tablet, or computer. Every website is built to load instantly, rank on Google, and make it effortless for your visitors to browse your services, chat on WhatsApp, and buy your products.",
    img: tplAgency,
    turnaround: "1 – 3 Weeks",
    icon: Globe,
    deliverables: [
      "100% Mobile & Tablet Friendly — looks sharp and responsive on every screen size",
      "Instant WhatsApp & Call Buttons so customers can reach you with one tap",
      "Accept Online Payments — collect payments via Google Pay, PhonePe, UPI & Credit Cards",
      "Easy Admin Dashboard — change text, photos, services & prices yourself with zero coding",
      "Google Search Ranking (SEO) — set up properly so local customers find you on Google",
      "Ultra-Fast 1-Second Page Loading so visitors never get frustrated and leave",
      "Custom Contact & Inquiry Forms that send instant notifications to your email & phone",
      "Free Domain Setup, SSL Security Lock (Green padlock) & Reliable Cloud Hosting",
    ],
    techStack: [
      "WhatsApp Chat",
      "Accept UPI & Cards",
      "Mobile Optimized",
      "Google Search SEO",
      "Easy Admin Dashboard",
      "1s Fast Loading",
      "Free SSL Security",
    ],
    idealFor:
      "Local businesses, clinics, retail shops, startups, e-commerce stores & service professionals.",
  },
  {
    id: "mobile-apps",
    category: "Mobile Apps",
    title: "iOS & Android Mobile Apps",
    subtitle:
      "Custom apps for your business published directly on Google Play Store & Apple App Store",
    description:
      "Give your customers a seamless mobile app on their phone. Whether you need a customer booking app, an e-commerce shopping app, an on-demand service app, or an internal app for your staff, we handle the complete design, development, and store launch from start to finish.",
    img: tplMobile,
    turnaround: "3 – 5 Weeks",
    icon: Smartphone,
    deliverables: [
      "Published on both Google Play Store (Android) and Apple App Store (iPhone)",
      "Direct Push Notifications — send offers, announcements, and reminders straight to users' phones",
      "Instant One-Tap Login with Phone OTP, Google, or Apple ID",
      "Secure In-App Checkout with UPI, Net Banking, Credit/Debit Cards, and Wallets",
      "Live Order & Service Tracking with real-time status updates",
      "Customer Account & Order History so buyers can reorder in seconds",
      "Works Offline with smart local caching for unstable internet connections",
      "Owner Management Dashboard to manage orders, products, and customer messages",
    ],
    techStack: [
      "Play Store & App Store",
      "Push Notifications",
      "Instant UPI/Card Payments",
      "Phone OTP Login",
      "Live Order Tracking",
      "Works Offline",
    ],
    idealFor:
      "E-commerce brands, delivery services, appointment booking, gym/fitness, and customer portals.",
  },
  {
    id: "shop-billing",
    category: "Retail & Billing POS",
    title: "Shop Billing & Retail POS Systems",
    subtitle:
      "Lightning-fast computerized billing, barcode scanning & inventory management for your store",
    description:
      "Engineered specifically for supermarkets, clothing boutiques, grocery marts, hardware shops, and retail counters. Cut down long customer queues, print professional thermal GST bills in 2 seconds, scan product barcodes instantly, and track daily sales and stock levels from your counter or smartphone.",
    img: tplPos,
    turnaround: "1 – 2 Weeks",
    icon: Store,
    deliverables: [
      "Lightning Barcode Scanning — scan products and generate invoices in under 3 seconds",
      "Thermal Receipt Printing with your store logo, address, phone number & GST breakdown",
      "Works 100% Offline — keep billing uninterrupted even when your internet is completely down",
      "Live Stock & Inventory Tracking with automatic low-stock and expiry warnings",
      "Daily Sales, Profit & GST Tax Reports sent directly to your phone or email",
      "Multi-Counter & Cash Drawer Support — manage multiple billing counters under one shop",
      "Customer Phone Number & Loyalty Points tracking to bring customers back",
      "Works with all standard barcode scanners, thermal printers, and electronic weighing scales",
    ],
    techStack: [
      "Instant Barcode Scanning",
      "Thermal GST Receipts",
      "100% Offline Mode",
      "Live Stock Alerts",
      "Daily Profit Reports",
      "Multi-Counter Ready",
    ],
    idealFor:
      "Supermarkets, clothing boutiques, grocery stores, pharmacies, hardware & retail shops.",
  },
  {
    id: "social-media",
    category: "Social Media Growth",
    title: "Dedicated Social Media Management",
    subtitle:
      "Hands-free Instagram, Facebook & LinkedIn management that brings real inquiries to your business",
    description:
      "Never worry about what to post on social media again. Our creative team takes full care of your brand online—planning high-performing content calendars, designing custom graphic posts, writing compelling captions, posting every single day, and engaging with potential customers in your comments and DMs.",
    img: tplFashion,
    turnaround: "Monthly Dedicated Service",
    icon: Share2,
    deliverables: [
      "Monthly Content Calendar planned ahead around your offers, products & festivals",
      "Custom Branded Visual Graphics, Carousel Slides & Story Creatives with your logo",
      "High-Converting Captions & Targeted Hashtag research to reach active local buyers",
      "Daily Scheduled Posting on Instagram, Facebook, and LinkedIn",
      "Customer Inquiry & DM Responses so you never miss an interested customer lead",
      "Complete Profile & Bio Optimization to make your page look trustworthy and premium",
      "Monthly Growth & Performance Reports showing follower reach, clicks, and engagement",
      "Dedicated Account Manager available on WhatsApp for quick coordination and approvals",
    ],
    techStack: [
      "Daily Scheduled Posts",
      "Branded Graphic Designs",
      "Targeted Hashtags",
      "Story & Carousel Creatives",
      "Profile Optimization",
      "Monthly Growth Reports",
    ],
    idealFor: "Local businesses, clinics, retail shops, restaurants, creators & corporate brands.",
  },
  {
    id: "video-editing",
    category: "Video & Motion",
    title: "Viral Video Editing & Commercial Ads",
    subtitle:
      "Attention-grabbing Instagram Reels, YouTube Shorts & promo videos that hook viewers in 3 seconds",
    description:
      "Turn raw smartphone clips or product photos into viral, cinematic short-form videos. We craft high-energy edits with animated word-by-word subtitles, trending music, crisp sound effects, and color grading that boost view counts and convert followers into paying buyers.",
    img: tplCreative,
    turnaround: "48-Hour Delivery / Video",
    icon: Video,
    deliverables: [
      "Viral Short-Form Editing tailored for Instagram Reels, YouTube Shorts & TikTok",
      "Dynamic Animated Captions & Subtitles that keep viewers hooked from the first second",
      "Crisp Sound Effects (SFX), Background Music & Clear Voice Balancing",
      "Cinematic Color Grading to make ordinary phone footage look like a TV commercial",
      "Motion Graphics, Logo Stingers & Animated Call-To-Action buttons (Follow, Visit Website)",
      "High-Converting Promo Video Ads optimized for WhatsApp broadcasts and Instagram ads",
      "Fast 48-Hour Delivery with ready-to-upload files in full 1080p / 4K resolution",
      "Unlimited revisions until you are 100% satisfied with the final video",
    ],
    techStack: [
      "Animated Captions",
      "Sound Effects (SFX)",
      "Instagram Reels & Shorts",
      "Product Promo Ads",
      "Color Correction",
      "48-Hour Fast Delivery",
    ],
    idealFor:
      "Shop owners, e-commerce sellers, founders, real estate agents, doctors & influencers.",
  },
  {
    id: "custom-software",
    category: "Custom Software & Cloud",
    title: "Custom Business Software & Automation",
    subtitle:
      "Tailor-made software to automate your daily operations, billing, and staff workflows",
    description:
      "When ready-made software doesn't fit how your business works, we build custom software crafted around your exact operations. Automate manual paperwork, manage customer inquiries, track staff tasks, generate automated invoices, and manage your entire company from a secure private dashboard.",
    img: tplSaas,
    turnaround: "3 – 6 Weeks",
    icon: Cpu,
    deliverables: [
      "Custom Private Dashboard designed specifically around your daily business operations",
      "Automated Invoice & Estimate Generation with instant WhatsApp/PDF delivery to clients",
      "Customer & Lead Management (CRM) — track customer history, quotes, and follow-ups",
      "Staff & Employee Task Tracking with separate login permissions and activity logs",
      "Automated WhatsApp & Email Notifications sent automatically on important business events",
      "Multi-Branch & Multi-Location Support — view sales and performance across all branches",
      "Secure Automated Daily Cloud Backups so your business records are always safe and recoverable",
      "100% Ownership — no monthly per-user software license fees; you own your system permanently",
    ],
    techStack: [
      "Custom Admin Dashboard",
      "WhatsApp Automation",
      "Multi-Staff Logins",
      "Automated Invoicing",
      "Daily Cloud Backups",
      "100% Software Ownership",
    ],
    idealFor:
      "Distributors, service agencies, logistics, multi-branch shops, schools & growing companies.",
  },
];

const CATEGORIES = [
  "All Services",
  "Software & Web",
  "Mobile Apps",
  "Retail & Billing POS",
  "Social Media Growth",
  "Video & Motion",
  "Custom Software & Cloud",
];

export function ServicesPage() {
  const { content } = useSiteContent();
  const [activeCategory, setActiveCategory] = useState("All Services");

  const serviceItems = SERVICES.map((s) => {
    const saved = content.services?.items?.find((item) => item.id === s.id);
    return {
      ...s,
      category: saved?.category || s.category,
      img: saved?.img || s.img,
      title: saved?.title || s.title,
      turnaround: saved?.turnaround || s.turnaround,
      subtitle: saved?.subtitle || s.subtitle,
    };
  });

  const filteredServices =
    activeCategory === "All Services"
      ? serviceItems
      : serviceItems.filter((s) => s.category === activeCategory);

  return (
    <div className="bg-paper text-ink pt-16 lg:pt-20">
      {/* ─── Interactive Service Filter Bar ─── */}
      <section className="sticky top-16 z-20 border-b border-ink/10 bg-paper/95 px-5 py-3.5 backdrop-blur-sm md:top-20 md:px-10 will-change-transform">
        <div className="mx-auto flex max-w-[1360px] items-center justify-between">
          <div className="no-scrollbar flex w-full items-center gap-2 overflow-x-auto">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${isActive
                      ? "bg-ink text-paper shadow-md"
                      : "bg-paper-2 text-ink-muted hover:bg-taupe-2 hover:text-ink"
                    }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Detailed Service Showcase Grid ─── */}
      <section className="bg-paper px-5 pt-10 sm:pt-14 pb-24 text-ink md:px-10 md:pb-32">
        <div className="mx-auto max-w-[1360px]">
          <div className="space-y-24 md:space-y-36">
            {filteredServices.map((s, idx) => {
              const Icon = s.icon;
              const isEven = idx % 2 === 1;

              return (
                <article
                  key={s.id}
                  id={s.id}
                  data-reveal="stagger"
                  style={{ contentVisibility: "auto", containIntrinsicSize: "auto 550px" }}
                  className={`grid items-center gap-10 lg:grid-cols-12 lg:gap-12 xl:gap-16 ${isEven ? "lg:[&>*:first-child]:order-2" : ""
                    }`}
                >
                  {/* Visual Side */}
                  <div className="relative overflow-hidden rounded-2xl bg-paper-2 shadow-lg border border-ink/10 lg:col-span-6">
                    <div className="group relative aspect-[16/9] w-full overflow-hidden bg-neutral-900/[0.03] flex items-center justify-center">
                      <AdaptiveMedia
                        src={s.img}
                        alt={s.title}
                        loading="lazy"
                        className="h-full w-full object-contain transition-transform duration-700 ease-expo group-hover:scale-[1.02]"
                      />
                    </div>
                  </div>

                  {/* Content Side */}
                  <div className="lg:col-span-6">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="grid h-10 w-10 place-items-center rounded-xl bg-ink text-paper shadow-sm">
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className="label-xs font-semibold uppercase tracking-wider text-ink-muted">
                          {s.category}
                        </span>
                      </div>
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 bg-paper-2 px-3.5 py-1.5 text-xs font-medium text-ink shadow-xs">
                        <Clock className="h-3.5 w-3.5 text-ink-muted" /> {s.turnaround}
                      </span>
                    </div>

                    <h2 className="mt-4 text-xl sm:text-2xl md:text-3xl lg:text-[25px] xl:text-[28px] 2xl:text-[32px] font-medium tracking-tight text-ink leading-snug">
                      {s.title}
                    </h2>

                    {/* Features Checklist */}
                    <div className="mt-6 sm:mt-8 border-t border-ink/15 pt-6">
                      <p className="label-xs mb-4 font-semibold uppercase tracking-wider text-ink/90">
                        {s.id === "web-dev"
                          ? "Key Features Included in Your Website:"
                          : s.id === "mobile-apps"
                            ? "Key Features Included in Your App:"
                            : s.id === "shop-billing"
                              ? "Key Features Included in Your Billing System:"
                              : s.id === "social-media"
                                ? "Everything Handled for Your Social Media:"
                                : s.id === "video-editing"
                                  ? "What You Get with Every Video:"
                                  : "Key Capabilities Included:"}
                      </p>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {s.deliverables.map((d) => (
                          <div key={d} className="flex items-start gap-2 text-sm">
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                            <span className="text-ink/90">{d}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions & Ideal For */}
                    <div className="mt-8 flex flex-wrap items-center gap-4 pt-4">
                      <GetStartedLink className="btn-ink !px-7 !py-3.5 font-semibold shadow-sm inline-flex items-center gap-2">
                        Start {s.title.split(" ")[0]} Project <ArrowRight className="h-4 w-4" />
                      </GetStartedLink>
                      <span className="text-xs text-ink-muted">
                        Delivery:{" "}
                        <strong className="text-ink">Custom Development & Direct Delivery</strong>
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Comparison Matrix: Creare Mind vs Alternatives ─── */}
      <section className="border-t border-ink/10 bg-paper px-5 py-24 text-ink md:px-10 md:py-32">
        <div className="mx-auto max-w-[1100px]">
          <div data-reveal className="text-center">
            <span className="label-xs text-ink-muted">The Creare Mind Difference</span>
            <h2 className="mt-3 text-4xl font-medium tracking-tight md:text-5xl">
              Why ambitious teams choose Creare Mind
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-ink-muted">
              Compare our dedicated in-house engineering and creative studio against traditional
              slow agencies or unpredictable freelance marketplaces.
            </p>
          </div>

          <div data-reveal className="mt-16 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-ink/15 text-xs uppercase tracking-wider text-ink-muted">
                  <th className="pb-4 font-medium">Evaluation Criterion</th>
                  <th className="pb-4 font-semibold text-ink">Creare Mind</th>
                  <th className="pb-4 font-normal">Freelance Platforms</th>
                  <th className="pb-4 font-normal">Traditional Agencies</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10">
                {[
                  {
                    k: "Turnaround Speed",
                    us: "2 – 4 Weeks per MVP",
                    them1: "Unpredictable delays",
                    them2: "3 – 6 Months minimum",
                  },
                  {
                    k: "Engineering & Creative Synergy",
                    us: "100% In-House Developers + Designers + Editors",
                    them1: "Disconnected individuals",
                    them2: "Siloed departments",
                  },
                  {
                    k: "Intellectual Property & Code Ownership",
                    us: "Complete Git repo & IP handover",
                    them1: "Messy licensing contracts",
                    them2: "Often proprietary lock-in",
                  },
                  {
                    k: "Hardware & POS Integration",
                    us: "Native ESC/POS, thermal printers & barcode engines",
                    them1: "Rarely supported",
                    them2: "Requires expensive third-party plugins",
                  },
                  {
                    k: "Post-Launch SLA & 24/7 Support",
                    us: "Direct engineer access & ongoing monitoring",
                    them1: "Ghosting risk after payment",
                    them2: "Hefty retainer minimums",
                  },
                ].map((row) => (
                  <tr key={row.k} className="hover:bg-ink/[0.02]">
                    <td className="py-4 font-medium">{row.k}</td>
                    <td className="py-4 font-semibold text-ink">
                      <span className="inline-flex items-center gap-1.5 text-ink">
                        <Check className="h-4 w-4 stroke-[2.5]" /> {row.us}
                      </span>
                    </td>
                    <td className="py-4 text-ink-muted">{row.them1}</td>
                    <td className="py-4 text-ink-muted">{row.them2}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ─── Closing Call To Action ─── */}
      <section className="relative overflow-hidden bg-[#050b07] text-white text-center">
        {/* Luxury Green Wavy GLSL Mesh Background */}
        <div className="pointer-events-none absolute inset-0 z-0 opacity-70">
          <WavyBackground theme="green" className="h-full w-full" />
        </div>
        <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-t from-[#050b07] via-[#050b07]/40 to-transparent" />
        <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.18)_0%,transparent_75%)]" />

        <div
          data-reveal
          className="relative z-10 flex min-h-[75vh] md:min-h-[85vh] flex-col items-center justify-center px-5 py-24 text-center text-white"
        >
          <div className="relative z-10 mx-auto max-w-3xl">
            <span className="label-xs text-white/60">Ready To Get Started?</span>
            <h2 className="mt-4 text-4xl font-medium leading-[1.08] tracking-tight md:text-6xl">
              Let's build your software, apps & brand together
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-white/70 md:text-lg">
              Schedule a free technical discovery consultation or explore our transparent project
              retainers. We respond within 24 hours.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <GetStartedLink className="btn-solid !px-9 !py-[1.15rem] !text-[14px]">
                Start a Project
              </GetStartedLink>
              <Link
                to="/templates"
                className="inline-flex items-center justify-center gap-2 border border-white/40 bg-white/10 px-8 py-4 text-sm font-semibold uppercase tracking-wider text-white backdrop-blur-sm transition-all hover:border-white hover:bg-white hover:text-black active:scale-95"
              >
                View Deliverables
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
