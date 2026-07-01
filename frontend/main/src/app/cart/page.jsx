import CartClient from "./CartClient";

export const metadata = {
  title: "Your Cart",

  description: "Review items in your Paanshala shopping cart.",

  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function CartPage() {
  return <CartClient />;
}
