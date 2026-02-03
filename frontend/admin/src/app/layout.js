import { Poppins, Rubik } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/providers/AuthProvider";
import { Toaster } from "react-hot-toast";

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});

const rubik = Rubik({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-rubik",
  display: "swap",
});

export const metadata = {
  title: "Paanshala Admin",
  description: "Paanshala Admin Panel",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} ${rubik.variable} font-sans antialiased min-h-screen flex flex-col`}
      >
        {/* App Content */}
        <AuthProvider>
          <main className="flex-1">{children}</main>
        </AuthProvider>

        {/* Footer */}
        <footer className="w-full border-t border-black/5 bg-white/90 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 py-3 text-center text-xs text-gray-500">
            © {new Date().getFullYear()} Paanshala · Designed & Developed by{" "}
            <a
              href="https://aleczo.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[#12351a] hover:underline"
            >
              Aleczo Media Pvt. Ltd.
            </a>
          </div>
        </footer>

        <Toaster position="top-right" />
      </body>
    </html>
  );
}
