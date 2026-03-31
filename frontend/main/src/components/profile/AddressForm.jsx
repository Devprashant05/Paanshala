"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  X,
  MapPin,
  User,
  Building2,
  Phone,
  Mail,
  Navigation,
  Home,
  Briefcase,
  Star,
  Loader2,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { useAddressStore } from "@/stores/useAddressStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

const EMPTY = {
  fullName: "",
  companyName: "",
  streetAddress: "",
  landmark: "",
  city: "",
  state: "",
  pincode: "",
  phone: "",
  email: "",
  addressType: "Home",
  isDefault: false,
};

export default function AddressForm({ onClose, initialData }) {
  const { addAddress, updateAddress, loading } = useAddressStore();

  const [form, setForm] = useState(
    initialData
      ? {
          fullName: initialData.fullName || "",
          companyName: initialData.companyName || "",
          streetAddress: initialData.streetAddress || "",
          landmark: initialData.landmark || "",
          city: initialData.city || "",
          state: initialData.state || "",
          pincode: initialData.pincode || "",
          phone: initialData.phone || "",
          email: initialData.email || "",
          addressType: initialData.addressType || "Home",
          isDefault: initialData.isDefault || false,
        }
      : EMPTY,
  );

  const [errors, setErrors] = useState({});
  const isEdit = !!initialData;

  /* ── helpers ── */
  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const clearErr = (field) =>
    setErrors((e) => {
      const n = { ...e };
      delete n[field];
      return n;
    });

  /* ── validation ── */
  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = "Full name is required";
    if (!form.streetAddress.trim())
      e.streetAddress = "Street address is required";
    if (!form.city.trim()) e.city = "City is required";
    if (!form.state) e.state = "State is required";
    if (!/^\d{6}$/.test(form.pincode))
      e.pincode = "Enter a valid 6-digit pincode";
    if (!/^\d{10}$/.test(form.phone))
      e.phone = "Enter a valid 10-digit mobile number";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Enter a valid email address";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ── submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const ok = isEdit
      ? await updateAddress(initialData._id, form)
      : await addAddress(form);

    if (ok) onClose();
  };

  return (
    /* Backdrop */
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Panel */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 24 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-2xl max-h-[92vh] overflow-hidden rounded-2xl bg-white shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#2d5016]/10 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-[#2d5016]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                {isEdit ? "Edit Address" : "Add New Address"}
              </h3>
              <p className="text-xs text-gray-400 leading-none mt-0.5">
                {isEdit
                  ? "Update your saved address"
                  : "Save a delivery address"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 py-6">
          <form id="address-form" onSubmit={handleSubmit} className="space-y-6">
            {/* ── Contact ── */}
            <fieldset className="space-y-4">
              <legend className="text-xs font-bold text-[#2d5016] uppercase tracking-widest mb-3 flex items-center gap-2">
                <User className="w-3.5 h-3.5" />
                Contact Details
              </legend>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field
                  label="Full Name *"
                  error={errors.fullName}
                  icon={<User className="w-4 h-4" />}
                >
                  <Input
                    value={form.fullName}
                    onChange={(e) => {
                      set("fullName", e.target.value);
                      clearErr("fullName");
                    }}
                    placeholder="Rahul Sharma"
                    className={cn(
                      "h-11 pl-10",
                      errors.fullName && "border-red-400",
                    )}
                  />
                </Field>

                <Field
                  label="Company Name"
                  icon={<Building2 className="w-4 h-4" />}
                >
                  <Input
                    value={form.companyName}
                    onChange={(e) => set("companyName", e.target.value)}
                    placeholder="Optional"
                    className="h-11 pl-10"
                  />
                </Field>

                <Field
                  label="Mobile Number *"
                  error={errors.phone}
                  icon={<Phone className="w-4 h-4" />}
                >
                  <Input
                    value={form.phone}
                    onChange={(e) => {
                      set(
                        "phone",
                        e.target.value.replace(/\D/g, "").slice(0, 10),
                      );
                      clearErr("phone");
                    }}
                    placeholder="10-digit number"
                    className={cn(
                      "h-11 pl-10",
                      errors.phone && "border-red-400",
                    )}
                  />
                </Field>

                <Field
                  label="Email Address *"
                  error={errors.email}
                  icon={<Mail className="w-4 h-4" />}
                >
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => {
                      set("email", e.target.value);
                      clearErr("email");
                    }}
                    placeholder="you@example.com"
                    className={cn(
                      "h-11 pl-10",
                      errors.email && "border-red-400",
                    )}
                  />
                </Field>
              </div>
            </fieldset>

            {/* ── Address ── */}
            <fieldset className="space-y-4">
              <legend className="text-xs font-bold text-[#2d5016] uppercase tracking-widest mb-3 flex items-center gap-2">
                <Navigation className="w-3.5 h-3.5" />
                Delivery Address
              </legend>

              <Field
                label="Street Address *"
                error={errors.streetAddress}
                icon={<MapPin className="w-4 h-4" />}
              >
                <Input
                  value={form.streetAddress}
                  onChange={(e) => {
                    set("streetAddress", e.target.value);
                    clearErr("streetAddress");
                  }}
                  placeholder="House no., Building, Street"
                  className={cn(
                    "h-11 pl-10",
                    errors.streetAddress && "border-red-400",
                  )}
                />
              </Field>

              <Field
                label="Landmark"
                icon={<MapPin className="w-4 h-4 opacity-50" />}
              >
                <Input
                  value={form.landmark}
                  onChange={(e) => set("landmark", e.target.value)}
                  placeholder="Near hospital, market, etc. (optional)"
                  className="h-11 pl-10"
                />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Field label="City *" error={errors.city}>
                  <Input
                    value={form.city}
                    onChange={(e) => {
                      set("city", e.target.value);
                      clearErr("city");
                    }}
                    placeholder="Mumbai"
                    className={cn("h-11", errors.city && "border-red-400")}
                  />
                </Field>

                <Field label="State *" error={errors.state}>
                  <select
                    value={form.state}
                    onChange={(e) => {
                      set("state", e.target.value);
                      clearErr("state");
                    }}
                    className={cn(
                      "h-11 w-full rounded-lg border bg-white px-3 text-sm text-gray-900",
                      "focus:outline-none focus:ring-2 focus:ring-[#2d5016]/30 focus:border-[#2d5016]",
                      "transition-colors",
                      errors.state ? "border-red-400" : "border-gray-200",
                    )}
                  >
                    <option value="">Select state</option>
                    {INDIAN_STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Pincode *" error={errors.pincode}>
                  <Input
                    value={form.pincode}
                    onChange={(e) => {
                      set(
                        "pincode",
                        e.target.value.replace(/\D/g, "").slice(0, 6),
                      );
                      clearErr("pincode");
                    }}
                    placeholder="400001"
                    className={cn("h-11", errors.pincode && "border-red-400")}
                  />
                </Field>
              </div>
            </fieldset>

            {/* ── Type & Default ── */}
            <fieldset className="space-y-4">
              <legend className="text-xs font-bold text-[#2d5016] uppercase tracking-widest mb-3">
                Address Options
              </legend>

              {/* Type toggle */}
              {/* <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Address Type
                </Label>
                <div className="flex gap-3">
                  {["Home", "Work", "Other"].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => set("addressType", type)}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-200",
                        form.addressType === type
                          ? "bg-[#2d5016] border-[#2d5016] text-white shadow-sm"
                          : "bg-white border-gray-200 text-gray-600 hover:border-[#2d5016]/40 hover:text-[#2d5016]",
                      )}
                    >
                      {type === "Home" && <Home className="w-3.5 h-3.5" />}
                      {type === "Work" && <Briefcase className="w-3.5 h-3.5" />}
                      {type === "Other" && <MapPin className="w-3.5 h-3.5" />}
                      {type}
                    </button>
                  ))}
                </div>
              </div> */}

              {/* Default toggle */}
              <button
                type="button"
                onClick={() => set("isDefault", !form.isDefault)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all duration-200 text-left",
                  form.isDefault
                    ? "bg-[#2d5016]/5 border-[#2d5016]/40 text-[#2d5016]"
                    : "bg-gray-50 border-gray-200 text-gray-600 hover:border-[#2d5016]/30",
                )}
              >
                <div
                  className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                    form.isDefault
                      ? "border-[#2d5016] bg-[#2d5016]"
                      : "border-gray-300",
                  )}
                >
                  {form.isDefault && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-white fill-white" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold leading-tight">
                    Set as default address
                  </p>
                  <p className="text-xs text-gray-400 leading-tight mt-0.5">
                    This address will be pre-selected at checkout
                  </p>
                </div>
                {form.isDefault && (
                  <Star className="w-4 h-4 ml-auto text-[#d4af37] fill-[#d4af37]" />
                )}
              </button>
            </fieldset>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/60 shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="h-10 px-5"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="address-form"
            disabled={loading}
            className="h-10 px-6 bg-[#2d5016] hover:bg-[#3d6820] gap-2 shadow-sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {isEdit ? "Saving…" : "Adding…"}
              </>
            ) : (
              <>
                <MapPin className="w-4 h-4" />
                {isEdit ? "Save Changes" : "Add Address"}
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ===========================
   FIELD WRAPPER
=========================== */
function Field({ label, error, icon, children }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-gray-700">{label}</Label>
      {icon ? (
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            {icon}
          </div>
          {children}
        </div>
      ) : (
        children
      )}
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
          <AlertTriangle className="w-3 h-3 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}