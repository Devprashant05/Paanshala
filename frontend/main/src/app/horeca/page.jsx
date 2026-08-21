import HorecaClient from "./HorecaClient";

export const metadata = {
  title: "Bulk Paan Supply for Hotels, Restaurants & Cafes",

  description:
    "Paanshala HORECA — wholesale paan and mouth freshener supply for hotels, restaurants, cafes & banquet halls. Consistent quality, bulk pricing, reliable delivery.",

  keywords: [
    "bulk paan supplier India",
    "paan supply for hotels",
    "wholesale mouth freshener supplier",
    "HORECA paan supplier Delhi NCR",
    "paan supply for restaurants",
    "banquet hall paan supplier",
    "B2B paan wholesale",
  ],

  alternates: {
    canonical: "https://paanshala.com/bulk-order",
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
    url: "https://paanshala.com/bulk-order",
    siteName: "Paanshala",
    title: "Bulk Paan Supply for Hotels, Restaurants & Cafes | Paanshala",
    description:
      "Paanshala HORECA — wholesale paan and mouth freshener supply for hotels, restaurants, cafes & banquet halls. Consistent quality, bulk pricing, reliable delivery.",
    images: [
      {
        url: "https://paanshala.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Paanshala Wholesale Paan Supply for HORECA Businesses",
      },
    ],
  },
};

export default function HorecaPage() {
  return <HorecaClient />;
}
