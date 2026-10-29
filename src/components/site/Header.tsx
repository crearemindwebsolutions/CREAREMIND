import { useEffect, useRef, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { NavLink } from "./NavLink";
import { useSession } from "@/hooks/use-session";
import { supabase } from "@/integrations/supabase/client";
import { ChevronDown, Menu, X, ArrowRight, User } from "lucide-react";
import { Logo, LogoMark } from "./Logo";
import { scrollToEl, lenisInstance } from "./SmoothScroll";
import tplImg from "@/assets/tpl-2.jpg";

type MenuKey = "Products";
const MENUS: MenuKey[] = ["Products"];

import { productsMenu } from "./data";

function MegaContent({ k, onClose }: { k: MenuKey; onClose?: () => void }) {
  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1.15fr]">
      {/* Column 1: Development */}
      <div className="flex flex-col justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-400 mb-3.5">
            Development
          </p>
          <ul className="space-y-0.5">
            {productsMenu.Development.map((item) => (
              <li key={item}>
                <div onClick={onClose}>
                  <NavLink
                    name={item}
                    className="block py-1.5 text-[13.5px] font-normal text-neutral-200 transition-colors duration-150 hover:text-white"
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-6 pt-2" onClick={onClose}>
          <Link
            to="/contact"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-neutral-300 hover:text-white transition-colors group"
          >
            View All Services
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>

      {/* Column 2: Business Systems */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-400 mb-3.5">
          Business Systems
        </p>
        <ul className="space-y-0.5">
          {productsMenu["Business Systems"].map((item) => (
            <li key={item}>
              <div onClick={onClose}>
                <NavLink
                  name={item}
                  className="block py-1.5 text-[13.5px] font-normal text-neutral-200 transition-colors duration-150 hover:text-white"
                />
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Column 3: Marketing & Business Tools */}
      <div className="space-y-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-400 mb-3.5">
            Marketing
          </p>
          <ul className="space-y-0.5">
            {productsMenu.Marketing.map((item) => (
              <li key={item}>
                <div onClick={onClose}>
                  <NavLink
                    name={item}
                    className="block py-1.5 text-[13.5px] font-normal text-neutral-200 transition-colors duration-150 hover:text-white"
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-400 mb-3.5">
            Business Tools
          </p>
          <ul className="space-y-0.5">
            {productsMenu["Business Tools"].map((item) => (
              <li key={item}>
                <div onClick={onClose}>
                  <NavLink
                    name={item}
                    className="block py-1.5 text-[13.5px] font-normal text-neutral-200 transition-colors duration-150 hover:text-white"
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Column 4: For Businesses & Startups */}
      <div className="lg:border-l lg:border-neutral-800 lg:pl-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-400 mb-3.5">
          For Businesses & Startups
        </p>
        <div className="space-y-3" onClick={onClose}>
          <NavLink
            name="Custom Engineering"
            className="group block rounded-xl bg-[#141414] p-4 border border-white/5 transition-all duration-200 hover:bg-[#1e1e1e] hover:border-white/15"
          >
            <p className="text-[13.5px] font-medium text-white">
              Custom Engineering
            </p>
            <p className="mt-1 text-[11.5px] text-neutral-400 leading-snug group-hover:text-neutral-300">
              Dedicated developers & designers for your project.
            </p>
          </NavLink>

          <NavLink
            name="Growth Retainers"
            className="group block rounded-xl bg-[#141414] p-4 border border-white/5 transition-all duration-200 hover:bg-[#1e1e1e] hover:border-white/15"
          >
            <p className="text-[13.5px] font-medium text-white">
              Growth Retainers
            </p>
            <p className="mt-1 text-[11.5px] text-neutral-400 leading-snug group-hover:text-neutral-300">
              Full-service management for software & social media.
            </p>
          </NavLink>
        </div>
      </div>
    </div>
  );
}

type Feature = { name: string; tabs: { label: string; id: string }[] };

function useFeatureSection() {
  const [feature, setFeature] = useState<Feature | null>(null);
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const featureRef = useRef<Feature | null>(null);

  useEffect(() => {
    let ticking = false;
    const check = () => {
      const secs = document.querySelectorAll<HTMLElement>("[data-feature]");
      if (secs.length === 0) {
        if (featureRef.current !== null) {
          featureRef.current = null;
          setFeature(null);
        }
        return;
      }
      let found: Feature | null = null;
      let act = 0;
      secs.forEach((s) => {
        const r = s.getBoundingClientRect();
        if (r.top < 80 && r.bottom > 80) {
          const tabs = (s.dataset["tabs"] || "").split("|").map((p) => {
            const [label, id] = p.split(":");
            return { label: label ?? "", id: id ?? "" };
          });
          found = { name: s.dataset["feature"]!, tabs };
          tabs.forEach((t, i) => {
            const el = document.getElementById(t.id);
            if (el && el.getBoundingClientRect().top < window.innerHeight * 0.5) act = i;
          });
        }
      });

      if (featureRef.current?.name !== found?.name) {
        featureRef.current = found;
        setFeature(found);
      }
      if (activeRef.current !== act) {
        activeRef.current = act;
        setActive(act);
      }
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          check();
          ticking = false;
        });
      }
    };

    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return { feature, active };
}

function PillTabs({ tabs, active }: { tabs: Feature["tabs"]; active: number }) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const [hl, setHl] = useState({ left: 0, width: 0 });
  useEffect(() => {
    const b = refs.current[active];
    if (b) setHl({ left: b.offsetLeft, width: b.offsetWidth });
  }, [active, tabs]);
  return (
    <div className="no-scrollbar relative flex max-w-full overflow-x-auto rounded-full bg-white/10 p-1 backdrop-blur-md">
      <span className="absolute top-1 bottom-1 rounded-full bg-white text-black transition-all duration-500 ease-expo" style={{ left: hl.left, width: hl.width }} />
      {tabs.map((t, i) => (
        <button
          key={t.id}
          ref={(el) => { refs.current[i] = el; }}
          onClick={() => scrollToEl(document.getElementById(t.id))}
          className={`relative z-10 whitespace-nowrap rounded-full px-4 py-1.5 text-xs transition-colors duration-300 ${i === active ? "text-black font-semibold" : "text-white/80 hover:text-white"}`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

export function Header() {
  const [open, setOpen] = useState<MenuKey | null>(null);
  const [mobile, setMobile] = useState(false);
  const [acc, setAcc] = useState<MenuKey | null>(null);
  const { feature, active } = useFeatureSection();
  const ref = useRef<HTMLElement>(null);
  const { user } = useSession();

  // Caret calculation for pointing directly to active menu item
  const [caretLeft, setCaretLeft] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const btnProductsRef = useRef<HTMLButtonElement>(null);

  const getBtn = (k: MenuKey) => {
    return btnProductsRef.current;
  };

  useEffect(() => {
    if (!open) {
      setCaretLeft(null);
      return;
    }
    const updateCaret = () => {
      const btn = getBtn(open);
      const drop = dropdownRef.current;
      if (btn && drop) {
        const btnRect = btn.getBoundingClientRect();
        const dropRect = drop.getBoundingClientRect();
        const center = btnRect.left + btnRect.width / 2 - dropRect.left;
        setCaretLeft(center);
      }
    };
    updateCaret();
    const timer = setTimeout(updateCaret, 30);
    window.addEventListener("resize", updateCaret);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updateCaret);
    };
  }, [open]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(null);
        setMobile(false);
      }
    };
    document.addEventListener("click", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    if (mobile) {
      document.body.style.overflow = "hidden";
      lenisInstance?.stop();
    } else {
      document.body.style.overflow = "";
      lenisInstance?.start();
    }
    return () => {
      document.body.style.overflow = "";
      lenisInstance?.start();
    };
  }, [mobile]);

  const path = useRouterState({ select: (s) => s.location.pathname });
  useEffect(() => {
    setOpen(null);
    setMobile(false);
  }, [path]);

  // Track scroll position to hide black background on homepage until scrolled
  const [top, setTop] = useState(true);
  const topRef = useRef(true);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          const isAtTop = window.scrollY < 20;
          if (isAtTop !== topRef.current) {
            topRef.current = isAtTop;
            setTop(isAtTop);
          }
          ticking = false;
        });
      }
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignOut = async () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("creare_dev_session");
    }
    await supabase.auth.signOut();
  };

  const isHomePage = path === "/";
  const showTransparent = isHomePage && top && !open && !mobile && !feature;

  return (
    <header
      ref={ref}
      className="fixed inset-x-0 top-0 z-50 select-none"
      onMouseLeave={() => setOpen(null)}
    >
      {/* Top Header Bar (Transparent on homepage until scrolled) */}
      <div
        className={`transition-colors duration-300 ${
          showTransparent
            ? "bg-transparent border-b border-transparent text-white"
            : "bg-black text-white border-b border-white/10 shadow-sm"
        }`}
      >
        <div className="relative mx-auto grid h-16 max-w-[1920px] lg:h-20 grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 md:px-8 lg:grid-cols-[1fr_auto_1fr]">
          
          {/* Left: Logo */}
          <div className="relative h-9 min-w-0">
            <Link
              to="/"
              aria-label="Creare Mind home"
              className={`absolute inset-y-0 left-0 flex items-center transition-all duration-500 ease-expo ${
                feature ? "pointer-events-none -translate-y-2 opacity-0" : "opacity-100"
              }`}
            >
              <Logo />
            </Link>
            <div
              className={`absolute inset-y-0 left-0 flex items-center transition-all duration-500 ease-expo ${
                feature ? "opacity-100" : "pointer-events-none translate-y-2 opacity-0"
              }`}
            >
              <span className="label-xs flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-white backdrop-blur-md">
                <LogoMark className="h-4 w-4" /> {feature?.name}
              </span>
            </div>
          </div>

          {/* Center: Nav Items / Pill Tabs */}
          <div className="relative hidden h-10 items-center justify-center lg:flex">
            <nav
              className={`flex items-center gap-1 transition-all duration-500 ease-expo ${
                feature ? "pointer-events-none -translate-y-2 opacity-0" : "opacity-100"
              }`}
              aria-label="Main Navigation"
            >
              {/* PRODUCTS */}
              <button
                ref={btnProductsRef}
                aria-expanded={open === "Products"}
                onMouseEnter={() => setOpen("Products")}
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen(open === "Products" ? null : "Products");
                }}
                className={`flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-medium uppercase tracking-[0.05em] transition-colors ${
                  open === "Products" ? "text-white" : "text-white/80 hover:text-white"
                }`}
              >
                Products
                <ChevronDown
                  className={`h-3 w-3 transition-transform duration-200 ${
                    open === "Products" ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* OUR SERVICES */}
              <Link
                to="/services"
                onMouseEnter={() => setOpen(null)}
                className={`px-3.5 py-2 text-[13px] font-medium uppercase tracking-[0.05em] transition-colors ${
                  path === "/services"
                    ? "text-white font-semibold underline underline-offset-4 decoration-white"
                    : "text-white/80 hover:text-white"
                }`}
              >
                Our Services
              </Link>

              {/* OUR WORKS */}
              <Link
                to="/templates"
                onMouseEnter={() => setOpen(null)}
                className={`px-3.5 py-2 text-[13px] font-medium uppercase tracking-[0.05em] transition-colors ${
                  path === "/templates"
                    ? "text-white font-semibold underline underline-offset-4 decoration-white"
                    : "text-white/80 hover:text-white"
                }`}
              >
                Our Works
              </Link>

              {/* ABOUT */}
              <Link
                to="/about"
                onMouseEnter={() => setOpen(null)}
                className={`px-3.5 py-2 text-[13px] font-medium uppercase tracking-[0.05em] transition-colors ${
                  path === "/about"
                    ? "text-white font-semibold underline underline-offset-4 decoration-white"
                    : "text-white/80 hover:text-white"
                }`}
              >
                About
              </Link>

              {/* CAREER */}
              <Link
                to="/careers"
                onMouseEnter={() => setOpen(null)}
                className={`px-3.5 py-2 text-[13px] font-medium uppercase tracking-[0.05em] transition-colors ${
                  path === "/careers"
                    ? "text-white font-semibold underline underline-offset-4 decoration-white"
                    : "text-white/80 hover:text-white"
                }`}
              >
                Career
              </Link>
            </nav>

            {feature && (
              <div className="absolute inset-0 flex items-center justify-center transition-all duration-500 ease-expo">
                <PillTabs tabs={feature.tabs} active={active} />
              </div>
            )}
          </div>

          {/* Right: Log In / Profile & Get Started */}
          <div className="flex items-center justify-end gap-3 sm:gap-4">
            {!user ? (
              <Link
                to="/auth"
                search={{ redirect: "/services" }}
                className={`hidden text-[13px] font-medium uppercase tracking-[0.04em] text-white/85 transition-colors hover:text-white sm:inline ${
                  feature ? "opacity-0" : ""
                }`}
              >
                Log in
              </Link>
            ) : (
              <Link
                to="/profile"
                className={`group relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white transition-all duration-300 hover:border-white hover:bg-white hover:text-black focus:outline-none ${
                  feature ? "opacity-0 pointer-events-none" : ""
                }`}
                aria-label="View Account Profile"
                title="Account Profile"
              >
                <User className="h-5 w-5 transition-transform group-hover:scale-110" />
              </Link>
            )}

            <Link
              to="/contact"
              className={`rounded-none bg-white px-4 py-2 sm:px-5 sm:py-2.5 text-[12px] sm:text-[13px] font-bold uppercase tracking-[0.06em] text-black transition-all hover:bg-neutral-200 shadow-sm ${
                feature ? "opacity-0 pointer-events-none" : ""
              }`}
            >
              Get Started
            </Link>

            <button
              className="text-white lg:hidden"
              aria-label={mobile ? "Close menu" : "Open menu"}
              onClick={() => setMobile(!mobile)}
            >
              {mobile ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Floating Mega Menu Dropdown */}
      <div
        className={`absolute inset-x-0 top-full pt-3 transition-all duration-200 ease-out hidden lg:block ${
          open && !feature
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-2 pointer-events-none"
        }`}
      >
        <div className="mx-auto flex justify-center px-4">
          <div
            ref={dropdownRef}
            className="relative w-full max-w-[1080px] rounded-2xl bg-black border border-[#222222] p-8 sm:p-9 shadow-[0_30px_90px_rgba(0,0,0,0.85)] text-white"
          >
            {/* Top Caret Pointer pointing directly at active menu item */}
            {caretLeft !== null && (
              <svg
                className="absolute -top-[7px] -translate-x-1/2 text-black transition-all duration-200 ease-out drop-shadow-[0_-1px_0_rgba(255,255,255,0.2)] pointer-events-none"
                style={{ left: `${caretLeft}px` }}
                width="18"
                height="8"
                viewBox="0 0 18 8"
                fill="currentColor"
              >
                <path d="M0 8L9 0L18 8H0Z" />
              </svg>
            )}

            {open && <MegaContent k={open} onClose={() => setOpen(null)} />}
          </div>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      <div
        data-lenis-prevent="true"
        className={`fixed inset-x-0 top-16 bottom-0 z-50 h-[calc(100dvh-4rem)] overflow-y-auto overscroll-contain bg-black text-white px-5 pb-32 transition-all duration-500 ease-expo lg:hidden ${
          mobile ? "visible opacity-100 pointer-events-auto" : "invisible translate-y-3 opacity-0 pointer-events-none"
        }`}
        style={{
          WebkitOverflowScrolling: "touch",
          touchAction: "pan-y",
        }}
      >
        {/* Products Accordion */}
        <div className="border-b border-white/10">
          <button
            className="flex w-full items-center justify-between py-5 text-xl font-medium tracking-tight text-white"
            aria-expanded={acc === "Products"}
            onClick={() => setAcc(acc === "Products" ? null : "Products")}
          >
            Products
            <ChevronDown
              className={`h-5 w-5 transition-transform duration-300 ${
                acc === "Products" ? "rotate-180" : ""
              }`}
            />
          </button>
          <div
            className={`grid transition-all duration-500 ease-expo ${
              acc === "Products" ? "grid-rows-[1fr] pb-6" : "grid-rows-[0fr]"
            }`}
          >
            <div className="overflow-hidden">
              <MegaContent k="Products" onClose={() => setMobile(false)} />
            </div>
          </div>
        </div>

        {/* Our Services */}
        <div className="border-b border-white/10">
          <Link
            to="/services"
            onClick={() => setMobile(false)}
            className="flex w-full items-center justify-between py-5 text-xl font-medium text-white/90 hover:text-white transition-opacity"
          >
            Our Services
          </Link>
        </div>

        {/* Our Works */}
        <div className="border-b border-white/10">
          <Link
            to="/templates"
            onClick={() => setMobile(false)}
            className="flex w-full items-center justify-between py-5 text-xl font-medium text-white/90 hover:text-white transition-opacity"
          >
            Our Works
          </Link>
        </div>

        <div className="border-b border-white/10">
          <Link
            to="/about"
            onClick={() => setMobile(false)}
            className="flex w-full items-center justify-between py-5 text-xl font-medium text-white/90 hover:text-white transition-opacity"
          >
            About
          </Link>
        </div>

        <div className="border-b border-white/10">
          <Link
            to="/careers"
            onClick={() => setMobile(false)}
            className="flex w-full items-center justify-between py-5 text-xl font-medium text-white/90 hover:text-white transition-opacity"
          >
            Career
          </Link>
        </div>

        {user ? (
          <div className="mt-6 space-y-3 border-t border-white/10 pt-4">
            <Link
              to="/profile"
              onClick={() => setMobile(false)}
              className="flex items-center gap-3 py-2 text-lg font-medium text-white hover:opacity-80"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-white/10">
                <User className="h-5 w-5" />
              </div>
              Profile
            </Link>
            <Link
              to="/contact"
              onClick={() => setMobile(false)}
              className="block py-3 text-center text-base font-bold text-black bg-white rounded-none hover:bg-neutral-200 transition-colors"
            >
              Get Started
            </Link>
            <button
              onClick={() => {
                setMobile(false);
                handleSignOut();
              }}
              className="block w-full text-left py-2 text-base text-neutral-400 hover:text-white"
            >
              Sign out
            </button>
          </div>
        ) : (
          <div className="mt-8 flex flex-col gap-3">
            <Link
              to="/auth"
              search={{ redirect: "/services" }}
              onClick={() => setMobile(false)}
              className="block py-3 text-center text-base font-semibold text-white/90 hover:text-white border border-white/20 rounded-none"
            >
              Log in
            </Link>
            <Link
              to="/contact"
              onClick={() => setMobile(false)}
              className="block py-3 text-center text-base font-bold text-black bg-white rounded-none hover:bg-neutral-200 transition-colors"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
