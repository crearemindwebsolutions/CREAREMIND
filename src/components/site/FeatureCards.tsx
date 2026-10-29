import { useRef, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useSiteContent } from "@/lib/site-content";
import { AdaptiveMedia } from "@/components/ui/adaptive-media";

// Matching premium showcase photos for each core service
import tplAgency from "@/assets/templates/tpl-agency.jpg"; // Modern Website & Web Applications
import tplMobile from "@/assets/templates/tpl-mobile.jpg"; // Native iOS & Android Mobile Apps
import tplPos from "@/assets/templates/tpl-pos.jpg"; // Retail boutique POS terminal & thermal receipt billing
import tplFashion from "@/assets/templates/tpl-fashion.jpg"; // Social media creator branding & performance analytics
import tplCreativeDev from "@/assets/templates/tpl-creative-dev.jpg"; // Cinematic video editing & production

interface FeatureCardItem {
  id?: string;
  t: string;
  d: string;
  img: string;
  link: string;
}

function CardMedia({ poster, alt }: { poster: string; alt: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden rounded-[inherit] bg-ink">
      <AdaptiveMedia
        src={poster}
        alt={alt}
        className="h-full w-full object-cover transition-transform duration-700 ease-expo group-hover:scale-105"
      />
    </div>
  );
}

const CARDS: FeatureCardItem[] = [
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
    img: tplCreativeDev,
    link: "/services#video-editing",
  },
];

export function FeatureCards() {
  const { content } = useSiteContent();
  const items = content.featureCards?.items?.length ? content.featureCards.items : CARDS;
  const heading = content.featureCards?.heading || "Everything your business needs to grow";

  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const go = (i: number) => {
    const n = Math.max(0, Math.min(items.length - 1, i));
    const container = track.current;
    if (container && container.children[n]) {
      const targetChild = container.children[n] as HTMLElement;
      container.scrollTo({
        left: targetChild.offsetLeft - container.offsetLeft,
        behavior: "smooth",
      });
      setActive(n);
    }
  };

  const handleScroll = () => {
    const el = track.current;
    if (!el || !el.children.length) return;
    const scrollLeft = el.scrollLeft;
    let closestIndex = 0;
    let minDistance = Infinity;

    Array.from(el.children).forEach((child, idx) => {
      const childLeft = (child as HTMLElement).offsetLeft - el.offsetLeft;
      const distance = Math.abs(childLeft - scrollLeft);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = idx;
      }
    });

    setActive(closestIndex);
  };

  return (
    <section id="feature-cards" className="bg-paper px-4 pb-16 pt-8 text-ink sm:px-6 sm:pb-24 sm:pt-12 md:px-10 md:pb-28">
      <div className="mx-auto max-w-[1560px]">
        <div className="mb-6 sm:mb-10 md:mb-12">
          <h2 className="max-w-3xl text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl md:text-[40px] leading-[1.15]">
            {heading}
          </h2>
        </div>

        {/* Scrollable Cards Track with native touch swiping enabled */}
        <div
          ref={track}
          data-lenis-prevent="true"
          onScroll={handleScroll}
          className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 py-2 sm:-mx-6 sm:gap-6 sm:px-6 sm:py-3 md:mx-0 md:px-0 overscroll-x-contain scroll-smooth"
          style={{
            WebkitOverflowScrolling: "touch",
            touchAction: "pan-x pan-y",
          }}
        >
          {items.map((c) => (
            <Link
              to={c.link}
              key={c.t}
              className="group w-[82vw] max-w-[340px] shrink-0 snap-start sm:w-[46%] sm:max-w-none lg:w-[calc(25%-18px)] cursor-pointer"
            >
              <div className="relative aspect-[3/4] sm:aspect-[3/4] overflow-hidden rounded-2xl bg-neutral-950 shadow-md transition-all duration-500 ease-expo group-hover:-translate-y-2 group-hover:shadow-2xl border border-black/10 group-hover:border-black/25 isolate">
                <CardMedia poster={c.img} alt={c.t} />
                
                {/* Sleek Top Vignette for High Title Contrast */}
                <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/85 via-black/35 to-transparent z-1 pointer-events-none" />

                {/* Clean Title Only - Paragraph Removed */}
                <div className="relative z-10 p-5 sm:p-6">
                  <h3 className="font-['Plus_Jakarta_Sans',Inter,-apple-system,sans-serif] text-[18px] sm:text-[19px] md:text-[20px] font-bold tracking-[-0.015em] text-white leading-tight drop-shadow-sm">
                    {c.t}
                  </h3>
                </div>

                {/* Bottom Action Icon */}
                <div className="absolute bottom-4 right-4 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/20 text-white backdrop-blur-md transition-all duration-300 group-hover:scale-110 group-hover:bg-white group-hover:text-black sm:bottom-5 sm:right-5 sm:h-10 sm:w-10">
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Carousel Dots & Controls */}
        <div className="relative mt-6 sm:mt-10 flex items-center justify-between sm:justify-center">
          <div className="flex items-center gap-1.5">
            {items.map((c, i) => (
              <button
                key={c.t}
                aria-label={`Go to ${c.t}`}
                onClick={() => go(i)}
                className={`h-1.5 rounded-full bg-ink transition-all duration-500 ease-expo cursor-pointer ${
                  i === active ? "w-8 bg-neutral-900" : "w-1.5 opacity-30 hover:opacity-60"
                }`}
              />
            ))}
          </div>
          <div className="flex sm:absolute sm:right-0 gap-2">
            <button
              aria-label="Previous card"
              onClick={() => go(active - 1)}
              disabled={active === 0}
              className="grid h-8 w-8 sm:h-9 sm:w-9 place-items-center rounded-full border border-neutral-300 bg-white shadow-xs transition-all hover:bg-neutral-100 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4 text-neutral-800" />
            </button>
            <button
              aria-label="Next card"
              onClick={() => go(active + 1)}
              disabled={active === items.length - 1}
              className="grid h-8 w-8 sm:h-9 sm:w-9 place-items-center rounded-full border border-neutral-300 bg-white shadow-xs transition-all hover:bg-neutral-100 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
            >
              <ChevronRight className="h-4 w-4 text-neutral-800" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
