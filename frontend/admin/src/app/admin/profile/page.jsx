"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  Shield,
  Camera,
  Lock,
  Trash2,
  Save,
  Eye,
  EyeOff,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Loader2,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

import { useAdminGuard } from "@/hooks/useAdminGuard";
import { useUserStore } from "@/stores/useUserStore";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

export default function AdminProfilePage() {
  useAdminGuard();

  const router = useRouter();
  const {
    user,
    refreshProfile,
    logout,
    updateProfile,
    updatePassword,
    deleteAccount,
  } = useUserStore();

  const [profileData, setProfileData] = useState({
    full_name: "",
    phone: "",
    profile_image: null,
  });

  const [imagePreview, setImagePreview] = useState(null);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Delete confirmation dialog state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  /* ===========================
     INIT PROFILE DATA
  =========================== */
  useEffect(() => {
    if (user) {
      setProfileData({
        full_name: user.full_name || "",
        phone: user.phone || "",
        profile_image: null,
      });
    }
  }, [user]);

  if (!user) return null;

  /* ===========================
     HANDLE IMAGE CHANGE
  =========================== */
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileData({ ...profileData, profile_image: file });

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  /* ===========================
     UPDATE PROFILE
  =========================== */
  const handleProfileUpdate = async (e) => {
    e.preventDefault();

    if (!profileData.full_name.trim()) {
      toast.error("Full name is required");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("full_name", profileData.full_name);
    formData.append("phone", profileData.phone);
    if (profileData.profile_image) {
      formData.append("profile_image", profileData.profile_image);
    }

    const ok = await updateProfile(formData);
    if (ok) {
      await refreshProfile();
      setImagePreview(null);
    }

    setLoading(false);
  };

  /* ===========================
     UPDATE PASSWORD
  =========================== */
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();

    if (!passwordData.currentPassword || !passwordData.newPassword) {
      toast.error("All password fields are required");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }

    setPasswordLoading(true);
    const ok = await updatePassword(passwordData);
    if (ok) {
      setPasswordData({ currentPassword: "", newPassword: "" });
    }
    setPasswordLoading(false);
  };

  /* ===========================
     DELETE ACCOUNT
  =========================== */
  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") {
      toast.error("Please type DELETE to confirm");
      return;
    }

    setDeleteLoading(true);
    const ok = await deleteAccount();
    if (ok) {
      await logout();
      router.replace("/login");
    }
    setDeleteLoading(false);
  };

  /* ===========================
     CLOSE DELETE DIALOG
  =========================== */
  const handleCloseDeleteDialog = () => {
    setShowDeleteDialog(false);
    setDeleteConfirmText("");
  };

  // Get user initials
  const getInitials = (name) => {
    if (!name) return "AD";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* PAGE HEADER */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl lg:text-5xl font-bold text-[#12351a] mb-2">
          My Profile
        </h1>
        <p className="text-base text-gray-600">
          Manage your admin account details and security settings
        </p>
      </motion.div>

      {/* PROFILE OVERVIEW */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <Card className="border-gray-200 shadow-lg overflow-hidden">
          {/* Header Background */}
          <div className="h-32 bg-linear-to-r from-[#12351a] via-[#0f2916] to-[#0b1f11] relative">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#d4af37] rounded-full blur-3xl" />
            </div>
          </div>

          <CardContent className="pt-0 pb-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-16 sm:-mt-12">
              {/* Profile Image */}
              <div className="relative">
                <Avatar className="h-32 w-32 border-4 border-white shadow-2xl">
                  <AvatarImage src={imagePreview || user.profile_image} />
                  <AvatarFallback className="text-3xl font-bold bg-linear-to-br from-[#d4af37] to-[#b8941f] text-[#12351a]">
                    {getInitials(user.full_name)}
                  </AvatarFallback>
                </Avatar>
                <label className="absolute bottom-2 right-2 bg-[#12351a] p-2.5 rounded-full cursor-pointer hover:bg-[#0f2916] transition-colors shadow-lg border-2 border-white">
                  <Camera className="w-4 h-4 text-white" />
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </label>
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  {user.full_name}
                </h2>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mb-3">
                  <p className="text-sm text-gray-600 flex items-center gap-1.5">
                    <Mail className="w-4 h-4" />
                    {user.email}
                  </p>
                  {user.phone && (
                    <p className="text-sm text-gray-600 flex items-center gap-1.5">
                      <Phone className="w-4 h-4" />
                      {user.phone}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-semibold">
                    <Shield className="w-3.5 h-3.5" />
                    Administrator
                  </span>
                  <span className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full text-xs font-semibold">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Verified
                  </span>
                  {user.createdAt && (
                    <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full text-xs font-medium">
                      <Calendar className="w-3.5 h-3.5" />
                      Joined {formatDate(user.createdAt)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* EDIT PROFILE */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <Card className="border-gray-200 shadow-lg">
          <CardHeader className="border-b border-gray-100 bg-gray-50/50">
            <CardTitle className="text-lg font-semibold flex items-center gap-2.5">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              Edit Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleProfileUpdate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div className="space-y-2">
                  <Label
                    htmlFor="full_name"
                    className="text-sm font-medium text-gray-700"
                  >
                    Full Name *
                  </Label>
                  <Input
                    id="full_name"
                    value={profileData.full_name}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        full_name: e.target.value,
                      })
                    }
                    placeholder="Enter your full name"
                    className="h-11 border-gray-300 focus:border-[#12351a] focus:ring-[#12351a]"
                    required
                  />
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label
                    htmlFor="phone"
                    className="text-sm font-medium text-gray-700"
                  >
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) =>
                      setProfileData({ ...profileData, phone: e.target.value })
                    }
                    placeholder="Enter your phone number"
                    className="h-11 border-gray-300 focus:border-[#12351a] focus:ring-[#12351a]"
                  />
                </div>
              </div>

              {/* Image Preview */}
              {imagePreview && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="p-4 bg-blue-50 border border-blue-200 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                    <p className="text-sm text-blue-800 font-medium">
                      New profile picture selected. Click "Save Changes" to
                      update.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Submit Button */}
              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-[#12351a] hover:bg-[#0f2916] text-white px-6 h-11"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
                {imagePreview && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setImagePreview(null);
                      setProfileData({ ...profileData, profile_image: null });
                    }}
                    className="h-11"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      {/* CHANGE PASSWORD */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <Card className="border-gray-200 shadow-lg">
          <CardHeader className="border-b border-gray-100 bg-gray-50/50">
            <CardTitle className="text-lg font-semibold flex items-center gap-2.5">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Lock className="w-5 h-5 text-amber-600" />
              </div>
              Change Password
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handlePasswordUpdate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Current Password */}
                <div className="space-y-2">
                  <Label
                    htmlFor="current_password"
                    className="text-sm font-medium text-gray-700"
                  >
                    Current Password *
                  </Label>
                  <div className="relative">
                    <Input
                      id="current_password"
                      type={showCurrentPassword ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          currentPassword: e.target.value,
                        })
                      }
                      placeholder="Enter current password"
                      className="h-11 border-gray-300 focus:border-[#12351a] focus:ring-[#12351a] pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div className="space-y-2">
                  <Label
                    htmlFor="new_password"
                    className="text-sm font-medium text-gray-700"
                  >
                    New Password *
                  </Label>
                  <div className="relative">
                    <Input
                      id="new_password"
                      type={showNewPassword ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          newPassword: e.target.value,
                        })
                      }
                      placeholder="Enter new password"
                      className="h-11 border-gray-300 focus:border-[#12351a] focus:ring-[#12351a] pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showNewPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Must be at least 6 characters long
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="outline"
                disabled={passwordLoading}
                className="border-[#12351a] text-[#12351a] hover:bg-[#12351a] hover:text-white h-11 px-6"
              >
                {passwordLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Update Password
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      {/* DANGER ZONE */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <Card className="border-red-200 shadow-lg bg-red-50/30">
          <CardHeader className="border-b border-red-200 bg-red-50">
            <CardTitle className="text-lg font-semibold flex items-center gap-2.5 text-red-700">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="p-4 bg-white border border-red-200 rounded-xl">
                <div className="flex items-start gap-3 mb-4">
                  <Trash2 className="w-5 h-5 text-red-600 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Delete Account
                    </h3>
                    <p className="text-sm text-gray-600">
                      Once you delete your account, there is no going back. This
                      action will permanently delete your admin profile, remove
                      your access, and cannot be undone. All your data will be
                      lost forever.
                    </p>
                  </div>
                </div>

                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteDialog(true)}
                  className="h-11 px-6"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete My Account
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* DELETE CONFIRMATION DIALOG */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="max-w-lg">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <AlertDialogTitle className="text-2xl">
                Delete Account?
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-base space-y-4 pt-2">
              <p className="text-gray-700">
                This action is{" "}
                <span className="font-semibold text-red-600">
                  permanent and cannot be undone
                </span>
                . Deleting your account will:
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <X className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                  <span>Permanently delete your admin profile</span>
                </li>
                <li className="flex items-start gap-2">
                  <X className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                  <span>Remove all your access permissions</span>
                </li>
              </ul>

              <div className="pt-4 space-y-2">
                <Label
                  htmlFor="delete-confirm"
                  className="text-sm font-semibold text-gray-900"
                >
                  Type{" "}
                  <span className="font-mono bg-red-100 text-red-700 px-2 py-0.5 rounded">
                    DELETE
                  </span>{" "}
                  to confirm:
                </Label>
                <Input
                  id="delete-confirm"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="Type DELETE here"
                  className="h-11 font-mono"
                  autoComplete="off"
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-2">
            <AlertDialogCancel
              onClick={handleCloseDeleteDialog}
              className="h-11"
              disabled={deleteLoading}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={deleteConfirmText !== "DELETE" || deleteLoading}
              className={cn(
                "h-11 bg-red-600 hover:bg-red-700 text-white",
                deleteConfirmText !== "DELETE" &&
                  "opacity-50 cursor-not-allowed",
              )}
            >
              {deleteLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
