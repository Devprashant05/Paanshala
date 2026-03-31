"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tag,
  Plus,
  Edit,
  Trash2,
  Power,
  Loader2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  FolderTree,
  Folder,
  FolderOpen,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Layers,
} from "lucide-react";
import toast from "react-hot-toast";

import { useCategoryStore } from "@/stores/useCategoryStore";

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

export default function AdminCategoriesPage() {
  const {
    categories,
    fetchCategories,
    createCategory,
    updateCategory,
    toggleCategory,
    deleteCategory,
    loading,
  } = useCategoryStore();

  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  // Form state
  const [form, setForm] = useState({
    name: "",
    parent: "",
    order: "0",
  });

  const [submitLoading, setSubmitLoading] = useState(false);
  const [errors, setErrors] = useState({});

  /* ===========================
     INIT
  =========================== */
  useEffect(() => {
    fetchCategories();
  }, []);

  /* ===========================
     STATS
  =========================== */
  const stats = {
    total: categories.length,
    active: categories.filter((c) => c.isActive).length,
    inactive: categories.filter((c) => !c.isActive).length,
    parents: categories.filter((c) => c.level === 0).length,
    children: categories.filter((c) => c.level > 0).length,
  };

  // Only root categories available as parents
  const parentOptions = categories.filter((c) => c.level === 0);

  /* ===========================
     VALIDATION
  =========================== */
  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Category name is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ===========================
     CREATE
  =========================== */
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      name: form.name.trim(),
      order: Number(form.order),
      ...(form.parent && form.parent !== "none" && { parent: form.parent }),
    };

    setSubmitLoading(true);
    const ok = await createCategory(payload);
    if (ok) {
      resetForm();
      setShowCreateDialog(false);
      await fetchCategories();
    }
    setSubmitLoading(false);
  };

  /* ===========================
     EDIT
  =========================== */
  const openEditDialog = (category) => {
    setCategoryToEdit(category);
    setForm({
      name: category.name,
      parent: category.parent?._id || category.parent || "none",
      order: category.order.toString(),
    });
    setShowEditDialog(true);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      name: form.name.trim(),
      order: Number(form.order),
      parent: form.parent === "none" ? null : form.parent || null,
    };

    setSubmitLoading(true);
    const ok = await updateCategory(categoryToEdit._id, payload);
    if (ok) {
      resetForm();
      setShowEditDialog(false);
      setCategoryToEdit(null);
      await fetchCategories();
    }
    setSubmitLoading(false);
  };

  /* ===========================
     DELETE
  =========================== */
  const openDeleteDialog = (category) => {
    setCategoryToDelete(category);
    setShowDeleteDialog(true);
  };

  const handleDelete = async () => {
    if (!categoryToDelete) return;
    setSubmitLoading(true);
    const ok = await deleteCategory(categoryToDelete._id);
    if (ok) {
      setShowDeleteDialog(false);
      setCategoryToDelete(null);
      await fetchCategories();
    }
    setSubmitLoading(false);
  };

  /* ===========================
     TOGGLE STATUS
  =========================== */
  const handleToggle = async (category) => {
    const ok = await toggleCategory(category._id, !category.isActive);
    if (ok) await fetchCategories();
  };

  /* ===========================
     REORDER
  =========================== */
  const handleMoveUp = async (category, index) => {
    if (index === 0) return;
    const prev = categories[index - 1];
    await updateCategory(category._id, { order: prev.order });
    await updateCategory(prev._id, { order: category.order });
    await fetchCategories();
  };

  const handleMoveDown = async (category, index) => {
    if (index === categories.length - 1) return;
    const next = categories[index + 1];
    await updateCategory(category._id, { order: next.order });
    await updateCategory(next._id, { order: category.order });
    await fetchCategories();
  };

  /* ===========================
     RESET
  =========================== */
  const resetForm = () => {
    setForm({ name: "", parent: "", order: "0" });
    setErrors({});
  };

  /* ===========================
     GROUP BY PARENT (for display)
  =========================== */
  const roots = categories.filter((c) => !c.parent);
  const getChildren = (parentId) =>
    categories.filter(
      (c) => c.parent?._id === parentId || c.parent === parentId,
    );

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
              Categories
            </h1>
            <p className="text-base text-gray-600">
              Manage product categories and their hierarchy
            </p>
          </div>

          <Button
            onClick={() => setShowCreateDialog(true)}
            className="bg-[#12351a] hover:bg-[#0f2916] h-11 px-6"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </Button>
        </div>
      </motion.div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total"
          value={stats.total}
          icon={Tag}
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
          title="Parent Cats"
          value={stats.parents}
          icon={FolderTree}
          color="violet"
          delay={0.3}
        />
      </div>

      {/* CATEGORIES LIST */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border-gray-200 shadow-lg">
          <CardHeader className="border-b border-gray-100 bg-gray-50/50">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <FolderTree className="w-5 h-5 text-[#12351a]" />
              All Categories ({categories.length})
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-[#12351a]" />
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-16">
                <FolderTree className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No categories yet
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Create your first category to organise products
                </p>
                <Button
                  onClick={() => setShowCreateDialog(true)}
                  className="bg-[#12351a] hover:bg-[#0f2916]"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Category
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {roots.map((root, index) => (
                    <motion.div
                      key={root._id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -16 }}
                      transition={{ delay: index * 0.04 }}
                      className="space-y-2"
                    >
                      {/* Root category row */}
                      <CategoryRow
                        category={root}
                        index={index}
                        total={roots.length}
                        onEdit={openEditDialog}
                        onDelete={openDeleteDialog}
                        onToggle={handleToggle}
                        onMoveUp={handleMoveUp}
                        onMoveDown={handleMoveDown}
                        allCategories={categories}
                        isRoot
                      />

                      {/* Children */}
                      {getChildren(root._id).map((child, ci) => (
                        <motion.div
                          key={child._id}
                          initial={{ opacity: 0, x: 16 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: ci * 0.04 }}
                          className="ml-6 pl-4 border-l-2 border-dashed border-[#12351a]/20"
                        >
                          <CategoryRow
                            category={child}
                            index={ci}
                            total={getChildren(root._id).length}
                            onEdit={openEditDialog}
                            onDelete={openDeleteDialog}
                            onToggle={handleToggle}
                            onMoveUp={handleMoveUp}
                            onMoveDown={handleMoveDown}
                            allCategories={categories}
                          />
                        </motion.div>
                      ))}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* =====================
          CREATE DIALOG
      ===================== */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-emerald-100 rounded-full">
                <Plus className="w-6 h-6 text-emerald-600" />
              </div>
              <DialogTitle className="text-2xl">Add Category</DialogTitle>
            </div>
            <p className="text-sm text-gray-600">
              Create a new root category or subcategory
            </p>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-5 pt-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Category Name *
              </Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => {
                  setForm({ ...form, name: e.target.value });
                  if (errors.name) setErrors({ ...errors, name: undefined });
                }}
                placeholder="e.g., Sweet Paan"
                className={cn("h-11", errors.name && "border-red-400")}
                autoFocus
              />
              {errors.name && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {errors.name}
                </p>
              )}
            </div>

            {/* Parent */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Parent Category</Label>
              <Select
                value={form.parent || "none"}
                onValueChange={(val) => setForm({ ...form, parent: val })}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="None (root category)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    <span className="flex items-center gap-2">
                      <Folder className="w-4 h-4 text-gray-400" />
                      None (root category)
                    </span>
                  </SelectItem>
                  {parentOptions.map((p) => (
                    <SelectItem key={p._id} value={p._id}>
                      <span className="flex items-center gap-2">
                        <FolderOpen className="w-4 h-4 text-[#12351a]" />
                        {p.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Leave empty to create a root (top-level) category
              </p>
            </div>

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
                Lower numbers appear first (0, 1, 2…)
              </p>
            </div>

            <DialogFooter className="gap-2 pt-2">
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
                    Creating…
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Category
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* =====================
          EDIT DIALOG
      ===================== */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-amber-100 rounded-full">
                <Edit className="w-6 h-6 text-amber-600" />
              </div>
              <DialogTitle className="text-2xl">Edit Category</DialogTitle>
            </div>
            <p className="text-sm text-gray-600">Update category details</p>
          </DialogHeader>

          <form onSubmit={handleEdit} className="space-y-5 pt-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="edit_name" className="text-sm font-medium">
                Category Name *
              </Label>
              <Input
                id="edit_name"
                value={form.name}
                onChange={(e) => {
                  setForm({ ...form, name: e.target.value });
                  if (errors.name) setErrors({ ...errors, name: undefined });
                }}
                placeholder="e.g., Sweet Paan"
                className={cn("h-11", errors.name && "border-red-400")}
              />
              {errors.name && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {errors.name}
                </p>
              )}
            </div>

            {/* Parent — disable if editing a root that has children */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Parent Category</Label>
              <Select
                value={form.parent || "none"}
                onValueChange={(val) => setForm({ ...form, parent: val })}
                disabled={
                  categoryToEdit &&
                  categories.some(
                    (c) =>
                      c.parent?._id === categoryToEdit._id ||
                      c.parent === categoryToEdit._id,
                  )
                }
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="None (root category)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    <span className="flex items-center gap-2">
                      <Folder className="w-4 h-4 text-gray-400" />
                      None (root category)
                    </span>
                  </SelectItem>
                  {parentOptions
                    .filter((p) => p._id !== categoryToEdit?._id)
                    .map((p) => (
                      <SelectItem key={p._id} value={p._id}>
                        <span className="flex items-center gap-2">
                          <FolderOpen className="w-4 h-4 text-[#12351a]" />
                          {p.name}
                        </span>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {categoryToEdit &&
                categories.some(
                  (c) =>
                    c.parent?._id === categoryToEdit._id ||
                    c.parent === categoryToEdit._id,
                ) && (
                  <p className="text-xs text-amber-600 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Parent cannot be changed while this category has
                    subcategories
                  </p>
                )}
            </div>

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
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowEditDialog(false);
                  setCategoryToEdit(null);
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
                    Updating…
                  </>
                ) : (
                  <>
                    <Edit className="w-4 h-4 mr-2" />
                    Update Category
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* =====================
          DELETE DIALOG
      ===================== */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="max-w-lg">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <AlertDialogTitle className="text-2xl">
                Delete Category?
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-base space-y-4 pt-2">
              <p className="text-gray-700">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-gray-900">
                  "{categoryToDelete?.name}"
                </span>
                ?
              </p>
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-800">
                  <strong>Warning:</strong> You must delete all subcategories
                  first. This action cannot be undone.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel
              onClick={() => {
                setShowDeleteDialog(false);
                setCategoryToDelete(null);
              }}
              disabled={submitLoading}
              className="h-11"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={submitLoading}
              className="bg-red-600 hover:bg-red-700 h-11"
            >
              {submitLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting…
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Category
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
   CATEGORY ROW
=========================== */
function CategoryRow({
  category,
  index,
  total,
  onEdit,
  onDelete,
  onToggle,
  onMoveUp,
  onMoveDown,
  allCategories,
  isRoot = false,
}) {
  const childCount = allCategories.filter(
    (c) => c.parent?._id === category._id || c.parent === category._id,
  ).length;

  return (
    <Card
      className={cn(
        "border shadow-sm hover:shadow-md transition-all overflow-hidden",
        isRoot ? "border-gray-200" : "border-gray-100 bg-gray-50/40",
      )}
    >
      <div className="flex items-center gap-3 p-4 flex-wrap sm:flex-nowrap">
        {/* Icon */}
        <div
          className={cn(
            "shrink-0 p-2.5 rounded-xl",
            isRoot ? "bg-[#12351a]/10" : "bg-[#12351a]/5",
          )}
        >
          {isRoot ? (
            <FolderOpen className="w-5 h-5 text-[#12351a]" />
          ) : (
            <Tag className="w-4 h-4 text-[#12351a]/70" />
          )}
        </div>

        {/* Name + meta */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {!isRoot && (
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            )}
            <span
              className={cn(
                "font-semibold truncate",
                isRoot ? "text-gray-900 text-base" : "text-gray-700 text-sm",
              )}
            >
              {category.name}
            </span>

            {/* Status badge */}
            {category.isActive ? (
              <Badge className="bg-emerald-100 text-emerald-700 border-0 text-xs">
                <Eye className="w-3 h-3 mr-1" /> Active
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-xs">
                <EyeOff className="w-3 h-3 mr-1" /> Inactive
              </Badge>
            )}

            {/* Children count */}
            {isRoot && childCount > 0 && (
              <Badge variant="outline" className="text-xs">
                <Layers className="w-3 h-3 mr-1" />
                {childCount} sub
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
            <span>slug: {category.slug}</span>
            <span>·</span>
            <span>order: {category.order}</span>
            <span>·</span>
            <span>level: {category.level}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Move up/down */}
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onMoveUp(category, index)}
            disabled={index === 0}
            title="Move up"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onMoveDown(category, index)}
            disabled={index === total - 1}
            title="Move down"
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </Button>

          {/* Toggle status */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggle(category)}
            className={cn(
              "h-8 px-3 text-xs",
              category.isActive
                ? "bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100"
                : "bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100",
            )}
            title={category.isActive ? "Deactivate" : "Activate"}
          >
            <Power className="w-3 h-3 mr-1" />
            {category.isActive ? "Deactivate" : "Activate"}
          </Button>

          {/* Edit */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(category)}
            className="h-8 px-3 text-xs"
          >
            <Edit className="w-3 h-3 mr-1" />
            Edit
          </Button>

          {/* Delete */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(category)}
            className="h-8 px-3 text-xs text-red-500 hover:text-red-600 hover:bg-red-50"
          >
            <Trash2 className="w-3 h-3 mr-1" />
            Delete
          </Button>
        </div>
      </div>
    </Card>
  );
}

/* ===========================
   STAT CARD
=========================== */
function StatCard({ title, value, icon: Icon, color, delay }) {
  const colorMap = {
    blue: {
      bg: "bg-blue-100",
      icon: "text-blue-600",
      border: "border-blue-200",
    },
    emerald: {
      bg: "bg-emerald-100",
      icon: "text-emerald-600",
      border: "border-emerald-200",
    },
    amber: {
      bg: "bg-amber-100",
      icon: "text-amber-600",
      border: "border-amber-200",
    },
    violet: {
      bg: "bg-violet-100",
      icon: "text-violet-600",
      border: "border-violet-200",
    },
  };
  const c = colorMap[color];

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
          c.border,
        )}
      >
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className={cn("p-3 rounded-xl", c.bg)}>
              <Icon className={cn("w-6 h-6", c.icon)} />
            </div>
          </div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-4xl font-bold text-gray-900">{value}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
