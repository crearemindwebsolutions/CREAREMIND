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
      const isMobile = window.innerWidth < 640;
      const targetLeft = isMobile
        ? targetChild.offsetLeft - (container.clientWidth - targetChild.offsetWidth) / 2
        : targetChild.offsetLeft - container.offsetLeft;

      container.scrollTo({
        left: targetLeft,
        behavior: "smooth",
      });
      setActive(n);
    }
  };

  const handleScroll = () => {
    const el = track.current;
    if (!el || !el.children.length) return;
    const isMobile = window.innerWidth < 640;
    let closestIndex = 0;
    let minDistance = Infinity;

    if (isMobile) {
      const center = el.scrollLeft + el.clientWidth / 2;
      Array.from(el.children).forEach((child, idx) => {
        const childCenter = (child as HTMLElement).offsetLeft + (child as HTMLElement).offsetWidth / 2;
        const distance = Math.abs(childCenter - center);
        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = idx;
        }
      });
    } else {
      const scrollLeft = el.scrollLeft;
      Array.from(el.children).forEach((child, idx) => {
        const childLeft = (child as HTMLElement).offsetLeft - el.offsetLeft;
        const distance = Math.abs(childLeft - scrollLeft);
        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = idx;
        }
      });
    }

    setActive(closestIndex);
  };

  const isSwiping = useRef(false);
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    isSwiping.current = false;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!touchStartPos.current) return;
    const dx = Math.abs(e.touches[0].clientX - touchStartPos.current.x);
    if (dx > 8) {
      isSwiping.current = true;
    }
  };

  const onTouchEnd = () => {
    touchStartPos.current = null;
  };

  const handleLinkClick = (e: React.MouseEvent) => {
    if (isSwiping.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <section id="feature-cards" className="bg-paper px-0 sm:px-5 pb-16 pt-6 text-ink sm:pb-24 sm:pt-10 md:px-10 md:pb-28">
      <div className="mx-auto max-w-[1560px]">
        <div className="px-4 sm:px-0 mb-6 sm:mb-10 md:mb-14">
          <h2 className="max-w-3xl text-2xl font-medium leading-[1.18] tracking-tight sm:text-3xl md:text-[42px]">
            {heading}
          </h2>
        </div>

        {/* Scrollable Cards Track - Smooth touch swipe on mobile, clean scroll on desktop */}
        <div
          ref={track}
          onScroll={handleScroll}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          className="no-scrollbar flex snap-x snap-mandatory gap-3.5 sm:gap-6 overflow-x-auto px-[8vw] sm:px-0 py-2 sm:py-3"
          style={{
            WebkitOverflowScrolling: "touch",
            overscrollBehaviorY: "auto",
            overscrollBehaviorX: "contain",
          }}
        >
          {items.map((c) => (
            <Link
              to={c.link}
              key={c.t}
              onClick={handleLinkClick}
              className="group w-[84vw] max-w-[340px] shrink-0 snap-center sm:snap-start sm:w-[46%] sm:max-w-none lg:w-[calc(25%-18px)] cursor-pointer"
            >
              <div className="relative aspect-[4/5] sm:aspect-[3/4] overflow-hidden rounded-2xl md:rounded-[8px] bg-neutral-950 shadow-md transition-all duration-500 ease-expo group-hover:-translate-y-2 group-hover:shadow-2xl border border-black/10 group-hover:border-black/25 isolate">
                <CardMedia poster={c.img} alt={c.t} />
                
                {/* Mobile top gradient for title legibility */}
                <div className="md:hidden absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/85 via-black/35 to-transparent z-1 pointer-events-none" />

                {/* Text: Title always visible; Paragraph hidden on mobile, visible on laptop/desktop */}
                <div className="relative z-10 p-5 sm:p-5 md:p-5">
                  <h3 className="font-['Plus_Jakarta_Sans',Inter,-apple-system,sans-serif] text-[17px] sm:text-[16px] md:text-[17px] font-semibold tracking-[-0.015em] text-white leading-snug drop-shadow-sm md:drop-shadow-none">
                    {c.t}
                  </h3>
                  {/* Paragraph shown only on laptop/desktop (md+), hidden on mobile */}
                  <p className="hidden md:block mt-1.5 sm:mt-2 font-['Plus_Jakarta_Sans',Inter,-apple-system,sans-serif] text-[11.5px] sm:text-[12px] md:text-[12.5px] text-white/85 leading-[1.4] font-normal tracking-normal">
                    {c.d}
                  </p>
                </div>

                {/* Bottom Action Icon */}
                <div className="absolute bottom-3.5 right-3.5 z-10 grid h-8 w-8 place-items-center rounded-full bg-white/20 text-white backdrop-blur-md transition-all duration-300 group-hover:scale-110 group-hover:bg-white group-hover:text-black sm:bottom-5 sm:right-5 sm:h-10 sm:w-10">
                  <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Carousel Dots & Controls */}
        <div className="px-4 sm:px-0 relative mt-6 sm:mt-10 flex items-center justify-between md:justify-center">
          <div className="flex items-center gap-1.5">
            {items.map((c, i) => (
              <button
                key={c.t}
                aria-label={`Go to ${c.t}`}
                onClick={() => go(i)}
                className={`h-1.5 md:h-1 rounded-full bg-ink transition-all duration-500 ease-expo cursor-pointer ${
                  i === active ? "w-8 bg-neutral-900" : "w-1.5 md:w-1 opacity-30 hover:opacity-60"
                }`}
              />
            ))}
          </div>
          <div className="flex md:absolute md:right-0 gap-2">
            <button
              aria-label="Previous"
              onClick={() => go(active - 1)}
              disabled={active === 0}
              className="grid h-8 w-8 sm:h-9 sm:w-9 place-items-center rounded-full border border-ink/20 transition-all hover:bg-paper-2 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              aria-label="Next"
              onClick={() => go(active + 1)}
              disabled={active === items.length - 1}
              className="grid h-8 w-8 sm:h-9 sm:w-9 place-items-center rounded-full border border-ink/20 transition-all hover:bg-paper-2 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
