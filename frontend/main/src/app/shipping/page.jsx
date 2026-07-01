import ShippingClient from "./ShippingClient";

export const metadata = {
  title: "Shipping & Delivery Policy",

  description:
    "Paanshala delivery timelines, shipping charges, and free shipping on orders above ₹500. Pan-India delivery for paan, mouth fresheners & gift boxes.",

  alternates: {
    canonical: "https://paanshala.com/shipping",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function ShippingPage() {
  return <ShippingClient />;
}
