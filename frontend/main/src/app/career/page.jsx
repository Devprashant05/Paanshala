import CareerClient from "./CareerClient";

export const metadata = {
  title: "Careers",

  description:
    "Explore career opportunities at Paanshala. Join India's premium paan and gourmet mouth freshener brand across our stores and teams in Delhi NCR.",

  keywords: [
    "food industry jobs Delhi NCR",
    "retail jobs Delhi",
    "restaurant jobs Delhi",
    "hospitality jobs Noida",
    "walk-in interview jobs Delhi",
    "store staff jobs Delhi",
    "F&B careers India",
  ],

  alternates: {
    canonical: "https://paanshala.com/career",
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

export default function CareerPage() {
  return <CareerClient />;
}
