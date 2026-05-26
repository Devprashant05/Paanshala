"use client";

import { useState } from "react";
import { useUserStore } from "@/stores/useUserStore";
import ProfileSidebar from "@/components/profile/ProfileSidebar";
import ProfileOverview from "@/components/profile/ProfileOverview";
import UpdateProfileForm from "@/components/profile/UpdateProfileForm";
import UpdatePasswordForm from "@/components/profile/UpdatePasswordForm";
import ManageAddress from "@/components/profile/ManageAddress";
import DeleteAccount from "@/components/profile/DeleteAccount";
import { User, Settings, Lock, MapPin, UserX, Sparkles } from "lucide-react";

const TABS = [
  {
    id: "overview",
    label: "Overview",
    icon: User,
    description: "View your profile",
  },
  {
    id: "profile",
    label: "Edit Profile",
    icon: Settings,
    description: "Update your information",
  },
  {
    id: "password",
    label: "Password",
    icon: Lock,
    description: "Change your password",
  },
  {
    id: "address",
    label: "Addresses",
    icon: MapPin,
    description: "Manage delivery addresses",
  },
  {
    id: "delete",
    label: "Delete Account",
    icon: UserX,
    description: "Permanently delete account",
  },
];

export default function ProfilePage() {
  const { user } = useUserStore();
  const [activeTab, setActiveTab] = useState("overview");

  if (!user) return null;

  const activeTabData = TABS.find((tab) => tab.id === activeTab);

  return (
    <div className="min-h-screen bg-linear-to-b from-white via-[#fafaf6] to-white py-10">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-linear-to-br from-[#264B0E] to-brand-green-light flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                My Account
              </h1>
              <p className="text-gray-600">Welcome back, {user.full_name}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          {/* Sidebar */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="bg-white rounded-2xl shadow-md border-2 border-gray-100 overflow-hidden">
              {/* User Info */}
              <div className="bg-linear-to-br from-[#264B0E] to-brand-green-light p-6 text-white">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30">
                    <span className="text-2xl font-bold">
                      {user.full_name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-lg truncate">
                      {user.full_name}
                    </p>
                    <p className="text-sm text-white/80 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="p-2">
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;

                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all mb-1 ${
                        isActive
                          ? "bg-linear-to-r from-[#264B0E]/10 to-brand-green-light/10 text-[#264B0E] font-semibold border-l-4 border-[#264B0E]"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 ${isActive ? "text-[#264B0E]" : "text-gray-400"}`}
                      />
                      <div className="flex-1">
                        <p
                          className={`text-sm font-medium ${isActive ? "text-[#264B0E]" : ""}`}
                        >
                          {tab.label}
                        </p>
                        {!isActive && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            {tab.description}
                          </p>
                        )}
                      </div>
                      {isActive && (
                        <div className="w-2 h-2 rounded-full bg-gold-bright" />
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-6">
            {/* Active Tab Header */}
            {activeTabData && (
              <div className="bg-linear-to-r from-[#264B0E]/5 to-brand-green-light/5 rounded-2xl p-6 border-2 border-[#264B0E]/10">
                <div className="flex items-center gap-3">
                  {activeTabData.icon && (
                    <div className="w-12 h-12 rounded-xl bg-linear-to-br from-[#264B0E] to-brand-green-light flex items-center justify-center">
                      <activeTabData.icon className="w-6 h-6 text-white" />
                    </div>
                  )}
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {activeTabData.label}
                    </h2>
                    <p className="text-sm text-gray-600 mt-0.5">
                      {activeTabData.description}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Content Area */}
            <div className="bg-white rounded-2xl shadow-md border-2 border-gray-100 p-6 md:p-8">
              {activeTab === "overview" && <ProfileOverview />}
              {activeTab === "profile" && <UpdateProfileForm />}
              {activeTab === "password" && <UpdatePasswordForm />}
              {activeTab === "address" && <ManageAddress />}
              {activeTab === "delete" && <DeleteAccount />}
            </div>

            {/* Help Card */}
            <div className="bg-linear-to-br from-gold-bright/10 to-[#d4a574]/10 rounded-2xl p-6 border-2 border-gold-bright/20">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-gold-bright flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-[#1a1a1a]" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-1">Need Help?</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    If you have any questions or need assistance with your
                    account, our support team is here to help.
                  </p>
                  <a
                    href="/contact"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#264B0E] hover:text-brand-green-light transition-colors"
                  >
                    Contact Support
                    <span>→</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}