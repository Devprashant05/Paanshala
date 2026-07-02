"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  Calendar,
  MapPin,
  Loader2,
  Link2,
  Clock,
  ChefHat,
  Star,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  MoreHorizontal,
  ArrowUpDown,
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

const PAGE_SIZE = 20;

/* ── Status configs ── */
const STATUS_CONFIG = {
  PAID: {
    label: "Paid",
    badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
    icon: CreditCard,
  },
  PROCESSING: {
    label: "Processing",
    badge: "bg-blue-100    text-blue-700    border-blue-200",
    dot: "bg-blue-500",
    icon: Package,
  },
  SHIPPED: {
    label: "Shipped",
    badge: "bg-purple-100  text-purple-700  border-purple-200",
    dot: "bg-purple-500",
    icon: Truck,
  },
  DELIVERED: {
    label: "Delivered",
    badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
    icon: CheckCircle,
  },
  CANCELLED: {
    label: "Cancelled",
    badge: "bg-red-100     text-red-700     border-red-200",
    dot: "bg-red-500",
    icon: XCircle,
  },
};

const LOCAL_STATUS_CONFIG = {
  PENDING: {
    label: "Pending",
    badge: "bg-gray-100   text-gray-700   border-gray-200",
    dot: "bg-gray-400",
    icon: Clock,
  },
  CONFIRMED: {
    label: "Confirmed",
    badge: "bg-blue-100   text-blue-700   border-blue-200",
    dot: "bg-blue-500",
    icon: CheckCircle,
  },
  PREPARING: {
    label: "Preparing",
    badge: "bg-amber-100  text-amber-700  border-amber-200",
    dot: "bg-amber-500",
    icon: ChefHat,
  },
  READY: {
    label: "Ready",
    badge: "bg-purple-100 text-purple-700 border-purple-200",
    dot: "bg-purple-500",
    icon: Star,
  },
  DELIVERED: {
    label: "Delivered",
    badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
    icon: CheckCircle,
  },
  CANCELLED: {
    label: "Cancelled",
    badge: "bg-red-100    text-red-700    border-red-200",
    dot: "bg-red-500",
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
const LOCAL_NEXT_STATUS_MAP = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PREPARING", "CANCELLED"],
  PREPARING: ["READY", "CANCELLED"],
  READY: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

/* ── Helpers ── */
const fmt = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" }) : "—";
const fmtShort = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day:"numeric", month:"short" }) : "—";

function StatusDot({ status, config }) {
  const cfg = config[status];
  if (!cfg) return null;
  return (
    <span className="flex items-center gap-1.5">
      <span className={cn("w-2 h-2 rounded-full shrink-0", cfg.dot)} />
      <span className="text-xs font-medium">{cfg.label}</span>
    </span>
  );
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status];
  if (!cfg)
    return (
      <Badge variant="secondary" className="text-xs">
        {status}
      </Badge>
    );
  return <Badge className={cn(cfg.badge, "border text-xs")}>{cfg.label}</Badge>;
}

function LocalStatusBadge({ status }) {
  const cfg = LOCAL_STATUS_CONFIG[status];
  if (!cfg) return null;
  return <Badge className={cn(cfg.badge, "border text-xs")}>{cfg.label}</Badge>;
}

function AddressBlock({ address }) {
  if (!address) return <p className="text-xs text-gray-400">No address</p>;
  return (
    <div className="space-y-0.5 text-xs text-gray-600">
      {address.fullName && (
        <p className="font-semibold text-gray-900">{address.fullName}</p>
      )}
      {address.streetAddress && <p>{address.streetAddress}</p>}
      {address.landmark && (
        <p className="text-gray-400 italic">{address.landmark}</p>
      )}
      {(address.city || address.state || address.pincode) && (
        <p>
          {[address.city, address.state, address.pincode]
            .filter(Boolean)
            .join(", ")}
        </p>
      )}
      {address.phone && <p className="font-medium">📞 {address.phone}</p>}
    </div>
  );
}

/* ── Pagination ── */
function Pagination({ page, total, pageSize, onChange }) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;
  const start = (page - 1) * pageSize + 1;
  const end   = Math.min(page * pageSize, total);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
      <p className="text-xs text-gray-500">
        Showing{" "}
        <span className="font-semibold">
          {start}–{end}
        </span>{" "}
        of <span className="font-semibold">{total}</span> orders
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(1)}
          disabled={page === 1}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronsLeft className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onChange(page - 1)}
          disabled={page === 1}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        {/* Page numbers — show window of 5 */}
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
          .reduce((acc, p, i, arr) => {
            if (i > 0 && p - arr[i - 1] > 1) acc.push("...");
            acc.push(p);
            return acc;
          }, [])
          .map((p, i) =>
            p === "..." ? (
              <span
                key={`dots-${i}`}
                className="w-8 h-8 flex items-center justify-center text-xs text-gray-400"
              >
                …
              </span>
            ) : (
              <button
                key={p}
                onClick={() => onChange(p)}
                className={cn(
                  "w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold transition-colors",
                  page === p
                    ? "bg-[#12351a] text-white"
                    : "border border-gray-200 hover:bg-gray-50 text-gray-600",
                )}
              >
                {p}
              </button>
            ),
          )}

        <button
          onClick={() => onChange(page + 1)}
          disabled={page === totalPages}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onChange(totalPages)}
          disabled={page === totalPages}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronsRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

/* ── Order detail drawer (slides in from right) ── */
function OrderDetailDrawer({ order, open, onClose, onStatusChange, onLocalStatusChange, onEditAddress, isUpdating }) {
  if (!order) return null;

  const nextStatuses = NEXT_STATUS_MAP[order.status] || [];
  const nextLocalStatuses = LOCAL_NEXT_STATUS_MAP[order.localStatus] || [];

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black/30 z-40 transition-opacity duration-200",
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none",
        )}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={cn(
          "fixed right-0 top-0 h-full w-full sm:w-120 bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-[#12351a] shrink-0">
          <div>
            <p className="text-xs text-green-300 font-medium">Order Details</p>
            <p className="text-base font-bold text-white mt-0.5">
              {order.orderNumber || `#${order._id?.slice(-8)}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-5 space-y-5">
            {/* Status row */}
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge status={order.status} />
              {order.localStatus && order.fulfillmentType !== "SHIPPED" && (
                <LocalStatusBadge status={order.localStatus} />
              )}
              {order.fulfillmentType && order.fulfillmentType !== "SHIPPED" && (
                <Badge
                  className={cn(
                    "border text-xs",
                    order.fulfillmentType === "LOCAL"
                      ? "bg-orange-100 text-orange-700 border-orange-200"
                      : "bg-sky-100 text-sky-700 border-sky-200",
                  )}
                >
                  {order.fulfillmentType === "LOCAL" ? "Local" : "Mixed"}
                </Badge>
              )}
            </div>

            {/* Customer */}
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Customer
              </p>
              <p className="text-sm font-bold text-gray-900">
                {order.user?.full_name || "Unknown"}
              </p>
              <p className="text-xs text-gray-500">
                {order.user?.email || "—"}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Reward points: {order.user?.rewardPoints ?? 0}
              </p>
            </div>

            {/* Scheduled delivery */}
            {order.scheduledDate && (
              <div className="flex items-center gap-2 text-xs text-orange-700 bg-orange-50 border border-orange-200 rounded-xl px-3 py-2.5">
                <Clock className="w-3.5 h-3.5 shrink-0" />
                <span>
                  Scheduled: <strong>{order.scheduledDate}</strong> at{" "}
                  <strong>{order.scheduledTime}</strong>
                </span>
              </div>
            )}

            {/* Items */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Items
              </p>
              <div className="space-y-2">
                {order.items?.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-xl border border-gray-100"
                  >
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-10 h-10 rounded-lg object-cover border border-gray-200 shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center shrink-0">
                        <Package className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <p className="text-xs font-semibold text-gray-800 truncate">
                          {item.name}
                        </p>
                        <span
                          className={cn(
                            "text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0",
                            item.fulfillmentType === "LOCAL"
                              ? "bg-orange-100 text-orange-700"
                              : "bg-blue-100 text-blue-700",
                          )}
                        >
                          {item.fulfillmentType === "LOCAL" ? "Local" : "Ship"}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-500">
                        ×{item.quantity}
                        {item.variantSetSize
                          ? ` · Set of ${item.variantSetSize}`
                          : ""}{" "}
                        · ₹{item.price} each
                      </p>
                    </div>
                    <p className="text-sm font-bold text-gray-700 shrink-0">
                      ₹{item.totalPrice}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Order totals */}
            <div className="p-3 bg-[#12351a]/5 rounded-xl border border-[#12351a]/10 space-y-1.5">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Subtotal</span>
                <span>₹{order.subtotal}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-xs text-emerald-600">
                  <span>
                    Discount {order.coupon?.code && `(${order.coupon.code})`}
                  </span>
                  <span>−₹{order.discount}</span>
                </div>
              )}
              {order.shippingCharges > 0 && (
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Shipping</span>
                  <span>₹{order.shippingCharges}</span>
                </div>
              )}
              {order.codCharges > 0 && (
                <div className="flex justify-between text-xs text-gray-500">
                  <span>COD Charges</span>
                  <span>₹{order.codCharges}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-[#12351a] pt-1.5 border-t border-[#12351a]/10">
                <span>Total</span>
                <span>₹{order.totalAmount}</span>
              </div>
            </div>

            {/* Payment */}
            <div className="flex items-center gap-3 text-xs p-3 bg-gray-50 rounded-xl border border-gray-200">
              <CreditCard className="w-4 h-4 text-gray-400 shrink-0" />
              <span className="text-gray-600">
                {order.paymentMethod === "COD"
                  ? "Cash on Delivery"
                  : "Online Payment"}
              </span>
              <span
                className={cn(
                  "ml-auto font-semibold",
                  order.payment?.status === "PAID"
                    ? "text-emerald-600"
                    : "text-amber-600",
                )}
              >
                {order.payment?.status}
              </span>
            </div>

            {/* Tracking */}
            {order.shiprocket?.trackingNumber && (
              <div className="p-3 bg-purple-50 border border-purple-100 rounded-xl space-y-2">
                <p className="text-xs font-semibold text-purple-800 flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5" /> Shipment
                </p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">
                    {order.shiprocket.courierName}
                  </span>
                  <span className="font-mono text-gray-700">
                    {order.shiprocket.trackingNumber}
                  </span>
                </div>
                {order.shiprocket.trackingUrl && (
                  <a
                    href={order.shiprocket.trackingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-purple-700 hover:text-purple-900 font-medium"
                  >
                    <Link2 className="w-3 h-3" /> Track shipment
                  </a>
                )}
              </div>
            )}

            {/* Addresses */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                  <Truck className="w-3 h-3" /> Shipping
                </p>
                <div className="p-3 bg-white rounded-xl border border-gray-200">
                  <AddressBlock address={order.shippingAddress} />
                </div>
                <button
                  onClick={() => {
                    onEditAddress(order);
                    onClose();
                  }}
                  className="mt-1.5 text-xs text-[#12351a] hover:underline font-medium"
                >
                  Edit address →
                </button>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Billing
                </p>
                <div className="p-3 bg-white rounded-xl border border-gray-200">
                  <AddressBlock address={order.billingAddress} />
                </div>
              </div>
            </div>

            {/* Invoice */}
            {order.invoiceUrl && (
              <a
                href={order.invoiceUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg px-3 py-2 hover:border-gray-400 transition-colors"
              >
                <FileText className="w-3.5 h-3.5" /> Download Invoice
              </a>
            )}
          </div>
        </div>

        {/* Sticky action footer */}
        <div className="border-t border-gray-100 px-5 py-4 bg-gray-50 space-y-3 shrink-0">
          {/* Shipping status actions */}
          {order.fulfillmentType !== "LOCAL" && nextStatuses.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 mb-2 font-medium">
                Update shipping status
              </p>
              <div className="flex gap-2">
                {nextStatuses.map((s) => {
                  const Icon = STATUS_CONFIG[s]?.icon;
                  return (
                    <Button
                      key={s}
                      size="sm"
                      onClick={() => onStatusChange(s)}
                      disabled={isUpdating}
                      className={cn(
                        "flex-1 h-8 text-xs",
                        s === "CANCELLED"
                          ? "bg-red-600 hover:bg-red-700"
                          : "bg-[#12351a] hover:bg-[#0f2916]",
                      )}
                    >
                      {isUpdating ? (
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      ) : (
                        Icon && <Icon className="w-3 h-3 mr-1" />
                      )}
                      {STATUS_CONFIG[s]?.label || s}
                    </Button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Local status actions */}
          {(order.fulfillmentType === "LOCAL" ||
            order.fulfillmentType === "MIXED") &&
            nextLocalStatuses.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-2 font-medium flex items-center gap-1">
                  <Clock className="w-3 h-3 text-orange-500" /> Update local
                  fulfilment
                </p>
                <div className="flex gap-2">
                  {nextLocalStatuses.map((s) => {
                    const Icon = LOCAL_STATUS_CONFIG[s]?.icon;
                    return (
                      <Button
                        key={s}
                        size="sm"
                        onClick={() => onLocalStatusChange(s)}
                        disabled={isUpdating}
                        className={cn(
                          "flex-1 h-8 text-xs",
                          s === "CANCELLED"
                            ? "bg-red-600 hover:bg-red-700"
                            : "bg-orange-600 hover:bg-orange-700",
                        )}
                      >
                        {isUpdating ? (
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        ) : (
                          Icon && <Icon className="w-3 h-3 mr-1" />
                        )}
                        {LOCAL_STATUS_CONFIG[s]?.label || s}
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}
        </div>
      </div>
    </>
  );
}

/* ── Address edit dialog ── */
function AddressEditDialog({ order, open, onClose, onSaved }) {
  const { updateOrderAddress } = useOrderStore();
  const [form, setForm] = useState({
    shippingAddress: order?.shippingAddress || {},
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (order) setForm({ shippingAddress: order.shippingAddress || {} });
  }, [order]);

  const handleSave = async () => {
    setSaving(true);
    const ok = await updateOrderAddress(order._id, { shippingAddress: form.shippingAddress });
    setSaving(false);
    if (ok) {
      onSaved(ok);
      onClose();
    }
  };

  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Shipping Address</DialogTitle>
          <p className="text-sm text-gray-500">Order {order.orderNumber}</p>
        </DialogHeader>
        <div className="space-y-3 pt-2">
          {[
            { key: "fullName", label: "Full Name" },
            { key: "streetAddress", label: "Street Address" },
            { key: "landmark", label: "Landmark" },
            { key: "city", label: "City" },
            { key: "state", label: "State" },
            { key: "pincode", label: "Pincode" },
            { key: "phone", label: "Phone" },
            { key: "email", label: "Email" },
          ].map(({ key, label }) => (
            <div key={key} className="space-y-1">
              <label className="text-xs font-medium text-gray-600">
                {label}
              </label>
              <Input
                value={form.shippingAddress[key] || ""}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    shippingAddress: {
                      ...p.shippingAddress,
                      [key]: e.target.value,
                    },
                  }))
                }
                className="h-9"
              />
            </div>
          ))}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-[#12351a] hover:bg-[#0f2916]"
              onClick={handleSave}
              disabled={saving}
            >
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ── Stat card ── */
function StatCard({ title, value, icon: Icon, color, delay }) {
  const c = {
    blue:    { iconBg: "bg-blue-100",    icon: "text-blue-600",    border: "border-blue-200"    },
    emerald: { iconBg: "bg-emerald-100", icon: "text-emerald-600", border: "border-emerald-200" },
    amber:   { iconBg: "bg-amber-100",   icon: "text-amber-600",   border: "border-amber-200"   },
    purple:  { iconBg: "bg-purple-100",  icon: "text-purple-600",  border: "border-purple-200"  },
    orange:  { iconBg: "bg-orange-100",  icon: "text-orange-600",  border: "border-orange-200"  },
  }[color];

  return (
    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
      transition={{ delay, duration: 0.5 }} whileHover={{ y: -4, transition: { duration: 0.2 } }}>
      <Card className={cn("border shadow-md hover:shadow-lg transition-all", c.border)}>
        <CardContent className="pt-6">
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3", c.iconBg)}>
            <Icon className={cn("w-5 h-5", c.icon)} />
          </div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ══════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════ */
export default function AdminOrdersPage() {
  const {
    orders,
    fetchOrders,
    localOrders,
    fetchLocalOrders,
    localOrdersLoading,
    updateOrderStatus,
    updateLocalOrderStatus,
    loading,
  } = useOrderStore();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewTab, setViewTab] = useState("all");
  const [page, setPage] = useState(1);
  const [sortCol, setSortCol] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");
  const [updatingStatus, setUpdatingStatus] = useState({});

  // Drawer
  const [drawerOrder, setDrawerOrder] = useState(null);

  // Shipping modal
  const [shippingModal, setShippingModal] = useState(false);
  const [shippingOrderId, setShippingOrderId] = useState(null);
  const [shippingForm, setShippingForm] = useState({
    courierName: "",
    trackingNumber: "",
    trackingUrl: "",
  });

  // Address edit
  const [addressOrder, setAddressOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
    fetchLocalOrders();
  }, []);

  const activeOrders = viewTab === "local" ? localOrders : orders;
  const activeLoading = viewTab === "local" ? localOrdersLoading : loading;

  /* ── filter + sort ── */
  const filteredOrders = useMemo(() => {
    let data = activeOrders;

    if (search) {
      const q = search.toLowerCase();
      data = data.filter(
        (o) =>
          o._id.toLowerCase().includes(q) ||
          o.orderNumber?.toLowerCase().includes(q) ||
          o.user?.email?.toLowerCase().includes(q) ||
          o.user?.full_name?.toLowerCase().includes(q),
      );
    }

    if (statusFilter !== "all") {
      data = data.filter((o) =>
        viewTab === "local"
          ? o.localStatus === statusFilter
          : o.status === statusFilter,
      );
    }

    // sort
    data = [...data].sort((a, b) => {
      let av = a[sortCol],
        bv = b[sortCol];
      if (sortCol === "totalAmount") {
        av = Number(av);
        bv = Number(bv);
      }
      if (sortCol === "createdAt") {
        av = new Date(av);
        bv = new Date(bv);
      }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return data;
  }, [activeOrders, search, statusFilter, viewTab, sortCol, sortDir]);

  /* ── paginate ── */
  const paginatedOrders = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredOrders.slice(start, start + PAGE_SIZE);
  }, [filteredOrders, page]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, viewTab]);

  const stats = {
    total: orders.length,
    paid: orders.filter((o) => o.status === "PAID").length,
    processing: orders.filter((o) => o.status === "PROCESSING").length,
    delivered: orders.filter((o) => o.status === "DELIVERED").length,
    cancelled: orders.filter((o) => o.status === "CANCELLED").length,
    localPending: localOrders.filter((o) => o.localStatus === "PENDING").length,
  };

  const toggleSort = (col) => {
    if (sortCol === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortCol(col);
      setSortDir("desc");
    }
  };

  const SortBtn = ({ col, label }) => (
    <button
      onClick={() => toggleSort(col)}
      className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors group"
    >
      {label}
      <ArrowUpDown
        className={cn(
          "w-3 h-3 transition-colors",
          sortCol === col
            ? "text-[#12351a]"
            : "text-gray-300 group-hover:text-gray-500",
        )}
      />
    </button>
  );

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
    // refresh drawer order
    if (drawerOrder?._id === orderId) {
      setDrawerOrder((prev) => (prev ? { ...prev, status: newStatus } : prev));
    }
  };

  const handleLocalStatusChange = async (orderId, newLocalStatus) => {
    setUpdatingStatus((p) => ({ ...p, [orderId]: true }));
    const ok = await updateLocalOrderStatus(orderId, newLocalStatus);
    setUpdatingStatus((p) => ({ ...p, [orderId]: false }));
    if (ok) {
      fetchLocalOrders();
    }
    if (drawerOrder?._id === orderId) {
      setDrawerOrder((prev) =>
        prev ? { ...prev, localStatus: newLocalStatus } : prev,
      );
    }
  };

  const handleShipOrder = async () => {
    setUpdatingStatus((p) => ({ ...p, [shippingOrderId]: true }));
    const ok = await updateOrderStatus(shippingOrderId, {
      status: "SHIPPED",
      ...shippingForm,
    });
    setUpdatingStatus((p) => ({ ...p, [shippingOrderId]: false }));
    if (ok) {
      fetchOrders();
      setShippingModal(false);
      setShippingForm({ courierName: "", trackingNumber: "", trackingUrl: "" });
      setShippingOrderId(null);
    }
  };

  const hasActiveFilters = search || statusFilter !== "all";

  /* ── Table column headers ── */
  const thCls =
    "px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap";

  return (
    <div className="space-y-6 max-w-350">
      {/* Header */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <h1 className="text-4xl lg:text-5xl font-bold text-[#12351a] mb-1">
          Orders
        </h1>
        <p className="text-base text-gray-500">
          Track, manage and fulfil customer orders
        </p>
      </motion.div>

      {/* Stats */}
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

      {/* View tabs + filters */}
      <Card className="border-gray-200 shadow-md">
        <CardContent className="pt-5 pb-4">
          {/* Tabs */}
          <div className="flex gap-2 p-1 bg-gray-100 rounded-xl w-fit mb-4">
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
              Local ({localOrders.length})
              {stats.localPending > 0 && (
                <span className="w-5 h-5 rounded-full bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {stats.localPending}
                </span>
              )}
            </button>
          </div>

          {/* Search + filter row */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search order, email, name…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48 h-10">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <SelectValue placeholder="Status" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {(viewTab === "local"
                  ? Object.entries(LOCAL_STATUS_CONFIG)
                  : Object.entries(STATUS_CONFIG)
                ).map(([val, cfg]) => (
                  <SelectItem key={val} value={val}>
                    {cfg.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("all");
                }}
                className="h-10 shrink-0"
              >
                <X className="w-4 h-4 mr-1" /> Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-gray-200 shadow-lg overflow-hidden">
        <CardHeader className="border-b border-gray-100 bg-gray-50/50 py-3 px-6">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              {viewTab === "local" ? (
                <>
                  <Clock className="w-4 h-4 text-orange-600" /> Local Fulfilment
                  ({filteredOrders.length})
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4 text-[#12351a]" /> All Orders
                  ({filteredOrders.length})
                </>
              )}
            </CardTitle>
            <p className="text-xs text-gray-400">Click a row to view details</p>
          </div>
        </CardHeader>

        {activeLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#12351a]" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag className="w-14 h-14 text-gray-200 mx-auto mb-4" />
            <p className="text-lg font-semibold text-gray-900 mb-1">
              No orders found
            </p>
            <p className="text-sm text-gray-400">
              {hasActiveFilters
                ? "Try adjusting your filters"
                : "Orders will appear here once placed"}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-200">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className={thCls}>
                      <SortBtn col="orderNumber" label="Order" />
                    </th>
                    <th className={thCls}>Customer</th>
                    <th className={thCls}>Items</th>
                    <th className={thCls}>
                      <SortBtn col="totalAmount" label="Amount" />
                    </th>
                    <th className={thCls}>Status</th>
                    {viewTab !== "all" && (
                      <th className={thCls}>Local Status</th>
                    )}
                    <th className={thCls}>
                      <SortBtn col="createdAt" label="Date" />
                    </th>
                    <th className={cn(thCls, "text-right")}>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <AnimatePresence mode="popLayout">
                    {paginatedOrders.map((order, idx) => {
                      const nextStatuses = NEXT_STATUS_MAP[order.status] || [];
                      const nextLocalStatuses =
                        LOCAL_NEXT_STATUS_MAP[order.localStatus] || [];
                      const isUpdating = !!updatingStatus[order._id];
                      const isSelected = drawerOrder?._id === order._id;

                      return (
                        <motion.tr
                          key={order._id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ delay: idx * 0.02 }}
                          onClick={() => setDrawerOrder(order)}
                          className={cn(
                            "cursor-pointer transition-colors group",
                            isSelected
                              ? "bg-[#12351a]/5"
                              : "hover:bg-gray-50/80",
                          )}
                        >
                          {/* Order # */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {isSelected && (
                                <div className="w-1 h-5 bg-[#12351a] rounded-full shrink-0" />
                              )}
                              <div>
                                <p className="text-xs font-mono font-bold text-gray-800">
                                  {order.orderNumber ||
                                    `#${order._id?.slice(-8)}`}
                                </p>
                                {order.fulfillmentType &&
                                  order.fulfillmentType !== "SHIPPED" && (
                                    <span
                                      className={cn(
                                        "text-[10px] font-medium px-1.5 py-0.5 rounded",
                                        order.fulfillmentType === "LOCAL"
                                          ? "bg-orange-100 text-orange-700"
                                          : "bg-sky-100 text-sky-700",
                                      )}
                                    >
                                      {order.fulfillmentType === "LOCAL"
                                        ? "Local"
                                        : "Mixed"}
                                    </span>
                                  )}
                              </div>
                            </div>
                          </td>

                          {/* Customer */}
                          <td className="px-4 py-3">
                            <p className="text-xs font-semibold text-gray-900 truncate max-w-35">
                              {order.user?.full_name || "Unknown"}
                            </p>
                            <p className="text-[10px] text-gray-400 truncate max-w-35">
                              {order.user?.email || "—"}
                            </p>
                          </td>

                          {/* Items */}
                          <td className="px-4 py-3">
                            <p className="text-xs text-gray-700">
                              {order.items?.length || 0} item
                              {order.items?.length !== 1 ? "s" : ""}
                            </p>
                            {order.scheduledDate && (
                              <p className="text-[10px] text-orange-600 flex items-center gap-0.5 mt-0.5">
                                <Clock className="w-2.5 h-2.5" />
                                {order.scheduledDate}
                              </p>
                            )}
                          </td>

                          {/* Amount */}
                          <td className="px-4 py-3">
                            <p className="text-sm font-bold text-[#12351a]">
                              ₹{order.totalAmount}
                            </p>
                            <p className="text-[10px] text-gray-400">
                              {order.paymentMethod === "COD" ? "COD" : "Online"}
                            </p>
                          </td>

                          {/* Status */}
                          <td className="px-4 py-3">
                            <StatusBadge status={order.status} />
                          </td>

                          {/* Local status (only on local tab) */}
                          {viewTab !== "all" && (
                            <td className="px-4 py-3">
                              {order.localStatus ? (
                                <LocalStatusBadge status={order.localStatus} />
                              ) : (
                                <span className="text-xs text-gray-300">—</span>
                              )}
                            </td>
                          )}

                          {/* Date */}
                          <td className="px-4 py-3">
                            <p className="text-xs text-gray-600">
                              {fmtShort(order.createdAt)}
                            </p>
                          </td>

                          {/* Quick actions */}
                          <td
                            className="px-4 py-3"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Quick status buttons */}
                              {nextStatuses.slice(0, 1).map((s) => (
                                <Button
                                  key={s}
                                  size="sm"
                                  onClick={() =>
                                    handleStatusChange(order._id, s)
                                  }
                                  disabled={isUpdating}
                                  className={cn(
                                    "h-7 text-[10px] px-2 hidden lg:flex",
                                    s === "CANCELLED"
                                      ? "bg-red-600 hover:bg-red-700"
                                      : "bg-[#12351a] hover:bg-[#0f2916]",
                                  )}
                                >
                                  {isUpdating ? (
                                    <Loader2 className="w-2.5 h-2.5 animate-spin" />
                                  ) : (
                                    STATUS_CONFIG[s]?.label
                                  )}
                                </Button>
                              ))}

                              {/* Details button */}
                              <button
                                onClick={() => setDrawerOrder(order)}
                                className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            <Pagination
              page={page}
              total={filteredOrders.length}
              pageSize={PAGE_SIZE}
              onChange={setPage}
            />
          </>
        )}
      </Card>

      {/* Order detail drawer */}
      <OrderDetailDrawer
        order={drawerOrder}
        open={!!drawerOrder}
        onClose={() => setDrawerOrder(null)}
        onStatusChange={(s) => handleStatusChange(drawerOrder._id, s)}
        onLocalStatusChange={(s) => handleLocalStatusChange(drawerOrder._id, s)}
        onEditAddress={(o) => {
          setAddressOrder(o);
          setDrawerOrder(null);
        }}
        isUpdating={!!updatingStatus[drawerOrder?._id]}
      />

      {/* Shipping modal */}
      <Dialog open={shippingModal} onOpenChange={setShippingModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Mark Order as Shipped</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {[
              {
                key: "courierName",
                label: "Courier Name *",
                placeholder: "e.g. Delhivery",
              },
              {
                key: "trackingNumber",
                label: "Tracking Number *",
                placeholder: "123456789",
              },
              {
                key: "trackingUrl",
                label: "Tracking URL (optional)",
                placeholder: "https://…",
              },
            ].map(({ key, label, placeholder }) => (
              <div key={key} className="space-y-1.5">
                <label className="text-sm font-medium">{label}</label>
                <Input
                  placeholder={placeholder}
                  value={shippingForm[key]}
                  onChange={(e) =>
                    setShippingForm((p) => ({ ...p, [key]: e.target.value }))
                  }
                />
              </div>
            ))}
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
                disabled={
                  !!updatingStatus[shippingOrderId] ||
                  !shippingForm.courierName ||
                  !shippingForm.trackingNumber
                }
              >
                {updatingStatus[shippingOrderId] && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                <Truck className="w-4 h-4 mr-2" /> Ship Order
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Address edit */}
      <AddressEditDialog
        order={addressOrder}
        open={!!addressOrder}
        onClose={() => setAddressOrder(null)}
        onSaved={() => {
          fetchOrders();
          fetchLocalOrders();
        }}
      />
    </div>
  );
}