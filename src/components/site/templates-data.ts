import tplFashion from "@/assets/templates/tpl-fashion.jpg";
import tplSaas from "@/assets/templates/tpl-saas.jpg";
import tplAgency from "@/assets/templates/tpl-agency.jpg";
import tplMobile from "@/assets/templates/tpl-mobile.jpg";
import tplPos from "@/assets/templates/tpl-pos.jpg";
import tplMobileApp from "@/assets/templates/tpl-mobile-app.jpg";
import tplAnalyticsChart from "@/assets/templates/tpl-analytics-chart.jpg";
import tplWebDesign from "@/assets/templates/tpl-web-design.jpg";
import tplScreenTemplate from "@/assets/templates/tpl-screen-template.jpg";
import tplCreativeDev from "@/assets/templates/tpl-creative-dev.jpg";
import tplUiSystem from "@/assets/templates/tpl-ui-system.jpg";
import tplBranding from "@/assets/templates/tpl-branding.jpg";
import tplArchitecture from "@/assets/templates/tpl-architecture.jpg";
import tplRealestate from "@/assets/templates/tpl-realestate.jpg";
import tplRestaurant from "@/assets/templates/tpl-restaurant.jpg";
import tplClinic from "@/assets/templates/tpl-clinic.jpg";
import tplEditorial from "@/assets/templates/tpl-editorial.jpg";

export const TEMPLATE_CATEGORIES = [
  "All",
  "Custom Websites",
  "Mobile Apps",
  "Shop Billing POS",
  "Social Media & Video",
  "SaaS & Dashboards",
  "Retail & Commerce",
];

export interface TemplateProject {
  name: string;
  img: string;
  cat: string;
  tagline?: string;
}

export const TEMPLATES: TemplateProject[] = [
  {
    name: "Aura Boutique & Apparel",
    img: tplFashion,
    cat: "Retail & Commerce",
    tagline: "Minimalist luxury e-commerce with seasonal lookbooks & one-click checkout.",
  },
  {
    name: "Flux Cloud Analytics",
    img: tplSaas,
    cat: "SaaS & Dashboards",
    tagline: "Dark-mode metric dashboards with live telemetry, user graphs & KPI widgets.",
  },
  {
    name: "Aether Creative Agency",
    img: tplAgency,
    cat: "Custom Websites",
    tagline: "Editorial Swiss-style design portfolio with high-impact kinetic typography.",
  },
  {
    name: "Nova FinTech & Wallet",
    img: tplMobile,
    cat: "Mobile Apps",
    tagline: "Next-gen iOS crypto & savings mobile app with biometric security.",
  },
  {
    name: "QuickCart Retail POS",
    img: tplPos,
    cat: "Shop Billing POS",
    tagline: "Touchscreen iPad cashier checkout with thermal GST receipt printing.",
  },
  {
    name: "Apex Delivery & Tracking",
    img: tplMobileApp,
    cat: "Mobile Apps",
    tagline: "On-demand dispatch & real-time courier GPS route tracking application.",
  },
  {
    name: "Atlas Executive BI",
    img: tplAnalyticsChart,
    cat: "SaaS & Dashboards",
    tagline: "Multi-branch enterprise revenue reports, tax ledger & sales charts.",
  },
  {
    name: "Studio Kinetic Works",
    img: tplWebDesign,
    cat: "Custom Websites",
    tagline: "Interactive digital studio showcase with micro-animations & case studies.",
  },
  {
    name: "Kumo Social Media Studio",
    img: tplBranding,
    cat: "Social Media & Video",
    tagline: "Instagram growth templates, viral Reels storyboards & creative brand kits.",
  },
  {
    name: "Solene Architectural Studio",
    img: tplArchitecture,
    cat: "Custom Websites",
    tagline: "Clean architectural portfolio featuring residential design projects & blueprints.",
  },
  {
    name: "Borough Artisan Cafe",
    img: tplRestaurant,
    cat: "Retail & Commerce",
    tagline: "Online table reservation, digital QR menu card & local order pickup.",
  },
  {
    name: "Pulse Health & Clinic",
    img: tplClinic,
    cat: "Custom Websites",
    tagline: "Doctor consultation booking, patient medical history & clinic timings.",
  },
  {
    name: "Verve Web System",
    img: tplScreenTemplate,
    cat: "Custom Websites",
    tagline: "Modern responsive web layout with lead inquiry forms and SEO structure.",
  },
  {
    name: "Linden Luxury Estates",
    img: tplRealestate,
    cat: "Retail & Commerce",
    tagline: "Exclusive villa listings with panoramic galleries & interactive inquiry tours.",
  },
  {
    name: "Canvas UI/UX Design Kit",
    img: tplUiSystem,
    cat: "Mobile Apps",
    tagline: "Figma wireframe templates, atomic design systems & interactive prototypes.",
  },
  {
    name: "Kinfolk Editorial Stories",
    img: tplEditorial,
    cat: "Social Media & Video",
    tagline: "Video documentary storyboard, editorial publication & creator showcase.",
  },
  {
    name: "Craft Engineering Lab",
    img: tplCreativeDev,
    cat: "Custom Websites",
    tagline: "Modern full-stack technical agency showcase with client code audits.",
  },
];
