import ProfileClient from "./ProfileClient";

export const metadata = {
  title: "My Profile",

  description: "Manage your Paanshala account details and preferences.",

  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function ProfilePage() {
  return <ProfileClient />;
}
