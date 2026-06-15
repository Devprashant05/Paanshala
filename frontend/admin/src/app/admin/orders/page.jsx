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
  Link2,
  Clock,
  ChefHat,
  Bike,
  Star,
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
   STATUS CONFIGS
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

const LOCAL_STATUS_CONFIG = {
  PENDING: {
    label: "Pending",
    badge: "bg-gray-100 text-gray-700 border-gray-200",
    icon: Clock,
  },
  CONFIRMED: {
    label: "Confirmed",
    badge: "bg-blue-100 text-blue-700 border-blue-200",
    icon: CheckCircle,
  },
  PREPARING: {
    label: "Preparing",
    badge: "bg-amber-100 text-amber-700 border-amber-200",
    icon: ChefHat,
  },
  READY: {
    label: "Ready",
    badge: "bg-purple-100 text-purple-700 border-purple-200",
    icon: Star,
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

const LOCAL_NEXT_STATUS_MAP = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PREPARING", "CANCELLED"],
  PREPARING: ["READY", "CANCELLED"],
  READY: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
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

function LocalStatusBadge({ status }) {
  const cfg = LOCAL_STATUS_CONFIG[status];
  if (!cfg) return null;
  const Icon = cfg.icon;
  return (
    <Badge className={cn(cfg.badge, "border")}>
      <Icon className="w-3 h-3 mr-1" />
      {cfg.label}
    </Badge>
  );
}

function FulfillmentBadge({ type }) {
  if (!type || type === "SHIPPED") return null;
  return (
    <Badge
      className={cn(
        "border text-xs",
        type === "LOCAL"
          ? "bg-orange-100 text-orange-700 border-orange-200"
          : "bg-sky-100 text-sky-700 border-sky-200",
      )}
    >
      <Clock className="w-3 h-3 mr-1" />
      {type === "LOCAL" ? "Local" : "Mixed"}
    </Badge>
  );
}

function formatDate(dateString) {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/* ===========================
   ADMIN ORDERS PAGE
=========================== */
export default function AdminOrdersPage() {
  const {
    orders,
    fetchOrders,
    localOrders,
    fetchLocalOrders,
    localOrdersLoading,
    updateOrderStatus,
    updateLocalOrderStatus,
    updateOrderAddress,
    loading,
  } = useOrderStore();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewTab, setViewTab] = useState("all"); // "all" | "local"
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [shippingModal, setShippingModal] = useState(false);
  const [shippingOrderId, setShippingOrderId] = useState(null);
  const [shippingForm, setShippingForm] = useState({
    courierName: "",
    trackingNumber: "",
    trackingUrl: "",
  });

  /* ── Init ── */
  useEffect(() => {
    fetchOrders();
    fetchLocalOrders();
  }, []);

  /* ── Active dataset based on tab ── */
  const activeOrders = viewTab === "local" ? localOrders : orders;
  const activeLoading = viewTab === "local" ? localOrdersLoading : loading;
  const [updatingStatus, setUpdatingStatus] = useState({});

  /* ── Filters ── */
  const filteredOrders = useMemo(() => {
    let data = activeOrders;
    if (search) {
      data = data.filter(
        (o) =>
          o._id.includes(search) ||
          o.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
          o.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
          o.user?.full_name?.toLowerCase().includes(search.toLowerCase()),
      );
    }
    if (statusFilter !== "all") {
      data = data.filter((o) =>
        viewTab === "local"
          ? o.localStatus === statusFilter
          : o.status === statusFilter,
      );
    }
    return data;
  }, [activeOrders, search, statusFilter, viewTab]);

  /* ── Stats ── */
  const stats = {
    total: orders.length,
    paid: orders.filter((o) => o.status === "PAID").length,
    processing: orders.filter((o) => o.status === "PROCESSING").length,
    delivered: orders.filter((o) => o.status === "DELIVERED").length,
    cancelled: orders.filter((o) => o.status === "CANCELLED").length,
    localPending: localOrders.filter((o) => o.localStatus === "PENDING").length,
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
  };
  const hasActiveFilters = search || statusFilter !== "all";

  /* ── Status change ── */
  const handleStatusChange = async (orderId, newStatus) => {
    if (newStatus === "SHIPPED") {
      setShippingOrderId(orderId);
      setShippingModal(true);
      return;
    }
    setUpdatingStatus((p) => ({ ...p, [orderId]: true }));
    const ok = await updateOrderStatus(orderId, { status: newStatus });
    setUpdatingStatus((p) => ({ ...p, [orderId]: false }));
    if (ok) {
      fetchOrders();
      fetchLocalOrders();
    }
  };

  const handleLocalStatusChange = async (orderId, newLocalStatus) => {
    setUpdatingStatus((p) => ({ ...p, [orderId]: true }));
    const ok = await updateLocalOrderStatus(orderId, newLocalStatus);
    setUpdatingStatus((p) => ({ ...p, [orderId]: false }));
    if (ok) fetchLocalOrders();
  };

 const handleShipOrder = async () => {
   setUpdatingStatus((p) => ({ ...p, [shippingOrderId]: true }));
   const ok = await updateOrderStatus(shippingOrderId, {
     status: "SHIPPED",
     courierName: shippingForm.courierName,
     trackingNumber: shippingForm.trackingNumber,
     trackingUrl: shippingForm.trackingUrl,
   });
   setUpdatingStatus((p) => ({ ...p, [shippingOrderId]: false }));
   if (ok) {
     fetchOrders();
     setShippingModal(false);
     setShippingForm({ courierName: "", trackingNumber: "", trackingUrl: "" });
     setShippingOrderId(null);
   }
 };

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

      {/* STATS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          title="Total"
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
          delay={0.05}
        />
        <StatCard
          title="Processing"
          value={stats.processing}
          icon={Package}
          color="purple"
          delay={0.1}
        />
        <StatCard
          title="Delivered"
          value={stats.delivered}
          icon={Truck}
          color="emerald"
          delay={0.15}
        />
        <StatCard
          title="Cancelled"
          value={stats.cancelled}
          icon={XCircle}
          color="amber"
          delay={0.2}
        />
        <StatCard
          title="Local Pending"
          value={stats.localPending}
          icon={Clock}
          color="orange"
          delay={0.25}
        />
      </div>

      {/* VIEW TABS */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex gap-2 p-1 bg-gray-100 rounded-xl w-fit">
          <button
            onClick={() => {
              setViewTab("all");
              setStatusFilter("all");
            }}
            className={cn(
              "px-5 py-2 rounded-lg text-sm font-semibold transition-all",
              viewTab === "all"
                ? "bg-white text-[#12351a] shadow-sm"
                : "text-gray-500 hover:text-gray-700",
            )}
          >
            All Orders ({orders.length})
          </button>
          <button
            onClick={() => {
              setViewTab("local");
              setStatusFilter("all");
            }}
            className={cn(
              "px-5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2",
              viewTab === "local"
                ? "bg-white text-orange-700 shadow-sm"
                : "text-gray-500 hover:text-gray-700",
            )}
          >
            <Clock className="w-4 h-4" />
            Local Fulfilment ({localOrders.length})
            {stats.localPending > 0 && (
              <span className="w-5 h-5 rounded-full bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center">
                {stats.localPending}
              </span>
            )}
          </button>
        </div>
      </motion.div>

      {/* FILTERS */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border-gray-200 shadow-md">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by Order ID, email, or name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 h-11"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-52 h-11">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    <SelectValue placeholder="Filter by status" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {viewTab === "local"
                    ? Object.entries(LOCAL_STATUS_CONFIG).map(([val, cfg]) => (
                        <SelectItem key={val} value={val}>
                          {cfg.label}
                        </SelectItem>
                      ))
                    : Object.entries(STATUS_CONFIG).map(([val, cfg]) => (
                        <SelectItem key={val} value={val}>
                          {cfg.label}
                        </SelectItem>
                      ))}
                </SelectContent>
              </Select>

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
              {viewTab === "local" ? (
                <>
                  <Clock className="w-5 h-5 text-orange-600" />
                  Local Fulfilment Orders ({filteredOrders.length})
                </>
              ) : (
                <>
                  <ShoppingBag className="w-5 h-5 text-[#12351a]" />
                  All Orders ({filteredOrders.length})
                </>
              )}
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6">
            {activeLoading ? (
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
                    : "Orders will appear here once placed"}
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
                      transition={{ delay: index * 0.04 }}
                    >
                      <OrderCard
                        order={order}
                        isLocalView={viewTab === "local"}
                        onView={() => setSelectedOrder(order)}
                        onStatusChange={(s) => handleStatusChange(order._id, s)}
                        onLocalStatusChange={(s) =>
                          handleLocalStatusChange(order._id, s)
                        }
                        isUpdating={!!updatingStatus[order._id]}
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
              setSelectedOrder={setSelectedOrder}
              onStatusChange={(s) => handleStatusChange(selectedOrder._id, s)}
              onLocalStatusChange={(s) =>
                handleLocalStatusChange(selectedOrder._id, s)
              }
              isUpdating={!!updatingStatus[selectedOrder._id]}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* SHIPPING MODAL */}
      <Dialog open={shippingModal} onOpenChange={setShippingModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Mark Order As Shipped</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Courier Name</label>
              <Input
                placeholder="Delhivery"
                value={shippingForm.courierName}
                onChange={(e) =>
                  setShippingForm((p) => ({
                    ...p,
                    courierName: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tracking Number</label>
              <Input
                placeholder="123456789"
                value={shippingForm.trackingNumber}
                onChange={(e) =>
                  setShippingForm((p) => ({
                    ...p,
                    trackingNumber: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Tracking URL (Optional)
              </label>
              <Input
                placeholder="https://..."
                value={shippingForm.trackingUrl}
                onChange={(e) =>
                  setShippingForm((p) => ({
                    ...p,
                    trackingUrl: e.target.value,
                  }))
                }
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShippingModal(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-[#12351a] hover:bg-[#0f2916]"
                onClick={handleShipOrder}
                disabled={!!updatingStatus[shippingOrderId]} // ← add
              >
                {updatingStatus[shippingOrderId] ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Truck className="w-4 h-4 mr-2" />
                )}
                Ship Order
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ===========================
   ORDER CARD
=========================== */
function OrderCard({
  order,
  isLocalView,
  onView,
  onStatusChange,
  onLocalStatusChange,
  isUpdating,
}) {
  const nextStatuses = NEXT_STATUS_MAP[order.status] || [];
  const nextLocalStatuses = LOCAL_NEXT_STATUS_MAP[order.localStatus] || [];

  return (
    <Card className="border-gray-200 shadow-md hover:shadow-lg transition-all overflow-hidden">
      <CardContent className="pt-5">
        {/* Top row */}
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md">
              {order.orderNumber || `#${order._id?.slice(-8)}`}
            </span>
            <FulfillmentBadge type={order.fulfillmentType} />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <StatusBadge status={order.status} />
            {order.localStatus && (
              <LocalStatusBadge status={order.localStatus} />
            )}
          </div>
        </div>

        {/* Customer name */}
        <h3 className="text-base font-bold text-gray-900 mb-1.5 line-clamp-1">
          {order.user?.full_name || "Unknown Customer"}
        </h3>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mb-3">
          <span className="flex items-center gap-1">
            <User className="w-3 h-3" />
            {order.user?.email || "—"}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(order.createdAt)}
          </span>
          <span className="font-semibold text-gray-700">
            ₹{order.totalAmount}
          </span>
        </div>

        {/* Scheduled info — show if local */}
        {order.scheduledDate && (
          <div className="flex items-center gap-2 text-xs text-orange-700 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2 mb-3">
            <Clock className="w-3.5 h-3.5 shrink-0" />
            <span>
              Scheduled: <strong>{order.scheduledDate}</strong> at{" "}
              <strong>{order.scheduledTime}</strong>
            </span>
          </div>
        )}

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

          {/* Shipping status buttons — only for non-LOCAL orders */}
          {order.fulfillmentType !== "LOCAL" &&
            nextStatuses.map((s) => {
              const Icon = STATUS_CONFIG[s]?.icon;
              return (
                <Button
                  key={s}
                  variant="outline"
                  size="sm"
                  onClick={() => onStatusChange(s)}
                  disabled={isUpdating} // ← add
                  className={cn(
                    "flex-1",
                    s === "CANCELLED" &&
                      "text-red-500 hover:bg-red-50 border-red-200",
                  )}
                >
                  {isUpdating ? (
                    <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                  ) : (
                    Icon && (
                      <Icon
                        className={cn(
                          "w-3 h-3 mr-1.5",
                          s === "CANCELLED" && "text-red-500",
                        )}
                      />
                    )
                  )}
                  {STATUS_CONFIG[s]?.label || s}
                </Button>
              );
            })}

          {/* Local status buttons */}
          {(order.fulfillmentType === "LOCAL" ||
            order.fulfillmentType === "MIXED") &&
            nextLocalStatuses.map((s) => {
              const Icon = LOCAL_STATUS_CONFIG[s]?.icon;
              return (
                <Button
                  key={s}
                  variant="outline"
                  size="sm"
                  onClick={() => onLocalStatusChange(s)}
                  disabled={isUpdating} // ← add
                  className={cn(
                    "flex-1",
                    s === "CANCELLED" &&
                      "text-red-500 hover:bg-red-50 border-red-200",
                  )}
                >
                  {isUpdating ? (
                    <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                  ) : (
                    Icon && (
                      <Icon
                        className={cn(
                          "w-3 h-3 mr-1.5",
                          s === "CANCELLED" && "text-red-500",
                        )}
                      />
                    )
                  )}
                  {LOCAL_STATUS_CONFIG[s]?.label || s}
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
function OrderDetailBody({
  order,
  onStatusChange,
  onLocalStatusChange,
  setSelectedOrder,
  isUpdating,
}) {
  const nextStatuses = NEXT_STATUS_MAP[order.status] || [];
  const nextLocalStatuses = LOCAL_NEXT_STATUS_MAP[order.localStatus] || [];

  const { updateOrderAddress } = useOrderStore();
  const [editingAddress, setEditingAddress] = useState(false);
  const [form, setForm] = useState({
    shippingAddress: order.shippingAddress || {},
    billingAddress: order.billingAddress || {},
  });

  return (
    <div className="space-y-6 pt-2">
      {/* Order ID + Status */}
      <div className="flex items-center justify-between flex-wrap gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
        <div>
          <p className="text-xs text-gray-500 mb-0.5">Order Number</p>
          <p className="font-mono text-sm font-semibold text-gray-800">
            {order.orderNumber || order._id}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <FulfillmentBadge type={order.fulfillmentType} />
          <StatusBadge status={order.status} />
          {order.localStatus && <LocalStatusBadge status={order.localStatus} />}
          <span className="text-xs text-gray-400">
            {formatDate(order.createdAt)}
          </span>
        </div>
      </div>

      {/* Scheduling info */}
      {order.scheduledDate && (
        <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl">
          <p className="text-sm font-semibold text-orange-800 flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4" />
            Scheduled Delivery
          </p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-orange-600 mb-0.5">Date</p>
              <p className="font-semibold text-orange-900">
                {order.scheduledDate}
              </p>
            </div>
            <div>
              <p className="text-xs text-orange-600 mb-0.5">Time</p>
              <p className="font-semibold text-orange-900">
                {order.scheduledTime}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Customer */}
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

      {/* Items */}
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
                  <div className="flex items-center gap-2 mt-0.5">
                    {item.variantSetSize && (
                      <p className="text-xs text-gray-500">
                        Size: {item.variantSetSize}
                      </p>
                    )}
                    {/* Fulfillment type per item */}
                    {item.fulfillmentType === "LOCAL" ? (
                      <span className="text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded font-medium">
                        Local
                      </span>
                    ) : (
                      <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-medium">
                        Ship
                      </span>
                    )}
                  </div>
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

      {/* Totals */}
      <div className="p-4 bg-[#12351a]/5 rounded-xl border border-[#12351a]/10 space-y-1.5">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Subtotal</span>
          <span>₹{order.subtotal ?? "—"}</span>
        </div>
        {order.discount > 0 && (
          <div className="flex justify-between text-sm text-emerald-600">
            <span>
              Discount {order.coupon?.code && `(${order.coupon.code})`}
            </span>
            <span>−₹{order.discount}</span>
          </div>
        )}
        {order.shippingCharges > 0 && (
          <div className="flex justify-between text-sm text-gray-600">
            <span>Shipping</span>
            <span>₹{order.shippingCharges}</span>
          </div>
        )}
        {order.codCharges > 0 && (
          <div className="flex justify-between text-sm text-gray-600">
            <span>COD Charges</span>
            <span>₹{order.codCharges}</span>
          </div>
        )}
        <div className="border-t border-[#12351a]/15 mt-2 pt-2 flex justify-between">
          <span className="text-base font-bold text-[#12351a]">Total</span>
          <span className="text-base font-bold text-[#12351a]">
            ₹{order.totalAmount}
          </span>
        </div>
      </div>

      {/* Shiprocket tracking */}
      {order.shiprocket?.trackingNumber && (
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <Truck className="w-4 h-4 text-[#12351a]" />
            Shipment Details
          </p>
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Courier</span>
              <span className="text-sm font-medium">
                {order.shiprocket.courierName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Tracking</span>
              <span className="text-sm font-medium">
                {order.shiprocket.trackingNumber}
              </span>
            </div>
            {order.shiprocket.trackingUrl && (
              <Button asChild variant="outline" size="sm" className="mt-2">
                <a
                  href={order.shiprocket.trackingUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Link2 className="w-4 h-4 mr-2" />
                  Track Shipment
                </a>
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Addresses */}
      {(order.shippingAddress || order.billingAddress) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {order.shippingAddress && (
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#12351a]" />
                Shipping Address
              </p>
              {editingAddress ? (
                <div className="space-y-3">
                  <Input
                    placeholder="Full Name"
                    value={form.shippingAddress.fullName || ""}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        shippingAddress: {
                          ...p.shippingAddress,
                          fullName: e.target.value,
                        },
                      }))
                    }
                  />
                  <Input
                    placeholder="Street Address"
                    value={form.shippingAddress.streetAddress || ""}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        shippingAddress: {
                          ...p.shippingAddress,
                          streetAddress: e.target.value,
                        },
                      }))
                    }
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="City"
                      value={form.shippingAddress.city || ""}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          shippingAddress: {
                            ...p.shippingAddress,
                            city: e.target.value,
                          },
                        }))
                      }
                    />
                    <Input
                      placeholder="Pincode"
                      value={form.shippingAddress.pincode || ""}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          shippingAddress: {
                            ...p.shippingAddress,
                            pincode: e.target.value,
                          },
                        }))
                      }
                    />
                  </div>
                  <Input
                    placeholder="Phone"
                    value={form.shippingAddress.phone || ""}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        shippingAddress: {
                          ...p.shippingAddress,
                          phone: e.target.value,
                        },
                      }))
                    }
                  />
                  <div className="flex gap-2 pt-1">
                    <Button
                      className="flex-1"
                      onClick={async () => {
                        const ok = await updateOrderAddress(order._id, {
                          shippingAddress: form.shippingAddress,
                        });
                        if (ok) {
                          setSelectedOrder(ok);
                          setForm({
                            shippingAddress: ok.shippingAddress || {},
                            billingAddress: ok.billingAddress || {},
                          });
                          setEditingAddress(false);
                        }
                      }}
                    >
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setEditingAddress(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <AddressBlock address={order.shippingAddress} />
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2"
                    onClick={() => setEditingAddress(true)}
                  >
                    Edit Address
                  </Button>
                </>
              )}
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

      {/* Invoice */}
      {order.invoiceUrl && (
        <Button variant="outline" asChild className="w-full h-11">
          <a href={order.invoiceUrl} target="_blank" rel="noreferrer">
            <FileText className="w-4 h-4 mr-2" />
            Download Invoice
          </a>
        </Button>
      )}

      {/* Shipping status transitions — not for LOCAL-only orders */}
      {order.fulfillmentType !== "LOCAL" && nextStatuses.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2">
            Update Shipping Status
          </p>
          <div className="flex flex-wrap gap-2">
            {nextStatuses.map((s) => {
              const Icon = STATUS_CONFIG[s]?.icon;
              return (
                <Button
                  key={s}
                  size="sm"
                  onClick={() => onStatusChange(s)}
                  disabled={isUpdating} // ← add
                  className={cn(
                    "flex-1 h-10",
                    s === "CANCELLED"
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-[#12351a] hover:bg-[#0f2916]",
                  )}
                >
                  {isUpdating ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    Icon && <Icon className="w-4 h-4 mr-2" />
                  )}
                  {STATUS_CONFIG[s]?.label || s}
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {/* Local status transitions */}
      {(order.fulfillmentType === "LOCAL" ||
        order.fulfillmentType === "MIXED") &&
        nextLocalStatuses.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-600" />
              Update Local Fulfilment Status
            </p>
            <div className="flex flex-wrap gap-2">
              {nextLocalStatuses.map((s) => {
                const Icon = LOCAL_STATUS_CONFIG[s]?.icon;
                return (
                  <Button
                    key={s}
                    size="sm"
                    onClick={() => onLocalStatusChange(s)}
                    disabled={isUpdating} // ← add
                    className={cn(
                      "flex-1 h-10",
                      s === "CANCELLED"
                        ? "bg-red-600 hover:bg-red-700"
                        : "bg-orange-600 hover:bg-orange-700",
                    )}
                  >
                    {isUpdating ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      Icon && <Icon className="w-4 h-4 mr-2" />
                    )}
                    {LOCAL_STATUS_CONFIG[s]?.label || s}
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
   ADDRESS BLOCK
=========================== */
function AddressBlock({ address }) {
  if (!address) return null;
  const lines = [
    address.fullName,
    address.streetAddress,
    address.landmark,
    [address.city, address.state, address.pincode].filter(Boolean).join(", "),
    address.phone && `Phone: ${address.phone}`,
    address.email,
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
   STAT CARD
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
    orange: {
      iconBg: "bg-orange-100",
      icon: "text-orange-600",
      border: "border-orange-200",
    },
  };
  const c = colorClasses[color];

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
          c.border,
        )}
      >
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className={cn("p-3 rounded-xl", c.iconBg)}>
              <Icon className={cn("w-6 h-6", c.icon)} />
            </div>
          </div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-4xl font-bold text-gray-900">{value}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}