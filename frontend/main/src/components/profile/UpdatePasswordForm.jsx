"use client";

import { useState } from "react";
import { useUserStore } from "@/stores/useUserStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  Lock,
  Shield,
  AlertTriangle,
} from "lucide-react";
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
  const passwordStrength = getPasswordStrength(rules);

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
    <div className="space-y-8 max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Security Notice */}
        <div className="bg-linear-to-br from-[#264B0E]/5 to-brand-green-light/5 rounded-2xl p-5 border-2 border-[#264B0E]/10">
          <div className="flex gap-3">
            <div className="shrink-0">
              <div className="w-10 h-10 rounded-full bg-linear-to-br from-[#264B0E] to-brand-green-light flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 mb-1">
                Password Security
              </h3>
              <p className="text-sm text-gray-600">
                Choose a strong password that you haven't used elsewhere. We
                recommend using a password manager for maximum security.
              </p>
            </div>
          </div>
        </div>

        {/* Current Password */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#264B0E]" />
            Current Password
          </Label>
          <PasswordField
            value={currentPassword}
            onChange={setCurrentPassword}
            show={showCurrent}
            setShow={setShowCurrent}
            placeholder="Enter your current password"
          />
        </div>

        {/* New Password */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#264B0E]" />
            New Password
          </Label>
          <PasswordField
            value={newPassword}
            onChange={setNewPassword}
            show={showNew}
            setShow={setShowNew}
            placeholder="Enter your new password"
          />

          {/* Password Strength Indicator */}
          {newPassword && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Password Strength:</span>
                <span className={cn("font-semibold", passwordStrength.color)}>
                  {passwordStrength.label}
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full transition-all duration-300 rounded-full",
                    passwordStrength.bgColor,
                  )}
                  style={{ width: passwordStrength.width }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Password Requirements */}
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <p className="text-sm font-semibold text-gray-700 mb-3">
            Password must contain:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <Rule label="At least 8 characters" valid={rules.length} />
            <Rule label="One uppercase letter (A-Z)" valid={rules.uppercase} />
            <Rule label="One lowercase letter (a-z)" valid={rules.lowercase} />
            <Rule label="One number (0-9)" valid={rules.number} />
            <Rule label="One special character (!@#$)" valid={rules.special} />
          </div>
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#264B0E]" />
            Confirm New Password
          </Label>
          <PasswordField
            value={confirmPassword}
            onChange={setConfirmPassword}
            show={showConfirm}
            setShow={setShowConfirm}
            error={confirmPassword && !isMatch}
            placeholder="Re-enter your new password"
          />

          {/* Match Indicator */}
          {confirmPassword && (
            <div
              className={cn(
                "flex items-center gap-2 text-sm mt-2",
                isMatch ? "text-green-600" : "text-red-600",
              )}
            >
              {isMatch ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Passwords match</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4" />
                  <span>Passwords do not match</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Submit Section */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
          <Button
            type="submit"
            disabled={
              loading || !isValidPassword || !isMatch || !currentPassword
            }
            className="bg-linear-to-r from-[#264B0E] to-brand-green-light hover:opacity-90 h-12 px-8 font-semibold text-base text-white shadow-lg"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Updating Password...
              </>
            ) : (
              <>
                <Shield className="w-5 h-5 mr-2" />
                Update Password
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setCurrentPassword("");
              setNewPassword("");
              setConfirmPassword("");
            }}
            className="h-12 px-6 border-gray-200 hover:bg-gray-50"
          >
            Clear Fields
          </Button>
        </div>

        {/* Security Tips */}
        <div className="bg-amber-50 border-2 border-amber-100 rounded-xl p-4">
          <div className="flex gap-3">
            <div className="shrink-0">
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm text-amber-900 font-medium mb-2">
                Security Tips
              </p>
              <ul className="text-xs text-amber-800 space-y-1 leading-relaxed">
                <li>• Never share your password with anyone</li>
                <li>• Use a unique password for this account</li>
                <li>• Change your password regularly (every 3-6 months)</li>
                <li>• Don't use personal information in your password</li>
              </ul>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

/* =========================
   Password Field Component
========================= */

function PasswordField({ value, onChange, show, setShow, error, placeholder }) {
  return (
    <div className="relative text-accent-foreground">
      <Input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "h-12 pr-12 focus-visible:ring-[#264B0E] border-gray-200",
          error && "border-red-500 focus-visible:ring-red-500",
        )}
        required
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
      >
        {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
      </button>
    </div>
  );
}

/* =========================
   Password Rules Component
========================= */

function Rule({ label, valid }) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 text-sm transition-colors",
        valid ? "text-green-600" : "text-gray-500",
      )}
    >
      {valid ? (
        <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-3.5 h-3.5" />
        </div>
      ) : (
        <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
          <XCircle className="w-3.5 h-3.5" />
        </div>
      )}
      <span>{label}</span>
    </div>
  );
}

/* =========================
   Password Validation Utils
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

function getPasswordStrength(rules) {
  const validCount = Object.values(rules).filter(Boolean).length;

  if (validCount === 5) {
    return {
      label: "Strong",
      color: "text-green-600",
      bgColor: "bg-green-500",
      width: "100%",
    };
  }
  if (validCount >= 3) {
    return {
      label: "Medium",
      color: "text-yellow-600",
      bgColor: "bg-yellow-500",
      width: "66%",
    };
  }
  return {
    label: "Weak",
    color: "text-red-600",
    bgColor: "bg-red-500",
    width: "33%",
  };
}