import { createFileRoute, notFound, Link, redirect } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { getPage, tagline, IMAGES, PAGES, type PageEntry } from "@/components/site/registry";
import { PageHero, Split, FeatureGrid, ClosingCta } from "@/components/site/PageBlocks";
import { NavLink } from "@/components/site/NavLink";
import { TEMPLATES } from "@/components/site/templates-data";

export const Route = createFileRoute("/$slug")({
  loader: () => {
    throw redirect({ to: "/contact" });
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Not found — Creare Mind" }, { name: "robots", content: "noindex" }] };
    const t = `${loaderData.page.name} — Creare Mind`;
    const d = tagline(loaderData.page);
    return {
      meta: [
        { title: t }, { name: "description", content: d },
        { property: "og:title", content: t }, { property: "og:description", content: d },
        { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: SlugPage,
});

const img = (p: PageEntry, k: number) => IMAGES[(IMAGES.indexOf(p.img) + k) % IMAGES.length]!;

function Related({ page }: { page: PageEntry }) {
  const rel = PAGES.filter((p) => p.kind === page.kind && p.slug !== page.slug).slice(0, 8);
  return (
    <section className="bg-background px-5 py-24 md:px-10">
      <div className="mx-auto max-w-[1360px]">
        <p className="label-xs mb-8 text-muted-foreground">Explore more</p>
        <div className="grid border-t sm:grid-cols-2 lg:grid-cols-4">
          {rel.map((r) => (
            <NavLink key={r.slug} name={r.name} className="group flex items-center justify-between border-b py-6 pr-6 text-lg transition-colors hover:text-muted-foreground">
              {r.name} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </NavLink>
          ))}
        </div>
      </div>
    </section>
  );
}

interface FeatureItem {
  t: string;
  d: string;
}

function getProductFeatures(name: string): FeatureItem[] {
  const lower = name.toLowerCase();

  // E-Commerce Solutions
  if (lower.includes("e-commerce") || lower.includes("ecommerce") || lower.includes("online store")) {
    return [
      {
        t: "Instant UPI & Card Checkout",
        d: "Accept seamless payments via Google Pay, PhonePe, Paytm, credit/debit cards, and direct bank transfer.",
      },
      {
        t: "Zero Commission on Sales",
        d: "Keep 100% of your earnings in your bank account—no hefty middleman cuts or marketplace commission fees.",
      },
      {
        t: "WhatsApp Order Confirmations",
        d: "Automatically send order receipts, digital invoices, and dispatch tracking links straight to customer WhatsApp.",
      },
      {
        t: "Easy Product & Price Control",
        d: "Add new products, change prices, and launch discount coupon codes yourself in seconds with zero coding.",
      },
      {
        t: "Fast 1-Second Mobile Shopping",
        d: "Designed specifically for phone shoppers with instant search and simple checkout so buyers never abandon carts.",
      },
      {
        t: "Live Inventory & Stock Alerts",
        d: "Track stock levels in real time and get instant notifications before popular items run out.",
      },
    ];
  }

  // Web Development & Websites
  if (lower.includes("web") || lower.includes("website")) {
    return [
      {
        t: "Instant WhatsApp & Call Button",
        d: "Let visitors call or chat with you on WhatsApp with one click to turn visits into immediate inquiries.",
      },
      {
        t: "Accept Online Payments Easily",
        d: "Collect customer advance payments, booking fees, or full bills securely via Google Pay, PhonePe, and cards.",
      },
      {
        t: "Easy Admin Control, Zero Coding",
        d: "Easily update your own text, photos, services, and pricing anytime without needing to hire a developer.",
      },
      {
        t: "Ultra-Fast 1-Second Loading",
        d: "Optimized to open instantly on any mobile phone or network so impatient buyers never leave.",
      },
      {
        t: "High Google Ranking (Local SEO)",
        d: "Engineered with local search optimization so customers searching in your city find and call you first.",
      },
      {
        t: "Complete Domain & SSL Security",
        d: "Includes free domain connection, official SSL green padlock security, and 24/7 reliable uptime.",
      },
    ];
  }

  // Mobile Apps
  if (lower.includes("mobile") || lower.includes("app")) {
    return [
      {
        t: "Published on Play Store & App Store",
        d: "Your own branded business app available for both Android and iPhone users to download worldwide.",
      },
      {
        t: "Direct Lockscreen Push Notifications",
        d: "Send flash discounts, festival offers, and urgent announcements directly to your customers' phone screens.",
      },
      {
        t: "Instant 1-Tap OTP Login",
        d: "Customers log in quickly with their phone number without having to remember passwords.",
      },
      {
        t: "Seamless In-App Payments",
        d: "Collect instant payments through UPI, credit/debit cards, and mobile wallets with zero hassle.",
      },
      {
        t: "Live Order & Delivery Tracking",
        d: "Keep your customers updated with real-time status notifications from order placement to doorstep delivery.",
      },
      {
        t: "Works Smoothly on Weak Internet",
        d: "Built with smart local caching so customers can view your catalog even with slow or spotty data.",
      },
    ];
  }

  // Shop Billing & POS Systems
  if (lower.includes("billing") || lower.includes("pos") || lower.includes("retail pos")) {
    return [
      {
        t: "2-Second Thermal GST Billing",
        d: "Scan product barcodes and print professional receipts with GST breakdown in less than 2 seconds.",
      },
      {
        t: "Works 100% Offline Without Internet",
        d: "Keep billing customers without interruption even if your shop's internet goes completely down.",
      },
      {
        t: "Daily Sales & Profit on Your Phone",
        d: "Check daily total sales, cash in counter, and profit margins anytime from your personal smartphone.",
      },
      {
        t: "Automated Low-Stock & Expiry Alerts",
        d: "Get notified before items go out of stock or expire so you minimize losses and restock on time.",
      },
      {
        t: "Paperless WhatsApp Receipts",
        d: "Send bills and invoices directly to customer WhatsApp numbers to save thermal paper costs.",
      },
      {
        t: "Multi-Counter & Staff Shift Control",
        d: "Manage multiple billing counters, cash drawers, and staff shifts under one single store dashboard.",
      },
    ];
  }

  // Social Media Management
  if (lower.includes("social") || lower.includes("social growth")) {
    return [
      {
        t: "Daily Done-For-You Posting",
        d: "We plan, design, write compelling captions, and publish high-quality content on Instagram and Facebook every day.",
      },
      {
        t: "Custom Branded Graphic Posters",
        d: "Eye-catching graphic banners, carousel slides, and promotional stories designed with your store logo and colors.",
      },
      {
        t: "Targeted Local Customer Reach",
        d: "Attract real potential buyers in your area using researched local hashtags, trends, and geotagging.",
      },
      {
        t: "Comment & Direct Message Tracking",
        d: "Ensure customer inquiries and purchase questions on your posts get answered promptly.",
      },
      {
        t: "Festival & Seasonal Offers",
        d: "Custom promo creatives prepared and scheduled ahead of time for every major festival and sale.",
      },
      {
        t: "Clear Monthly Performance Reports",
        d: "Monthly reviews showing profile visits, new followers, reach, and how many customer inquiries were generated.",
      },
    ];
  }

  // Video Editing & Reels
  if (lower.includes("video") || lower.includes("reel") || lower.includes("motion")) {
    return [
      {
        t: "Viral 3-Second Hooks",
        d: "Grab viewer attention within the first 3 seconds to stop endless scrolling and keep them watching.",
      },
      {
        t: "Animated Subtitles & Trending Music",
        d: "Dynamic on-screen captions, engaging sound effects, and licensed trending audio for high watch time.",
      },
      {
        t: "Product Showcases & Commercial Promos",
        d: "Present your products, services, or customer reviews in crisp, attractive high-definition format.",
      },
      {
        t: "Ready for Instagram Reels & YouTube Shorts",
        d: "Delivered in vertical 9:16 format optimized for the Instagram and YouTube algorithms.",
      },
      {
        t: "Color Correction & Visual Polish",
        d: "Vibrant, high-contrast grading that gives your videos a professional studio look.",
      },
      {
        t: "Fast Turnaround Delivery",
        d: "Quick delivery schedules so you can stay consistent and capitalize on fast-moving online trends.",
      },
    ];
  }

  // Custom Software, CRM & ERP
  if (lower.includes("custom software") || lower.includes("crm") || lower.includes("erp")) {
    return [
      {
        t: "Built for Your Exact Daily Workflow",
        d: "Replaces messy Excel sheets, paper registers, and manual staff follow-ups with one clear screen.",
      },
      {
        t: "Role-Based Staff Permissions",
        d: "Keep sensitive customer phone numbers, supplier rates, and financial reports visible only to managers.",
      },
      {
        t: "Automated WhatsApp & Email Reminders",
        d: "Automatically send WhatsApp and email reminders for outstanding payments and pending customer tasks.",
      },
      {
        t: "Single Central Owner Dashboard",
        d: "Monitor leads, sales, inventory, and staff tasks in real time from your laptop or phone.",
      },
      {
        t: "No Monthly Per-User Software Fees",
        d: "You own your custom software completely—no paying expensive per-employee subscription fees every month.",
      },
      {
        t: "Bank-Grade Automated Daily Backups",
        d: "Your company records and client databases are backed up automatically every day so you never lose data.",
      },
    ];
  }

  // UI/UX Design
  if (lower.includes("ui") || lower.includes("ux") || lower.includes("design")) {
    return [
      {
        t: "Clickable Mobile Prototype First",
        d: "Test and tap through realistic interactive screens on your phone before spending on coding.",
      },
      {
        t: "Simple for Non-Tech Customers",
        d: "Intuitive navigation designed so first-time visitors can find what they want and buy without getting confused.",
      },
      {
        t: "Higher Inquiry & Conversion Rates",
        d: "Clear call-to-action buttons placed strategically where customers naturally look and tap.",
      },
      {
        t: "Modern, Trustworthy Visuals",
        d: "Clean typography, premium color palettes, and polished styling tailored to your industry.",
      },
      {
        t: "Prevents Costly Rework & Delays",
        d: "Refine the user journey and layout upfront so development is fast, accurate, and on budget.",
      },
      {
        t: "Includes Ready Design Assets",
        d: "Complete icon sets, image assets, and screen specifications ready for immediate implementation.",
      },
    ];
  }

  // Invoicing & Payments & Inventory
  if (lower.includes("invoice") || lower.includes("payment") || lower.includes("inventory")) {
    return [
      {
        t: "GST Invoices in 10 Seconds",
        d: "Create professional, branded GST tax invoices and send PDFs to clients via WhatsApp with one click.",
      },
      {
        t: "Instant UPI & QR Code Payments",
        d: "Include dynamic payment QR codes on every bill so customers can pay instantly via phone apps.",
      },
      {
        t: "Automated Unpaid Bill Reminders",
        d: "Politely remind clients of overdue payments automatically, helping you collect your money faster.",
      },
      {
        t: "Expense & Daily Profit Tracking",
        d: "Track vendor expenses, overheads, and net profit margins accurately without manual math.",
      },
      {
        t: "Multiple Tax & Discount Formats",
        d: "Handles GST slabs, trade discounts, and multi-currency billing effortlessly.",
      },
      {
        t: "Cloud Backup & Tax Filing Reports",
        d: "Export complete monthly sales summaries ready to hand directly to your accountant or CA.",
      },
    ];
  }

  // SEO & Search Growth
  if (lower.includes("seo") || lower.includes("search")) {
    return [
      {
        t: "Rank on Google First Page",
        d: "Put your website at the top when local customers in your city search for what you sell.",
      },
      {
        t: "More Phone Calls & Store Visits",
        d: "Optimize your Google Business Profile and Maps listing to drive direct inquiries and store footfall.",
      },
      {
        t: "Target High-Intent Ready Buyers",
        d: "Focus on keywords used by buyers actively looking to purchase, not just casual browsers.",
      },
      {
        t: "Fast 1-Second Mobile Performance",
        d: "Improve page speed and mobile usability so Google rewards your website with higher rankings.",
      },
      {
        t: "Outrank Local Competitors",
        d: "Analyze what top competing businesses in your market are doing and systematically surpass them.",
      },
      {
        t: "Transparent Monthly Reports",
        d: "See clear, easy-to-read charts showing website visits, phone calls, and new customer inquiries.",
      },
    ];
  }

  // Content Creation & Brand Identity & Ads
  if (lower.includes("content") || lower.includes("brand") || lower.includes("ad")) {
    return [
      {
        t: "Consistent Brand Identity",
        d: "A professional logo, distinct color palette, and visual style that makes your business look premium and credible.",
      },
      {
        t: "Ready-To-Run Ad Creatives",
        d: "High-converting ad banners and vertical video ads designed specifically to generate customer inquiries.",
      },
      {
        t: "High-Quality Product Visuals",
        d: "Sharp product photos and graphics tailored for your website, catalog, and social media pages.",
      },
      {
        t: "Clear, Compelling Messaging",
        d: "Simple words that explain what makes your business unique and why customers should buy from you.",
      },
      {
        t: "Multi-Platform Ready Assets",
        d: "Properly sized banners and templates for Instagram, Facebook, Google Ads, WhatsApp, and print flyers.",
      },
      {
        t: "Ongoing Creative Support",
        d: "Regular design updates whenever you launch new offers, products, or seasonal promotions.",
      },
    ];
  }

  // Business Tools & Consultation
  if (lower.includes("consult") || lower.includes("tracker") || lower.includes("portal") || lower.includes("maintenance")) {
    return [
      {
        t: "Tailored to Your Business Goals",
        d: "Direct strategic guidance to pick the right software, pricing, and tools without wasting money.",
      },
      {
        t: "Live Project & Milestone Tracking",
        d: "Clear progress updates and demo links so you always know what is being built and when it launches.",
      },
      {
        t: "Automated Daily Cloud Backups",
        d: "Your data and files are safely mirrored daily with bank-grade encryption to eliminate any risk of data loss.",
      },
      {
        t: "Fast Response SLA",
        d: "Dedicated priority response on WhatsApp and phone whenever your business needs assistance.",
      },
      {
        t: "Zero Hidden Licensing Fees",
        d: "Transparent, honest pricing structure with full ownership of your deliverables from day one.",
      },
      {
        t: "Ongoing Growth Support",
        d: "Continuous enhancements and new feature rollouts as your business expands into new markets.",
      },
    ];
  }

  // Universal Fallback for any other business product/service
  return [
    {
      t: "Built for Real Business Growth",
      d: "Tailored to your exact business needs, eliminating manual work and helping you acquire more paying customers.",
    },
    {
      t: "Zero Tech Knowledge Needed",
      d: "Simple, intuitive interfaces designed for business owners and staff with zero technical or coding skills.",
    },
    {
      t: "Faster Service & Happier Buyers",
      d: "Reduces customer waiting times, eliminates manual errors, and encourages repeat purchases.",
    },
    {
      t: "Accept Online Payments Effortlessly",
      d: "Collect customer payments directly into your bank account with Google Pay, PhonePe, and cards.",
    },
    {
      t: "Full Ownership, No Hidden Fees",
      d: "You own your solution completely without surprise recurring monthly per-user software fees.",
    },
    {
      t: "Direct In-House WhatsApp Support",
      d: "Speak directly with our team on WhatsApp or phone whenever you have questions or need changes.",
    },
  ];
}

function SlugPage() {
  const { page } = Route.useLoaderData();
  const n = page.name;

  if (page.kind === "product")
    return (
      <>
        <PageHero label={page.group} title={n} sub={tagline(page)} img={page.img}>
          <Link to="/templates" className="glass inline-flex items-center px-6 py-2.5 text-sm">View Deliverables</Link>
        </PageHero>
        <FeatureGrid
          title={`Why businesses choose our ${n}`}
          items={getProductFeatures(n)}
        />
        <Split
          title={`Grow your sales and save hours every day with ${n}`}
          body={`Whether launching a new business or upgrading an existing setup, our team handles the entire setup, design, and testing—delivering a dependable solution ready to bring in customers from day one.`}
          img={img(page, 1)}
        />
        <Split
          flip
          light
          title="A complete system designed to bring you more paying customers"
          body="Connect your digital solution with daily social media management, viral promo reels, and automated shop billing so your business attracts new buyers and runs smoothly every day."
          img={img(page, 2)}
        />
        <Related page={page} />
        <ClosingCta />
      </>
    );

  if (page.kind === "solution")
    return (
      <>
        <PageHero label="Solutions" title={`Creare Mind for ${n}`} sub={tagline(page)} img={page.img} />
        <section className="bg-paper px-5 py-24 text-ink md:px-10">
          <div className="mx-auto max-w-[1360px]">
            <h2 data-reveal className="text-4xl font-medium md:text-5xl">Featured work for {n.toLowerCase()}</h2>
            <div data-reveal="stagger" className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {TEMPLATES.slice((n.length % 4) * 2, (n.length % 4) * 2 + 4).map((t) => (
                <Link key={t.name} to="/templates" className="group block">
                  <div className="overflow-hidden rounded-md"><img src={t.img} alt={t.name} loading="lazy" className="aspect-[3/4] w-full object-cover transition-transform duration-700 ease-expo group-hover:scale-[1.04]" /></div>
                  <p className="mt-3 text-base font-medium">{t.name}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
        <FeatureGrid
          light={false}
          title={`Everything ${n.toLowerCase()} businesses need to grow`}
          items={[
            { t: "Fast Websites & Mobile Apps", d: "Clean, mobile-friendly websites and apps that let your customers browse products, book appointments, and pay online." },
            { t: "Counter Billing & Thermal Receipts", d: "Scan barcodes, print GST bills in 2 seconds, and keep counter lines moving fast even without internet." },
            { t: "Hands-Free Social Media Posting", d: "Daily branded graphics, festival posters, and Instagram posts published by our team to attract local buyers." },
            { t: "Promo Videos & Viral Reels", d: "Eye-catching short video ads with captions and music that showcase your products and build customer trust." },
            { t: "Automated Daily Backups & Safety", d: "All your customer records, bills, and sales data are safely backed up with bank-grade security." },
            { t: "Direct In-House WhatsApp Support", d: "Real human assistance on WhatsApp and phone whenever your business needs help or updates." },
          ]}
        />
        <Split
          light
          title={`Proven business solutions for ${n.toLowerCase()}`}
          body="We partner with ambitious founders, retailers, and local enterprises to eliminate manual paperwork, attract paying customers online, and streamline day-to-day operations."
          img={img(page, 3)}
        />
        <Related page={page} />
        <ClosingCta />
      </>
    );

  return (
    <>
      <PageHero label={page.group} title={n} sub={tagline(page)} img={page.img} />
      <Split
        light
        title={`Partner with Creare Mind for ${n}`}
        body={`At Creare Mind, we help ambitious business owners launch fast websites, custom mobile apps, shop billing software, and high-impact social media marketing. Everything is built to save you time and grow your revenue.`}
        img={img(page, 1)}
      />
      <FeatureGrid
        title="Why businesses trust Creare Mind"
        items={[
          { t: "Direct In-House Team", d: "Work directly with dedicated designers, developers, and video editors without middlemen." },
          { t: "Fast Delivery Timelines", d: "Clear milestones and weekly updates so your solution launches on schedule without delays." },
          { t: "Zero Tech Skills Required", d: "Simple owner controls and dashboards so you can manage your business with zero coding." },
          { t: "Transparent Fixed Estimates", d: "Upfront project estimates with no surprise costs or recurring per-user software fees." },
          { t: "End-to-End Execution", d: "From initial concept and payments setup to store launch and ongoing maintenance." },
          { t: "Ongoing WhatsApp Support", d: "Reliable daily support on WhatsApp so you are never left waiting when you need help." },
        ]}
      />
      <Related page={page} />
      <ClosingCta />
    </>
  );
}
