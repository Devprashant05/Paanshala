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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#264B0E] via-brand-green-dark to-[#264B0E] px-4 py-12">
      <div className="w-full max-w-md">
        {/* Back to Login */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors text-body text-sm"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={2.5} />
            Back to Login
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="card-premium bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="space-y-4 pt-8 pb-6 px-6 bg-linear-to-b from-[#f5e6d3]/30 to-transparent">
              {/* Back Button (Step 2) */}
              {step === 2 && (
                <button
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-2 text-body text-sm text-gray-600 hover:text-[#264B0E] transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" strokeWidth={2.5} />
                  Back
                </button>
              )}

              {/* Icon */}
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-linear-to-br from-gold-bright to-[#d4a574] rounded-full flex items-center justify-center shadow-lg">
                  {step === 1 ? (
                    <Mail className="w-8 h-8 text-white" strokeWidth={2.5} />
                  ) : (
                    <Shield className="w-8 h-8 text-white" strokeWidth={2.5} />
                  )}
                </div>
              </div>

              {/* Title & Description */}
              <div className="text-center space-y-2">
                <h1 className="text-heading text-3xl md:text-4xl text-[#264B0E] uppercase tracking-wide">
                  {step === 1 ? "Forgot Password?" : "Reset Password"}
                </h1>

                <p className="text-body text-sm text-gray-600">
                  {step === 1
                    ? "Enter your email address and we'll send you a code to reset your password"
                    : "Enter the 6-digit code sent to your email"}
                </p>

                {step === 2 && email && (
                  <div className="inline-block bg-[#f5e6d3] px-4 py-1.5 rounded-full mt-2">
                    <span className="text-body text-sm text-[#264B0E] font-medium">
                      {email}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 md:px-8 pb-8 space-y-6">
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
                      <Label
                        htmlFor="email"
                        className="text-body text-sm font-semibold text-gray-700"
                      >
                        Email Address
                      </Label>
                      <div className="relative">
                        <Mail
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                          strokeWidth={2}
                        />
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-11 h-12 text-base border-gray-300 focus:border-[#264B0E] focus:ring-[#264B0E]"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="btn-primary w-full h-12 text-base font-semibold flex items-center justify-center gap-2"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2
                            className="w-5 h-5 animate-spin"
                            strokeWidth={2.5}
                          />
                          <span>Sending OTP...</span>
                        </>
                      ) : (
                        <>
                          <Mail className="w-5 h-5" strokeWidth={2.5} />
                          <span>Send OTP</span>
                        </>
                      )}
                    </button>
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
                      <Label className="text-body text-sm font-semibold text-gray-700">
                        Verification Code
                      </Label>
                      <OtpInput value={otp} onChange={setOtp} />

                      {/* Resend Timer */}
                      <div className="text-center mt-4">
                        {canResend ? (
                          <button
                            type="button"
                            onClick={handleResendOtp}
                            disabled={loading}
                            className="text-body text-sm text-[#264B0E] hover:text-gold-bright font-semibold transition-colors inline-flex items-center gap-2"
                          >
                            <RefreshCw className="w-4 h-4" strokeWidth={2.5} />
                            Resend OTP
                          </button>
                        ) : (
                          <p className="text-body text-sm text-gray-600">
                            Didn't receive the code?{" "}
                            <span className="font-bold text-[#264B0E]">
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
                        className="text-body text-sm font-semibold text-gray-700"
                      >
                        New Password
                      </Label>
                      <div className="relative">
                        <Lock
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                          strokeWidth={2}
                        />
                        <Input
                          id="newPassword"
                          type={showPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="pl-11 pr-11 h-12 text-black text-base border-gray-300 focus:border-[#264B0E] focus:ring-[#264B0E]"
                          placeholder="Enter new password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#264B0E] transition-colors"
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5" strokeWidth={2} />
                          ) : (
                            <Eye className="w-5 h-5" strokeWidth={2} />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="confirmPassword"
                        className="text-body text-sm font-semibold text-gray-700"
                      >
                        Confirm Password
                      </Label>
                      <div className="relative">
                        <Lock
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                          strokeWidth={2}
                        />
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="pl-11 pr-11 h-12 text-black text-base border-gray-300 focus:border-[#264B0E] focus:ring-[#264B0E]"
                          placeholder="Confirm new password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#264B0E] transition-colors"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="w-5 h-5" strokeWidth={2} />
                          ) : (
                            <Eye className="w-5 h-5" strokeWidth={2} />
                          )}
                        </button>
                      </div>

                      {/* Password Match Indicator */}
                      {confirmPassword && (
                        <div
                          className={cn(
                            "flex items-center gap-2 text-body text-sm",
                            passwordsMatch ? "text-green-600" : "text-red-500",
                          )}
                        >
                          {passwordsMatch ? (
                            <>
                              <Check className="w-4 h-4" strokeWidth={3} />
                              <span>Passwords match</span>
                            </>
                          ) : (
                            <>
                              <X className="w-4 h-4" strokeWidth={3} />
                              <span>Passwords don't match</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Password Requirements */}
                    <div className="bg-[#f5e6d3]/30 rounded-lg p-4 space-y-2">
                      <p className="text-body text-xs font-bold text-[#264B0E] mb-2">
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

                    <button
                      type="submit"
                      className="btn-primary w-full h-12 text-base font-semibold flex items-center justify-center gap-2"
                      disabled={
                        loading ||
                        !isPasswordValid ||
                        !passwordsMatch ||
                        otp.length !== 6
                      }
                    >
                      {loading ? (
                        <>
                          <Loader2
                            className="w-5 h-5 animate-spin"
                            strokeWidth={2.5}
                          />
                          <span>Resetting Password...</span>
                        </>
                      ) : (
                        <>
                          <Key className="w-5 h-5" strokeWidth={2.5} />
                          <span>Reset Password</span>
                        </>
                      )}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>

              {/* Footer Links */}
              <div className="pt-4 border-t border-gray-200">
                <p className="text-center text-body text-sm text-gray-600">
                  Remember your password?{" "}
                  <Link
                    href="/login"
                    className="text-[#264B0E] font-bold hover:text-gold-bright transition-colors"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Additional Help */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center text-body text-sm text-white/70 mt-6"
        >
          Need help?{" "}
          <Link
            href="/get-in-touch"
            className="text-gold-bright hover:text-[#d4a574] font-medium transition-colors"
          >
            Contact Support
          </Link>
        </motion.p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   OTP INPUT COMPONENT
═══════════════════════════════════════════════════════════════ */
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
        otpArr[index] = "";
        onChange(otpArr.join(""));
      } else if (e.target.previousSibling) {
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
            "focus:outline-none focus:ring-2 focus:ring-gold-bright focus:border-transparent",
            "transition-all duration-200",
            value[i]
              ? "border-gold-bright bg-gold-bright/5"
              : "border-gray-300 bg-white",
          )}
        />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PASSWORD REQUIREMENT
═══════════════════════════════════════════════════════════════ */
function PasswordRequirement({ met, text }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-2"
    >
      <div
        className={cn(
          "w-4 h-4 rounded-full flex items-center justify-center shrink-0",
          met ? "bg-green-500" : "bg-gray-300",
        )}
      >
        {met && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
      </div>
      <span
        className={cn(
          "text-body text-xs",
          met ? "text-green-700 font-semibold" : "text-gray-600",
        )}
      >
        {text}
      </span>
    </motion.div>
  );
}
