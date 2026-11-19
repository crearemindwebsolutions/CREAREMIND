import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "@/components/site/Hero";
import { Stats } from "@/components/site/Stats";
import { FeatureTabs } from "@/components/site/FeatureTabs";
import { FeatureCards } from "@/components/site/FeatureCards";
import { GetStarted } from "@/components/site/GetStarted";
import { ImageStreamSection } from "@/components/site/ImageStreamSection";
import { Cta } from "@/components/site/Cta";
import { SITE_URL, DEFAULT_OG_IMAGE } from "@/lib/seo";
import { HomeSkeleton } from "@/components/ui/SiteSkeletons";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [{
      name: "google-site-verification",
      content: "wRTHdNxX-yLMpC36K6yeK4lshJUbK0a3TEQ5n_MLXbo",
    },
    { title: "Creare Mind — Software Development & Digital Agency | crearemind.in" },
    {
      name: "description",
      content:
        "Official website of Creare Mind (crearemind.in). We engineer high-velocity custom websites, mobile applications (iOS & Android), shop billing POS systems, video editing, and social media growth.",
    },
    {
      name: "keywords",
      content:
        "Creare Mind, crearemind, crearemind.in, Creare Mind Technologies, software agency, web design company, mobile app developers, shop billing software, POS retail counter, video editing studio, digital marketing India",
    },
    { property: "og:site_name", content: "Creare Mind" },
    { property: "og:title", content: "Creare Mind — Software Development & Digital Agency" },
    {
      property: "og:description",
      content:
        "Official website of Creare Mind (crearemind.in). Custom websites, mobile apps, shop billing POS counters, video editing, and social media management.",
    },
    { property: "og:type", content: "website" },
    { property: "og:url", content: `${SITE_URL}/` },
    { property: "og:image", content: DEFAULT_OG_IMAGE },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "Creare Mind — Software Development & Digital Agency" },
    {
      name: "twitter:description",
      content:
        "Official website of Creare Mind. Custom software, mobile apps, shop billing systems, and creative digital media.",
    },
    { name: "twitter:image", content: DEFAULT_OG_IMAGE },
    ],
    links: [
      { rel: "canonical", href: `${SITE_URL}/` },
    ],
  }),
  component: Index,
  pendingComponent: HomeSkeleton,
});

function Index() {
  return (
    <>
      <main>
        <Hero />
        <Stats />
        <FeatureTabs />
        <FeatureCards />
        <GetStarted />
        <ImageStreamSection />
        <Cta />
      </main>
    </>
  );
}
