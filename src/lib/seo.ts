/**
 * SEO Constants and JSON-LD Structured Data Schema for Creare Mind
 * Domain: https://crearemind.in
 */

export const SITE_URL = "https://crearemind.in";
export const BRAND_NAME = "Creare Mind";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpg`;

export const SCHEMA_ORGANIZATION = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      "name": BRAND_NAME,
      "alternateName": [
        "CreareMind",
        "Creare Mind Technologies",
        "Creare Mind Agency",
        "Creare Mind Web Solutions",
        "crearemind.in"
      ],
      "url": SITE_URL,
      "logo": `${SITE_URL}/icon-512.png`,
      "image": DEFAULT_OG_IMAGE,
      "description":
        "Creare Mind is a software development and digital agency that builds custom websites, mobile apps, shop billing POS systems, video editing, and social media management for ambitious businesses.",
      "email": "crearemindwebsolutions@gmail.com",
      "telephone": "+916382068495",
      "sameAs": [
        "https://www.instagram.com/crearemind.in",
        "https://www.linkedin.com/company/creare-mind/"
      ],
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "IN"
      },
      "founder": [
        {
          "@type": "Person",
          "name": "Gowthaman",
          "jobTitle": "Founder & Lead Engineer"
        },
        {
          "@type": "Person",
          "name": "Dheepan Raj",
          "jobTitle": "Co-Founder & Head of Operations"
        }
      ]
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      "url": SITE_URL,
      "name": BRAND_NAME,
      "alternateName": "CreareMind",
      "publisher": {
        "@id": `${SITE_URL}/#organization`
      },
      "inLanguage": "en-US"
    },
    {
      "@type": "ProfessionalService",
      "@id": `${SITE_URL}/#service`,
      "name": "Creare Mind — Software Development & Digital Agency",
      "url": SITE_URL,
      "parentOrganization": {
        "@id": `${SITE_URL}/#organization`
      },
      "telephone": "+916382068495",
      "priceRange": "$$",
      "currenciesAccepted": "INR, USD, EUR, GBP",
      "paymentAccepted": "Cash, Credit Card, UPI, Bank Transfer",
      "areaServed": [
        {
          "@type": "Country",
          "name": "India"
        },
        {
          "@type": "AdministrativeArea",
          "name": "Worldwide"
        }
      ],
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Creare Mind Digital & Software Services",
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Custom Website Development",
              "description": "High-performance responsive websites, web applications, and e-commerce stores."
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Mobile Application Development",
              "description": "Native iOS & Android mobile applications engineered for scale and speed."
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Shop Billing & Retail POS Systems",
              "description": "Complete retail counters with barcode scanning, thermal GST receipt printing, and cloud inventory."
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Video Editing & Social Media Management",
              "description": "High-retention reel editing, brand identity, and content strategy for business growth."
            }
          }
        ]
      }
    }
  ]
};

