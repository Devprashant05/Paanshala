import OrdersClient from "./OrdersClient";

export const metadata = {
  title: "My Orders",

  description: "View your order history and track deliveries on Paanshala.",

  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function OrdersPage() {
  return <OrdersClient />;
}
