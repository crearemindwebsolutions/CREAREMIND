import { useEffect, useRef, useState } from "react";
import DataRain from "@/components/ui/data-rain";

function Count({ to, prefix = "", suffix = "" }: { to: number; prefix?: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [v, setV] = useState(0);
  useEffect(() => {
    const el = ref.current!;
    const io = new IntersectionObserver(([e]) => {
      if (!e?.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const step = (now: number) => {
        const p = Math.min(1, (now - start) / 1800);
        setV(Math.round(to * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, [to]);
  return <span ref={ref}>{prefix}{v}{suffix}</span>;
}

export function Stats() {
  const items = [
    { to: 120, p: "", s: "+", l: "Projects & Apps Delivered", hideOnMobile: false },
    { to: 6, p: "", s: "+", l: "Core Digital Services", hideOnMobile: true },
    { to: 99, p: "", s: "%", l: "Client Satisfaction Rate", hideOnMobile: false },
  ];
  return (
    <section className="relative overflow-hidden bg-black px-5 pt-6 sm:pt-8 md:pt-10 pb-20 md:pb-28">
      {/* Background Data Rain Animation */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
        <DataRain fullscreen={false} className="h-full w-full" flowSpeed={0.9} obstacleRadius={45} count={140} />
        {/* Soft edge blend into surrounding black page flow */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.85)_100%)]" />
      </div>

      <div className="relative z-10">
        <p data-reveal className="mx-auto max-w-xl text-center text-base text-foreground/80">
          Trusted by fast-growing businesses, retail shops, and founders to build software that performs.
        </p>
        <div data-reveal="stagger" className="mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-6 text-center sm:mt-16 sm:gap-12 md:grid-cols-3">
          {items.map((i) => (
            <div key={i.l} className={i.hideOnMobile ? "hidden md:block" : ""}>
              <p className="text-4xl font-normal tracking-tight sm:text-5xl md:text-[64px]">
                <Count to={i.to} prefix={i.p} suffix={i.s} />
              </p>
              <p className="mt-3 text-xs sm:mt-4 sm:text-[13px] text-foreground">{i.l}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
