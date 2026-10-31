import ServiceLandingClient from "@/components/landing/ServiceLandingClient";
import { BASE_URL, getLandingConfig } from "./data";

/* =========================
   METADATA — shared by every landing page
   (title.template in app/layout.js appends " | Paanshala")
========================= */
export function landingMetadata(service, area) {
  const cfg = getLandingConfig(service, area);
  if (!cfg)
    return { title: "Not found", robots: { index: false, follow: false } };

  return {
    title: cfg.title,
    description: cfg.description,
    // Keep it to the strongest terms; Google ignores the tag but Bing and others still read it.
    keywords: cfg.keywords.slice(0, 12),
    alternates: { canonical: cfg.url },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large" },
    },
    openGraph: {
      type: "website",
      locale: "en_IN",
      url: cfg.url,
      siteName: "Paanshala",
      title: cfg.title,
      description: cfg.description,
      images: [
        {
          url: `${BASE_URL}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: cfg.h1,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: cfg.title,
      description: cfg.description,
      images: [`${BASE_URL}/og-image.jpg`],
    },
  };
}

/* =========================
   SCHEMA — Service + FAQPage + BreadcrumbList
========================= */
function buildSchemas(cfg) {
  const service = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${cfg.url}#service`,
    name: cfg.h1,
    serviceType: cfg.shortName,
    description: cfg.description,
    url: cfg.url,
    provider: { "@type": "Organization", name: "Paanshala", url: BASE_URL },
    areaServed: { "@type": "Place", name: `${cfg.areaName}, India` },
  };

  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: cfg.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const items = [
    { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
    {
      "@type": "ListItem",
      position: 2,
      name: "Experiences",
      item: `${BASE_URL}/experiences`,
    },
  ];
  if (cfg.area !== "delhi") {
    items.push({
      "@type": "ListItem",
      position: 3,
      name: cfg.shortName,
      item: `${BASE_URL}/${cfg.service}`,
    });
    items.push({
      "@type": "ListItem",
      position: 4,
      name: cfg.areaName,
      item: cfg.url,
    });
  } else {
    items.push({
      "@type": "ListItem",
      position: 3,
      name: cfg.shortName,
      item: cfg.url,
    });
  }
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items,
  };

  return [service, faq, breadcrumb];
}

/* =========================
   PAGE — server component, renders JSON-LD + the shared client template
========================= */
export function LandingPage({ service, area }) {
  const cfg = getLandingConfig(service, area);
  if (!cfg) return null;

  return (
    <>
      {buildSchemas(cfg).map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <ServiceLandingClient cfg={cfg} />
    </>
  );
}
