"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, User, Phone, Mail, Building2, MapPin,
  ClipboardList, Loader2, CheckCircle, Sparkles,
  ChevronDown,
} from "lucide-react";
import { useContactStore } from "@/stores/useContactStore";
import { Input }  from "@/components/ui/input";
import { Label }  from "@/components/ui/label";
import { cn }     from "@/lib/utils";

const EMPTY = {
  fullName: "", email: "", phone: "",
  businessName: "", businessType: "", city: "", requirement: "",
};

const BUSINESS_TYPES = ["Hotel", "Restaurant", "Café", "Lounge", "Catering", "Other"];

export default function HorecaInquiryModal({ isOpen, onClose }) {
  const { submitHorecaInquiry, horecaLoading } = useContactStore();

  const [form,    setForm]    = useState(EMPTY);
  const [errors,  setErrors]  = useState({});
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) { setForm(EMPTY); setErrors({}); setSuccess(false); }
  }, [isOpen]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => { const n = { ...e }; delete n[k]; return n; });
  };

  const validate = () => {
    const e = {};
    if (!form.fullName.trim())                           e.fullName     = "Full name is required";
    if (!form.email.trim())                              e.email        = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email))          e.email        = "Enter valid email";
    if (!/^\d{10}$/.test(form.phone))                   e.phone        = "Enter valid 10-digit number";
    if (!form.businessName.trim())                       e.businessName = "Business name is required";
    if (!form.businessType.trim())                       e.businessType = "Business type is required";
    if (!form.city.trim())                               e.city         = "City is required";
    if (!form.requirement.trim())                        e.requirement  = "Requirement is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const ok = await submitHorecaInquiry(form);
    if (ok) setSuccess(true);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/55 backdrop-blur-sm z-60"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="fixed inset-0 z-70 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col">

              {/* ── Header ── */}
              <div className="relative bg-linear-to-r from-[#1e3a0f] via-[#2d5016] to-[#1e3a0f] px-7 py-6 shrink-0">
                <div className="pointer-events-none absolute inset-0"
                  style={{
                    backgroundImage: "radial-gradient(circle, rgba(212,175,55,0.15) 1.5px, transparent 1.5px)",
                    backgroundSize: "22px 22px",
                  }}
                />
                {/* Decorative glow */}
                <div className="pointer-events-none absolute top-0 right-0 w-48 h-48 bg-[#d4af37]/10 rounded-full blur-3xl" />

                <div className="relative flex items-start justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-2 bg-[#d4af37]/20 border border-[#d4af37]/30 px-3 py-1 rounded-full mb-3">
                      <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
                      <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#d4af37]">
                        HoReCa Partnerships
                      </span>
                    </div>
                    <h2 className="text-2xl font-extrabold text-white leading-tight" style={{ fontFamily: "Georgia, serif" }}>
                      Partner With Paanshala
                    </h2>
                    <p className="text-white/55 text-xs mt-1.5 leading-relaxed max-w-sm">
                      Hotels, restaurants, cafés &amp; luxury hospitality partnerships.
                    </p>
                  </div>

                  <button
                    onClick={onClose}
                    className="shrink-0 w-8 h-8 rounded-full bg-white/12 hover:bg-white/22 flex items-center justify-center transition-colors"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>

              {/* Gold accent line */}
              <div className="h-0.75 bg-linear-to-r from-transparent via-[#d4af37] to-transparent shrink-0" />

              {/* ── Body ── */}
              <div className="overflow-y-auto flex-1">
                <AnimatePresence mode="wait">

                  {/* ── Success ── */}
                  {success ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center justify-center px-8 py-16 text-center"
                    >
                      <div className="relative mb-6">
                        <div className="w-20 h-20 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center">
                          <CheckCircle className="w-10 h-10 text-green-500" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#d4af37] rounded-full flex items-center justify-center">
                          <Sparkles className="w-3 h-3 text-white" />
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3" style={{ fontFamily: "Georgia, serif" }}>
                        Inquiry Submitted!
                      </h3>
                      <p className="text-gray-500 text-sm leading-relaxed mb-8 max-w-sm">
                        Thank you for your interest in partnering with Paanshala.
                        Our HoReCa team will connect with you shortly.
                      </p>
                      <button
                        onClick={onClose}
                        className="px-8 py-2.5 bg-linear-to-r from-[#2d5016] to-[#3d6820] text-white font-bold rounded-full text-sm hover:opacity-90 transition-all shadow-md"
                      >
                        Done
                      </button>
                    </motion.div>
                  ) : (

                    /* ── Form ── */
                    <motion.form
                      key="form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onSubmit={handleSubmit}
                      className="px-7 py-7 space-y-6 text-accent-foreground"
                    >
                      {/* Section label */}
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-px bg-gray-100" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Contact Details</span>
                        <div className="flex-1 h-px bg-gray-100" />
                      </div>

                      {/* Row 1 — Name + Email */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Full Name *" error={errors.fullName} icon={<User className="w-4 h-4" />}>
                          <Input
                            value={form.fullName}
                            onChange={(e) => set("fullName", e.target.value)}
                            placeholder="Rahul Sharma"
                            className={cn("h-11 pl-10 border-gray-200 focus:border-[#2d5016]", errors.fullName && "border-red-400")}
                          />
                        </Field>
                        <Field label="Email Address *" error={errors.email} icon={<Mail className="w-4 h-4" />}>
                          <Input
                            type="email"
                            value={form.email}
                            onChange={(e) => set("email", e.target.value)}
                            placeholder="you@example.com"
                            className={cn("h-11 pl-10 border-gray-200 focus:border-[#2d5016]", errors.email && "border-red-400")}
                          />
                        </Field>
                      </div>

                      {/* Row 2 — Phone + City */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Phone Number *" error={errors.phone} icon={<Phone className="w-4 h-4" />}>
                          <Input
                            value={form.phone}
                            onChange={(e) => set("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
                            placeholder="10-digit number"
                            inputMode="numeric"
                            className={cn("h-11 pl-10 border-gray-200 focus:border-[#2d5016]", errors.phone && "border-red-400")}
                          />
                        </Field>
                        <Field label="City *" error={errors.city} icon={<MapPin className="w-4 h-4" />}>
                          <Input
                            value={form.city}
                            onChange={(e) => set("city", e.target.value)}
                            placeholder="Delhi"
                            className={cn("h-11 pl-10 border-gray-200 focus:border-[#2d5016]", errors.city && "border-red-400")}
                          />
                        </Field>
                      </div>

                      {/* Section label */}
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-px bg-gray-100" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Business Details</span>
                        <div className="flex-1 h-px bg-gray-100" />
                      </div>

                      {/* Row 3 — Business name + type */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Business Name *" error={errors.businessName} icon={<Building2 className="w-4 h-4" />}>
                          <Input
                            value={form.businessName}
                            onChange={(e) => set("businessName", e.target.value)}
                            placeholder="Hotel / Restaurant Name"
                            className={cn("h-11 pl-10 border-gray-200 focus:border-[#2d5016]", errors.businessName && "border-red-400")}
                          />
                        </Field>

                        <Field label="Business Type *" error={errors.businessType}>
                          <div className="relative">
                            <select
                              value={form.businessType}
                              onChange={(e) => set("businessType", e.target.value)}
                              className={cn(
                                "w-full h-11 rounded-lg border px-3 pr-9 text-sm appearance-none bg-white",
                                "focus:outline-none focus:ring-2 focus:ring-[#2d5016]/20 focus:border-[#2d5016] transition-colors",
                                form.businessType ? "text-gray-900" : "text-gray-400",
                                errors.businessType ? "border-red-400" : "border-gray-200"
                              )}
                            >
                              <option value="">Select business type</option>
                              {BUSINESS_TYPES.map((t) => (
                                <option key={t} value={t}>{t}</option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                          </div>
                        </Field>
                      </div>

                      {/* Requirement */}
                      <Field label="Requirement / Partnership Details *" error={errors.requirement} icon={<ClipboardList className="w-4 h-4" />}>
                        <textarea
                          rows={4}
                          value={form.requirement}
                          onChange={(e) => set("requirement", e.target.value)}
                          placeholder="Tell us about your requirements, expected volume, or how you'd like to collaborate…"
                          className={cn(
                            "w-full rounded-xl border px-4 pt-3 pb-3 pl-10 text-sm resize-none",
                            "focus:outline-none focus:ring-2 focus:ring-[#2d5016]/20 focus:border-[#2d5016] transition-colors",
                            errors.requirement ? "border-red-400" : "border-gray-200"
                          )}
                        />
                      </Field>

                      {/* Submit */}
                      <div className="pt-1 space-y-3">
                        <button
                          type="submit"
                          disabled={horecaLoading}
                          className="w-full h-12 bg-linear-to-r from-[#2d5016] to-[#3d6820] hover:opacity-90 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60"
                        >
                          {horecaLoading
                            ? <><Loader2 className="w-4 h-4 animate-spin" />Submitting…</>
                            : "Submit Partnership Inquiry"}
                        </button>
                        <p className="text-center text-[11px] text-gray-400">
                          Our HoReCa team will contact you within 24 hours.
                        </p>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ── Field wrapper ── */
function Field({ label, error, icon, children }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-bold text-gray-600 uppercase tracking-wider">{label}</Label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10">
            {icon}
          </div>
        )}
        {children}
      </div>
      {error && (
        <p className="text-[11px] text-red-500 flex items-center gap-1 mt-1">
          <span className="inline-block w-1 h-1 rounded-full bg-red-400 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}