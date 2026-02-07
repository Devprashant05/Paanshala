"use client";

import { useState } from "react";
import { useUserStore } from "@/stores/useUserStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function UpdatePasswordForm() {
  const { updatePassword, loading } = useUserStore();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const rules = passwordRules(newPassword);
  const isValidPassword = Object.values(rules).every(Boolean);
  const isMatch = newPassword === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isValidPassword || !isMatch) return;

    const success = await updatePassword({
      currentPassword,
      newPassword,
    });

    if (success) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  return (
    <div className="space-y-8 max-w-xl">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">Change Password</h2>
        <p className="text-sm text-gray-500">
          For security reasons, choose a strong password
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Current Password */}
        <PasswordField
          label="Current Password"
          value={currentPassword}
          onChange={setCurrentPassword}
          show={showCurrent}
          setShow={setShowCurrent}
        />

        {/* New Password */}
        <PasswordField
          label="New Password"
          value={newPassword}
          onChange={setNewPassword}
          show={showNew}
          setShow={setShowNew}
        />

        {/* Password Rules */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          <Rule label="8+ characters" valid={rules.length} />
          <Rule label="1 uppercase letter" valid={rules.uppercase} />
          <Rule label="1 lowercase letter" valid={rules.lowercase} />
          <Rule label="1 number" valid={rules.number} />
          <Rule label="1 special character" valid={rules.special} />
        </div>

        {/* Confirm Password */}
        <PasswordField
          label="Confirm New Password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          show={showConfirm}
          setShow={setShowConfirm}
          error={confirmPassword && !isMatch}
        />

        {confirmPassword && !isMatch && (
          <p className="text-sm text-red-600">
            Passwords do not match
          </p>
        )}

        {/* Submit */}
        <Button
          type="submit"
          disabled={loading || !isValidPassword || !isMatch}
          className="bg-[#2d5016] hover:bg-[#3d6820]"
        >
          {loading ? "Updating..." : "Update Password"}
        </Button>
      </form>
    </div>
  );
}

/* =========================
   Password Field Component
========================= */

function PasswordField({
  label,
  value,
  onChange,
  show,
  setShow,
  error,
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="relative">
        <Input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(error && "border-red-500")}
          required
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

/* =========================
   Password Rules
========================= */

function Rule({ label, valid }) {
  return (
    <div
      className={cn(
        "flex items-center gap-2",
        valid ? "text-green-600" : "text-gray-500"
      )}
    >
      {valid ? (
        <CheckCircle2 className="w-4 h-4" />
      ) : (
        <XCircle className="w-4 h-4" />
      )}
      {label}
    </div>
  );
}

/* =========================
   Utils
========================= */

function passwordRules(password) {
  return {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
}
