"use client";

import { useUserStore } from "@/stores/useUserStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, User } from "lucide-react";

export default function ProfileOverview() {
  const { user } = useUserStore();

  if (!user) return null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>
        <p className="text-sm text-gray-500">
          Manage your personal information and account details
        </p>
      </div>

      {/* Profile Card */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6 p-6 border rounded-2xl bg-gray-50">
        <Avatar className="w-24 h-24 border">
          <AvatarImage src={user.profile_image} alt={user.full_name} />
          <AvatarFallback className="bg-[#2d5016] text-white text-2xl font-semibold">
            {getInitials(user.full_name)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="text-xl font-semibold text-gray-900">
              {user.full_name}
            </h3>

            <Badge
              variant="secondary"
              className="flex items-center gap-1 text-xs"
            >
              <User className="w-3 h-3" />
              {user.role}
            </Badge>

            {user.isVerified && (
              <Badge className="bg-green-600 hover:bg-green-600 text-xs flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Verified
              </Badge>
            )}
          </div>

          <p className="text-sm text-gray-600">{user.email}</p>

          {user.phone && (
            <p className="text-sm text-gray-600">📞 {user.phone}</p>
          )}
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Info label="Account Role" value={capitalize(user.role)} />
        <Info label="Email Verified" value={user.isVerified ? "Yes" : "No"} />
        <Info label="Account Created" value={formatDate(user.createdAt)} />
        <Info label="Last Updated" value={formatDate(user.updatedAt)} />
      </div>
    </div>
  );
}

/* ======================
   Helper Components
====================== */

function Info({ label, value }) {
  return (
    <div className="border rounded-xl p-4 bg-white">
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="mt-1 font-medium text-gray-900">{value}</p>
    </div>
  );
}

/* ======================
   Utilities
====================== */

function getInitials(name = "") {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function capitalize(text = "") {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function formatDate(date) {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
