"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  User,
  Phone,
  Calendar,
  MapPin,
  Users,
  Loader2,
  CheckCircle,
  Sparkles,
} from "lucide-react";
import { useContactStore } from "@/stores/useContactStore";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const EMPTY = {
  fullName: "",
  phone: "",
  eventDate: "",
  eventLocation: "",
  gathering: "",
};

export default function EventBookingModal({ isOpen, onClose }) {
  const { submitEventBooking, eventLoading } = useContactStore();

  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  /* Reset state whenever modal opens */
  useEffect(() => {
    if (isOpen) {
      setForm(EMPTY);
      setErrors({});
      setSuccess(false);
    }
  }, [isOpen]);

  /* Lock body scroll while open */
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

 const set = (k, v) => {
   setForm((f) => ({ ...f, [k]: v }));

   setErrors((e) => {
     const n = { ...e };
     delete n[k];
     return n;
   });
 };

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = "Full name is required";
    if (!/^\d{10}$/.test(form.phone)) e.phone = "Enter a valid 10-digit number";
    if (!form.eventDate) e.eventDate = "Event date is required";
    else if (new Date(form.eventDate) < new Date())
      e.eventDate = "Date must be in the future";
    if (!form.eventLocation.trim()) e.eventLocation = "Location is required";
    if (
      !form.gathering ||
      isNaN(Number(form.gathering)) ||
      Number(form.gathering) < 1
    )
      e.gathering = "Enter expected number of guests";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const ok = await submitEventBooking({
      fullName: form.fullName,
      phone: form.phone,
      eventDate: form.eventDate,
      eventLocation: form.eventLocation,
      gathering: Number(form.gathering),
    });

    if (ok) setSuccess(true);
  };

  /* Min date = today */
  const today = new Date().toISOString().split("T")[0];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-60"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="fixed inset-0 z-70 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col">
              {/* ── Green header band ── */}
              <div className="relative bg-linear-to-r from-[#2d5016] via-[#3d6820] to-[#2d5016] px-7 py-6 shrink-0">
                {/* Dot pattern */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle, rgba(212,175,55,0.18) 1px, transparent 1px)",
                    backgroundSize: "20px 20px",
                  }}
                />
                <div className="relative">
                  <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-3 py-1 rounded-full mb-3">
                    <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
                    <span className="text-[11px] font-bold uppercase tracking-widest text-white/90">
                      Paanshala Events
                    </span>
                  </div>
                  <h2
                    className="text-2xl font-extrabold text-white leading-tight"
                    style={{ fontFamily: "Georgia, serif" }}
                  >
                    Book a Paan Stall
                  </h2>
                  <p className="text-white/65 text-sm mt-1">
                    Weddings, corporates, celebrations — we bring the magic.
                  </p>
                </div>

                {/* Close button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>

              {/* Gold accent line */}
              <div className="h-0.75 bg-linear-to-r from-transparent via-[#d4af37] to-transparent shrink-0" />

              {/* ── Body ── */}
              <div className="overflow-y-auto flex-1">
                <AnimatePresence mode="wait">
                  {success ? (
                    /* ── Success state ── */
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center justify-center px-8 py-14 text-center"
                    >
                      <div className="w-20 h-20 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center mb-6">
                        <CheckCircle className="w-10 h-10 text-green-500" />
                      </div>
                      <h3
                        className="text-2xl font-bold text-gray-900 mb-3"
                        style={{ fontFamily: "Georgia, serif" }}
                      >
                        Request Received!
                      </h3>
                      <p className="text-gray-500 leading-relaxed mb-8 max-w-sm">
                        Thank you! Our team will reach out to you shortly to
                        confirm the details and customise your paan experience.
                      </p>
                      <button
                        onClick={onClose}
                        className="px-7 py-2.5 bg-linear-to-r from-[#2d5016] to-[#3d6820] text-white font-semibold rounded-full text-sm hover:opacity-90 transition"
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
                      className="px-7 py-7 space-y-5 text-black"
                    >
                      {/* Full name */}
                      <Field
                        label="Full Name *"
                        error={errors.fullName}
                        icon={<User className="w-4 h-4" />}
                      >
                        <Input
                          value={form.fullName}
                          onChange={(e) => set("fullName", e.target.value)}
                          placeholder="Rahul Sharma"
                          className={cn(
                            "h-11 pl-10",
                            errors.fullName && "border-red-400",
                          )}
                        />
                      </Field>

                      {/* Phone */}
                      <Field
                        label="Phone Number *"
                        error={errors.phone}
                        icon={<Phone className="w-4 h-4" />}
                      >
                        <Input
                          value={form.phone}
                          onChange={(e) =>
                            set(
                              "phone",
                              e.target.value.replace(/\D/g, "").slice(0, 10),
                            )
                          }
                          placeholder="10-digit mobile number"
                          inputMode="numeric"
                          className={cn(
                            "h-11 pl-10",
                            errors.phone && "border-red-400",
                          )}
                        />
                      </Field>

                      {/* Event date */}
                      <Field
                        label="Date of Event *"
                        error={errors.eventDate}
                        icon={<Calendar className="w-4 h-4" />}
                      >
                        <Input
                          type="date"
                          min={today}
                          value={form.eventDate}
                          onChange={(e) => set("eventDate", e.target.value)}
                          className={cn(
                            "h-11 pl-10",
                            errors.eventDate && "border-red-400",
                          )}
                        />
                      </Field>

                      {/* Location */}
                      <Field
                        label="Event Location *"
                        error={errors.eventLocation}
                        icon={<MapPin className="w-4 h-4" />}
                      >
                        <Input
                          value={form.eventLocation}
                          onChange={(e) => set("eventLocation", e.target.value)}
                          placeholder="Venue name, City"
                          className={cn(
                            "h-11 pl-10",
                            errors.eventLocation && "border-red-400",
                          )}
                        />
                      </Field>

                      {/* Gathering */}
                      <Field
                        label="Expected Guests *"
                        error={errors.gathering}
                        icon={<Users className="w-4 h-4" />}
                      >
                        <Input
                          type="number"
                          min={1}
                          value={form.gathering}
                          onChange={(e) => set("gathering", e.target.value)}
                          placeholder="e.g. 150"
                          inputMode="numeric"
                          className={cn(
                            "h-11 pl-10",
                            errors.gathering && "border-red-400",
                          )}
                        />
                      </Field>

                      {/* Submit */}
                      <div className="pt-2">
                        <button
                          type="submit"
                          disabled={eventLoading}
                          className="w-full h-12 bg-linear-to-r from-[#2d5016] to-[#3d6820] hover:opacity-90 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60"
                        >
                          {eventLoading ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              Submitting…
                            </>
                          ) : (
                            "Book My Paan Stall"
                          )}
                        </button>
                        <p className="text-center text-xs text-gray-400 mt-3">
                          We'll confirm availability within 24 hours.
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
      <Label className="text-sm font-semibold text-gray-700">{label}</Label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          {icon}
        </div>
        {children}
      </div>
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
          <span className="inline-block w-1 h-1 rounded-full bg-red-400 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
