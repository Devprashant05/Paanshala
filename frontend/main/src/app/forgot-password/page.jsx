"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Lock,
  Key,
  ArrowLeft,
  Check,
  X,
  RefreshCw,
  Shield,
} from "lucide-react";

import { useUserStore } from "@/stores/useUserStore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { forgotPassword, resetPassword, loading } = useUserStore();

  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const RESEND_TIME = 300; // 5 minutes

  const [timer, setTimer] = useState(RESEND_TIME);
  const [canResend, setCanResend] = useState(false);

  const passwordRules = {
    length: newPassword.length >= 8,
    upper: /[A-Z]/.test(newPassword),
    lower: /[a-z]/.test(newPassword),
    number: /[0-9]/.test(newPassword),
    special: /[^A-Za-z0-9]/.test(newPassword),
  };

  const isPasswordValid = Object.values(passwordRules).every(Boolean);
  const passwordsMatch =
    newPassword === confirmPassword && confirmPassword !== "";

  // Timer countdown
  useEffect(() => {
    if (step !== 2 || canResend) return;

    if (timer <= 0) {
      setCanResend(true);
      return;
    }

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer, canResend, step]);

  // STEP 1: Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();

    const success = await forgotPassword(email);
    if (success) {
      setStep(2);
      setTimer(RESEND_TIME);
      setCanResend(false);
    }
  };

  // STEP 2: Reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!isPasswordValid || !passwordsMatch || otp.length !== 6) {
      return;
    }

    const success = await resetPassword({
      email,
      otp,
      newPassword,
    });

    if (success) {
      router.push("/login");
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    const success = await forgotPassword(email);

    if (success) {
      setTimer(RESEND_TIME);
      setCanResend(false);
      setOtp(""); // Clear OTP input
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#0b1f11] via-[#1a3d1f] to-[#0b1f11] px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl border-0">
          <CardHeader className="space-y-4 pb-6">
            {/* Back Button */}
            {step === 2 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep(1)}
                className="w-fit -ml-2"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}

            {/* Icon */}
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-linear-to-br from-[#d4af37] to-[#f4d03f] rounded-full flex items-center justify-center">
                {step === 1 ? (
                  <Mail className="w-8 h-8 text-white" />
                ) : (
                  <Shield className="w-8 h-8 text-white" />
                )}
              </div>
            </div>

            {/* Title & Description */}
            <div className="text-center space-y-2">
              <CardTitle className="text-2xl md:text-3xl font-bold text-gray-900">
                {step === 1 ? "Forgot Password?" : "Reset Password"}
              </CardTitle>

              <p className="text-sm text-gray-600">
                {step === 1
                  ? "Enter your email address and we'll send you a code to reset your password"
                  : "Enter the 6-digit code sent to your email"}
              </p>

              {step === 2 && email && (
                <Badge variant="secondary" className="mt-2">
                  {email}
                </Badge>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <AnimatePresence mode="wait">
              {step === 1 ? (
                /* ================= STEP 1: EMAIL ================= */
                <motion.form
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={handleSendOtp}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-11"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11 bg-linear-to-r from-[#2d5016] to-[#3d6820] hover:from-[#3d6820] hover:to-[#2d5016] text-white font-semibold"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending OTP...
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4 mr-2" />
                        Send OTP
                      </>
                    )}
                  </Button>
                </motion.form>
              ) : (
                /* ================= STEP 2: OTP & PASSWORD ================= */
                <motion.form
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleResetPassword}
                  className="space-y-6"
                >
                  {/* OTP Input */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">
                      Verification Code
                    </Label>
                    <OtpInput value={otp} onChange={setOtp} />

                    {/* Resend Timer */}
                    <div className="text-center mt-4">
                      {canResend ? (
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={handleResendOtp}
                          disabled={loading}
                          className="text-[#2d5016] hover:text-[#3d6820] font-medium"
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Resend OTP
                        </Button>
                      ) : (
                        <p className="text-sm text-gray-600">
                          Didn't receive the code?{" "}
                          <span className="font-semibold text-gray-900">
                            Resend in {formatTime(timer)}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* New Password */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="newPassword"
                      className="text-sm font-medium"
                    >
                      New Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="newPassword"
                        type={showPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="pl-10 pr-10 h-11"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4 text-gray-400" />
                        ) : (
                          <Eye className="w-4 h-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="confirmPassword"
                      className="text-sm font-medium"
                    >
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10 pr-10 h-11"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4 text-gray-400" />
                        ) : (
                          <Eye className="w-4 h-4 text-gray-400" />
                        )}
                      </Button>
                    </div>

                    {/* Password Match Indicator */}
                    {confirmPassword && (
                      <div className="flex items-center gap-2 text-sm">
                        {passwordsMatch ? (
                          <>
                            <Check className="w-4 h-4 text-green-600" />
                            <span className="text-green-600">
                              Passwords match
                            </span>
                          </>
                        ) : (
                          <>
                            <X className="w-4 h-4 text-red-600" />
                            <span className="text-red-600">
                              Passwords don't match
                            </span>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Password Requirements */}
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <p className="text-sm font-medium text-gray-700 mb-3">
                      Password must contain:
                    </p>
                    <PasswordRequirement
                      met={passwordRules.length}
                      text="At least 8 characters"
                    />
                    <PasswordRequirement
                      met={passwordRules.upper}
                      text="One uppercase letter (A-Z)"
                    />
                    <PasswordRequirement
                      met={passwordRules.lower}
                      text="One lowercase letter (a-z)"
                    />
                    <PasswordRequirement
                      met={passwordRules.number}
                      text="One number (0-9)"
                    />
                    <PasswordRequirement
                      met={passwordRules.special}
                      text="One special character (!@#$%...)"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11 bg-linear-to-r from-[#2d5016] to-[#3d6820] hover:from-[#3d6820] hover:to-[#2d5016] text-white font-semibold"
                    disabled={
                      loading ||
                      !isPasswordValid ||
                      !passwordsMatch ||
                      otp.length !== 6
                    }
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Resetting Password...
                      </>
                    ) : (
                      <>
                        <Key className="w-4 h-4 mr-2" />
                        Reset Password
                      </>
                    )}
                  </Button>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Footer Links */}
            <div className="pt-4 border-t">
              <p className="text-center text-sm text-gray-600">
                Remember your password?{" "}
                <Link
                  href="/login"
                  className="text-[#2d5016] font-semibold hover:text-[#3d6820] hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Additional Help */}
        <p className="text-center text-sm text-gray-300 mt-6">
          Need help?{" "}
          <Link
            href="/contact"
            className="text-[#d4af37] hover:text-[#f4d03f] font-medium"
          >
            Contact Support
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

/* =========================
   OTP INPUT COMPONENT
========================= */
function OtpInput({ value, onChange }) {
  const inputs = Array(6).fill(0);

  const handleChange = (e, index) => {
    const val = e.target.value.replace(/\D/g, "");
    if (!val) return;

    const otpArr = value.split("");
    otpArr[index] = val[0];
    onChange(otpArr.join(""));

    // Auto-focus next input
    if (e.target.nextSibling) {
      e.target.nextSibling.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const otpArr = value.split("");

      if (otpArr[index]) {
        // Clear current
        otpArr[index] = "";
        onChange(otpArr.join(""));
      } else if (e.target.previousSibling) {
        // Go to previous and clear
        otpArr[index - 1] = "";
        onChange(otpArr.join(""));
        e.target.previousSibling.focus();
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (pasted) {
      onChange(pasted.padEnd(6, ""));

      // Focus last filled input
      const lastIndex = Math.min(pasted.length, 5);
      const inputs = e.currentTarget.querySelectorAll("input");
      inputs[lastIndex]?.focus();
    }
  };

  return (
    <div className="flex justify-center gap-2 md:gap-3" onPaste={handlePaste}>
      {inputs.map((_, i) => (
        <input
          key={i}
          type="text"
          inputMode="numeric"
          value={value[i] || ""}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          maxLength={1}
          className={cn(
            "w-11 h-12 md:w-12 md:h-14 text-center text-xl md:text-2xl font-bold",
            "border-2 rounded-lg",
            "focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-transparent",
            "transition-all duration-200",
            value[i]
              ? "border-[#d4af37] bg-[#d4af37]/5"
              : "border-gray-300 bg-white",
          )}
        />
      ))}
    </div>
  );
}

/* =========================
   PASSWORD REQUIREMENT
========================= */
function PasswordRequirement({ met, text }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-2 text-sm"
    >
      <div
        className={cn(
          "w-5 h-5 rounded-full flex items-center justify-center transition-colors",
          met ? "bg-green-100" : "bg-gray-200",
        )}
      >
        {met ? (
          <Check className="w-3 h-3 text-green-600" />
        ) : (
          <X className="w-3 h-3 text-gray-400" />
        )}
      </div>
      <span
        className={cn(
          "transition-colors",
          met ? "text-green-700 font-medium" : "text-gray-600",
        )}
      >
        {text}
      </span>
    </motion.div>
  );
}
