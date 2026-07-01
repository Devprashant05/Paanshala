import TermsClient from "./TermsClient";

export const metadata = {
  title: "Terms & Conditions",

  description:
    "Paanshala's terms and conditions for orders, payments, delivery, cancellations, and website use. Please read before placing an order.",

  alternates: {
    canonical: "https://paanshala.com/terms",
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

export default function TermsPage() {
  return <TermsClient />;
}
