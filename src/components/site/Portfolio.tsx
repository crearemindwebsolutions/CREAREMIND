import { Link } from "@tanstack/react-router";
import { GetStartedLink } from "./GetStartedLink";
import pf from "@/assets/portfolio.jpg";
import tpl1 from "@/assets/tpl-1.jpg";
import tpl2 from "@/assets/tpl-2.jpg";
import card1 from "@/assets/card-1.jpg";
import h2 from "@/assets/hero-2.jpg";
import h3 from "@/assets/hero-3.jpg";

const LINKS = ["Templates", "Features", "Marketing", "Selling"];

export function Portfolio() {
  return (
    <section
      data-feature="Portfolio Websites"
      data-tabs="Templates:pf-templates|Features:pf-features|Marketing:pf-marketing|Selling:pf-selling"
      className="bg-warm"
    >
      <div id="pf-templates" className="relative overflow-hidden px-5 pt-40 md:px-12">
        <div className="absolute inset-[-15%_0]" data-parallax="12">
          <img src={pf} alt="Hands typing on a laptop" loading="lazy" className="h-full w-full object-cover" />
        </div>
        <div className="scrim absolute inset-0" />
        <div className="relative mx-auto max-w-3xl text-center">
          <p className="label-xs mb-5">Portfolio Websites</p>
          <h2 className="text-4xl font-medium leading-[1.05] md:text-[56px]">Create a portfolio website that impresses</h2>
          <GetStartedLink className="btn-solid mt-8">Get Started</GetStartedLink>
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {LINKS.map((l) => <a key={l} href="#" className="glass rounded-full px-4 py-2 text-sm transition-colors hover:bg-paper hover:text-ink">{l}</a>)}
          </div>
        </div>
        <div data-rise className="relative mx-auto mt-20 max-w-5xl">
          <div className="rounded-t-2xl border-[10px] border-b-0 border-surface-2 bg-surface-2">
            <div className="aspect-[16/10] overflow-hidden bg-mk-cream text-ink">
              <div data-scroll-content className="will-change-transform">
                {[0].map((k) => (
                  <div key={k}>
                    <div className="flex items-center justify-between px-[5%] py-[3%] text-[clamp(8px,1vw,13px)] tracking-widest">
                      <span className="font-semibold">NIA DESIGN</span>
                      <span className="flex gap-6"><span>WORK</span><span>ABOUT</span><span>CONTACT</span></span>
                    </div>
                    <p className="px-[5%] font-serif text-[clamp(28px,6vw,88px)] leading-none">Nia Design Studio</p>
                    <div className="grid grid-cols-2 gap-[2%] p-[5%]">
                      {[tpl1, tpl2, card1, h2, h3, pf].map((s, i) => <img key={i} src={s} alt="" className="aspect-[4/3] w-full object-cover" />)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="pf-features" className="mx-auto grid max-w-[1280px] gap-6 px-5 py-24 md:grid-cols-2 md:px-12">
        <div data-reveal className="relative grid aspect-square place-items-center overflow-hidden rounded-3xl bg-burgundy">
          <div className="absolute inset-0 opacity-40 [background:repeating-radial-gradient(circle_at_30%_40%,var(--mk-coral)_0_2px,transparent_3px_28px)]" />
          <div className="relative w-3/4 bg-paper p-6 text-ink shadow-2xl">
            <p className="label-xs">Get in touch</p>
            {["Name", "Email", "Message"].map((f) => <div key={f} className="mt-4 border-b border-ink/20 pb-2 text-sm text-ink-muted">{f}</div>)}
            <div className="btn-ink mt-6">Send</div>
          </div>
        </div>
        <div data-reveal className="relative grid aspect-square place-items-center overflow-hidden rounded-3xl bg-taupe">
          <div className="w-3/4 rounded-2xl bg-paper p-6 text-ink shadow-2xl">
            <p className="text-sm font-medium">Write a project description</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {["Paragraph", "Pitch", "Blurb"].map((c, i) => (
                <span key={c} className="rounded-full border border-ink/20 px-3 py-1.5 text-xs" style={{ animation: `pop-in 600ms ${300 + i * 120}ms both cubic-bezier(.34,1.56,.64,1)` }}>{c}</span>
              ))}
            </div>
            <div className="mt-4 space-y-2"><div className="h-2 w-full rounded bg-paper-2" /><div className="h-2 w-4/5 rounded bg-paper-2" /><div className="h-2 w-3/5 rounded bg-paper-2" /></div>
          </div>
        </div>
      </div>

      <div id="pf-marketing" className="mx-auto max-w-3xl px-5 pb-16 text-center">
        <h3 data-reveal className="text-3xl font-medium md:text-5xl">Tools to grow your client list</h3>
        <p data-dim className="mt-5 text-lg text-muted-foreground">Email campaigns, SEO and social integrations help the right people find your work.</p>
      </div>
      <div id="pf-selling" className="mx-auto max-w-3xl px-5 pb-32 text-center">
        <p data-dim className="text-lg text-muted-foreground">Sell prints, services and digital downloads straight from your portfolio.</p>
      </div>
    </section>
  );
}
