"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Package,
  Download,
  Truck,
  CheckCircle,
  ArrowLeft,
  Clock,
  XCircle,
  CreditCard,
  Phone,
  Mail,
} from "lucide-react";

import { useUserStore } from "@/stores/useUserStore";
import { useOrderStore } from "@/stores/useOrderStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_CONFIG = {
  PENDING_PAYMENT: {
    label: "Pending Payment",
    icon: Clock,
    color: "bg-amber-50 text-amber-700 border-amber-200",
  },
  PAID: {
    label: "Paid",
    icon: CheckCircle,
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  PROCESSING: {
    label: "Processing",
    icon: Package,
    color: "bg-blue-50 text-blue-700 border-blue-200",
  },
  SHIPPED: {
    label: "Shipped",
    icon: Truck,
    color: "bg-purple-50 text-purple-700 border-purple-200",
  },
  DELIVERED: {
    label: "Delivered",
    icon: CheckCircle,
    color: "bg-green-50 text-green-700 border-green-200",
  },
  CANCELLED: {
    label: "Cancelled",
    icon: XCircle,
    color: "bg-red-50 text-red-700 border-red-200",
  },
};

const ORDER_TIMELINE = [
  { key: "PAID", label: "Order Placed", icon: CheckCircle },
  { key: "PROCESSING", label: "Processing", icon: Package },
  { key: "SHIPPED", label: "Shipped", icon: Truck },
  { key: "DELIVERED", label: "Delivered", icon: CheckCircle },
];

export default function OrderDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params?.orderId;

  const { isAuthenticated } = useUserStore();
  const { currentOrder, loading, fetchOrderDetails } = useOrderStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (orderId) {
      fetchOrderDetails(orderId);
    }
  }, [isAuthenticated, orderId]);

  if (loading) {
    return <OrderDetailsSkeleton />;
  }

  if (!currentOrder) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background: "linear-gradient(to bottom, #fafaf6, white, #fafaf6)",
        }}
      >
        <div className="text-center">
          <div
            className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg, rgba(45, 80, 22, 0.1), rgba(212, 175, 55, 0.1))",
            }}
          >
            <Package className="w-12 h-12 text-[#2d5016]" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Order not found
          </h3>
          <p className="text-gray-600 mb-6">
            This order doesn't exist or you don't have access to it
          </p>
          <Button
            onClick={() => router.push("/orders")}
            className="text-white shadow-lg"
            style={{
              background: "linear-gradient(to right, #2d5016, #3d6820)",
            }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Orders
          </Button>
        </div>
      </div>
    );
  }

  const order = currentOrder;
  const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.PAID;
  const StatusIcon = statusConfig.icon;

  const getCurrentStatusIndex = () => {
    const statusOrder = ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"];
    return statusOrder.indexOf(order.status);
  };

  const currentStatusIndex = getCurrentStatusIndex();

  return (
    <div
      className="min-h-screen py-8 md:py-12"
      style={{
        background: "linear-gradient(to bottom, #fafaf6, white, #fafaf6)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Button
            variant="ghost"
            onClick={() => router.push("/orders")}
            className="mb-6 -ml-2 hover:bg-[#2d5016]/5 text-black" 
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Orders
          </Button>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-2 uppercase">
                Order Details
              </h1>
              <p className="text-base md:text-lg text-gray-600">
                Order #{order._id.slice(-12).toUpperCase()}
              </p>
            </div>

            {order.invoiceUrl && (
              <Button
                onClick={() => window.open(order.invoiceUrl, "_blank")}
                className="text-white font-semibold shadow-lg hover:opacity-90"
                style={{
                  background: "linear-gradient(to right, #2d5016, #3d6820)",
                }}
              >
                <Download className="w-4 h-4 mr-2" />
                Download Invoice
              </Button>
            )}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT - ORDER DETAILS */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Timeline */}
            {order.status !== "CANCELLED" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Card className="border-2 border-gray-100 shadow-lg bg-white">
                  <CardContent className="p-6 md:p-8">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-8 uppercase">
                      Order Status
                    </h2>

                    <div className="relative">
                      {/* Progress Line */}
                      <div className="absolute top-8 left-0 right-0 h-1 bg-gray-200 rounded-full" />
                      <div
                        className="absolute top-8 left-0 h-1 rounded-full transition-all duration-500"
                        style={{
                          width: `${(currentStatusIndex / (ORDER_TIMELINE.length - 1)) * 100}%`,
                          background:
                            "linear-gradient(to right, #2d5016, #3d6820)",
                        }}
                      />

                      {/* Timeline Steps */}
                      <div className="relative grid grid-cols-4 gap-2 md:gap-4">
                        {ORDER_TIMELINE.map((step, index) => {
                          const StepIcon = step.icon;
                          const isCompleted = index <= currentStatusIndex;
                          const isCurrent = index === currentStatusIndex;

                          return (
                            <div
                              key={step.key}
                              className="flex flex-col items-center"
                            >
                              <div
                                className={cn(
                                  "w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center mb-3 transition-all shadow-md",
                                  isCompleted
                                    ? "text-white shadow-lg"
                                    : "bg-gray-200 text-gray-400",
                                )}
                                style={
                                  isCompleted
                                    ? {
                                        background:
                                          "linear-gradient(135deg, #2d5016, #3d6820)",
                                      }
                                    : {}
                                }
                              >
                                <StepIcon className="w-6 h-6 md:w-8 md:h-8" />
                              </div>
                              <p
                                className={cn(
                                  "text-[10px] md:text-sm font-medium text-center leading-tight",
                                  isCompleted
                                    ? "text-gray-900"
                                    : "text-gray-500",
                                )}
                              >
                                {step.label}
                              </p>
                              {isCurrent && (
                                <Badge className="mt-2 bg-green-50 text-green-700 border border-green-200 text-xs">
                                  Current
                                </Badge>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Cancelled Status */}
            {order.status === "CANCELLED" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Card className="border-2 border-red-200 bg-red-50 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 text-red-700">
                      <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                        <XCircle className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">Order Cancelled</h3>
                        <p className="text-sm">This order has been cancelled</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Order Items */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="border-2 border-gray-100 shadow-lg bg-white">
                <CardContent className="p-6 md:p-8">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 uppercase">
                    Order Items
                  </h2>

                  <div className="space-y-4">
                    {order.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl border-2 border-gray-100 hover:border-[#2d5016] hover:shadow-md transition-all duration-300 bg-white"
                      >
                        {/* Product Image */}
                        <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden bg-gray-100 shrink-0 border-2 border-gray-100">
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-8 h-8 md:w-10 md:h-10 text-gray-300" />
                            </div>
                          )}
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-sm md:text-base text-gray-900 mb-1 truncate uppercase">
                            {item.name}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm text-gray-600">
                            {item.variantSetSize && (
                              <>
                                <span>{item.variantSetSize} pieces</span>
                                <span>•</span>
                              </>
                            )}
                            <span>Qty: {item.quantity}</span>
                            <span>•</span>
                            <span>₹{item.price} each</span>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="text-right shrink-0">
                          <p className="text-base md:text-lg font-bold text-[#2d5016]">
                            ₹{item.totalPrice}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Price Summary */}
                  <div className="mt-6 pt-6 border-t-2 border-gray-100 space-y-3">
                    <PriceRow label="Subtotal" value={`₹${order.subtotal}`} />
                    {order.discount > 0 && (
                      <PriceRow
                        label="Discount"
                        value={`-₹${order.discount}`}
                        highlight="green"
                      />
                    )}
                    <div className="pt-3 border-t-2 border-gray-100">
                      <PriceRow
                        label="Total Amount"
                        value={`₹${order.totalAmount}`}
                        bold
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* RIGHT - ADDRESSES & PAYMENT */}
          <div className="space-y-6">
            {/* Shipping Address */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="border-2 border-gray-100 shadow-lg bg-white">
                <CardContent className="p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 uppercase">
                    <div className="w-8 h-8 rounded-full bg-[#2d5016]/10 flex items-center justify-center">
                      <Truck className="w-5 h-5 text-[#2d5016]" />
                    </div>
                    Shipping Address
                  </h2>
                  <AddressDisplay address={order.shippingAddress} />
                </CardContent>
              </Card>
            </motion.div>

            {/* Billing Address */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="border-2 border-gray-100 shadow-lg bg-white">
                <CardContent className="p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 uppercase">
                    <div className="w-8 h-8 rounded-full bg-[#2d5016]/10 flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-[#2d5016]" />
                    </div>
                    Billing Address
                  </h2>
                  <AddressDisplay address={order.billingAddress} />
                </CardContent>
              </Card>
            </motion.div>

            {/* Payment Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="border-2 border-gray-100 shadow-lg bg-white">
                <CardContent className="p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-4 uppercase">
                    Payment Information
                  </h2>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Payment Status</span>
                      <Badge
                        className={cn(
                          "border font-semibold",
                          order.payment.status === "PAID"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-amber-50 text-amber-700 border-amber-200",
                        )}
                      >
                        {order.payment.status}
                      </Badge>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                      <span className="text-gray-600">Payment ID</span>
                      <span className="font-mono text-xs font-semibold text-gray-900">
                        {order.payment.razorpayPaymentId?.slice(-10) || "N/A"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                      <span className="text-gray-600">Order Date</span>
                      <span className="font-semibold text-gray-900">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================
   ADDRESS DISPLAY
========================= */
function AddressDisplay({ address }) {
  return (
    <div className="space-y-3">
      <div className="pb-3 border-b border-gray-100">
        <p className="font-bold text-base text-gray-900">{address.fullName}</p>
        {address.companyName && (
          <p className="text-sm text-gray-600 mt-1">{address.companyName}</p>
        )}
      </div>

      <div className="space-y-1.5 text-sm text-gray-700">
        <p>{address.streetAddress}</p>
        {address.landmark && (
          <p className="text-gray-600">Near: {address.landmark}</p>
        )}
        <p className="font-medium">
          {address.city}, {address.state} - {address.pincode}
        </p>
      </div>

      <div className="pt-3 space-y-2 border-t border-gray-100">
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <Phone className="w-4 h-4 text-[#2d5016]" />
          <span>{address.phone}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <Mail className="w-4 h-4 text-[#2d5016]" />
          <span className="truncate">{address.email}</span>
        </div>
      </div>
    </div>
  );
}

/* =========================
   PRICE ROW
========================= */
function PriceRow({ label, value, bold, highlight }) {
  return (
    <div
      className={cn(
        "flex items-center justify-between",
        bold && "text-lg md:text-xl font-bold text-gray-900",
        !bold && "text-sm md:text-base text-gray-700",
        highlight === "green" && "text-green-600 font-semibold",
      )}
    >
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

/* =========================
   LOADING SKELETON
========================= */
function OrderDetailsSkeleton() {
  return (
    <div
      className="min-h-screen py-8"
      style={{
        background: "linear-gradient(to bottom, #fafaf6, white, #fafaf6)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-gray-200 rounded-lg w-32" />
          <div className="h-12 bg-gray-200 rounded-lg w-1/3" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-72 bg-gray-200 rounded-xl" />
              <div className="h-96 bg-gray-200 rounded-xl" />
            </div>
            <div className="space-y-6">
              <div className="h-56 bg-gray-200 rounded-xl" />
              <div className="h-56 bg-gray-200 rounded-xl" />
              <div className="h-40 bg-gray-200 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}