import ForgotPasswordClient from "./ForgotPasswordClient";

export const metadata = {
  title: "Reset Password",

  description: "Reset your Paanshala account password.",

  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordClient />;
}
