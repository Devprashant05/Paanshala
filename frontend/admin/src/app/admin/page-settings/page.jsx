"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  MapPin,
  Phone,
  MessageCircle,
  Link as LinkIcon,
  Instagram,
  Facebook,
  Youtube,
  Twitter,
  Plus,
  Trash2,
  Save,
  Loader2,
  Globe,
  Settings,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { usePageSettingsStore } from "@/stores/usePageSettingsStore";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

/* ── tiny helpers ── */
const validateEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
const validatePhone = (p) => /^\d{10}$/.test(p.replace(/\s/g, ""));
const validateURL   = (u) => { if (!u) return true; try { new URL(u); return true; } catch { return false; } };

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay },
});

/* ── section wrapper ── */
function Section({ title, icon, accent, children, delay = 0 }) {
  return (
    <motion.div {...fadeUp(delay)}>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Header strip */}
        <div className={cn("px-6 py-4 border-b border-gray-100 flex items-center gap-3", accent)}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/70">
            {icon}
          </div>
          <h2 className="font-bold text-sm uppercase tracking-widest text-gray-700">{title}</h2>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </motion.div>
  );
}

/* ── field wrapper ── */
function Field({ label, error, children, span2 = false }) {
  return (
    <div className={cn("space-y-1.5", span2 && "md:col-span-2")}>
      <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</Label>
      {children}
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
          <AlertCircle className="w-3 h-3 shrink-0" />{error}
        </p>
      )}
    </div>
  );
}

/* ── icon input ── */
function IconInput({ icon, error, ...props }) {
  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
        {icon}
      </div>
      <Input
        {...props}
        className={cn(
          "h-11 pl-10 border-gray-200 focus:border-[#12351a] focus:ring-[#12351a]/10 transition-colors",
          error && "border-red-400 focus:border-red-400"
        )}
      />
    </div>
  );
}

/* ════════════════════════════
   MAIN PAGE
════════════════════════════ */
export default function PageSettingsPage() {
  const { fetchPageSettings, updatePageSettings, settings, loading } =
    usePageSettingsStore();

  const [form, setForm] = useState({
    email: "",
    address: "",
    phoneNumbers: [""],
    whatsappNumber: "",
    whatsappCommunityLink: "",
    socialLinks: { instagram: "", facebook: "", youtube: "", twitterX: "" },
    codSettings: { enabled: true, charges: 0 },
  });

  const [saveLoading, setSaveLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchPageSettings();
  }, []);

  useEffect(() => {
    if (settings) {
      setForm({
        email: settings.email || "",
        address: settings.address || "",
        phoneNumbers:
          settings.phoneNumbers?.length > 0 ? settings.phoneNumbers : [""],
        whatsappNumber: settings.whatsappNumber || "",
        whatsappCommunityLink: settings.whatsappCommunityLink || "",
        socialLinks: {
          instagram: settings.socialLinks?.instagram || "",
          facebook: settings.socialLinks?.facebook || "",
          youtube: settings.socialLinks?.youtube || "",
          twitterX: settings.socialLinks?.twitterX || "",
        },
        codSettings: {
          enabled: settings.codSettings?.enabled ?? true,
          charges: settings.codSettings?.charges ?? 0,
        },
      });
    }
  }, [settings]);

  /* ── validation ── */
  const validate = () => {
    const e = {};
    if (form.email && !validateEmail(form.email))
      e.email = "Invalid email format";
    form.phoneNumbers.forEach((p, i) => {
      if (p && !validatePhone(p)) e[`phone_${i}`] = "Must be 10 digits";
    });
    if (form.whatsappNumber && !validatePhone(form.whatsappNumber))
      e.whatsappNumber = "Must be 10 digits";
    if (form.whatsappCommunityLink && !validateURL(form.whatsappCommunityLink))
      e.whatsappCommunityLink = "Invalid URL";
    Object.entries(form.socialLinks).forEach(([k, v]) => {
      if (v && !validateURL(v)) e[`social_${k}`] = "Invalid URL";
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const clearError = (...keys) =>
    setErrors((prev) => {
      const n = { ...prev };
      keys.forEach((k) => delete n[k]);
      return n;
    });

  /* ── phone helpers ── */
  const handlePhoneChange = (i, v) => {
    const p = [...form.phoneNumbers];
    p[i] = v;
    setForm({ ...form, phoneNumbers: p });
    clearError(`phone_${i}`);
  };
  const addPhone = () =>
    setForm({ ...form, phoneNumbers: [...form.phoneNumbers, ""] });
  const removePhone = (i) => {
    if (form.phoneNumbers.length === 1) {
      toast.error("At least one phone number is required");
      return;
    }
    setForm({
      ...form,
      phoneNumbers: form.phoneNumbers.filter((_, idx) => idx !== i),
    });
    clearError(`phone_${i}`);
  };

  /* ── submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fix validation errors");
      return;
    }
    const cleaned = {
      ...form,
      phoneNumbers: form.phoneNumbers.filter((p) => p.trim()),
    };
    if (!cleaned.phoneNumbers.length) {
      toast.error("At least one phone number is required");
      return;
    }
    setSaveLoading(true);
    await updatePageSettings(cleaned);
    setSaveLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-[#12351a]" />
      </div>
    );
  }

  return (
    <div className="space-y-7 max-w-4xl">
      {/* ── Page header ── */}
      <motion.div {...fadeUp(0)}>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#12351a]/60 mb-1">
              Admin
            </p>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
              Page Settings
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Contact info, social links and delivery options
            </p>
          </div>
          {settings && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full">
              <CheckCircle className="w-3.5 h-3.5" />
              Loaded
            </span>
          )}
        </div>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* ── Contact Information ── */}
        <Section
          title="Contact Information"
          delay={0.08}
          accent="bg-blue-50/60"
          icon={<Mail className="w-4 h-4 text-blue-600" />}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Email Address" error={errors.email}>
              <IconInput
                icon={<Mail className="w-4 h-4" />}
                type="email"
                value={form.email}
                onChange={(e) => {
                  setForm({ ...form, email: e.target.value });
                  clearError("email");
                }}
                placeholder="support@paanshala.com"
                error={errors.email}
              />
            </Field>

            <Field label="Business Address" span2 error={null}>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                <Textarea
                  value={form.address}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                  placeholder="Full business address"
                  className="pl-10 min-h-20 border-gray-200 focus:border-[#12351a] resize-none text-sm"
                />
              </div>
            </Field>
          </div>

          {/* Phone numbers */}
          <div className="mt-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Phone Numbers
              </p>
              <button
                type="button"
                onClick={addPhone}
                className="flex items-center gap-1.5 text-xs font-semibold text-[#12351a] hover:text-[#0f2916] transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Number
              </button>
            </div>
            <div className="space-y-2.5">
              {form.phoneNumbers.map((phone, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="flex gap-2"
                >
                  <div className="flex-1">
                    <IconInput
                      icon={<Phone className="w-4 h-4" />}
                      value={phone}
                      onChange={(e) => handlePhoneChange(i, e.target.value)}
                      placeholder="10-digit number"
                      error={errors[`phone_${i}`]}
                    />
                    {errors[`phone_${i}`] && (
                      <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors[`phone_${i}`]}
                      </p>
                    )}
                  </div>
                  {form.phoneNumbers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePhone(i)}
                      className="w-11 h-11 rounded-xl border border-red-200 bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-colors shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </Section>

        {/* ── WhatsApp ── */}
        <Section
          title="WhatsApp"
          delay={0.14}
          accent="bg-green-50/60"
          icon={<MessageCircle className="w-4 h-4 text-green-600" />}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="WhatsApp Number" error={errors.whatsappNumber}>
              <IconInput
                icon={<Phone className="w-4 h-4" />}
                value={form.whatsappNumber}
                onChange={(e) => {
                  setForm({ ...form, whatsappNumber: e.target.value });
                  clearError("whatsappNumber");
                }}
                placeholder="10-digit number"
                error={errors.whatsappNumber}
              />
            </Field>
            <Field label="Community Link" error={errors.whatsappCommunityLink}>
              <IconInput
                icon={<LinkIcon className="w-4 h-4" />}
                value={form.whatsappCommunityLink}
                onChange={(e) => {
                  setForm({ ...form, whatsappCommunityLink: e.target.value });
                  clearError("whatsappCommunityLink");
                }}
                placeholder="https://chat.whatsapp.com/…"
                error={errors.whatsappCommunityLink}
              />
            </Field>
          </div>
        </Section>

        {/* ── Social Links ── */}
        <Section
          title="Social Media"
          delay={0.2}
          accent="bg-purple-50/60"
          icon={<Globe className="w-4 h-4 text-purple-600" />}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              {
                key: "instagram",
                label: "Instagram",
                icon: <Instagram className="w-4 h-4" />,
                ph: "https://instagram.com/paanshala",
              },
              {
                key: "facebook",
                label: "Facebook",
                icon: <Facebook className="w-4 h-4" />,
                ph: "https://facebook.com/paanshala",
              },
              {
                key: "youtube",
                label: "YouTube",
                icon: <Youtube className="w-4 h-4" />,
                ph: "https://youtube.com/@paanshala",
              },
              {
                key: "twitterX",
                label: "Twitter / X",
                icon: <Twitter className="w-4 h-4" />,
                ph: "https://twitter.com/paanshala",
              },
            ].map(({ key, label, icon, ph }) => (
              <Field key={key} label={label} error={errors[`social_${key}`]}>
                <IconInput
                  icon={icon}
                  value={form.socialLinks[key]}
                  onChange={(e) => {
                    setForm({
                      ...form,
                      socialLinks: {
                        ...form.socialLinks,
                        [key]: e.target.value,
                      },
                    });
                    clearError(`social_${key}`);
                  }}
                  placeholder={ph}
                  error={errors[`social_${key}`]}
                />
              </Field>
            ))}
          </div>
        </Section>

        {/* ── COD ── */}
        <Section
          title="Cash on Delivery"
          delay={0.26}
          accent="bg-amber-50/60"
          icon={<Settings className="w-4 h-4 text-amber-600" />}
        >
          <div className="flex flex-col sm:flex-row gap-5">
            {/* Toggle */}
            <div
              onClick={() =>
                setForm({
                  ...form,
                  codSettings: {
                    ...form.codSettings,
                    enabled: !form.codSettings.enabled,
                  },
                })
              }
              className={cn(
                "flex items-center gap-4 flex-1 px-5 py-4 rounded-xl border-2 cursor-pointer transition-all select-none",
                form.codSettings.enabled
                  ? "border-[#12351a]/30 bg-[#12351a]/5"
                  : "border-gray-200 bg-gray-50 hover:border-gray-300",
              )}
            >
              <div
                className={cn(
                  "w-10 h-6 rounded-full relative transition-colors shrink-0",
                  form.codSettings.enabled ? "bg-[#12351a]" : "bg-gray-300",
                )}
              >
                <div
                  className={cn(
                    "absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all",
                    form.codSettings.enabled ? "left-5" : "left-1",
                  )}
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {form.codSettings.enabled ? "COD Enabled" : "COD Disabled"}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Allow cash on delivery orders
                </p>
              </div>
            </div>

            {/* Charges */}
            <div className="flex-1 space-y-1.5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                COD Charges (₹)
              </p>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-sm pointer-events-none">
                  ₹
                </span>
                <Input
                  type="number"
                  min="0"
                  value={form.codSettings.charges}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      codSettings: {
                        ...form.codSettings,
                        charges: Number(e.target.value),
                      },
                    })
                  }
                  className="h-11 pl-8 border-gray-200 focus:border-[#12351a] font-semibold"
                  placeholder="0"
                />
              </div>
              <p className="text-xs text-gray-400">
                Extra fee added to COD orders
              </p>
            </div>
          </div>
        </Section>

        {/* ── Save ── */}
        <motion.div {...fadeUp(0.32)} className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saveLoading || loading}
            className={cn(
              "inline-flex items-center gap-2.5 px-8 py-3 rounded-xl font-bold text-sm text-white",
              "bg-[#12351a] hover:bg-[#0f2916] shadow-lg shadow-[#12351a]/20 transition-all",
              "disabled:opacity-60 disabled:cursor-not-allowed hover:shadow-xl hover:scale-[1.01]",
            )}
          >
            {saveLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Settings
              </>
            )}
          </button>
        </motion.div>
      </form>
    </div>
  );
}