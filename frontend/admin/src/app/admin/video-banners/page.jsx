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
  Play,
  CheckCircle,
  XCircle,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  ImageIcon,
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

  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [bannerToEdit, setBannerToEdit] = useState(null);
  const [bannerToDelete, setBannerToDelete] = useState(null);

  // Form state
  const [form, setForm] = useState({
    title: "",
    description: "",
    order: "0",
    type: "video",
    file: null,
  });

  const [filePreview, setFilePreview] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [errors, setErrors] = useState({});

  /* ===========================
     INIT
  =========================== */
  useEffect(() => {
    fetchBanners();
  }, []);

  /* ===========================
     STATS CALCULATION
  =========================== */
  const stats = {
    total: banners.length,
    active: banners.filter((b) => b.isActive).length,
    inactive: banners.filter((b) => !b.isActive).length,
    videos: banners.filter((b) => b.type === "video").length,
    images: banners.filter((b) => b.type === "image").length,
  };

  /* ===========================
     VALIDATION
  =========================== */
  const validate = () => {
    const newErrors = {};

    // File required only for create
    if (!bannerToEdit && !form.file) {
      newErrors.file = "File is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };;

  /* ===========================
     FILE HANDLING
  =========================== */
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    // Validate based on type
    if (form.type === "video") {
      if (!file.type.startsWith("video/")) {
        toast.error("Please select a valid video file");
        return;
      }

      if (file.size > 50 * 1024 * 1024) {
        toast.error("Video size should not exceed 50MB");
        return;
      }
    } else if (form.type === "image") {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast.error("Image size should not exceed 10MB");
        return;
      }
    }

    setForm((prev) => ({
      ...prev,
      file,
    }));

    setFilePreview(URL.createObjectURL(file));
  };

  /* ===========================
     CREATE BANNER
  =========================== */
  const handleCreateBanner = async (e) => {
    e.preventDefault();

    if (!validate()) {
      toast.error("Please fix validation errors");
      return;
    }

    const fd = new FormData();
    fd.append("title", form.title);
    if (form.description) fd.append("description", form.description);
    fd.append("order", form.order);
    fd.append("type", form.type);
    fd.append("file", form.file);

    setSubmitLoading(true);
    const ok = await createBanner(fd);
    if (ok) {
      resetForm();
      setShowCreateDialog(false);
      await fetchBanners();
    }
    setSubmitLoading(false);
  };

  /* ===========================
     EDIT BANNER
  =========================== */
  const openEditDialog = (banner) => {
    setBannerToEdit(banner);
    setForm({
      title: banner.title || "",
      description: banner.description || "",
      order: banner.order.toString(),
      type: banner.type,
      file: null,
    });
    setFilePreview(null);
    setShowEditDialog(true);
  };

  const handleEditBanner = async (e) => {
    e.preventDefault();

    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("description", form.description);
    fd.append("order", form.order);
    fd.append("type", form.type);

    if (form.file) {
      fd.append("file", form.file);
    }

    setSubmitLoading(true);
    const ok = await updateBanner(bannerToEdit._id, fd);
    if (ok) {
      resetForm();
      setShowEditDialog(false);
      setBannerToEdit(null);
      await fetchBanners();
    }
    setSubmitLoading(false);
  };

  /* ===========================
     DELETE BANNER
  =========================== */
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

  /* ===========================
     TOGGLE STATUS
  =========================== */
  const handleToggleStatus = async (banner) => {
    const ok = await toggleBanner(banner._id, !banner.isActive);
    if (ok) await fetchBanners();
  };

  /* ===========================
     REORDER BANNERS
  =========================== */
  const handleMoveUp = async (banner, index) => {
    if (index === 0) return;

    const prevBanner = banners[index - 1];

    // Swap orders
    await updateBanner(banner._id, { order: prevBanner.order });
    await updateBanner(prevBanner._id, { order: banner.order });
    await fetchBanners();
  };

  const handleMoveDown = async (banner, index) => {
    if (index === banners.length - 1) return;

    const nextBanner = banners[index + 1];

    // Swap orders
    await updateBanner(banner._id, { order: nextBanner.order });
    await updateBanner(nextBanner._id, { order: banner.order });
    await fetchBanners();
  };

  /* ===========================
     RESET FORM
  =========================== */
  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      order: "0",
      type: "video",
      file: null,
    });
    setFilePreview(null);
    setErrors({});
  };

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
            <Plus className="w-4 h-4 mr-2" />
            Create Banner
          </Button>
        </div>
      </motion.div>

      {/* STATS CARDS */}
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
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Banner
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

      {/* CREATE BANNER DIALOG */}
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
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">
                Title
              </Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g., Summer Collection 2024"
                className="h-11"
              />
              {errors.title && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {errors.title}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Brief description of the banner"
                className="min-h-20"
              />
            </div>

            {/* Banner Type */}
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
                      setForm({
                        ...form,
                        type: value,
                        file: null,
                      })
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

            {/* File Upload */}
            <div className="space-y-2">
              <Label htmlFor="file" className="text-sm font-medium">
                {form.type === "video" ? "Video File" : "Image File"} *
              </Label>
              <Input
                id="file"
                type="file"
                accept={form.type === "video" ? "video/*" : "image/*"}
                onChange={handleFileChange}
                className={cn("h-11", errors.file && "border-red-400")}
              />
              <p className="text-xs text-gray-500">
                {form.type === "video"
                  ? "Max 50MB. Formats: MP4, WebM, Ogg"
                  : "Max 10MB. Formats: PNG, JPG, GIF"}
              </p>
              {errors.file && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {errors.file}
                </p>
              )}
            </div>

            {/* Preview */}
            {filePreview && (
              <div className="rounded-lg overflow-hidden border-2 border-gray-200">
                {form.type === "video" ? (
                  <video
                    src={filePreview}
                    controls
                    className="w-full max-h-64 bg-black"
                  />
                ) : (
                  <img
                    src={filePreview}
                    alt="Preview"
                    className="w-full max-h-64 object-cover"
                  />
                )}
              </div>
            )}

            {/* Order */}
            <div className="space-y-2">
              <Label htmlFor="order" className="text-sm font-medium">
                Display Order
              </Label>
              <Input
                id="order"
                type="number"
                min="0"
                value={form.order}
                onChange={(e) => setForm({ ...form, order: e.target.value })}
                className="h-11"
              />
              <p className="text-xs text-gray-500">
                Lower numbers appear first (0, 1, 2...)
              </p>
            </div>

            <DialogFooter className="gap-2 sm:gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowCreateDialog(false);
                  resetForm();
                }}
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
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Banner
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* EDIT BANNER DIALOG */}
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

          <form onSubmit={handleEditBanner} className="space-y-6 pt-4">
            {/* Current Banner Preview */}
            {bannerToEdit && (
              <div className="rounded-lg overflow-hidden border-2 border-gray-200 bg-black">
                {bannerToEdit.type === "video" ? (
                  <video
                    src={bannerToEdit.videoUrl}
                    controls
                    className="w-full max-h-64 object-contain"
                  />
                ) : (
                  <img
                    src={bannerToEdit.imageUrl}
                    alt={bannerToEdit.title}
                    className="w-full max-h-64 object-cover"
                  />
                )}
              </div>
            )}

            {/* Type Badge */}
            {bannerToEdit && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600">Type:</span>
                <Badge
                  className={cn(
                    "text-white",
                    bannerToEdit.type === "video"
                      ? "bg-blue-600"
                      : "bg-purple-600",
                  )}
                >
                  {bannerToEdit.type === "video" ? (
                    <>
                      <Video className="w-3 h-3 mr-1" />
                      Video
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-3 h-3 mr-1" />
                      Image
                    </>
                  )}
                </Badge>
              </div>
            )}

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="edit_title" className="text-sm font-medium">
                Title
              </Label>
              <Input
                id="edit_title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g., Summer Collection 2024"
                className="h-11"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="edit_description" className="text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="edit_description"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Brief description of the banner"
                className="min-h-20"
              />
            </div>

            {/* Optional: Replace File */}
            <div className="space-y-2">
              <Label htmlFor="edit_file" className="text-sm font-medium">
                Replace {bannerToEdit?.type === "video" ? "Video" : "Image"}{" "}
                (Optional)
              </Label>
              <Input
                id="edit_file"
                type="file"
                accept={bannerToEdit?.type === "video" ? "video/*" : "image/*"}
                onChange={handleFileChange}
                className="h-11"
              />
              <p className="text-xs text-gray-500">
                Leave empty to keep current{" "}
                {bannerToEdit?.type === "video" ? "video" : "image"}
              </p>
            </div>

            {/* Preview if new file selected */}
            {filePreview && (
              <div className="rounded-lg overflow-hidden border-2 border-gray-200">
                {form.type === "video" ? (
                  <video
                    src={filePreview}
                    controls
                    className="w-full max-h-64 bg-black object-contain"
                  />
                ) : (
                  <img
                    src={filePreview}
                    alt="New Preview"
                    className="w-full max-h-64 object-cover"
                  />
                )}
              </div>
            )}

            {/* Order */}
            <div className="space-y-2">
              <Label htmlFor="edit_order" className="text-sm font-medium">
                Display Order
              </Label>
              <Input
                id="edit_order"
                type="number"
                min="0"
                value={form.order}
                onChange={(e) => setForm({ ...form, order: e.target.value })}
                className="h-11"
              />
              <p className="text-xs text-gray-500">
                Lower numbers appear first (0, 1, 2...)
              </p>
            </div>

            <DialogFooter className="gap-2 sm:gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowEditDialog(false);
                  setBannerToEdit(null);
                  resetForm();
                }}
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
                    Updating...
                  </>
                ) : (
                  <>
                    <Edit className="w-4 h-4 mr-2" />
                    Update Banner
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRMATION DIALOG */}
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
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Banner
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
        <div className="lg:w-80 shrink-0">
          <div className="relative rounded-lg overflow-hidden border-2 border-gray-200 bg-black">
            {banner.type === "video" ? (
              <video
                src={banner.videoUrl}
                controls
                className="w-full h-48 object-contain"
              />
            ) : (
              <img
                src={banner.imageUrl}
                alt={banner.title}
                className="w-full h-48 object-cover"
              />
            )}
            {banner.isActive && (
              <div className="absolute top-2 right-2">
                <Badge className="bg-emerald-500 text-white border-0 shadow-md">
                  <Eye className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col">
          {/* Title & Description */}
          <div className="mb-4">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-bold text-gray-900">
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
                        <Video className="w-3 h-3 mr-1" />
                        Video
                      </>
                    ) : (
                      <>
                        <ImageIcon className="w-3 h-3 mr-1" />
                        Image
                      </>
                    )}
                  </Badge>
                </div>
                {banner.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {banner.description}
                  </p>
                )}
              </div>

              {/* Order Badge */}
              <Badge variant="outline" className="shrink-0">
                Order: {banner.order}
              </Badge>
            </div>

            {/* Status Badge */}
            {!banner.isActive && (
              <Badge variant="secondary" className="mt-2">
                <EyeOff className="w-3 h-3 mr-1" />
                Inactive
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
              <Edit className="w-3 h-3 mr-1.5" />
              Edit
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
              <Trash2 className="w-3 h-3 mr-1.5" />
              Delete
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