"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
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

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";

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
        >
          <div className="card-premium bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="text-center space-y-3 pt-8 pb-6 px-6 bg-linear-to-b from-[#f5e6d3]/30 to-transparent">
              {/* Icon */}
              <div className="mx-auto w-16 h-16 bg-linear-to-br from-gold-bright to-[#d4a574] rounded-full flex items-center justify-center shadow-lg">
                {step === "register" ? (
                  <User className="w-8 h-8 text-white" strokeWidth={2.5} />
                ) : (
                  <Shield className="w-8 h-8 text-white" strokeWidth={2.5} />
                )}
              </div>

              <div>
                <h1 className="text-heading text-3xl md:text-4xl text-[#264B0E] uppercase tracking-wide">
                  {step === "register" ? "Create Account" : "Verify Email"}
                </h1>
                <p className="text-body text-sm text-gray-600 mt-2">
                  {step === "register"
                    ? "Join Paanshala and start your journey"
                    : "Enter the code sent to your email"}
                </p>
              </div>

              {/* Step Indicator */}
              <div className="flex items-center justify-center gap-2 pt-2">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
                    step === "register"
                      ? "bg-gold-bright text-white"
                      : "bg-green-500 text-white",
                  )}
                >
                  {step === "register" ? (
                    "1"
                  ) : (
                    <Check className="w-4 h-4" strokeWidth={3} />
                  )}
                </div>
                <div className="w-12 h-0.5 bg-gray-200">
                  <div
                    className={cn(
                      "h-full bg-gold-bright transition-all duration-500",
                      step === "otp" ? "w-full" : "w-0",
                    )}
                  />
                </div>
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
                    step === "otp"
                      ? "bg-gold-bright text-white"
                      : "bg-gray-200 text-gray-400",
                  )}
                >
                  2
                </div>
              </div>
            </div>

            <div className="px-6 md:px-8 pb-8">
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
                        className="text-body text-sm font-semibold text-gray-700"
                      >
                        Full Name
                      </Label>
                      <div className="relative">
                        <User
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                          strokeWidth={2}
                        />
                        <Input
                          id="full_name"
                          type="text"
                          placeholder="John Doe"
                          value={form.full_name}
                          onChange={(e) =>
                            setForm({ ...form, full_name: e.target.value })
                          }
                          className="pl-11 h-12 text-base border-gray-300 focus:border-[#264B0E] focus:ring-[#264B0E]"
                          required
                          disabled={loading}
                        />
                      </div>
                    </div>

                    {/* Email */}
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
                          value={form.email}
                          onChange={(e) =>
                            setForm({ ...form, email: e.target.value })
                          }
                          className="pl-11 h-12 text-base border-gray-300 focus:border-[#264B0E] focus:ring-[#264B0E]"
                          required
                          disabled={loading}
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="password"
                        className="text-body text-sm font-semibold text-gray-700"
                      >
                        Password
                      </Label>
                      <div className="relative">
                        <Lock
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                          strokeWidth={2}
                        />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={form.password}
                          onChange={(e) =>
                            setForm({ ...form, password: e.target.value })
                          }
                          className="pl-11 pr-11 h-12 text-black text-base border-gray-300 focus:border-[#264B0E] focus:ring-[#264B0E]"
                          placeholder="Create a strong password"
                          required
                          disabled={loading}
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

                      {/* Password Strength */}
                      {form.password && (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-body text-gray-500">
                              Password strength
                            </span>
                            <span
                              className={cn(
                                "text-body font-semibold",
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
                          value={form.confirmPassword}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              confirmPassword: e.target.value,
                            })
                          }
                          className="pl-11 pr-11 h-12 text-black text-base border-gray-300 focus:border-[#264B0E] focus:ring-[#264B0E]"
                          placeholder="Confirm your password"
                          required
                          disabled={loading}
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
                      {form.confirmPassword && (
                        <div
                          className={cn(
                            "flex items-center gap-2 text-xs text-body",
                            passwordsMatch ? "text-green-600" : "text-red-500",
                          )}
                        >
                          {passwordsMatch ? (
                            <>
                              <Check className="w-3.5 h-3.5" strokeWidth={3} />
                              Passwords match
                            </>
                          ) : (
                            <>
                              <X className="w-3.5 h-3.5" strokeWidth={3} />
                              Passwords don't match
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
                      className="btn-primary w-full h-12 text-base font-semibold"
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
                          <Loader2
                            className="w-5 h-5 mr-2 animate-spin"
                            strokeWidth={2.5}
                          />
                          Creating Account...
                        </>
                      ) : (
                        "Create Account"
                      )}
                    </button>
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
                    <div className="bg-[#f5e6d3]/30 rounded-lg p-3 flex items-center gap-2">
                      <Mail
                        className="w-4 h-4 text-[#264B0E]"
                        strokeWidth={2.5}
                      />
                      <span className="text-body text-sm text-[#264B0E] font-medium">
                        {form.email}
                      </span>
                    </div>

                    {/* OTP Input */}
                    <div className="space-y-2">
                      <Label className="text-body text-sm font-semibold text-gray-700">
                        Enter 6-Digit OTP
                      </Label>
                      <OtpInput value={otp} onChange={setOtp} />
                    </div>

                    {/* Resend OTP */}
                    <div className="text-center">
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

                    <button
                      type="submit"
                      className="btn-primary w-full h-12 text-base font-semibold flex items-center justify-center gap-2"
                      disabled={loading || otp.length !== 6}
                    >
                      {loading ? (
                        <>
                          <Loader2
                            className="w-5 h-5 animate-spin"
                            strokeWidth={2.5}
                          />
                          Verifying...
                        </>
                      ) : (
                        <>
                          <Shield className="w-5 h-5" strokeWidth={2.5} />
                          Verify & Continue
                        </>
                      )}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>

              {/* Footer */}
              <div className="mt-6 text-center text-body text-sm text-gray-600">
                {step === "register" ? (
                  <>
                    Already have an account?{" "}
                    <Link
                      href="/login"
                      className="text-[#264B0E] font-bold hover:text-gold-bright transition-colors"
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
                      className="text-[#264B0E] font-bold hover:text-gold-bright transition-colors"
                    >
                      Go Back
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Security Note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center text-body text-xs text-white/70 mt-6"
        >
          🔒 Your information is encrypted and secure
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
            "focus:outline-none focus:ring-2 focus:ring-gold-bright focus:border-transparent",
            "transition-all duration-200",
            value[i]
              ? "border-gold-bright bg-gold-bright/5"
              : "border-gray-300 hover:border-gray-400",
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
    <div className="flex items-center gap-2">
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
    </div>
  );
}