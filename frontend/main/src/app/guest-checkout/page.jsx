import GuestCheckoutClient from "./GuestCheckoutClient";

export const metadata = {
  title: "Guest Checkout",

  description:
    "Complete your Paanshala order as a guest, without creating an account.",

  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function GuestCheckoutPage() {
  return <GuestCheckoutClient />;
}
