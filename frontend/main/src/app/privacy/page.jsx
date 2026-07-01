import PrivacyClient from "./PrivacyClient";

export const metadata = {
  title: "Privacy Policy",

  description:
    "How Paanshala collects, uses, and protects your personal data across our website, orders, and account.",

  alternates: {
    canonical: "https://paanshala.com/privacy",
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

export default function PrivacyPage() {
  return <PrivacyClient />;
}
