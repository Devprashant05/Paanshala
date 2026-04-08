"use client";

import { useEffect, useState, useRef } from "react";
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
} from "lucide-react";

import { useCheckoutUIStore } from "@/stores/useCheckoutUIStore";
import { useUserStore } from "@/stores/useUserStore";
import { useCartStore } from "@/stores/useCartStore";
import { useOrderStore } from "@/stores/useOrderStore";
import { useAddressStore } from "@/stores/useAddressStore";
import { useCouponStore } from "@/stores/useCouponStore";

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
  const { createPaymentOrder, verifyPaymentAndCreateOrder, loading } =
    useOrderStore();
  const { addresses, fetchAddresses, deleteAddress } = useAddressStore();
  const { coupon: appliedCoupon, clearCoupon } = useCouponStore();

  const [step, setStep] = useState(1); // 0=summary 1=address 2=pay
  const [selectedShipping, setSelectedShipping] = useState(null);
  const [selectedBilling, setSelectedBilling] = useState(null);
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [agree, setAgree] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const orderCompleted = useRef(false);

  /* ── lock body scroll ── */
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

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
    setStep(1);
    setAgree(false);
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

  if (!isOpen) return null;

  /* ── derived values ── */
  const subtotal = cart?.subtotal ?? 0;
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
  const total = Math.max(0, subtotal - discountAmt);
  const items = cart?.items || [];

  /* ── payment ── */
  const handlePayNow = async () => {
    const billingId = sameAsShipping ? selectedShipping : selectedBilling;
    if (!selectedShipping || !billingId) {
      toast.error("Please select a shipping address");
      return;
    }
    if (!agree) {
      toast.error("Please agree to Terms & Conditions");
      return;
    }

    const loaded = await loadRazorpay();
    if (!loaded) {
      toast.error("Razorpay failed to load");
      return;
    }

    const razorpayOrder = await createPaymentOrder(
      appliedCoupon?.code ? { couponCode: appliedCoupon.code } : {},
    );
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
          billingAddressId: billingId,
          shippingAddressId: selectedShipping,
          couponCode: appliedCoupon?.code || null,
        });
        if (!order) return;
        orderCompleted.current = true;
        closeCheckout();
        router.push("/orders");
        clearCoupon();
        resetCart();
      },
      modal: { ondismiss: () => toast.error("Payment cancelled") },
      theme: { color: "#2d5016" },
    };

    new window.Razorpay(options).open();
  };

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
        <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
          {/* ── Header ── */}
          <div className="relative shrink-0 bg-linear-to-r from-[#2d5016] via-[#3d6820] to-[#2d5016] px-6 py-5">
            {/* Dot pattern */}
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
                <h2
                  className="text-xl font-extrabold text-white"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  Checkout
                </h2>
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
                          ? "bg-[#d4af37] text-black"
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
          <div className="h-0.75 bg-linear-to-r from-transparent via-[#d4af37] to-transparent shrink-0" />

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
                        <Package className="w-4 h-4 text-[#2d5016]" />
                        Shipping Address
                      </h3>
                      <button
                        onClick={() => {
                          setEditingAddress(null);
                          setShowAddressForm(true);
                        }}
                        className="flex items-center gap-1.5 text-xs font-semibold text-[#2d5016] hover:text-[#3d6820] transition-colors"
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
                  <div>
                    <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-3">
                      <CreditCard className="w-4 h-4 text-[#2d5016]" />
                      Billing Address
                    </h3>
                    <button
                      onClick={() => setSameAsShipping((v) => !v)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left mb-3",
                        sameAsShipping
                          ? "bg-[#2d5016]/5 border-[#2d5016]/40 text-[#2d5016]"
                          : "bg-gray-50 border-gray-200 text-gray-600 hover:border-[#2d5016]/30",
                      )}
                    >
                      <div
                        className={cn(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                          sameAsShipping
                            ? "border-[#2d5016] bg-[#2d5016]"
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
                      <ShoppingBag className="w-4 h-4 text-[#2d5016]" />
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
                        <MapPin className="w-4 h-4 text-[#2d5016]" />
                        Delivering to
                      </h3>
                      {(() => {
                        const addr = addresses.find(
                          (a) => a._id === selectedShipping,
                        );
                        if (!addr) return null;
                        return (
                          <div className="bg-[#2d5016]/5 border border-[#2d5016]/20 rounded-xl px-4 py-3 text-sm">
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
                    <PriceRow label="Shipping" value="FREE" green />
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
                  className="bg-linear-to-r from-[#2d5016] to-[#3d6820] hover:opacity-90 text-white font-bold px-8 h-12 gap-2 shadow-md"
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
                  onClick={handlePayNow}
                  disabled={loading || !agree}
                  className="bg-linear-to-r from-[#2d5016] to-[#3d6820] hover:opacity-90 text-white font-bold px-8 h-12 gap-2 shadow-md disabled:opacity-50"
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
          ? "border-[#2d5016] bg-[#2d5016]/5 shadow-sm"
          : "border-gray-100 hover:border-[#2d5016]/30 bg-white",
      )}
    >
      <div className="flex items-start gap-3">
        {/* Radio dot */}
        <div
          className={cn(
            "mt-0.5 w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors",
            selected
              ? "border-[#2d5016] bg-[#2d5016]"
              : "border-gray-300 group-hover:border-[#2d5016]/50",
          )}
        >
          {selected && <div className="w-2 h-2 rounded-full bg-white" />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <p className="font-bold text-sm text-gray-900">{addr.fullName}</p>
            {addr.isDefault && (
              <span className="text-[10px] bg-[#d4af37] text-black px-1.5 py-0.5 rounded-full font-bold leading-tight">
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
        className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 bg-[#2d5016] text-white rounded-full hover:bg-[#3d6820] transition-colors"
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
