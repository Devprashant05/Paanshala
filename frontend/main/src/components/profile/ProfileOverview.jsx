"use client";

import { useUserStore } from "@/stores/useUserStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck,
  User,
  Mail,
  Phone,
  Calendar,
  Clock,
  Award,
  CheckCircle2,
  XCircle,
} from "lucide-react";

export default function ProfileOverview() {
  const { user } = useUserStore();

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <div className="bg-linear-to-br from-[#264B0E]/5 to-brand-green-light/5 rounded-2xl border-2 border-[#264B0E]/10 p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Avatar */}
          <div className="relative">
            <Avatar className="w-32 h-32 border-4 border-white shadow-xl">
              <AvatarImage src={user.profile_image} alt={user.full_name} />
              <AvatarFallback className="bg-linear-to-br from-[#264B0E] to-brand-green-light text-white text-3xl font-bold">
                {getInitials(user.full_name)}
              </AvatarFallback>
            </Avatar>

            {/* Verification Badge Overlay */}
            {user.isVerified && (
              <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-green-500 border-4 border-white flex items-center justify-center shadow-lg">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center gap-3 mb-3">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                {user.full_name}
              </h2>

              <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
                <Badge
                  variant="outline"
                  className="border-[#264B0E]/30 text-[#264B0E] bg-[#264B0E]/5 text-xs"
                >
                  <User className="w-3 h-3 mr-1" />
                  {capitalize(user.role)}
                </Badge>

                {user.isVerified && (
                  <Badge className="bg-green-600 hover:bg-green-600 text-xs">
                    <ShieldCheck className="w-3 h-3 mr-1" />
                    Verified Account
                  </Badge>
                )}
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-2">
              <div className="flex items-center justify-center md:justify-start gap-2 text-gray-600">
                <Mail className="w-4 h-4 text-[#264B0E]" />
                <span className="text-sm">{user.email}</span>
              </div>

              {user.phone && (
                <div className="flex items-center justify-center md:justify-start gap-2 text-gray-600">
                  <Phone className="w-4 h-4 text-[#264B0E]" />
                  <span className="text-sm">{user.phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Account Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <InfoCard
          icon={Award}
          label="Account Role"
          value={capitalize(user.role)}
          iconColor="text-[#f4c430]"
          iconBg="bg-[#f4c430]/10"
        />

        <InfoCard
          icon={user.isVerified ? CheckCircle2 : XCircle}
          label="Email Verification"
          value={user.isVerified ? "Verified" : "Not Verified"}
          iconColor={user.isVerified ? "text-green-600" : "text-red-600"}
          iconBg={user.isVerified ? "bg-green-100" : "bg-red-100"}
        />

        <InfoCard
          icon={Calendar}
          label="Member Since"
          value={formatDate(user.createdAt)}
          iconColor="text-[#264B0E]"
          iconBg="bg-[#264B0E]/10"
        />

        <InfoCard
          icon={Clock}
          label="Last Updated"
          value={formatDate(user.updatedAt)}
          iconColor="text-gray-600"
          iconBg="bg-gray-100"
        />

        <InfoCard
          icon={Mail}
          label="Email Address"
          value={user.email}
          iconColor="text-blue-600"
          iconBg="bg-blue-100"
          truncate
        />

        {user.phone && (
          <InfoCard
            icon={Phone}
            label="Phone Number"
            value={user.phone}
            iconColor="text-purple-600"
            iconBg="bg-purple-100"
          />
        )}
      </div>
    </div>
  );
}

/* ======================
   Helper Components
====================== */

function InfoCard({ icon: Icon, label, value, iconColor, iconBg, truncate }) {
  return (
    <div className="group relative overflow-hidden bg-white rounded-xl border-2 border-gray-100 p-5 hover:shadow-lg hover:border-[#264B0E]/20 transition-all duration-300">
      <div className="flex items-start gap-3">
        <div
          className={`shrink-0 w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center`}
        >
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            {label}
          </p>
          <p
            className={`font-semibold text-gray-900 ${truncate ? "truncate" : ""}`}
          >
            {value || "-"}
          </p>
        </div>
      </div>

      {/* Hover effect */}
      <div className="absolute inset-0 bg-linear-to-r from-[#264B0E]/0 to-[#264B0E]/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </div>
  );
}

function StatusRow({ label, value, showBar, valueColor = "text-gray-900" }) {
  const percentage = showBar ? parseInt(value) : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-medium text-gray-600">{label}</span>
        <span className={`text-sm font-bold ${valueColor}`}>{value}</span>
      </div>
      {showBar && (
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-linear-to-r from-[#264B0E] to-brand-green-light rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
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
  if (!text) return "-";
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

function calculateProfileCompletion(user) {
  let completed = 0;
  const total = 5;

  if (user.full_name) completed++;
  if (user.email) completed++;
  if (user.phone) completed++;
  if (user.profile_image) completed++;
  if (user.isVerified) completed++;

  return `${Math.round((completed / total) * 100)}%`;
}