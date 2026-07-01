import RegisterClient from "./RegisterClient";

export const metadata = {
  title: "Create Account",

  description:
    "Create your Paanshala account to order faster and track deliveries.",

  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function RegisterPage() {
  return <RegisterClient />;
}
