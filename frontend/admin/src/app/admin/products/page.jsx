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
  Image as ImageIcon,
  CheckCircle,
  XCircle,
  TrendingUp,
  IndianRupee,
  Layers,
  ShoppingBag,
} from "lucide-react";
import toast from "react-hot-toast";

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

// Categories and subcategories
const CATEGORIES = ["Digestive", "Candy & More", "Mouth Fresheners", "Paan"];
const PAAN_SUBCATEGORIES = [
  "Meetha & Sada Paan",
  "Chocolate Paan",
  "Dry Fruit Paan",
  "Chocolate Coated Paan",
  "Fruit Paan",
  "Paan Truffle",
];

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

  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);

  // Form state
  const [form, setForm] = useState({
    name: "",
    category: "",
    subcategory: "",
    description: "",
    additionalInfo: "",
    images: [],
    originalPrice: "",
    discountedPrice: "",
    stock: "",
    variants: [
      { setSize: "", originalPrice: "", discountedPrice: "", stock: "" },
    ],
  });

  const [imagePreviews, setImagePreviews] = useState([]);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [filteredProducts, setFilteredProducts] = useState([]);

  /* ===========================
     INIT
  =========================== */
  useEffect(() => {
    fetchProducts();
  }, []);

  /* ===========================
     FILTER PRODUCTS
  =========================== */
  useEffect(() => {
    let filtered = products;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((p) => p.category === categoryFilter);
    }

    // Status filter
    if (statusFilter === "active") {
      filtered = filtered.filter((p) => p.isActive);
    } else if (statusFilter === "inactive") {
      filtered = filtered.filter((p) => !p.isActive);
    } else if (statusFilter === "featured") {
      filtered = filtered.filter((p) => p.isFeatured);
    }

    setFilteredProducts(filtered);
  }, [searchQuery, categoryFilter, statusFilter, products]);

  /* ===========================
     STATS CALCULATION
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
    if (!form.category) newErrors.category = "Category is required";
    if (form.category === "Paan" && !form.subcategory) {
      newErrors.subcategory = "Subcategory is required for Paan";
    }
    if (!form.description.trim())
      newErrors.description = "Description is required";

    // Only require images for create, not for edit
    if (!productToEdit && form.images.length === 0) {
      newErrors.images = "At least one image is required";
    }

    if (form.category !== "Paan") {
      if (!form.originalPrice || Number(form.originalPrice) <= 0) {
        newErrors.originalPrice = "Original price must be greater than 0";
      }
      if (!form.discountedPrice || Number(form.discountedPrice) <= 0) {
        newErrors.discountedPrice = "Discounted price must be greater than 0";
      }
      if (Number(form.discountedPrice) > Number(form.originalPrice)) {
        newErrors.discountedPrice =
          "Discounted price cannot exceed original price";
      }
    } else {
      // Validate Paan variants
      form.variants.forEach((v, index) => {
        if (!v.setSize || Number(v.setSize) <= 0) {
          newErrors[`variant_${index}_setSize`] = "Set size required";
        }
        if (!v.originalPrice || Number(v.originalPrice) <= 0) {
          newErrors[`variant_${index}_originalPrice`] =
            "Original price required";
        }
        if (!v.discountedPrice || Number(v.discountedPrice) <= 0) {
          newErrors[`variant_${index}_discountedPrice`] =
            "Discounted price required";
        }
        if (Number(v.discountedPrice) > Number(v.originalPrice)) {
          newErrors[`variant_${index}_discountedPrice`] =
            "Cannot exceed original price";
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ===========================
     IMAGE HANDLING
  =========================== */
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length + form.images.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }

    setForm({ ...form, images: [...form.images, ...files] });

    // Create previews
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setForm({
      ...form,
      images: form.images.filter((_, i) => i !== index),
    });
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  /* ===========================
     VARIANT HANDLING
  =========================== */
  const addVariant = () => {
    setForm({
      ...form,
      variants: [
        ...form.variants,
        { setSize: "", originalPrice: "", discountedPrice: "", stock: "" },
      ],
    });
  };

  const removeVariant = (index) => {
    if (form.variants.length === 1) {
      toast.error("At least one variant is required for Paan products");
      return;
    }
    setForm({
      ...form,
      variants: form.variants.filter((_, i) => i !== index),
    });
  };

  const updateVariant = (index, field, value) => {
    const newVariants = [...form.variants];
    newVariants[index][field] = value;
    setForm({ ...form, variants: newVariants });
  };

  /* ===========================
     CREATE PRODUCT
  =========================== */
  const handleCreateProduct = async (e) => {
    e.preventDefault();

    if (!validate()) {
      toast.error("Please fix validation errors");
      return;
    }

    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("category", form.category);
    if (form.subcategory) fd.append("subcategory", form.subcategory);
    fd.append("description", form.description);
    if (form.additionalInfo) fd.append("additionalInfo", form.additionalInfo);

    form.images.forEach((img) => fd.append("images", img));

    if (form.category !== "Paan") {
      fd.append("originalPrice", form.originalPrice);
      fd.append("discountedPrice", form.discountedPrice);
      fd.append("stock", form.stock || "0");
    } else {
      fd.append("variants", JSON.stringify(form.variants));
    }

    setSubmitLoading(true);
    const ok = await createProduct(fd);
    if (ok) {
      resetForm();
      setShowCreateDialog(false);
      await fetchProducts();
    }
    setSubmitLoading(false);
  };

  /* ===========================
     EDIT PRODUCT
  =========================== */
  const openEditDialog = (product) => {
    setProductToEdit(product);

    // Pre-fill form with product data
    setForm({
      name: product.name,
      category: product.category,
      subcategory: product.subcategory || "",
      description: product.description,
      additionalInfo: product.additionalInfo || "",
      images: [], // New images to upload
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

    // Set existing images as previews
    setImagePreviews(product.images || []);
    setShowEditDialog(true);
  };

  const handleEditProduct = async (e) => {
    e.preventDefault();

    if (!validate()) {
      toast.error("Please fix validation errors");
      return;
    }

    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("category", form.category);
    if (form.subcategory) fd.append("subcategory", form.subcategory);
    fd.append("description", form.description);
    if (form.additionalInfo) fd.append("additionalInfo", form.additionalInfo);

    // Only append new images if any were selected
    if (form.images.length > 0) {
      form.images.forEach((img) => fd.append("images", img));
    }

    if (form.category !== "Paan") {
      fd.append("originalPrice", form.originalPrice);
      fd.append("discountedPrice", form.discountedPrice);
      fd.append("stock", form.stock || "0");
    } else {
      fd.append("variants", JSON.stringify(form.variants));
    }

    setSubmitLoading(true);
    const ok = await updateProduct(productToEdit._id, fd);
    if (ok) {
      resetForm();
      setShowEditDialog(false);
      setProductToEdit(null);
      await fetchProducts();
    }
    setSubmitLoading(false);
  };

  /* ===========================
     DELETE PRODUCT
  =========================== */
  const openDeleteDialog = (product) => {
    setProductToDelete(product);
    setShowDeleteDialog(true);
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;

    setSubmitLoading(true);
    const ok = await deleteProduct(productToDelete._id);
    if (ok) {
      setShowDeleteDialog(false);
      setProductToDelete(null);
      await fetchProducts();
    }
    setSubmitLoading(false);
  };

  /* ===========================
     TOGGLE STATUS
  =========================== */
  const handleToggleActive = async (product) => {
    const ok = await toggleProduct(product._id, {
      isActive: !product.isActive,
      isFeatured: product.isFeatured,
    });
    if (ok) await fetchProducts();
  };

  const handleToggleFeatured = async (product) => {
    const ok = await toggleProduct(product._id, {
      isActive: product.isActive,
      isFeatured: !product.isFeatured,
    });
    if (ok) await fetchProducts();
  };

  /* ===========================
     RESET FORM
  =========================== */
  const resetForm = () => {
    setForm({
      name: "",
      category: "",
      subcategory: "",
      description: "",
      additionalInfo: "",
      images: [],
      originalPrice: "",
      discountedPrice: "",
      stock: "",
      variants: [
        { setSize: "", originalPrice: "", discountedPrice: "", stock: "" },
      ],
    });
    setImagePreviews([]);
    setErrors({});
  };

  /* ===========================
     CLEAR FILTERS
  =========================== */
  const clearFilters = () => {
    setSearchQuery("");
    setCategoryFilter("all");
    setStatusFilter("all");
  };

  const hasActiveFilters =
    searchQuery || categoryFilter !== "all" || statusFilter !== "all";

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

      {/* STATS CARDS */}
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
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search products by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-11"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-50 h-11">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    <SelectValue placeholder="Category" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-45 h-11">
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
                {categoryFilter !== "all" && (
                  <Badge variant="secondary" className="px-3 py-1.5">
                    Category: {categoryFilter}
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
                      transition={{ delay: index * 0.05 }}
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

      {/* CREATE PRODUCT DIALOG */}
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
            form={form}
            setForm={setForm}
            errors={errors}
            setErrors={setErrors}
            imagePreviews={imagePreviews}
            handleImageChange={handleImageChange}
            removeImage={removeImage}
            addVariant={addVariant}
            removeVariant={removeVariant}
            updateVariant={updateVariant}
            onSubmit={handleCreateProduct}
            submitLoading={submitLoading}
            onCancel={() => {
              setShowCreateDialog(false);
              resetForm();
            }}
          />
        </DialogContent>
      </Dialog>

      {/* EDIT PRODUCT DIALOG */}
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
            form={form}
            setForm={setForm}
            errors={errors}
            setErrors={setErrors}
            imagePreviews={imagePreviews}
            handleImageChange={handleImageChange}
            removeImage={removeImage}
            addVariant={addVariant}
            removeVariant={removeVariant}
            updateVariant={updateVariant}
            onSubmit={handleEditProduct}
            submitLoading={submitLoading}
            onCancel={() => {
              setShowEditDialog(false);
              setProductToEdit(null);
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
          <AlertDialogFooter className="gap-2 sm:gap-2">
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
              onClick={handleDeleteProduct}
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
   PRODUCT CARD COMPONENT
=========================== */
function ProductCard({
  product,
  onEdit,
  onDelete,
  onToggleActive,
  onToggleFeatured,
}) {
  const isPaan = product.category === "Paan";

  return (
    <Card className="border-gray-200 shadow-md hover:shadow-lg transition-all overflow-hidden group">
      {/* Product Image */}
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 right-3 flex gap-2">
          {product.isActive && (
            <Badge className="bg-emerald-500 text-white border-0">Active</Badge>
          )}
          {product.isFeatured && (
            <Badge className="bg-amber-500 text-white border-0">
              <Star className="w-3 h-3 mr-1 fill-white" />
              Featured
            </Badge>
          )}
        </div>
      </div>

      <CardContent className="pt-5 space-y-4">
        {/* Title & Category */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2">
            {product.name}
          </h3>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Badge variant="outline">{product.category}</Badge>
            {product.subcategory && (
              <Badge variant="outline">{product.subcategory}</Badge>
            )}
          </div>
        </div>

        {/* Pricing */}
        {!isPaan ? (
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-600">
              ₹{product.discountedPrice}
            </span>
            <span className="text-sm text-gray-400 line-through">
              ₹{product.originalPrice}
            </span>
            <span className="text-xs text-emerald-600 font-semibold">
              {Math.round(
                ((product.originalPrice - product.discountedPrice) /
                  product.originalPrice) *
                  100,
              )}
              % OFF
            </span>
          </div>
        ) : (
          <div className="text-sm text-gray-600">
            <span className="font-semibold">{product.variants.length}</span>{" "}
            variants
            <div className="mt-1 text-xs text-gray-500">
              Starting from ₹
              {Math.min(...product.variants.map((v) => v.discountedPrice))}
            </div>
          </div>
        )}

        {/* Stock */}
        {!isPaan && (
          <div className="text-xs text-gray-500">
            Stock: <span className="font-semibold">{product.stock || 0}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(product)}
            className="flex-1"
          >
            <Edit className="w-3 h-3 mr-1.5" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggleFeatured(product)}
            className={cn(
              "flex-1",
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
          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggleActive(product)}
            className={cn(
              "flex-1",
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
   PRODUCT FORM COMPONENT
=========================== */
function ProductForm({
  form,
  setForm,
  errors,
  setErrors,
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
  const isPaan = form.category === "Paan";

  const clearError = (field) => {
    const newErrors = { ...errors };
    delete newErrors[field];
    setErrors(newErrors);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6 pt-4">
      {/* Basic Info */}
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900">Basic Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Product Name */}
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="name">Product Name *</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => {
                setForm({ ...form, name: e.target.value });
                clearError("name");
              }}
              className={cn("h-11", errors.name && "border-red-400")}
              placeholder="e.g., Premium Digestive Mix"
            />
            {errors.name && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {errors.name}
              </p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Category *</Label>
            <Select
              value={form.category}
              onValueChange={(value) => {
                setForm({ ...form, category: value, subcategory: "" });
                clearError("category");
              }}
            >
              <SelectTrigger
                className={cn("h-11", errors.category && "border-red-400")}
              >
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-xs text-red-500">{errors.category}</p>
            )}
          </div>

          {/* Subcategory (Paan only) */}
          {form.category === "Paan" && (
            <div className="space-y-2">
              <Label>Subcategory *</Label>
              <Select
                value={form.subcategory}
                onValueChange={(value) => {
                  setForm({ ...form, subcategory: value });
                  clearError("subcategory");
                }}
              >
                <SelectTrigger
                  className={cn("h-11", errors.subcategory && "border-red-400")}
                >
                  <SelectValue placeholder="Select subcategory" />
                </SelectTrigger>
                <SelectContent>
                  {PAAN_SUBCATEGORIES.map((sub) => (
                    <SelectItem key={sub} value={sub}>
                      {sub}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.subcategory && (
                <p className="text-xs text-red-500">{errors.subcategory}</p>
              )}
            </div>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            value={form.description}
            onChange={(e) => {
              setForm({ ...form, description: e.target.value });
              clearError("description");
            }}
            className={cn(
              "min-h-25",
              errors.description && "border-red-400",
            )}
            placeholder="Describe the product..."
          />
          {errors.description && (
            <p className="text-xs text-red-500">{errors.description}</p>
          )}
        </div>

        {/* Additional Info */}
        <div className="space-y-2">
          <Label htmlFor="additionalInfo">Additional Information</Label>
          <Textarea
            id="additionalInfo"
            value={form.additionalInfo}
            onChange={(e) =>
              setForm({ ...form, additionalInfo: e.target.value })
            }
            className="min-h-20"
            placeholder="Optional additional details..."
          />
        </div>
      </div>

      {/* Images */}
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900">Product Images *</h3>

        <div className="space-y-2">
          <Input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            className="h-11"
          />
          <p className="text-xs text-gray-500">
            {isEdit
              ? "Upload new images to replace existing ones (optional). Leave empty to keep current images."
              : "Upload up to 5 images"}
          </p>
          {errors.images && (
            <p className="text-xs text-red-500">{errors.images}</p>
          )}
        </div>

        {/* Image Previews */}
        {imagePreviews.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="relative group">
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pricing */}
      {!isPaan ? (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Pricing & Stock</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Original Price */}
            <div className="space-y-2">
              <Label htmlFor="originalPrice">Original (₹) *</Label>
              <Input
                id="originalPrice"
                type="number"
                min="0"
                step="0.01"
                value={form.originalPrice}
                onChange={(e) => {
                  setForm({ ...form, originalPrice: e.target.value });
                  clearError("originalPrice");
                }}
                className={cn("h-11", errors.originalPrice && "border-red-400")}
              />
              {errors.originalPrice && (
                <p className="text-xs text-red-500">{errors.originalPrice}</p>
              )}
            </div>

            {/* Discounted Price */}
            <div className="space-y-2">
              <Label htmlFor="discountedPrice">Discounted (₹) *</Label>
              <Input
                id="discountedPrice"
                type="number"
                min="0"
                step="0.01"
                value={form.discountedPrice}
                onChange={(e) => {
                  setForm({ ...form, discountedPrice: e.target.value });
                  clearError("discountedPrice");
                }}
                className={cn(
                  "h-11",
                  errors.discountedPrice && "border-red-400",
                )}
              />
              {errors.discountedPrice && (
                <p className="text-xs text-red-500">{errors.discountedPrice}</p>
              )}
            </div>

            {/* Stock */}
            <div className="space-y-2">
              <Label htmlFor="stock">Stock Quantity</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                className="h-11"
              />
            </div>
          </div>
        </div>
      ) : (
        /* Paan Variants */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
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
            {form.variants.map((variant, index) => (
              <div
                key={index}
                className="p-4 border border-gray-200 rounded-lg space-y-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-gray-700">
                    Variant {index + 1}
                  </h4>
                  {form.variants.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeVariant(index)}
                      className="text-red-500"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {/* Set Size */}
                  <div className="space-y-1">
                    <Label className="text-xs">Set Size *</Label>
                    <Input
                      type="number"
                      min="1"
                      value={variant.setSize}
                      onChange={(e) =>
                        updateVariant(index, "setSize", e.target.value)
                      }
                      className={cn(
                        "h-10",
                        errors[`variant_${index}_setSize`] && "border-red-400",
                      )}
                      placeholder="e.g., 6"
                    />
                    {errors[`variant_${index}_setSize`] && (
                      <p className="text-xs text-red-500">
                        {errors[`variant_${index}_setSize`]}
                      </p>
                    )}
                  </div>

                  {/* Original Price */}
                  <div className="space-y-1">
                    <Label className="text-xs">Original (₹) *</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={variant.originalPrice}
                      onChange={(e) =>
                        updateVariant(index, "originalPrice", e.target.value)
                      }
                      className={cn(
                        "h-10",
                        errors[`variant_${index}_originalPrice`] &&
                          "border-red-400",
                      )}
                    />
                    {errors[`variant_${index}_originalPrice`] && (
                      <p className="text-xs text-red-500">
                        {errors[`variant_${index}_originalPrice`]}
                      </p>
                    )}
                  </div>

                  {/* Discounted Price */}
                  <div className="space-y-1">
                    <Label className="text-xs">Discounted (₹) *</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={variant.discountedPrice}
                      onChange={(e) =>
                        updateVariant(index, "discountedPrice", e.target.value)
                      }
                      className={cn(
                        "h-10",
                        errors[`variant_${index}_discountedPrice`] &&
                          "border-red-400",
                      )}
                    />
                    {errors[`variant_${index}_discountedPrice`] && (
                      <p className="text-xs text-red-500">
                        {errors[`variant_${index}_discountedPrice`]}
                      </p>
                    )}
                  </div>

                  {/* Stock */}
                  <div className="space-y-1">
                    <Label className="text-xs">Stock</Label>
                    <Input
                      type="number"
                      min="0"
                      value={variant.stock}
                      onChange={(e) =>
                        updateVariant(index, "stock", e.target.value)
                      }
                      className="h-10"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
              {isEdit ? "Updating..." : "Creating..."}
            </>
          ) : (
            <>
              {isEdit ? (
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
