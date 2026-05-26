"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, Mail, Lock, LogIn } from "lucide-react";

import { useUserStore } from "@/stores/useUserStore";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const { login, loading } = useUserStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const success = await login({ email, password });
    if (success) {
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#264B0E] via-brand-green-dark to-[#264B0E] px-4 py-12">
      <div className="w-full max-w-md">
        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="card-premium bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="text-center space-y-2 pt-8 pb-6 px-6 bg-linear-to-b from-[#f5e6d3]/30 to-transparent">
              <h1 className="text-heading text-3xl md:text-4xl text-[#264B0E] uppercase tracking-wide">
                Welcome Back
              </h1>
              <p className="text-body text-sm text-gray-600">
                Login to continue your shopping journey
              </p>
            </div>

            <div className="px-6 md:px-8 pb-8">
              <form onSubmit={handleSubmit} className="space-y-5">
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
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
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
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-11 pr-11 h-12 text-base text-black border-gray-300 focus:border-[#264B0E] focus:ring-[#264B0E]"
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
                </div>

                {/* Forgot Password */}
                <div className="flex justify-end">
                  <Link
                    href="/forgot-password"
                    className="text-body text-sm text-[#264B0E] hover:text-gold-bright font-medium transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>

                {/* Submit Button */}
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
                      <span>Logging in...</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5" strokeWidth={2.5} />
                      <span>Login</span>
                    </>
                  )}
                </button>

                {/* Divider */}
                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-4 bg-white text-body text-sm text-gray-500">
                      New to Paanshala?
                    </span>
                  </div>
                </div>

                {/* Register Link */}
                <Link href="/register">
                  <button
                    type="button"
                    className="btn-outline w-full h-12 text-base font-semibold border-[#264B0E] text-[#264B0E] hover:bg-[#264B0E] hover:text-white"
                  >
                    Create Account
                  </button>
                </Link>
              </form>
            </div>
          </div>
        </motion.div>

        {/* Footer Links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 text-center"
        >
          <p className="text-body text-sm text-white/70">
            By continuing, you agree to our{" "}
            <Link
              href="/terms"
              className="text-gold-bright hover:text-[#d4a574] font-medium transition-colors"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="text-gold-bright hover:text-[#d4a574] font-medium transition-colors"
            >
              Privacy Policy
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}