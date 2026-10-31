import ExperiencesClient from "./ExperiencesClient";

export const metadata = {
  title: "Paan Catering for Weddings, Parties & Celebrations",

  description:
    "Live paan counters for weddings, birthdays & private parties. 100+ events hosted, 50K+ guests delighted. Custom flavors, professional staff, FSSAI certified.",

  keywords: [
    "paan catering for weddings",
    "live paan counter for wedding",
    "birthday party paan catering",
    "cocktail party paan counter",
    "theme party paan catering",
    "private party paan service",
    "paan counter booking Delhi NCR",
  ],

  alternates: {
    canonical: "https://paanshala.com/paan-catering",
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
    url: "https://paanshala.com/paan-catering",
    siteName: "Paanshala",
    title: "Paan Catering for Weddings, Parties & Celebrations | Paanshala",
    description:
      "Live paan counters for weddings, birthdays & private parties. 100+ events hosted, 50K+ guests delighted. Custom flavors, professional staff, FSSAI certified.",
    images: [
      {
        url: "https://paanshala.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Paanshala Live Paan Counter for Weddings & Celebrations",
      },
    ],
  },
};

export default function ExperiencesPage() {
  return <ExperiencesClient />;
}
