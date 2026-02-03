"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Video,
  Plus,
  Trash2,
  Search,
  Filter,
  X,
  Film,
  Power,
  Edit,
  Loader2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Check,
} from "lucide-react";
import toast from "react-hot-toast";

import { useShopByVideoStore } from "@/stores/useShopByVideoStore";
import { useProductStore } from "@/stores/useProductStore";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

/* ===========================
   SHOP BY VIDEO PAGE
=========================== */
export default function AdminShopByVideoPage() {
  const {
    videos,
    fetchVideos,
    createVideo,
    updateVideo,
    toggleVideo,
    loading,
  } = useShopByVideoStore();
  const { products, fetchProducts } = useProductStore();

  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [videoToEdit, setVideoToEdit] = useState(null);
  const [videoToDelete, setVideoToDelete] = useState(null);

  // Form state
  const [form, setForm] = useState({
    title: "",
    description: "",
    video: null,
    product: "",
  });

  const [videoPreview, setVideoPreview] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  /* ===========================
     INIT
  =========================== */
  useEffect(() => {
    fetchVideos();
    fetchProducts();
  }, []);

  /* ===========================
     DERIVED DATA
  =========================== */
  const activeProducts = useMemo(
    () => products.filter((p) => p.isActive),
    [products],
  );

  const filteredVideos = useMemo(() => {
    let filtered = videos;

    if (searchQuery) {
      filtered = filtered.filter((v) =>
        v.title?.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    if (statusFilter === "active") {
      filtered = filtered.filter((v) => v.isActive);
    } else if (statusFilter === "inactive") {
      filtered = filtered.filter((v) => !v.isActive);
    }

    return filtered;
  }, [videos, searchQuery, statusFilter]);

  /* ===========================
     STATS CALCULATION
  =========================== */
  const stats = {
    total: videos.length,
    active: videos.filter((v) => v.isActive).length,
    inactive: videos.filter((v) => !v.isActive).length,
  };

  /* ===========================
     CREATE VIDEO
  =========================== */
  const handleCreateVideo = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) return toast.error("Title is required");
    if (!form.video) return toast.error("Video file is required");
    if (!form.product) return toast.error("Select a product");

    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("description", form.description);
    fd.append("video", form.video);
    fd.append("products[]", form.product);

    setSubmitLoading(true);
    const ok = await createVideo(fd);
    if (ok) {
      resetForm();
      setShowCreateDialog(false);
      await fetchVideos();
    }
    setSubmitLoading(false);
  };

  /* ===========================
     EDIT VIDEO
  =========================== */
  const openEditDialog = (video) => {
    setVideoToEdit(video);
    setForm({
      title: video.title,
      description: video.description || "",
      video: null,
      product: video.products?.[0]?._id || "",
    });
    setVideoPreview(video.videoUrl || null);
    setShowEditDialog(true);
  };

  const handleEditVideo = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) return toast.error("Title is required");
    if (!form.product) return toast.error("Select a product");

    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("description", form.description);
    if (form.video) {
      fd.append("video", form.video);
    }
    fd.append("products[]", form.product);

    setSubmitLoading(true);
    const ok = await updateVideo(videoToEdit._id, fd);
    if (ok) {
      resetForm();
      setShowEditDialog(false);
      setVideoToEdit(null);
      await fetchVideos();
    }
    setSubmitLoading(false);
  };

  /* ===========================
     DELETE VIDEO
  =========================== */
  const openDeleteDialog = (video) => {
    setVideoToDelete(video);
    setShowDeleteDialog(true);
  };

  const handleDeleteVideo = async () => {
    // placeholder: wire to store deleteVideo when endpoint is ready
    // const ok = await deleteVideo(videoToDelete._id);
    // if (ok) { ... }
    setShowDeleteDialog(false);
    setVideoToDelete(null);
  };

  /* ===========================
     TOGGLE STATUS
  =========================== */
  const handleToggleActive = async (video) => {
    const ok = await toggleVideo(video._id, !video.isActive);
    if (ok) await fetchVideos();
  };

  /* ===========================
     RESET FORM
  =========================== */
  const resetForm = () => {
    setForm({ title: "", description: "", video: null, product: "" });
    setVideoPreview(null);
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
     UI
  =========================== */
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
              Shop By Video
            </h1>
            <p className="text-base text-gray-600">
              Upload videos and link each one to a product
            </p>
          </div>

          <Button
            onClick={() => setShowCreateDialog(true)}
            className="bg-[#12351a] hover:bg-[#0f2916] h-11 px-6"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Video
          </Button>
        </div>
      </motion.div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard
          title="Total Videos"
          value={stats.total}
          icon={Film}
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
      </div>

      {/* FILTERS */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="border-gray-200 shadow-md">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search videos by title..."
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
                  <SelectItem value="all">All Videos</SelectItem>
                  <SelectItem value="active">Active Only</SelectItem>
                  <SelectItem value="inactive">Inactive Only</SelectItem>
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

      {/* VIDEO LIST */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border-gray-200 shadow-lg">
          <CardHeader className="border-b border-gray-100 bg-gray-50/50">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Video className="w-5 h-5 text-[#12351a]" />
              All Videos ({filteredVideos.length})
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-[#12351a]" />
              </div>
            ) : filteredVideos.length === 0 ? (
              <div className="text-center py-16">
                <Film className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No videos found
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  {hasActiveFilters
                    ? "Try adjusting your filters"
                    : "Get started by uploading your first video"}
                </p>
                {!hasActiveFilters && (
                  <Button
                    onClick={() => setShowCreateDialog(true)}
                    className="bg-[#12351a] hover:bg-[#0f2916]"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Upload First Video
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AnimatePresence>
                  {filteredVideos.map((video, index) => (
                    <motion.div
                      key={video._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <VideoCard
                        video={video}
                        onEdit={openEditDialog}
                        onDelete={openDeleteDialog}
                        onToggleActive={handleToggleActive}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* CREATE VIDEO DIALOG */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-blue-100 rounded-full">
                <Plus className="w-6 h-6 text-blue-600" />
              </div>
              <DialogTitle className="text-2xl">Upload New Video</DialogTitle>
            </div>
            <p className="text-sm text-gray-600">
              Add a video and link it to an active product
            </p>
          </DialogHeader>

          <VideoForm
            form={form}
            setForm={setForm}
            videoPreview={videoPreview}
            setVideoPreview={setVideoPreview}
            activeProducts={activeProducts}
            onSubmit={handleCreateVideo}
            submitLoading={submitLoading}
            onCancel={() => {
              setShowCreateDialog(false);
              resetForm();
            }}
            isEdit={false}
          />
        </DialogContent>
      </Dialog>

      {/* EDIT VIDEO DIALOG */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-amber-100 rounded-full">
                <Edit className="w-6 h-6 text-amber-600" />
              </div>
              <DialogTitle className="text-2xl">Edit Video</DialogTitle>
            </div>
            <p className="text-sm text-gray-600">
              Update the video details or replace the file
            </p>
          </DialogHeader>

          <VideoForm
            form={form}
            setForm={setForm}
            videoPreview={videoPreview}
            setVideoPreview={setVideoPreview}
            activeProducts={activeProducts}
            onSubmit={handleEditVideo}
            submitLoading={submitLoading}
            onCancel={() => {
              setShowEditDialog(false);
              setVideoToEdit(null);
              resetForm();
            }}
            isEdit={true}
          />
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
                Delete Video?
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-base space-y-4 pt-2">
              <p className="text-gray-700">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-gray-900">
                  "{videoToDelete?.title}"
                </span>
                ?
              </p>
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-800">
                  <strong>Warning:</strong> This action cannot be undone. The
                  video and its linked product association will be permanently
                  removed.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-2">
            <AlertDialogCancel
              onClick={() => {
                setShowDeleteDialog(false);
                setVideoToDelete(null);
              }}
              disabled={submitLoading}
              className="h-11"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteVideo}
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
                  Delete Video
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
   VIDEO CARD COMPONENT
=========================== */
function VideoCard({ video, onEdit, onDelete, onToggleActive }) {
  return (
    <Card className="border-gray-200 shadow-md hover:shadow-lg transition-all overflow-hidden group">
      {/* Video Thumbnail */}
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        {video.videoUrl ? (
          <video
            src={video.videoUrl}
            poster={video.videoUrl + "?so_auto"}
            muted
            playsInline
            className="w-full h-full object-cover"
            onMouseEnter={(e) => e.currentTarget.play()}
            onMouseLeave={(e) => {
              e.currentTarget.pause();
              e.currentTarget.load();
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <Film className="w-12 h-12 text-gray-400" />
          </div>
        )}

        {/* Play hint overlay — visible only when video exists */}
        {video.videoUrl && (
          <div className="absolute inset-0 flex items-center justify-center opacity-100 group-hover:opacity-0 transition-opacity duration-300 pointer-events-none">
            <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white ml-0.5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        )}

        {/* Status badge on top of video */}
        <div className="absolute top-3 right-3">
          {video.isActive ? (
            <Badge className="bg-emerald-500 text-white border-0">
              <CheckCircle className="w-3 h-3 mr-1" />
              Active
            </Badge>
          ) : (
            <Badge className="bg-gray-600 text-white border-0">
              <XCircle className="w-3 h-3 mr-1" />
              Inactive
            </Badge>
          )}
        </div>
      </div>

      <CardContent className="pt-5">
        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 mb-1.5 line-clamp-2">
          {video.title}
        </h3>

        {/* Description */}
        {video.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {video.description}
          </p>
        )}

        {/* Linked Product */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs text-gray-500">Linked product:</span>
          <span className="text-xs font-medium text-[#12351a] bg-[#12351a]/8 px-2.5 py-0.5 rounded-full">
            {video.products?.[0]?.name || "—"}
          </span>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(video)}
            className="flex-1"
          >
            <Edit className="w-3 h-3 mr-1.5" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggleActive(video)}
            className={cn(
              "flex-1",
              video.isActive && "bg-emerald-50 border-emerald-300",
            )}
          >
            <Power
              className={cn(
                "w-3 h-3 mr-1.5",
                video.isActive && "text-emerald-600",
              )}
            />
            {video.isActive ? "Deactivate" : "Activate"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(video)}
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/* ===========================
   VIDEO FORM COMPONENT
=========================== */
function VideoForm({
  form,
  setForm,
  videoPreview,
  setVideoPreview,
  activeProducts,
  onSubmit,
  submitLoading,
  onCancel,
  isEdit,
}) {
  // Revoke any locally-created blob URL when the form unmounts
  // (server-sourced URLs like Cloudinary are not blob URLs and are safe to ignore)
  useEffect(() => {
    return () => {
      if (videoPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(videoPreview);
      }
    };
  }, [videoPreview]);

  const handleVideoFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Revoke previous blob URL before creating a new one
    if (videoPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(videoPreview);
    }

    setForm({ ...form, video: file });
    setVideoPreview(URL.createObjectURL(file));
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6 pt-4">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title" className="text-sm font-medium">
          Video Title *
        </Label>
        <Input
          id="title"
          placeholder="Enter a video title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="h-11"
          required
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-medium">
          Description
        </Label>
        <Textarea
          id="description"
          placeholder="Write a short description for the video"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="min-h-20"
          maxLength={300}
        />
        <p className="text-xs text-gray-500">
          {form.description.length}/300 characters
        </p>
      </div>

      {/* Video File + Preview */}
      <div className="space-y-2">
        <Label htmlFor="videoFile" className="text-sm font-medium">
          Video File {isEdit ? "(leave empty to keep current)" : "*"}
        </Label>
        <Input
          id="videoFile"
          type="file"
          accept="video/*"
          onChange={handleVideoFileChange}
          className="h-11"
          {...(!isEdit && { required: true })}
        />

        {/* Preview block */}
        {videoPreview && (
          <div className="mt-3 relative w-full rounded-lg overflow-hidden border-2 border-gray-200">
            <video
              key={videoPreview}
              src={videoPreview}
              controls
              playsInline
              className="w-full max-h-56 bg-black"
            />
            {/* "Selected" badge — only when user just picked a local file */}
            {form.video && (
              <div className="absolute top-2 right-2">
                <Badge className="bg-green-500 text-white border-0">
                  <Check className="w-3 h-3 mr-1" />
                  Selected
                </Badge>
              </div>
            )}
          </div>
        )}

        {isEdit && !videoPreview && (
          <p className="text-xs text-gray-500">
            No video currently set. Upload a file above.
          </p>
        )}
        {isEdit && videoPreview && !form.video && (
          <p className="text-xs text-gray-500">
            Current video shown above. Upload a new file only if you want to
            replace it.
          </p>
        )}
      </div>

      {/* Linked Product */}
      <div className="space-y-2">
        <Label htmlFor="product" className="text-sm font-medium">
          Linked Product *
        </Label>
        <Select
          value={form.product}
          onValueChange={(v) => setForm({ ...form, product: v })}
        >
          <SelectTrigger className="h-11" id="product">
            <SelectValue placeholder="Choose an active product" />
          </SelectTrigger>
          <SelectContent>
            {activeProducts.map((p) => (
              <SelectItem key={p._id} value={p._id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {activeProducts.length === 0 && (
          <p className="text-xs text-amber-600">
            No active products available. Activate a product first.
          </p>
        )}
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
              {isEdit ? "Updating..." : "Uploading..."}
            </>
          ) : (
            <>
              {isEdit ? (
                <>
                  <Edit className="w-4 h-4 mr-2" />
                  Update Video
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Upload Video
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
      bg: "bg-blue-50",
      iconBg: "bg-blue-100",
      icon: "text-blue-600",
      border: "border-blue-200",
    },
    emerald: {
      bg: "bg-emerald-50",
      iconBg: "bg-emerald-100",
      icon: "text-emerald-600",
      border: "border-emerald-200",
    },
    amber: {
      bg: "bg-amber-50",
      iconBg: "bg-amber-100",
      icon: "text-amber-600",
      border: "border-amber-200",
    },
    purple: {
      bg: "bg-purple-50",
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
