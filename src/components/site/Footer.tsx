import { ChevronDown, ShieldCheck, Check } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { Logo } from "./Logo";
import { NavLink } from "./NavLink";
import { footerCols } from "./data";
import { useCurrency, CURRENCIES, type CurrencyCode } from "@/hooks/use-currency";
import { FooterBackgroundGradient } from "@/components/ui/hover-footer";
import { useSiteContent } from "@/lib/site-content";

export function Footer() {
  const { content } = useSiteContent();
  const branding = content.branding || {};
  const phone = branding.phone || "+91 80727 19603";
  const email = branding.email || "crearemindwebsolutions@gmail.com";
  const instagramUrl = branding.instagramUrl || "https://www.instagram.com/crearemind.in";
  const linkedinUrl = branding.linkedinUrl || "https://www.linkedin.com/company/creare-mind/";

  const { currency, setCurrency, config } = useCurrency();
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const currencyRef = useRef<HTMLDivElement>(null);

  // Quick core shortcuts for minimal mobile display
  const quickMobileShortcuts = [
    { label: "Web Development", to: "/services#web-dev" },
    { label: "Mobile Apps", to: "/services#mobile-apps" },
    { label: "Shop Billing POS", to: "/services#shop-billing" },
    { label: "Video & Reels", to: "/services#video-editing" },
    { label: "Our Works", to: "/templates" },
    { label: "Contact Us", to: "/contact" },
  ];

  return (
    <footer className="relative overflow-hidden border-t bg-background px-5 pb-10 pt-16 md:px-12 md:pt-20">
      {/* Footer Atmospheric Gradient */}
      <FooterBackgroundGradient className="opacity-80" />

      <div className="relative z-10 mx-auto grid max-w-[1440px] gap-10 md:gap-14 lg:grid-cols-[1fr_2.2fr]">
        <div>
          <Link to="/" aria-label="Creare Mind home"><Logo /></Link>
          <p className="mt-5 sm:mt-6 text-2xl sm:text-3xl font-medium tracking-tight">
            Software that powers modern businesses
          </p>
          <div className="mt-5 sm:mt-6 space-y-2 text-xs text-muted-foreground">
            <p>
              Direct / WhatsApp:{" "}
              <a href={`tel:${phone.replace(/\s+/g, "")}`} className="font-medium text-foreground hover:underline">
                {phone}
              </a>
            </p>
            <p>
              Email:{" "}
              <a href={`mailto:${email}`} className="font-medium text-foreground hover:underline">
                {email}
              </a>
            </p>
            <div className="flex items-center gap-3 pt-2 text-xs font-semibold">
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground hover:opacity-75 transition-opacity"
              >
                Instagram ↗
              </a>
              <span>•</span>
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground hover:opacity-75 transition-opacity"
              >
                LinkedIn ↗
              </a>
            </div>
          </div>
        </div>

        {/* MINIMAL MOBILE & TABLET VIEW: Sleek quick shortcuts + Collapsible Accordion (Collapsed by default) */}
        <div className="lg:hidden space-y-6">
          {/* Quick Essential Shortcuts (Minimal 2-col pills) */}
          <div>
            <p className="mb-2.5 text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
              Quick Navigation
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {quickMobileShortcuts.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  className="rounded-lg border border-border/60 bg-card/60 px-3 py-2 text-xs font-medium text-foreground transition-all hover:bg-card hover:border-foreground/30 active:scale-98"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* DESKTOP VIEW: Full 4 balanced columns */}
        <div data-reveal="stagger" className="hidden gap-10 lg:grid lg:grid-cols-4">
          {footerCols.map((col, i) => (
            <div key={i} className="space-y-10">
              {col.map((g) => (
                <div key={g.h}>
                  <p className="mb-4 text-[13px] font-semibold">{g.h}</p>
                  <ul className="space-y-2">
                    {g.links.map((l) => (
                      <li key={l}>
                        <NavLink name={l} className="text-[13px] text-muted-foreground transition-colors hover:text-foreground" />
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 mx-auto mt-12 flex max-w-[1440px] flex-col gap-6 border-t border-border/40 pt-8 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-6">
          <span className="flex items-center gap-2 border px-3 py-2"><ShieldCheck className="h-4 w-4" /> Certified Software Partner</span>
          <span className="flex items-center gap-1 text-muted-foreground">English</span>
          <div className="relative" ref={currencyRef}>
            <button
              onClick={() => setCurrencyOpen((o) => !o)}
              className="flex items-center gap-1.5 rounded border border-border/70 bg-card px-2.5 py-1 text-foreground transition-colors hover:border-foreground"
              aria-label="Select currency"
            >
              <span>{config.flag}</span>
              <span className="font-medium">{config.symbol} {config.code}</span>
              <ChevronDown className={`h-3 w-3 transition-transform ${currencyOpen ? "rotate-180" : ""}`} />
            </button>
            {currencyOpen && (
              <div className="absolute bottom-full left-0 mb-2 w-52 rounded-lg border border-border bg-card p-1.5 shadow-xl z-30">
                <p className="px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Select Currency</p>
                {(Object.keys(CURRENCIES) as CurrencyCode[]).map((code) => {
                  const item = CURRENCIES[code];
                  const selected = currency === code;
                  return (
                    <button
                      key={code}
                      onClick={() => {
                        setCurrency(code);
                        setCurrencyOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-md px-2.5 py-2 text-left text-xs transition-colors ${
                        selected ? "bg-muted text-foreground font-medium" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{item.flag}</span>
                        <span>{item.symbol} {item.code}</span>
                        {code === "INR" && <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[9px] text-primary">Default</span>}
                      </span>
                      {selected && <Check className="h-3.5 w-3.5 text-foreground" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-5">
          <Link to="/terms" className="link-u hover:text-foreground">Terms</Link>
          <Link to="/privacy" className="link-u hover:text-foreground">Privacy</Link>
          <a href="#" className="link-u hover:text-foreground">Security Measures</a>
          <a href="#" className="link-u hover:text-foreground">Sitemap</a>
          <span>© 2026 Creare Mind Inc.</span>
        </div>
      </div>
    </footer>
  );
}
