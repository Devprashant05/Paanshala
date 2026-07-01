import ContactClient from "./ContactClient";

export const metadata = {
  title: "Contact Us & Store Locations",

  description:
    "Visit Paanshala in Mansarover Garden & Punjabi Bagh (Delhi) or Skymark One (Noida). Call, WhatsApp, or find directions to our nearest paan store.",

  keywords: [
    "paan shop near me",
    "paanshala store locations",
    "paan shop Delhi",
    "paan shop Noida",
    "paan shop Punjabi Bagh",
    "paanshala contact number",
  ],

  alternates: {
    canonical: "https://paanshala.com/get-in-touch",
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
    url: "https://paanshala.com/get-in-touch",
    siteName: "Paanshala",
    title: "Contact Us & Store Locations | Paanshala",
    description:
      "Visit Paanshala in Mansarover Garden & Punjabi Bagh (Delhi) or Skymark One (Noida). Call, WhatsApp, or find directions to our nearest paan store.",
    images: [
      {
        url: "https://paanshala.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Paanshala Store Locations — Delhi & Noida",
      },
    ],
  },
};

export default function GetInTouchPage() {
  return <ContactClient />;
}
