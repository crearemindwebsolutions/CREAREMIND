import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getMockups } from "./Mockups";
import { CursorZone } from "./CustomCursor";
import { GetStartedLink } from "./GetStartedLink";
import { toast } from "sonner";
import { useSiteContent, DATABASE_HERO_VIDEOS, LEGACY_AI_MEDIA_BLACKLIST } from "@/lib/site-content";

export function Hero() {
  const navigate = useNavigate();
  const { content } = useSiteContent();
  const mockups = getMockups(content.hero?.cards);
  const N = mockups.length;

  const isCleanVideo = (url?: string | null): boolean => {
    if (!url || typeof url !== "string") return false;
    if (url.includes("/__l5e/")) return false;
    if (
      url.includes("hero-v1") ||
      url.includes("hero-v2") ||
      url.includes("hero-v3") ||
      url.includes("hero-1") ||
      url.includes("hero-2") ||
      url.includes("hero-3") ||
      url.includes("hero-library")
    ) return false;
    for (const bad of LEGACY_AI_MEDIA_BLACKLIST) {
      if (url.includes(bad)) return false;
    }
    return true;
  };

  const vidsList = (content.hero?.videos || []).filter(isCleanVideo);
  const vids = vidsList.length > 0 ? vidsList : DATABASE_HERO_VIDEOS;
  const [idx, setIdx] = useState(0);
  const textRef = useRef<HTMLDivElement>(null);
  const carRef = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLElement>(null);
  const drag = useRef<number | null>(null);

  const [isVisible, setIsVisible] = useState(true);

  const go = (d: number) => setIdx((i) => (i + d + N) % N);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      setIsVisible(!!entry?.isIntersecting);
    }, { rootMargin: "100px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    const t = setInterval(() => go(1), 5000);
    return () => clearInterval(t);
  }, [idx, isVisible]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      if (textRef.current) {
        gsap.to(textRef.current, {
          y: -40,
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "bottom top",
            scrub: 0.8,
          },
        });
      }

      if (carRef.current) {
        gsap.to(carRef.current, {
          y: -25,
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "bottom top",
            scrub: 0.8,
          },
        });
      }
    }, root);

    return () => ctx.revert();
  }, []);

  const bgIdx = idx % vids.length;
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    videoRefs.current.forEach((v, i) => {
      if (!v) return;
      if (isVisible && i === bgIdx) {
        v.play().catch(() => {});
      } else {
        v.pause();
      }
    });
  }, [bgIdx, isVisible]);

  return (
    <section
      ref={root}
      className="relative overflow-hidden pt-16 bg-[#07080a]"
      style={{ backgroundColor: "#07080a" }}
      aria-label="Introduction"
    >
      {/* Background crossfade */}
      <div className="absolute inset-0 bg-[#07080a]" style={{ backgroundColor: "#07080a" }} aria-hidden>
        {vids.map((url, i) => {
          const isActive = i === bgIdx;
          const shouldLoad = isActive || i === (bgIdx + 1) % vids.length;
          return (
            <div
              key={i}
              data-active={isActive ? "true" : "false"}
              style={{
                opacity: isActive ? 1 : 0,
                pointerEvents: isActive ? "auto" : "none",
                transition: "opacity 1200ms ease-in-out",
              }}
              className={`absolute inset-0 transition-opacity duration-[1200ms] ease-in-out ${
                isActive ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
            >
              {shouldLoad && (
                <video
                  ref={(el) => {
                    videoRefs.current[i] = el;
                  }}
                  data-hero-video
                  data-active={isActive ? "true" : "false"}
                  style={{ opacity: isActive ? 1 : 0 }}
                  src={url}
                  autoPlay={isActive}
                  muted
                  loop
                  playsInline
                  preload={isActive ? "auto" : "metadata"}
                  className="h-full w-full object-cover"
                />
              )}
            </div>
          );
        })}
        <div className="scrim absolute inset-0" />
      </div>

      {/* Top Headline, Button, and Subtitle matching reference */}
      <div ref={textRef} className="relative z-10 flex flex-col items-center px-4 pt-16 sm:pt-20 md:pt-24 text-center">
        <h1 className="max-w-[14ch] text-[38px] sm:text-[54px] md:text-[68px] lg:text-[76px] font-medium leading-[1.02] tracking-[-0.035em] text-white">
          {content.hero?.heading || (
            <>
              We build apps,<br />sites & software
            </>
          )}
        </h1>
        <div className="mt-6 sm:mt-7 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <GetStartedLink className="btn-solid !h-[48px] !w-[190px] sm:!w-[200px] !px-0 !py-0 !text-[13px] sm:!text-[14px] font-semibold tracking-wider">
            Get Started
          </GetStartedLink>
          <Link
            to="/services"
            className="inline-flex h-[48px] w-[190px] sm:w-[200px] items-center justify-center border border-white/30 bg-white/10 text-[13px] sm:text-[14px] font-semibold uppercase tracking-wider text-white backdrop-blur-sm transition-all hover:bg-white hover:text-ink active:scale-95"
          >
            Our Services
          </Link>
          <Link
            to="/templates"
            className="inline-flex h-[48px] w-[190px] sm:w-[200px] items-center justify-center border border-white/30 bg-white/10 text-[13px] sm:text-[14px] font-semibold uppercase tracking-wider text-white backdrop-blur-sm transition-all hover:bg-white hover:text-ink active:scale-95"
          >
            Our Works
          </Link>
        </div>
      </div>

      {/* Main Hero Slider Carousel */}
      <div ref={carRef} className="relative z-10 w-full mt-12 sm:mt-16 md:mt-20 lg:mt-24 pb-12 sm:pb-16">
        <CursorZone
          getLabel={(x, w, t) => (t.closest("[data-center]") ? null : x < w / 2 ? "Previous" : "Next")}
          onZoneClick={(l) => l && go(l === "Next" ? 1 : -1)}
        >
          <div
            className="relative mx-auto aspect-[16/9] w-[84vw] sm:w-[70vw] md:w-[52vw] lg:w-[48vw] max-w-[800px] touch-pan-y select-none [perspective:1500px]"
            onPointerDown={(e) => { drag.current = e.clientX; }}
            onPointerUp={(e) => {
              if (drag.current === null) return;
              const d = e.clientX - drag.current;
              drag.current = null;
              if (Math.abs(d) > 50) go(d < 0 ? 1 : -1);
            }}
            role="region"
            aria-roledescription="carousel"
            aria-label="Website examples"
          >
            {mockups.map((m, i) => {
              let off = i - idx;
              if (off > N / 2) off -= N;
              if (off < -N / 2) off += N;

              let transform = "";
              let transformOrigin = "center center";
              let zIndex = 0;
              let opacity = 0;
              let filter = "none";

              if (off === 0) {
                // Front and center card (elevated, flat, prominent)
                transform = "translateX(0%) translateY(0%) scale(1) rotateY(0deg)";
                transformOrigin = "center center";
                zIndex = 30;
                opacity = 1;
                filter = "brightness(1)";
              } else if (off === -1) {
                // Left card: exact 24px gap, upright with 3D perspective
                transform = "translateX(calc(-100% - 24px)) translateY(0%) scale(0.94) rotateY(-6deg)";
                transformOrigin = "right center";
                zIndex = 10;
                opacity = 0.92;
                filter = "brightness(0.82)";
              } else if (off === 1) {
                // Right card: exact 24px gap, upright with 3D perspective
                transform = "translateX(calc(100% + 24px)) translateY(0%) scale(0.94) rotateY(6deg)";
                transformOrigin = "left center";
                zIndex = 10;
                opacity = 0.92;
                filter = "brightness(0.82)";
              } else {
                // Offscreen cards
                const dir = Math.sign(off) || 1;
                transform = `translateX(${dir * 220}%) translateY(0%) scale(0.75) rotateY(0deg)`;
                zIndex = 0;
                opacity = 0;
                filter = "brightness(0.6)";
              }

              return (
                <div
                  key={m.name}
                  data-center={off === 0 ? "" : undefined}
                  aria-hidden={off !== 0}
                  className={`absolute inset-0 overflow-hidden rounded-[8px] isolate transition-all duration-[750ms] ease-out ${
                    off === 0
                      ? "shadow-[0_25px_70px_rgba(0,0,0,0.65)] border border-white/20 ring-1 ring-black/10"
                      : "shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10"
                  }`}
                  style={{
                    transform,
                    transformOrigin,
                    opacity,
                    filter,
                    zIndex,
                  }}
                >
                  {m.el}
                  {/* Subtle darkening overlay for side cards */}
                  <div
                    className={`absolute inset-0 pointer-events-none transition-opacity duration-[750ms] ${
                      off === 0 ? "opacity-0" : "opacity-100 bg-black/15"
                    }`}
                  />
                </div>
              );
            })}
          </div>
        </CursorZone>
      </div>
    </section>
  );
}

