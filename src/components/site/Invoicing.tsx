import { Link } from "@tanstack/react-router";
import { Check, Phone } from "lucide-react";
import inv from "@/assets/invoicing.jpg";
import { Words } from "./SmoothScroll";
import { GetStartedLink } from "./GetStartedLink";

export function Invoicing() {
  return (
    <section data-feature="Invoicing" data-tabs="Invoices:inv-invoices|Client Management:inv-clients|Mobile App:inv-mobile" className="bg-warm">
      <div id="inv-invoices" className="relative flex min-h-[100vh] items-end overflow-hidden px-5 pb-20 pt-40 md:px-12">
        <div className="absolute inset-[-15%_0]" data-parallax="10">
          <img src={inv} alt="Lamp and ceramics on a shelf" loading="lazy" className="h-full w-full object-cover" />
        </div>
        <div className="scrim absolute inset-0" />
        <div className="relative max-w-3xl">
          <p className="label-xs mb-5">Invoicing</p>
          <h2 className="text-4xl font-medium leading-[1.05] md:text-[56px]">
            <Words text="Grow your client business on a single platform" />
          </h2>
          <GetStartedLink className="btn-solid mt-8">Get Started</GetStartedLink>
        </div>
      </div>

      <div id="inv-clients" className="mx-auto max-w-[1280px] px-5 py-24 md:px-12 md:py-32">
        <div className="grid gap-8 md:grid-cols-2">
          <h3 data-reveal className="text-3xl font-medium md:text-5xl">Run your client business on the go</h3>
          <p data-dim className="text-lg text-muted-foreground md:pt-3">
            Send proposals, track projects and collect payments from a single dashboard—wherever your clients are.
          </p>
        </div>
        <div id="inv-mobile" data-reveal="stagger" className="mt-16 grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl bg-taupe p-8 text-ink md:p-12">
            <h4 className="text-2xl font-medium">Invoice from anywhere</h4>
            <div className="mt-8 space-y-3 rounded-2xl bg-paper p-5 shadow-xl">
              {["Include tax", "Allow partial payments", "Send reminder in 7 days"].map((l, i) => (
                <label key={l} className="flex items-center gap-3 text-sm">
                  <span className={`grid h-5 w-5 place-items-center rounded ${i < 2 ? "bg-ink text-paper" : "border border-ink/30"}`}>{i < 2 && <Check className="h-3 w-3" />}</span>
                  {l}
                </label>
              ))}
            </div>
          </div>
          <div className="rounded-3xl bg-taupe-2 p-8 text-ink md:p-12">
            <h4 className="text-2xl font-medium">Share Pay Links</h4>
            <div className="mt-8 rounded-2xl bg-paper p-5 shadow-xl">
              <p className="font-medium">Maya Okafor</p>
              <p className="mt-1 flex items-center gap-2 text-sm text-ink-muted"><Phone className="h-3.5 w-3.5" /> (555) 014-2290</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {["Consultation", "Styling", "Follow-up"].map((s) => <span key={s} className="rounded-full bg-paper-2 px-3 py-1 text-xs">{s}</span>)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
