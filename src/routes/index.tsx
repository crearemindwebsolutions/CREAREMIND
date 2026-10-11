import { createFileRoute } from "@tanstack/react-router";
import landscape from "@/assets/landscape.avif.asset.json";
import logo from "@/assets/logo.png.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "crearemind.in — Under Construction" },
      { name: "description", content: "We're under construction. Please check back for an update soon." },
      { property: "og:title", content: "crearemind.in — Under Construction" },
      { property: "og:description", content: "We're under construction. Please check back for an update soon." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="construction-page">
      <img className="construction-landscape" src={landscape.url} alt="" fetchPriority="high" />
      <img className="construction-logo" src={logo.url} alt="Crearemind logo" />
      <h1 className="construction-title">crearemind.in</h1>
      <p className="construction-message">We're under construction. Please check back for an update soon.</p>
    </main>
  );
}
