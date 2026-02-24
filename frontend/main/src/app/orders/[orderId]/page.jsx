"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Package,
  Download,
  MapPin,
  CreditCard,
  Calendar,
  Truck,
  CheckCircle,
  ArrowLeft,
  Clock,
  XCircle,
} from "lucide-react";

import { useUserStore } from "@/stores/useUserStore";
import { useOrderStore } from "@/stores/useOrderStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_CONFIG = {
  PENDING_PAYMENT: { label: "Pending Payment", icon: Clock, color: "yellow" },
  PAID: { label: "Paid", icon: CheckCircle, color: "green" },
  PROCESSING: { label: "Processing", icon: Package, color: "blue" },
  SHIPPED: { label: "Shipped", icon: Truck, color: "purple" },
  DELIVERED: { label: "Delivered", icon: CheckCircle, color: "green" },
  CANCELLED: { label: "Cancelled", icon: XCircle, color: "red" },
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">Order not found</p>
          <Button onClick={() => router.push("/orders")} className="mt-4">
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
    <div className="min-h-screen bg-gradient-to-b from-white via-[#fafaf6] to-white py-8">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push("/orders")}
          className="mb-6 -ml-2"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Orders
        </Button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Order Details
              </h1>
              <p className="text-gray-600">
                Order #{order._id.slice(-12).toUpperCase()}
              </p>
            </div>

            {order.invoiceUrl && (
              <Button
                onClick={() => window.open(order.invoiceUrl, "_blank")}
                className="bg-gradient-to-r from-[#2d5016] to-[#3d6820]"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Invoice
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT - ORDER DETAILS */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Timeline */}
            {order.status !== "CANCELLED" && (
              <Card className="border-2 border-gray-100">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">
                    Order Status
                  </h2>

                  <div className="relative">
                    {/* Progress Line */}
                    <div className="absolute top-8 left-0 right-0 h-0.5 bg-gray-200" />
                    <div
                      className="absolute top-8 left-0 h-0.5 bg-green-500 transition-all duration-500"
                      style={{
                        width: `${(currentStatusIndex / (ORDER_TIMELINE.length - 1)) * 100}%`,
                      }}
                    />

                    {/* Timeline Steps */}
                    <div className="relative grid grid-cols-4 gap-4">
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
                                "w-16 h-16 rounded-full flex items-center justify-center mb-3 transition-all",
                                isCompleted
                                  ? "bg-green-500 text-white shadow-lg"
                                  : "bg-gray-200 text-gray-400",
                              )}
                            >
                              <StepIcon className="w-8 h-8" />
                            </div>
                            <p
                              className={cn(
                                "text-xs md:text-sm font-medium text-center",
                                isCompleted ? "text-gray-900" : "text-gray-500",
                              )}
                            >
                              {step.label}
                            </p>
                            {isCurrent && (
                              <Badge className="mt-2 bg-green-100 text-green-800">
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
            )}

            {/* Cancelled Status */}
            {order.status === "CANCELLED" && (
              <Card className="border-2 border-red-200 bg-red-50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 text-red-700">
                    <XCircle className="w-6 h-6" />
                    <div>
                      <h3 className="font-bold text-lg">Order Cancelled</h3>
                      <p className="text-sm">This order has been cancelled</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Order Items */}
            <Card className="border-2 border-gray-100">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Order Items
                </h2>

                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:border-[#2d5016] transition-colors"
                    >
                      {/* Product Image */}
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-10 h-10 text-gray-300" />
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 mb-1">
                          {item.name}
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
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
                      <div className="text-right flex-shrink-0">
                        <p className="text-lg font-bold text-gray-900">
                          ₹{item.totalPrice}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price Summary */}
                <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                  <PriceRow label="Subtotal" value={`₹${order.subtotal}`} />
                  {order.discount > 0 && (
                    <PriceRow
                      label="Discount"
                      value={`-₹${order.discount}`}
                      highlight="green"
                    />
                  )}
                  <div className="pt-3 border-t border-gray-200">
                    <PriceRow
                      label="Total Amount"
                      value={`₹${order.totalAmount}`}
                      bold
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT - ADDRESSES & PAYMENT */}
          <div className="space-y-6">
            {/* Shipping Address */}
            <Card className="border-2 border-gray-100">
              <CardContent className="p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-[#2d5016]" />
                  Shipping Address
                </h2>
                <AddressDisplay address={order.shippingAddress} />
              </CardContent>
            </Card>

            {/* Billing Address */}
            <Card className="border-2 border-gray-100">
              <CardContent className="p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#2d5016]" />
                  Billing Address
                </h2>
                <AddressDisplay address={order.billingAddress} />
              </CardContent>
            </Card>

            {/* Payment Info */}
            <Card className="border-2 border-gray-100">
              <CardContent className="p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  Payment Information
                </h2>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Status</span>
                    <Badge
                      className={cn(
                        order.payment.status === "PAID"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800",
                      )}
                    >
                      {order.payment.status}
                    </Badge>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment ID</span>
                    <span className="font-mono text-xs">
                      {order.payment.razorpayPaymentId?.slice(-10) || "N/A"}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Order Date</span>
                    <span>
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
    <div className="text-sm space-y-1">
      <p className="font-bold text-gray-900">{address.fullName}</p>
      {address.companyName && (
        <p className="text-gray-700">{address.companyName}</p>
      )}
      <p className="text-gray-700">{address.streetAddress}</p>
      {address.landmark && <p className="text-gray-700">{address.landmark}</p>}
      <p className="text-gray-700">
        {address.city}, {address.state} - {address.pincode}
      </p>
      <div className="pt-2 space-y-1 text-gray-600">
        <p>📞 {address.phone}</p>
        <p>📧 {address.email}</p>
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
        bold && "text-lg font-bold text-gray-900",
        !bold && "text-sm text-gray-700",
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
    <div className="min-h-screen bg-gradient-to-b from-white via-[#fafaf6] to-white py-8">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-gray-200 rounded w-1/4" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-64 bg-gray-200 rounded-xl" />
              <div className="h-96 bg-gray-200 rounded-xl" />
            </div>
            <div className="space-y-6">
              <div className="h-48 bg-gray-200 rounded-xl" />
              <div className="h-48 bg-gray-200 rounded-xl" />
              <div className="h-32 bg-gray-200 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
