"use client";

import { useEffect, useState } from "react";
import { useUserStore } from "@/stores/useUserStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, User, Mail, Phone, Upload, Check } from "lucide-react";

export default function UpdateProfileForm() {
  const { user, updateProfile, loading } = useUserStore();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);

  /* =========================
     PREFILL USER DATA
  ========================== */
  useEffect(() => {
    if (user) {
      setFullName(user.full_name || "");
      setPhone(user.phone || "");
      setPreview(user.profile_image || null);
    }
  }, [user]);

  /* =========================
     IMAGE CHANGE
  ========================== */
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  /* =========================
     SUBMIT
  ========================== */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("full_name", fullName);
    formData.append("phone", phone);

    if (imageFile) {
      formData.append("profile_image", imageFile);
    }

    await updateProfile(formData);
  };

  if (!user) return null;

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
        {/* Avatar Upload Section */}
        <div className="bg-linear-to-br from-[#264B0E]/5 to-brand-green-light/5 rounded-2xl p-6 border-2 border-[#264B0E]/10">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative">
              <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
                <AvatarImage src={preview} />
                <AvatarFallback className="bg-linear-to-br from-[#264B0E] to-brand-green-light text-white text-3xl">
                  {getInitials(user.full_name)}
                </AvatarFallback>
              </Avatar>

              <label
                htmlFor="profile_image"
                className="absolute -bottom-2 -right-2 bg-linear-to-br from-gold-bright to-[#d4a574] hover:from-[#d4a574] hover:to-gold-bright text-[#1a1a1a] p-3 rounded-full cursor-pointer shadow-lg transition-all hover:scale-110"
              >
                <Camera className="w-5 h-5" />
              </label>

              <input
                type="file"
                id="profile_image"
                accept="image/*"
                hidden
                onChange={handleImageChange}
              />
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h3 className="font-bold text-lg text-gray-900 mb-1">
                Profile Photo
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Upload a clear photo of yourself. This helps us personalize your
                experience.
              </p>
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200">
                  <Upload className="w-3 h-3" />
                  PNG, JPG up to 5MB
                </span>
                {imageFile && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 px-3 py-1 rounded-full border border-green-200">
                    <Check className="w-3 h-3" />
                    New photo selected
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-6 text-accent-foreground">
          {/* Full Name */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <User className="w-4 h-4 text-[#264B0E]" />
              Full Name
            </Label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              required
              className="h-12 focus-visible:ring-[#264B0E] border-gray-200"
            />
            <p className="text-xs text-gray-500">
              This name will be displayed on your orders and profile
            </p>
          </div>

          {/* Email (Read-only) */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#264B0E]" />
              Email Address
            </Label>
            <div className="relative">
              <Input
                value={user.email}
                disabled
                className="h-12 bg-gray-50 border-gray-200"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded">
                Verified
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Email cannot be changed. Contact support if needed.
            </p>
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#264B0E]" />
              Phone Number
            </Label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter phone number (e.g., +91 98765 43210)"
              maxLength={15}
              className="h-12 focus-visible:ring-[#264B0E] border-gray-200"
            />
            <p className="text-xs text-gray-500">
              We'll use this number for order updates and delivery
            </p>
          </div>
        </div>

        {/* Submit Section */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
          <Button
            type="submit"
            disabled={loading}
            className="bg-linear-to-r text-white from-[#264B0E] to-brand-green-light hover:opacity-90 h-12 px-8 font-semibold text-base shadow-lg"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Updating Profile...
              </>
            ) : (
              <>
                <Check className="w-5 h-5 mr-2" />
                Save Changes
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setFullName(user.full_name || "");
              setPhone(user.phone || "");
              setPreview(user.profile_image || null);
              setImageFile(null);
            }}
            className="h-12 px-6 border-gray-200 hover:bg-gray-50"
          >
            Reset Changes
          </Button>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border-2 border-blue-100 rounded-xl p-4">
          <div className="flex gap-3">
            <div className="shrink-0">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 text-sm">ℹ️</span>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm text-blue-900 font-medium mb-1">
                Profile Information
              </p>
              <p className="text-xs text-blue-700 leading-relaxed">
                Your profile information is used to personalize your shopping
                experience and for delivery purposes. We keep your data secure
                and never share it with third parties without your consent.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

/* =========================
   UTILS
========================= */

function getInitials(name = "") {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}