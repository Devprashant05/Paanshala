import { Special_Gothic_Condensed_One, Montserrat } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Toaster } from "react-hot-toast";
import AuthProvider from "@/provider/AuthProvider";
import CartDrawer from "@/components/cart/CartDrawer";
import CheckoutModal from "@/components/checkout/CheckoutModal";
import GuestCheckoutModal from "@/components/checkout/GuestCheckoutModal";
import { GoogleAnalytics, GoogleTagManager } from '@next/third-parties/google';
import { organizationSchema } from "@/lib/schema/organization";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const specialGothicCondensedOne = Special_Gothic_Condensed_One({
  variable: "--font-special-gothic-condensed-one",
  subsets: ["latin"],
  weight: ["400"],
});

// ===============================
// METADATA
// ===============================
// ===============================
// METADATA — Homepage
// ===============================
export const metadata = {
  metadataBase: new URL("https://paanshala.com"),

  title: {
    default: "Paanshala | Buy Premium Paan Online | Delhi NCR",
    template: "%s | Paanshala",
  },

  description:
    "Order authentic, luxury paan online from Paanshala. Signature, Meetha & Fire Paan crafted fresh. Free shipping over ₹500. Visit us in Delhi, Punjabi Bagh & Noida.",

  keywords: [
    "buy paan online",
    "premium paan online India",
    "paan shop Delhi NCR",
    "luxury paan gifts",
    "meetha paan online",
    "order paan online Delhi",
    "order paan online Noida",
    "best paan brand India",
  ],

  // ===============================
  // CANONICAL — prevents duplicate-content issues from
  // trailing slashes, www/non-www, or query params reaching Google
  // ===============================
  alternates: {
    canonical: "https://paanshala.com",
  },

  // ===============================
  // ROBOTS — explicit, don't rely on defaults
  // ===============================
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://paanshala.com",
    siteName: "Paanshala",
    title: "Paanshala | Buy Premium Paan Online | Delhi NCR",
    description:
      "Order authentic, luxury paan online from Paanshala. Signature, Meetha & Fire Paan crafted fresh. Free shipping over ₹500. Delhi, Punjabi Bagh & Noida.",
    images: [
      {
        url: "https://paanshala.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Paanshala — Premium Indian Paan & Gourmet Mouth Fresheners",
      },
    ],
  },

  // ===============================
  // TWITTER / X CARD
  // ===============================
  twitter: {
    card: "summary_large_image",
    title: "Paanshala | Buy Premium Paan Online | Delhi NCR",
    description:
      "Order authentic, luxury paan online from Paanshala. Signature, Meetha & Fire Paan crafted fresh.",
    images: ["https://paanshala.com/og-image.jpg"], // TODO: same OG image or a Twitter-specific crop
    site: "@paanshala", // confirm this matches your actual X handle
  },

  // ===============================
  // ICONS — confirm these files actually exist in /public,
  // otherwise browsers/search results fall back to a blank favicon
  // ===============================
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },

  verification: {
    // google: "",   // only needed if using meta-tag verification method instead of/in addition to DNS
    // other: { "msvalidate.01": "" }, // Bing meta-tag verification, if not already verified via GSC import
  },

  // ===============================
  // CATEGORY — helps some platforms/aggregators classify the site
  // ===============================
  category: "Food & Beverage",
};

// ===============================
// ROOT LAYOUT
// ===============================
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Organization + WebSite + multi-location Store schema — site-wide */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
      </head>
      <body
        className={`
          ${specialGothicCondensedOne.variable}
          ${montserrat.variable}
          antialiased
          bg-white
          text-gray-900
        `}
        suppressHydrationWarning
      >
        <GoogleTagManager gtmId="GTM-WDW8WC3Z" />
        <Navbar />
        {/* <NewNavbar /> */}

        <main className="min-h-screen bg-linear-to-b from-white to-gray-50">
          <AuthProvider>{children}</AuthProvider>
        </main>

        <Footer />
        <Toaster position="top-right" />
        <CartDrawer />
        <CheckoutModal />
        <GuestCheckoutModal />
        <GoogleAnalytics gaId="G-DG2W618LQJ" />
      </body>
    </html>
  );
}
