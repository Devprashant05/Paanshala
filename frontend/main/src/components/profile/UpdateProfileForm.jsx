"use client";

import { useEffect, useState } from "react";
import { useUserStore } from "@/stores/useUserStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera } from "lucide-react";

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
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">Update Profile</h2>
        <p className="text-sm text-gray-500">
          Update your personal details and profile picture
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
        {/* Avatar Upload */}
        <div className="flex items-center gap-6">
          <div className="relative">
            <Avatar className="w-24 h-24 border">
              <AvatarImage src={preview} />
              <AvatarFallback className="bg-[#2d5016] text-white text-xl">
                {getInitials(user.full_name)}
              </AvatarFallback>
            </Avatar>

            <label
              htmlFor="profile_image"
              className="absolute -bottom-2 -right-2 bg-[#2d5016] hover:bg-[#3d6820] text-white p-2 rounded-full cursor-pointer shadow-lg"
            >
              <Camera className="w-4 h-4" />
            </label>

            <input
              type="file"
              id="profile_image"
              accept="image/*"
              hidden
              onChange={handleImageChange}
            />
          </div>

          <div className="text-sm text-gray-600">
            <p className="font-medium">Profile Photo</p>
            <p>PNG, JPG up to 5MB</p>
          </div>
        </div>

        {/* Full Name */}
        <div className="space-y-2">
          <Label>Full Name</Label>
          <Input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Enter your full name"
            required
          />
        </div>

        {/* Email (Read-only) */}
        <div className="space-y-2">
          <Label>Email Address</Label>
          <Input value={user.email} disabled />
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label>Phone Number</Label>
          <Input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Enter phone number"
            maxLength={15}
          />
        </div>

        {/* Submit */}
        <div className="pt-4">
          <Button
            type="submit"
            disabled={loading}
            className="bg-[#2d5016] hover:bg-[#3d6820]"
          >
            {loading ? "Updating..." : "Save Changes"}
          </Button>
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
