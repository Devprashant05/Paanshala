const BASE_URL = "https://paanshala.com";

export const metadata = {
  title: "Buy Paan Online | Premium Paan & Mouth Fresheners",

  description:
    "Shop the full Paanshala collection — Signature Paan, Meetha Paan, Fire Paan, Chocolate Paan, digestives & gift boxes. Fresh, authentic, delivered across Delhi NCR.",

  keywords: [
    "buy paan online",
    "premium paan online India",
    "meetha paan online",
    "fire paan online",
    "chocolate paan online",
    "mouth freshener online",
    "digestive candy online",
    "paan gift box online",
  ],

  alternates: {
    canonical: `${BASE_URL}/shop`,
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },

  openGraph: {
    type: "website",
    locale: "en_IN",
    url: `${BASE_URL}/shop`,
    siteName: "Paanshala",
    title: "Buy Paan Online | Premium Paan & Mouth Fresheners | Paanshala",
    description:
      "Shop the full Paanshala collection — Signature Paan, Meetha Paan, Fire Paan, Chocolate Paan, digestives & gift boxes. Fresh, authentic, delivered across Delhi NCR.",
    images: [
      {
        url: `${BASE_URL}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "Paanshala — Shop All Products",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Buy Paan Online | Premium Paan & Mouth Fresheners | Paanshala",
    description:
      "Shop the full Paanshala collection — Signature Paan, Meetha Paan, Fire Paan, Chocolate Paan, digestives & gift boxes.",
    images: [`${BASE_URL}/og-image.jpg`],
  },
};

/* =========================
   SCHEMA — CollectionPage + BreadcrumbList
   No dynamic slug here, so this is static (unlike collections/[slug]
   which needed generateMetadata + a per-category fetch).
========================= */
const schema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      "@id": `${BASE_URL}/shop#collectionpage`,
      name: "Buy Paan Online | Paanshala",
      url: `${BASE_URL}/shop`,
      isPartOf: { "@id": `${BASE_URL}/#website` },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
        {
          "@type": "ListItem",
          position: 2,
          name: "Shop",
          item: `${BASE_URL}/shop`,
        },
      ],
    },
  ],
};

export default function ShopLayout({ children }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      {children}
    </>
  );
}
