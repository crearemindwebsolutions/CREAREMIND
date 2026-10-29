import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, useMemo } from "react";
import { ArrowRight } from "lucide-react";
import { useSession } from "@/hooks/use-session";
import { useSiteContent, DEFAULT_SITE_CONTENT } from "@/lib/site-content";
import { TEMPLATES } from "@/components/site/templates-data";
import { AdaptiveMedia } from "@/components/ui/adaptive-media";

function Thumbs({ items, cols = 3 }: { items: string[]; cols?: number }) {
  // Partition items across columns so each column shows distinct current templates
  const columns = useMemo(() => {
    return Array.from({ length: cols }).map((_, colIdx) => {
      // Pick items interleaved by column
      const colItems = items.filter((_, idx) => idx % cols === colIdx);
      const baseList = colItems.length >= 2 ? colItems : items;
      // Exactly double the items so translateY(-50%) loops seamlessly
      return [...baseList, ...baseList];
    });
  }, [items, cols]);

  return (
    <div className="absolute inset-0 grid gap-2 p-2" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
      {columns.map((list, c) => (
        <div key={c} className="overflow-hidden">
          <div
            className="anim-scroll-up space-y-2"
            style={{
              animationDuration: `${24 + c * 6}s`,
              animationDirection: c % 2 ? "reverse" : "normal",
            }}
          >
            {list.map((src, i) => (
              <div
                key={i}
                className="aspect-[4/3] w-full rounded overflow-hidden bg-neutral-900/10 shadow-xs border border-white/5"
              >
                <AdaptiveMedia
                  src={src}
                  alt="Current Template Preview"
                  loading="lazy"
                  className="size-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function GetStarted() {
  const { user } = useSession();
  const { content } = useSiteContent();
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Dynamically resolve current templates: prioritize admin changes & active template datasets
  const currentTemplates = useMemo(() => {
    const images: string[] = [];
    const seen = new Set<string>();

    const addImage = (src?: string) => {
      if (!src || typeof src !== "string") return;
      const clean = src.trim();
      if (!clean || seen.has(clean)) return;
      seen.add(clean);
      images.push(clean);
    };

    // 1. Templates from dynamic admin / localStorage site content
    if (content.templates?.items?.length) {
      for (const t of content.templates.items) {
        addImage(t.img);
      }
    }

    // 2. Templates defined in templates-data
    for (const t of TEMPLATES) {
      addImage(t.img);
    }

    // 3. Fallback to default site content templates
    if (DEFAULT_SITE_CONTENT.templates?.items?.length) {
      for (const t of DEFAULT_SITE_CONTENT.templates.items) {
        addImage(t.img);
      }
    }

    return images;
  }, [content.templates?.items]);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(!!entry?.isIntersecting);
      },
      { rootMargin: "200px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className={`relative overflow-hidden bg-[linear-gradient(180deg,var(--paper)_0%,var(--taupe)_35%,var(--warm)_70%,var(--background)_100%)] px-5 pb-32 pt-24 ${isVisible ? "" : "paused"}`}>
      <div data-reveal className="mx-auto max-w-2xl text-center text-ink">
        <span className="mx-auto mb-6 flex w-fit items-end gap-1" aria-hidden><span className="h-4 w-4 rounded-full bg-ink" /><span className="h-2.5 w-2.5 rounded-full bg-ink" /></span>
        <h2 className="text-3xl font-medium leading-[1.05] md:text-[44px]">Partnering with us is simple & transparent</h2>
      </div>
      <div data-reveal="stagger" className="mx-auto mt-16 grid max-w-[900px] gap-10 md:grid-cols-2">
        {[
          { label: "Custom Engineering & Scope", d: "Tell us what you want to build and get an architectural estimate, timeline, and quote.", cta: "Start a project", to: "/contact", search: undefined, cols: 1 },
          { label: "Our Delivered Work & Services", d: "Explore our client apps, websites, shop billing systems, and creative media.", cta: "Explore our work", to: "/templates", search: undefined, cols: 3 },
        ].map((c) => (
          <Link key={c.label} to={c.to} search={c.search} className="group overflow-hidden rounded-md bg-background text-foreground">
            <div className="relative h-72 overflow-hidden">
              {c.cols === 1 ? (
                <div className="absolute inset-0 flex flex-col justify-start gap-4 p-6">
                  <div className="flex items-center gap-2 rounded-xl bg-surface-2 px-5 py-4 text-2xl"><span className="flex items-end gap-1"><span className="h-5 w-5 rounded-full bg-foreground" /><span className="h-3 w-3 rounded-full bg-foreground" /></span>Creare Scope</div>
                  {["Web & Mobile App", "Shop Billing POS", "Full-Stack Team"].map((q, i) => (
                    <span key={q} className="w-fit rounded-full border px-4 py-2 text-sm text-muted-foreground" style={{ animation: `pop-in 600ms ${300 + i * 150}ms both cubic-bezier(.34,1.56,.64,1)` }}>{q}</span>
                  ))}
                </div>
              ) : <Thumbs items={currentTemplates} />}
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent" />
            </div>
            <div className="px-8 pb-10 text-center">
              <p className="text-xs text-muted-foreground">{c.label}</p>
              <p className="mx-auto mt-4 max-w-xs text-sm text-muted-foreground">{c.d}</p>
              <p className="mt-4 inline-flex items-center gap-2 text-lg font-medium">{c.cta} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
