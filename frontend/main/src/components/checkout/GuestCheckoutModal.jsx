"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  CreditCard,
  ShoppingBag,
  Lock,
  CheckCircle,
  Loader2,
  User,
  Phone,
  Mail,
  Building2,
  Navigation,
  AlertTriangle,
  CheckCircle2,
  X,
  ArrowLeft,
  ArrowRight,
  Sparkles,
} from "lucide-react";

import { useGuestCheckoutUIStore } from "@/stores/useGuestCheckoutUIStore";
import { useGuestCartStore } from "@/stores/useGuestCartStore";
import { useCouponStore } from "@/stores/useCouponStore";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import api from "@/lib/axios";

/* ── Razorpay loader ── */
const loadRazorpay = () =>
  new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

const EMPTY_FORM = {
  fullName: "",
  companyName: "",
  streetAddress: "",
  landmark: "",
  city: "",
  state: "",
  pincode: "",
  phone: "",
  email: "",
};

/* ── Step meta ── */
const STEPS = [
  { id: "phone", label: "Contact", icon: Phone },
  { id: "address", label: "Address", icon: MapPin },
  { id: "review", label: "Pay", icon: CreditCard },
];

export default function GuestCheckoutModal() {
  const { isOpen, closeGuestCheckout } = useGuestCheckoutUIStore();
  const router = useRouter();
  const { items, clearCart } = useGuestCartStore();
  const { coupon: appliedCoupon, clearCoupon } = useCouponStore();

  const [step, setStep] = useState(0); // 0=phone, 1=address, 2=review
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);

  const orderCompleted = useRef(false);

  /* ── body scroll lock ── */
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  /* ── reset on open ── */
  useEffect(() => {
    if (isOpen) {
      setStep(0);
      setForm(EMPTY_FORM);
      setErrors({});
      setAgree(false);
      orderCompleted.current = false;
    }
  }, [isOpen]);

  /* ── pricing (must be above early return — hooks can't be conditional) ── */
  const subtotal = items.reduce((s, i) => s + i.totalPrice, 0);
  const discountAmt = useMemo(() => {
    if (!appliedCoupon) return 0;
    let d =
      appliedCoupon.discountType === "percentage"
        ? (subtotal * appliedCoupon.discountValue) / 100
        : appliedCoupon.discountValue;
    if (appliedCoupon.maxDiscount) d = Math.min(d, appliedCoupon.maxDiscount);
    return Math.min(d, subtotal);
  }, [appliedCoupon, subtotal]);
  const total = Math.max(0, subtotal - discountAmt);

  if (!isOpen) return null;

  /* ── field setter ── */
  const setField = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => {
      const n = { ...e };
      delete n[k];
      return n;
    });
  };

  /* ── per-step validation ── */
  const validateStep = (s) => {
    const e = {};
    if (s === 0) {
      if (!/^\d{10}$/.test(form.phone))
        e.phone = "Enter a valid 10-digit number";
      if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
        e.email = "Enter a valid email";
      if (!form.fullName.trim()) e.fullName = "Full name is required";
    }
    if (s === 1) {
      if (!form.streetAddress.trim())
        e.streetAddress = "Street address is required";
      if (!form.city.trim()) e.city = "City is required";
      if (!form.state) e.state = "State is required";
      if (!/^\d{6}$/.test(form.pincode))
        e.pincode = "Enter a valid 6-digit pincode";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const goNext = () => {
    if (!validateStep(step)) return;
    setStep((s) => s + 1);
  };

  const goBack = () => {
    setErrors({});
    setStep((s) => s - 1);
  };

  /* ── payment ── */
  const handlePay = async () => {
    if (!agree) {
      toast.error("Please agree to the Terms & Conditions");
      return;
    }

    const loaded = await loadRazorpay();
    if (!loaded) {
      toast.error("Razorpay failed to load");
      return;
    }

    setLoading(true);
    try {
      const { data: payData } = await api.post("/orders/guest/create-payment", {
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          variantSetSize: i.variantSetSize,
        })),
        couponCode: appliedCoupon?.code || null,
      });

      if (!payData?.razorpayOrder) {
        toast.error("Failed to initiate payment");
        setLoading(false);
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
        amount: payData.razorpayOrder.amount,
        currency: "INR",
        name: "Paanshala",
        description: "Order Payment",
        order_id: payData.razorpayOrder.id,
        prefill: {
          name: form.fullName,
          email: form.email,
          contact: form.phone,
        },
        handler: async (response) => {
          try {
            const { data: orderData } = await api.post("/orders/guest/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              items: items.map((i) => ({
                productId: i.productId,
                quantity: i.quantity,
                variantSetSize: i.variantSetSize,
              })),
              couponCode: appliedCoupon?.code || null,
              ...form,
            });

            orderCompleted.current = true;
            clearCart();
            clearCoupon();
            closeGuestCheckout();

            toast.success(
              orderData.isNewUser
                ? "Order placed! We've created an account — check your email."
                : "Order placed successfully! 🎉",
            );
            router.push(`/`);
          } catch (err) {
            toast.error(
              err?.response?.data?.message || "Order verification failed",
            );
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            toast.error("Payment cancelled");
            setLoading(false);
          },
        },
        theme: { color: "#2d5016" },
      };

      new window.Razorpay(options).open();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={closeGuestCheckout}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-70"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        transition={{ type: "spring", damping: 28, stiffness: 320 }}
        className="fixed inset-0 z-80 flex items-center justify-center p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
          {/* ── Header ── */}
          <div className="relative shrink-0 bg-linear-to-r from-[#2d5016] via-[#3d6820] to-[#2d5016] px-6 py-5">
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage:
                  "radial-gradient(circle, rgba(212,175,55,0.18) 1px, transparent 1px)",
                backgroundSize: "22px 22px",
              }}
            />
            <div className="relative flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <Sparkles className="w-4 h-4 text-[#d4af37]" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/70">
                    Guest Checkout
                  </span>
                </div>
                <h2
                  className="text-xl font-extrabold text-white"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  {STEPS[step].label === "Contact"
                    ? "Your Details"
                    : STEPS[step].label === "Address"
                      ? "Delivery Address"
                      : "Review & Pay"}
                </h2>
              </div>

              {/* Step pills */}
              <div className="hidden sm:flex items-center gap-1.5">
                {STEPS.map((s, i) => (
                  <div key={s.id} className="flex items-center gap-1.5">
                    <div
                      className={cn(
                        "flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-bold transition-all",
                        step === i
                          ? "bg-[#d4af37] text-black"
                          : step > i
                            ? "bg-white/20 text-white"
                            : "bg-white/10 text-white/40",
                      )}
                    >
                      {step > i ? (
                        <CheckCircle className="w-3 h-3" />
                      ) : (
                        <span>{i + 1}</span>
                      )}
                      {s.label}
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className="w-3 h-px bg-white/25" />
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={closeGuestCheckout}
                className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {/* Gold line */}
          <div className="h-0.75 bg-linear-to-r from-transparent via-[#d4af37] to-transparent shrink-0" />

          {/* ── Body ── */}
          <div className="flex-1 overflow-y-auto">
            <AnimatePresence mode="wait" initial={false}>
              {/* ════ STEP 0 — Phone / Contact ════ */}
              {step === 0 && (
                <motion.div
                  key="step-contact"
                  initial={{ opacity: 0, x: -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 24 }}
                  transition={{ duration: 0.22 }}
                  className="p-6 space-y-6"
                >
                  {/* Sign-in nudge */}
                  <div className="bg-[#2d5016]/5 border border-[#2d5016]/20 rounded-2xl px-4 py-3.5 flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#2d5016] shrink-0 mt-0.5" />
                    <p className="text-xs text-gray-600 leading-relaxed">
                      No account needed. Already have one?{" "}
                      <Link
                        href="/login"
                        onClick={closeGuestCheckout}
                        className="text-[#2d5016] font-semibold underline"
                      >
                        Sign in
                      </Link>{" "}
                      for a faster checkout.
                    </p>
                  </div>

                  {/* Full name */}
                  <Field
                    label="Full Name *"
                    error={errors.fullName}
                    icon={<User className="w-4 h-4" />}
                  >
                    <Input
                      value={form.fullName}
                      onChange={(e) => setField("fullName", e.target.value)}
                      placeholder="Rahul Sharma"
                      className={cn(
                        "h-11 pl-10",
                        errors.fullName && "border-red-400",
                      )}
                    />
                  </Field>

                  {/* Phone */}
                  <Field
                    label="Mobile Number *"
                    error={errors.phone}
                    icon={<Phone className="w-4 h-4" />}
                  >
                    <Input
                      value={form.phone}
                      onChange={(e) =>
                        setField(
                          "phone",
                          e.target.value.replace(/\D/g, "").slice(0, 10),
                        )
                      }
                      placeholder="10-digit mobile number"
                      inputMode="numeric"
                      className={cn(
                        "h-11 pl-10",
                        errors.phone && "border-red-400",
                      )}
                    />
                  </Field>

                  {/* Email */}
                  <Field
                    label="Email Address *"
                    error={errors.email}
                    icon={<Mail className="w-4 h-4" />}
                  >
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(e) => setField("email", e.target.value)}
                      placeholder="you@example.com"
                      className={cn(
                        "h-11 pl-10",
                        errors.email && "border-red-400",
                      )}
                    />
                  </Field>

                  {/* Company optional */}
                  <Field
                    label="Company (optional)"
                    icon={<Building2 className="w-4 h-4" />}
                  >
                    <Input
                      value={form.companyName}
                      onChange={(e) => setField("companyName", e.target.value)}
                      placeholder="Optional"
                      className="h-11 pl-10"
                    />
                  </Field>

                  {/* Account creation note */}
                  <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-700 leading-relaxed">
                      A free Paanshala account will be created with your email
                      to track this order. You'll get an email to set your
                      password.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* ════ STEP 1 — Address ════ */}
              {step === 1 && (
                <motion.div
                  key="step-address"
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.22 }}
                  className="p-6 space-y-5"
                >
                  <Field
                    label="Street Address *"
                    error={errors.streetAddress}
                    icon={<MapPin className="w-4 h-4" />}
                  >
                    <Input
                      value={form.streetAddress}
                      onChange={(e) =>
                        setField("streetAddress", e.target.value)
                      }
                      placeholder="House no., Building, Street"
                      className={cn(
                        "h-11 pl-10",
                        errors.streetAddress && "border-red-400",
                      )}
                    />
                  </Field>

                  <Field
                    label="Landmark (optional)"
                    icon={<Navigation className="w-4 h-4 opacity-50" />}
                  >
                    <Input
                      value={form.landmark}
                      onChange={(e) => setField("landmark", e.target.value)}
                      placeholder="Near hospital, market…"
                      className="h-11 pl-10"
                    />
                  </Field>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Field label="City *" error={errors.city}>
                      <Input
                        value={form.city}
                        onChange={(e) => setField("city", e.target.value)}
                        placeholder="Mumbai"
                        className={cn("h-11", errors.city && "border-red-400")}
                      />
                    </Field>

                    <Field label="State *" error={errors.state}>
                      <select
                        value={form.state}
                        onChange={(e) => setField("state", e.target.value)}
                        className={cn(
                          "h-11 w-full rounded-lg border bg-white px-3 text-sm text-gray-900",
                          "focus:outline-none focus:ring-2 focus:ring-[#2d5016]/30 focus:border-[#2d5016] transition-colors",
                          errors.state ? "border-red-400" : "border-gray-200",
                        )}
                      >
                        <option value="">Select state</option>
                        {INDIAN_STATES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field label="Pincode *" error={errors.pincode}>
                      <Input
                        value={form.pincode}
                        onChange={(e) =>
                          setField(
                            "pincode",
                            e.target.value.replace(/\D/g, "").slice(0, 6),
                          )
                        }
                        placeholder="400001"
                        inputMode="numeric"
                        className={cn(
                          "h-11",
                          errors.pincode && "border-red-400",
                        )}
                      />
                    </Field>
                  </div>
                </motion.div>
              )}

              {/* ════ STEP 2 — Review & Pay ════ */}
              {step === 2 && (
                <motion.div
                  key="step-review"
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.22 }}
                  className="p-6 space-y-5"
                >
                  {/* Contact recap */}
                  <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                      Contact
                    </p>
                    <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-gray-700">
                      <span className="flex items-center gap-1.5 font-semibold">
                        <User className="w-3.5 h-3.5 text-[#2d5016]" />
                        {form.fullName}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-[#2d5016]" />
                        {form.phone}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-[#2d5016]" />
                        {form.email}
                      </span>
                    </div>
                    <button
                      onClick={() => setStep(0)}
                      className="text-[10px] text-[#2d5016] font-semibold mt-2 hover:underline"
                    >
                      Edit
                    </button>
                  </div>

                  {/* Address recap */}
                  <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                      Delivering to
                    </p>
                    <p className="text-sm text-gray-700">
                      {form.streetAddress}
                      {form.landmark && `, ${form.landmark}`}
                    </p>
                    <p className="text-sm text-gray-700">
                      {form.city}, {form.state} – {form.pincode}
                    </p>
                    <button
                      onClick={() => setStep(1)}
                      className="text-[10px] text-[#2d5016] font-semibold mt-2 hover:underline"
                    >
                      Edit
                    </button>
                  </div>

                  {/* Order items */}
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                      Order Items
                    </p>
                    <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                      {items.map((item, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100"
                        >
                          <div className="relative w-10 h-10 shrink-0 rounded-lg overflow-hidden bg-white border border-gray-200">
                            {item.image ? (
                              <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <ShoppingBag className="w-5 h-5 text-gray-300 m-auto mt-2.5" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-gray-900 line-clamp-1">
                              {item.name}
                            </p>
                            <p className="text-[10px] text-gray-400">
                              {item.variantSetSize &&
                                `${item.variantSetSize} pcs · `}
                              Qty: {item.quantity}
                            </p>
                          </div>
                          <p className="text-sm font-bold text-gray-900">
                            ₹{item.totalPrice}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Price breakdown */}
                  <div className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 space-y-2">
                    <PriceRow label="Subtotal" value={`₹${subtotal}`} />
                    {discountAmt > 0 && (
                      <PriceRow
                        label={`Coupon (${appliedCoupon.code})`}
                        value={`−₹${discountAmt}`}
                        green
                      />
                    )}
                    <PriceRow label="Shipping" value="FREE" green />
                    <div className="border-t border-gray-200 pt-2.5">
                      <PriceRow label="Total" value={`₹${total}`} bold />
                    </div>
                    {discountAmt > 0 && (
                      <p className="text-[11px] text-center text-green-600 font-semibold bg-green-50 border border-green-100 rounded-lg py-1.5 mt-1">
                        🎉 You're saving ₹{discountAmt} on this order!
                      </p>
                    )}
                  </div>

                  {/* Terms */}
                  <div
                    onClick={() => setAgree((v) => !v)}
                    className={cn(
                      "flex items-start gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-colors",
                      agree
                        ? "bg-[#2d5016]/5 border-[#2d5016]/30"
                        : "bg-gray-50 border-gray-200 hover:border-[#2d5016]/20",
                    )}
                  >
                    <Checkbox
                      checked={agree}
                      onCheckedChange={setAgree}
                      className="mt-0.5 shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <p className="text-xs text-gray-700 leading-relaxed">
                      I agree to the{" "}
                      <a
                        href="/terms"
                        onClick={(e) => e.stopPropagation()}
                        className="text-[#2d5016] underline font-medium"
                      >
                        Terms & Conditions
                      </a>{" "}
                      and{" "}
                      <a
                        href="/privacy"
                        onClick={(e) => e.stopPropagation()}
                        className="text-[#2d5016] underline font-medium"
                      >
                        Privacy Policy
                      </a>
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Footer ── */}
          <div className="shrink-0 border-t border-gray-100 bg-white px-5 py-4 flex items-center justify-between gap-3">
            {step === 0 ? (
              <button
                onClick={closeGuestCheckout}
                className="text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1.5"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            ) : (
              <button
                onClick={goBack}
                className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            )}

            {step < 2 ? (
              <Button
                onClick={goNext}
                className="bg-linear-to-r from-[#2d5016] to-[#3d6820] hover:opacity-90 text-white font-bold px-8 h-11 gap-2 shadow-md"
              >
                {step === 0 ? "Add Delivery Address" : "Review Order"}
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handlePay}
                disabled={loading || !agree}
                className="bg-linear-to-r from-[#2d5016] to-[#3d6820] hover:opacity-90 text-white font-bold px-8 h-11 gap-2 shadow-md disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing…
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Pay ₹{total}
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
}

/* ═══════════════════════════
   FIELD WRAPPER
═══════════════════════════ */
function Field({ label, error, icon, children }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-semibold text-gray-700">{label}</Label>
      {icon ? (
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            {icon}
          </div>
          {children}
        </div>
      ) : (
        children
      )}
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
          <AlertTriangle className="w-3 h-3 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

/* ═══════════════════════════
   PRICE ROW
═══════════════════════════ */
function PriceRow({ label, value, bold, green }) {
  return (
    <div
      className={cn(
        "flex items-center justify-between text-sm",
        bold && "font-bold text-gray-900 text-base",
        green && "text-green-600 font-semibold",
        !bold && !green && "text-gray-600",
      )}
    >
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
