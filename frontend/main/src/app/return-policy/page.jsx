import ReturnPolicyClient from "./ReturnPolicyClient";

export const metadata = {
  title: "Return & Refund Policy",

  description:
    "Paanshala's return, refund, and cancellation policy for paan, mouth fresheners, digestives, and gift boxes. Know your options before you order.",

  alternates: {
    canonical: "https://paanshala.com/return-policy",
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

export default function ReturnPolicyPage() {
  return <ReturnPolicyClient />;
}
