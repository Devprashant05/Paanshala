import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

// ===============================
// FONTS
// ===============================

// Royal / Luxury headings
const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

// Clean modern body font
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
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
          ${playfair.variable}
          ${inter.variable}
          antialiased
          bg-white
          text-gray-900
        `}
      >
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
