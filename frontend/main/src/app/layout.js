import { Special_Gothic_Condensed_One, Montserrat } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Toaster } from "react-hot-toast";
import AuthProvider from "@/provider/AuthProvider";
import CartDrawer from "@/components/cart/CartDrawer";
import CheckoutModal from "@/components/checkout/CheckoutModal";
import GuestCheckoutModal from "@/components/checkout/GuestCheckoutModal";
import { GoogleAnalytics } from '@next/third-parties/google';

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
export const metadata = {
  title: "Paanshala | Royal Paan & Gourmet Experiences",
  description:
    "Discover authentic and luxury paan experiences by Paanshala. Crafted with tradition, served with elegance.",
};

// ===============================
// ROOT LAYOUT
// ===============================
export default function RootLayout({ children }) {
  return (
    <html lang="en">
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
