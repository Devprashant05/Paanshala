import JournalClient from "./JournalClient";

export const metadata = {
  title: "Journal — Paan Culture, Traditions & Stories",

  description:
    "Explore the world of paan — traditions, history, recipes, and gifting ideas from Paanshala's journal. Stories rooted in Indian culture, told for the modern reader.",

  keywords: [
    "paan culture blog",
    "history of paan",
    "types of paan India",
    "Indian mouth freshener traditions",
    "paan gifting ideas",
  ],

  alternates: {
    canonical: "https://paanshala.com/journal",
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
    url: "https://paanshala.com/journal",
    siteName: "Paanshala",
    title: "Journal — Paan Culture, Traditions & Stories | Paanshala",
    description:
      "Explore the world of paan — traditions, history, recipes, and gifting ideas from Paanshala's journal.",
    images: [
      {
        url: "https://paanshala.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Paanshala Journal — Paan Culture & Traditions",
      },
    ],
  },
};

export default function JournalPage() {
  return <JournalClient />;
}
