import CreateYourPaanClient from "./CreateYourPaanClient";

export const metadata = {
  title: "Create Your Own Custom Paan Online",

  description:
    "Build your own paan online - choose your leaf, fillings, and flavors. Paanshala's custom paan builder lets you craft a personalized paan, delivered fresh to your door.",

  keywords: [
    "custom paan online",
    "build your own paan",
    "personalized paan online",
    "make your own paan India",
    "custom paan builder",
    "design your own paan",
  ],

  alternates: {
    canonical: "https://paanshala.com/create-your-paan",
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
    url: "https://paanshala.com/create-your-paan",
    siteName: "Paanshala",
    title: "Create Your Own Custom Paan Online | Paanshala",
    description:
      "Build your own paan online — choose your leaf, fillings, and flavors. Paanshala's custom paan builder lets you craft a personalized paan, delivered fresh to your door.",
    images: [
      {
        url: "https://paanshala.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Paanshala Custom Paan Builder — Create Your Own Paan",
      },
    ],
  },
};

export default function CreateYourPaanPage() {
  return <CreateYourPaanClient />;
}
