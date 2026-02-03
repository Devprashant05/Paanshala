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

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export default function PageSettingsPage() {
  const { fetchPageSettings, updatePageSettings, settings, loading } =
    usePageSettingsStore();

  const [form, setForm] = useState({
    email: "",
    address: "",
    phoneNumbers: [""],
    whatsappNumber: "",
    whatsappCommunityLink: "",
    socialLinks: {
      instagram: "",
      facebook: "",
      youtube: "",
      twitterX: "",
    },
  });

  const [saveLoading, setSaveLoading] = useState(false);
  const [errors, setErrors] = useState({});

  /* ===========================
     INIT DATA
  =========================== */
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
      });
    }
  }, [settings]);

  /* ===========================
     VALIDATION
  =========================== */
  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhone = (phone) => {
    return /^\d{10}$/.test(phone.replace(/\s/g, ""));
  };

  const validateURL = (url) => {
    if (!url) return true; // Empty URLs are okay
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const validate = () => {
    const newErrors = {};

    // Email validation
    if (form.email && !validateEmail(form.email)) {
      newErrors.email = "Invalid email format";
    }

    // Phone numbers validation
    form.phoneNumbers.forEach((phone, index) => {
      if (phone && !validatePhone(phone)) {
        newErrors[`phone_${index}`] = "Must be 10 digits";
      }
    });

    // WhatsApp number validation
    if (form.whatsappNumber && !validatePhone(form.whatsappNumber)) {
      newErrors.whatsappNumber = "Must be 10 digits";
    }

    // URL validations
    if (
      form.whatsappCommunityLink &&
      !validateURL(form.whatsappCommunityLink)
    ) {
      newErrors.whatsappCommunityLink = "Invalid URL format";
    }

    Object.entries(form.socialLinks).forEach(([key, value]) => {
      if (value && !validateURL(value)) {
        newErrors[`social_${key}`] = "Invalid URL format";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ===========================
     HANDLERS
  =========================== */
  const handlePhoneChange = (index, value) => {
    const phones = [...form.phoneNumbers];
    phones[index] = value;
    setForm({ ...form, phoneNumbers: phones });

    // Clear error for this field
    const newErrors = { ...errors };
    delete newErrors[`phone_${index}`];
    setErrors(newErrors);
  };

  const addPhone = () => {
    setForm({ ...form, phoneNumbers: [...form.phoneNumbers, ""] });
  };

  const removePhone = (index) => {
    if (form.phoneNumbers.length === 1) {
      toast.error("At least one phone number is required");
      return;
    }

    setForm({
      ...form,
      phoneNumbers: form.phoneNumbers.filter((_, i) => i !== index),
    });

    // Clear error for this field
    const newErrors = { ...errors };
    delete newErrors[`phone_${index}`];
    setErrors(newErrors);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      toast.error("Please fix validation errors");
      return;
    }

    // Filter out empty phone numbers
    const cleanedForm = {
      ...form,
      phoneNumbers: form.phoneNumbers.filter((p) => p.trim() !== ""),
    };

    if (cleanedForm.phoneNumbers.length === 0) {
      toast.error("At least one phone number is required");
      return;
    }

    setSaveLoading(true);
    await updatePageSettings(cleanedForm);
    setSaveLoading(false);
  };

  /* ===========================
     UI
  =========================== */
  return (
    <div className="space-y-8 max-w-6xl">
      {/* PAGE HEADER */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-4xl lg:text-5xl font-bold text-[#12351a] mb-2">
              Page Settings
            </h1>
            <p className="text-base text-gray-600">
              Manage global contact information and social media links
            </p>
          </div>

          {settings && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 px-4 py-2 rounded-xl">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">
                Settings Loaded
              </span>
            </div>
          )}
        </div>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-[#12351a]" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* CONTACT INFORMATION */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-gray-200 shadow-lg">
              <CardHeader className="border-b border-gray-100 bg-gray-50/50">
                <CardTitle className="text-lg font-semibold flex items-center gap-2.5">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Mail className="w-5 h-5 text-blue-600" />
                  </div>
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Email */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-sm font-medium text-gray-700"
                    >
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        value={form.email}
                        onChange={(e) => {
                          setForm({ ...form, email: e.target.value });
                          const newErrors = { ...errors };
                          delete newErrors.email;
                          setErrors(newErrors);
                        }}
                        placeholder="support@paanshala.com"
                        className={cn(
                          "pl-10 h-11",
                          errors.email && "border-red-400 focus:border-red-400",
                        )}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Address */}
                  <div className="space-y-2 md:col-span-2">
                    <Label
                      htmlFor="address"
                      className="text-sm font-medium text-gray-700"
                    >
                      Business Address
                    </Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Textarea
                        id="address"
                        value={form.address}
                        onChange={(e) =>
                          setForm({ ...form, address: e.target.value })
                        }
                        placeholder="Enter complete business address"
                        className="pl-10 min-h-20"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* PHONE NUMBERS */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-gray-700">
                      Phone Numbers
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addPhone}
                      className="h-9"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Number
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {form.phoneNumbers.map((phone, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex gap-2"
                      >
                        <div className="flex-1">
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                              value={phone}
                              onChange={(e) =>
                                handlePhoneChange(i, e.target.value)
                              }
                              placeholder="10 digit number"
                              className={cn(
                                "pl-10 h-11",
                                errors[`phone_${i}`] && "border-red-400",
                              )}
                            />
                          </div>
                          {errors[`phone_${i}`] && (
                            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              {errors[`phone_${i}`]}
                            </p>
                          )}
                        </div>

                        {form.phoneNumbers.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removePhone(i)}
                            className="text-red-500 hover:text-red-600 hover:bg-red-50 h-11 w-11 shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* WHATSAPP */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-gray-200 shadow-lg">
              <CardHeader className="border-b border-gray-100 bg-gray-50/50">
                <CardTitle className="text-lg font-semibold flex items-center gap-2.5">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <MessageCircle className="w-5 h-5 text-green-600" />
                  </div>
                  WhatsApp
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* WhatsApp Number */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="whatsapp"
                      className="text-sm font-medium text-gray-700"
                    >
                      WhatsApp Number
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="whatsapp"
                        value={form.whatsappNumber}
                        onChange={(e) => {
                          setForm({ ...form, whatsappNumber: e.target.value });
                          const newErrors = { ...errors };
                          delete newErrors.whatsappNumber;
                          setErrors(newErrors);
                        }}
                        placeholder="10 digit number"
                        className={cn(
                          "pl-10 h-11",
                          errors.whatsappNumber && "border-red-400",
                        )}
                      />
                    </div>
                    {errors.whatsappNumber && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.whatsappNumber}
                      </p>
                    )}
                  </div>

                  {/* WhatsApp Community Link */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="whatsapp_community"
                      className="text-sm font-medium text-gray-700"
                    >
                      WhatsApp Community Link
                    </Label>
                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="whatsapp_community"
                        value={form.whatsappCommunityLink}
                        onChange={(e) => {
                          setForm({
                            ...form,
                            whatsappCommunityLink: e.target.value,
                          });
                          const newErrors = { ...errors };
                          delete newErrors.whatsappCommunityLink;
                          setErrors(newErrors);
                        }}
                        placeholder="https://chat.whatsapp.com/..."
                        className={cn(
                          "pl-10 h-11",
                          errors.whatsappCommunityLink && "border-red-400",
                        )}
                      />
                    </div>
                    {errors.whatsappCommunityLink && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.whatsappCommunityLink}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* SOCIAL LINKS */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-gray-200 shadow-lg">
              <CardHeader className="border-b border-gray-100 bg-gray-50/50">
                <CardTitle className="text-lg font-semibold flex items-center gap-2.5">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Globe className="w-5 h-5 text-purple-600" />
                  </div>
                  Social Media Links
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Instagram */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="instagram"
                      className="text-sm font-medium text-gray-700"
                    >
                      Instagram
                    </Label>
                    <div className="relative">
                      <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="instagram"
                        placeholder="https://instagram.com/paanshala"
                        value={form.socialLinks.instagram}
                        onChange={(e) => {
                          setForm({
                            ...form,
                            socialLinks: {
                              ...form.socialLinks,
                              instagram: e.target.value,
                            },
                          });
                          const newErrors = { ...errors };
                          delete newErrors.social_instagram;
                          setErrors(newErrors);
                        }}
                        className={cn(
                          "pl-10 h-11",
                          errors.social_instagram && "border-red-400",
                        )}
                      />
                    </div>
                    {errors.social_instagram && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.social_instagram}
                      </p>
                    )}
                  </div>

                  {/* Facebook */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="facebook"
                      className="text-sm font-medium text-gray-700"
                    >
                      Facebook
                    </Label>
                    <div className="relative">
                      <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="facebook"
                        placeholder="https://facebook.com/paanshala"
                        value={form.socialLinks.facebook}
                        onChange={(e) => {
                          setForm({
                            ...form,
                            socialLinks: {
                              ...form.socialLinks,
                              facebook: e.target.value,
                            },
                          });
                          const newErrors = { ...errors };
                          delete newErrors.social_facebook;
                          setErrors(newErrors);
                        }}
                        className={cn(
                          "pl-10 h-11",
                          errors.social_facebook && "border-red-400",
                        )}
                      />
                    </div>
                    {errors.social_facebook && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.social_facebook}
                      </p>
                    )}
                  </div>

                  {/* YouTube */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="youtube"
                      className="text-sm font-medium text-gray-700"
                    >
                      YouTube
                    </Label>
                    <div className="relative">
                      <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="youtube"
                        placeholder="https://youtube.com/@paanshala"
                        value={form.socialLinks.youtube}
                        onChange={(e) => {
                          setForm({
                            ...form,
                            socialLinks: {
                              ...form.socialLinks,
                              youtube: e.target.value,
                            },
                          });
                          const newErrors = { ...errors };
                          delete newErrors.social_youtube;
                          setErrors(newErrors);
                        }}
                        className={cn(
                          "pl-10 h-11",
                          errors.social_youtube && "border-red-400",
                        )}
                      />
                    </div>
                    {errors.social_youtube && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.social_youtube}
                      </p>
                    )}
                  </div>

                  {/* Twitter / X */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="twitter"
                      className="text-sm font-medium text-gray-700"
                    >
                      Twitter / X
                    </Label>
                    <div className="relative">
                      <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="twitter"
                        placeholder="https://twitter.com/paanshala"
                        value={form.socialLinks.twitterX}
                        onChange={(e) => {
                          setForm({
                            ...form,
                            socialLinks: {
                              ...form.socialLinks,
                              twitterX: e.target.value,
                            },
                          });
                          const newErrors = { ...errors };
                          delete newErrors.social_twitterX;
                          setErrors(newErrors);
                        }}
                        className={cn(
                          "pl-10 h-11",
                          errors.social_twitterX && "border-red-400",
                        )}
                      />
                    </div>
                    {errors.social_twitterX && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.social_twitterX}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* SAVE BUTTON */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex justify-end gap-3"
          >
            <Button
              type="submit"
              disabled={saveLoading || loading}
              className="bg-[#12351a] hover:bg-[#0f2916] h-12 px-8"
            >
              {saveLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </motion.div>
        </form>
      )}
    </div>
  );
}
