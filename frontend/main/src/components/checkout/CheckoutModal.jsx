"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  CreditCard,
  ShoppingBag,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  Lock,
  Package,
  Phone,
  Mail,
  Loader2,
  CheckCircle2,
  X,
  ArrowLeft,
  ArrowRight,
  Banknote,
  Gift,
  Clock,
} from "lucide-react";

import { useCheckoutUIStore } from "@/stores/useCheckoutUIStore";
import { useUserStore } from "@/stores/useUserStore";
import { useCartStore } from "@/stores/useCartStore";
import { useOrderStore } from "@/stores/useOrderStore";
import { useAddressStore } from "@/stores/useAddressStore";
import { useCouponStore } from "@/stores/useCouponStore";
import { usePageSettingsStore } from "@/stores/usePageSettingsStore";
import { useScheduleStore } from "@/stores/useScheduleStore";
import { useCategoryStore } from "@/stores/useCategoryStore";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import AddressForm from "@/components/profile/AddressForm";

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

/* ── Steps ── */
const STEPS = ["cart", "address", "payment"];

export default function CheckoutModal() {
  const { isOpen, closeCheckout } = useCheckoutUIStore();
  const router = useRouter();

  const { isAuthenticated, user } = useUserStore();
  const { cart, fetchCart } = useCartStore();
  const { resetCart } = useCartStore.getState();
  const {
    createPaymentOrder,
    verifyPaymentAndCreateOrder,
    createCODOrder,
    loading,
  } = useOrderStore();
  const { addresses, fetchAddresses, deleteAddress } = useAddressStore();
  const { coupon: appliedCoupon, clearCoupon } = useCouponStore();
  const { settings: pageSettings, fetchPageSettings } = usePageSettingsStore();
  const { scheduledDate, scheduledTime, clearSchedule } = useScheduleStore();
  const { categories, fetchActiveCategories } = useCategoryStore();

  const [step, setStep] = useState(1); // 0=summary 1=address 2=pay
  const [selectedShipping, setSelectedShipping] = useState(null);
  const [selectedBilling, setSelectedBilling] = useState(null);
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [agree, setAgree] = useState(true);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("ONLINE"); // "ONLINE" | "COD"
  const [useRewards, setUseRewards] = useState(false);
  const [redeemPoints, setRedeemPoints] = useState(0);

  const orderCompleted = useRef(false);

  /* ── lock body scroll ── */
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!categories.length) fetchActiveCategories();
  }, []);

  /* ── fetch on open ── */
  useEffect(() => {
    if (!isOpen) return;
    if (!isAuthenticated) {
      closeCheckout();
      router.push("/login");
      return;
    }
    fetchCart();
    fetchAddresses();
    fetchPageSettings();
    setStep(1);
    setAgree(true);
    setPaymentMethod("ONLINE");
    orderCompleted.current = false;
  }, [isOpen, isAuthenticated]);

  /* ── auto-select default address ── */
  useEffect(() => {
    const def = addresses.find((a) => a.isDefault);
    if (def) {
      if (!selectedShipping) setSelectedShipping(def._id);
      if (!selectedBilling) setSelectedBilling(def._id);
    }
  }, [addresses]);

  /* ── sync billing with shipping ── */
  useEffect(() => {
    if (sameAsShipping) setSelectedBilling(selectedShipping);
  }, [sameAsShipping, selectedShipping]);

  // Check if any item belongs to a category with isCODAvailable: false
  const isCODBlocked = useMemo(() => {
    const cartItems = cart?.items || [];
    if (!cartItems.length || !categories.length) return false;
    return cartItems.some((item) => {
      const product = item.product || {};
      const parentCatId = product.parentCategory?._id || product.parentCategory;
      const catId = product.category?._id || product.category;
      const allCats = categories.flatMap((c) => [c, ...(c.children || [])]);
      const rootCat = allCats.find((c) => c._id === parentCatId);
      if (rootCat && rootCat.isCODAvailable === false) return true;
      const leafCat = allCats.find((c) => c._id === catId);
      if (leafCat && leafCat.isCODAvailable === false) return true;
      return false;
    });
  }, [cart?.items, categories]); // ← cart?.items not items

  // Auto-switch to ONLINE if COD is blocked
  useEffect(() => {
    if (isCODBlocked && paymentMethod === "COD") {
      setPaymentMethod("ONLINE");
    }
  }, [isCODBlocked]);

  if (!isOpen) return null;

  /* ── derived values ── */
  const subtotal = cart?.subtotal ?? 0;
  const availableRewardPoints = user?.rewardPoints || 0;
  const codEnabled = pageSettings?.codSettings?.enabled ?? false;
  const codCharge = pageSettings?.codSettings?.charges ?? 0;
  const freeThreshold =
    pageSettings?.shippingSettings?.freeShippingThreshold ?? 500;
  const standardCharges = pageSettings?.shippingSettings?.standardCharges ?? 0;
  const shippingCharges = subtotal >= freeThreshold ? 0 : standardCharges;
  let discountAmt = 0;
  if (appliedCoupon) {
    discountAmt =
      appliedCoupon.discountType === "percentage"
        ? Math.min(
            (subtotal * appliedCoupon.discountValue) / 100,
            appliedCoupon.maxDiscount || Infinity,
          )
        : appliedCoupon.discountValue;
    discountAmt = Math.min(discountAmt, subtotal);
  }
  const maxRedeemablePoints = Math.max(0, subtotal - discountAmt);

  const appliedRewardPoints = useRewards
    ? Math.min(availableRewardPoints, maxRedeemablePoints)
    : 0;

  const baseTotal = Math.max(0, subtotal - discountAmt - appliedRewardPoints);
  const codFee = paymentMethod === "COD" ? (codCharge ?? 0) : 0;
  const total = baseTotal + codFee + shippingCharges;
  const items = cart?.items || [];

  /* ── common guard ── */
  const validateBeforePay = () => {
    const billingId = sameAsShipping ? selectedShipping : selectedBilling;
    if (!selectedShipping || !billingId) {
      toast.error("Please select a shipping address");
      return null;
    }
    if (!agree) {
      toast.error("Please agree to Terms & Conditions");
      return null;
    }
    return billingId;
  };

  /* ── online payment (Razorpay) ── */
  const handlePayNow = async () => {
    const billingId = validateBeforePay();
    if (!billingId) return;

    const loaded = await loadRazorpay();
    if (!loaded) {
      toast.error("Razorpay failed to load");
      return;
    }

    const razorpayOrder = await createPaymentOrder({
      couponCode: appliedCoupon?.code || null,
      redeemPoints: appliedRewardPoints,
      billingAddressId: billingId,
      shippingAddressId: selectedShipping,
      scheduledDate: scheduledDate || null,
      scheduledTime: scheduledTime || null,
    });
    if (!razorpayOrder) return;

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
      amount: razorpayOrder.amount,
      currency: "INR",
      name: "Paanshala",
      description: "Order Payment",
      order_id: razorpayOrder.id,
      prefill: {
        name: user.full_name,
        email: user.email,
        contact: user.phone || "",
      },
      handler: async (response) => {
        const order = await verifyPaymentAndCreateOrder({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
          redeemPoints: appliedRewardPoints,
        });
        if (!order) return;
        orderCompleted.current = true;
        closeCheckout();
        clearSchedule();
        router.push("/orders");
        clearCoupon();
        resetCart();
      },
      modal: { ondismiss: () => toast.error("Payment cancelled") },
      theme: { color: "#264B0E" },
    };
    new window.Razorpay(options).open();
  };

  /* ── COD ── */
  const handleCODOrder = async () => {
    const billingId = validateBeforePay();
    if (!billingId) return;

    const order = await createCODOrder({
      billingAddressId: billingId,
      shippingAddressId: selectedShipping,
      couponCode: appliedCoupon?.code || null,
      redeemPoints: appliedRewardPoints,
      scheduledDate: scheduledDate || null, // ← add
      scheduledTime: scheduledTime || null,
    });
    if (!order) return;
    orderCompleted.current = true;
    closeCheckout();
    clearSchedule();
    router.push("/orders");
    clearCoupon();
    resetCart();
  };

  /* ── unified handler ── */
  const handlePlaceOrder = () =>
    paymentMethod === "COD" ? handleCODOrder() : handlePayNow();

  /* ── delete address ── */
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    await deleteAddress(deleteTarget._id);
    if (selectedShipping === deleteTarget._id) setSelectedShipping(null);
    if (selectedBilling === deleteTarget._id) setSelectedBilling(null);
    setDeleteLoading(false);
    setDeleteTarget(null);
  };

  /* ── step navigation guard ── */
  const goToPayment = () => {
    if (!selectedShipping) {
      toast.error("Please select a shipping address");
      return;
    }
    if (!sameAsShipping && !selectedBilling) {
      toast.error("Please select a billing address");
      return;
    }
    setStep(2);
  };

  return (
    <>
      {/* ── Backdrop ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={closeCheckout}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-70"
      />

      {/* ── Modal ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        transition={{ type: "spring", damping: 28, stiffness: 320 }}
        className="fixed inset-0 z-80 flex items-center justify-center p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
          {/* ── Header ── */}
          <div className="relative shrink-0 bg-linear-to-r from-[#264B0E] via-brand-green-dark to-[#264B0E] px-6 py-5">
            {/* Dot pattern */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage:
                  "radial-gradient(circle, rgba(244,196,48,0.18) 1px, transparent 1px)",
                backgroundSize: "22px 22px",
              }}
            />
            <div className="relative flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-extrabold text-white">Checkout</h2>
                <p className="text-white/60 text-xs mt-0.5">
                  {step === 1 ? "Select delivery address" : "Review & pay"}
                </p>
              </div>

              {/* Step indicator */}
              <div className="hidden sm:flex items-center gap-2">
                {["Address", "Payment"].map((label, i) => (
                  <div key={label} className="flex items-center gap-2">
                    <div
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all",
                        step === i + 1
                          ? "bg-gold-bright text-[#1a1a1a]"
                          : step > i + 1
                            ? "bg-white/20 text-white"
                            : "bg-white/10 text-white/50",
                      )}
                    >
                      {step > i + 1 ? (
                        <CheckCircle className="w-3.5 h-3.5" />
                      ) : (
                        <span>{i + 1}</span>
                      )}
                      {label}
                    </div>
                    {i < 1 && <div className="w-4 h-px bg-white/30" />}
                  </div>
                ))}
              </div>

              <button
                onClick={closeCheckout}
                className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {/* Gold accent line */}
          <div className="h-0.75 bg-linear-to-r from-transparent via-gold-bright to-transparent shrink-0" />

          {/* ── Body ── */}
          <div className="flex-1 overflow-hidden flex flex-col md:flex-row min-h-0">
            <AnimatePresence mode="wait" initial={false}>
              {/* ════ STEP 1 — Address ════ */}
              {step === 1 && (
                <motion.div
                  key="step-address"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.25 }}
                  className="flex-1 overflow-y-auto p-5 md:p-6 space-y-5"
                >
                  {/* Shipping */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <Package className="w-4 h-4 text-[#264B0E]" />
                        Shipping Address
                      </h3>
                      <button
                        onClick={() => {
                          setEditingAddress(null);
                          setShowAddressForm(true);
                        }}
                        className="flex items-center gap-1.5 text-xs font-semibold text-[#264B0E] hover:text-brand-green-dark transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add New
                      </button>
                    </div>

                    {addresses.length === 0 ? (
                      <EmptyAddresses
                        onAdd={() => {
                          setEditingAddress(null);
                          setShowAddressForm(true);
                        }}
                      />
                    ) : (
                      <div className="space-y-2.5">
                        {addresses.map((addr) => (
                          <AddressCard
                            key={addr._id}
                            addr={addr}
                            selected={selectedShipping === addr._id}
                            onSelect={() => setSelectedShipping(addr._id)}
                            onEdit={() => {
                              setEditingAddress(addr);
                              setShowAddressForm(true);
                            }}
                            onDelete={() => setDeleteTarget(addr)}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Billing toggle */}
                  <div className="hidden">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-3">
                      <CreditCard className="w-4 h-4 text-[#264B0E]" />
                      Billing Address
                    </h3>
                    <button
                      onClick={() => setSameAsShipping((v) => !v)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left mb-3",
                        sameAsShipping
                          ? "bg-[#264B0E]/5 border-[#264B0E]/40 text-[#264B0E]"
                          : "bg-gray-50 border-gray-200 text-gray-600 hover:border-[#264B0E]/30",
                      )}
                    >
                      <div
                        className={cn(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                          sameAsShipping
                            ? "border-[#264B0E] bg-[#264B0E]"
                            : "border-gray-300",
                        )}
                      >
                        {sameAsShipping && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                        )}
                      </div>
                      <span className="text-sm font-semibold">
                        Same as shipping address
                      </span>
                    </button>

                    <AnimatePresence>
                      {!sameAsShipping && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden space-y-2.5"
                        >
                          {addresses.map((addr) => (
                            <AddressCard
                              key={addr._id}
                              addr={addr}
                              selected={selectedBilling === addr._id}
                              onSelect={() => setSelectedBilling(addr._id)}
                              onEdit={() => {
                                setEditingAddress(addr);
                                setShowAddressForm(true);
                              }}
                              onDelete={() => setDeleteTarget(addr)}
                            />
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}

              {/* ════ STEP 2 — Review & Pay ════ */}
              {step === 2 && (
                <motion.div
                  key="step-pay"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  className="flex-1 overflow-y-auto p-5 md:p-6 space-y-5"
                >
                  {/* Order items */}
                  <div>
                    <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-[#264B0E]" />
                      Order Items ({items.length})
                    </h3>
                    <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
                      {items.map((item, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 bg-gray-50 rounded-xl p-2.5 border border-gray-100"
                        >
                          <div className="relative w-12 h-12 shrink-0 rounded-lg overflow-hidden bg-white border border-gray-200">
                            <Image
                              src={
                                item.product?.images?.[0] ||
                                "/placeholder-product.png"
                              }
                              alt={item.product?.name || "Product"}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-gray-900 line-clamp-1">
                              {item.product?.name}
                            </p>
                            <p className="text-[10px] text-gray-400 mt-0.5">
                              {item.variantSetSize &&
                                `${item.variantSetSize} pcs · `}
                              Qty: {item.quantity}
                            </p>
                          </div>
                          <p className="text-sm font-bold text-gray-900 shrink-0">
                            ₹{item.totalPrice}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Delivery address recap */}
                  {selectedShipping && (
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[#264B0E]" />
                        Delivering to
                      </h3>
                      {(() => {
                        const addr = addresses.find(
                          (a) => a._id === selectedShipping,
                        );
                        if (!addr) return null;
                        return (
                          <div className="bg-[#264B0E]/5 border border-[#264B0E]/20 rounded-xl px-4 py-3 text-sm">
                            <p className="font-semibold text-gray-900">
                              {addr.fullName}
                            </p>
                            <p className="text-gray-600 text-xs mt-0.5">
                              {addr.streetAddress}, {addr.city}, {addr.state} –{" "}
                              {addr.pincode}
                            </p>
                            <p className="text-gray-500 text-xs mt-0.5">
                              {addr.phone}
                            </p>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* Scheduled delivery info */}
                  {scheduledDate && scheduledTime && (
                    <div className="flex items-center gap-3 p-3.5 bg-orange-50 border border-orange-200 rounded-xl">
                      <Clock className="w-4 h-4 text-orange-600 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-orange-800">
                          Paan Delivery Scheduled
                        </p>
                        <p className="text-xs text-orange-700 mt-0.5">
                          {new Date(scheduledDate).toLocaleDateString("en-IN", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                          })}{" "}
                          at{" "}
                          {(() => {
                            const [h, m] = scheduledTime.split(":").map(Number);
                            const period = h >= 12 ? "PM" : "AM";
                            const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h;
                            return `${displayH}:${String(m).padStart(2, "0")} ${period}`;
                          })()}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* ── Payment method ── */}
                  <div>
                    <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-[#264B0E]" />
                      Payment Method
                    </h3>
                    <div
                      className={cn(
                        "gap-3",
                        codEnabled && !isCODBlocked
                          ? "grid grid-cols-2"
                          : "flex flex-col",
                      )}
                    >
                      {/* Online */}
                      <button
                        onClick={() => setPaymentMethod("ONLINE")}
                        className={cn(
                          "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                          paymentMethod === "ONLINE"
                            ? "border-[#264B0E] bg-[#264B0E]/5 shadow-sm"
                            : "border-gray-200 hover:border-[#264B0E]/30 bg-white",
                        )}
                      >
                        <div
                          className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center",
                            paymentMethod === "ONLINE"
                              ? "bg-[#264B0E] text-white"
                              : "bg-gray-100 text-gray-500",
                          )}
                        >
                          <Lock className="w-5 h-5" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-bold text-gray-900">
                            Pay Online
                          </p>
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            UPI, Card, Net Banking
                          </p>
                        </div>
                        {paymentMethod === "ONLINE" && (
                          <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                            Selected
                          </span>
                        )}
                      </button>

                      {/* COD — only shown when enabled in page settings */}
                      {/* COD — only shown when enabled AND not blocked by category */}
                      {codEnabled && !isCODBlocked && (
                        <button
                          onClick={() => setPaymentMethod("COD")}
                          className={cn(
                            "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                            paymentMethod === "COD"
                              ? "border-gold-bright bg-gold-bright/8 shadow-sm"
                              : "border-gray-200 hover:border-gold-bright/50 bg-white",
                          )}
                        >
                          <div
                            className={cn(
                              "w-10 h-10 rounded-full flex items-center justify-center",
                              paymentMethod === "COD"
                                ? "bg-gold-bright text-[#1a1a1a]"
                                : "bg-gray-100 text-gray-500",
                            )}
                          >
                            <Banknote className="w-5 h-5" />
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-bold text-gray-900">
                              Cash on Delivery
                            </p>
                            <p className="text-[10px] text-gray-400 mt-0.5">
                              {codCharge > 0
                                ? `+₹${codCharge} COD fee`
                                : "No extra charge"}
                            </p>
                          </div>
                          {paymentMethod === "COD" && (
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                              Selected
                            </span>
                          )}
                        </button>
                      )}

                      {/* COD blocked notice */}
                      {codEnabled && isCODBlocked && (
                        <div className="col-span-2 flex items-start gap-2.5 p-3.5 bg-amber-50 border border-amber-200 rounded-xl">
                          <Banknote className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-bold text-amber-800">
                              COD not available for this order
                            </p>
                            <p className="text-xs text-amber-700 mt-0.5">
                              One or more items in your cart require online
                              payment only. Please use UPI, Card, or Net
                              Banking.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ── Rewards ── */}
                  {availableRewardPoints > 0 && (
                    <div className="rounded-2xl border-2 border-[#264B0E]/15 bg-linear-to-br from-[#264B0E]/5 to-brand-green-light/5 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-9 h-9 rounded-full bg-gold-bright/20 flex items-center justify-center">
                              <Gift className="w-4 h-4 text-[#b8860b]" />
                            </div>

                            <div>
                              <h3 className="font-bold text-gray-900">
                                Paanshala Rewards
                              </h3>

                              <p className="text-xs text-gray-500">
                                1 Point = ₹1 Savings
                              </p>
                            </div>
                          </div>

                          <p className="text-sm text-gray-700 mt-3">
                            Available Balance:
                            <span className="font-bold text-[#264B0E] ml-1">
                              {availableRewardPoints} Points
                            </span>
                          </p>

                          {appliedRewardPoints > 0 && (
                            <p className="text-xs text-green-600 font-semibold mt-1">
                              🎉 Applying ₹{appliedRewardPoints} reward discount
                            </p>
                          )}
                        </div>

                        <button
                          onClick={() => setUseRewards((prev) => !prev)}
                          className={cn(
                            "relative w-14 h-8 rounded-full transition-all duration-300",
                            useRewards ? "bg-[#264B0E]" : "bg-gray-300",
                          )}
                        >
                          <div
                            className={cn(
                              "absolute top-1 w-6 h-6 rounded-full bg-white transition-all duration-300 shadow-md",
                              useRewards ? "translate-x-7" : "translate-x-1",
                            )}
                          />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Price breakdown */}
                  <div className="bg-gray-50 rounded-2xl border border-gray-100 p-4 space-y-2">
                    <PriceRow label="Subtotal" value={`₹${subtotal}`} />
                    {discountAmt > 0 && (
                      <PriceRow
                        label={`Coupon (${appliedCoupon.code})`}
                        value={`−₹${discountAmt}`}
                        green
                      />
                    )}

                    {appliedRewardPoints > 0 && (
                      <PriceRow
                        label="Reward Points"
                        value={`−₹${appliedRewardPoints}`}
                        green
                      />
                    )}
                    <PriceRow
                      label="Shipping"
                      value={
                        shippingCharges === 0 ? "FREE" : `₹${shippingCharges}`
                      }
                      green={shippingCharges === 0}
                    />
                    {shippingCharges > 0 && (
                      <p className="text-[10px] text-gray-400">
                        Add ₹{(freeThreshold - subtotal).toFixed(0)} more for
                        free shipping
                      </p>
                    )}
                    {paymentMethod === "COD" && codFee > 0 && (
                      <PriceRow label="COD Fee" value={`+₹${codFee}`} />
                    )}
                    <p className="text-[11px] text-center text-[#264B0E] font-semibold bg-[#264B0E]/5 border border-[#264B0E]/10 rounded-lg py-1.5 mt-2">
                      🎁 You'll earn approximately{" "}
                      {Math.floor(baseTotal * 0.04)} reward points
                    </p>
                    <div className="border-t border-gray-200 pt-2.5 mt-1">
                      <PriceRow label="Total" value={`₹${total}`} bold />
                    </div>
                    {discountAmt > 0 && (
                      <p className="text-[11px] text-center text-green-600 font-semibold bg-green-50 border border-green-100 rounded-lg py-1.5 mt-2">
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
                        ? "bg-[#264B0E]/5 border-[#264B0E]/30"
                        : "bg-gray-50 border-gray-200 hover:border-[#264B0E]/20",
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
                        className="text-[#264B0E] underline font-medium"
                      >
                        Terms & Conditions
                      </a>{" "}
                      and{" "}
                      <a
                        href="/privacy"
                        onClick={(e) => e.stopPropagation()}
                        className="text-[#264B0E] underline font-medium"
                      >
                        Privacy Policy
                      </a>
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Footer / CTA ── */}
          <div className="shrink-0 border-t border-gray-100 px-5 py-4 bg-white flex items-center justify-between gap-3">
            {step === 1 ? (
              <>
                <button
                  onClick={closeCheckout}
                  className="text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1.5"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
                <Button
                  onClick={goToPayment}
                  className="bg-linear-to-r from-[#264B0E] to-brand-green-light hover:opacity-90 text-white font-bold px-8 h-12 gap-2 shadow-md"
                >
                  Continue to Payment
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setStep(1)}
                  className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <Button
                  onClick={handlePlaceOrder}
                  disabled={loading || !agree}
                  className={cn(
                    "font-bold px-8 h-12 gap-2 shadow-md disabled:opacity-50 text-white",
                    paymentMethod === "COD"
                      ? "bg-gold-bright hover:bg-[#d4a574] text-[#1a1a1a]"
                      : "bg-linear-to-r from-[#264B0E] to-brand-green-light hover:opacity-90",
                  )}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing…
                    </>
                  ) : paymentMethod === "COD" ? (
                    <>
                      <Banknote className="w-4 h-4" />
                      Place COD Order · ₹{total}
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      Pay ₹{total}
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* ── AddressForm modal ── z-[95] sits above checkout modal (z-[80]) ── */}
      <AnimatePresence>
        {showAddressForm && (
          <div className="fixed inset-0 z-95">
            <AddressForm
              onClose={async () => {
                setShowAddressForm(false);
                // Refresh the address list so newly added address appears immediately
                await fetchAddresses();
              }}
              initialData={editingAddress}
            />
          </div>
        )}
      </AnimatePresence>

      {/* ── Delete confirmation ── */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent className="max-w-sm z-95">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2.5 bg-red-100 rounded-full">
                <Trash2 className="w-4 h-4 text-red-600" />
              </div>
              <AlertDialogTitle>Remove Address?</AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              Remove{" "}
              <span className="font-semibold text-gray-800">
                {deleteTarget?.fullName}
              </span>
              's address? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={deleteLoading}
              onClick={() => setDeleteTarget(null)}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                  Removing…
                </>
              ) : (
                "Remove"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

/* ═══════════════════════════
   ADDRESS CARD
═══════════════════════════ */
function AddressCard({ addr, selected, onSelect, onEdit, onDelete }) {
  return (
    <div
      onClick={onSelect}
      className={cn(
        "relative border-2 rounded-2xl p-4 cursor-pointer transition-all duration-200 group",
        selected
          ? "border-[#264B0E] bg-[#264B0E]/5 shadow-sm"
          : "border-gray-100 hover:border-[#264B0E]/30 bg-white",
      )}
    >
      <div className="flex items-start gap-3">
        {/* Radio dot */}
        <div
          className={cn(
            "mt-0.5 w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors",
            selected
              ? "border-[#264B0E] bg-[#264B0E]"
              : "border-gray-300 group-hover:border-[#264B0E]/50",
          )}
        >
          {selected && <div className="w-2 h-2 rounded-full bg-white" />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <p className="font-bold text-sm text-gray-900">{addr.fullName}</p>
            {addr.isDefault && (
              <span className="text-[10px] bg-gold-bright text-[#1a1a1a] px-1.5 py-0.5 rounded-full font-bold leading-tight">
                Default
              </span>
            )}
          </div>
          <p className="text-xs text-gray-600 leading-snug">
            {addr.streetAddress}
            {addr.landmark && `, ${addr.landmark}`}
          </p>
          <p className="text-xs text-gray-600">
            {addr.city}, {addr.state} –{" "}
            <span className="font-semibold">{addr.pincode}</span>
          </p>
          <div className="flex flex-wrap gap-x-3 mt-1.5">
            <span className="inline-flex items-center gap-1 text-[10px] text-gray-400">
              <Phone className="w-2.5 h-2.5" />
              {addr.phone}
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] text-gray-400">
              <Mail className="w-2.5 h-2.5" />
              {addr.email}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-1 shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5 text-gray-400" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-400" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════
   EMPTY ADDRESSES
═══════════════════════════ */
function EmptyAddresses({ onAdd }) {
  return (
    <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-2xl">
      <MapPin className="w-8 h-8 mx-auto mb-2 text-gray-300" />
      <p className="text-sm text-gray-500 mb-3">No saved addresses</p>
      <button
        onClick={onAdd}
        className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 bg-[#264B0E] text-white rounded-full hover:bg-brand-green-dark transition-colors"
      >
        <Plus className="w-3.5 h-3.5" />
        Add Address
      </button>
    </div>
  );
}

/* ═══════════════════════════
   HELPERS
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
