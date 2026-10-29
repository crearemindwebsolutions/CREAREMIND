import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "@/components/site/Hero";
import { Stats } from "@/components/site/Stats";
import { FeatureTabs } from "@/components/site/FeatureTabs";
import { FeatureCards } from "@/components/site/FeatureCards";
import { GetStarted } from "@/components/site/GetStarted";
import { ImageStreamSection } from "@/components/site/ImageStreamSection";
import { Cta } from "@/components/site/Cta";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Creare Mind — Software Development & Digital Agency" },
      {
        name: "description",
        content:
          "We build custom websites, mobile apps, shop billing systems, video editing, and social media management for ambitious businesses.",
      },
      { property: "og:title", content: "Creare Mind — Software Development & Digital Agency" },
      {
        property: "og:description",
        content:
          "We build custom websites, mobile apps, shop billing systems, video editing, and social media management for ambitious businesses.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
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
