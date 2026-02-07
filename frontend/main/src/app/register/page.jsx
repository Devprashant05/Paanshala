"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useUserStore } from "@/stores/useUserStore";
import {
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Lock,
  User,
  Check,
  X,
  ArrowLeft,
  Shield,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export default function RegisterPage() {
  const router = useRouter();
  const { register, verifyOtp, resendOtp, loading } = useUserStore();

  const [step, setStep] = useState("register"); // register | otp
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const RESEND_TIME = 300; // 5 minutes
  const [timer, setTimer] = useState(RESEND_TIME);
  const [canResend, setCanResend] = useState(false);

  // Password validation rules
  const passwordRules = {
    length: form.password.length >= 8,
    upper: /[A-Z]/.test(form.password),
    lower: /[a-z]/.test(form.password),
    number: /[0-9]/.test(form.password),
    special: /[^A-Za-z0-9]/.test(form.password),
  };

  const isPasswordValid = Object.values(passwordRules).every(Boolean);
  const passwordsMatch =
    form.password === form.confirmPassword && form.confirmPassword.length > 0;

  // Password strength
  const passwordStrength = Object.values(passwordRules).filter(Boolean).length;
  const strengthPercent = (passwordStrength / 5) * 100;

  // Timer countdown
  useEffect(() => {
    if (step !== "otp" || canResend) return;

    if (timer <= 0) {
      setCanResend(true);
      return;
    }

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer, canResend, step]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // Register handler
  const handleRegister = async (e) => {
    e.preventDefault();

    if (!isPasswordValid || !passwordsMatch) {
      return;
    }

    const success = await register({
      full_name: form.full_name,
      email: form.email,
      password: form.password,
    });

    if (success) {
      setStep("otp");
      setTimer(RESEND_TIME);
      setCanResend(false);
    }
  };

  // Verify OTP handler
  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (otp.length !== 6) return;

    const success = await verifyOtp({
      email: form.email,
      otp: otp,
    });

    if (success) {
      router.push("/");
    }
  };

  // Resend OTP handler
  const handleResendOtp = async () => {
    const success = await resendOtp(form.email);

    if (success) {
      setTimer(RESEND_TIME);
      setCanResend(false);
      setOtp("");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#0b1f11] to-[#1a3d1f] px-4 py-8">
      <div className="w-full max-w-md">
        {/* Back to Login */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="shadow-2xl border-0">
            <CardHeader className="text-center space-y-3 pb-6">
              {/* Icon */}
              <div className="mx-auto w-16 h-16 bg-linear-to-br from-[#d4af37] to-[#f4d03f] rounded-full flex items-center justify-center">
                {step === "register" ? (
                  <User className="w-8 h-8 text-[#0b1f11]" />
                ) : (
                  <Shield className="w-8 h-8 text-[#0b1f11]" />
                )}
              </div>

              <div>
                <CardTitle className="text-2xl md:text-3xl font-bold text-[#0b1f11]">
                  {step === "register" ? "Create Account" : "Verify Email"}
                </CardTitle>
                <p className="text-sm text-gray-500 mt-2">
                  {step === "register"
                    ? "Join Paanshala and start your journey"
                    : "Enter the code sent to your email"}
                </p>
              </div>

              {/* Step Indicator */}
              <div className="flex items-center justify-center gap-2 pt-2">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors",
                    step === "register"
                      ? "bg-[#d4af37] text-white"
                      : "bg-green-500 text-white",
                  )}
                >
                  {step === "register" ? "1" : <Check className="w-4 h-4" />}
                </div>
                <div className="w-12 h-0.5 bg-gray-200">
                  <div
                    className={cn(
                      "h-full bg-[#d4af37] transition-all duration-500",
                      step === "otp" ? "w-full" : "w-0",
                    )}
                  />
                </div>
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors",
                    step === "otp"
                      ? "bg-[#d4af37] text-white"
                      : "bg-gray-200 text-gray-400",
                  )}
                >
                  2
                </div>
              </div>
            </CardHeader>

            <CardContent className="px-6 pb-6">
              <AnimatePresence mode="wait">
                {step === "register" ? (
                  /* ================= REGISTER FORM ================= */
                  <motion.form
                    key="register"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    onSubmit={handleRegister}
                    className="space-y-5"
                  >
                    {/* Full Name */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="full_name"
                        className="text-sm font-medium"
                      >
                        Full Name
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          id="full_name"
                          type="text"
                          placeholder="John Doe"
                          value={form.full_name}
                          onChange={(e) =>
                            setForm({ ...form, full_name: e.target.value })
                          }
                          className="pl-10 h-12 text-base"
                          required
                          disabled={loading}
                        />
                      </div>
                    </div>

                    {/* Email */}
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
                          value={form.email}
                          onChange={(e) =>
                            setForm({ ...form, email: e.target.value })
                          }
                          className="pl-10 h-12 text-base"
                          required
                          disabled={loading}
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-medium">
                        Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={form.password}
                          onChange={(e) =>
                            setForm({ ...form, password: e.target.value })
                          }
                          className="pl-10 pr-10 h-12 text-base"
                          placeholder="Create a strong password"
                          required
                          disabled={loading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>

                      {/* Password Strength */}
                      {form.password && (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500">
                              Password strength
                            </span>
                            <span
                              className={cn(
                                "font-medium",
                                strengthPercent < 40 && "text-red-500",
                                strengthPercent >= 40 &&
                                  strengthPercent < 80 &&
                                  "text-yellow-500",
                                strengthPercent >= 80 && "text-green-500",
                              )}
                            >
                              {strengthPercent < 40
                                ? "Weak"
                                : strengthPercent < 80
                                  ? "Medium"
                                  : "Strong"}
                            </span>
                          </div>
                          <Progress
                            value={strengthPercent}
                            className={cn(
                              "h-1.5",
                              strengthPercent < 40 && "[&>div]:bg-red-500",
                              strengthPercent >= 40 &&
                                strengthPercent < 80 &&
                                "[&>div]:bg-yellow-500",
                              strengthPercent >= 80 && "[&>div]:bg-green-500",
                            )}
                          />
                        </div>
                      )}
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
                          value={form.confirmPassword}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              confirmPassword: e.target.value,
                            })
                          }
                          className="pl-10 pr-10 h-12 text-base"
                          placeholder="Confirm your password"
                          required
                          disabled={loading}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>

                      {/* Password Match Indicator */}
                      {form.confirmPassword && (
                        <div
                          className={cn(
                            "flex items-center gap-2 text-xs",
                            passwordsMatch ? "text-green-600" : "text-red-500",
                          )}
                        >
                          {passwordsMatch ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              Passwords match
                            </>
                          ) : (
                            <>
                              <X className="w-3.5 h-3.5" />
                              Passwords don't match
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Password Requirements */}
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <p className="text-xs font-semibold text-gray-700 mb-2">
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
                      className="w-full h-12 bg-linear-to-r from-[#2d5016] to-[#3d6820] hover:opacity-90 text-base font-semibold"
                      disabled={
                        loading ||
                        !isPasswordValid ||
                        !passwordsMatch ||
                        !form.full_name ||
                        !form.email
                      }
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Creating Account...
                        </>
                      ) : (
                        "Create Account"
                      )}
                    </Button>
                  </motion.form>
                ) : (
                  /* ================= OTP VERIFICATION ================= */
                  <motion.form
                    key="otp"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    onSubmit={handleVerifyOtp}
                    className="space-y-6"
                  >
                    {/* Email Display */}
                    <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">
                        {form.email}
                      </span>
                    </div>

                    {/* OTP Input */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Enter 6-Digit OTP
                      </Label>
                      <OtpInput value={otp} onChange={setOtp} />
                    </div>

                    {/* Resend OTP */}
                    <div className="text-center">
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

                    <Button
                      type="submit"
                      className="w-full h-12 bg-linear-to-r from-[#2d5016] to-[#3d6820] hover:opacity-90 text-base font-semibold"
                      disabled={loading || otp.length !== 6}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          <Shield className="w-5 h-5 mr-2" />
                          Verify & Continue
                        </>
                      )}
                    </Button>
                  </motion.form>
                )}
              </AnimatePresence>

              {/* Footer */}
              <div className="mt-6 text-center text-sm text-gray-600">
                {step === "register" ? (
                  <>
                    Already have an account?{" "}
                    <Link
                      href="/login"
                      className="text-[#2d5016] font-semibold hover:text-[#3d6820] hover:underline transition-colors"
                    >
                      Login
                    </Link>
                  </>
                ) : (
                  <>
                    Wrong email?{" "}
                    <button
                      type="button"
                      onClick={() => setStep("register")}
                      className="text-[#2d5016] font-semibold hover:text-[#3d6820] hover:underline transition-colors"
                    >
                      Go Back
                    </button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Security Note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center text-xs text-white/60 mt-6"
        >
          🔒 Your information is encrypted and secure
        </motion.p>
      </div>
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
    if (val && e.target.nextSibling) {
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
      onChange(pasted);
      const lastIndex = Math.min(pasted.length - 1, 5);
      const inputs = e.currentTarget.querySelectorAll("input");
      if (inputs[lastIndex]) {
        inputs[lastIndex].focus();
      }
    }
  };

  return (
    <div className="flex justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
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
            "w-10 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-bold",
            "border-2 rounded-lg",
            "focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-transparent",
            "transition-all duration-200",
            value[i]
              ? "border-[#d4af37] bg-[#d4af37]/5"
              : "border-gray-300 hover:border-gray-400",
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
    <div className="flex items-center gap-2">
      <div
        className={cn(
          "w-4 h-4 rounded-full flex items-center justify-center shrink-0",
          met ? "bg-green-500" : "bg-gray-300",
        )}
      >
        {met && <Check className="w-3 h-3 text-white" />}
      </div>
      <span
        className={cn(
          "text-xs",
          met ? "text-green-700 font-medium" : "text-gray-600",
        )}
      >
        {text}
      </span>
    </div>
  );
}
