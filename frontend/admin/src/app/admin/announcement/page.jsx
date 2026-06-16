"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Megaphone,
  Plus,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  X,
  Check,
  Loader2,
  GripVertical,
  Link,
  Type,
  Palette,
} from "lucide-react";
import { useAnnouncementStore } from "@/stores/useAnnouncementStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

const EMPTY_FORM = {
  text: "",
  link: "",
  linkLabel: "",
  bgColor: "#12351a",
  textColor: "#ffffff",
  isActive: true,
  order: 0,
};

const PRESET_COLORS = [
  { bg: "#12351a", text: "#ffffff", label: "Forest" },
  { bg: "#264B0E", text: "#ffffff", label: "Green" },
  { bg: "#1a1a2e", text: "#f4c430", label: "Gold" },
  { bg: "#b91c1c", text: "#ffffff", label: "Red" },
  { bg: "#1d4ed8", text: "#ffffff", label: "Blue" },
  { bg: "#f4c430", text: "#1a1a1a", label: "Yellow" },
  { bg: "#0f172a", text: "#e2e8f0", label: "Dark" },
  { bg: "#7c3aed", text: "#ffffff", label: "Purple" },
];

export default function AdminAnnouncementPage() {
  const {
    announcements,
    loading,
    fetchAllAnnouncements,
    createAnnouncement,
    updateAnnouncement,
    toggleAnnouncement,
    deleteAnnouncement,
    reorderAnnouncements,
  } = useAnnouncementStore();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const [reordering, setReordering] = useState(false);

  useEffect(() => {
    fetchAllAnnouncements();
  }, []);

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleEdit = (ann) => {
    setEditingId(ann._id);
    setForm({
      text: ann.text || "",
      link: ann.link || "",
      linkLabel: ann.linkLabel || "",
      bgColor: ann.bgColor || "#12351a",
      textColor: ann.textColor || "#ffffff",
      isActive: ann.isActive,
      order: ann.order ?? 0,
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const handleSubmit = async () => {
    if (!form.text.trim()) {
      toast.error("Text is required");
      return;
    }
    setSaving(true);
    const payload = {
      ...form,
      link: form.link.trim() || null,
      linkLabel: form.linkLabel.trim() || null,
    };
    if (editingId) {
      await updateAnnouncement(editingId, payload);
    } else {
      await createAnnouncement(payload);
    }
    setSaving(false);
    handleCancel();
  };

  const handleToggle = async (id) => {
    setTogglingId(id);
    await toggleAnnouncement(id);
    setTogglingId(null);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this announcement?")) return;
    setDeletingId(id);
    await deleteAnnouncement(id);
    setDeletingId(null);
  };

  const handleMoveUp = async (index) => {
    if (index === 0) return;
    const reordered = [...announcements];
    [reordered[index - 1], reordered[index]] = [
      reordered[index],
      reordered[index - 1],
    ];
    setReordering(true);
    await reorderAnnouncements(
      reordered.map((a, i) => ({ id: a._id, order: i })),
    );
    setReordering(false);
  };

  const handleMoveDown = async (index) => {
    if (index === announcements.length - 1) return;
    const reordered = [...announcements];
    [reordered[index], reordered[index + 1]] = [
      reordered[index + 1],
      reordered[index],
    ];
    setReordering(true);
    await reorderAnnouncements(
      reordered.map((a, i) => ({ id: a._id, order: i })),
    );
    setReordering(false);
  };

  const activeCount = announcements.filter((a) => a.isActive).length;

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-4xl lg:text-5xl font-bold text-[#12351a] mb-2">
              Announcement Bar
            </h1>
            <p className="text-base text-gray-600">
              Manage the sliding banners shown at the top of your website
            </p>
          </div>
          <Button
            onClick={() => {
              setEditingId(null);
              setForm(EMPTY_FORM);
              setShowForm(true);
            }}
            className="bg-[#12351a] hover:bg-[#0f2916] text-white h-11 px-6 gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Slide
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 sm:grid-cols-3 gap-4"
      >
        <StatCard
          label="Total Slides"
          value={announcements.length}
          color="blue"
        />
        <StatCard label="Active" value={activeCount} color="emerald" />
        <StatCard
          label="Hidden"
          value={announcements.length - activeCount}
          color="gray"
        />
      </motion.div>

      {/* Live Preview */}
      {announcements.some((a) => a.isActive) && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="border-gray-200 shadow-md overflow-hidden">
            <CardHeader className="border-b border-gray-100 bg-gray-50/50 py-3 px-5">
              <CardTitle className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Live Preview — Active Slides
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-0">
                {announcements
                  .filter((a) => a.isActive)
                  .map((ann, i) => (
                    <div
                      key={ann._id}
                      className="px-4 py-2.5 text-sm font-medium text-center flex items-center justify-center gap-3"
                      style={{
                        backgroundColor: ann.bgColor,
                        color: ann.textColor,
                        borderTop:
                          i > 0 ? "1px solid rgba(255,255,255,0.1)" : "none",
                      }}
                    >
                      <span>{ann.text}</span>
                      {ann.link && (
                        <span
                          className="text-xs underline opacity-80"
                          style={{ color: ann.textColor }}
                        >
                          {ann.linkLabel || "Learn More"}
                        </span>
                      )}
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Add / Edit Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25 }}
          >
            <Card className="border-2 border-[#12351a]/20 shadow-lg">
              <CardHeader className="border-b border-gray-100 bg-[#12351a]/3">
                <CardTitle className="text-lg font-bold text-[#12351a] flex items-center gap-2">
                  <Megaphone className="w-5 h-5" />
                  {editingId ? "Edit Slide" : "New Slide"}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                {/* Text */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <Type className="w-3.5 h-3.5 text-[#12351a]" />
                    Announcement Text *
                  </Label>
                  <Input
                    value={form.text}
                    onChange={(e) => setField("text", e.target.value)}
                    placeholder="e.g. Free shipping on orders above ₹500! 🎉"
                    className="h-11"
                  />
                </div>

                {/* Link */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-semibold flex items-center gap-2">
                      <Link className="w-3.5 h-3.5 text-gray-400" />
                      Link URL
                      <span className="text-xs text-gray-400 font-normal">
                        (optional)
                      </span>
                    </Label>
                    <Input
                      value={form.link}
                      onChange={(e) => setField("link", e.target.value)}
                      placeholder="https://paanshala.com/shop"
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-semibold">
                      Link Label
                      <span className="text-xs text-gray-400 font-normal ml-1">
                        (optional)
                      </span>
                    </Label>
                    <Input
                      value={form.linkLabel}
                      onChange={(e) => setField("linkLabel", e.target.value)}
                      placeholder="Shop Now"
                      className="h-11"
                    />
                  </div>
                </div>

                {/* Colors */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <Palette className="w-3.5 h-3.5 text-[#12351a]" />
                    Color Theme
                  </Label>

                  {/* Presets */}
                  <div className="flex flex-wrap gap-2">
                    {PRESET_COLORS.map((preset) => (
                      <button
                        key={preset.bg}
                        onClick={() => {
                          setField("bgColor", preset.bg);
                          setField("textColor", preset.text);
                        }}
                        title={preset.label}
                        className={cn(
                          "w-8 h-8 rounded-lg border-2 transition-all text-[10px] font-bold",
                          form.bgColor === preset.bg
                            ? "border-[#12351a] scale-110 shadow-md"
                            : "border-transparent hover:border-gray-300",
                        )}
                        style={{
                          backgroundColor: preset.bg,
                          color: preset.text,
                        }}
                      >
                        {form.bgColor === preset.bg && (
                          <Check className="w-3.5 h-3.5 mx-auto" />
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Custom */}
                  <div className="flex gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500">Background</p>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={form.bgColor}
                          onChange={(e) => setField("bgColor", e.target.value)}
                          className="w-9 h-9 rounded-lg border border-gray-200 cursor-pointer"
                        />
                        <span className="text-xs font-mono text-gray-600">
                          {form.bgColor}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500">Text</p>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={form.textColor}
                          onChange={(e) =>
                            setField("textColor", e.target.value)
                          }
                          className="w-9 h-9 rounded-lg border border-gray-200 cursor-pointer"
                        />
                        <span className="text-xs font-mono text-gray-600">
                          {form.textColor}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Live preview */}
                {form.text && (
                  <div
                    className="rounded-xl px-4 py-3 text-sm font-medium text-center"
                    style={{
                      backgroundColor: form.bgColor,
                      color: form.textColor,
                    }}
                  >
                    {form.text}
                    {form.linkLabel && (
                      <span className="ml-2 underline opacity-80 text-xs">
                        {form.linkLabel}
                      </span>
                    )}
                  </div>
                )}

                {/* Active toggle */}
                <div className="flex items-center gap-3 pt-1">
                  <button
                    onClick={() => setField("isActive", !form.isActive)}
                    className={cn(
                      "relative w-11 h-6 rounded-full transition-all duration-300",
                      form.isActive ? "bg-[#12351a]" : "bg-gray-300",
                    )}
                  >
                    <div
                      className={cn(
                        "absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all duration-300 shadow",
                        form.isActive ? "translate-x-5.5" : "translate-x-0.5",
                      )}
                    />
                  </button>
                  <span className="text-sm font-medium text-gray-700">
                    {form.isActive ? "Active — will show on website" : "Hidden"}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2 border-t border-gray-100">
                  <Button
                    onClick={handleSubmit}
                    disabled={saving}
                    className="bg-[#12351a] hover:bg-[#0f2916] text-white h-11 px-8 gap-2"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Saving…
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />{" "}
                        {editingId ? "Save Changes" : "Create Slide"}
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    className="h-11"
                  >
                    <X className="w-4 h-4 mr-1.5" />
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Slides List */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-gray-200 shadow-lg">
          <CardHeader className="border-b border-gray-100 bg-gray-50/50">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-[#12351a]" />
              All Slides ({announcements.length})
              {reordering && (
                <span className="ml-2 text-xs text-gray-400 flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" /> Saving order…
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-[#12351a]" />
              </div>
            ) : announcements.length === 0 ? (
              <div className="text-center py-16">
                <Megaphone className="w-14 h-14 text-gray-200 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  No slides yet
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Add your first announcement to get started.
                </p>
                <Button
                  onClick={() => {
                    setEditingId(null);
                    setForm(EMPTY_FORM);
                    setShowForm(true);
                  }}
                  className="bg-[#12351a] hover:bg-[#0f2916] text-white gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add First Slide
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {announcements.map((ann, index) => (
                    <motion.div
                      key={ann._id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ delay: index * 0.04 }}
                    >
                      <div
                        className={cn(
                          "flex items-center gap-3 p-4 rounded-xl border-2 transition-all",
                          ann.isActive
                            ? "border-gray-200 bg-white hover:border-[#12351a]/20"
                            : "border-dashed border-gray-200 bg-gray-50/60",
                        )}
                      >
                        {/* Color swatch */}
                        <div
                          className="w-10 h-10 rounded-lg shrink-0 border border-gray-200 flex items-center justify-center"
                          style={{ backgroundColor: ann.bgColor }}
                        >
                          <Type
                            className="w-4 h-4"
                            style={{ color: ann.textColor }}
                          />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p
                            className={cn(
                              "text-sm font-semibold truncate",
                              !ann.isActive && "opacity-50",
                            )}
                          >
                            {ann.text}
                          </p>
                          <div className="flex items-center gap-3 mt-0.5">
                            {ann.link ? (
                              <span className="text-xs text-blue-500 truncate max-w-48">
                                → {ann.linkLabel || ann.link}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400">
                                No link
                              </span>
                            )}
                            <span className="text-xs text-gray-300">·</span>
                            <span className="text-xs text-gray-400">
                              Order: {ann.order}
                            </span>
                          </div>
                        </div>

                        {/* Status badge */}
                        {ann.isActive ? (
                          <Badge className="bg-emerald-100 text-emerald-700 border-0 text-xs shrink-0">
                            Active
                          </Badge>
                        ) : (
                          <Badge
                            variant="secondary"
                            className="text-xs shrink-0"
                          >
                            Hidden
                          </Badge>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-1 shrink-0">
                          {/* Reorder */}
                          <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                            <button
                              onClick={() => handleMoveUp(index)}
                              disabled={index === 0 || reordering}
                              title="Move up"
                              className="p-1.5 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                              <ArrowUp className="w-3.5 h-3.5 text-gray-600" />
                            </button>
                            <div className="w-px bg-gray-200" />
                            <button
                              onClick={() => handleMoveDown(index)}
                              disabled={
                                index === announcements.length - 1 || reordering
                              }
                              title="Move down"
                              className="p-1.5 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                              <ArrowDown className="w-3.5 h-3.5 text-gray-600" />
                            </button>
                          </div>

                          <div className="w-px h-5 bg-gray-200 mx-0.5" />

                          {/* Toggle */}
                          <button
                            onClick={() => handleToggle(ann._id)}
                            disabled={togglingId === ann._id}
                            title={ann.isActive ? "Hide slide" : "Show slide"}
                            className={cn(
                              "p-1.5 rounded-lg border transition-all",
                              ann.isActive
                                ? "bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100"
                                : "bg-gray-50 border-gray-200 text-gray-400 hover:bg-gray-100",
                            )}
                          >
                            {togglingId === ann._id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : ann.isActive ? (
                              <Eye className="w-3.5 h-3.5" />
                            ) : (
                              <EyeOff className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => handleEdit(ann)}
                            title="Edit"
                            className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(ann._id)}
                            disabled={deletingId === ann._id}
                            title="Delete"
                            className="p-1.5 rounded-lg border border-red-100 bg-white text-red-400 hover:bg-red-50 hover:text-red-600 transition-all"
                          >
                            {deletingId === ann._id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                <p className="text-xs text-gray-400 text-center pt-2">
                  Slides play in the order shown above. Use arrows to reorder.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

/* ── STAT CARD ── */
function StatCard({ label, value, color }) {
  const colors = {
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
    gray: "bg-gray-50 text-gray-600 border-gray-100",
  };
  return (
    <Card className={cn("border shadow-sm", colors[color])}>
      <CardContent className="pt-5 pb-4">
        <p className="text-3xl font-bold mb-1">{value}</p>
        <p className="text-xs font-medium opacity-80">{label}</p>
      </CardContent>
    </Card>
  );
}
