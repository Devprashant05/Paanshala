import CheckoutClient from "./CheckoutClient";

export const metadata = {
  title: "Checkout",

  description: "Complete your Paanshala order securely.",

  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function CheckoutPage() {
  return <CheckoutClient />;
}
