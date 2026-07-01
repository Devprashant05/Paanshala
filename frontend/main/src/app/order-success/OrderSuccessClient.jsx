"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  CheckCircle,
  Package,
  MapPin,
  Phone,
  Mail,
  ArrowRight,
  ShoppingBag,
  Download,
  Loader2,
  Clock,
  Truck,
  Home,
} from "lucide-react";
import { useOrderStore } from "@/stores/useOrderStore";
import { cn } from "@/lib/utils";

const STATUS_STEPS = [
  { key: "PAID", label: "Order Placed", icon: CheckCircle },
  { key: "PROCESSING", label: "Processing", icon: Clock },
  { key: "SHIPPED", label: "Shipped", icon: Truck },
  { key: "DELIVERED", label: "Delivered", icon: Home },
];

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId");

  const { fetchOrderDetails, currentOrder, loading } = useOrderStore();
  const [confettiDone, setConfettiDone] = useState(false);

  useEffect(() => {
    if (orderId) fetchOrderDetails(orderId);
  }, [orderId]);

  useEffect(() => {
    const t = setTimeout(() => setConfettiDone(true), 3000);
    return () => clearTimeout(t);
  }, []);

  if (loading || !currentOrder) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-white to-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-[#2d5016]" />
          <p className="text-sm text-gray-500">Loading your order…</p>
        </div>
      </div>
    );
  }

  const o = currentOrder;
  const isCOD = o.paymentMethod === "COD";
  const stepIndex = STATUS_STEPS.findIndex((s) => s.key === o.status);

  return (
    <div className="min-h-screen bg-linear-to-b from-[#f0f7ed] via-white to-gray-50">
      {/* ── Celebration header ── */}
      <div className="relative overflow-hidden bg-linear-to-r from-[#1e3a0f] via-[#2d5016] to-[#1e3a0f] py-16 md:py-20">
        {/* Dot pattern */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(212,175,55,0.18) 1.5px, transparent 1.5px)",
            backgroundSize: "28px 28px",
          }}
        />
        {/* Gold blobs */}
        <div className="pointer-events-none absolute -top-20 -right-20 w-80 h-80 bg-[#d4af37]/10 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 w-80 h-80 bg-[#d4af37]/8 rounded-full blur-3xl" />

        <div className="relative max-w-3xl mx-auto px-4 text-center">
          {/* Animated checkmark */}
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: "spring",
              damping: 14,
              stiffness: 200,
              delay: 0.1,
            }}
            className="w-24 h-24 mx-auto mb-6 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center"
          >
            <CheckCircle className="w-12 h-12 text-[#d4af37]" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-[#d4af37] text-xs font-bold uppercase tracking-[0.25em] mb-3">
              {isCOD ? "Order Confirmed" : "Payment Successful"}
            </p>
            <h1
              className="text-3xl md:text-5xl font-extrabold text-white mb-3"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Thank You! 🎉
            </h1>
            <p className="text-white/65 text-base md:text-lg max-w-md mx-auto">
              Your order{" "}
              <span className="text-white font-bold">#{o.orderNumber}</span> has
              been placed successfully.
              {isCOD ? " Pay on delivery." : " Payment received."}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Gold accent */}
      <div className="h-0.75 bg-linear-to-r from-transparent via-[#d4af37] to-transparent" />

      <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
        {/* ── Order status tracker ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
        >
          <h2 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Package className="w-4 h-4 text-[#2d5016]" />
            Order Status
          </h2>

          <div className="flex items-center justify-between relative">
            {/* Connecting line */}
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 z-0" />
            <div
              className="absolute top-5 left-0 h-0.5 bg-[#2d5016] z-0 transition-all duration-700"
              style={{
                width: `${(Math.max(0, stepIndex) / (STATUS_STEPS.length - 1)) * 100}%`,
              }}
            />

            {STATUS_STEPS.map((step, i) => {
              const done = i <= stepIndex;
              const active = i === stepIndex;
              return (
                <div
                  key={step.key}
                  className="relative z-10 flex flex-col items-center gap-2"
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all",
                      done
                        ? "bg-[#2d5016] border-[#2d5016] text-white"
                        : "bg-white border-gray-200 text-gray-300",
                    )}
                  >
                    <step.icon className="w-4 h-4" />
                  </div>
                  <span
                    className={cn(
                      "text-[10px] font-semibold text-center max-w-14 leading-tight",
                      done ? "text-[#2d5016]" : "text-gray-400",
                    )}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* COD note */}
          {isCOD && (
            <div className="mt-5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
              💵 Cash on Delivery — please keep{" "}
              <span className="font-bold">₹{o.totalAmount}</span> ready at the
              time of delivery.
              {o.codCharges > 0 && (
                <span className="block text-xs mt-0.5 text-amber-600">
                  Includes ₹{o.codCharges} COD handling charge.
                </span>
              )}
            </div>
          )}
        </motion.div>

        {/* ── Order summary ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-[#2d5016]" />
            <h2 className="font-bold text-gray-900">Order Summary</h2>
            <span className="ml-auto text-xs text-gray-400 font-mono">
              #{o.orderNumber}
            </span>
          </div>

          {/* Items */}
          <div className="divide-y divide-gray-50">
            {o.items?.map((item, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4">
                <div className="relative w-14 h-14 shrink-0 rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
                  <Image
                    src={item.image || "/placeholder-product.png"}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
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

          {/* Totals */}
          <div className="px-6 py-4 bg-gray-50 space-y-2 border-t border-gray-100">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Subtotal</span>
              <span>₹{o.subtotal}</span>
            </div>
            {o.discount > 0 && (
              <div className="flex justify-between text-sm text-green-600 font-semibold">
                <span>Discount {o.coupon?.code && `(${o.coupon.code})`}</span>
                <span>−₹{o.discount}</span>
              </div>
            )}
            {o.codCharges > 0 && (
              <div className="flex justify-between text-sm text-gray-500">
                <span>COD Charges</span>
                <span>+₹{o.codCharges}</span>
              </div>
            )}
            <div className="flex justify-between text-sm text-green-600 font-semibold">
              <span>Shipping</span>
              <span>FREE</span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-200">
              <span>Total</span>
              <span>₹{o.totalAmount}</span>
            </div>
          </div>
        </motion.div>

        {/* ── Delivery address ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
        >
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#2d5016]" />
            Delivering to
          </h2>
          {o.shippingAddress && (
            <div className="text-sm text-gray-600 space-y-1">
              <p className="font-semibold text-gray-900">
                {o.shippingAddress.fullName}
              </p>
              {o.shippingAddress.companyName && (
                <p className="text-gray-400">{o.shippingAddress.companyName}</p>
              )}
              <p>
                {o.shippingAddress.streetAddress}
                {o.shippingAddress.landmark &&
                  `, ${o.shippingAddress.landmark}`}
              </p>
              <p>
                {o.shippingAddress.city}, {o.shippingAddress.state} –{" "}
                {o.shippingAddress.pincode}
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                <span className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Phone className="w-3 h-3" />
                  {o.shippingAddress.phone}
                </span>
                {o.shippingAddress.email && (
                  <span className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Mail className="w-3 h-3" />
                    {o.shippingAddress.email}
                  </span>
                )}
              </div>
            </div>
          )}
        </motion.div>

        {/* ── Actions ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          {o.invoiceUrl && (
            <a
              href={o.invoiceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 border-2 border-[#2d5016] text-[#2d5016] font-bold rounded-xl hover:bg-[#2d5016] hover:text-white transition-all text-sm"
            >
              <Download className="w-4 h-4" />
              Download Invoice
            </a>
          )}
          <Link
            href="/login"
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all text-sm"
          >
            <Package className="w-4 h-4" />
            Login To View Orders
          </Link>
          <Link
            href="/shop"
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-linear-to-r from-[#2d5016] to-[#3d6820] text-white font-bold rounded-xl hover:opacity-90 transition-all text-sm shadow-md"
          >
            Continue Shopping
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
