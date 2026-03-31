"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Plus,
  Star,
  Power,
  Edit,
  Trash2,
  Search,
  Filter,
  X,
  Loader2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ShoppingBag,
  Layers,
  FolderOpen,
  Tag,
} from "lucide-react";
import toast from "react-hot-toast";

import { useProductStore } from "@/stores/useProductStore";
import { useCategoryStore } from "@/stores/useCategoryStore";

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
   HELPERS
=========================== */
/** Resolve a category field that may be a populated object or a raw ObjectId string */
const resolveCatId = (cat) =>
  cat ? (typeof cat === "object" ? cat._id : cat) : null;

const resolveCatName = (cat) =>
  cat ? (typeof cat === "object" ? cat.name : cat) : "—";

export default function AdminProductsPage() {
  const {
    products,
    fetchProducts,
    createProduct,
    updateProduct,
    toggleProduct,
    deleteProduct,
    loading,
  } = useProductStore();

  const { categories, fetchCategories } = useCategoryStore();

  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);

  // Form state — category / subcategory now store ObjectId strings
  const EMPTY_FORM = {
    name: "",
    categoryId: "", // root or leaf Category _id sent to backend
    subcategoryId: "", // child Category _id (if selected)
    description: "",
    additionalInfo: "",
    images: [],
    originalPrice: "",
    discountedPrice: "",
    stock: "",
    variants: [
      { setSize: "", originalPrice: "", discountedPrice: "", stock: "" },
    ],
    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",
  };

  const [form, setForm] = useState(EMPTY_FORM);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  /* ===========================
     DERIVED: category tree
  =========================== */
  const rootCategories = categories.filter((c) => !c.parent && c.isActive);

  /** Children of a given root _id */
  const getChildren = (parentId) =>
    categories.filter(
      (c) =>
        c.isActive && (c.parent?._id === parentId || c.parent === parentId),
    );

  /** Is the selected root a "Paan" category? (isPaan flag drives variant UI) */
  const selectedRoot = rootCategories.find((c) => c._id === form.categoryId);
  const isPaanCategory = selectedRoot?.name?.toLowerCase().includes("paan");

  /* ===========================
     INIT
  =========================== */
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  /* ===========================
     FILTERED PRODUCTS
  =========================== */
  const filteredProducts = products.filter((p) => {
    const nameMatch =
      !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase());

    const catMatch =
      categoryFilter === "all" ||
      resolveCatId(p.category) === categoryFilter ||
      resolveCatId(p.parentCategory) === categoryFilter;

    const statusMatch =
      statusFilter === "all" ||
      (statusFilter === "active" && p.isActive) ||
      (statusFilter === "inactive" && !p.isActive) ||
      (statusFilter === "featured" && p.isFeatured);

    return nameMatch && catMatch && statusMatch;
  });

  /* ===========================
     STATS
  =========================== */
  const stats = {
    total: products.length,
    active: products.filter((p) => p.isActive).length,
    inactive: products.filter((p) => !p.isActive).length,
    featured: products.filter((p) => p.isFeatured).length,
  };

  /* ===========================
     VALIDATION
  =========================== */
  const validate = () => {
    const newErrors = {};

    if (!form.name.trim()) newErrors.name = "Product name is required";
    if (!form.categoryId) newErrors.categoryId = "Category is required";
    if (!form.description.trim())
      newErrors.description = "Description is required";

    if (!productToEdit && form.images.length === 0)
      newErrors.images = "At least one image is required";

    if (!isPaanCategory) {
      if (!form.originalPrice || Number(form.originalPrice) <= 0)
        newErrors.originalPrice = "Original price must be greater than 0";
      if (!form.discountedPrice || Number(form.discountedPrice) <= 0)
        newErrors.discountedPrice = "Discounted price must be greater than 0";
      if (Number(form.discountedPrice) > Number(form.originalPrice))
        newErrors.discountedPrice =
          "Discounted price cannot exceed original price";
    } else {
      form.variants.forEach((v, i) => {
        if (!v.setSize || Number(v.setSize) <= 0)
          newErrors[`v${i}_setSize`] = "Set size required";
        if (!v.originalPrice || Number(v.originalPrice) <= 0)
          newErrors[`v${i}_originalPrice`] = "Original price required";
        if (!v.discountedPrice || Number(v.discountedPrice) <= 0)
          newErrors[`v${i}_discountedPrice`] = "Discounted price required";
        if (Number(v.discountedPrice) > Number(v.originalPrice))
          newErrors[`v${i}_discountedPrice`] = "Cannot exceed original price";
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const clearError = (field) =>
    setErrors((prev) => {
      const e = { ...prev };
      delete e[field];
      return e;
    });

  /* ===========================
     IMAGE HANDLING
  =========================== */
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length + form.images.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }
    setForm((f) => ({ ...f, images: [...f.images, ...files] }));
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () =>
        setImagePreviews((prev) => [...prev, reader.result]);
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== index) }));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  /* ===========================
     VARIANT HANDLING
  =========================== */
  const addVariant = () =>
    setForm((f) => ({
      ...f,
      variants: [
        ...f.variants,
        { setSize: "", originalPrice: "", discountedPrice: "", stock: "" },
      ],
    }));

  const removeVariant = (index) => {
    if (form.variants.length === 1) {
      toast.error("At least one variant is required for Paan products");
      return;
    }
    setForm((f) => ({
      ...f,
      variants: f.variants.filter((_, i) => i !== index),
    }));
  };

  const updateVariant = (index, field, value) =>
    setForm((f) => {
      const variants = [...f.variants];
      variants[index] = { ...variants[index], [field]: value };
      return { ...f, variants };
    });

  /* ===========================
     BUILD FORMDATA
  =========================== */
  const buildFormData = () => {
    const fd = new FormData();
    fd.append("name", form.name);

    // The leaf category id is what we send — backend pre-save hook resolves parentCategory
    const leafCatId = form.subcategoryId || form.categoryId;
    fd.append("category", leafCatId);

    fd.append("description", form.description);
    if (form.additionalInfo) fd.append("additionalInfo", form.additionalInfo);

    form.images.forEach((img) => fd.append("images", img));

    if (isPaanCategory) {
      fd.append("isPaan", "true");
      fd.append("variants", JSON.stringify(form.variants));
    } else {
      fd.append("isPaan", "false");
      fd.append("originalPrice", form.originalPrice);
      fd.append("discountedPrice", form.discountedPrice);
      fd.append("stock", form.stock || "0");
    }

    fd.append(
      "seo",
      JSON.stringify({
        title: form.seoTitle,
        description: form.seoDescription,
        keywords: form.seoKeywords, // comma separated string
      }),
    );

    return fd;
  };

  /* ===========================
     CREATE
  =========================== */
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fix validation errors");
      return;
    }
    setSubmitLoading(true);
    const ok = await createProduct(buildFormData());
    if (ok) {
      resetForm();
      setShowCreateDialog(false);
    }
    setSubmitLoading(false);
  };

  /* ===========================
     EDIT
  =========================== */
  const openEditDialog = (product) => {
    setProductToEdit(product);

    // Resolve category ids from populated or raw fields
    const catId = resolveCatId(product.category);
    const parentCatId = resolveCatId(product.parentCategory);

    // If parentCategory is different from category, product is a subcategory
    const isSubcat = parentCatId && parentCatId !== catId;

    setForm({
      name: product.name,
      categoryId: isSubcat ? parentCatId : catId,
      subcategoryId: isSubcat ? catId : "",
      description: product.description,
      additionalInfo: product.additionalInfo || "",
      images: [],
      originalPrice: product.originalPrice?.toString() || "",
      discountedPrice: product.discountedPrice?.toString() || "",
      stock: product.stock?.toString() || "",
      variants:
        product.variants?.length > 0
          ? product.variants.map((v) => ({
              setSize: v.setSize.toString(),
              originalPrice: v.originalPrice.toString(),
              discountedPrice: v.discountedPrice.toString(),
              stock: v.stock.toString(),
            }))
          : [
              {
                setSize: "",
                originalPrice: "",
                discountedPrice: "",
                stock: "",
              },
            ],
    });
    seoTitle: product.seo?.title || "";
    seoDescription: product.seo?.description || "";
    seoKeywords: product.seo?.keywords?.join(", ") || "";

    setImagePreviews(product.images || []);
    setShowEditDialog(true);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fix validation errors");
      return;
    }
    setSubmitLoading(true);
    const ok = await updateProduct(productToEdit._id, buildFormData());
    if (ok) {
      resetForm();
      setShowEditDialog(false);
      setProductToEdit(null);
    }
    setSubmitLoading(false);
  };

  /* ===========================
     DELETE
  =========================== */
  const openDeleteDialog = (product) => {
    setProductToDelete(product);
    setShowDeleteDialog(true);
  };

  const handleDelete = async () => {
    if (!productToDelete) return;
    setSubmitLoading(true);
    const ok = await deleteProduct(productToDelete._id);
    if (ok) {
      setShowDeleteDialog(false);
      setProductToDelete(null);
    }
    setSubmitLoading(false);
  };

  /* ===========================
     TOGGLE
  =========================== */
  const handleToggleActive = async (product) =>
    toggleProduct(product._id, {
      isActive: !product.isActive,
      isFeatured: product.isFeatured,
    });

  const handleToggleFeatured = async (product) =>
    toggleProduct(product._id, {
      isActive: product.isActive,
      isFeatured: !product.isFeatured,
    });

  /* ===========================
     RESET
  =========================== */
  const resetForm = () => {
    setForm(EMPTY_FORM);
    setImagePreviews([]);
    setErrors({});
  };

  const hasActiveFilters =
    searchQuery || categoryFilter !== "all" || statusFilter !== "all";

  /* ===========================
     SHARED FORM PROPS
  =========================== */
  const formProps = {
    form,
    setForm,
    errors,
    clearError,
    rootCategories,
    getChildren,
    isPaanCategory,
    imagePreviews,
    handleImageChange,
    removeImage,
    addVariant,
    removeVariant,
    updateVariant,
    submitLoading,
  };

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
              Product Management
            </h1>
            <p className="text-base text-gray-600">
              Manage inventory, pricing, and product visibility
            </p>
          </div>
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="bg-[#12351a] hover:bg-[#0f2916] h-11 px-6"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>
      </motion.div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Products"
          value={stats.total}
          icon={Package}
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
          title="Featured"
          value={stats.featured}
          icon={Star}
          color="purple"
          delay={0.3}
        />
      </div>

      {/* FILTERS */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border-gray-200 shadow-md">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search products by name…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11"
                />
              </div>

              {/* Category filter — uses real category ids */}
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-52 h-11">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    <SelectValue placeholder="Category" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {rootCategories.map((cat) => (
                    <SelectItem key={cat._id} value={cat._id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Status filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-44 h-11">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    <SelectValue placeholder="Status" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active Only</SelectItem>
                  <SelectItem value="inactive">Inactive Only</SelectItem>
                  <SelectItem value="featured">Featured Only</SelectItem>
                </SelectContent>
              </Select>

              {hasActiveFilters && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setCategoryFilter("all");
                    setStatusFilter("all");
                  }}
                  className="h-11"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              )}
            </div>

            {hasActiveFilters && (
              <div className="mt-4 flex flex-wrap gap-2">
                {searchQuery && (
                  <Badge variant="secondary" className="px-3 py-1.5">
                    Search: {searchQuery}
                  </Badge>
                )}
                {categoryFilter !== "all" && (
                  <Badge variant="secondary" className="px-3 py-1.5">
                    Category:{" "}
                    {rootCategories.find((c) => c._id === categoryFilter)
                      ?.name || categoryFilter}
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

      {/* PRODUCTS LIST */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="border-gray-200 shadow-lg">
          <CardHeader className="border-b border-gray-100 bg-gray-50/50">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#12351a]" />
              All Products ({filteredProducts.length})
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-[#12351a]" />
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No products found
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  {hasActiveFilters
                    ? "Try adjusting your filters"
                    : "Add your first product to get started"}
                </p>
                {!hasActiveFilters && (
                  <Button
                    onClick={() => setShowCreateDialog(true)}
                    className="bg-[#12351a] hover:bg-[#0f2916]"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Product
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                <AnimatePresence>
                  {filteredProducts.map((product, index) => (
                    <motion.div
                      key={product._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.04 }}
                    >
                      <ProductCard
                        product={product}
                        onEdit={openEditDialog}
                        onDelete={openDeleteDialog}
                        onToggleActive={handleToggleActive}
                        onToggleFeatured={handleToggleFeatured}
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-blue-100 rounded-full">
                <Plus className="w-6 h-6 text-blue-600" />
              </div>
              <DialogTitle className="text-2xl">Add New Product</DialogTitle>
            </div>
            <p className="text-sm text-gray-600">
              Fill in the product details below
            </p>
          </DialogHeader>
          <ProductForm
            {...formProps}
            onSubmit={handleCreate}
            onCancel={() => {
              setShowCreateDialog(false);
              resetForm();
            }}
          />
        </DialogContent>
      </Dialog>

      {/* EDIT DIALOG */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-amber-100 rounded-full">
                <Edit className="w-6 h-6 text-amber-600" />
              </div>
              <DialogTitle className="text-2xl">Edit Product</DialogTitle>
            </div>
            <p className="text-sm text-gray-600">
              Update product details below
            </p>
          </DialogHeader>
          <ProductForm
            {...formProps}
            onSubmit={handleEdit}
            onCancel={() => {
              setShowEditDialog(false);
              setProductToEdit(null);
              resetForm();
            }}
            isEdit
          />
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
                Delete Product?
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-base space-y-4 pt-2">
              <p className="text-gray-700">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-gray-900">
                  "{productToDelete?.name}"
                </span>
                ?
              </p>
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-800">
                  <strong>Warning:</strong> This action cannot be undone. The
                  product and all its images will be permanently deleted.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel
              onClick={() => {
                setShowDeleteDialog(false);
                setProductToDelete(null);
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
                  Delete Product
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
   PRODUCT CARD
=========================== */
function ProductCard({
  product,
  onEdit,
  onDelete,
  onToggleActive,
  onToggleFeatured,
}) {
  const isPaan = product.isPaan;

  return (
    <Card className="border-gray-200 shadow-md hover:shadow-lg transition-all overflow-hidden group flex flex-col h-full">
      {/* Image */}
      <div className="relative h-56 bg-gray-100 overflow-hidden shrink-0">
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-12 h-12 text-gray-300" />
          </div>
        )}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          {product.isActive && (
            <Badge className="bg-emerald-500 text-white border-0 shadow-md">
              Active
            </Badge>
          )}
          {product.isFeatured && (
            <Badge className="bg-amber-500 text-white border-0 shadow-md">
              <Star className="w-3 h-3 mr-1 fill-white" />
              Featured
            </Badge>
          )}
        </div>
      </div>

      <CardContent className="p-4 flex flex-col flex-1">
        {/* Title & Category */}
        <div className="mb-3">
          <h3 className="text-base font-bold text-gray-900 mb-2 line-clamp-2 min-h-12">
            {product.name}
          </h3>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Show populated name or fallback */}
            {product.parentCategory &&
              product.parentCategory !== product.category && (
                <Badge variant="outline" className="text-xs gap-1">
                  <FolderOpen className="w-3 h-3" />
                  {resolveCatName(product.parentCategory)}
                </Badge>
              )}
            <Badge variant="outline" className="text-xs gap-1">
              <Tag className="w-3 h-3" />
              {resolveCatName(product.category)}
            </Badge>
          </div>
        </div>

        {/* Pricing */}
        <div className="mb-3 min-h-14">
          {!isPaan ? (
            <div className="space-y-0.5">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-2xl font-bold text-emerald-600">
                  ₹{product.discountedPrice}
                </span>
                <span className="text-sm text-gray-400 line-through">
                  ₹{product.originalPrice}
                </span>
              </div>
              {product.originalPrice > 0 && (
                <span className="text-xs text-emerald-600 font-semibold">
                  {Math.round(
                    ((product.originalPrice - product.discountedPrice) /
                      product.originalPrice) *
                      100,
                  )}
                  % OFF
                </span>
              )}
            </div>
          ) : (
            <div className="text-sm text-gray-600">
              <div className="font-semibold mb-0.5">
                {product.variants?.length || 0} variant
                {product.variants?.length !== 1 ? "s" : ""} available
              </div>
              {product.variants?.length > 0 && (
                <div className="text-xs text-gray-500">
                  From ₹
                  {Math.min(...product.variants.map((v) => v.discountedPrice))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Stock (non-paan) */}
        <div className="mb-4 min-h-5">
          {!isPaan && (
            <p className="text-xs text-gray-500">
              Stock: <span className="font-semibold">{product.stock ?? 0}</span>
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="mt-auto space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(product)}
              className="h-9"
            >
              <Edit className="w-3 h-3 mr-1.5" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onToggleFeatured(product)}
              className={cn(
                "h-9",
                product.isFeatured && "bg-amber-50 border-amber-300",
              )}
            >
              <Star
                className={cn(
                  "w-3 h-3 mr-1.5",
                  product.isFeatured && "fill-amber-400 text-amber-400",
                )}
              />
              {product.isFeatured ? "Unfeature" : "Feature"}
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onToggleActive(product)}
              className={cn(
                "h-9",
                product.isActive
                  ? "bg-amber-50 border-amber-300"
                  : "bg-emerald-50 border-emerald-300",
              )}
            >
              <Power className="w-3 h-3 mr-1.5" />
              {product.isActive ? "Deactivate" : "Activate"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(product)}
              className="text-red-500 hover:text-red-600 hover:bg-red-50 h-9"
            >
              <Trash2 className="w-3 h-3 mr-1.5" />
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ===========================
   PRODUCT FORM
=========================== */
function ProductForm({
  form,
  setForm,
  errors,
  clearError,
  rootCategories,
  getChildren,
  isPaanCategory,
  imagePreviews,
  handleImageChange,
  removeImage,
  addVariant,
  removeVariant,
  updateVariant,
  onSubmit,
  submitLoading,
  onCancel,
  isEdit = false,
}) {
  const subcategoryOptions = form.categoryId
    ? getChildren(form.categoryId)
    : [];

  return (
    <form onSubmit={onSubmit} className="space-y-6 pt-4">
      {/* ── Basic Info ── */}
      <section className="space-y-4">
        <h3 className="font-semibold text-gray-900 border-b pb-2">
          Basic Information
        </h3>

        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="prod_name">Product Name *</Label>
          <Input
            id="prod_name"
            value={form.name}
            onChange={(e) => {
              setForm((f) => ({ ...f, name: e.target.value }));
              clearError("name");
            }}
            className={cn("h-11", errors.name && "border-red-400")}
            placeholder="e.g., Premium Digestive Mix"
          />
          {errors.name && <FieldError msg={errors.name} />}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Root Category */}
          <div className="space-y-2">
            <Label>Category *</Label>
            <Select
              value={form.categoryId}
              onValueChange={(val) => {
                setForm((f) => ({ ...f, categoryId: val, subcategoryId: "" }));
                clearError("categoryId");
              }}
            >
              <SelectTrigger
                className={cn("h-11", errors.categoryId && "border-red-400")}
              >
                <div className="flex items-center gap-2">
                  <FolderOpen className="w-4 h-4 text-gray-400" />
                  <SelectValue placeholder="Select category" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {rootCategories.map((cat) => (
                  <SelectItem key={cat._id} value={cat._id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.categoryId && <FieldError msg={errors.categoryId} />}
          </div>

          {/* Subcategory — only shown when root has children */}
          {subcategoryOptions.length > 0 && (
            <div className="space-y-2">
              <Label>Subcategory</Label>
              <Select
                value={form.subcategoryId || "none"}
                onValueChange={(val) =>
                  setForm((f) => ({
                    ...f,
                    subcategoryId: val === "none" ? "" : val,
                  }))
                }
              >
                <SelectTrigger className="h-11">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-gray-400" />
                    <SelectValue placeholder="None" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {subcategoryOptions.map((sub) => (
                    <SelectItem key={sub._id} value={sub._id}>
                      {sub.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Selecting a subcategory will link this product directly to it
              </p>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="prod_desc">Description *</Label>
          <Textarea
            id="prod_desc"
            value={form.description}
            onChange={(e) => {
              setForm((f) => ({ ...f, description: e.target.value }));
              clearError("description");
            }}
            className={cn("min-h-24", errors.description && "border-red-400")}
            placeholder="Describe the product…"
          />
          {errors.description && <FieldError msg={errors.description} />}
        </div>

        {/* Additional Info */}
        <div className="space-y-2">
          <Label htmlFor="prod_info">Additional Information</Label>
          <Textarea
            id="prod_info"
            value={form.additionalInfo}
            onChange={(e) =>
              setForm((f) => ({ ...f, additionalInfo: e.target.value }))
            }
            className="min-h-20"
            placeholder="Optional additional details…"
          />
        </div>
      </section>

      {/* ── Images ── */}
      <section className="space-y-4">
        <h3 className="font-semibold text-gray-900 border-b pb-2">
          Product Images *
        </h3>
        <Input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageChange}
          className="h-11"
        />
        <p className="text-xs text-gray-500">
          {isEdit
            ? "Upload new images to replace existing ones (leave empty to keep current images). Max 5."
            : "Upload up to 5 product images."}
        </p>
        {errors.images && <FieldError msg={errors.images} />}

        {imagePreviews.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {imagePreviews.map((preview, i) => (
              <div key={i} className="relative group">
                <img
                  src={preview}
                  alt={`Preview ${i + 1}`}
                  className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Pricing ── */}
      {!isPaanCategory ? (
        <section className="space-y-4">
          <h3 className="font-semibold text-gray-900 border-b pb-2">
            Pricing & Stock
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Original (₹) *</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.originalPrice}
                onChange={(e) => {
                  setForm((f) => ({ ...f, originalPrice: e.target.value }));
                  clearError("originalPrice");
                }}
                className={cn("h-11", errors.originalPrice && "border-red-400")}
                placeholder="0"
              />
              {errors.originalPrice && (
                <FieldError msg={errors.originalPrice} />
              )}
            </div>
            <div className="space-y-2">
              <Label>Discounted (₹) *</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.discountedPrice}
                onChange={(e) => {
                  setForm((f) => ({ ...f, discountedPrice: e.target.value }));
                  clearError("discountedPrice");
                }}
                className={cn(
                  "h-11",
                  errors.discountedPrice && "border-red-400",
                )}
                placeholder="0"
              />
              {errors.discountedPrice && (
                <FieldError msg={errors.discountedPrice} />
              )}
            </div>
            <div className="space-y-2">
              <Label>Stock Quantity</Label>
              <Input
                type="number"
                min="0"
                value={form.stock}
                onChange={(e) =>
                  setForm((f) => ({ ...f, stock: e.target.value }))
                }
                className="h-11"
                placeholder="0"
              />
            </div>
          </div>
        </section>
      ) : (
        /* ── Paan Variants ── */
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="font-semibold text-gray-900">Paan Variants</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addVariant}
            >
              <Plus className="w-3 h-3 mr-1.5" />
              Add Variant
            </Button>
          </div>

          <div className="space-y-4">
            {form.variants.map((variant, i) => (
              <div
                key={i}
                className="p-4 border border-gray-200 rounded-xl bg-gray-50/50 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">
                    Variant {i + 1}
                  </span>
                  {form.variants.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeVariant(i)}
                      className="text-red-500 hover:bg-red-50 h-8"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    {
                      key: "setSize",
                      label: "Set Size *",
                      placeholder: "e.g. 6",
                    },
                    {
                      key: "originalPrice",
                      label: "Original (₹) *",
                      placeholder: "0",
                    },
                    {
                      key: "discountedPrice",
                      label: "Discounted (₹) *",
                      placeholder: "0",
                    },
                    { key: "stock", label: "Stock", placeholder: "0" },
                  ].map(({ key, label, placeholder }) => (
                    <div key={key} className="space-y-1">
                      <Label className="text-xs">{label}</Label>
                      <Input
                        type="number"
                        min="0"
                        step={key.includes("Price") ? "0.01" : "1"}
                        value={variant[key]}
                        onChange={(e) => updateVariant(i, key, e.target.value)}
                        className={cn(
                          "h-10",
                          errors[`v${i}_${key}`] && "border-red-400",
                        )}
                        placeholder={placeholder}
                      />
                      {errors[`v${i}_${key}`] && (
                        <p className="text-xs text-red-500">
                          {errors[`v${i}_${key}`]}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── SEO ── */}
      <section className="space-y-4">
        <h3 className="font-semibold text-gray-900 border-b pb-2">
          SEO Settings
        </h3>

        {/* SEO Title */}
        <div className="space-y-2">
          <Label>SEO Title</Label>
          <Input
            value={form.seoTitle}
            onChange={(e) =>
              setForm((f) => ({ ...f, seoTitle: e.target.value }))
            }
            placeholder="Recommended: 50–60 characters"
            className="h-11"
          />
        </div>

        {/* SEO Description */}
        <div className="space-y-2">
          <Label>Meta Description</Label>
          <Textarea
            value={form.seoDescription}
            onChange={(e) =>
              setForm((f) => ({ ...f, seoDescription: e.target.value }))
            }
            placeholder="Recommended: 150–160 characters"
            className="min-h-20"
            maxLength={160}
          />
          <p className="text-xs text-gray-500">
            {form.seoDescription}/160 characters
          </p>
        </div>

        {/* Keywords */}
        <div className="space-y-2">
          <Label>Keywords</Label>
          <Input
            value={form.seoKeywords}
            onChange={(e) =>
              setForm((f) => ({ ...f, seoKeywords: e.target.value }))
            }
            placeholder="e.g. chocolate paan, sweet paan, paan online"
            className="h-11"
          />
          <p className="text-xs text-gray-500">Separate keywords with commas</p>
        </div>
      </section>

      {/* ── Footer ── */}
      <DialogFooter className="gap-2 pt-2">
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
              {isEdit ? "Updating…" : "Creating…"}
            </>
          ) : isEdit ? (
            <>
              <Edit className="w-4 h-4 mr-2" />
              Update Product
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </>
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}

/* ===========================
   FIELD ERROR
=========================== */
function FieldError({ msg }) {
  return (
    <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
      <AlertTriangle className="w-3 h-3 shrink-0" />
      {msg}
    </p>
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
    purple: {
      bg: "bg-purple-100",
      icon: "text-purple-600",
      border: "border-purple-200",
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
