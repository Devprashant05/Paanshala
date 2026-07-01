import WishlistClient from "./WishlistClient";

export const metadata = {
  title: "My Wishlist",

  description:
    "View and manage your saved paan, mouth fresheners, and gift boxes on Paanshala.",

  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function WishlistPage() {
  return <WishlistClient />;
}
