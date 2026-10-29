import { useState, useEffect, useRef, useCallback, type MouseEvent as ReactMouseEvent } from "react";
import { Play, Pause, ChevronLeft, ChevronRight } from "lucide-react";

// ============================================================================
// CONFIGURATION CONSTANTS (Easily tweak the feel and timings of the slider)
// ============================================================================
export const SLIDER_CONFIG = {
  autoplayDelay: 4000, // ms between auto slides
  transitionDuration: 1000, // ms card translation/animation duration
  bgCrossfadeDuration: 800, // ms background crossfade duration
  sideCardScale: 0.82, // scale of adjacent side cards (0.8 - 0.85)
  sideCardOpacity: 0.62, // opacity of adjacent side cards (~0.6)
  tiltAngle: 10, // degrees of 3D rotateY toward center (8 - 12deg)
  perspective: 1600, // 3D perspective depth in pixels
  swipeThreshold: 45, // drag pixels to trigger slide change
  taglineText: "Websites, mobile apps, shop billing & video editing — built for ambitious businesses.",
  supportingText: "Join ambitious brands and entrepreneurs who scale with Creare Mind.",
};

// ============================================================================
// DATA DRIVEN SLIDES
// ============================================================================
export interface HeroSlide {
  id: string;
  cardImage: string;
  backgroundImage: string;
  title: string;
  alt: string;
  category?: string;
  badge?: string;
}

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: "slide-1",
    cardImage: "/hero/card-1.jpg",
    backgroundImage: "/hero/bg-1.jpg",
    title: "Aether Agency & Editorial Showcase",
    alt: "Aether agency editorial digital website mockup",
    category: "Custom Websites",
    badge: "Agency & Design",
  },
  {
    id: "slide-2",
    cardImage: "/hero/card-2.jpg",
    backgroundImage: "/hero/bg-2.jpg",
    title: "Hyperdrive Streetwear & Sneaker Lab",
    alt: "Hyperdrive urban streetwear eCommerce store mockup",
    category: "Retail & Commerce",
    badge: "eCommerce Store",
  },
  {
    id: "slide-3",
    cardImage: "/hero/card-3.jpg",
    backgroundImage: "/hero/bg-3.jpg",
    title: "Amber & Ash Artisan Coffee Roasters",
    alt: "Amber and Ash single origin coffee subscription shop",
    category: "eCommerce Store",
    badge: "Subscription Shop",
  },
  {
    id: "slide-4",
    cardImage: "/hero/card-4.jpg",
    backgroundImage: "/hero/bg-4.jpg",
    title: "Solis High Fine Jewelry Lookbook",
    alt: "Solis diamond and gemstone jewelry boutique website",
    category: "Luxury Showcase",
    badge: "Lookbook",
  },
  {
    id: "slide-5",
    cardImage: "/hero/card-5.jpg",
    backgroundImage: "/hero/bg-5.jpg",
    title: "Chronos Swiss Horology & Watchmaker",
    alt: "Chronos automatic titanium timepieces web experience",
    category: "Brand & Commerce",
    badge: "Horology",
  },
  {
    id: "slide-6",
    cardImage: "/hero/card-6.jpg",
    backgroundImage: "/hero/bg-6.jpg",
    title: "Luminuxe Botanical Skincare Studio",
    alt: "Luminuxe organic skincare and wellness storefront",
    category: "Wellness & Beauty",
    badge: "Skincare",
  },
];

interface HeroSliderProps {
  slides?: HeroSlide[];
  tagline?: string;
  supportingText?: string;
}

export function HeroSlider({
  slides = HERO_SLIDES,
  tagline = SLIDER_CONFIG.taglineText,
  supportingText = SLIDER_CONFIG.supportingText,
}: HeroSliderProps) {
  const [current, setCurrent] = useState(0);
  const [isPausedManually, setIsPausedManually] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isTabVisible, setIsTabVisible] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [progress, setProgress] = useState(0);

  // Custom Lerp Cursor Pill State
  const [cursorZone, setCursorZone] = useState<"left" | "right" | null>(null);
  const prevZoneRef = useRef<"left" | "right" | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);
  const mouseTarget = useRef({ x: 0, y: 0 });
  const mousePos = useRef({ x: 0, y: 0 });
  const dragStart = useRef<number | null>(null);

  const total = slides.length;

  const goTo = useCallback(
    (index: number) => {
      setCurrent((index + total) % total);
      setProgress(0);
    },
    [total]
  );

  const goNext = useCallback(() => goTo(current + 1), [current, goTo]);
  const goPrev = useCallback(() => goTo(current - 1), [current, goTo]);

  // 1. Accessibility: Check for prefers-reduced-motion
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Responsive mobile detector
  useEffect(() => {
    if (typeof window === "undefined") return;
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // 2. Preload first 2 slides' images
  useEffect(() => {
    if (typeof window === "undefined") return;
    slides.slice(0, 2).forEach((slide) => {
      const bgImg = new Image();
      bgImg.src = slide.backgroundImage;
      const cardImg = new Image();
      cardImg.src = slide.cardImage;
    });
  }, [slides]);

  // 3. Tab visibility listener
  useEffect(() => {
    if (typeof document === "undefined") return;
    const handleVisibilityChange = () => {
      setIsTabVisible(document.visibilityState === "visible");
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // 4. Autoplay Timer & Progress Bar Animation
  const isPlaying =
    !isPausedManually && !isHovered && isTabVisible && !prefersReducedMotion;

  useEffect(() => {
    if (!isPlaying) {
      return;
    }

    const intervalStep = 50; // update progress every 50ms
    const totalSteps = SLIDER_CONFIG.autoplayDelay / intervalStep;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          goNext();
          return 0;
        }
        return prev + 100 / totalSteps;
      });
    }, intervalStep);

    return () => clearInterval(timer);
  }, [isPlaying, goNext]);

  // 5. Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        goPrev();
      } else if (e.key === "ArrowRight") {
        goNext();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goNext, goPrev]);

  // 6. Lerp Cursor Animation loop
  useEffect(() => {
    if (!cursorZone || isMobile || typeof window === "undefined") return;
    let raf = 0;
    const loop = () => {
      mousePos.current.x += (mouseTarget.current.x - mousePos.current.x) * 0.18;
      mousePos.current.y += (mouseTarget.current.y - mousePos.current.y) * 0.18;
      if (pillRef.current) {
        pillRef.current.style.transform = `translate3d(${mousePos.current.x}px, ${mousePos.current.y}px, 0) translate(-50%, -50%)`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [cursorZone, isMobile]);

  const handleMouseMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (!trackRef.current || isMobile) return;
    const rect = trackRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    mouseTarget.current = { x, y };

    const targetEl = e.target as HTMLElement;
    if (targetEl.closest("[data-active-card]")) {
      setCursorZone(null);
      prevZoneRef.current = null;
    } else if (x < rect.width / 2) {
      if (!prevZoneRef.current) {
        mousePos.current = { x, y };
      }
      setCursorZone("left");
      prevZoneRef.current = "left";
    } else {
      if (!prevZoneRef.current) {
        mousePos.current = { x, y };
      }
      setCursorZone("right");
      prevZoneRef.current = "right";
    }
  };

  const handleMouseLeave = () => {
    setCursorZone(null);
    prevZoneRef.current = null;
    setIsHovered(false);
  };

  return (
    <section
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured website mockups showcase"
      className="relative flex h-[100dvh] h-screen min-h-[600px] w-full flex-col justify-between overflow-hidden bg-black text-white select-none"
    >
      {/* ================================================================= */}
      {/* 1. FULL-BLEED MOODY BACKGROUND PHOTO CROSSFADE WITH ZOOM         */}
      {/* ================================================================= */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-black" aria-hidden="true">
        {slides.map((slide, i) => {
          const isActive = i === current;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity ease-in-out ${
                isActive ? "opacity-100 z-1" : "opacity-0 z-0 pointer-events-none"
              }`}
              style={{ transitionDuration: `${SLIDER_CONFIG.bgCrossfadeDuration}ms` }}
            >
              <img
                src={slide.backgroundImage}
                alt=""
                className={`h-full w-full object-cover transition-transform duration-[4000ms] ease-out ${
                  isActive && !prefersReducedMotion ? "scale-[1.06]" : "scale-100"
                }`}
                loading={i < 2 ? "eager" : "lazy"}
              />
            </div>
          );
        })}

        {/* Cinematic Vignette Overlays: Dark wash + Gradient fading to pure black at bottom */}
        <div className="absolute inset-0 bg-black/55 backdrop-brightness-[0.85]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black" />
      </div>

      {/* ================================================================= */}
      {/* 2. TOP SECTION: TAGLINE UNDER THE TRANSPARENT NAVBAR              */}
      {/* ================================================================= */}
      <div className="relative z-10 mx-auto w-full max-w-5xl px-5 pt-20 sm:pt-24 md:pt-28 text-center">
        <p className="inline-block text-[11px] sm:text-xs md:text-sm font-semibold tracking-wider text-white/80 uppercase">
          {tagline}
        </p>
      </div>

      {/* ================================================================= */}
      {/* 3. MIDDLE CAROUSEL TRACK: 3D SLIDING MOCKUP CARDS                */}
      {/* ================================================================= */}
      <div
        ref={trackRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        onPointerDown={(e) => {
          dragStart.current = e.clientX;
        }}
        onPointerUp={(e) => {
          if (dragStart.current === null) return;
          const delta = e.clientX - dragStart.current;
          dragStart.current = null;
          if (Math.abs(delta) > SLIDER_CONFIG.swipeThreshold) {
            if (delta < 0) goNext();
            else goPrev();
          } else if (cursorZone) {
            if (cursorZone === "right") goNext();
            else if (cursorZone === "left") goPrev();
          }
        }}
        className={`relative z-20 my-auto flex w-full items-center justify-center py-2 sm:py-4 ${
          cursorZone && !isMobile ? "md:cursor-none" : ""
        }`}
      >
        {/* Custom Lerp Cursor Pill (Desktop Only) */}
        {!isMobile && (
          <div
            ref={pillRef}
            aria-hidden="true"
            className="pointer-events-none absolute left-0 top-0 z-50 hidden md:block"
          >
            <div
              className={`flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-bold tracking-wider text-black uppercase shadow-2xl transition-opacity duration-200 ${
                cursorZone ? "opacity-100 scale-100" : "opacity-0 scale-75"
              }`}
            >
              {cursorZone === "left" ? (
                <>
                  <ChevronLeft className="h-3.5 w-3.5 stroke-[3]" />
                  Prev
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="h-3.5 w-3.5 stroke-[3]" />
                </>
              )}
            </div>
          </div>
        )}

        {/* Cards Stage Container */}
        <div
          className="relative mx-auto aspect-[16/10] w-[85vw] sm:w-[75vw] md:w-[56vw] lg:w-[54vw] max-w-[960px] touch-pan-y"
          style={{ perspective: `${SLIDER_CONFIG.perspective}px` }}
        >
          {slides.map((slide, i) => {
            let offset = i - current;
            if (offset > total / 2) offset -= total;
            if (offset < -total / 2) offset += total;

            const isCenter = offset === 0;
            const isLeft = offset === -1;
            const isRight = offset === 1;

            let transform = "";
            let opacity = 0;
            let zIndex = 0;

            if (isCenter) {
              transform = "translateX(0%) scale(1) rotateY(0deg)";
              opacity = 1;
              zIndex = 30;
            } else if (isLeft) {
              // Left Card: tilted toward center with clean visible gap and edge peek
              const tilt = prefersReducedMotion ? 0 : SLIDER_CONFIG.tiltAngle;
              if (isMobile) {
                transform = `translateX(calc(-100% + 18px)) scale(${SLIDER_CONFIG.sideCardScale}) rotateY(${tilt * 0.6}deg)`;
              } else {
                transform = `translateX(calc(-100% - clamp(20px, 3.5vw, 48px))) scale(${SLIDER_CONFIG.sideCardScale}) rotateY(${tilt}deg)`;
              }
              opacity = SLIDER_CONFIG.sideCardOpacity;
              zIndex = 10;
            } else if (isRight) {
              // Right Card: tilted toward center with clean visible gap and edge peek
              const tilt = prefersReducedMotion ? 0 : -SLIDER_CONFIG.tiltAngle;
              if (isMobile) {
                transform = `translateX(calc(100% - 18px)) scale(${SLIDER_CONFIG.sideCardScale}) rotateY(${tilt * 0.6}deg)`;
              } else {
                transform = `translateX(calc(100% + clamp(20px, 3.5vw, 48px))) scale(${SLIDER_CONFIG.sideCardScale}) rotateY(${tilt}deg)`;
              }
              opacity = SLIDER_CONFIG.sideCardOpacity;
              zIndex = 10;
            } else {
              // Other Offscreen Cards
              const dir = Math.sign(offset) || 1;
              transform = `translateX(${dir * 240}%) scale(0.7) rotateY(0deg)`;
              opacity = 0;
              zIndex = 0;
            }

            return (
              <div
                key={slide.id}
                data-active-card={isCenter ? "" : undefined}
                aria-hidden={!isCenter}
                onClick={() => {
                  if (isLeft) goPrev();
                  else if (isRight) goNext();
                }}
                className={`absolute inset-0 overflow-hidden rounded-[8px] isolate transition-all ease-out will-change-transform ${
                  isCenter
                    ? "cursor-default shadow-[0_30px_90px_rgba(0,0,0,0.85)] border border-white/20 ring-1 ring-white/10"
                    : "cursor-pointer shadow-[0_20px_50px_rgba(0,0,0,0.6)] border border-white/10 hover:opacity-80"
                }`}
                style={{
                  transform,
                  opacity,
                  zIndex,
                  transitionDuration: `${SLIDER_CONFIG.transitionDuration}ms`,
                  transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              >
                {/* Website Mockup Image */}
                <img
                  src={slide.cardImage}
                  alt={slide.alt}
                  className="h-full w-full object-cover"
                  loading={Math.abs(offset) <= 1 ? "eager" : "lazy"}
                  draggable={false}
                />

                {/* Side Card Darkening Overlay */}
                <div
                  className={`absolute inset-0 bg-black/40 transition-opacity duration-700 pointer-events-none ${
                    isCenter ? "opacity-0" : "opacity-100"
                  }`}
                />

                {/* Subtle Card Header / Glass Badge */}
                {slide.badge && (
                  <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 text-[10px] sm:text-xs font-semibold text-white/90 backdrop-blur-md border border-white/10 shadow-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {slide.badge}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ================================================================= */}
      {/* 4. BOTTOM SECTION: SUPPORTING TEXT, CONTROLS & PAGINATION        */}
      {/* ================================================================= */}
      <div className="relative z-20 flex flex-col items-center pb-6 sm:pb-8">
        {/* Supporting Line */}
        <p className="px-5 text-center text-xs sm:text-sm font-medium tracking-wide text-white/70">
          {supportingText}
        </p>

        {/* Navigation Dots & Accessibility Controls */}
        <div className="mt-4 flex items-center gap-4">
          {/* Pause / Play Accessible Button */}
          <button
            type="button"
            onClick={() => setIsPausedManually((prev) => !prev)}
            aria-label={isPausedManually ? "Play slideshow" : "Pause slideshow"}
            className="grid h-7 w-7 place-items-center rounded-full border border-white/20 bg-white/10 text-white/80 transition-all hover:bg-white hover:text-black hover:border-white focus:outline-none focus:ring-2 focus:ring-white"
          >
            {isPausedManually ? (
              <Play className="h-3 w-3 fill-current ml-0.5" />
            ) : (
              <Pause className="h-3 w-3 fill-current" />
            )}
          </button>

          {/* Pagination Dots with Min 24px Hit Area */}
          <div className="flex items-center gap-1.5" role="tablist" aria-label="Slides pagination">
            {slides.map((slide, i) => {
              const isActive = i === current;
              return (
                <button
                  key={slide.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-label={`Go to slide ${i + 1} of ${total}: ${slide.title}`}
                  onClick={() => goTo(i)}
                  className="flex h-7 w-7 items-center justify-center focus:outline-none focus:ring-2 focus:ring-white rounded-full"
                >
                  <span
                    className={`h-1.5 rounded-full transition-all duration-500 ease-out ${
                      isActive ? "w-6 bg-white shadow-sm" : "w-1.5 bg-white/40 hover:bg-white/70"
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Current Slide Number Counter */}
          <span className="text-[11px] font-medium text-white/50 tracking-wider">
            {current + 1} / {total}
          </span>
        </div>

        {/* Optional Thin Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/10" aria-hidden="true">
          <div
            className="h-full bg-white/70 transition-all duration-75 ease-linear"
            style={{ width: `${isPlaying ? progress : 0}%` }}
          />
        </div>
      </div>
    </section>
  );
}
