import AboutClient from "./AboutClient";

export const metadata = {
  title: "Our Story",

  description:
    "From a single vision in 2022 to India's fastest-growing premium paan brand — 100,000+ customers, 450,000+ paans crafted, and a legacy of tradition reimagined.",

  keywords: [
    "Paanshala story",
    "history of paan brand India",
    "premium paan brand India",
    "Banarasi paan tradition",
    "about Paanshala",
  ],

  alternates: {
    canonical: "https://paanshala.com/our-story",
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
    url: "https://paanshala.com/our-story",
    siteName: "Paanshala",
    title: "Our Story | Paanshala",
    description:
      "From a single vision in 2022 to India's fastest-growing premium paan brand — 100,000+ customers, 450,000+ paans crafted, and a legacy of tradition reimagined.",
    images: [
      {
        url: "https://paanshala.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Paanshala — Our Story, Since 2022",
      },
    ],
  },
};

export default function AboutPage() {
  return <AboutClient />;
}
