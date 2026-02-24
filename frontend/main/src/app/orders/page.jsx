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
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    iconColor: "text-yellow-600",
  },
  PAID: {
    label: "Paid",
    icon: CheckCircle,
    color: "bg-green-100 text-green-800 border-green-200",
    iconColor: "text-green-600",
  },
  PROCESSING: {
    label: "Processing",
    icon: Package,
    color: "bg-blue-100 text-blue-800 border-blue-200",
    iconColor: "text-blue-600",
  },
  SHIPPED: {
    label: "Shipped",
    icon: Truck,
    color: "bg-purple-100 text-purple-800 border-purple-200",
    iconColor: "text-purple-600",
  },
  DELIVERED: {
    label: "Delivered",
    icon: CheckCircle,
    color: "bg-green-100 text-green-800 border-green-200",
    iconColor: "text-green-600",
  },
  CANCELLED: {
    label: "Cancelled",
    icon: XCircle,
    color: "bg-red-100 text-red-800 border-red-200",
    iconColor: "text-red-600",
  },
};

export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated, loading: userLoading } = useUserStore();
  const { orders, loading, fetchMyOrders } = useOrderStore();

  console.log("authenticated", isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      fetchMyOrders();
    } else {
      router.replace("/login");
    }
  }, [isAuthenticated]);

  // Show loading while checking auth
  // if (userLoading) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <div className="w-12 h-12 border-4 border-[#2d5016] border-t-transparent rounded-full animate-spin" />
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-[#fafaf6] to-white py-8">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            My Orders
          </h1>
          <p className="text-gray-600">
            Track, manage, and view your order history
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-6 bg-gray-200 rounded w-1/4 mb-4" />
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && orders.length === 0 && (
          <Card className="border-2 border-dashed">
            <CardContent className="p-12 text-center">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
                <Package className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                No Orders Yet
              </h3>
              <p className="text-gray-600 mb-6">
                Start shopping to see your orders here
              </p>
              <Button
                onClick={() => router.push("/shop")}
                className="bg-gradient-to-r from-[#2d5016] to-[#3d6820]"
              >
                Start Shopping
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
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
      <Card className="overflow-hidden hover:shadow-xl transition-shadow duration-300 border-2 border-gray-100">
        <CardContent className="p-0">
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-50 to-white p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              {/* Order Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-gray-900">
                    Order #{order._id.slice(-8).toUpperCase()}
                  </h3>
                  <Badge className={cn("border", statusConfig.color)}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {statusConfig.label}
                  </Badge>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(order.createdAt)}</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Package className="w-4 h-4" />
                    <span>{order.items.length} item(s)</span>
                  </div>
                </div>
              </div>

              {/* Total Amount */}
              <div className="text-left md:text-right">
                <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                <p className="text-2xl font-bold text-[#2d5016]">
                  ₹{order.totalAmount}
                </p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="p-6">
            <div className="space-y-3">
              {order.items.slice(0, 3).map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {/* Product Image */}
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-8 h-8 text-gray-300" />
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">
                      {item.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {item.variantSetSize &&
                        `${item.variantSetSize} pieces • `}
                      Qty: {item.quantity}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-gray-900">
                      ₹{item.totalPrice}
                    </p>
                  </div>
                </div>
              ))}

              {/* More Items Indicator */}
              {order.items.length > 3 && (
                <div className="text-center py-2 text-sm text-gray-500">
                  +{order.items.length - 3} more item(s)
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={() => router.push(`/orders/${order._id}`)}
              className="flex-1 border-[#2d5016] text-[#2d5016] hover:bg-[#2d5016] hover:text-white"
            >
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </Button>

            {order.invoiceUrl && (
              <Button
                variant="outline"
                onClick={() => window.open(order.invoiceUrl, "_blank")}
                className="flex-1"
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
