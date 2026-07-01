"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
} from "lucide-react";
import { useGuestCartStore } from "@/stores/useGuestCartStore";
import { useCouponStore } from "@/stores/useCouponStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import api from "@/lib/axios";

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

export default function GuestCheckoutPage() {
  const router = useRouter();
  const { items, clearCart } = useGuestCartStore();
  const { coupon: appliedCoupon, clearCoupon } = useCouponStore();

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);

  // Prevents the empty-cart redirect from firing after a successful payment
  const orderCompleted = useRef(false);

  /* ── redirect to /cart if guest cart is empty ── */
  /* Must be in useEffect — calling router.push during render causes:       */
  /* "Cannot update Router while rendering GuestCheckoutPage"               */
  useEffect(() => {
    if (items.length === 0 && !orderCompleted.current) {
      router.push("/cart");
    }
  }, [items.length]);

  /* ── pricing ── */
  // Don't render the page content while redirecting away (empty cart)
  if (items.length === 0) return null;

  const subtotal = items.reduce((s, i) => s + i.totalPrice, 0);
  const discount = useMemo(() => {
    if (!appliedCoupon) return 0;
    let d =
      appliedCoupon.discountType === "percentage"
        ? (subtotal * appliedCoupon.discountValue) / 100
        : appliedCoupon.discountValue;
    if (appliedCoupon.maxDiscount) d = Math.min(d, appliedCoupon.maxDiscount);
    return Math.min(d, subtotal);
  }, [appliedCoupon, subtotal]);
  const total = Math.max(0, subtotal - discount);

  /* ── validation ── */
  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = "Full name is required";
    if (!form.streetAddress.trim())
      e.streetAddress = "Street address is required";
    if (!form.city.trim()) e.city = "City is required";
    if (!form.state) e.state = "State is required";
    if (!/^\d{6}$/.test(form.pincode))
      e.pincode = "Enter a valid 6-digit pincode";
    if (!/^\d{10}$/.test(form.phone)) e.phone = "Enter a valid 10-digit number";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Enter a valid email";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const setField = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => {
      const n = { ...e };
      delete n[k];
      return n;
    });
  };

  /* ── pay ── */
  const handlePay = async () => {
    if (!validate()) {
      toast.error("Please fill in all required fields");
      return;
    }
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
      /* Step 1 — create Razorpay order */
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
            /* Step 2 — verify + create order + create account */
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

            // Mark as complete BEFORE clearing cart so the useEffect
            // empty-cart guard doesn't redirect to /cart
            orderCompleted.current = true;
            clearCart();
            clearCoupon();

            if (orderData.isNewUser) {
              toast.success(
                "Order placed! We've created an account for you — check your email.",
              );
            } else {
              toast.success("Order placed successfully! 🎉");
            }

            router.push(`/order-success?orderId=${orderData.order._id}`);
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
    <div className="min-h-screen bg-linear-to-b from-white via-[#fafaf6] to-white py-8">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Progress steps */}
        <div className="mb-10">
          <div className="flex items-center justify-center gap-2 md:gap-4">
            <Step icon={ShoppingBag} label="Cart" completed />
            <StepLine completed />
            <Step icon={MapPin} label="Details" active />
            <StepLine />
            <Step icon={CreditCard} label="Payment" />
          </div>
        </div>

        {/* Guest banner */}
        <div className="mb-6 bg-[#2d5016]/5 border border-[#2d5016]/20 rounded-2xl px-5 py-4 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-[#2d5016] shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-[#2d5016]">
              No account needed
            </p>
            <p className="text-xs text-gray-600 mt-0.5">
              Fill your details below to complete checkout. We'll create a free
              account for you to track your order. Already have an account?{" "}
              <Link
                href="/login"
                className="text-[#2d5016] underline font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT — address form */}
          <div className="lg:col-span-2">
            <Card className="border-2 border-gray-100 shadow-sm">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-6">
                  <MapPin className="w-5 h-5 text-[#2d5016]" />
                  Delivery & Contact Details
                </h2>

                <div className="space-y-5">
                  {/* Contact */}
                  <div>
                    <p className="text-xs font-bold text-[#2d5016] uppercase tracking-widest mb-3 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" /> Contact
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      <Field
                        label="Company (optional)"
                        icon={<Building2 className="w-4 h-4" />}
                      >
                        <Input
                          value={form.companyName}
                          onChange={(e) =>
                            setField("companyName", e.target.value)
                          }
                          placeholder="Optional"
                          className="h-11 pl-10"
                        />
                      </Field>
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
                          placeholder="10-digit number"
                          className={cn(
                            "h-11 pl-10",
                            errors.phone && "border-red-400",
                          )}
                        />
                      </Field>
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
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <p className="text-xs font-bold text-[#2d5016] uppercase tracking-widest mb-3 flex items-center gap-1.5">
                      <Navigation className="w-3.5 h-3.5" /> Delivery Address
                    </p>
                    <div className="space-y-4">
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
                        label="Landmark"
                        icon={<MapPin className="w-4 h-4 opacity-50" />}
                      >
                        <Input
                          value={form.landmark}
                          onChange={(e) => setField("landmark", e.target.value)}
                          placeholder="Near hospital, market… (optional)"
                          className="h-11 pl-10"
                        />
                      </Field>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Field label="City *" error={errors.city}>
                          <Input
                            value={form.city}
                            onChange={(e) => setField("city", e.target.value)}
                            placeholder="Mumbai"
                            className={cn(
                              "h-11",
                              errors.city && "border-red-400",
                            )}
                          />
                        </Field>
                        <Field label="State *" error={errors.state}>
                          <select
                            value={form.state}
                            onChange={(e) => setField("state", e.target.value)}
                            className={cn(
                              "h-11 w-full rounded-lg border bg-white px-3 text-sm text-gray-900",
                              "focus:outline-none focus:ring-2 focus:ring-[#2d5016]/30 focus:border-[#2d5016] transition-colors",
                              errors.state
                                ? "border-red-400"
                                : "border-gray-200",
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
                            className={cn(
                              "h-11",
                              errors.pincode && "border-red-400",
                            )}
                          />
                        </Field>
                      </div>
                    </div>
                  </div>

                  {/* Info note */}
                  <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-700">
                      A free Paanshala account will be created with your email
                      so you can track this order. You'll receive an email to
                      set your password.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT — order summary */}
          <div className="lg:sticky lg:top-24 h-fit">
            <GuestOrderSummary
              items={items}
              subtotal={subtotal}
              discount={discount}
              total={total}
              appliedCoupon={appliedCoupon}
              agree={agree}
              setAgree={setAgree}
              onPay={handlePay}
              loading={loading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Guest Order Summary ── */
function GuestOrderSummary({
  items,
  subtotal,
  discount,
  total,
  appliedCoupon,
  agree,
  setAgree,
  onPay,
  loading,
}) {
  return (
    <Card className="border-2 border-gray-100 shadow-xl">
      <CardContent className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

        <div className="space-y-3 mb-6 max-h-60 overflow-y-auto pr-1">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <ShoppingBag className="w-6 h-6 text-gray-300 m-auto mt-4" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 line-clamp-1">
                  {item.name}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {item.variantSetSize && `${item.variantSetSize} pcs · `}Qty:{" "}
                  {item.quantity}
                </p>
              </div>
              <p className="text-sm font-bold text-gray-900 shrink-0">
                ₹{item.totalPrice}
              </p>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-100 pt-4 space-y-2.5 mb-6">
          <PriceRow label="Subtotal" value={`₹${subtotal}`} />
          {discount > 0 && (
            <PriceRow
              label={`Coupon (${appliedCoupon.code})`}
              value={`-₹${discount}`}
              green
            />
          )}
          <PriceRow label="Shipping" value="FREE" green />
          <div className="border-t border-gray-200 pt-3 mt-1">
            <PriceRow label="Total Amount" value={`₹${total}`} bold />
          </div>
        </div>

        {discount > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center mb-5">
            <p className="text-sm font-semibold text-green-800">
              🎉 You're saving ₹{discount} on this order!
            </p>
          </div>
        )}

        <div
          onClick={() => setAgree((v) => !v)}
          className={cn(
            "flex items-start gap-3 mb-5 p-3 rounded-xl border cursor-pointer transition-colors",
            agree
              ? "bg-[#2d5016]/5 border-[#2d5016]/30"
              : "bg-gray-50 border-gray-200 hover:border-[#2d5016]/20",
          )}
        >
          <Checkbox
            id="agree-terms"
            checked={agree}
            onCheckedChange={setAgree}
            className="mt-0.5 shrink-0"
          />
          <label
            htmlFor="agree-terms"
            className="text-sm text-gray-700 cursor-pointer leading-relaxed"
          >
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
          </label>
        </div>

        <Button
          onClick={onPay}
          disabled={loading || !agree}
          className="w-full h-14 bg-linear-to-r from-[#2d5016] to-[#3d6820] hover:opacity-90 text-white font-bold text-lg shadow-lg gap-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing…
            </>
          ) : (
            <>
              <Lock className="w-5 h-5" />
              Pay ₹{total}
            </>
          )}
        </Button>

        <div className="flex items-center justify-center gap-1.5 mt-4 text-xs text-gray-400">
          <CheckCircle className="w-3.5 h-3.5 text-green-500" />
          Secure payment powered by Razorpay
        </div>
      </CardContent>
    </Card>
  );
}

/* ── helpers ── */
function PriceRow({ label, value, bold, green }) {
  return (
    <div
      className={cn(
        "flex items-center justify-between",
        bold ? "text-base font-bold text-gray-900" : "text-sm text-gray-600",
        green && "text-green-600 font-semibold",
      )}
    >
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function Field({ label, error, icon, children }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-gray-700">{label}</Label>
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
        <p className="text-xs text-red-500 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

function Step({ icon: Icon, label, active, completed }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={cn(
          "w-11 h-11 rounded-full flex items-center justify-center transition-all shadow-sm",
          completed
            ? "bg-green-500 text-white"
            : active
              ? "bg-linear-to-br from-[#2d5016] to-[#3d6820] text-white"
              : "bg-gray-100 text-gray-400",
        )}
      >
        {completed ? (
          <CheckCircle className="w-5 h-5" />
        ) : (
          <Icon className="w-5 h-5" />
        )}
      </div>
      <span
        className={cn(
          "text-xs md:text-sm font-medium",
          active || completed ? "text-gray-900" : "text-gray-400",
        )}
      >
        {label}
      </span>
    </div>
  );
}

function StepLine({ completed }) {
  return (
    <div
      className={cn(
        "h-0.5 w-10 md:w-20 rounded-full mb-5",
        completed ? "bg-green-500" : "bg-gray-200",
      )}
    />
  );
}
