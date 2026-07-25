"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Package,
  ShoppingBag,
  IndianRupee,
  Star,
  Heart,
  Mail,
  FileText,
  CheckCircle,
  XCircle,
  Truck,
  Clock,
  TrendingUp,
  TrendingDown,
  ChevronDown,
  Calendar,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import { useDashboardStore } from "@/stores/useDashboardStore";
import { useAdminGuard } from "@/hooks/useAdminGuard";
import { cn } from "@/lib/utils";

/* ── brand tokens ── */
const G = "#12351a"; // brand dark green
const GA = "#1e5229"; // mid green
const GOLD = "#d4af37"; // gold accent

const STATUS_COLORS = {
  PAID: "#3b82f6",
  PROCESSING: "#f59e0b",
  SHIPPED: "#8b5cf6",
  DELIVERED: "#10b981",
  CANCELLED: "#ef4444",
};

const PAYMENT_COLORS = { ONLINE: G, COD: GOLD };

/* ── helpers ── */
const fmt = (n) => (n ?? 0).toLocaleString("en-IN");
const fmtRs = (n) => `₹${fmt(n)}`;

function pct(a, b) {
  if (!b) return null;
  const v = ((a - b) / b) * 100;
  return { value: Math.abs(v).toFixed(1), up: v >= 0 };
}

/* ════════════════════════════════════════════
   PAGE
════════════════════════════════════════════ */
export default function AdminDashboardPage() {
  useAdminGuard();
  const { fetchMetrics, metrics, year, setYear, loading, error } =
    useDashboardStore();

  useEffect(() => {
    fetchMetrics();
  }, []);

  if (loading) return <Skeleton />;
  if (error) return <ErrorState msg={error} />;
  if (!metrics) return null;

  const orders = metrics?.orders || {};
  const statusMap = orders.statusBreakdown || {};
  const chartData = metrics?.charts || {};
  
  const kpis = metrics
    ? {
        totalUsers: metrics.users?.total,
        totalProducts: metrics.products?.total,
        totalOrders: orders.total,
        totalRevenue: orders.revenue,
        todayOrders: orders.today?.orders,
        todayRevenue: orders.today?.revenue,
      }
    : null;

  /* ── derived chart data ── */
  const statusPie = Object.entries(statusMap)
    .filter(([, v]) => v > 0)
    .map(([k, v]) => ({ name: k, value: v, color: STATUS_COLORS[k] }));

  const paymentPie = (chartData.paymentMethods || []).map((p) => ({
    name: p._id || "Other",
    value: p.orders,
    color: PAYMENT_COLORS[p._id] || "#94a3b8",
  }));

  const fulfillmentPie = (chartData.fulfillmentTypes || []).map((f) => ({
    name: f._id || "Other",
    value: f.count,
    color: f._id === "LOCAL" ? GOLD : f._id === "MIXED" ? "#f97316" : GA,
  }));

  /* month-on-month delta for revenue (last vs second-last filled month) */
  const filledMonths = (chartData.monthly || []).filter((m) => m.revenue > 0);
  const momDelta =
    filledMonths.length >= 2
      ? pct(
          filledMonths[filledMonths.length - 1].revenue,
          filledMonths[filledMonths.length - 2].revenue,
        )
      : null;

  return (
    <div className="space-y-8 pb-12">
      {/* ── HEADER ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-wrap gap-4"
      >
        <div>
          <h1 className="text-4xl font-bold text-[#12351a]">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        {/* Year picker */}
        <div className="relative">
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="appearance-none pl-4 pr-9 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#12351a]/20 shadow-sm"
          >
            {[2023, 2024, 2025, 2026].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </motion.div>

      {/* ── KPI STRIP ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={IndianRupee}
          label="Total Revenue"
          value={fmtRs(orders.revenue)}
          sub={`${fmtRs(orders.today?.revenue || 0)} today`}
          color="green"
          delta={momDelta}
          delay={0}
        />
        <KpiCard
          icon={ShoppingBag}
          label="Total Orders"
          value={fmt(orders.total)}
          sub={`${fmt(orders.today?.orders || 0)} today`}
          color="blue"
          delay={0.05}
        />
        <KpiCard
          icon={Users}
          label="Total Users"
          value={fmt(metrics.users?.total)}
          sub="Registered accounts"
          color="purple"
          delay={0.1}
        />
        <KpiCard
          icon={Package}
          label="Products"
          value={fmt(metrics.products?.total)}
          sub={`${fmt(metrics.products?.featured)} featured`}
          color="amber"
          delay={0.15}
        />
      </div>

      {/* ── CHARTS ROW 1: Revenue + Daily ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Monthly revenue area chart — spans 2 cols */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                Revenue trend
              </p>
              <h3 className="text-lg font-bold text-gray-900 mt-0.5">
                {year} Monthly Revenue
              </h3>
            </div>
            {momDelta && (
              <span
                className={cn(
                  "flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full",
                  momDelta.up
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-red-50 text-red-700",
                )}
              >
                {momDelta.up ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {momDelta.value}% MoM
              </span>
            )}
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart
              data={chartData.monthly || []}
              margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={G} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={G} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="ordGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={GOLD} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={GOLD} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f0f0f0"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) =>
                  v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`
                }
                width={48}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 10,
                  border: "none",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                  fontSize: 12,
                }}
                formatter={(val, name) => [
                  name === "revenue" ? fmtRs(val) : fmt(val),
                  name === "revenue" ? "Revenue" : "Orders",
                ]}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke={G}
                strokeWidth={2}
                fill="url(#revGrad)"
                dot={false}
              />
              <Area
                type="monotone"
                dataKey="orders"
                stroke={GOLD}
                strokeWidth={2}
                fill="url(#ordGrad)"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-3">
            <span className="flex items-center gap-1.5 text-xs text-gray-500">
              <span className="w-3 h-0.5 bg-[#12351a] rounded-full inline-block" />
              Revenue
            </span>
            <span className="flex items-center gap-1.5 text-xs text-gray-500">
              <span className="w-3 h-0.5 bg-[#d4af37] rounded-full inline-block" />
              Orders
            </span>
          </div>
        </motion.div>

        {/* Daily last-7-days bar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-0.5">
            Last 7 days
          </p>
          <h3 className="text-lg font-bold text-gray-900 mb-6">Daily Orders</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={chartData.daily || []}
              margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f0f0f0"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 10,
                  border: "none",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                  fontSize: 12,
                }}
                formatter={(val, name) => [
                  name === "revenue" ? fmtRs(val) : val,
                  name === "revenue" ? "Revenue" : "Orders",
                ]}
              />
              <Bar
                dataKey="orders"
                fill={G}
                radius={[4, 4, 0, 0]}
                maxBarSize={32}
              />
              <Bar
                dataKey="revenue"
                fill={GOLD}
                radius={[4, 4, 0, 0]}
                maxBarSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* ── CHARTS ROW 2: Status + Payment + Fulfillment ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <PieCard title="Order Status" data={statusPie} delay={0.3} />
        <PieCard title="Payment Method" data={paymentPie} delay={0.35} />
        <PieCard title="Fulfillment Type" data={fulfillmentPie} delay={0.4} />
      </div>

      {/* ── ORDER STATUS MINI CARDS ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
          Order pipeline
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { label: "Paid", key: "PAID", icon: CheckCircle, color: "blue" },
            {
              label: "Processing",
              key: "PROCESSING",
              icon: Clock,
              color: "amber",
            },
            { label: "Shipped", key: "SHIPPED", icon: Truck, color: "purple" },
            {
              label: "Delivered",
              key: "DELIVERED",
              icon: CheckCircle,
              color: "green",
            },
            {
              label: "Cancelled",
              key: "CANCELLED",
              icon: XCircle,
              color: "red",
            },
          ].map(({ label, key, icon: Icon, color }) => (
            <StatusPill
              key={key}
              label={label}
              value={statusMap[key] || 0}
              Icon={Icon}
              color={color}
            />
          ))}
        </div>
      </motion.div>

      {/* ── TOP PRODUCTS + NEW USERS CHART ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Top products horizontal bar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-0.5">
            By order count
          </p>
          <h3 className="text-lg font-bold text-gray-900 mb-5">Top Products</h3>
          {(chartData.topProducts || []).length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center">
              No data yet
            </p>
          ) : (
            <div className="space-y-3">
              {(chartData.topProducts || []).map((p, i) => {
                const max = chartData.topProducts[0].orders;
                const w = Math.round((p.orders / max) * 100);
                return (
                  <div key={p._id || i}>
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-xs font-semibold text-gray-800 truncate max-w-[60%]">
                        {p.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {p.orders} orders · {fmtRs(p.revenue)}
                      </p>
                    </div>
                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${w}%`,
                          background: `linear-gradient(to right, ${G}, ${GA})`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Monthly new users bar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-0.5">
            Growth
          </p>
          <h3 className="text-lg font-bold text-gray-900 mb-5">
            New Users / Month
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={chartData.monthly || []}
              margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f0f0f0"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 10,
                  border: "none",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                  fontSize: 12,
                }}
                formatter={(v) => [v, "New users"]}
              />
              <Bar
                dataKey="newUsers"
                fill={G}
                radius={[4, 4, 0, 0]}
                maxBarSize={28}
              />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* ── SECONDARY METRICS ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetaCard
          label="Reviews"
          value={fmt(metrics.reviews?.total)}
          sub={`Avg ${(metrics.reviews?.averageRating || 0).toFixed(1)} ★`}
          icon={Star}
          color="#f59e0b"
        />
        <MetaCard
          label="Wishlist Items"
          value={fmt(metrics.wishlist?.totalSavedItems)}
          sub="Saved by users"
          icon={Heart}
          color="#ec4899"
        />
        <MetaCard
          label="Messages"
          value={fmt(metrics.contacts?.total)}
          sub={`${fmt(metrics.contacts?.unread)} unread`}
          icon={Mail}
          color="#6366f1"
        />
        <MetaCard
          label="Blog Posts"
          value={fmt(metrics.blogs?.total)}
          sub={`${fmt(metrics.blogs?.published)} published`}
          icon={FileText}
          color={G}
        />
      </div>

      {/* ── RECENT ACTIVITY ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65 }}
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
          Recent activity
        </p>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <RecentList
            title="Users"
            icon={Users}
            iconColor="text-blue-600"
            iconBg="bg-blue-50"
            items={(metrics.recent?.users || []).map((u) => ({
              primary: u.full_name,
              secondary: u.email,
              avatar: u.full_name?.charAt(0),
            }))}
          />
          <RecentList
            title="Orders"
            icon={ShoppingBag}
            iconColor="text-emerald-600"
            iconBg="bg-emerald-50"
            items={(metrics.recent?.orders || []).map((o) => ({
              primary: `#${o._id?.slice(-8)}`,
              secondary: o.user?.full_name || "Customer",
              badge: fmtRs(o.totalAmount),
              badgeColor: "bg-emerald-50 text-emerald-700",
            }))}
          />
          <RecentList
            title="Reviews"
            icon={Star}
            iconColor="text-amber-600"
            iconBg="bg-amber-50"
            items={(metrics.recent?.reviews || []).map((r) => ({
              primary: r.user?.full_name || "Anonymous",
              secondary: r.product?.name || "Product",
              badge: `${r.rating}/5 ★`,
              badgeColor: "bg-amber-50 text-amber-700",
            }))}
          />
        </div>
      </motion.div>
    </div>
  );
}

/* ════════════════════════════════════════════
   SUB-COMPONENTS
════════════════════════════════════════════ */

/* ── KPI Card ── */
function KpiCard({ icon: Icon, label, value, sub, color, delta, delay = 0 }) {
  const COLORS = {
    green: {
      ring: "ring-emerald-100",
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-700",
    },
    blue: {
      ring: "ring-blue-100",
      iconBg: "bg-blue-50",
      iconColor: "text-blue-700",
    },
    purple: {
      ring: "ring-purple-100",
      iconBg: "bg-purple-50",
      iconColor: "text-purple-700",
    },
    amber: {
      ring: "ring-amber-100",
      iconBg: "bg-amber-50",
      iconColor: "text-amber-700",
    },
  };
  const c = COLORS[color] || COLORS.blue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={cn(
        "bg-white rounded-2xl border border-gray-100 shadow-sm p-5 ring-1",
        c.ring,
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div
          className={cn(
            "w-9 h-9 rounded-xl flex items-center justify-center",
            c.iconBg,
          )}
        >
          <Icon className={cn("w-4.5 h-4.5", c.iconColor)} />
        </div>
        {delta && (
          <span
            className={cn(
              "flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full",
              delta.up
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-600",
            )}
          >
            {delta.up ? (
              <TrendingUp className="w-2.5 h-2.5" />
            ) : (
              <TrendingDown className="w-2.5 h-2.5" />
            )}
            {delta.value}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900 tracking-tight">{value}</p>
      <p className="text-xs font-medium text-gray-500 mt-0.5">{label}</p>
      {sub && <p className="text-[10px] text-gray-400 mt-1">{sub}</p>}
    </motion.div>
  );
}

/* ── Status Pill ── */
function StatusPill({ label, value, Icon, color }) {
  const map = {
    blue: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
    amber: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
    purple: {
      bg: "bg-purple-50",
      text: "text-purple-700",
      dot: "bg-purple-500",
    },
    green: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      dot: "bg-emerald-500",
    },
    red: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
  };
  const c = map[color];
  return (
    <div className={cn("rounded-xl p-4 flex items-center gap-3", c.bg)}>
      <div className={cn("w-2 h-2 rounded-full shrink-0", c.dot)} />
      <div className="min-w-0">
        <p className={cn("text-xl font-bold", c.text)}>{value}</p>
        <p
          className={cn(
            "text-[10px] font-semibold truncate",
            c.text,
            "opacity-70",
          )}
        >
          {label}
        </p>
      </div>
    </div>
  );
}

/* ── Donut Pie Card ── */
function PieCard({ title, data, delay }) {
  const total = data.reduce((s, d) => s + d.value, 0);

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const { name, value } = payload[0].payload;
    return (
      <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-3 py-2 text-xs">
        <p className="font-bold text-gray-800">{name}</p>
        <p className="text-gray-500">
          {value} ({total ? Math.round((value / total) * 100) : 0}%)
        </p>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
    >
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-0.5">
        Breakdown
      </p>
      <h3 className="text-base font-bold text-gray-900 mb-4">{title}</h3>

      {data.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">No data yet</p>
      ) : (
        <>
          <div className="flex justify-center mb-4">
            <ResponsiveContainer width={140} height={140}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={42}
                  outerRadius={62}
                  paddingAngle={2}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                >
                  {data.map((entry, i) => (
                    <Cell key={i} fill={entry.color} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2">
            {data.map((d, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-xs text-gray-600">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ background: d.color }}
                  />
                  {d.name}
                </span>
                <span className="text-xs font-bold text-gray-800">
                  {d.value}{" "}
                  <span className="font-normal text-gray-400">
                    ({total ? Math.round((d.value / total) * 100) : 0}%)
                  </span>
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </motion.div>
  );
}

/* ── Meta Card (small) ── */
function MetaCard({ label, value, sub, icon: Icon, color }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4" style={{ color }} />
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          {label}
        </p>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

/* ── Recent List ── */
function RecentList({ title, icon: Icon, iconColor, iconBg, items }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-50">
        <div
          className={cn(
            "w-7 h-7 rounded-lg flex items-center justify-center",
            iconBg,
          )}
        >
          <Icon className={cn("w-3.5 h-3.5", iconColor)} />
        </div>
        <p className="text-sm font-bold text-gray-800">{title}</p>
      </div>
      <div className="divide-y divide-gray-50">
        {items.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-8">Nothing yet</p>
        )}
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-3 px-5 py-3.5">
            {item.avatar && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#12351a] to-[#1e5229] flex items-center justify-center text-white text-xs font-bold shrink-0">
                {item.avatar}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-800 truncate">
                {item.primary}
              </p>
              <p className="text-[10px] text-gray-400 truncate">
                {item.secondary}
              </p>
            </div>
            {item.badge && (
              <span
                className={cn(
                  "text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0",
                  item.badgeColor,
                )}
              >
                {item.badge}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Skeleton ── */
function Skeleton() {
  return (
    <div className="space-y-8 animate-pulse pb-12">
      <div className="h-10 w-48 bg-gray-200 rounded-xl" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 bg-gray-200 rounded-2xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 h-72 bg-gray-200 rounded-2xl" />
        <div className="h-72 bg-gray-200 rounded-2xl" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-52 bg-gray-200 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

/* ── Error ── */
function ErrorState({ msg }) {
  return (
    <div className="flex items-center justify-center min-h-80">
      <div className="text-center">
        <XCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
        <p className="text-sm font-semibold text-gray-700">Failed to load</p>
        <p className="text-xs text-gray-400 mt-1">{msg}</p>
      </div>
    </div>
  );
}
