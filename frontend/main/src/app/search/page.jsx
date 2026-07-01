import SearchClient from "./SearchClient";

export const metadata = {
  title: "Search",

  description:
    "Search Paanshala for paan, mouth fresheners, digestives, and gift boxes.",

  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function SearchPage() {
  return <SearchClient />;
}
