"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  Mail,
  Lock,
  ArrowRight,
  Shield,
  AlertCircle,
  X,
  Eye,
  EyeOff,
} from "lucide-react";
import toast from "react-hot-toast";

import { useUserStore } from "@/stores/useUserStore";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function LoginPage() {
  const router = useRouter();
  const { login, loading, forgotPassword, resetPassword } = useUserStore();

  // Login Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Forgot Password State
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: email, 2: otp, 3: new password
  const [forgotEmail, setForgotEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  // Validate Email
  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Handle Login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    // Validation
    const newErrors = {};
    if (!email) newErrors.email = "Email is required";
    else if (!validateEmail(email)) newErrors.email = "Invalid email format";
    if (!password) newErrors.password = "Password is required";
    else if (password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const ok = await login({ email, password });
    if (ok) {
      router.replace("/admin");
    } else {
      toast.error("Invalid credentials. Please try again.");
    }
  };

  // Handle Forgot Password - Step 1: Send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!validateEmail(forgotEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setForgotLoading(true);
    const success = await forgotPassword(forgotEmail);
    setForgotLoading(false);

    if (success) {
      setForgotStep(2);
    } else {
      toast.error("Failed to send OTP. Please try again.");
    }
  };

  // Handle Forgot Password - Step 2: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setForgotLoading(true);
    const success = await resetPassword({
      email: forgotEmail,
      otp,
      newPassword,
    });
    setForgotLoading(false);

    if (success) {
      setShowForgotPassword(false);
      setForgotStep(1);
      setForgotEmail("");
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password reset successfully! Please login.");
    } else {
      toast.error("Failed to reset password. Please check your OTP.");
    }
  };

  // Close Forgot Password Modal
  const closeForgotPassword = () => {
    setShowForgotPassword(false);
    setForgotStep(1);
    setForgotEmail("");
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
      {/* LEFT BRAND PANEL */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="hidden lg:flex flex-col justify-center px-12 xl:px-20 bg-linear-to-br from-[#12351a] via-[#0f2916] to-[#0b1f11] relative overflow-hidden"
      >
        {/* Decorative Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-[#d4af37] rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-emerald-500 rounded-full blur-3xl" />
        </div>

        {/* Content */}
        <div className="relative z-10">
          {/* Logo */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center justify-center bg-[#f6f2e9]/95 backdrop-blur-sm px-8 py-5 rounded-2xl w-fit mb-12 shadow-2xl border border-white/20"
          >
            <Image
              src="/paan-logo.png"
              alt="Paanshala"
              width={240}
              height={90}
              priority
              className="object-contain"
            />
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <h1 className="text-5xl xl:text-6xl font-serif text-[#f6f2e9] mb-6 leading-tight">
              Admin Panel
            </h1>
            <div className="flex items-center gap-3 mb-8">
              <Shield className="w-6 h-6 text-[#d4af37]" />
              <p className="text-xl text-[#d4af37] font-medium">
                Secure Access Portal
              </p>
            </div>
          </motion.div>

          {/* Description */}
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-base leading-relaxed text-[#d8d2c2] max-w-md mb-8"
          >
            Administrative access for managing Paanshala's platform.
            <br />
            Rooted in royal Rajasthani heritage, secured for internal use only.
          </motion.p>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="origin-left"
          >
            <Separator className="bg-linear-to-r from-[#d4af37]/60 via-[#d4af37]/30 to-transparent" />
          </motion.div>

          {/* Security Badge */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mt-12 inline-flex items-center gap-3 bg-white/5 backdrop-blur-sm px-6 py-3 rounded-full border border-white/10"
          >
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-sm text-[#d8d2c2]">
              Secure Connection Established
            </span>
          </motion.div>
        </div>
      </motion.div>

      {/* RIGHT LOGIN FORM */}
      <div className="flex items-center justify-center bg-linear-to-br from-[#f6f2e9] to-[#ede7d9] px-6 py-12 relative">
        {/* Decorative gradient orb */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-linear-to-br from-[#12351a]/5 to-transparent rounded-full blur-3xl" />

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-md relative z-10"
        >
          <Card className="border-[#d8ccb4] shadow-[0_20px_60px_rgba(18,53,26,0.15)] backdrop-blur-sm bg-white/95">
            <CardHeader className="space-y-3 pb-8">
              {/* MOBILE LOGO */}
              <div className="lg:hidden flex justify-center mb-6">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-[#f6f2e9]/95 backdrop-blur-sm px-6 py-3 rounded-xl shadow-lg"
                >
                  <Image
                    src="/paan-logo.png"
                    alt="Paanshala"
                    width={160}
                    height={60}
                  />
                </motion.div>
              </div>

              <div className="text-center lg:text-left">
                <CardTitle className="text-3xl text-[#12351a] font-bold mb-2">
                  Admin Login
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Enter your credentials to access the admin panel
                </p>
              </div>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* EMAIL */}
                <div className="space-y-2">
                  <Label className="text-[#2b2b2b] font-medium flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#12351a]" />
                    Email Address
                  </Label>
                  <div className="relative">
                    <Input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setErrors({ ...errors, email: "" });
                      }}
                      placeholder="admin@paanshala.com"
                      className={`
                        bg-white
                        border-2
                        ${errors.email ? "border-red-400" : "border-[#cbbf9e]"}
                        text-[#1f1f1f]
                        pl-4
                        h-12
                        transition-all
                        focus-visible:ring-2
                        focus-visible:ring-[#12351a]/20
                        focus-visible:border-[#12351a]
                      `}
                    />
                    {errors.email && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs text-red-500 mt-1 flex items-center gap-1"
                      >
                        <AlertCircle className="w-3 h-3" />
                        {errors.email}
                      </motion.p>
                    )}
                  </div>
                </div>

                {/* PASSWORD */}
                <div className="space-y-2">
                  <Label className="text-[#2b2b2b] font-medium flex items-center gap-2">
                    <Lock className="w-4 h-4 text-[#12351a]" />
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setErrors({ ...errors, password: "" });
                      }}
                      placeholder="••••••••"
                      className={`
      bg-white
      border-2
      ${errors.password ? "border-red-400" : "border-[#cbbf9e]"}
      text-[#1f1f1f]
      pl-4 pr-12
      h-12
      transition-all
      focus-visible:ring-2
      focus-visible:ring-[#12351a]/20
      focus-visible:border-[#12351a]
    `}
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#12351a]"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>

                    {errors.password && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs text-red-500 mt-1 flex items-center gap-1"
                      >
                        <AlertCircle className="w-3 h-3" />
                        {errors.password}
                      </motion.p>
                    )}
                  </div>
                </div>

                {/* Forgot Password Link */}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm text-[#12351a] hover:text-[#0b1f11] font-medium underline-offset-4 hover:underline transition-all"
                  >
                    Forgot Password?
                  </button>
                </div>

                {/* SUBMIT BUTTON */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="
                    w-full
                    h-12
                    bg-linear-to-r from-[#12351a] to-[#0f2916]
                    hover:from-[#0f2916] hover:to-[#0b1f11]
                    text-white
                    font-semibold
                    text-base
                    shadow-lg
                    hover:shadow-xl
                    transition-all
                    duration-300
                    group
                  "
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    <>
                      Sign In to Admin Panel
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </form>

              {/* Footer */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                  <Shield className="w-3.5 h-3.5" />
                  <span>
                    Authorized administrators only · ©{" "}
                    {new Date().getFullYear()} Paanshala
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* FORGOT PASSWORD MODAL */}
      <AnimatePresence>
        {showForgotPassword && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeForgotPassword}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            {/* Modal */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <Card className="w-full max-w-md bg-white shadow-2xl border-[#d8ccb4]">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl text-[#12351a]">
                      {forgotStep === 1
                        ? "Reset Password"
                        : "Enter OTP & New Password"}
                    </CardTitle>
                    <button
                      onClick={closeForgotPassword}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {forgotStep === 1
                      ? "Enter your email to receive a reset OTP"
                      : "Check your email for the OTP and create a new password"}
                  </p>
                </CardHeader>

                <CardContent>
                  {forgotStep === 1 ? (
                    <form onSubmit={handleSendOTP} className="space-y-5">
                      <div className="space-y-2">
                        <Label className="text-[#2b2b2b] font-medium">
                          Email Address
                        </Label>
                        <Input
                          type="email"
                          required
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          placeholder="admin@paanshala.com"
                          className="h-12 border-2 text-[#1f1f1f] border-[#cbbf9e] focus-visible:border-[#12351a]"
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={forgotLoading}
                        className="w-full h-12 bg-[#12351a] hover:bg-[#0f2916]"
                      >
                        {forgotLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending OTP...
                          </>
                        ) : (
                          "Send Reset OTP"
                        )}
                      </Button>
                    </form>
                  ) : (
                    <form onSubmit={handleResetPassword} className="space-y-5">
                      <div className="space-y-2">
                        <Label className="text-[#2b2b2b] font-medium">
                          OTP Code
                        </Label>
                        <Input
                          type="text"
                          required
                          maxLength={6}
                          value={otp}
                          onChange={(e) =>
                            setOtp(e.target.value.replace(/\D/g, ""))
                          }
                          placeholder="000000"
                          className="h-12 border-2 text-[#1f1f1f] border-[#cbbf9e] focus-visible:border-[#12351a] text-center text-2xl tracking-widest font-mono"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[#2b2b2b] font-medium">
                          New Password
                        </Label>
                        <div className="relative">
                          <Input
                            type={showNewPassword ? "text" : "password"}
                            required
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="••••••••"
                            className="h-12 border-2 text-[#1f1f1f] border-[#cbbf9e] focus-visible:border-[#12351a] pr-12"
                          />

                          <button
                            type="button"
                            onClick={() => setShowNewPassword((p) => !p)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#12351a]"
                            aria-label={
                              showNewPassword
                                ? "Hide password"
                                : "Show password"
                            }
                          >
                            {showNewPassword ? (
                              <EyeOff className="w-5 h-5" />
                            ) : (
                              <Eye className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[#2b2b2b] font-medium">
                          Confirm Password
                        </Label>
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            className="h-12 border-2 text-[#1f1f1f] border-[#cbbf9e] focus-visible:border-[#12351a] pr-12"
                          />

                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword((p) => !p)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#12351a]"
                            aria-label={
                              showConfirmPassword
                                ? "Hide password"
                                : "Show password"
                            }
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="w-5 h-5" />
                            ) : (
                              <Eye className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {newPassword &&
                        confirmPassword &&
                        newPassword !== confirmPassword && (
                          <Alert variant="destructive" className="py-2">
                            <AlertCircle className="h-4 w-4 text-red-500 " />
                            <AlertDescription className="text-xs text-red-400">
                              Passwords do not match
                            </AlertDescription>
                          </Alert>
                        )}

                      <div className="flex gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setForgotStep(1)}
                          className="flex-1 h-12"
                        >
                          Back
                        </Button>
                        <Button
                          type="submit"
                          disabled={forgotLoading}
                          className="flex-1 h-12 bg-[#12351a] hover:bg-[#0f2916]"
                        >
                          {forgotLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Resetting...
                            </>
                          ) : (
                            "Reset Password"
                          )}
                        </Button>
                      </div>
                    </form>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
