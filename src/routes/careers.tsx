import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/careers")({
  head: () => ({
    meta: [
      { title: "Careers & Opportunities — Under Development | Creare Mind" },
      {
        name: "description",
        content:
          "Careers & Opportunities Under Development — Creare Mind. We are preparing to roll out both full-time professional positions and paid, hands-on student internships.",
      },
      {
        property: "og:title",
        content: "Careers & Opportunities — Under Development | Creare Mind",
      },
      {
        property: "og:description",
        content: "Careers & Opportunities Under Development — Creare Mind.",
      },
    ],
  }),
  component: CareersUnderDevelopmentPage,
});

export function CareersUnderDevelopmentPage() {
  return (
    <div className="relative flex min-h-[85vh] w-full items-center justify-center bg-[#FAF8F5] text-ink px-5 py-24 sm:py-32 overflow-hidden">
      {/* Subtle ambient luxury glow orbs */}
      <div className="pointer-events-none absolute -top-32 -right-32 h-[450px] w-[450px] rounded-full bg-gradient-to-br from-[#FDE8DF]/50 via-[#F7DED4]/25 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 h-[450px] w-[450px] rounded-full bg-gradient-to-tr from-[#EBE6DD]/50 via-[#F3ECE1]/25 to-transparent blur-3xl" />

      <div data-reveal className="relative z-10 mx-auto max-w-2xl text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-medium tracking-tight text-neutral-900 leading-[1.1]">
          Careers &amp; Opportunities
          <span className="block font-serif italic font-normal text-neutral-500 text-3xl sm:text-4xl md:text-5xl mt-2">
            Under Development
          </span>
        </h1>

        <div className="mt-8 space-y-4 text-base sm:text-lg text-neutral-600 leading-relaxed font-normal">
          <p>
            We are actively engineering our official career and talent application portal to welcome
            ambitious engineers, UI/UX designers, video creators, and strategic thinkers into the
            Creare Mind studio.
          </p>
          <p className="text-sm sm:text-base text-neutral-600/90 leading-relaxed">
            As our client roster grows across high-velocity custom web platforms, retail POS billing
            hardware ecosystems, and branded social media channels, we are preparing to roll out
            both <strong className="font-semibold text-neutral-900">full-time professional positions</strong> and{" "}
            <strong className="font-semibold text-neutral-900">paid, hands-on student internships</strong> with
            direct mentorship from our core engineering and leadership team.
          </p>
        </div>
      </div>
    </div>
  );
}
