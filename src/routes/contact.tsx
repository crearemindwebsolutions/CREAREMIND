import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useId } from "react";
import {
  Phone,
  PhoneCall,
  MessageSquare,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  Copy,
  Sparkles,
  ArrowRight,
  Calendar,
  CheckCircle2,
  ExternalLink,
  Laptop,
  Smartphone,
  Store,
  Film,
  Code2,
  Zap,
  Lock,
  FileCheck2,
  Layers,
  ChevronDown,
  Check,
} from "lucide-react";
import WavyBackground from "@/components/ui/blue-meshy-background";
import { submitContactInquiry } from "@/lib/inquiries";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us & Start a Project — Creare Mind" },
      {
        name: "description",
        content:
          "Discuss your next software project with Creare Mind. Direct phone line +91 80727 19603, instant WhatsApp desk, or request a free 30-min architectural callback.",
      },
      { property: "og:title", content: "Contact Us & Start a Project — Creare Mind" },
      {
        property: "og:description",
        content:
          "Engineering leadership desk for custom software, mobile apps, shop billing POS counters, and digital automation. Rapid 15-minute response.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ContactPage,
});

const SERVICES = [
  {
    id: "web",
    label: "Web Application & SaaS",
    icon: Laptop,
    desc: "Modern React/cloud platforms with database & auth",
    turnaround: "2 – 3 Weeks",
    typicalScope: "Custom SaaS MVP, client portals, API integrations & responsive UI",
  },
  {
    id: "mobile",
    label: "Mobile Apps (iOS & Android)",
    icon: Smartphone,
    desc: "Native performance published on Apple & Google Play stores",
    turnaround: "3 – 5 Weeks",
    typicalScope: "User profiles, push alerts, offline support, payment gateway & camera",
  },
  {
    id: "pos",
    label: "Shop Billing & POS Counters",
    icon: Store,
    desc: "Fast barcode scanning, thermal GST receipts & inventory",
    turnaround: "7 – 12 Days",
    typicalScope: "On-site setup in South India, dual counters, WhatsApp digital billings",
  },
  {
    id: "ecommerce",
    label: "E-Commerce & Online Stores",
    icon: Zap,
    desc: "Fast checkout with automated UPI, cards & inventory alerts",
    turnaround: "10 – 14 Days",
    typicalScope: "Automated payment reconciliation, order tracking & mobile-first cart",
  },
  {
    id: "video",
    label: "Video Editing & Social Growth",
    icon: Film,
    desc: "Cinematic commercial reels, video ads & motion branding",
    turnaround: "48 – 72 Hours",
    typicalScope: "High-hook video promos, motion graphics, audio mastering & viral clips",
  },
  {
    id: "custom",
    label: "Custom Software & Business ERP",
    icon: Code2,
    desc: "Tailored internal operations software & automated workflows",
    turnaround: "3 – 6 Weeks",
    typicalScope: "Multi-branch inventory, role permissions, custom database & PDF engine",
  },
];

function ContactPage() {
  const formId = useId();

  // Form state
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [selectedService, setSelectedService] = useState<string>("web");
  const [projectBrief, setProjectBrief] = useState("");

  // Interaction state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<{
    id: string;
    name: string;
    phone: string;
    service: string;
    createdAt: string;
  } | null>(null);

  const [isServiceDropdownOpen, setIsServiceDropdownOpen] = useState(false);

  const currentServiceObj = SERVICES.find((s) => s.id === selectedService) || SERVICES[0];
  const CurrentServiceIcon = currentServiceObj.icon;

  const handleSubmitCallback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) return;

    setIsSubmitting(true);

    try {
      const serviceName = currentServiceObj.label;
      const result = await submitContactInquiry({
        name: fullName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        service: serviceName,
        brief: projectBrief.trim(),
      });

      const now = new Date();
      const formattedTime = now.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }) + " at " + now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      const record = {
        id: result.id,
        name: fullName.trim(),
        phone: phone.trim(),
        email: email.trim() || "Not provided",
        service: serviceName,
        brief: projectBrief.trim() || "Requested project kickoff & consultation",
        createdAt: formattedTime,
      };

      setSubmittedTicket(record);
    } catch (err) {
      console.error("Failed to submit inquiry:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateWhatsAppUrl = () => {
    const text = submittedTicket
      ? `Hello Creare Mind! I submitted a callback request (Ref: ${submittedTicket.id}).
Name: ${submittedTicket.name}
Phone: ${submittedTicket.phone}
Project: ${submittedTicket.service}
Looking forward to discussing our project!`
      : `Hello Creare Mind! I would like to discuss a project regarding ${currentServiceObj.label} and get a scope estimate.`;
    return `https://wa.me/918072719603?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="bg-background text-foreground transition-colors duration-300">
      {/* ─── Interactive Request Callback & Live Project Scoper ─── */}
      <section
        id="callback-form"
        className="bg-[#EAE9E7] text-neutral-900 px-5 pt-24 sm:pt-28 md:pt-32 pb-20 md:pb-28"
      >
        <div className="mx-auto max-w-[1360px]">
          {/* Top Breadcrumb Navigation */}
          <div className="mb-6 sm:mb-8 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">
            <Link to="/" className="hover:text-neutral-900 transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="font-bold text-neutral-900">Project Kickoff & Contact</span>
          </div>
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.5fr_1fr] items-start">
            {/* Form Column */}
            <div className="rounded-3xl border border-black/8 bg-[#FAF8F5] p-5 sm:p-9 md:p-12 shadow-sm text-neutral-900">
              <div className="border-b border-black/8 pb-6">
                <span className="inline-flex items-center gap-2 rounded-full bg-black/5 border border-black/10 px-3.5 py-1 text-xs font-semibold text-neutral-800">
                  <PhoneCall className="h-3.5 w-3.5 text-neutral-800" />
                  Instant Callback Desk
                </span>
                <h2 className="mt-4 text-2xl font-semibold sm:text-3xl md:text-4xl text-neutral-900 tracking-tight">
                  Request a Dedicated Call Back
                </h2>
                <p className="mt-2 text-sm text-neutral-600">
                  Select your project scope and convenient time window. Our senior software lead
                  will call you directly with an architectural review and fixed estimate.
                </p>
              </div>

              {submittedTicket ? (
                /* Success Confirmation State */
                <div className="mt-8 space-y-6 animate-in fade-in duration-300">
                  <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-7 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg">
                      <CheckCircle2 className="h-8 w-8" />
                    </div>
                    <h3 className="mt-4 text-2xl font-semibold text-neutral-900">
                      Callback Ticket Confirmed
                    </h3>
                    <p className="mt-2 text-sm text-neutral-600 max-w-md mx-auto">
                      Thank you,{" "}
                      <span className="font-semibold text-neutral-900">{submittedTicket.name}</span>
                      . We have logged your priority ticket{" "}
                      <span className="font-mono font-bold text-neutral-900">
                        {submittedTicket.id}
                      </span>
                      .
                    </p>
                    <p className="mt-2 text-xs font-semibold text-emerald-700">
                      Our engineering lead will call you at{" "}
                      <span className="font-bold underline">{submittedTicket.phone}</span> shortly.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-black/8 bg-white/70 p-5 space-y-3 text-xs">
                    <div className="flex justify-between border-b border-black/8 pb-2.5">
                      <span className="text-neutral-500">Ticket Reference</span>
                      <span className="font-mono font-semibold text-neutral-900">
                        {submittedTicket.id}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-black/8 pb-2.5">
                      <span className="text-neutral-500">Service Required</span>
                      <span className="font-semibold text-neutral-900">
                        {submittedTicket.service}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Logged At</span>
                      <span className="font-semibold text-neutral-900">
                        {submittedTicket.createdAt}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-black/8 bg-white p-6 text-center shadow-sm">
                    <p className="text-xs font-medium text-neutral-600 mb-3">
                      Want to connect immediately without waiting for the call?
                    </p>
                    <a
                      href={generateWhatsAppUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-white shadow-md transition-all hover:brightness-105 active:scale-95"
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span>Ping Lead Developer on WhatsApp Now</span>
                    </a>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSubmittedTicket(null);
                      setFullName("");
                      setPhone("");
                      setEmail("");
                      setProjectBrief("");
                    }}
                    className="w-full text-center text-xs font-semibold text-neutral-500 hover:text-neutral-900 underline pt-2"
                  >
                    Submit another project request
                  </button>
                </div>
              ) : (
                /* Interactive Request Form */
                <form onSubmit={handleSubmitCallback} className="mt-8 space-y-7">
                  {/* Step 1: Select Service Category */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-3">
                      1. Select Project Type
                    </label>

                    {/* Mobile View: Minimized Collapsible / Dropdown Selector (hidden on sm+) */}
                    <div className="sm:hidden space-y-2">
                      <button
                        type="button"
                        onClick={() => setIsServiceDropdownOpen((prev) => !prev)}
                        className="flex w-full items-center justify-between gap-3 rounded-2xl border border-black/10 bg-white/80 p-3.5 text-left text-neutral-900 transition-all active:scale-[0.99] hover:border-black/30"
                        aria-expanded={isServiceDropdownOpen}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-neutral-900 text-white">
                            <CurrentServiceIcon className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-neutral-900 truncate">
                                {currentServiceObj.label}
                              </span>
                              <span className="rounded-full bg-emerald-600/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 shrink-0">
                                Selected
                              </span>
                            </div>
                            <p className="text-[11px] text-neutral-500 truncate mt-0.5">
                              {currentServiceObj.desc}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0 pl-1 text-neutral-500">
                          <span className="text-[11px] font-semibold">
                            {isServiceDropdownOpen ? "Close" : "Change"}
                          </span>
                          <ChevronDown
                            className={`h-4 w-4 transition-transform duration-200 ${
                              isServiceDropdownOpen ? "rotate-180" : ""
                            }`}
                          />
                        </div>
                      </button>

                      {/* Expanded Dropdown Options */}
                      {isServiceDropdownOpen && (
                        <div className="overflow-hidden rounded-2xl border border-black/10 bg-[#FAF8F5] p-1.5 shadow-xl space-y-1 animate-in fade-in slide-in-from-top-2 duration-200">
                          <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-500 flex justify-between items-center border-b border-black/8 mb-1">
                            <span>Available Services</span>
                            <span className="text-[10px] normal-case text-neutral-400">
                              Tap to select
                            </span>
                          </div>
                          {SERVICES.map((s) => {
                            const Icon = s.icon;
                            const isSelected = selectedService === s.id;
                            return (
                              <button
                                key={s.id}
                                type="button"
                                onClick={() => {
                                  setSelectedService(s.id);
                                  setIsServiceDropdownOpen(false);
                                }}
                                className={`flex w-full items-center justify-between gap-3 rounded-xl p-2.5 text-left transition-all ${
                                  isSelected
                                    ? "bg-neutral-900 text-white shadow-sm"
                                    : "hover:bg-black/5 text-neutral-900"
                                }`}
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <div
                                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                                      isSelected
                                        ? "bg-white/20 text-white"
                                        : "bg-black/5 text-neutral-800"
                                    }`}
                                  >
                                    <Icon className="h-4 w-4" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-xs font-semibold truncate">{s.label}</p>
                                    <p
                                      className={`text-[10px] truncate ${
                                        isSelected ? "text-white/80" : "text-neutral-500"
                                      }`}
                                    >
                                      {s.desc}
                                    </p>
                                  </div>
                                </div>

                                {isSelected && (
                                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/20 text-white">
                                    <Check className="h-3 w-3 stroke-[3]" />
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Desktop View: Full Grid Layout (hidden on mobile) */}
                    <div className="hidden sm:grid sm:grid-cols-2 gap-3">
                      {SERVICES.map((s) => {
                        const Icon = s.icon;
                        const isSelected = selectedService === s.id;
                        return (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => setSelectedService(s.id)}
                            className={`flex items-start gap-3.5 rounded-2xl border p-4 text-left transition-all ${
                              isSelected
                                ? "border-neutral-900 bg-neutral-900 text-white shadow-md scale-[1.01]"
                                : "border-black/8 bg-white/70 hover:border-black/25 hover:bg-white text-neutral-900"
                            }`}
                          >
                            <div
                              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                                isSelected
                                  ? "bg-white/20 text-white"
                                  : "bg-black/5 text-neutral-800"
                              }`}
                            >
                              <Icon className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-xs font-bold">{s.label}</p>
                              <p
                                className={`text-[11px] mt-0.5 line-clamp-1 ${isSelected ? "text-white/80" : "text-neutral-500"}`}
                              >
                                {s.desc}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Step 2: Contact Details */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-3">
                      2. Your Contact Details
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor={`${formId}-name`}
                          className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-2"
                        >
                          Your Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          id={`${formId}-name`}
                          type="text"
                          required
                          placeholder="e.g. Gowtham"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="h-12 w-full rounded-xl border border-black/15 bg-white px-4 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition-colors focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor={`${formId}-phone`}
                          className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-2"
                        >
                          Phone / WhatsApp Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          id={`${formId}-phone`}
                          type="tel"
                          required
                          placeholder="e.g. +91 80727 19603"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="h-12 w-full rounded-xl border border-black/15 bg-white px-4 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition-colors focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <label
                        htmlFor={`${formId}-email`}
                        className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-2"
                      >
                        Email Address (Optional)
                      </label>
                      <input
                        id={`${formId}-email`}
                        type="email"
                        placeholder="e.g. crearemindwebsolutions@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-12 w-full rounded-xl border border-black/15 bg-white px-4 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition-colors focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
                      />
                    </div>
                  </div>

                  {/* Step 3: Project Brief */}
                  <div>
                    <label
                      htmlFor={`${formId}-brief`}
                      className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-2"
                    >
                      3. Briefly describe what you’d like to build
                    </label>
                    <textarea
                      id={`${formId}-brief`}
                      rows={3}
                      placeholder="e.g. We need a retail shop billing software with 2 counter thermal printers and barcode scanner, plus an iOS/Android customer loyalty app."
                      value={projectBrief}
                      onChange={(e) => setProjectBrief(e.target.value)}
                      className="w-full rounded-xl border border-black/15 bg-white p-4 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition-colors focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-solid w-full sm:w-auto !px-9 !py-4 !text-xs uppercase tracking-wider flex items-center justify-center gap-2 rounded-xl !bg-neutral-900 !text-white hover:!bg-black shadow-lg transition-all active:scale-95 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          <span>Submitting Request…</span>
                        </>
                      ) : (
                        <>
                          <PhoneCall className="h-4 w-4" />
                          <span>Request My Free Call Back</span>
                        </>
                      )}
                    </button>

                    <p className="text-[11px] text-neutral-500 text-center sm:text-left">
                      🔒 Zero spam. We never share your data. Free 30-min discovery session.
                    </p>
                  </div>
                </form>
              )}
            </div>

            {/* Right Column: Direct Channels (Desktop only, hidden in mobile view) */}
            <div className="hidden lg:block space-y-6">
              {/* Direct Channels & Official Socials Card */}
              <div className="rounded-3xl border border-black/8 bg-[#FAF8F5] p-7 shadow-sm space-y-5 text-neutral-900">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                    Direct Channels & Verification
                  </span>
                  <h3 className="mt-1 text-base font-bold text-neutral-900">
                    Connect With Us Directly
                  </h3>
                </div>

                <div className="space-y-3.5 text-xs">
                  <div className="flex items-center justify-between rounded-2xl border border-black/8 bg-white/70 p-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-900 text-white">
                        <Phone className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-neutral-900">Phone & WhatsApp</p>
                        <p className="font-mono text-neutral-600">+91 80727 19603</p>
                      </div>
                    </div>
                    <a
                      href="https://wa.me/918072719603?text=Hello%20Creare%20Mind,%20I'd%20like%20to%20discuss%20a%20project."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg bg-[#25D366] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white shadow-sm hover:brightness-105"
                    >
                      Chat
                    </a>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl border border-black/8 bg-white/70 p-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-900 text-white">
                        <Mail className="h-4 w-4" />
                      </div>
                      <div className="max-w-[190px] sm:max-w-none truncate">
                        <p className="font-semibold text-neutral-900">Official Email</p>
                        <p className="font-mono text-neutral-600 truncate">
                          crearemindwebsolutions@gmail.com
                        </p>
                      </div>
                    </div>
                    <a
                      href="mailto:crearemindwebsolutions@gmail.com"
                      className="rounded-lg border border-black/15 bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-neutral-900 hover:bg-neutral-900 hover:text-white transition-colors"
                    >
                      Email
                    </a>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <a
                      href="https://www.instagram.com/crearemind.in"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 rounded-xl border border-black/10 bg-white/70 py-2.5 px-3 text-xs font-semibold text-neutral-800 transition-all hover:border-pink-500/50 hover:bg-pink-50 hover:text-pink-600"
                    >
                      <span>Instagram</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>

                    <a
                      href="https://www.linkedin.com/company/creare-mind/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 rounded-xl border border-black/10 bg-white/70 py-2.5 px-3 text-xs font-semibold text-neutral-800 transition-all hover:border-blue-500/50 hover:bg-blue-50 hover:text-blue-600"
                    >
                      <span>LinkedIn</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Bottom Full-Width CTA Banner ─── */}
      <section className="relative overflow-hidden bg-black px-5 py-20 text-white md:px-10 md:py-28 text-center">
        <div className="pointer-events-none absolute inset-0 z-0 opacity-40">
          <WavyBackground className="h-full w-full" />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />

        <div className="relative z-10 mx-auto max-w-3xl">
          <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold tracking-wider uppercase text-white/90">
            <Sparkles className="h-3.5 w-3.5" />
            Ready To Launch?
          </span>

          <h2 className="mt-6 text-3xl font-medium sm:text-4xl md:text-5xl leading-tight">
            Let’s build something extraordinary together.
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm sm:text-base text-white/70">
            Speak directly with our senior software engineers today. Fast 15-minute response on
            WhatsApp and phone.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <a
              href="https://wa.me/918072719603?text=Hello%20Creare%20Mind,%20I'd%20like%20to%20discuss%20a%20project."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-8 py-3.5 text-sm font-semibold uppercase tracking-wider text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Chat on WhatsApp</span>
            </a>

            <a
              href="tel:+918072719603"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/40 bg-white/10 px-8 py-3.5 text-sm font-semibold uppercase tracking-wider text-white backdrop-blur-md transition-all hover:bg-white hover:text-black active:scale-95"
            >
              <Phone className="h-4 w-4" />
              <span>Call +91 80727 19603</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
