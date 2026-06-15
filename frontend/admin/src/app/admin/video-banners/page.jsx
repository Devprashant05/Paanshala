"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Video,
  Plus,
  Edit,
  Trash2,
  Power,
  Loader2,
  AlertTriangle,
  Upload,
  CheckCircle,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Eye,
  ImageIcon,
  Smartphone,
  Monitor,
  Type,
  Palette,
} from "lucide-react";
import toast from "react-hot-toast";

import { useVideoBannerStore } from "@/stores/useVideoBannerStore";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
import { cn } from "@/lib/utils";

/* ===========================
   CONSTANTS
=========================== */
const FONT_SIZES = [
  { label: "XS", value: "12px" },
  { label: "SM", value: "16px" },
  { label: "MD", value: "20px" },
  { label: "LG", value: "28px" },
  { label: "XL", value: "36px" },
  { label: "2XL", value: "48px" },
  { label: "3XL", value: "64px" },
];

const COLOR_PALETTE = [
  // Neutrals
  { label: "White", value: "#ffffff" },
  { label: "Off White", value: "#f5f5f0" },
  { label: "Light Gray", value: "#d1d5db" },
  { label: "Gray", value: "#6b7280" },
  { label: "Dark Gray", value: "#374151" },
  { label: "Black", value: "#000000" },
  // Greens (brand)
  { label: "Brand Dark", value: "#12351a" },
  { label: "Forest", value: "#1a5c28" },
  { label: "Emerald", value: "#10b981" },
  { label: "Mint", value: "#a7f3d0" },
  // Warm
  { label: "Gold", value: "#f59e0b" },
  { label: "Amber", value: "#d97706" },
  { label: "Orange", value: "#f97316" },
  { label: "Red", value: "#ef4444" },
  { label: "Rose", value: "#f43f5e" },
  // Cool
  { label: "Sky", value: "#38bdf8" },
  { label: "Blue", value: "#3b82f6" },
  { label: "Indigo", value: "#6366f1" },
  { label: "Purple", value: "#a855f7" },
  { label: "Pink", value: "#ec4899" },
  // Earth
  { label: "Cream", value: "#fef9c3" },
  { label: "Sand", value: "#fde68a" },
  { label: "Warm Beige", value: "#fef3c7" },
  { label: "Brown", value: "#92400e" },
];

const DEFAULT_FORM = {
  title: "",
  description: "",
  order: "0",
  type: "video",
  bannerFile: null,
  mobileFile: null,
  titleStyle: { fontSize: "32px", color: "#ffffff" },
  descriptionStyle: { fontSize: "16px", color: "#ffffff" },
};

/* ===========================
   COLOR PICKER COMPONENT
=========================== */
function ColorPicker({ label, value, onChange }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium text-gray-600">{label}</Label>
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-full border-2 border-gray-300 shadow-sm shrink-0"
            style={{ backgroundColor: value }}
          />
          <Input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-7 w-28 text-xs font-mono px-2"
            placeholder="#ffffff"
          />
        </div>
      </div>
      <div className="grid grid-cols-12 gap-1">
        {COLOR_PALETTE.map((color) => (
          <button
            key={color.value}
            type="button"
            title={color.label}
            onClick={() => onChange(color.value)}
            className={cn(
              "w-6 h-6 rounded-full border-2 transition-all hover:scale-110",
              value === color.value
                ? "border-[#12351a] scale-110 shadow-md"
                : "border-transparent hover:border-gray-400",
            )}
            style={{ backgroundColor: color.value }}
          />
        ))}
      </div>
    </div>
  );
}

/* ===========================
   FONT SIZE PICKER COMPONENT
=========================== */
function FontSizePicker({ label, value, onChange }) {
  return (
    <div className="space-y-2">
      <Label className="text-xs font-medium text-gray-600">{label}</Label>
      <div className="flex flex-wrap gap-1.5">
        {FONT_SIZES.map((size) => (
          <button
            key={size.value}
            type="button"
            onClick={() => onChange(size.value)}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-semibold border-2 transition-all",
              value === size.value
                ? "border-[#12351a] bg-[#12351a] text-white"
                : "border-gray-200 text-gray-600 hover:border-[#12351a]",
            )}
          >
            {size.label}
            <span className="ml-1 opacity-60 font-normal">{size.value}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ===========================
   TEXT STYLE SECTION
=========================== */
function TextStyleSection({ form, setForm }) {
  // Only show if title or description is filled
  const hasText = form.title || form.description;

  if (!hasText) return null;

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
      <div className="flex items-center gap-2 mb-1">
        <Palette className="w-4 h-4 text-[#12351a]" />
        <span className="text-sm font-semibold text-gray-800">
          Text Styling
        </span>
      </div>

      {/* Live preview */}
      <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-gray-900 min-h-20 flex flex-col items-center justify-center p-4 gap-1">
        <span className="absolute top-2 left-3 text-[10px] text-gray-500 uppercase tracking-widest">
          Preview
        </span>
        {form.title && (
          <p
            style={{
              fontSize: form.titleStyle.fontSize,
              color: form.titleStyle.color,
              lineHeight: 1.2,
            }}
            className="font-bold text-center"
          >
            {form.title}
          </p>
        )}
        {form.description && (
          <p
            style={{
              fontSize: form.descriptionStyle.fontSize,
              color: form.descriptionStyle.color,
            }}
            className="text-center"
          >
            {form.description}
          </p>
        )}
      </div>

      {/* Title styling */}
      {form.title && (
        <div className="space-y-3 pt-1">
          <div className="flex items-center gap-1.5">
            <Type className="w-3.5 h-3.5 text-gray-500" />
            <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
              Title
            </span>
          </div>
          <FontSizePicker
            label="Font Size"
            value={form.titleStyle.fontSize}
            onChange={(v) =>
              setForm((prev) => ({
                ...prev,
                titleStyle: { ...prev.titleStyle, fontSize: v },
              }))
            }
          />
          <ColorPicker
            label="Color"
            value={form.titleStyle.color}
            onChange={(v) =>
              setForm((prev) => ({
                ...prev,
                titleStyle: { ...prev.titleStyle, color: v },
              }))
            }
          />
        </div>
      )}

      {/* Description styling */}
      {form.description && (
        <div className="space-y-3 pt-2 border-t border-gray-200">
          <div className="flex items-center gap-1.5">
            <Type className="w-3.5 h-3.5 text-gray-500" />
            <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
              Description
            </span>
          </div>
          <FontSizePicker
            label="Font Size"
            value={form.descriptionStyle.fontSize}
            onChange={(v) =>
              setForm((prev) => ({
                ...prev,
                descriptionStyle: { ...prev.descriptionStyle, fontSize: v },
              }))
            }
          />
          <ColorPicker
            label="Color"
            value={form.descriptionStyle.color}
            onChange={(v) =>
              setForm((prev) => ({
                ...prev,
                descriptionStyle: { ...prev.descriptionStyle, color: v },
              }))
            }
          />
        </div>
      )}
    </div>
  );
}

/* ===========================
   BANNER FORM FIELDS (shared between Create & Edit)
=========================== */
function BannerFormFields({
  form,
  setForm,
  errors,
  isEdit = false,
  bannerToEdit = null,
}) {
  const [bannerPreview, setBannerPreview] = useState(null);
  const [mobilePreview, setMobilePreview] = useState(null);

  const handleBannerFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (form.type === "video") {
      if (!file.type.startsWith("video/"))
        return toast.error("Select a valid video file");
      if (file.size > 50 * 1024 * 1024)
        return toast.error("Video must be under 50MB");
    } else {
      if (!file.type.startsWith("image/"))
        return toast.error("Select a valid image file");
      if (file.size > 10 * 1024 * 1024)
        return toast.error("Image must be under 10MB");
    }

    setForm((prev) => ({ ...prev, bannerFile: file }));
    setBannerPreview(URL.createObjectURL(file));
  };

  const handleMobileFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/"))
      return toast.error("Mobile banner must be an image");
    if (file.size > 10 * 1024 * 1024)
      return toast.error("Image must be under 10MB");

    setForm((prev) => ({ ...prev, mobileFile: file }));
    setMobilePreview(URL.createObjectURL(file));
  };

  return (
    <>
      {/* Title */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Title</Label>
        <Input
          value={form.title}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, title: e.target.value }))
          }
          placeholder="e.g., Summer Collection 2024"
          className="h-11"
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Description</Label>
        <Textarea
          value={form.description}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, description: e.target.value }))
          }
          placeholder="Brief description of the banner"
          className="min-h-20"
        />
      </div>

      {/* Text Styling — appears only when title/description filled */}
      <TextStyleSection form={form} setForm={setForm} />

      {/* Banner Type — only on create */}
      {!isEdit && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Banner Type *</Label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: "video", label: "Video", icon: Video },
              { value: "image", label: "Image", icon: ImageIcon },
            ].map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    type: value,
                    bannerFile: null,
                  }))
                }
                className={cn(
                  "flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 font-semibold transition-all",
                  form.type === value
                    ? "border-[#12351a] bg-[#12351a] text-white"
                    : "border-gray-300 text-gray-600 hover:border-[#12351a]",
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Primary File Upload */}
      <div className="space-y-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
        <div className="flex items-center gap-2">
          <Monitor className="w-4 h-4 text-blue-600" />
          <Label className="text-sm font-semibold text-blue-800">
            Desktop / Landscape {isEdit ? "(Optional — replaces current)" : "*"}
          </Label>
        </div>
        <Input
          type="file"
          accept={form.type === "video" ? "video/*" : "image/*"}
          onChange={handleBannerFile}
          className={cn("h-11 bg-white", errors.bannerFile && "border-red-400")}
        />
        <p className="text-xs text-blue-600">
          {form.type === "video"
            ? "Recommended: 1920×1080px MP4 H.264 · Max 50MB"
            : "Recommended: 1920×1080px WebP/JPG · Max 10MB"}
        </p>
        {errors.bannerFile && (
          <p className="text-xs text-red-500 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> {errors.bannerFile}
          </p>
        )}

        {/* Desktop preview */}
        {bannerPreview && (
          <div className="rounded-lg overflow-hidden border-2 border-blue-200">
            {form.type === "video" ? (
              <video
                src={bannerPreview}
                controls
                className="w-full max-h-48 bg-black"
              />
            ) : (
              <img
                src={bannerPreview}
                alt="Desktop preview"
                className="w-full max-h-48 object-cover"
              />
            )}
          </div>
        )}

        {/* Existing desktop preview on edit */}
        {isEdit && !bannerPreview && bannerToEdit && (
          <div className="rounded-lg overflow-hidden border border-blue-200 opacity-60">
            <p className="text-xs text-center text-blue-500 py-1">Current</p>
            {bannerToEdit.type === "video" ? (
              <video
                src={bannerToEdit.videoUrl}
                controls
                className="w-full max-h-40 bg-black object-contain"
              />
            ) : (
              <img
                src={bannerToEdit.imageUrl}
                alt="Current"
                className="w-full max-h-40 object-cover"
              />
            )}
          </div>
        )}
      </div>

      {/* Mobile File Upload — only for image banners */}
      {form.type === "image" && (
        <div className="space-y-3 p-4 bg-purple-50 rounded-xl border border-purple-100">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-purple-600" />
            <Label className="text-sm font-semibold text-purple-800">
              Mobile / Portrait (Optional)
            </Label>
          </div>
          <p className="text-xs text-purple-600">
            Shown on screens ≤ 768px. Recommended: 768×1024px or 9:16 ratio.
          </p>
          <Input
            type="file"
            accept="image/*"
            onChange={handleMobileFile}
            className="h-11 bg-white"
          />
          <p className="text-xs text-gray-500">Max 10MB · PNG, JPG, WebP</p>

          {/* Mobile preview */}
          {mobilePreview && (
            <div className="flex justify-center">
              <div className="w-40 rounded-xl overflow-hidden border-2 border-purple-200">
                <img
                  src={mobilePreview}
                  alt="Mobile preview"
                  className="w-full object-cover"
                />
              </div>
            </div>
          )}

          {/* Existing mobile preview on edit */}
          {isEdit && !mobilePreview && bannerToEdit?.mobileImageUrl && (
            <div className="flex justify-center">
              <div className="w-40 rounded-xl overflow-hidden border border-purple-200 opacity-60">
                <p className="text-xs text-center text-purple-500 py-1">
                  Current
                </p>
                <img
                  src={bannerToEdit.mobileImageUrl}
                  alt="Current mobile"
                  className="w-full object-cover"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Display Order */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Display Order</Label>
        <Input
          type="number"
          min="0"
          value={form.order}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, order: e.target.value }))
          }
          className="h-11"
        />
        <p className="text-xs text-gray-500">
          Lower numbers appear first (0, 1, 2…)
        </p>
      </div>
    </>
  );
}

/* ===========================
   MAIN PAGE
=========================== */
export default function AdminVideoBannersPage() {
  const {
    banners,
    fetchBanners,
    createBanner,
    updateBanner,
    toggleBanner,
    deleteBanner,
    loading,
  } = useVideoBannerStore();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [bannerToEdit, setBannerToEdit] = useState(null);
  const [bannerToDelete, setBannerToDelete] = useState(null);

  const [form, setForm] = useState(DEFAULT_FORM);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchBanners();
  }, []);

  const stats = {
    total: banners.length,
    active: banners.filter((b) => b.isActive).length,
    videos: banners.filter((b) => b.type === "video").length,
    images: banners.filter((b) => b.type === "image").length,
  };

  /* ── Validation ─────────────────── */
  const validate = (isEdit = false) => {
    const errs = {};
    if (!isEdit && !form.bannerFile)
      errs.bannerFile = "Banner file is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  /* ── Build FormData ─────────────── */
  const buildFormData = () => {
    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("description", form.description);
    fd.append("order", form.order);
    fd.append("type", form.type);
    fd.append("titleStyle", JSON.stringify(form.titleStyle));
    fd.append("descriptionStyle", JSON.stringify(form.descriptionStyle));
    if (form.bannerFile) fd.append("bannerFile", form.bannerFile);
    if (form.mobileFile) fd.append("mobileFile", form.mobileFile);
    return fd;
  };

  /* ── Create ─────────────────────── */
  const handleCreateBanner = async (e) => {
    e.preventDefault();
    if (!validate(false)) return toast.error("Please fix validation errors");

    setSubmitLoading(true);
    const ok = await createBanner(buildFormData());
    if (ok) {
      resetForm();
      setShowCreateDialog(false);
      await fetchBanners();
    }
    setSubmitLoading(false);
  };

  /* ── Edit ───────────────────────── */
  const openEditDialog = (banner) => {
    setBannerToEdit(banner);
    setForm({
      title: banner.title || "",
      description: banner.description || "",
      order: banner.order.toString(),
      type: banner.type,
      bannerFile: null,
      mobileFile: null,
      titleStyle: banner.titleStyle || { fontSize: "32px", color: "#ffffff" },
      descriptionStyle: banner.descriptionStyle || {
        fontSize: "16px",
        color: "#ffffff",
      },
    });
    setErrors({});
    setShowEditDialog(true);
  };

  const handleEditBanner = async (e) => {
    e.preventDefault();
    if (!validate(true)) return;

    setSubmitLoading(true);
    const ok = await updateBanner(bannerToEdit._id, buildFormData());
    if (ok) {
      resetForm();
      setShowEditDialog(false);
      setBannerToEdit(null);
      await fetchBanners();
    }
    setSubmitLoading(false);
  };

  /* ── Delete ─────────────────────── */
  const openDeleteDialog = (banner) => {
    setBannerToDelete(banner);
    setShowDeleteDialog(true);
  };
  const handleDeleteBanner = async () => {
    if (!bannerToDelete) return;
    setSubmitLoading(true);
    const ok = await deleteBanner(bannerToDelete._id);
    if (ok) {
      setShowDeleteDialog(false);
      setBannerToDelete(null);
      await fetchBanners();
    }
    setSubmitLoading(false);
  };

  /* ── Toggle / Reorder ───────────── */
  const handleToggleStatus = async (banner) => {
    const ok = await toggleBanner(banner._id, !banner.isActive);
    if (ok) await fetchBanners();
  };

  const handleMoveUp = async (banner, index) => {
    if (index === 0) return;
    const prev = banners[index - 1];
    await updateBanner(banner._id, { order: prev.order });
    await updateBanner(prev._id, { order: banner.order });
    await fetchBanners();
  };

  const handleMoveDown = async (banner, index) => {
    if (index === banners.length - 1) return;
    const next = banners[index + 1];
    await updateBanner(banner._id, { order: next.order });
    await updateBanner(next._id, { order: banner.order });
    await fetchBanners();
  };

  /* ── Reset ──────────────────────── */
  const resetForm = () => {
    setForm(DEFAULT_FORM);
    setErrors({});
  };

  /* ── Shared dialog footer ───────── */
  const FormFooter = ({ onCancel, submitLabel, submitIcon: Icon }) => (
    <DialogFooter className="gap-2 sm:gap-2 pt-2">
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
            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...
          </>
        ) : (
          <>
            <Icon className="w-4 h-4 mr-2" /> {submitLabel}
          </>
        )}
      </Button>
    </DialogFooter>
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* PAGE HEADER */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-4xl lg:text-5xl font-bold text-[#12351a] mb-2">
              Homepage Banners
            </h1>
            <p className="text-base text-gray-600">
              Manage homepage banners (videos & images) and their display order
            </p>
          </div>
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="bg-[#12351a] hover:bg-[#0f2916] h-11 px-6"
          >
            <Plus className="w-4 h-4 mr-2" /> Create Banner
          </Button>
        </div>
      </motion.div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Banners"
          value={stats.total}
          icon={Video}
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
          title="Videos"
          value={stats.videos}
          icon={Video}
          color="blue"
          delay={0.2}
        />
        <StatCard
          title="Images"
          value={stats.images}
          icon={ImageIcon}
          color="purple"
          delay={0.3}
        />
      </div>

      {/* BANNERS LIST */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="border-gray-200 shadow-lg">
          <CardHeader className="border-b border-gray-100 bg-gray-50/50">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Video className="w-5 h-5 text-[#12351a]" />
              All Banners ({banners.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-[#12351a]" />
              </div>
            ) : banners.length === 0 ? (
              <div className="text-center py-16">
                <Video className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No banners yet
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Create your first banner to get started
                </p>
                <Button
                  onClick={() => setShowCreateDialog(true)}
                  className="bg-[#12351a] hover:bg-[#0f2916]"
                >
                  <Plus className="w-4 h-4 mr-2" /> Create First Banner
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence>
                  {banners.map((banner, index) => (
                    <motion.div
                      key={banner._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <BannerCard
                        banner={banner}
                        index={index}
                        totalBanners={banners.length}
                        onEdit={openEditDialog}
                        onDelete={openDeleteDialog}
                        onToggleStatus={handleToggleStatus}
                        onMoveUp={handleMoveUp}
                        onMoveDown={handleMoveDown}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* CREATE DIALOG */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-blue-100 rounded-full">
                <Upload className="w-6 h-6 text-blue-600" />
              </div>
              <DialogTitle className="text-2xl">Upload New Banner</DialogTitle>
            </div>
            <p className="text-sm text-gray-600">
              Add a new video or image banner to your homepage
            </p>
          </DialogHeader>

          <form onSubmit={handleCreateBanner} className="space-y-6 pt-4">
            <BannerFormFields form={form} setForm={setForm} errors={errors} />
            <FormFooter
              onCancel={() => {
                setShowCreateDialog(false);
                resetForm();
              }}
              submitLabel="Upload Banner"
              submitIcon={Upload}
            />
          </form>
        </DialogContent>
      </Dialog>

      {/* EDIT DIALOG */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-amber-100 rounded-full">
                <Edit className="w-6 h-6 text-amber-600" />
              </div>
              <DialogTitle className="text-2xl">Edit Banner</DialogTitle>
            </div>
            <p className="text-sm text-gray-600">
              Update banner details and settings
            </p>
          </DialogHeader>

          {/* Type badge */}
          {bannerToEdit && (
            <Badge
              className={cn(
                "w-fit text-white",
                bannerToEdit.type === "video" ? "bg-blue-600" : "bg-purple-600",
              )}
            >
              {bannerToEdit.type === "video" ? (
                <>
                  <Video className="w-3 h-3 mr-1" /> Video
                </>
              ) : (
                <>
                  <ImageIcon className="w-3 h-3 mr-1" /> Image
                </>
              )}
            </Badge>
          )}

          <form onSubmit={handleEditBanner} className="space-y-6 pt-2">
            <BannerFormFields
              form={form}
              setForm={setForm}
              errors={errors}
              isEdit
              bannerToEdit={bannerToEdit}
            />
            <FormFooter
              onCancel={() => {
                setShowEditDialog(false);
                setBannerToEdit(null);
                resetForm();
              }}
              submitLabel="Update Banner"
              submitIcon={Edit}
            />
          </form>
        </DialogContent>
      </Dialog>

      {/* DELETE DIALOG */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="max-w-lg">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <AlertDialogTitle className="text-2xl">
                Delete Banner?
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-base space-y-4 pt-2">
              <p className="text-gray-700">
                Are you sure you want to delete this banner
                {bannerToDelete?.title && (
                  <span className="font-semibold">
                    {" "}
                    "{bannerToDelete.title}"
                  </span>
                )}
                ?
              </p>
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-800">
                  <strong>Warning:</strong> This action cannot be undone. The{" "}
                  {bannerToDelete?.type === "video" ? "video" : "image"} will be
                  permanently deleted from storage.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-2">
            <AlertDialogCancel
              onClick={() => {
                setShowDeleteDialog(false);
                setBannerToDelete(null);
              }}
              disabled={submitLoading}
              className="h-11"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteBanner}
              disabled={submitLoading}
              className="bg-red-600 hover:bg-red-700 h-11"
            >
              {submitLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" /> Delete Banner
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
   BANNER CARD COMPONENT
=========================== */
function BannerCard({
  banner,
  index,
  totalBanners,
  onEdit,
  onDelete,
  onToggleStatus,
  onMoveUp,
  onMoveDown,
}) {
  return (
    <Card className="border-gray-200 shadow-md hover:shadow-lg transition-all overflow-hidden">
      <div className="flex flex-col lg:flex-row gap-4 p-4">
        {/* Preview */}
        <div className="lg:w-80 shrink-0 space-y-2">
          {/* Desktop preview */}
          <div className="relative rounded-lg overflow-hidden border-2 border-gray-200 bg-black">
            {banner.type === "video" ? (
              <video
                src={banner.videoUrl}
                controls
                className="w-full h-40 object-contain"
              />
            ) : (
              <img
                src={banner.imageUrl}
                alt={banner.title}
                className="w-full h-40 object-cover"
              />
            )}
            <div className="absolute top-2 left-2">
              <Badge className="bg-black/60 text-white border-0 text-[10px]">
                <Monitor className="w-2.5 h-2.5 mr-1" /> Desktop
              </Badge>
            </div>
            {banner.isActive && (
              <div className="absolute top-2 right-2">
                <Badge className="bg-emerald-500 text-white border-0 shadow-md">
                  <Eye className="w-3 h-3 mr-1" /> Active
                </Badge>
              </div>
            )}
          </div>

          {/* Mobile preview (if exists) */}
          {banner.mobileImageUrl && (
            <div className="flex items-center gap-2">
              <div className="relative w-16 rounded-lg overflow-hidden border-2 border-purple-200 bg-black shrink-0">
                <img
                  src={banner.mobileImageUrl}
                  alt="Mobile"
                  className="w-full object-cover"
                />
                <div className="absolute top-1 left-1">
                  <Badge className="bg-purple-600/80 text-white border-0 text-[8px] px-1 py-0">
                    <Smartphone className="w-2 h-2" />
                  </Badge>
                </div>
              </div>
              <p className="text-xs text-purple-600 font-medium">
                Mobile version set
              </p>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col">
          <div className="mb-4">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <h3
                    className="text-lg font-bold text-gray-900"
                    style={
                      banner.titleStyle
                        ? {
                            color: banner.titleStyle.color,
                            // show styled color as a swatch hint, not full inline size
                          }
                        : {}
                    }
                  >
                    {banner.title || "Untitled Banner"}
                  </h3>
                  <Badge
                    className={cn(
                      "text-white",
                      banner.type === "video" ? "bg-blue-600" : "bg-purple-600",
                    )}
                  >
                    {banner.type === "video" ? (
                      <>
                        <Video className="w-3 h-3 mr-1" /> Video
                      </>
                    ) : (
                      <>
                        <ImageIcon className="w-3 h-3 mr-1" /> Image
                      </>
                    )}
                  </Badge>
                  {banner.mobileImageUrl && (
                    <Badge className="bg-purple-100 text-purple-700 border border-purple-200">
                      <Smartphone className="w-3 h-3 mr-1" /> Mobile
                    </Badge>
                  )}
                </div>

                {banner.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {banner.description}
                  </p>
                )}

                {/* Style preview chips */}
                {(banner.titleStyle || banner.descriptionStyle) && (
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {banner.titleStyle && (
                      <div className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-600">
                        <div
                          className="w-3 h-3 rounded-full border border-gray-300"
                          style={{ backgroundColor: banner.titleStyle.color }}
                        />
                        Title: {banner.titleStyle.fontSize}
                      </div>
                    )}
                    {banner.descriptionStyle && (
                      <div className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-600">
                        <div
                          className="w-3 h-3 rounded-full border border-gray-300"
                          style={{
                            backgroundColor: banner.descriptionStyle.color,
                          }}
                        />
                        Desc: {banner.descriptionStyle.fontSize}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <Badge variant="outline" className="shrink-0">
                Order: {banner.order}
              </Badge>
            </div>

            {!banner.isActive && (
              <Badge variant="secondary" className="mt-2">
                <EyeOff className="w-3 h-3 mr-1" /> Inactive
              </Badge>
            )}
          </div>

          {/* Actions */}
          <div className="mt-auto grid grid-cols-2 md:grid-cols-4 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(banner)}
              className="h-9"
            >
              <Edit className="w-3 h-3 mr-1.5" /> Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onToggleStatus(banner)}
              className={cn(
                "h-9",
                banner.isActive
                  ? "bg-amber-50 border-amber-300"
                  : "bg-emerald-50 border-emerald-300",
              )}
            >
              <Power className="w-3 h-3 mr-1.5" />
              {banner.isActive ? "Deactivate" : "Activate"}
            </Button>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onMoveUp(banner, index)}
                disabled={index === 0}
                className="h-9 flex-1"
              >
                <ArrowUp className="w-3 h-3" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onMoveDown(banner, index)}
                disabled={index === totalBanners - 1}
                className="h-9 flex-1"
              >
                <ArrowDown className="w-3 h-3" />
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(banner)}
              className="text-red-500 hover:text-red-600 hover:bg-red-50 h-9"
            >
              <Trash2 className="w-3 h-3 mr-1.5" /> Delete
            </Button>
          </div>
        </div>
      </div>
    </Card>
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
    purple: {
      iconBg: "bg-purple-100",
      icon: "text-purple-600",
      border: "border-purple-200",
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
