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
    const c = track.current?.children[n] as HTMLElement;
    if (c && track.current) {
      track.current.scrollTo({
        left: c.offsetLeft - track.current.offsetLeft,
        behavior: "smooth",
      });
      setActive(n);
    }
  };

  return (
    <section id="feature-cards" className="bg-paper px-4 pb-16 pt-6 text-ink sm:px-5 sm:pb-24 sm:pt-10 md:px-10 md:pb-28">
      <div className="mx-auto max-w-[1560px]">
        <div className="mb-6 sm:mb-10 md:mb-14">
          <h2 className="max-w-3xl text-2xl font-medium leading-[1.18] tracking-tight sm:text-3xl md:text-[42px]">
            {heading}
          </h2>
        </div>

        <div
          ref={track}
          onScroll={(e) => {
            const el = e.currentTarget;
            setActive(
              Math.round(
                (el.scrollLeft / ((el.scrollWidth - el.clientWidth) || 1)) *
                  (items.length - 1)
              )
            );
          }}
          className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3.5 overflow-x-auto px-4 py-2 sm:-mx-5 sm:gap-6 sm:px-5 sm:py-3 md:mx-0 md:px-0 overscroll-x-contain touch-pan-y"
        >
          {items.map((c) => (
            <Link
              to={c.link}
              key={c.t}
              className="group w-[62vw] max-w-[270px] shrink-0 snap-start sm:w-[46%] sm:max-w-none lg:w-[calc(25%-18px)]"
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-[8px] bg-ink transition-all duration-500 ease-expo group-hover:-translate-y-2 group-hover:shadow-2xl sm:aspect-[3/4] isolate">
                <CardMedia poster={c.img} alt={c.t} />
                
                {/* Text inside image at top side */}
                <div className="relative z-10 p-4 sm:p-5 md:p-5">
                  <h3 className="font-['Plus_Jakarta_Sans',Inter,-apple-system,sans-serif] text-[15px] sm:text-[16px] md:text-[17px] font-semibold tracking-[-0.015em] text-white leading-snug">
                    {c.t}
                  </h3>
                  <p className="mt-1.5 sm:mt-2 font-['Plus_Jakarta_Sans',Inter,-apple-system,sans-serif] text-[11.5px] sm:text-[12px] md:text-[12.5px] text-white/85 leading-[1.4] font-normal tracking-normal">
                    {c.d}
                  </p>
                </div>

                {/* Bottom Action Icon */}
                <div className="absolute bottom-3.5 right-3.5 z-10 grid h-8 w-8 place-items-center rounded-full bg-white/20 text-white backdrop-blur-md transition-all duration-300 group-hover:scale-110 group-hover:bg-white group-hover:text-black sm:bottom-5 sm:right-5 sm:h-10 sm:w-10">
                  <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="relative mt-6 sm:mt-10 flex items-center justify-center">
          <div className="flex items-center gap-1.5">
            {items.map((c, i) => (
              <button
                key={c.t}
                aria-label={`Go to ${c.t}`}
                onClick={() => go(i)}
                className={`h-1 rounded-full bg-ink transition-all duration-500 ease-expo ${
                  i === active ? "w-8" : "w-1 opacity-30"
                }`}
              />
            ))}
          </div>
          <div className="absolute right-0 flex gap-2">
            <button
              aria-label="Previous"
              onClick={() => go(active - 1)}
              className="grid h-8 w-8 place-items-center rounded-full border border-ink/20 transition-colors hover:bg-paper-2"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              aria-label="Next"
              onClick={() => go(active + 1)}
              className="grid h-8 w-8 place-items-center rounded-full border border-ink/20 transition-colors hover:bg-paper-2"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
