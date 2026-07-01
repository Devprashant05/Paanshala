import LoginClient from "./LoginClient";

export const metadata = {
  title: "Login",

  description: "Log in to your Paanshala account.",

  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function LoginPage() {
  return <LoginClient />;
}
