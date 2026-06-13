"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Package,
  Download,
  Eye,
  Calendar,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight,
  ShoppingBag,
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
    iconColor: "text-amber-600",
  },
  PAID: {
    label: "Paid",
    icon: CheckCircle,
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    iconColor: "text-emerald-600",
  },
  PROCESSING: {
    label: "Processing",
    icon: Package,
    color: "bg-blue-50 text-blue-700 border-blue-200",
    iconColor: "text-blue-600",
  },
  SHIPPED: {
    label: "Shipped",
    icon: Truck,
    color: "bg-purple-50 text-purple-700 border-purple-200",
    iconColor: "text-purple-600",
  },
  DELIVERED: {
    label: "Delivered",
    icon: CheckCircle,
    color: "bg-green-50 text-green-700 border-green-200",
    iconColor: "text-green-600",
  },
  CANCELLED: {
    label: "Cancelled",
    icon: XCircle,
    color: "bg-red-50 text-red-700 border-red-200",
    iconColor: "text-red-600",
  },
};

export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated, loading: userLoading } = useUserStore();
  const { orders, loading, fetchMyOrders } = useOrderStore();

  useEffect(() => {
    if (isAuthenticated) {
      fetchMyOrders();
    } else {
      router.replace("/login");
    }
  }, [isAuthenticated]);

  return (
    <div className="min-h-screen bg-linear-to-b from-[#fafaf6] via-white to-[#fafaf6] py-8 md:py-12">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 md:mb-12"
        >
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3">
            My Orders
          </h1>
          <p className="text-base md:text-lg text-gray-600">
            Track, manage, and view your order history
          </p>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse border-2">
                <CardContent className="p-6">
                  <div className="h-6 bg-gray-200 rounded-lg w-1/4 mb-4" />
                  <div className="h-4 bg-gray-200 rounded-lg w-1/3 mb-2" />
                  <div className="h-4 bg-gray-200 rounded-lg w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && orders.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border-2 border-dashed border-gray-200 bg-white shadow-lg">
              <CardContent className="p-12 md:p-16 text-center">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-linear-to-br from-[#2d5016]/10 to-[#d4af37]/10 flex items-center justify-center">
                  <ShoppingBag className="w-12 h-12 text-[#2d5016]" />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                  No Orders Yet
                </h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Start your journey with Paanshala and discover our authentic
                  paan collection
                </p>
                <Button
                  onClick={() => router.push("/shop")}
                  className="bg-linear-to-r from-[#2d5016] to-[#3d6820] hover:opacity-90 text-white px-8 py-6 text-lg font-semibold shadow-lg"
                >
                  Start Shopping
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Orders List */}
        {!loading && orders.length > 0 && (
          <div className="space-y-6">
            {orders.map((order, index) => (
              <OrderCard key={order._id} order={order} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================
   ORDER CARD
========================= */
function OrderCard({ order, index }) {
  const router = useRouter();
  const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.PAID;
  const StatusIcon = statusConfig.icon;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 bg-white">
        <CardContent className="p-0">
          {/* Header */}
          <div className="bg-linear-to-r from-[#fafaf6] to-white p-4 md:p-6 border-b-2 border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              {/* Order Info */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2 md:gap-3">
                  <h3 className="text-base md:text-lg font-bold text-gray-900">
                    ORDER #{order._id.slice(-8).toUpperCase()}
                  </h3>
                  <Badge
                    className={cn("border font-semibold", statusConfig.color)}
                  >
                    <StatusIcon className="w-3 h-3 mr-1.5" />
                    {statusConfig.label}
                  </Badge>
                </div>

                <div className="flex flex-wrap items-center gap-3 md:gap-4 text-xs md:text-sm text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(order.createdAt)}</span>
                  </div>
                  <span className="hidden sm:inline">•</span>
                  <div className="flex items-center gap-1.5">
                    <Package className="w-4 h-4" />
                    <span>
                      {order.items.length} item
                      {order.items.length > 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              </div>

              {/* Total Amount */}
              <div className="text-left md:text-right">
                <p className="text-xs md:text-sm text-gray-600 mb-1">
                  Total Amount
                </p>
                <p className="text-2xl md:text-3xl font-bold bg-linear-to-r from-[#2d5016] to-[#3d6820] bg-clip-text text-transparent">
                  ₹{order.totalAmount}
                </p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="p-4 md:p-6 bg-gray-50">
            <div className="space-y-3">
              {order.items.slice(0, 3).map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl bg-white hover:shadow-md transition-all duration-300 border border-gray-100"
                >
                  {/* Product Image */}
                  <div className="relative w-14 h-14 md:w-16 md:h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0 border-2 border-gray-100">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-6 h-6 md:w-8 md:h-8 text-gray-300" />
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm md:text-base text-gray-900 truncate">
                      {item.name}
                    </p>
                    <p className="text-xs md:text-sm text-gray-600 mt-0.5">
                      {item.variantSetSize &&
                        `${item.variantSetSize} pieces • `}
                      Qty: {item.quantity}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="text-right shrink-0">
                    <p className="font-bold text-sm md:text-base text-[#2d5016]">
                      ₹{item.totalPrice}
                    </p>
                  </div>
                </div>
              ))}

              {/* More Items Indicator */}
              {order.items.length > 3 && (
                <div className="text-center py-3 text-sm text-gray-500 bg-white rounded-lg border border-gray-100">
                  +{order.items.length - 3} more item
                  {order.items.length - 3 > 1 ? "s" : ""}
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="bg-white px-4 md:px-6 py-4 border-t-2 border-gray-100 flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => router.push(`/orders/${order._id}`)}
              className="flex-1 bg-linear-to-r from-[#2d5016] to-[#3d6820] hover:opacity-90 text-white font-semibold h-11 md:h-12"
            >
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </Button>

            {order.invoiceUrl && (
              <Button
                variant="outline"
                onClick={() => window.open(order.invoiceUrl, "_blank")}
                className="flex-1 border-2 bg-black text-white hover:text-black hover:bg-white border-[#2d5016] font-semibold h-11 md:h-12 hover:cursor-pointer"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Invoice
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}