"use client";

import { useState } from "react";
import { useUserStore } from "@/stores/useUserStore";
import ProfileSidebar from "@/components/profile/ProfileSidebar";
import ProfileOverview from "@/components/profile/ProfileOverview";
import UpdateProfileForm from "@/components/profile/UpdateProfileForm";
import UpdatePasswordForm from "@/components/profile/UpdatePasswordForm";
import ManageAddress from "@/components/profile/ManageAddress";
import DeleteAccount from "@/components/profile/DeleteAccount";

export default function ProfilePage() {
  const { user } = useUserStore();
  const [activeTab, setActiveTab] = useState("overview");

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
        {/* Sidebar */}
        <ProfileSidebar active={activeTab} onChange={setActiveTab} />

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
          {activeTab === "overview" && <ProfileOverview />}
          {activeTab === "profile" && <UpdateProfileForm />}
          {activeTab === "password" && <UpdatePasswordForm />}
          {activeTab === "address" && <ManageAddress />}
          {activeTab === "delete" && <DeleteAccount />}
        </div>
      </div>
    </div>
  );
}
