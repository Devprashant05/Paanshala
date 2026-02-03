"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  Search,
  Filter,
  X,
  Package,
  CreditCard,
  Truck,
  CheckCircle,
  XCircle,
  FileText,
  User,
  Calendar,
  MapPin,
  Loader2,
  Eye,
} from "lucide-react";

import { useOrderStore } from "@/stores/useOrderStore";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

/* ===========================
   STATUS CONFIG
=========================== */
const STATUS_CONFIG = {
  PAID: {
    label: "Paid",
    badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
    icon: CreditCard,
  },
  PROCESSING: {
    label: "Processing",
    badge: "bg-blue-100 text-blue-700 border-blue-200",
    icon: Package,
  },
  SHIPPED: {
    label: "Shipped",
    badge: "bg-purple-100 text-purple-700 border-purple-200",
    icon: Truck,
  },
  DELIVERED: {
    label: "Delivered",
    badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
    icon: CheckCircle,
  },
  CANCELLED: {
    label: "Cancelled",
    badge: "bg-red-100 text-red-700 border-red-200",
    icon: XCircle,
  },
};

const NEXT_STATUS_MAP = {
  PAID: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

/* ===========================
   HELPERS
=========================== */
function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status];
  if (!cfg) return <Badge variant="secondary">{status}</Badge>;
  const Icon = cfg.icon;
  return (
    <Badge className={cfg.badge}>
      <Icon className="w-3 h-3 mr-1" />
      {cfg.label}
    </Badge>
  );
}

function formatDate(dateString) {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/* ===========================
   ADMIN ORDERS PAGE
=========================== */
export default function AdminOrdersPage() {
  const { orders, fetchOrders, updateOrderStatus, loading } = useOrderStore();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);

  /* ===========================
     INIT
  =========================== */
  useEffect(() => {
    fetchOrders();
  }, []);

  /* ===========================
     FILTERS
  =========================== */
  const filteredOrders = useMemo(() => {
    let data = orders;

    if (search) {
      data = data.filter(
        (o) =>
          o._id.includes(search) ||
          o.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
          o.user?.full_name?.toLowerCase().includes(search.toLowerCase()),
      );
    }

    if (statusFilter !== "all") {
      data = data.filter((o) => o.status === statusFilter);
    }

    return data;
  }, [orders, search, statusFilter]);

  /* ===========================
     STATS
  =========================== */
  const stats = {
    total: orders.length,
    paid: orders.filter((o) => o.status === "PAID").length,
    processing: orders.filter((o) => o.status === "PROCESSING").length,
    delivered: orders.filter((o) => o.status === "DELIVERED").length,
    cancelled: orders.filter((o) => o.status === "CANCELLED").length,
  };

  /* ===========================
     CLEAR FILTERS
  =========================== */
  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
  };

  const hasActiveFilters = search || statusFilter !== "all";

  /* ===========================
     STATUS CHANGE HANDLER
  =========================== */
  const handleStatusChange = async (orderId, newStatus) => {
    const ok = await updateOrderStatus(orderId, newStatus);
    if (ok) {
      fetchOrders();
      // Update the selected-order dialog in place if it's open for this order
      if (selectedOrder?._id === orderId) {
        setSelectedOrder((prev) =>
          prev ? { ...prev, status: newStatus } : prev,
        );
      }
    }
  };

  /* ===========================
     UI
  =========================== */
  return (
    <div className="space-y-8 max-w-450">
      {/* PAGE HEADER */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-4xl lg:text-5xl font-bold text-[#12351a] mb-2">
              Orders Management
            </h1>
            <p className="text-base text-gray-600">
              Track, manage, and update customer orders
            </p>
          </div>
        </div>
      </motion.div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-6">
        <StatCard
          title="Total Orders"
          value={stats.total}
          icon={ShoppingBag}
          color="blue"
          delay={0}
        />
        <StatCard
          title="Paid"
          value={stats.paid}
          icon={CreditCard}
          color="emerald"
          delay={0.1}
        />
        <StatCard
          title="Processing"
          value={stats.processing}
          icon={Package}
          color="purple"
          delay={0.2}
        />
        <StatCard
          title="Delivered"
          value={stats.delivered}
          icon={Truck}
          color="emerald"
          delay={0.3}
        />
        <StatCard
          title="Cancelled"
          value={stats.cancelled}
          icon={XCircle}
          color="amber"
          delay={0.4}
        />
      </div>

      {/* FILTERS */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border-gray-200 shadow-md">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search by Order ID, email, or name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 h-11"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-50 h-11">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    <SelectValue placeholder="Filter by status" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Orders</SelectItem>
                  <SelectItem value="PAID">Paid</SelectItem>
                  <SelectItem value="PROCESSING">Processing</SelectItem>
                  <SelectItem value="SHIPPED">Shipped</SelectItem>
                  <SelectItem value="DELIVERED">Delivered</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="h-11"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              )}
            </div>

            {/* Active Filters Display */}
            {hasActiveFilters && (
              <div className="mt-4 flex flex-wrap gap-2">
                {search && (
                  <Badge variant="secondary" className="px-3 py-1.5">
                    Search: {search}
                  </Badge>
                )}
                {statusFilter !== "all" && (
                  <Badge variant="secondary" className="px-3 py-1.5">
                    Status: {statusFilter}
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* ORDERS LIST */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="border-gray-200 shadow-lg">
          <CardHeader className="border-b border-gray-100 bg-gray-50/50">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#12351a]" />
              All Orders ({filteredOrders.length})
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-[#12351a]" />
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-16">
                <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No orders found
                </h3>
                <p className="text-sm text-gray-500">
                  {hasActiveFilters
                    ? "Try adjusting your filters"
                    : "Orders will appear here once customers place them"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AnimatePresence>
                  {filteredOrders.map((order, index) => (
                    <motion.div
                      key={order._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <OrderCard
                        order={order}
                        onView={() => setSelectedOrder(order)}
                        onStatusChange={(status) =>
                          handleStatusChange(order._id, status)
                        }
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* ORDER DETAILS DIALOG */}
      <Dialog
        open={!!selectedOrder}
        onOpenChange={() => setSelectedOrder(null)}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-blue-100 rounded-full">
                <ShoppingBag className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <DialogTitle className="text-2xl">Order Details</DialogTitle>
                <p className="text-sm text-gray-600 mt-0.5">
                  Review and manage this order
                </p>
              </div>
            </div>
          </DialogHeader>

          {selectedOrder && (
            <OrderDetailBody
              order={selectedOrder}
              onStatusChange={(status) =>
                handleStatusChange(selectedOrder._id, status)
              }
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ===========================
   ORDER CARD COMPONENT
=========================== */
function OrderCard({ order, onView, onStatusChange }) {
  const nextStatuses = NEXT_STATUS_MAP[order.status] || [];

  return (
    <Card className="border-gray-200 shadow-md hover:shadow-lg transition-all overflow-hidden group">
      <CardContent className="pt-5">
        {/* Top row: Order ID + Status badge */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md">
              #{order._id?.slice(-8)}
            </span>
          </div>
          <StatusBadge status={order.status} />
        </div>

        {/* Title: customer name */}
        <h3 className="text-lg font-bold text-gray-900 mb-1.5 line-clamp-1">
          {order.user?.full_name || "Unknown Customer"}
        </h3>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <User className="w-3 h-3" />
            {order.user?.email || "—"}
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(order.createdAt)}
          </div>
          <div className="flex items-center gap-1 font-semibold text-gray-700">
            ₹{order.totalAmount}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onView}
            className="flex-1"
          >
            <Eye className="w-3 h-3 mr-1.5" />
            View
          </Button>

          {nextStatuses.map((s) => {
            const NextIcon = STATUS_CONFIG[s]?.icon;
            return (
              <Button
                key={s}
                variant="outline"
                size="sm"
                onClick={() => onStatusChange(s)}
                className={cn(
                  "flex-1",
                  s === "CANCELLED" &&
                    "text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200",
                )}
              >
                {NextIcon && (
                  <NextIcon
                    className={cn(
                      "w-3 h-3 mr-1.5",
                      s === "CANCELLED" && "text-red-500",
                    )}
                  />
                )}
                {STATUS_CONFIG[s]?.label || s}
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

/* ===========================
   ORDER DETAIL BODY
=========================== */
function OrderDetailBody({ order, onStatusChange }) {
  const nextStatuses = NEXT_STATUS_MAP[order.status] || [];

  return (
    <div className="space-y-6 pt-2">
      {/* Order ID + Status header */}
      <div className="flex items-center justify-between flex-wrap gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
        <div>
          <p className="text-xs text-gray-500 mb-0.5">Order ID</p>
          <p className="font-mono text-sm font-semibold text-gray-800">
            {order._id}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={order.status} />
          <span className="text-xs text-gray-400">
            {formatDate(order.createdAt)}
          </span>
        </div>
      </div>

      {/* Customer info */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
          <User className="w-4 h-4 text-[#12351a]" />
          Customer
        </p>
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
          <p className="font-medium text-gray-900">
            {order.user?.full_name || "—"}
          </p>
          <p className="text-sm text-gray-500">{order.user?.email || "—"}</p>
        </div>
      </div>

      {/* Items list */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
          <Package className="w-4 h-4 text-[#12351a]" />
          Items Ordered
        </p>
        <div className="rounded-xl border border-gray-200 overflow-hidden">
          {order.items?.map((item, idx) => (
            <div
              key={idx}
              className={cn(
                "flex items-center justify-between px-4 py-3",
                idx !== 0 && "border-t border-gray-100",
              )}
            >
              <div className="flex items-center gap-3">
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-10 h-10 rounded-lg object-cover border border-gray-200"
                  />
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {item.name}
                  </p>
                  {item.variantSetSize && (
                    <p className="text-xs text-gray-500">
                      Size: {item.variantSetSize}
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">
                  ₹{item.totalPrice}
                </p>
                <p className="text-xs text-gray-500">
                  ×{item.quantity} @ ₹{item.price}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Totals summary */}
      <div className="p-4 bg-[#12351a]/5 rounded-xl border border-[#12351a]/10">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-1.5">
          <span>Subtotal</span>
          <span>₹{order.subtotal ?? "—"}</span>
        </div>
        {order.discount > 0 && (
          <div className="flex items-center justify-between text-sm text-emerald-600 mb-1.5">
            <span>Discount</span>
            <span>−₹{order.discount}</span>
          </div>
        )}
        <div className="border-t border-[#12351a]/15 mt-2 pt-2 flex items-center justify-between">
          <span className="text-base font-bold text-[#12351a]">Total</span>
          <span className="text-base font-bold text-[#12351a]">
            ₹{order.totalAmount}
          </span>
        </div>
      </div>

      {/* Addresses — only render if present */}
      {(order.shippingAddress || order.billingAddress) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {order.shippingAddress && (
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#12351a]" />
                Shipping Address
              </p>
              <AddressBlock address={order.shippingAddress} />
            </div>
          )}
          {order.billingAddress && (
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#12351a]" />
                Billing Address
              </p>
              <AddressBlock address={order.billingAddress} />
            </div>
          )}
        </div>
      )}

      {/* Invoice link */}
      {order.invoiceUrl && (
        <Button variant="outline" asChild className="w-full h-11">
          <a href={order.invoiceUrl} target="_blank" rel="noreferrer">
            <FileText className="w-4 h-4 mr-2" />
            Download Invoice
          </a>
        </Button>
      )}

      {/* Status transition buttons */}
      {nextStatuses.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2">
            Update Status
          </p>
          <div className="flex flex-wrap gap-2">
            {nextStatuses.map((s) => {
              const NextIcon = STATUS_CONFIG[s]?.icon;
              return (
                <Button
                  key={s}
                  size="sm"
                  onClick={() => onStatusChange(s)}
                  className={cn(
                    "flex-1 h-10",
                    s === "CANCELLED"
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-[#12351a] hover:bg-[#0f2916]",
                  )}
                >
                  {NextIcon && <NextIcon className="w-4 h-4 mr-2" />}
                  {STATUS_CONFIG[s]?.label || s}
                </Button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ===========================
   ADDRESS BLOCK (shared)
=========================== */
function AddressBlock({ address }) {
  if (!address) return null;
  const lines = [
    address.fullName || address.name,
    address.street || address.address,
    [address.city, address.state, address.pincode || address.zip]
      .filter(Boolean)
      .join(", "),
    address.country,
    address.phone && `Phone: ${address.phone}`,
  ].filter(Boolean);

  return (
    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
      {lines.map((line, i) => (
        <p
          key={i}
          className={cn(
            "text-sm text-gray-600",
            i === 0 && "font-medium text-gray-900",
          )}
        >
          {line}
        </p>
      ))}
    </div>
  );
}

/* ===========================
   STAT CARD COMPONENT
=========================== */
function StatCard({ title, value, icon: Icon, color, delay }) {
  const colorClasses = {
    blue: {
      iconBg: "bg-blue-100",
      icon: "text-blue-600",
      border: "border-blue-200",
    },
    emerald: {
      iconBg: "bg-emerald-100",
      icon: "text-emerald-600",
      border: "border-emerald-200",
    },
    amber: {
      iconBg: "bg-amber-100",
      icon: "text-amber-600",
      border: "border-amber-200",
    },
    purple: {
      iconBg: "bg-purple-100",
      icon: "text-purple-600",
      border: "border-purple-200",
    },
  };

  const colors = colorClasses[color];

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <Card
        className={cn(
          "border shadow-md hover:shadow-lg transition-all",
          colors.border,
        )}
      >
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className={cn("p-3 rounded-xl", colors.iconBg)}>
              <Icon className={cn("w-6 h-6", colors.icon)} />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-4xl font-bold text-gray-900">{value}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
