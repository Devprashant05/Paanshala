import OrderSuccessClient from "./OrderSuccessClient";

export const metadata = {
  title: "Order Confirmed",

  description: "Your Paanshala order has been placed successfully.",

  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function OrderSuccessPage() {
  return <OrderSuccessClient />;
}
