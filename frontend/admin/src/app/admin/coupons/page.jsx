"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TicketPercent,
  Plus,
  Power,
  Edit,
  Trash2,
  Search,
  Filter,
  X,
  Loader2,
  AlertTriangle,
  Calendar,
  TrendingUp,
  Users,
  CheckCircle,
  XCircle,
  Tag,
  Percent,
  IndianRupee,
  Clock,
} from "lucide-react";
import toast from "react-hot-toast";

import { useCouponStore } from "@/stores/useCouponStore";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export default function AdminCouponsPage() {
  const {
    coupons,
    fetchCoupons,
    createCoupon,
    updateCoupon,
    toggleCoupon,
    loading,
  } = useCouponStore();

  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showToggleDialog, setShowToggleDialog] = useState(false);
  const [couponToEdit, setCouponToEdit] = useState(null);
  const [couponToToggle, setCouponToToggle] = useState(null);

  // Form state
  const [form, setForm] = useState({
    code: "",
    discountType: "percentage",
    discountValue: "",
    maxDiscount: "",
    minCartValue: "",
    expiryDate: "",
    usageLimit: "",
    usagePerUser: "1",
  });

  const [submitLoading, setSubmitLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [filteredCoupons, setFilteredCoupons] = useState([]);

  /* ===========================
     INIT
  =========================== */
  useEffect(() => {
    fetchCoupons();
  }, []);

  /* ===========================
     FILTER COUPONS
  =========================== */
  useEffect(() => {
    let filtered = coupons;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((c) =>
        c.code.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Status filter
    const now = new Date();
    if (statusFilter === "active") {
      filtered = filtered.filter(
        (c) => c.isActive && new Date(c.expiryDate) >= now,
      );
    } else if (statusFilter === "inactive") {
      filtered = filtered.filter((c) => !c.isActive);
    } else if (statusFilter === "expired") {
      filtered = filtered.filter((c) => new Date(c.expiryDate) < now);
    }

    setFilteredCoupons(filtered);
  }, [searchQuery, statusFilter, coupons]);

  /* ===========================
     STATS CALCULATION
  =========================== */
  const stats = {
    total: coupons.length,
    active: coupons.filter(
      (c) => c.isActive && new Date(c.expiryDate) >= new Date(),
    ).length,
    inactive: coupons.filter((c) => !c.isActive).length,
    expired: coupons.filter((c) => new Date(c.expiryDate) < new Date()).length,
  };

  /* ===========================
     VALIDATION
  =========================== */
  const validate = () => {
    const newErrors = {};

    if (!form.code.trim()) {
      newErrors.code = "Coupon code is required";
    } else if (form.code.length < 3) {
      newErrors.code = "Code must be at least 3 characters";
    }

    if (!form.discountValue || Number(form.discountValue) <= 0) {
      newErrors.discountValue = "Discount value must be greater than 0";
    }

    if (
      form.discountType === "percentage" &&
      Number(form.discountValue) > 100
    ) {
      newErrors.discountValue = "Percentage cannot exceed 100";
    }

    if (!form.expiryDate) {
      newErrors.expiryDate = "Expiry date is required";
    } else if (new Date(form.expiryDate) < new Date()) {
      newErrors.expiryDate = "Expiry date must be in the future";
    }

    if (form.minCartValue && Number(form.minCartValue) < 0) {
      newErrors.minCartValue = "Cannot be negative";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ===========================
     CREATE COUPON
  =========================== */
  const handleCreateCoupon = async (e) => {
    e.preventDefault();

    if (!validate()) {
      toast.error("Please fix validation errors");
      return;
    }

    const payload = {
      code: form.code.toUpperCase().trim(),
      discountType: form.discountType,
      discountValue: Number(form.discountValue),
      maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : undefined,
      minCartValue: Number(form.minCartValue || 0),
      expiryDate: form.expiryDate,
      usageLimit: form.usageLimit ? Number(form.usageLimit) : undefined,
      usagePerUser: Number(form.usagePerUser || 1),
    };

    setSubmitLoading(true);
    const ok = await createCoupon(payload);
    if (ok) {
      resetForm();
      setShowCreateDialog(false);
      await fetchCoupons();
    }
    setSubmitLoading(false);
  };

  /* ===========================
     EDIT COUPON
  =========================== */
  const openEditDialog = (coupon) => {
    setCouponToEdit(coupon);
    setForm({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue.toString(),
      maxDiscount: coupon.maxDiscount?.toString() || "",
      minCartValue: coupon.minCartValue?.toString() || "",
      expiryDate: coupon.expiryDate.split("T")[0],
      usageLimit: coupon.usageLimit?.toString() || "",
      usagePerUser: coupon.usagePerUser?.toString() || "1",
    });
    setShowEditDialog(true);
  };

  const handleEditCoupon = async (e) => {
    e.preventDefault();

    if (!validate()) {
      toast.error("Please fix validation errors");
      return;
    }

    const payload = {
      code: form.code.toUpperCase().trim(),
      discountType: form.discountType,
      discountValue: Number(form.discountValue),
      maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : undefined,
      minCartValue: Number(form.minCartValue || 0),
      expiryDate: form.expiryDate,
      usageLimit: form.usageLimit ? Number(form.usageLimit) : undefined,
      usagePerUser: Number(form.usagePerUser || 1),
    };

    setSubmitLoading(true);
    const ok = await updateCoupon(couponToEdit._id, payload);
    if (ok) {
      resetForm();
      setShowEditDialog(false);
      setCouponToEdit(null);
      await fetchCoupons();
    }
    setSubmitLoading(false);
  };

  /* ===========================
     TOGGLE COUPON
  =========================== */
  const openToggleDialog = (coupon) => {
    setCouponToToggle(coupon);
    setShowToggleDialog(true);
  };

  const handleToggleCoupon = async () => {
    if (!couponToToggle) return;

    setSubmitLoading(true);
    const ok = await toggleCoupon(couponToToggle._id, !couponToToggle.isActive);
    if (ok) {
      setShowToggleDialog(false);
      setCouponToToggle(null);
      await fetchCoupons();
    }
    setSubmitLoading(false);
  };

  /* ===========================
     RESET FORM
  =========================== */
  const resetForm = () => {
    setForm({
      code: "",
      discountType: "percentage",
      discountValue: "",
      maxDiscount: "",
      minCartValue: "",
      expiryDate: "",
      usageLimit: "",
      usagePerUser: "1",
    });
    setErrors({});
  };

  /* ===========================
     CLEAR FILTERS
  =========================== */
  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
  };

  const hasActiveFilters = searchQuery || statusFilter !== "all";

  /* ===========================
     FORMAT HELPERS
  =========================== */
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const isExpired = (expiryDate) => {
    return new Date(expiryDate) < new Date();
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
              Coupon Management
            </h1>
            <p className="text-base text-gray-600">
              Create and manage discount coupons for your store
            </p>
          </div>

          <Button
            onClick={() => setShowCreateDialog(true)}
            className="bg-[#12351a] hover:bg-[#0f2916] h-11 px-6"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Coupon
          </Button>
        </div>
      </motion.div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Coupons"
          value={stats.total}
          icon={TicketPercent}
          color="blue"
          delay={0}
        />
        <StatCard
          title="Active"
          value={stats.active}
          icon={CheckCircle}
          color="emerald"
          delay={0.1}
        />
        <StatCard
          title="Inactive"
          value={stats.inactive}
          icon={XCircle}
          color="amber"
          delay={0.2}
        />
        <StatCard
          title="Expired"
          value={stats.expired}
          icon={Clock}
          color="red"
          delay={0.3}
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
                    placeholder="Search by coupon code..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
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
                  <SelectItem value="all">All Coupons</SelectItem>
                  <SelectItem value="active">Active Only</SelectItem>
                  <SelectItem value="inactive">Inactive Only</SelectItem>
                  <SelectItem value="expired">Expired Only</SelectItem>
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
                {searchQuery && (
                  <Badge variant="secondary" className="px-3 py-1.5">
                    Search: {searchQuery}
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

      {/* COUPONS LIST */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="border-gray-200 shadow-lg">
          <CardHeader className="border-b border-gray-100 bg-gray-50/50">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <TicketPercent className="w-5 h-5 text-[#12351a]" />
              All Coupons ({filteredCoupons.length})
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-[#12351a]" />
              </div>
            ) : filteredCoupons.length === 0 ? (
              <div className="text-center py-16">
                <TicketPercent className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No coupons found
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  {hasActiveFilters
                    ? "Try adjusting your filters"
                    : "Create your first discount coupon to get started"}
                </p>
                {!hasActiveFilters && (
                  <Button
                    onClick={() => setShowCreateDialog(true)}
                    className="bg-[#12351a] hover:bg-[#0f2916]"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Coupon
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                <AnimatePresence>
                  {filteredCoupons.map((coupon, index) => (
                    <motion.div
                      key={coupon._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <CouponCard
                        coupon={coupon}
                        onEdit={openEditDialog}
                        onToggle={openToggleDialog}
                        formatDate={formatDate}
                        isExpired={isExpired}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* CREATE COUPON DIALOG */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-blue-100 rounded-full">
                <Plus className="w-6 h-6 text-blue-600" />
              </div>
              <DialogTitle className="text-2xl">Create New Coupon</DialogTitle>
            </div>
            <p className="text-sm text-gray-600">
              Set up a discount coupon for your customers
            </p>
          </DialogHeader>

          <CouponForm
            form={form}
            setForm={setForm}
            errors={errors}
            setErrors={setErrors}
            onSubmit={handleCreateCoupon}
            submitLoading={submitLoading}
            onCancel={() => {
              setShowCreateDialog(false);
              resetForm();
            }}
            isEdit={false}
          />
        </DialogContent>
      </Dialog>

      {/* EDIT COUPON DIALOG */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-amber-100 rounded-full">
                <Edit className="w-6 h-6 text-amber-600" />
              </div>
              <DialogTitle className="text-2xl">Edit Coupon</DialogTitle>
            </div>
            <p className="text-sm text-gray-600">
              Update coupon details and settings
            </p>
          </DialogHeader>

          <CouponForm
            form={form}
            setForm={setForm}
            errors={errors}
            setErrors={setErrors}
            onSubmit={handleEditCoupon}
            submitLoading={submitLoading}
            onCancel={() => {
              setShowEditDialog(false);
              setCouponToEdit(null);
              resetForm();
            }}
            isEdit={true}
          />
        </DialogContent>
      </Dialog>

      {/* TOGGLE STATUS DIALOG */}
      <AlertDialog open={showToggleDialog} onOpenChange={setShowToggleDialog}>
        <AlertDialogContent className="max-w-lg">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-amber-100 rounded-full">
                <Power className="w-6 h-6 text-amber-600" />
              </div>
              <AlertDialogTitle className="text-2xl">
                {couponToToggle?.isActive ? "Deactivate" : "Activate"} Coupon?
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-base space-y-4 pt-2">
              <p className="text-gray-700">
                Are you sure you want to{" "}
                <span className="font-semibold">
                  {couponToToggle?.isActive ? "deactivate" : "activate"}
                </span>{" "}
                the coupon{" "}
                <span className="font-semibold text-gray-900">
                  {couponToToggle?.code}
                </span>
                ?
              </p>
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-sm text-amber-800">
                  {couponToToggle?.isActive ? (
                    <>
                      <strong>Note:</strong> Deactivating will prevent customers
                      from using this coupon until it's activated again.
                    </>
                  ) : (
                    <>
                      <strong>Note:</strong> Activating will allow customers to
                      use this coupon immediately.
                    </>
                  )}
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-2">
            <AlertDialogCancel
              onClick={() => {
                setShowToggleDialog(false);
                setCouponToToggle(null);
              }}
              disabled={submitLoading}
              className="h-11"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleToggleCoupon}
              disabled={submitLoading}
              className="bg-amber-600 hover:bg-amber-700 h-11"
            >
              {submitLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Power className="w-4 h-4 mr-2" />
                  {couponToToggle?.isActive ? "Deactivate" : "Activate"}
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* ===========================
   COUPON CARD COMPONENT
=========================== */
function CouponCard({ coupon, onEdit, onToggle, formatDate, isExpired }) {
  const expired = isExpired(coupon.expiryDate);
  const usagePercent = coupon.usageLimit
    ? Math.round((coupon.usedCount / coupon.usageLimit) * 100)
    : 0;

  return (
    <Card
      className={cn(
        "border-gray-200 shadow-md hover:shadow-lg transition-all overflow-hidden group",
        expired && "opacity-75",
      )}
    >
      {/* Header with Code */}
      <div
        className={cn(
          "p-5 border-b",
          coupon.isActive && !expired
            ? "bg-linear-to-r from-emerald-50 to-teal-50 border-emerald-100"
            : "bg-gray-50 border-gray-200",
        )}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Tag
                className={cn(
                  "w-5 h-5",
                  coupon.isActive && !expired
                    ? "text-emerald-600"
                    : "text-gray-400",
                )}
              />
              <h3 className="text-2xl font-bold text-gray-900 font-mono">
                {coupon.code}
              </h3>
            </div>

            {/* Discount Value */}
            <div className="flex items-baseline gap-2">
              {coupon.discountType === "percentage" ? (
                <>
                  <Percent className="w-4 h-4 text-emerald-600" />
                  <span className="text-3xl font-bold text-emerald-600">
                    {coupon.discountValue}%
                  </span>
                  <span className="text-sm text-gray-600">OFF</span>
                </>
              ) : (
                <>
                  <IndianRupee className="w-4 h-4 text-emerald-600" />
                  <span className="text-3xl font-bold text-emerald-600">
                    {coupon.discountValue}
                  </span>
                  <span className="text-sm text-gray-600">OFF</span>
                </>
              )}
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex flex-col gap-2">
            {coupon.isActive && !expired ? (
              <Badge className="bg-emerald-500 text-white border-0">
                Active
              </Badge>
            ) : expired ? (
              <Badge className="bg-red-500 text-white border-0">Expired</Badge>
            ) : (
              <Badge variant="secondary">Inactive</Badge>
            )}
          </div>
        </div>
      </div>

      <CardContent className="pt-5 space-y-4">
        {/* Coupon Details */}
        <div className="space-y-3 text-sm">
          {/* Max Discount */}
          {coupon.discountType === "percentage" && coupon.maxDiscount && (
            <div className="flex items-center justify-between text-gray-600">
              <span>Max Discount:</span>
              <span className="font-semibold text-gray-900">
                ₹{coupon.maxDiscount}
              </span>
            </div>
          )}

          {/* Min Cart Value */}
          {coupon.minCartValue > 0 && (
            <div className="flex items-center justify-between text-gray-600">
              <span>Min Cart Value:</span>
              <span className="font-semibold text-gray-900">
                ₹{coupon.minCartValue}
              </span>
            </div>
          )}

          {/* Expiry Date */}
          <div className="flex items-center justify-between text-gray-600">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Expires:
            </span>
            <span
              className={cn(
                "font-semibold",
                expired ? "text-red-600" : "text-gray-900",
              )}
            >
              {formatDate(coupon.expiryDate)}
            </span>
          </div>

          {/* Usage Stats */}
          {coupon.usageLimit && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-gray-600">
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  Usage:
                </span>
                <span className="font-semibold text-gray-900">
                  {coupon.usedCount || 0} / {coupon.usageLimit}
                </span>
              </div>
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    usagePercent >= 80
                      ? "bg-red-500"
                      : usagePercent >= 50
                        ? "bg-amber-500"
                        : "bg-emerald-500",
                  )}
                  style={{ width: `${Math.min(usagePercent, 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Per User Limit */}
          <div className="flex items-center justify-between text-gray-600">
            <span>Per User Limit:</span>
            <span className="font-semibold text-gray-900">
              {coupon.usagePerUser || 1}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(coupon)}
            className="flex-1"
          >
            <Edit className="w-3 h-3 mr-1.5" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggle(coupon)}
            className={cn(
              "flex-1",
              coupon.isActive && !expired
                ? "bg-amber-50 border-amber-300 hover:bg-amber-100"
                : "bg-emerald-50 border-emerald-300 hover:bg-emerald-100",
            )}
          >
            <Power className="w-3 h-3 mr-1.5" />
            {coupon.isActive ? "Deactivate" : "Activate"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/* ===========================
   COUPON FORM COMPONENT
=========================== */
function CouponForm({
  form,
  setForm,
  errors,
  setErrors,
  onSubmit,
  submitLoading,
  onCancel,
  isEdit,
}) {
  const clearError = (field) => {
    const newErrors = { ...errors };
    delete newErrors[field];
    setErrors(newErrors);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6 pt-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Coupon Code */}
        <div className="space-y-2">
          <Label htmlFor="code" className="text-sm font-medium">
            Coupon Code *
          </Label>
          <Input
            id="code"
            placeholder="e.g., SAVE20"
            value={form.code}
            onChange={(e) => {
              setForm({ ...form, code: e.target.value.toUpperCase() });
              clearError("code");
            }}
            className={cn("h-11 font-mono", errors.code && "border-red-400")}
            required
          />
          {errors.code && (
            <p className="text-xs text-red-500 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              {errors.code}
            </p>
          )}
        </div>

        {/* Discount Type */}
        <div className="space-y-2">
          <Label htmlFor="discountType" className="text-sm font-medium">
            Discount Type *
          </Label>
          <Select
            value={form.discountType}
            onValueChange={(value) => setForm({ ...form, discountType: value })}
          >
            <SelectTrigger className="h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="percentage">Percentage (%)</SelectItem>
              <SelectItem value="flat">Flat Amount (₹)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Discount Value */}
        <div className="space-y-2">
          <Label htmlFor="discountValue" className="text-sm font-medium">
            Discount Value *
          </Label>
          <Input
            id="discountValue"
            type="number"
            min="0"
            step="0.01"
            placeholder={
              form.discountType === "percentage" ? "e.g., 20" : "e.g., 100"
            }
            value={form.discountValue}
            onChange={(e) => {
              setForm({ ...form, discountValue: e.target.value });
              clearError("discountValue");
            }}
            className={cn("h-11", errors.discountValue && "border-red-400")}
            required
          />
          {errors.discountValue && (
            <p className="text-xs text-red-500 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              {errors.discountValue}
            </p>
          )}
        </div>

        {/* Max Discount (only for percentage) */}
        {form.discountType === "percentage" && (
          <div className="space-y-2">
            <Label htmlFor="maxDiscount" className="text-sm font-medium">
              Max Discount (₹)
            </Label>
            <Input
              id="maxDiscount"
              type="number"
              min="0"
              placeholder="Optional"
              value={form.maxDiscount}
              onChange={(e) =>
                setForm({ ...form, maxDiscount: e.target.value })
              }
              className="h-11"
            />
            <p className="text-xs text-gray-500">
              Maximum discount amount in rupees
            </p>
          </div>
        )}

        {/* Min Cart Value */}
        <div className="space-y-2">
          <Label htmlFor="minCartValue" className="text-sm font-medium">
            Minimum Cart Value (₹)
          </Label>
          <Input
            id="minCartValue"
            type="number"
            min="0"
            placeholder="0"
            value={form.minCartValue}
            onChange={(e) => {
              setForm({ ...form, minCartValue: e.target.value });
              clearError("minCartValue");
            }}
            className={cn("h-11", errors.minCartValue && "border-red-400")}
          />
          {errors.minCartValue && (
            <p className="text-xs text-red-500">{errors.minCartValue}</p>
          )}
        </div>

        {/* Expiry Date */}
        <div className="space-y-2">
          <Label htmlFor="expiryDate" className="text-sm font-medium">
            Expiry Date *
          </Label>
          <Input
            id="expiryDate"
            type="date"
            value={form.expiryDate}
            onChange={(e) => {
              setForm({ ...form, expiryDate: e.target.value });
              clearError("expiryDate");
            }}
            className={cn("h-11", errors.expiryDate && "border-red-400")}
            required
          />
          {errors.expiryDate && (
            <p className="text-xs text-red-500 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              {errors.expiryDate}
            </p>
          )}
        </div>

        {/* Usage Limit */}
        <div className="space-y-2">
          <Label htmlFor="usageLimit" className="text-sm font-medium">
            Total Usage Limit
          </Label>
          <Input
            id="usageLimit"
            type="number"
            min="1"
            placeholder="Unlimited"
            value={form.usageLimit}
            onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
            className="h-11"
          />
          <p className="text-xs text-gray-500">
            Leave empty for unlimited usage
          </p>
        </div>

        {/* Usage Per User */}
        <div className="space-y-2">
          <Label htmlFor="usagePerUser" className="text-sm font-medium">
            Usage Per User
          </Label>
          <Input
            id="usagePerUser"
            type="number"
            min="1"
            value={form.usagePerUser}
            onChange={(e) => setForm({ ...form, usagePerUser: e.target.value })}
            className="h-11"
          />
          <p className="text-xs text-gray-500">
            How many times each user can use this coupon
          </p>
        </div>
      </div>

      {/* Actions */}
      <DialogFooter className="gap-2 sm:gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={submitLoading}
          className="h-11"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={submitLoading}
          className="bg-[#12351a] hover:bg-[#0f2916] h-11"
        >
          {submitLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {isEdit ? "Updating..." : "Creating..."}
            </>
          ) : (
            <>
              {isEdit ? (
                <>
                  <Edit className="w-4 h-4 mr-2" />
                  Update Coupon
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Coupon
                </>
              )}
            </>
          )}
        </Button>
      </DialogFooter>
    </form>
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
    red: {
      iconBg: "bg-red-100",
      icon: "text-red-600",
      border: "border-red-200",
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
