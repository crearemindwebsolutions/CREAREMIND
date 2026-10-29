import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import Velaris from "@/components/ui/velaris";
import WavyBackground from "@/components/ui/blue-meshy-background";
import { GetStartedLink } from "./GetStartedLink";

export function PageHero({ label, title, sub, img, children }: { label?: string; title: string; sub?: string; img?: string; children?: ReactNode }) {
  return (
    <section className="relative flex min-h-[86vh] items-end overflow-hidden px-5 pb-20 pt-40 md:px-10">
      {img && (
        <div className="absolute inset-[-12%_0]" data-parallax="10">
          <img src={img} alt="" className="h-full w-full object-cover" />
        </div>
      )}
      <div className="scrim absolute inset-0" />
      <div className="relative mx-auto w-full max-w-[1360px]">
        <div data-reveal="stagger" className="max-w-3xl">
          {label && <p className="label-xs mb-5">{label}</p>}
          <h1 className="text-5xl font-medium leading-[1.06] tracking-[-0.03em] md:text-[80px]">{title}</h1>
          {sub && <p className="mt-6 max-w-xl text-lg text-foreground/80">{sub}</p>}
          <div className="mt-10 flex flex-wrap gap-3">
            <GetStartedLink className="btn-solid !px-9 !py-[1.15rem] !text-[14px]">Get Started</GetStartedLink>
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}

export function Split({ title, body, img, flip, light }: { title: string; body: string; img: string; flip?: boolean; light?: boolean }) {
  return (
    <section className={`${light ? "bg-paper text-ink" : "bg-background"} px-5 py-24 md:px-10`}>
      <div className={`mx-auto grid max-w-[1360px] items-center gap-12 md:grid-cols-2 ${flip ? "md:[&>*:first-child]:order-2" : ""}`}>
        <div data-reveal className="overflow-hidden rounded-md">
          <img src={img} alt="" loading="lazy" className="aspect-[4/3] w-full object-cover transition-transform duration-[1200ms] ease-expo hover:scale-105" />
        </div>
        <div data-reveal="stagger">
          <h2 className="text-4xl font-medium leading-[1.05] md:text-5xl">{title}</h2>
          <p data-dim className={`mt-6 max-w-md text-lg ${light ? "text-ink-muted" : "text-muted-foreground"}`}>{body}</p>
          <GetStartedLink className="link-u mt-8 inline-flex items-center gap-2 text-sm font-medium">Get started <ArrowRight className="h-4 w-4" /></GetStartedLink>
        </div>
      </div>
    </section>
  );
}

export function FeatureGrid({ title, items, light = true }: { title: string; items: { t: string; d: string }[]; light?: boolean }) {
  return (
    <section className={`${light ? "bg-paper text-ink" : "bg-background"} px-5 py-24 md:px-10`}>
      <div className="mx-auto max-w-[1360px]">
        <h2 data-reveal className="max-w-xl text-4xl font-medium leading-[1.05] md:text-5xl">{title}</h2>
        <div data-reveal="stagger" className="mt-16 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((i) => (
            <div key={i.t} className={`border-t pt-6 ${light ? "border-ink/15" : ""}`}>
              <p className="text-xl font-medium">{i.t}</p>
              <p className={`mt-3 text-sm ${light ? "text-ink-muted" : "text-muted-foreground"}`}>{i.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ClosingCta({
  title = "Ready to grow your business with Creare Mind?",
  sub = "Websites, mobile apps, shop billing systems & social media growth — built to scale.",
  theme = "blue",
}: {
  title?: string;
  sub?: string;
  theme?: "cream" | "blue";
}) {
  const isCream = theme === "cream";
  return (
    <section className={`relative overflow-hidden ${isCream ? "bg-[#0c0a09]" : "bg-black"} text-white text-center`}>
      <div className={`pointer-events-none absolute inset-0 z-0 ${isCream ? "opacity-75" : "opacity-60"}`}>
        <WavyBackground theme={theme} className="h-full w-full" />
      </div>
      <div className={`pointer-events-none absolute inset-0 z-0 bg-gradient-to-t ${isCream ? "from-[#0c0a09] via-transparent to-[#0c0a09]/50" : "from-black via-transparent to-black/50"}`} />
      <div className={`pointer-events-none absolute inset-0 z-0 ${isCream ? "bg-[radial-gradient(circle_at_center,rgba(245,235,215,0.22)_0%,transparent_75%)]" : "bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.15)_0%,transparent_75%)]"}`} />

      <div data-reveal className="relative z-10 flex min-h-[75vh] md:min-h-[85vh] flex-col items-center justify-center px-5 py-24 text-center">
        <h2 className="mx-auto max-w-2xl text-4xl font-medium leading-[1.08] tracking-[-0.03em] text-white md:text-[64px]">
          {title}
        </h2>
        {sub && (
          <p className="mt-6 text-sm font-medium text-white/80 max-w-xl">
            {sub}
          </p>
        )}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <GetStartedLink className="btn-solid !px-9 !py-[1.15rem] !text-[14px]">
            Start a Project
          </GetStartedLink>
          <Link
            to="/templates"
            className="inline-flex items-center justify-center gap-2 border border-white/50 bg-white/10 text-white backdrop-blur-sm transition-all duration-200 hover:border-white hover:bg-white hover:text-black active:scale-95 !px-9 !py-[1.15rem] !text-[14px] font-semibold uppercase tracking-[0.06em]"
          >
            Explore Our Work
          </Link>
        </div>
      </div>
    </section>
  );
}


