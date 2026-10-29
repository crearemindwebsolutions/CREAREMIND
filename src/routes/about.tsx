import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Sparkles,
  ShieldCheck,
  Code2,
  Database,
  Workflow,
  Rocket,
  Cpu,
  Layers,
  Globe2,
  CheckCircle2,
  ArrowRight,
  Linkedin,
  Mail,
  Instagram,
  ExternalLink,
  HeartHandshake,
  Zap,
} from "lucide-react";
import WavyBackground from "@/components/ui/blue-meshy-background";
import { GetStartedLink } from "@/components/site/GetStartedLink";

import founderGowthaman from "@/assets/team/founder-gowthaman.png";
import cofounderDheepan from "@/assets/team/cofounder-dheepan-raj.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — Creare Mind | Founders, Leadership & Engineering Studio" },
      {
        name: "description",
        content:
          "Meet the founders and team behind Creare Mind. Discover our mission, engineering philosophy, and the software solutions we build for ambitious businesses worldwide.",
      },
      { property: "og:title", content: "About Us — Creare Mind" },
      {
        property: "og:description",
        content:
          "Meet the founders and team behind Creare Mind. High-velocity software development, mobile apps, shop billing POS, and creative media.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutPage,
});

interface Founder {
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

const FOUNDERS: Founder[] = [
  {
    name: "Gowthaman PR",
    role: "Founder & Chief Executive Officer (CEO)",
    badge: "FOUNDER & CEO",
    tagline: "Founder & Visionary • Creare Mind",
    image: founderGowthaman,
    quote: "Building the future of brands. One vision at a time.",
    quoteDesc:
      "Software is the ultimate competitive advantage for modern businesses. We don't build generic templates; we engineer robust digital engines that give our clients absolute market authority.",
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
    name: "Dheepan Raj",
    role: "Co-Founder & Strategic Director",
    badge: "CO-FOUNDER & STRATEGIC DIRECTOR",
    tagline: "Co-Founder & Strategy Leader • Creare Mind",
    image: cofounderDheepan,
    quote: "Turning bold ideas into real impact. The strategy behind the vision.",
    quoteDesc:
      "Execution turns vision into market dominance. At Creare Mind, we don't just craft ideas — we engineer strategic operations, resilient commercial infrastructure, and high-conversion client growth systems that deliver tangible business impact.",
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
];

const VALUES = [
  {
    icon: Code2,
    title: "Radical Craftsmanship",
    desc: "We write clean, strictly-typed code that is maintainable, modular, and built to stand the test of time — never bloated page-builder templates.",
  },
  {
    icon: ShieldCheck,
    title: "100% Client Code Ownership",
    desc: "You own all source code, design files, databases, and deployment pipelines. No locked-in vendor traps or proprietary black boxes.",
  },
  {
    icon: Zap,
    title: "High-Velocity Sprints",
    desc: "Structured weekly milestone demos, transparent communication via WhatsApp/Slack, and rapid shipping cadence without cutting corners.",
  },
  {
    icon: HeartHandshake,
    title: "End-to-End Partnership",
    desc: "From initial napkin wireframes and custom UI design to POS thermal hardware setup and viral social video production, we deliver the complete loop.",
  },
];

export function AboutPage() {
  return (
    <div className="bg-paper text-ink">
      {/* ─── Founders & Executive Leadership (Editorial Poster Showcase) ─── */}
      <section className="relative overflow-hidden bg-[#FAF8F5] text-ink px-5 pt-24 sm:pt-28 md:pt-32 pb-16 md:pb-24">
        {/* Soft, warm ambient peach & champagne glow orbs matching the poster */}
        <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-gradient-to-br from-[#FDE8DF]/70 via-[#F7DED4]/40 to-transparent blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-gradient-to-tr from-[#FDE8DF]/60 via-[#F7DED4]/30 to-transparent blur-3xl" />

        <div className="relative mx-auto max-w-[1360px]">
          {/* Section Header */}
          <div className="max-w-2xl mb-12 sm:mb-16">
            <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-black/5 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-700">
              <Sparkles className="h-3 w-3 text-neutral-800" />
              Leadership & Vision
            </span>
            <h2 className="mt-3 text-3xl font-medium tracking-tight sm:text-4xl md:text-5xl font-serif">
              Meet our founder & leadership
            </h2>
            <p className="mt-2.5 text-xs sm:text-sm text-neutral-600 sm:text-base leading-relaxed">
              Architects and strategists with hands-on experience scaling systems from zero to
              millions of transactions.
            </p>
          </div>

          {/* 2-Column Executive Leadership Grid */}
          <div className="mb-14 grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 items-stretch">
            {FOUNDERS.map((f) => (
              <div
                key={f.name}
                className="group flex flex-col justify-between overflow-hidden rounded-2xl sm:rounded-3xl border border-black/10 bg-white/70 backdrop-blur-md p-6 sm:p-8 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.08)] transition-all duration-300 hover:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.14)] hover:border-black/20"
              >
                <div>
                  {/* Poster Showcase Card */}
                  <div className="group/poster relative mx-auto w-full max-w-[420px] overflow-hidden rounded-2xl border border-black/10 bg-[#FAF8F5] shadow-[0_15px_35px_-15px_rgba(0,0,0,0.12)] transition-all duration-500 hover:shadow-[0_25px_50px_-15px_rgba(0,0,0,0.2)]">
                    {/* Subtle poster ambient background glow */}
                    <div className="pointer-events-none absolute top-0 right-0 h-36 w-36 rounded-full bg-[#FDE8DF]/80 blur-2xl" />
                    <div className="pointer-events-none absolute bottom-0 left-0 h-36 w-36 rounded-full bg-[#FDE8DF]/70 blur-2xl" />

                    {/* Poster Image */}
                    <div className="relative aspect-[685/845] w-full overflow-hidden bg-[#FAF8F5]">
                      <img
                        src={f.image}
                        alt={`${f.name} — ${f.badge} of Creare Mind`}
                        className="h-full w-full object-cover transition-transform duration-700 ease-expo group-hover/poster:scale-[1.02]"
                      />
                    </div>
                  </div>

                  {/* Identity Header */}
                  <div className="mt-6 sm:mt-7">
                    <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-black/5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-neutral-800">
                      {f.badge}
                    </div>
                    <h3 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900">
                      {f.name}
                    </h3>
                    <p className="mt-1 text-xs font-mono uppercase tracking-[0.2em] text-neutral-500">
                      {f.tagline}
                    </p>
                  </div>

                  {/* Narrative Bio */}
                  <p className="mt-5 text-xs sm:text-sm md:text-base text-neutral-600 leading-relaxed">
                    {f.bio}
                  </p>

                  {/* Core Areas of Mastery */}
                  <div className="mt-5">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 block mb-2">
                      Core Areas of Mastery
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {f.focus.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-medium text-neutral-800 shadow-2xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Direct Action Bar: Icon Buttons & Direct Connect Link */}
                <div className="mt-6 pt-5 border-t border-black/10 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    {f.email && (
                      <a
                        href={`mailto:${f.email}`}
                        aria-label={`Email ${f.name}`}
                        title={`Email ${f.name}`}
                        className="grid h-10 w-10 place-items-center rounded-full border border-black/15 bg-white text-neutral-700 transition-colors hover:bg-neutral-900 hover:text-white shadow-2xs"
                      >
                        <Mail className="h-4 w-4" />
                      </a>
                    )}

                    {f.linkedin && (
                      <a
                        href={f.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="LinkedIn"
                        title="LinkedIn"
                        className="grid h-10 w-10 place-items-center rounded-full border border-black/15 bg-white text-neutral-700 transition-colors hover:bg-neutral-900 hover:text-white shadow-2xs"
                      >
                        <Linkedin className="h-4 w-4" />
                      </a>
                    )}

                    {f.instagram && (
                      <a
                        href={f.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Instagram"
                        title="Instagram"
                        className="grid h-10 w-10 place-items-center rounded-full border border-black/15 bg-white text-neutral-700 transition-colors hover:bg-neutral-900 hover:text-white shadow-2xs"
                      >
                        <Instagram className="h-4 w-4" />
                      </a>
                    )}
                  </div>

                  {f.email && (
                    <a
                      href={`mailto:${f.email}`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-800 hover:text-black transition-colors"
                    >
                      Connect directly
                      <ArrowRight className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Company Story & Mission (Origin & Values) ─── */}
      <section className="border-t border-ink/10 px-5 py-12 md:px-10 md:py-18">
        <div className="mx-auto max-w-[1360px]">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-14 items-start">
            <div className="lg:col-span-5 space-y-4 sm:space-y-5">
              <span className="text-[11px] font-bold uppercase tracking-widest text-ink-muted">
                Our Origin & Mission
              </span>
              <h2 className="text-2xl font-medium tracking-tight sm:text-3xl md:text-4xl leading-tight">
                Why we built Creare Mind
              </h2>
              <p className="text-sm sm:text-base text-ink-muted leading-relaxed">
                Most businesses looking to build digital tools face an agonizing dilemma: either pay
                astronomical agency retainers for slow delivery, or settle for fragile off-the-shelf
                templates that crumble as transaction volume grows.
              </p>
              <p className="text-sm sm:text-base text-ink-muted leading-relaxed">
                We started Creare Mind to offer a fundamentally better path. We pair elite software
                architects with world-class product designers to deliver bespoke, production-grade
                solutions with high velocity, total transparency, and unwavering focus on your ROI.
              </p>
            </div>

            <div className="lg:col-span-7 grid gap-4 sm:grid-cols-2 sm:gap-5">
              {VALUES.map((v) => {
                const Icon = v.icon;
                return (
                  <div
                    key={v.title}
                    className="group rounded-[8px] border border-ink/10 bg-paper-2/60 p-5 sm:p-6 transition-all duration-300 hover:border-ink/25 hover:bg-paper-2 hover:shadow-md"
                  >
                    <div className="grid h-10 w-10 place-items-center rounded-[8px] bg-ink text-paper transition-transform duration-300 group-hover:scale-105">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 text-base font-semibold tracking-tight text-ink sm:text-lg">
                      {v.title}
                    </h3>
                    <p className="mt-1.5 text-xs sm:text-sm text-ink-muted leading-relaxed">
                      {v.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Engineering Standards ─── */}
      <section className="border-t border-ink/10 bg-ink text-paper px-5 py-12 md:px-10 md:py-18">
        <div className="mx-auto max-w-[1360px]">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
            <span className="text-[11px] font-bold uppercase tracking-widest text-paper/60">
              Our Principles
            </span>
            <h2 className="mt-1.5 text-2xl font-medium tracking-tight sm:text-3xl md:text-4xl text-paper">
              How we work with our clients
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-paper/70">
              Clear commitments that eliminate risk, delay, and miscommunication.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-5">
            {[
              {
                t: "Direct Founder Access",
                d: "You speak directly with founders and senior engineers who build your system. No account managers playing telephone.",
              },
              {
                t: "Strict Sprint Milestones",
                d: "Every week features live working demos in a staging environment so you can test features as they are built.",
              },
              {
                t: "Hardware Verification",
                d: "For POS and billing systems, we physically test receipt thermal printers, barcode scanners, and cash drawer triggers.",
              },
              {
                t: "Post-Launch Warranty",
                d: "30 days of complimentary bug-fixing and cloud tuning post-deployment to ensure your rollout is 100% stable.",
              },
            ].map((c) => (
              <div
                key={c.t}
                className="rounded-[8px] border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition-colors hover:border-white/20 hover:bg-white/10"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-400/20 text-emerald-400 mb-3">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </div>
                <h3 className="text-base font-semibold tracking-tight text-white">{c.t}</h3>
                <p className="mt-1.5 text-xs text-paper/70 leading-relaxed">{c.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Closing CTA with Luxury Cream Waves (About Page Exclusive) ─── */}
      <section className="relative overflow-hidden bg-[#0c0a09] text-white text-center">
        {/* Luxury Cream Wavy GLSL Mesh Background */}
        <div className="pointer-events-none absolute inset-0 z-0 opacity-75">
          <WavyBackground theme="cream" className="h-full w-full" />
        </div>
        <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-t from-[#0c0a09] via-transparent to-[#0c0a09]/50" />
        <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(245,235,215,0.22)_0%,transparent_75%)]" />

        <div className="relative z-10 flex min-h-[460px] flex-col items-center justify-center px-5 py-20 text-center">
          <div className="mx-auto max-w-2xl">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#e8d5c4]">
              Start Your Project
            </span>
            <h2 className="mt-3 text-3xl font-medium tracking-tight sm:text-4xl md:text-5xl leading-tight text-white">
              Ready to build something extraordinary?
            </h2>
            <p className="mt-3.5 text-xs sm:text-sm text-neutral-300 sm:text-base leading-relaxed max-w-xl mx-auto">
              Let's discuss your requirements, define your scope, and engineer software that drives
              real business revenue.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <GetStartedLink className="btn-solid !px-8 !py-3 !text-xs sm:!text-sm">
                Start a Conversation <ArrowRight className="ml-1.5 h-3.5 w-3.5 inline" />
              </GetStartedLink>
              <Link
                to="/services"
                className="rounded-full border border-white/20 bg-white/10 px-6 py-3 text-xs font-medium text-white backdrop-blur-sm transition-colors hover:bg-white hover:text-black sm:text-sm"
              >
                Explore All Services
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
