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
  User,
  Calendar,
  MapPin,
  Loader2,
  Link2,
  Clock,
  ChefHat,
  Star,
  ChevronDown,
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
    <Badge className={cn(cfg.badge, "border")}>
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
   ADDRESS BLOCK
=========================== */
function AddressBlock({ address }) {
  if (!address) return null;

  return (
    <div className="p-3 bg-white rounded-lg border border-gray-200 space-y-0.5">
      {address.fullName && (
        <p className="text-sm font-semibold text-gray-900">{address.fullName}</p>
      )}
      {address.companyName && (
        <p className="text-xs text-gray-500">{address.companyName}</p>
      )}
      {address.streetAddress && (
        <p className="text-xs text-gray-600">{address.streetAddress}</p>
      )}
      {address.landmark && (
        <p className="text-xs text-gray-500 italic">{address.landmark}</p>
      )}
      {(address.city || address.state || address.pincode) && (
        <p className="text-xs text-gray-600">
          {[address.city, address.state, address.pincode].filter(Boolean).join(", ")}
        </p>
      )}
      {address.phone && (
        <p className="text-xs text-gray-600 font-medium pt-0.5">📞 {address.phone}</p>
      )}
      {address.email && (
        <p className="text-xs text-gray-400 truncate">{address.email}</p>
      )}
    </div>
  );
}

/* ===========================
   STAT CARD
=========================== */
function StatCard({ title, value, icon: Icon, color, delay }) {
  const colorClasses = {
    blue: { iconBg: "bg-blue-100", icon: "text-blue-600", border: "border-blue-200" },
    emerald: { iconBg: "bg-emerald-100", icon: "text-emerald-600", border: "border-emerald-200" },
    amber: { iconBg: "bg-amber-100", icon: "text-amber-600", border: "border-amber-200" },
    purple: { iconBg: "bg-purple-100", icon: "text-purple-600", border: "border-purple-200" },
    orange: { iconBg: "bg-orange-100", icon: "text-orange-600", border: "border-orange-200" },
  };
  const c = colorClasses[color];

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <Card className={cn("border shadow-md hover:shadow-lg transition-all", c.border)}>
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

/* ===========================
   ORDER CARD — inline expand on hover
=========================== */
function OrderCard({
  order,
  isLocalView,
  onStatusChange,
  onLocalStatusChange,
  isUpdating,
  onEditAddress,
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hoverTimer = useRef(null);

  const nextStatuses = NEXT_STATUS_MAP[order.status] || [];
  const nextLocalStatuses = LOCAL_NEXT_STATUS_MAP[order.localStatus] || [];

  // Small delay so fast mouse-overs don't flicker
  const handleMouseEnter = () => {
    hoverTimer.current = setTimeout(() => setIsExpanded(true), 120);
  };
  const handleMouseLeave = () => {
    clearTimeout(hoverTimer.current);
    setIsExpanded(false);
  };

  // Preview: first 2 items
  const previewItems = order.items?.slice(0, 2) || [];
  const hiddenCount = (order.items?.length || 0) - previewItems.length;

  return (
    <motion.div layout onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <Card
        className={cn(
          "border-gray-200 shadow-md transition-shadow duration-200 overflow-hidden",
          isExpanded ? "shadow-xl border-[#12351a]/20" : "hover:shadow-lg",
        )}
      >
        <CardContent className="p-0">
          {/* ── ALWAYS VISIBLE HEADER ── */}
          <div className="p-4 pb-3">
            {/* Top row: order number + badges */}
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
                  {order.orderNumber || `#${order._id?.slice(-8)}`}
                </span>
                <FulfillmentBadge type={order.fulfillmentType} />
              </div>
              <div className="flex items-center gap-1.5 flex-wrap shrink-0">
                <StatusBadge status={order.status} />
                {order.localStatus && order.fulfillmentType !== "SHIPPED" && (
                  <LocalStatusBadge status={order.localStatus} />
                )}
              </div>
            </div>

            {/* Customer + date + amount */}
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-bold text-gray-900 leading-tight">
                  {order.user?.full_name || "Unknown Customer"}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{order.user?.email || "—"}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-base font-bold text-[#12351a]">₹{order.totalAmount}</p>
                <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1 justify-end">
                  <Calendar className="w-3 h-3" />
                  {formatDate(order.createdAt)}
                </p>
              </div>
            </div>

            {/* Scheduled delivery pill */}
            {order.scheduledDate && (
              <div className="flex items-center gap-2 text-xs text-orange-700 bg-orange-50 border border-orange-200 rounded-lg px-3 py-1.5 mb-3">
                <Clock className="w-3 h-3 shrink-0" />
                <span>
                  Scheduled: <strong>{order.scheduledDate}</strong> at{" "}
                  <strong>{order.scheduledTime}</strong>
                </span>
              </div>
            )}

            {/* Items preview — always visible */}
            <div className="space-y-1.5">
              {previewItems.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2.5 p-2 bg-gray-50 rounded-lg"
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-8 h-8 rounded object-cover border border-gray-200 shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded bg-gray-200 flex items-center justify-center shrink-0">
                      <Package className="w-4 h-4 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800 truncate">{item.name}</p>
                    <p className="text-[10px] text-gray-500">
                      ×{item.quantity}
                      {item.variantSetSize ? ` · Set of ${item.variantSetSize}` : ""}
                    </p>
                  </div>
                  <p className="text-xs font-semibold text-gray-700 shrink-0">₹{item.totalPrice}</p>
                </div>
              ))}

              {!isExpanded && hiddenCount > 0 && (
                <p className="text-xs text-gray-400 pl-2">
                  +{hiddenCount} more item{hiddenCount > 1 ? "s" : ""}
                </p>
              )}
            </div>
          </div>

          {/* ── EXPANDED DETAILS ── */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.22, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="border-t border-gray-100 px-4 pb-4 pt-3 space-y-4">

                  {/* Remaining items (if any hidden in preview) */}
                  {hiddenCount > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        All Items
                      </p>
                      {order.items?.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2.5 p-2 bg-gray-50 rounded-lg"
                        >
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-8 h-8 rounded object-cover border border-gray-200 shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded bg-gray-200 flex items-center justify-center shrink-0">
                              <Package className="w-4 h-4 text-gray-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="text-xs font-medium text-gray-800 truncate">{item.name}</p>
                              <span className={cn(
                                "text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0",
                                item.fulfillmentType === "LOCAL"
                                  ? "bg-orange-100 text-orange-700"
                                  : "bg-blue-100 text-blue-700"
                              )}>
                                {item.fulfillmentType === "LOCAL" ? "Local" : "Ship"}
                              </span>
                            </div>
                            <p className="text-[10px] text-gray-500">
                              ×{item.quantity}
                              {item.variantSetSize ? ` · Set of ${item.variantSetSize}` : ""}
                              {" · "}₹{item.price} each
                            </p>
                          </div>
                          <p className="text-xs font-semibold text-gray-700 shrink-0">₹{item.totalPrice}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Order totals */}
                  <div className="p-3 bg-[#12351a]/5 rounded-xl border border-[#12351a]/10 space-y-1">
                    {order.discount > 0 && (
                      <div className="flex justify-between text-xs text-emerald-600">
                        <span>Discount {order.coupon?.code && `(${order.coupon.code})`}</span>
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
                    <div className="flex justify-between text-sm font-bold text-[#12351a] pt-1 border-t border-[#12351a]/10">
                      <span>Total</span>
                      <span>₹{order.totalAmount}</span>
                    </div>
                  </div>

                  {/* Tracking info */}
                  {order.shiprocket?.trackingNumber && (
                    <div className="p-3 bg-purple-50 border border-purple-100 rounded-xl space-y-1.5">
                      <p className="text-xs font-semibold text-purple-800 flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5" />
                        Shipment
                      </p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">{order.shiprocket.courierName}</span>
                        <span className="font-mono text-gray-700">{order.shiprocket.trackingNumber}</span>
                      </div>
                      {order.shiprocket.trackingUrl && (
                        <a
                          href={order.shiprocket.trackingUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-purple-700 hover:text-purple-900 font-medium mt-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Link2 className="w-3 h-3" />
                          Track shipment
                        </a>
                      )}
                    </div>
                  )}

                  {/* Addresses */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                        <Truck className="w-3 h-3" /> Shipping
                      </p>
                      <AddressBlock address={order.shippingAddress} />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditAddress(order);
                        }}
                        className="mt-1.5 text-xs text-[#12351a] hover:underline font-medium"
                      >
                        Edit address
                      </button>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> Billing
                      </p>
                      <AddressBlock address={order.billingAddress} />
                    </div>
                  </div>

                  {/* Payment method */}
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <CreditCard className="w-3 h-3" />
                      {order.paymentMethod === "COD" ? "Cash on Delivery" : "Online Payment"}
                    </span>
                    <span className={cn(
                      "font-semibold",
                      order.payment?.status === "PAID" ? "text-emerald-600" : "text-amber-600"
                    )}>
                      {order.payment?.status}
                    </span>
                  </div>

                  {/* Invoice */}
                  {order.invoiceUrl && (
                    <a
                      href={order.invoiceUrl}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg px-3 py-1.5 hover:border-gray-400 transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      Download Invoice
                    </a>
                  )}

                  {/* ── Status action buttons ── */}
                  <div className="space-y-2 pt-1">
                    {/* Shipping status — not for LOCAL-only */}
                    {order.fulfillmentType !== "LOCAL" && nextStatuses.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1.5 font-medium">Update shipping status</p>
                        <div className="flex flex-wrap gap-2">
                          {nextStatuses.map((s) => {
                            const Icon = STATUS_CONFIG[s]?.icon;
                            return (
                              <Button
                                key={s}
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onStatusChange(s);
                                }}
                                disabled={isUpdating}
                                className={cn(
                                  "h-8 text-xs flex-1",
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

                    {/* Local status */}
                    {(order.fulfillmentType === "LOCAL" || order.fulfillmentType === "MIXED") &&
                      nextLocalStatuses.length > 0 && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1.5 font-medium flex items-center gap-1">
                            <Clock className="w-3 h-3 text-orange-500" />
                            Update local fulfilment
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {nextLocalStatuses.map((s) => {
                              const Icon = LOCAL_STATUS_CONFIG[s]?.icon;
                              return (
                                <Button
                                  key={s}
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onLocalStatusChange(s);
                                  }}
                                  disabled={isUpdating}
                                  className={cn(
                                    "h-8 text-xs flex-1",
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
              </motion.div>
            )}
          </AnimatePresence>

          {/* Expand hint on bottom */}
          <div className={cn(
            "flex items-center justify-center py-1.5 border-t border-gray-100 transition-colors duration-200",
            isExpanded ? "bg-[#12351a]/5" : "bg-gray-50/60"
          )}>
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ===========================
   ADDRESS EDIT DIALOG
=========================== */
function AddressEditDialog({ order, open, onClose, onSaved }) {
  const { updateOrderAddress } = useOrderStore();
  const [form, setForm] = useState({ shippingAddress: order?.shippingAddress || {} });
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
              <label className="text-xs font-medium text-gray-600">{label}</label>
              <Input
                value={form.shippingAddress[key] || ""}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    shippingAddress: { ...p.shippingAddress, [key]: e.target.value },
                  }))
                }
                className="h-9"
              />
            </div>
          ))}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button
              className="flex-1 bg-[#12351a] hover:bg-[#0f2916]"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
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
    loading,
  } = useOrderStore();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewTab, setViewTab] = useState("all");
  const [updatingStatus, setUpdatingStatus] = useState({});

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

  return (
    <div className="space-y-8 max-w-450">
      {/* PAGE HEADER */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h1 className="text-4xl lg:text-5xl font-bold text-[#12351a] mb-2">
            Orders Management
          </h1>
          <p className="text-base text-gray-600">
            Track, manage, and update customer orders
          </p>
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
                  placeholder="Search by order number, email, or name..."
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

      {/* ORDERS GRID */}
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
              <>
                <p className="text-xs text-gray-400 mb-4 flex items-center gap-1">
                  <ChevronDown className="w-3 h-3" />
                  Hover over any card to see full order details and actions
                </p>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <AnimatePresence>
                    {filteredOrders.map((order, index) => (
                      <motion.div
                        key={order._id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.03 }}
                      >
                        <OrderCard
                          order={order}
                          isLocalView={viewTab === "local"}
                          onStatusChange={(s) =>
                            handleStatusChange(order._id, s)
                          }
                          onLocalStatusChange={(s) =>
                            handleLocalStatusChange(order._id, s)
                          }
                          isUpdating={!!updatingStatus[order._id]}
                          onEditAddress={setAddressOrder}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* SHIPPING MODAL */}
      <Dialog open={shippingModal} onOpenChange={setShippingModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Mark Order as Shipped</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Courier Name *</label>
              <Input
                placeholder="e.g. Delhivery"
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
              <label className="text-sm font-medium">Tracking Number *</label>
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
                Tracking URL (optional)
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
                disabled={
                  !!updatingStatus[shippingOrderId] ||
                  !shippingForm.courierName ||
                  !shippingForm.trackingNumber
                }
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

      {/* ADDRESS EDIT DIALOG */}
      <AddressEditDialog
        order={addressOrder}
        open={!!addressOrder}
        onClose={() => setAddressOrder(null)}
        onSaved={(updatedOrder) => {
          fetchOrders();
          fetchLocalOrders();
        }}
      />
    </div>
  );
}