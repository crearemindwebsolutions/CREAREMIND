import { Link } from "@tanstack/react-router";
import WavyBackground from "@/components/ui/blue-meshy-background";
import { GetStartedLink } from "./GetStartedLink";

/** Animated GLSL luxury cream wave background behind the closing call to action on the homepage. */
export function Cta() {
  return (
    <section className="relative overflow-hidden bg-[#0c0a09] text-white text-center">
      {/* Animated GLSL luxury cream wave background behind the closing call to action. */}
      <div className="pointer-events-none absolute inset-0 z-0 opacity-80">
        <WavyBackground theme="cream" className="h-full w-full" />
      </div>
      <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-t from-[#0c0a09] via-transparent to-[#0c0a09]/50" />
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(245,235,215,0.24)_0%,transparent_75%)]" />

      <div data-reveal className="relative z-10 flex min-h-[80vh] md:min-h-[90vh] flex-col items-center justify-center px-5 py-24 text-center">
        <h2 className="mx-auto max-w-2xl text-4xl font-medium leading-[1.08] tracking-[-0.03em] text-white md:text-[64px]">
          Ready to build your next software project?
        </h2>
        <p className="mt-6 text-sm font-medium text-white/80 max-w-xl">
          Websites, mobile apps, shop billing systems & social media growth — built to scale.
        </p>
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
