import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

export let lenisInstance: Lenis | null = null;

export function scrollToEl(el: Element | null, offset = -80) {
  if (!el) return;
  if (lenisInstance) lenisInstance.scrollTo(el as HTMLElement, { offset, duration: 1.2 });
  else el.scrollIntoView({ behavior: "smooth" });
}

/** Lenis smooth scroll + global data-attribute driven GSAP ScrollTrigger animations. */
export function SmoothScroll() {
  const path = useRouterState({ select: (s) => s.location.pathname });

  // Initialize Lenis + GSAP ScrollTrigger ticker integration
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      duration: 0.75,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1.15,
      touchMultiplier: 1.0,
      syncTouch: false,
    });
    lenisInstance = lenis;
    (window as any).__lenis = lenis;

    // 1. Synchronize Lenis scroll position with GSAP ScrollTrigger
    lenis.on("scroll", ScrollTrigger.update);

    // 2. Drive Lenis through GSAP ticker
    const tick = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tick);

    // 3. Graceful lag smoothing so frame drops don't cause stutter
    gsap.ticker.lagSmoothing(500, 33);

    const onHashChange = () => {
      if (window.location.hash) {
        const id = window.location.hash.slice(1);
        const el = document.getElementById(id);
        if (el) {
          lenis.scrollTo(el, { offset: -90, duration: 0.8 });
        }
      }
    };
    window.addEventListener("hashchange", onHashChange);

    return () => {
      window.removeEventListener("hashchange", onHashChange);
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisInstance = null;
    };
  }, []);

  // Set up GSAP ScrollTrigger animations per page/route
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash) {
      const id = window.location.hash.slice(1);
      const el = document.getElementById(id);
      if (el) {
        setTimeout(() => {
          lenisInstance?.scrollTo(el, { offset: -90, immediate: false, duration: 0.8 });
        }, 120);
      }
    } else {
      lenisInstance?.scrollTo(0, { immediate: true });
    }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      if (reduced) return;

      // Top scroll progress indicator
      const progressEl = document.getElementById("scroll-progress");
      if (progressEl) {
        gsap.fromTo(
          progressEl,
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: "none",
            scrollTrigger: {
              start: "top top",
              end: "bottom bottom",
              scrub: 0.2,
            },
          }
        );
      }

      // Section entrance: [data-reveal] & [data-reveal="stagger"] driven by ScrollTrigger
      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
        const isStagger = el.dataset["reveal"] === "stagger";
        const targets = isStagger && el.children.length > 0 ? Array.from(el.children) : [el];
        const rect = el.getBoundingClientRect();
        const inViewOnLoad = rect.top < window.innerHeight * 0.88 && rect.bottom > 0;

        if (inViewOnLoad) {
          gsap.fromTo(
            targets,
            { opacity: 0, y: 22 },
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              stagger: isStagger ? 0.08 : 0,
              ease: "power2.out",
              clearProps: "transform,opacity",
            }
          );
        } else {
          gsap.fromTo(
            targets,
            { opacity: 0, y: 35 },
            {
              opacity: 1,
              y: 0,
              duration: 0.85,
              stagger: isStagger ? 0.08 : 0,
              ease: "power2.out",
              clearProps: "transform,opacity",
              scrollTrigger: {
                trigger: el,
                start: "top 88%",
                once: true,
              },
            }
          );
        }
      });

      // Parallax with smooth inertial scrub: [data-parallax]
      gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
        const s = parseFloat(el.dataset["parallax"] || "12");
        const triggerEl = el.parentElement || el;
        gsap.fromTo(
          el,
          { yPercent: -s },
          {
            yPercent: s,
            ease: "none",
            scrollTrigger: {
              trigger: triggerEl,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.8,
            },
          }
        );
      });

      // Word-by-word reveal: [data-words]
      gsap.utils.toArray<HTMLElement>("[data-words]").forEach((el) => {
        const spans = el.querySelectorAll("span");
        if (spans.length > 0) {
          gsap.fromTo(
            spans,
            { opacity: 0.2, y: 4 },
            {
              opacity: 1,
              y: 0,
              stagger: 0.08,
              ease: "power2.out",
              scrollTrigger: {
                trigger: el,
                start: "top 85%",
                end: "top 40%",
                scrub: 0.8,
              },
            }
          );
        }
      });

      // Dim copy brightening: [data-dim]
      gsap.utils.toArray<HTMLElement>("[data-dim]").forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0.35, y: 12 },
          {
            opacity: 1,
            y: 0,
            ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start: "top 90%",
              end: "top 55%",
              scrub: 0.8,
            },
          }
        );
      });

      // Device & Mockup dramatic rise: [data-rise]
      gsap.utils.toArray<HTMLElement>("[data-rise]").forEach((el) => {
        gsap.fromTo(
          el,
          { y: 160, scale: 0.9, opacity: 0.7 },
          {
            y: 0,
            scale: 1,
            opacity: 1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start: "top bottom",
              end: "top 30%",
              scrub: 1,
            },
          }
        );
      });

      // Image / card zoom scrub: [data-scroll-zoom]
      gsap.utils.toArray<HTMLElement>("[data-scroll-zoom]").forEach((el) => {
        gsap.fromTo(
          el,
          { scale: 1.1 },
          {
            scale: 1,
            ease: "none",
            scrollTrigger: {
              trigger: el.parentElement || el,
              start: "top bottom",
              end: "bottom top",
              scrub: 1,
            },
          }
        );
      });

      // Inner screen content scroll: [data-scroll-content]
      gsap.utils.toArray<HTMLElement>("[data-scroll-content]").forEach((el) => {
        const box = el.parentElement;
        if (!box) return;
        gsap.fromTo(
          el,
          { y: 0 },
          {
            y: () => -(el.scrollHeight - box.clientHeight),
            ease: "none",
            scrollTrigger: {
              trigger: box,
              start: "top 85%",
              end: "bottom top",
              scrub: 0.6,
              invalidateOnRefresh: true,
            },
          }
        );
      });

      // Background theme shift: [data-bg-shift]
      gsap.utils.toArray<HTMLElement>("[data-bg-shift]").forEach((el) => {
        ScrollTrigger.create({
          trigger: el,
          start: "top 72%",
          end: "bottom top",
          onEnter: () => el.classList.add("is-light"),
          onLeaveBack: () => el.classList.remove("is-light"),
          onEnterBack: () => el.classList.add("is-light"),
        });
      });
    });

    // Refresh ScrollTrigger calculations after initial render & web fonts load
    const refreshTimer = window.setTimeout(() => {
      ScrollTrigger.refresh();
    }, 200);

    if (typeof document !== "undefined" && document.fonts?.ready) {
      document.fonts.ready.then(() => {
        ScrollTrigger.refresh();
      });
    }

    return () => {
      window.clearTimeout(refreshTimer);
      ctx.revert();
    };
  }, [path]);

  return (
    <div
      id="scroll-progress"
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[9999] h-[2.5px] w-full origin-left scale-x-0 bg-gradient-to-r from-paper/60 via-paper to-paper/60"
    />
  );
}

export function Words({ text, className }: { text: string; className?: string }) {
  return (
    <span data-words className={className}>
      {text.split(" ").map((w, i) => (
        <span key={i} className="inline-block">{w}&nbsp;</span>
      ))}
    </span>
  );
}
