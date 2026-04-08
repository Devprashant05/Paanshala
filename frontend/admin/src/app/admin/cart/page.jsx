"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  Users,
  IndianRupee,
  Package,
  Loader2,
  Mail,
  ShoppingBag,
  ChevronDown,
  TrendingUp,
  Search,
  X,
} from "lucide-react";
import { useCartStore } from "@/stores/useCartStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function AdminCartPage() {
  const { adminCartData, adminCartLoading, fetchAdminCartData } =
    useCartStore();
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetchAdminCartData();
  }, []);

  const stats = {
    totalUsers: adminCartData.length,
    totalItems: adminCartData.reduce((s, c) => s + c.cartSummary.totalItems, 0),
    totalValue: adminCartData.reduce(
      (s, c) => s + c.cartSummary.totalAmount,
      0,
    ),
    avgCartValue: adminCartData.length
      ? adminCartData.reduce((s, c) => s + c.cartSummary.totalAmount, 0) /
        adminCartData.length
      : 0,
  };

  const filtered = adminCartData.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.user?.full_name?.toLowerCase().includes(q) ||
      c.user?.email?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50/40 p-6 md:p-8 space-y-8 max-w-450">
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#2d5016] mb-1">
              Admin Panel
            </p>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
              Active Carts
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Products added by users but not yet purchased
            </p>
          </div>
          <div className="flex items-center gap-2 bg-[#2d5016]/8 border border-[#2d5016]/20 px-4 py-2 rounded-full">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-semibold text-[#2d5016]">
              Live Data
            </span>
          </div>
        </div>
      </motion.div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {[
          {
            label: "Users with Carts",
            value: stats.totalUsers,
            icon: Users,
            suffix: "",
            color: "blue",
          },
          {
            label: "Total Items",
            value: stats.totalItems,
            icon: Package,
            suffix: "",
            color: "violet",
          },
          {
            label: "Total Cart Value",
            value: stats.totalValue.toFixed(0),
            icon: IndianRupee,
            suffix: "₹",
            color: "emerald",
          },
          {
            label: "Avg Cart Value",
            value: stats.avgCartValue.toFixed(0),
            icon: TrendingUp,
            suffix: "₹",
            color: "amber",
          },
        ].map((s, i) => (
          <StatCard key={s.label} {...s} delay={i * 0.07} />
        ))}
      </div>

      {/* ── Table ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-gray-100 flex-wrap">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-[#2d5016]" />
              <h2 className="font-bold text-gray-900 text-base">
                All Carts
                <span className="ml-2 text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                  {filtered.length}
                </span>
              </h2>
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by name or email…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2d5016]/20 focus:border-[#2d5016]"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          {adminCartLoading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-[#2d5016]" />
              <p className="text-sm text-gray-400">Loading carts…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                <ShoppingCart className="w-8 h-8 text-gray-300" />
              </div>
              <p className="font-semibold text-gray-700">
                {search ? "No matching carts" : "No active carts"}
              </p>
              <p className="text-sm text-gray-400">
                {search
                  ? `No results for "${search}"`
                  : "Users will appear here when they add items to their cart"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filtered.map((cartData, index) => (
                <CartRow
                  key={cartData.user?._id || index}
                  cartData={cartData}
                  index={index}
                  isExpanded={expandedId === (cartData.user?._id || index)}
                  onToggle={() =>
                    setExpandedId((prev) =>
                      prev === (cartData.user?._id || index)
                        ? null
                        : cartData.user?._id || index,
                    )
                  }
                />
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════
   CART ROW — expandable
═══════════════════════════ */
function CartRow({ cartData, index, isExpanded, onToggle }) {
  const { user, cartSummary, products } = cartData;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
    >
      {/* Summary row — always visible */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-50/70 transition-colors text-left"
      >
        {/* Avatar */}
        <Avatar className="h-10 w-10 shrink-0 border-2 border-white shadow-sm">
          <AvatarImage src={user?.profile_image} alt={user?.full_name} />
          <AvatarFallback className="bg-linear-to-br from-[#2d5016] to-[#3d6820] text-white text-sm font-bold">
            {user?.full_name?.charAt(0)?.toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>

        {/* User info */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 truncate text-sm">
            {user?.full_name || "Unknown User"}
          </p>
          <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
            <Mail className="w-3 h-3" />
            <span className="truncate">{user?.email}</span>
          </div>
        </div>

        {/* Items count */}
        <div className="hidden sm:flex items-center gap-1.5 shrink-0">
          <ShoppingBag className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-sm font-semibold text-gray-700">
            {cartSummary.totalItems}
          </span>
          <span className="text-xs text-gray-400">
            {cartSummary.totalItems === 1 ? "item" : "items"}
          </span>
        </div>

        {/* Value */}
        <div className="shrink-0 text-right">
          <p className="text-base font-extrabold text-[#2d5016]">
            ₹{cartSummary.totalAmount.toFixed(2)}
          </p>
          <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">
            cart value
          </p>
        </div>

        {/* Chevron */}
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0 w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center"
        >
          <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
        </motion.div>
      </button>

      {/* Expanded product list */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-5 pt-1 bg-gray-50/60">
              {/* Products */}
              <div className="space-y-2 mb-4">
                {products.map((product, idx) => (
                  <div
                    key={`${product.productId}-${idx}`}
                    className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 p-3 shadow-sm"
                  >
                    {/* Image */}
                    <div className="w-14 h-14 shrink-0 rounded-lg overflow-hidden border border-gray-100 bg-gray-50">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-5 h-5 text-gray-300" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900 truncate">
                        {product.name || "Product"}
                      </p>
                      <div className="flex items-center flex-wrap gap-2 mt-1">
                        <span className="text-xs text-gray-500">
                          Qty:{" "}
                          <span className="font-bold text-gray-700">
                            {product.quantity}
                          </span>
                        </span>
                        {product.variantSetSize && (
                          <Badge
                            variant="outline"
                            className="text-[10px] h-4 px-1.5 font-semibold"
                          >
                            Set of {product.variantSetSize}
                          </Badge>
                        )}
                        <span className="text-xs text-gray-400">
                          @ ₹{product.price}
                        </span>
                      </div>
                    </div>

                    {/* Line total */}
                    <p className="shrink-0 font-bold text-sm text-[#2d5016]">
                      ₹{product.totalPrice.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="bg-white rounded-xl border border-gray-100 px-4 py-3 shadow-sm">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-700">
                    ₹{cartSummary.subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-dashed border-gray-200 pt-2 mt-1">
                  <span className="text-sm font-bold text-gray-900">
                    Cart Total
                  </span>
                  <span className="text-base font-extrabold text-[#2d5016]">
                    ₹{cartSummary.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ═══════════════════════════
   STAT CARD
═══════════════════════════ */
const STAT_STYLES = {
  blue: {
    ring: "ring-blue-100",
    icon: "bg-blue-50 text-blue-600",
    val: "text-blue-700",
  },
  violet: {
    ring: "ring-violet-100",
    icon: "bg-violet-50 text-violet-600",
    val: "text-violet-700",
  },
  emerald: {
    ring: "ring-emerald-100",
    icon: "bg-emerald-50 text-emerald-600",
    val: "text-emerald-700",
  },
  amber: {
    ring: "ring-amber-100",
    icon: "bg-amber-50 text-amber-600",
    val: "text-amber-700",
  },
};

function StatCard({ label, value, icon: Icon, suffix, color, delay }) {
  const s = STAT_STYLES[color];
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ y: -3, transition: { duration: 0.18 } }}
      className={cn(
        "bg-white rounded-2xl border border-gray-100 shadow-sm p-5 ring-1",
        s.ring,
      )}
    >
      <div
        className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center mb-4",
          s.icon,
        )}
      >
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
        {label}
      </p>
      <p
        className={cn(
          "text-2xl md:text-3xl font-extrabold tracking-tight",
          s.val,
        )}
      >
        {suffix}
        {value}
      </p>
    </motion.div>
  );
}
