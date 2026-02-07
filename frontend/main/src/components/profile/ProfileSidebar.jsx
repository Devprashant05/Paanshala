"use client";

import { cn } from "@/lib/utils";
import { User, Lock, MapPin, Trash2, LayoutDashboard } from "lucide-react";

const links = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "profile", label: "Update Profile", icon: User },
  { key: "password", label: "Change Password", icon: Lock },
  { key: "address", label: "Manage Address", icon: MapPin },
  { key: "delete", label: "Delete Account", icon: Trash2 },
];

export default function ProfileSidebar({ active, onChange }) {
  return (
    <aside className="bg-white rounded-2xl shadow-sm p-4 h-fit sticky top-28">
      <nav className="space-y-1">
        {links.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition",
              active === key
                ? "bg-[#2d5016] text-white"
                : "text-gray-700 hover:bg-gray-100",
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
