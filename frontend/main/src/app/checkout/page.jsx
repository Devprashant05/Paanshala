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
} from "lucide-react";

import { useUserStore } from "@/stores/useUserStore";
import { useCartStore } from "@/stores/useCartStore";
import { useOrderStore } from "@/stores/useOrderStore";
import { useAddressStore } from "@/stores/useAddressStore";
import { useCouponStore } from "@/stores/useCouponStore";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

/* ─── Razorpay loader ─── */
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

export default function CheckoutPage() {
  const router = useRouter();

  const { isAuthenticated, user } = useUserStore();
  const { cart, fetchCart } = useCartStore();
  const { resetCart } = useCartStore.getState();
  const { createPaymentOrder, verifyPaymentAndCreateOrder, loading } = useOrderStore();
  const { addresses, fetchAddresses, deleteAddress } = useAddressStore();
  const { coupon: appliedCoupon, clearCoupon } = useCouponStore();

  const [selectedShipping, setSelectedShipping] = useState(null);
  const [selectedBilling, setSelectedBilling] = useState(null);
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [agree, setAgree] = useState(false);

  // AddressForm modal
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Prevents cart-empty guard from redirecting to /cart after payment succeeds
  const orderCompleted = useRef(false);

  /* ── init ── */
  useEffect(() => {
    if (!isAuthenticated) { router.push("/login"); return; }
    fetchCart();
    fetchAddresses();
  }, [isAuthenticated]);

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

  if (!cart?.items?.length && !orderCompleted.current) {
    router.push("/cart");
    return null;
  }

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
    if (!loaded) { toast.error("Razorpay failed to load"); return; }

    const razorpayOrder = await createPaymentOrder(
      appliedCoupon?.code ? { couponCode: appliedCoupon.code } : {}
    );
    if (!razorpayOrder) return;

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
      amount: razorpayOrder.amount,
      currency: "INR",
      name: "Paanshala",
      description: "Order Payment",
      order_id: razorpayOrder.id,
      prefill: { name: user.full_name, email: user.email, contact: user.phone || "" },
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

        // Navigate FIRST — clearing cart triggers the "cart empty → /cart"
        // guard in this component, which would race against router.push("/orders")
        orderCompleted.current = true;
        router.push("/orders");
        clearCoupon();
        resetCart();
      },
      modal: { ondismiss: () => toast.error("Payment cancelled") },
      theme: { color: "#2d5016" },
    };

    new window.Razorpay(options).open();
  };

  /* ── delete ── */
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    await deleteAddress(deleteTarget._id);
    // deselect if deleted address was selected
    if (selectedShipping === deleteTarget._id) setSelectedShipping(null);
    if (selectedBilling === deleteTarget._id) setSelectedBilling(null);
    setDeleteLoading(false);
    setDeleteTarget(null);
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-white via-[#fafaf6] to-white py-8">
      <div className="max-w-7xl mx-auto px-4 md:px-6">

        {/* ── Progress steps ── */}
        <div className="mb-10">
          <div className="flex items-center justify-center gap-2 md:gap-4">
            <Step icon={ShoppingBag} label="Cart" completed />
            <StepLine completed />
            <Step icon={MapPin} label="Address" active />
            <StepLine />
            <Step icon={CreditCard} label="Payment" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── LEFT: address selection ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Shipping */}
            <AddressSection
              title="Shipping Address"
              icon={<Package className="w-5 h-5 text-[#2d5016]" />}
              addresses={addresses}
              selected={selectedShipping}
              onSelect={setSelectedShipping}
              onAdd={() => { setEditingAddress(null); setShowAddressForm(true); }}
              onEdit={(addr) => { setEditingAddress(addr); setShowAddressForm(true); }}
              onDelete={setDeleteTarget}
            />

            {/* Billing */}
            <Card className="border-2 border-gray-100 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-[#2d5016]" />
                    Billing Address
                  </h2>
                </div>

                {/* Same as shipping toggle */}
                <button
                  type="button"
                  onClick={() => setSameAsShipping((v) => !v)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all duration-200 text-left mb-4",
                    sameAsShipping
                      ? "bg-[#2d5016]/5 border-[#2d5016]/40 text-[#2d5016]"
                      : "bg-gray-50 border-gray-200 text-gray-600 hover:border-[#2d5016]/30"
                  )}
                >
                  <div className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                    sameAsShipping ? "border-[#2d5016] bg-[#2d5016]" : "border-gray-300"
                  )}>
                    {sameAsShipping && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <span className="text-sm font-semibold">
                    Same as shipping address
                  </span>
                </button>

                {/* Show billing selector only when not same */}
                <AnimatePresence>
                  {!sameAsShipping && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <AddressSection
                        addresses={addresses}
                        selected={selectedBilling}
                        onSelect={setSelectedBilling}
                        onAdd={() => { setEditingAddress(null); setShowAddressForm(true); }}
                        onEdit={(addr) => { setEditingAddress(addr); setShowAddressForm(true); }}
                        onDelete={setDeleteTarget}
                        embedded
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </div>

          {/* ── RIGHT: order summary ── */}
          <div className="lg:sticky lg:top-24 h-fit">
            <OrderSummary
              cart={cart}
              appliedCoupon={appliedCoupon}
              agree={agree}
              setAgree={setAgree}
              onPayNow={handlePayNow}
              loading={loading}
            />
          </div>
        </div>
      </div>

      {/* ── AddressForm modal ── */}
      <AnimatePresence>
        {showAddressForm && (
          <AddressForm
            onClose={() => setShowAddressForm(false)}
            initialData={editingAddress}
          />
        )}
      </AnimatePresence>

      {/* ── Delete confirmation ── */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2.5 bg-red-100 rounded-full">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <AlertDialogTitle className="text-xl">Remove Address?</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-gray-600 pt-1">
              Are you sure you want to remove{" "}
              <span className="font-semibold text-gray-800">{deleteTarget?.fullName}</span>
              's address? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel disabled={deleteLoading} className="h-10" onClick={() => setDeleteTarget(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteLoading}
              className="bg-red-600 hover:bg-red-700 h-10"
            >
              {deleteLoading
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Removing…</>
                : <><Trash2 className="w-4 h-4 mr-2" />Remove</>}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* ===========================
   ADDRESS SECTION
   (reused for shipping + billing)
=========================== */
function AddressSection({
  title, icon, addresses, selected,
  onSelect, onAdd, onEdit, onDelete,
  embedded = false,
}) {
  const inner = (
    <div className="space-y-4">
      {/* Header — only shown when not embedded */}
      {!embedded && (
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            {icon}
            {title}
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={onAdd}
            className="border-[#2d5016] text-[#2d5016] hover:bg-[#2d5016] hover:text-white gap-1.5 h-9"
          >
            <Plus className="w-3.5 h-3.5" />
            Add New
          </Button>
        </div>
      )}

      {/* Empty state */}
      {addresses.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-2xl">
          <MapPin className="w-10 h-10 mx-auto mb-3 text-gray-300" />
          <p className="text-sm text-gray-500 mb-3">No addresses saved yet</p>
          <Button
            size="sm"
            onClick={onAdd}
            className="bg-[#2d5016] hover:bg-[#3d6820] gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Address
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((addr) => (
            <CheckoutAddressCard
              key={addr._id}
              addr={addr}
              selected={selected === addr._id}
              onSelect={() => onSelect(addr._id)}
              onEdit={() => onEdit(addr)}
              onDelete={() => onDelete(addr)}
            />
          ))}

          {/* Inline add when embedded */}
          {embedded && (
            <button
              onClick={onAdd}
              className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-500 hover:border-[#2d5016]/40 hover:text-[#2d5016] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add another address
            </button>
          )}
        </div>
      )}
    </div>
  );

  if (embedded) return inner;

  return (
    <Card className="border-2 border-gray-100 shadow-sm">
      <CardContent className="p-6">{inner}</CardContent>
    </Card>
  );
}

/* ===========================
   CHECKOUT ADDRESS CARD
=========================== */
function CheckoutAddressCard({ addr, selected, onSelect, onEdit, onDelete }) {
  return (
    <div
      onClick={onSelect}
      className={cn(
        "relative border-2 rounded-2xl p-4 cursor-pointer transition-all duration-200 group",
        selected
          ? "border-[#2d5016] bg-[#2d5016]/5 shadow-sm"
          : "border-gray-200 hover:border-[#2d5016]/30 bg-white"
      )}
    >
      {/* Selection indicator */}
      <div className="flex items-start gap-3">
        <div className={cn(
          "mt-0.5 w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors",
          selected ? "border-[#2d5016] bg-[#2d5016]" : "border-gray-300 group-hover:border-[#2d5016]/50"
        )}>
          {selected && <div className="w-2 h-2 rounded-full bg-white" />}
        </div>

        <div className="flex-1 min-w-0">
          {/* Name row */}
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <p className="font-bold text-gray-900 text-sm">{addr.fullName}</p>
            {addr.isDefault && (
              <span className="text-xs bg-[#d4af37] text-black px-2 py-0.5 rounded-full font-semibold leading-tight">
                Default
              </span>
            )}
          </div>

          {addr.companyName && (
            <p className="text-xs text-gray-400 mb-1">{addr.companyName}</p>
          )}

          <p className="text-sm text-gray-600 leading-snug mb-0.5">
            {addr.streetAddress}
            {addr.landmark && <span className="text-gray-400">, {addr.landmark}</span>}
          </p>
          <p className="text-sm text-gray-600 mb-2">
            {addr.city}, {addr.state} –{" "}
            <span className="font-semibold text-gray-700">{addr.pincode}</span>
          </p>

          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
              <Phone className="w-3 h-3 text-[#2d5016]/60" />
              {addr.phone}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
              <Mail className="w-3 h-3 text-[#2d5016]/60" />
              {addr.email}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-1 shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            title="Edit"
          >
            <Edit2 className="w-3.5 h-3.5 text-gray-500" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
            title="Remove"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-400" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ===========================
   ORDER SUMMARY
=========================== */
function OrderSummary({ cart, appliedCoupon, agree, setAgree, onPayNow, loading }) {
  // Compute discount locally from coupon store — cart.discount is stale
  // since we don't re-fetch the cart after coupon validation
  const subtotal = cart.subtotal || 0;
  let discount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === "percentage") {
      discount = (subtotal * appliedCoupon.discountValue) / 100;
      if (appliedCoupon.maxDiscount) {
        discount = Math.min(discount, appliedCoupon.maxDiscount);
      }
    } else {
      discount = appliedCoupon.discountValue;
    }
    discount = Math.min(discount, subtotal);
  }
  const total = Math.max(0, subtotal - discount);
  return (
    <Card className="border-2 border-gray-100 shadow-xl">
      <CardContent className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

        {/* Items */}
        <div className="space-y-3 mb-6 max-h-60 overflow-y-auto pr-1">
          {cart.items.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                <Image
                  src={item.product?.images?.[0] || "/placeholder-product.png"}
                  alt={item.product?.name || "Product"}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 line-clamp-1">
                  {item.product?.name}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {item.variantSetSize && `${item.variantSetSize} pcs · `}
                  Qty: {item.quantity}
                </p>
              </div>
              <p className="text-sm font-bold text-gray-900 shrink-0">
                ₹{item.totalPrice}
              </p>
            </div>
          ))}
        </div>

        {/* Price breakdown */}
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

        {/* Terms */}
        <div
          onClick={() => setAgree((v) => !v)}
          className={cn(
            "flex items-start gap-3 mb-5 p-3 rounded-xl border cursor-pointer transition-colors",
            agree
              ? "bg-[#2d5016]/5 border-[#2d5016]/30"
              : "bg-gray-50 border-gray-200 hover:border-[#2d5016]/20"
          )}
        >
          <Checkbox
            id="agree-terms"
            checked={agree}
            onCheckedChange={setAgree}
            className="mt-0.5 shrink-0"
          />
          <label htmlFor="agree-terms" className="text-sm text-gray-700 cursor-pointer leading-relaxed">
            I agree to the{" "}
            <a href="/terms" onClick={(e) => e.stopPropagation()} className="text-[#2d5016] underline font-medium">
              Terms & Conditions
            </a>{" "}
            and{" "}
            <a href="/privacy" onClick={(e) => e.stopPropagation()} className="text-[#2d5016] underline font-medium">
              Privacy Policy
            </a>
          </label>
        </div>

        {/* Pay button */}
        <Button
          onClick={onPayNow}
          disabled={loading || !agree}
          className="w-full h-14 bg-linear-to-r from-[#2d5016] to-[#3d6820] hover:opacity-90 text-white font-bold text-lg shadow-lg gap-2 disabled:opacity-50"
        >
          {loading ? (
            <><Loader2 className="w-5 h-5 animate-spin" />Processing…</>
          ) : (
            <><Lock className="w-5 h-5" />Pay ₹{total}</>
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

/* ===========================
   HELPERS
=========================== */
function PriceRow({ label, value, bold, green }) {
  return (
    <div className={cn(
      "flex items-center justify-between",
      bold ? "text-base font-bold text-gray-900" : "text-sm text-gray-600",
      green && "text-green-600 font-semibold"
    )}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function Step({ icon: Icon, label, active, completed }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className={cn(
        "w-11 h-11 rounded-full flex items-center justify-center transition-all shadow-sm",
        completed ? "bg-green-500 text-white" :
        active ? "bg-linear-to-br from-[#2d5016] to-[#3d6820] text-white" :
        "bg-gray-100 text-gray-400"
      )}>
        {completed ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
      </div>
      <span className={cn(
        "text-xs md:text-sm font-medium",
        active || completed ? "text-gray-900" : "text-gray-400"
      )}>
        {label}
      </span>
    </div>
  );
}

function StepLine({ completed }) {
  return (
    <div className={cn(
      "h-0.5 w-10 md:w-20 rounded-full mb-5",
      completed ? "bg-green-500" : "bg-gray-200"
    )} />
  );
}