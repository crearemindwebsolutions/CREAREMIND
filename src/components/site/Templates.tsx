import { ArrowRight } from "lucide-react";
import tpl1 from "@/assets/tpl-1.jpg";
import tpl2 from "@/assets/tpl-2.jpg";
import h1 from "@/assets/hero-1.jpg";

function Card({ name, children, tall }: { name: string; children: React.ReactNode; tall?: boolean }) {
  return (
    <a href="#" className={`group relative block overflow-hidden rounded-[8px] isolate ${tall ? "aspect-[4/5]" : "aspect-[4/3]"}`}>
      <div className="absolute inset-0 transition-transform duration-[900ms] ease-expo group-hover:scale-[1.04]">{children}</div>
      <span className="label-xs absolute left-5 top-5 flex items-center gap-2 rounded-full bg-paper px-3 py-1.5 text-ink">
        {name} <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" />
      </span>
      <span className="absolute bottom-5 left-5 translate-y-2 rounded bg-ink/80 px-2 py-1 text-[11px] text-paper opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
        crearemind.site/{name.toLowerCase().replace(/[^a-z]/g, "")}
      </span>
    </a>
  );
}

export function Templates() {
  return (
    <section className="bg-background px-5 py-28 md:px-12">
      <div data-reveal className="mx-auto mb-14 max-w-[1280px]">
        <h2 className="text-4xl font-medium md:text-5xl">Start with a template</h2>
      </div>
      <div data-reveal="stagger" className="mx-auto grid max-w-[1280px] gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <Card name="Myhra" tall><img src={tpl1} alt="Woman working at laptop" loading="lazy" className="h-full w-full object-cover" /></Card>
          <Card name="Bergen">
            <div className="relative h-full">
              <img src={tpl2} alt="Calm living room" loading="lazy" className="h-full w-full object-cover" />
              <p className="absolute bottom-10 left-6 right-6 font-serif text-2xl leading-tight text-ink md:text-3xl">Creating spaces that are comfortable, memorable and inspiring.</p>
            </div>
          </Card>
        </div>
        <div className="space-y-6 md:pt-24">
          <Card name="Nolan & Co.">
            <div className="flex h-full flex-col justify-end bg-surface p-8">
              <p className="label-xs text-muted-foreground">Digital product agency</p>
              <p className="mt-3 text-4xl font-semibold leading-none text-foreground md:text-5xl">We build products people love.</p>
            </div>
          </Card>
          <Card name="Meriden Coaching" tall>
            <div className="grid h-full grid-rows-[1fr_1fr] bg-mk-coral">
              <p className="p-8 pt-20 font-serif text-4xl leading-none text-paper md:text-5xl">Meriden Coaching</p>
              <img src={h1} alt="" loading="lazy" className="h-full w-full object-cover" />
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
