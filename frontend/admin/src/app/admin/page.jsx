"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Package,
  Star,
  Heart,
  Mail,
  FileText,
  ShoppingBag,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  IndianRupee,
} from "lucide-react";

import { useDashboardStore } from "@/stores/useDashboardStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useAdminGuard } from "@/hooks/useAdminGuard";

export default function AdminDashboardPage() {
  useAdminGuard();
  const { fetchMetrics, metrics, loading, error } = useDashboardStore();

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <Card className="max-w-md border-red-200 bg-red-50/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-red-600">
              <XCircle className="w-6 h-6" />
              <div>
                <h3 className="font-semibold">Failed to load dashboard</h3>
                <p className="text-sm text-red-500 mt-1">
                  Please refresh the page
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const orderStats = metrics?.orders || {};
  const statusBreakdown = orderStats.statusBreakdown || {};

  return (
    <div className="space-y-10">
      {/* PAGE HEADER */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex items-start justify-between flex-wrap gap-6"
      >
        <div>
          <h1 className="text-4xl lg:text-5xl font-bold text-[#12351a] mb-2">
            Dashboard Overview
          </h1>
          <p className="text-base text-gray-600 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        {/* Revenue Badge */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-linear-to-br from-[#12351a] via-[#0f2916] to-[#0b1f11] text-white px-8 py-4 rounded-2xl shadow-xl border border-[#d4af37]/20"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#d4af37]/20 rounded-xl">
              <TrendingUp className="w-6 h-6 text-[#d4af37]" />
            </div>
            <div>
              <div className="text-xs opacity-80 font-medium mb-0.5">
                Total Revenue
              </div>
              <div className="font-bold text-2xl">
                ₹{orderStats.revenue?.toLocaleString() || 0}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* PRIMARY STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <EnhancedStatCard
          title="Total Users"
          value={metrics?.users?.total || 0}
          icon={Users}
          gradient="from-blue-500 via-blue-600 to-blue-700"
          iconBg="bg-blue-500/20"
          iconColor="text-blue-600"
          subValue={"New Users"}
          delay={0}
        />

        <EnhancedStatCard
          title="Total Products"
          value={metrics?.products?.total || 0}
          icon={Package}
          gradient="from-purple-500 via-purple-600 to-purple-700"
          iconBg="bg-purple-500/20"
          iconColor="text-purple-600"
          subValue={`${metrics?.products?.featured || 0} Featured`}
          delay={0.1}
        />

        <EnhancedStatCard
          title="Total Orders"
          value={orderStats.total || 0}
          icon={ShoppingBag}
          gradient="from-emerald-500 via-emerald-600 to-emerald-700"
          iconBg="bg-emerald-500/20"
          iconColor="text-emerald-600"
          subValue={`${orderStats.today?.orders || 0} Today`}
          delay={0.2}
        />

        <EnhancedStatCard
          title="Total Revenue"
          value={`₹${orderStats.revenue?.toLocaleString() || 0}`}
          icon={IndianRupee}
          gradient="from-amber-500 via-amber-600 to-orange-600"
          iconBg="bg-amber-500/20"
          iconColor="text-amber-600"
          subValue={`₹${orderStats.today?.revenue?.toLocaleString() || 0} Today`}
          delay={0.3}
        />
      </div>

      {/* ORDERS STATUS BREAKDOWN */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="space-y-5"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[#12351a]">Order Status</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <OrderStatusCard
            title="Paid"
            value={statusBreakdown.PAID || 0}
            icon={CheckCircle}
            color="blue"
          />
          <OrderStatusCard
            title="Processing"
            value={statusBreakdown.PROCESSING || 0}
            icon={Clock}
            color="yellow"
          />
          <OrderStatusCard
            title="Shipped"
            value={statusBreakdown.SHIPPED || 0}
            icon={Truck}
            color="purple"
          />
          <OrderStatusCard
            title="Delivered"
            value={statusBreakdown.DELIVERED || 0}
            icon={CheckCircle}
            color="green"
          />
          <OrderStatusCard
            title="Cancelled"
            value={statusBreakdown.CANCELLED || 0}
            icon={XCircle}
            color="red"
          />
        </div>
      </motion.div>

      {/* SECONDARY STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <ProfessionalInfoCard
          title="Total Reviews"
          value={metrics?.reviews?.total || 0}
          icon={Star}
          subValue={`Average Rating: ${metrics?.reviews?.averageRating?.toFixed(1) || "0.0"} ⭐`}
          iconColor="text-amber-500"
          bgColor="bg-amber-50"
          borderColor="border-amber-200"
          delay={0.5}
        />

        <ProfessionalInfoCard
          title="Wishlist Items"
          value={metrics?.wishlist?.totalSavedItems || 0}
          icon={Heart}
          subValue="Total saved by users"
          iconColor="text-rose-500"
          bgColor="bg-rose-50"
          borderColor="border-rose-200"
          delay={0.6}
        />

        <ProfessionalInfoCard
          title="Contact Messages"
          value={metrics?.contacts?.total || 0}
          icon={Mail}
          subValue={`${metrics?.contacts?.unread || 0} Unread`}
          iconColor="text-blue-500"
          bgColor="bg-blue-50"
          borderColor="border-blue-200"
          delay={0.7}
        />
      </div>

      {/* BLOGS STATS */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <Card className="border-gray-200 shadow-lg overflow-hidden bg-white">
          <div className="bg-linear-to-r from-[#12351a] via-[#0f2916] to-[#0b1f11] p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-white">Blog Posts</h3>
                  <p className="text-sm text-white/70">
                    Content management overview
                  </p>
                </div>
              </div>
            </div>
          </div>
          <CardContent className="pt-8 pb-6">
            <div className="grid grid-cols-2 gap-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gray-100 mb-3">
                  <span className="text-3xl font-bold text-[#12351a]">
                    {metrics?.blogs?.total || 0}
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-600">Total Blogs</p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-emerald-100 mb-3">
                  <span className="text-3xl font-bold text-emerald-600">
                    {metrics?.blogs?.published || 0}
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-600">Published</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* RECENT ACTIVITY */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="space-y-5"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[#12351a]">Recent Activity</h2>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <RecentUsers users={metrics?.recent?.users} />
          <RecentContacts contacts={metrics?.recent?.contacts} />
          <RecentReviews reviews={metrics?.recent?.reviews} />
        </div>
      </motion.div>

      {/* RECENT ORDERS */}
      {metrics?.recent?.orders && metrics.recent.orders.length > 0 && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1 }}
          className="space-y-5"
        >
          <h2 className="text-2xl font-bold text-[#12351a]">Recent Orders</h2>
          <RecentOrders orders={metrics.recent.orders} />
        </motion.div>
      )}
    </div>
  );
}

/* ===========================
   ENHANCED STAT CARD
=========================== */

function EnhancedStatCard({
  title,
  value,
  icon: Icon,
  gradient,
  iconBg,
  iconColor,
  subValue,
  delay,
}) {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <Card className="border-gray-200 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden bg-white group">
        <CardContent className="pt-6 pb-6">
          <div className="flex items-start justify-between mb-6">
            <div className={cn("p-3 rounded-xl", iconBg)}>
              <Icon className={cn("w-6 h-6", iconColor)} />
            </div>
            <ArrowUpRight className="w-5 h-5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          <div>
            <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
            <p className="text-4xl font-bold text-gray-900 tracking-tight mb-1">
              {value}
            </p>
            {subValue && (
              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                {subValue}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ===========================
   ORDER STATUS CARD
=========================== */

function OrderStatusCard({ title, value, icon: Icon, color }) {
  const colorClasses = {
    blue: {
      bg: "bg-blue-50",
      iconBg: "bg-blue-500",
      border: "border-blue-200",
      text: "text-blue-700",
    },
    yellow: {
      bg: "bg-yellow-50",
      iconBg: "bg-yellow-500",
      border: "border-yellow-200",
      text: "text-yellow-700",
    },
    purple: {
      bg: "bg-purple-50",
      iconBg: "bg-purple-500",
      border: "border-purple-200",
      text: "text-purple-700",
    },
    green: {
      bg: "bg-emerald-50",
      iconBg: "bg-emerald-500",
      border: "border-emerald-200",
      text: "text-emerald-700",
    },
    red: {
      bg: "bg-red-50",
      iconBg: "bg-red-500",
      border: "border-red-200",
      text: "text-red-700",
    },
  };

  const colors = colorClasses[color];

  return (
    <Card
      className={cn(
        "border shadow-sm hover:shadow-md transition-all bg-white",
        colors.border,
      )}
    >
      <CardContent className="pt-5 pb-5">
        <div className="flex items-center gap-3 mb-3">
          <div
            className={cn("p-2 rounded-lg text-white shadow-sm", colors.iconBg)}
          >
            <Icon className="w-4 h-4" />
          </div>
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
            {title}
          </p>
        </div>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
      </CardContent>
    </Card>
  );
}

/* ===========================
   PROFESSIONAL INFO CARD
=========================== */

function ProfessionalInfoCard({
  title,
  value,
  icon: Icon,
  subValue,
  iconColor,
  bgColor,
  borderColor,
  delay,
}) {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay }}
    >
      <Card
        className={cn(
          "border shadow-md hover:shadow-lg transition-all bg-white",
          borderColor,
        )}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
              {title}
            </CardTitle>
            <div className={cn("p-2.5 rounded-xl", bgColor)}>
              <Icon className={cn("w-5 h-5", iconColor)} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-gray-900 mb-2">{value}</div>
          {subValue && <p className="text-sm text-gray-600">{subValue}</p>}
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ===========================
   RECENT USERS
=========================== */

function RecentUsers({ users }) {
  return (
    <Card className="border-gray-200 shadow-md bg-white">
      <CardHeader className="bg-linear-to-r pt-5 from-blue-50 to-blue-100/30 border-b border-blue-100">
        <CardTitle className="text-base font-semibold flex items-center gap-2.5 text-gray-900">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          Recent Users
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-5">
        {users && users.length > 0 ? (
          <div className="space-y-4">
            {users.map((u, idx) => (
              <motion.div
                key={u._id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: idx * 0.1 }}
              >
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-xl bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                    {u.full_name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {u.full_name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{u.email}</p>
                  </div>
                </div>
                {idx < users.length - 1 && <Separator className="mt-4" />}
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center py-8">
            No recent users
          </p>
        )}
      </CardContent>
    </Card>
  );
}

/* ===========================
   RECENT CONTACTS
=========================== */

function RecentContacts({ contacts }) {
  return (
    <Card className="border-gray-200 shadow-md bg-white">
      <CardHeader className="bg-linear-to-r pt-5 from-purple-50 to-purple-100/30 border-b border-purple-100">
        <CardTitle className="text-base font-semibold flex items-center gap-2.5 text-gray-900">
          <div className="p-2 bg-purple-500/10 rounded-lg">
            <Mail className="w-5 h-5 text-purple-600" />
          </div>
          Recent Contacts
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-5">
        {contacts && contacts.length > 0 ? (
          <div className="space-y-4">
            {contacts.map((c, idx) => (
              <motion.div
                key={c._id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: idx * 0.1 }}
              >
                <div>
                  <div className="flex items-start justify-between mb-1">
                    <p className="text-sm font-semibold text-gray-900">
                      {c.fullName}
                    </p>
                    <span
                      className={cn(
                        "text-xs px-2.5 py-1 rounded-full font-medium",
                        c.isRead
                          ? "bg-gray-100 text-gray-600"
                          : "bg-purple-100 text-purple-700",
                      )}
                    >
                      {c.isRead ? "Read" : "Unread"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{c.email}</p>
                </div>
                {idx < contacts.length - 1 && <Separator className="mt-4" />}
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center py-8">
            No recent contacts
          </p>
        )}
      </CardContent>
    </Card>
  );
}

/* ===========================
   RECENT REVIEWS
=========================== */

function RecentReviews({ reviews }) {
  return (
    <Card className="border-gray-200 shadow-md bg-white">
      <CardHeader className="bg-linear-to-r pt-5 from-amber-50 to-amber-100/30 border-b border-amber-100">
        <CardTitle className="text-base font-semibold flex items-center gap-2.5 text-gray-900">
          <div className="p-2 bg-amber-500/10 rounded-lg">
            <Star className="w-5 h-5 text-amber-600" />
          </div>
          Recent Reviews
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-5">
        {reviews && reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((r, idx) => (
              <motion.div
                key={r._id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: idx * 0.1 }}
              >
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {r.user?.full_name || "Anonymous"}
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {r.product?.name || "Product"}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "w-3.5 h-3.5",
                          i < r.rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-gray-300",
                        )}
                      />
                    ))}
                    <span className="text-xs text-gray-500 ml-1.5 font-medium">
                      {r.rating}/5
                    </span>
                  </div>
                </div>
                {idx < reviews.length - 1 && <Separator className="mt-4" />}
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center py-8">
            No recent reviews
          </p>
        )}
      </CardContent>
    </Card>
  );
}

/* ===========================
   RECENT ORDERS
=========================== */

function RecentOrders({ orders }) {
  return (
    <Card className="border-gray-200 shadow-md bg-white">
      <CardHeader className="bg-linear-to-r from-emerald-50 to-emerald-100/30 border-b border-emerald-100">
        <CardTitle className="text-base font-semibold flex items-center gap-2.5 text-gray-900">
          <div className="p-2 bg-emerald-500/10 rounded-lg">
            <ShoppingBag className="w-5 h-5 text-emerald-600" />
          </div>
          Recent Orders
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-5">
        <div className="space-y-4">
          {orders.map((order, idx) => (
            <motion.div
              key={order._id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: idx * 0.1 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Order #{order._id?.slice(-8)}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {order.user?.full_name || "Customer"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-base font-bold text-emerald-600">
                    ₹{order.totalAmount?.toLocaleString()}
                  </p>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 font-medium">
                    {order.status}
                  </span>
                </div>
              </div>
              {idx < orders.length - 1 && <Separator className="mt-4" />}
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/* ===========================
   SKELETON LOADER
=========================== */

function DashboardSkeleton() {
  return (
    <div className="space-y-10">
      {/* Header skeleton */}
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <div className="h-12 w-80 bg-gray-200 rounded-xl animate-pulse" />
          <div className="h-5 w-64 bg-gray-200 rounded-lg animate-pulse" />
        </div>
        <div className="h-20 w-56 bg-gray-200 rounded-2xl animate-pulse" />
      </div>

      {/* Primary stats skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-40 rounded-xl bg-gray-200 animate-pulse shadow-sm"
          />
        ))}
      </div>

      {/* Order status skeleton */}
      <div className="space-y-5">
        <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-28 rounded-xl bg-gray-200 animate-pulse"
            />
          ))}
        </div>
      </div>

      {/* Secondary stats skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-36 rounded-xl bg-gray-200 animate-pulse" />
        ))}
      </div>
    </div>
  );
}
