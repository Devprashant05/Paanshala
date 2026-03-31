"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useProductStore } from "@/stores/useProductStore";
import { useCartStore } from "@/stores/useCartStore";
import { useUserStore } from "@/stores/useUserStore";
import { useGuestCartStore } from "@/stores/useGuestCartStore";
import { useCategoryStore } from "@/stores/useCategoryStore";
import {
  Search,
  SlidersHorizontal,
  ShoppingBag,
  X,
  ShoppingCart,
  Eye,
  Loader2,
  ChevronRight,
  Tag,
  FolderOpen,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "newest", label: "Newest First" },
];

/* ── helpers ── */
const resolveName = (f) => (f && typeof f === "object" ? f.name : f) || "";
const resolveId = (f) => (f && typeof f === "object" ? f._id : f) || null;

export default function CollectionPage() {
  const { slug } = useParams();
  const router = useRouter();

  const { categories, fetchActiveCategories } = useCategoryStore();
  const { products, loading, filterProducts } = useProductStore();
  const { isAuthenticated } = useUserStore();

  const [activeChildId, setActiveChildId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  /* ── load categories if not yet fetched ── */
  useEffect(() => {
    if (!categories.length) fetchActiveCategories();
  }, []);

  /* ── resolve current category from slug ── */
  const currentCategory = useMemo(() => {
    if (!slug || !categories.length) return null;

    // Check roots first
    for (const root of categories) {
      if (root.slug === slug) return { ...root, isRoot: true };
      // Check children
      const child = root.children?.find((c) => c.slug === slug);
      if (child) return { ...child, isRoot: false, rootCategory: root };
    }
    return null;
  }, [slug, categories]);

  /* ── fetch products when category resolves ── */
  useEffect(() => {
    if (!currentCategory) return;

    if (activeChildId) {
      // A specific child is selected — filter by leaf category _id
      filterProducts({ category: activeChildId });
    } else if (currentCategory.isRoot) {
      // Root category: products store the root in parentCategory, not category
      filterProducts({ parentCategory: currentCategory._id });
    } else {
      // Leaf category: products store the leaf in category
      filterProducts({ category: currentCategory._id });
    }
  }, [currentCategory, activeChildId]);

  /* ── filtered + sorted products ── */
  const displayProducts = useMemo(() => {
    let result = [...products];

    // Guard against stale data from a previous category fetch
    if (currentCategory) {
      result = result.filter((p) => {
        const catId = resolveId(p.category);
        const parentId = resolveId(p.parentCategory);

        if (activeChildId) return catId === activeChildId;

        if (currentCategory.isRoot) {
          // Root: match products whose parentCategory is this root
          return parentId === currentCategory._id;
        }
        // Leaf: match products whose category is this leaf
        return catId === currentCategory._id;
      });
    }

    if (searchQuery) {
      result = result.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    switch (sortBy) {
      case "price-low":
        result.sort((a, b) => {
          const pa = a.discountedPrice ?? a.variants?.[0]?.discountedPrice ?? 0;
          const pb = b.discountedPrice ?? b.variants?.[0]?.discountedPrice ?? 0;
          return pa - pb;
        });
        break;
      case "price-high":
        result.sort((a, b) => {
          const pa = a.discountedPrice ?? a.variants?.[0]?.discountedPrice ?? 0;
          const pb = b.discountedPrice ?? b.variants?.[0]?.discountedPrice ?? 0;
          return pb - pa;
        });
        break;
      case "newest":
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case "featured":
      default:
        result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    }

    return result;
  }, [products, searchQuery, sortBy, currentCategory, activeChildId]);

  /* ── child-filter click ── */
  const handleChildClick = (childId) => {
    setActiveChildId((prev) => (prev === childId ? null : childId));
    setMobileFiltersOpen(false);
  };

  /* ── not found ── */
  if (categories.length > 0 && !currentCategory) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
        <ShoppingBag className="w-16 h-16 text-gray-300" />
        <h1 className="text-2xl font-bold text-gray-900">Category not found</h1>
        <p className="text-gray-500">
          The collection "{slug}" doesn't exist or has been removed.
        </p>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#2d5016] text-white rounded-xl font-semibold hover:bg-[#3d6820] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Go Back
        </button>
      </div>
    );
  }

  const children = currentCategory?.children || [];

  return (
    <div className="min-h-screen bg-linear-to-b from-white to-gray-50">
      {/* ── Page Hero ── */}
      <div className="bg-linear-to-r from-[#2d5016] via-[#3d6820] to-[#2d5016] py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-white/60 mb-4">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3 h-3" />
            {currentCategory?.rootCategory && (
              <>
                <Link
                  href={`/collections/${currentCategory.rootCategory.slug}`}
                  className="hover:text-white transition-colors"
                >
                  {currentCategory.rootCategory.name}
                </Link>
                <ChevronRight className="w-3 h-3" />
              </>
            )}
            <span className="text-white font-medium">
              {currentCategory?.name || "Loading…"}
            </span>
          </nav>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
              {currentCategory?.isRoot ? (
                <FolderOpen className="w-6 h-6 text-[#d4af37]" />
              ) : (
                <Tag className="w-5 h-5 text-[#d4af37]" />
              )}
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                {currentCategory?.name || "Collection"}
              </h1>
              <p className="text-white/70 text-sm mt-1">
                {displayProducts.length} product
                {displayProducts.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Sub-category pills (only for root categories with children) ── */}
      {children.length > 0 && (
        <div className="bg-white border-b border-gray-100 sticky top-[calc(var(--navbar-height,5rem))] z-20 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center gap-2 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setActiveChildId(null)}
              className={cn(
                "shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all border",
                !activeChildId
                  ? "bg-[#2d5016] text-white border-[#2d5016] shadow-sm"
                  : "bg-white text-gray-600 border-gray-200 hover:border-[#2d5016]/40",
              )}
            >
              All {currentCategory?.name}
            </button>

            {children.map((child) => (
              <button
                key={child._id}
                onClick={() => handleChildClick(child._id)}
                className={cn(
                  "shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all border whitespace-nowrap",
                  activeChildId === child._id
                    ? "bg-[#2d5016] text-white border-[#2d5016] shadow-sm"
                    : "bg-white text-gray-600 border-gray-200 hover:border-[#2d5016]/40",
                )}
              >
                {child.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Main content ── */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="flex gap-8">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-72 shrink-0">
            <FilterSidebar
              categories={categories}
              currentCategory={currentCategory}
              children={children}
              activeChildId={activeChildId}
              onChildClick={handleChildClick}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          </aside>

          {/* Products area */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
              {/* Mobile filter button */}
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl font-semibold text-sm hover:border-[#d4af37] transition-colors"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
              </button>

              {/* Product count — desktop */}
              <p className="hidden lg:block text-sm text-gray-500">
                Showing{" "}
                <span className="font-bold text-gray-900">
                  {displayProducts.length}
                </span>{" "}
                products
              </p>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#d4af37] ml-auto"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Grid */}
            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <ProductSkeleton key={i} />
                ))}
              </div>
            ) : displayProducts.length === 0 ? (
              <EmptyState
                searchQuery={searchQuery}
                onClearSearch={() => setSearchQuery("")}
              />
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <AnimatePresence>
                  {displayProducts.map((product, index) => (
                    <motion.div
                      key={product._id}
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: index * 0.04, duration: 0.4 }}
                      className="h-full"
                    >
                      <ProductCard
                        product={product}
                        isAuthenticated={isAuthenticated}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Mobile filter drawer */}
      <MobileFilterDrawer
        isOpen={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        categories={categories}
        currentCategory={currentCategory}
        children={children}
        activeChildId={activeChildId}
        onChildClick={handleChildClick}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
    </div>
  );
}

/* ═══════════════════════════
   FILTER SIDEBAR
═══════════════════════════ */
function FilterSidebar({
  categories,
  currentCategory,
  children,
  activeChildId,
  onChildClick,
  searchQuery,
  setSearchQuery,
}) {
  return (
    <div className="sticky top-28 space-y-5">
      {/* Search */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wider">
          Search
        </h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search products…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5016]/30 focus:border-[#2d5016]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
      </div>

      {/* Sub-category filter */}
      {children.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wider">
            {currentCategory?.name} Types
          </h3>
          <div className="space-y-1">
            <button
              onClick={() => onChildClick(null)}
              className={cn(
                "w-full text-left px-3 py-2.5 rounded-xl text-sm transition-colors flex items-center justify-between group",
                !activeChildId
                  ? "bg-[#2d5016]/8 text-[#2d5016] font-semibold"
                  : "hover:bg-gray-50 text-gray-600",
              )}
            >
              <span>All {currentCategory?.name}</span>
              {!activeChildId && <ChevronRight className="w-4 h-4" />}
            </button>
            {children.map((child) => (
              <button
                key={child._id}
                onClick={() => onChildClick(child._id)}
                className={cn(
                  "w-full text-left px-3 py-2.5 rounded-xl text-sm transition-colors flex items-center justify-between",
                  activeChildId === child._id
                    ? "bg-[#2d5016]/8 text-[#2d5016] font-semibold"
                    : "hover:bg-gray-50 text-gray-600",
                )}
              >
                <span>{child.name}</span>
                {activeChildId === child._id && (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Browse other categories */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wider">
          Browse
        </h3>
        <div className="space-y-1">
          {categories.map((cat) => (
            <Link
              key={cat._id}
              href={`/collections/${cat.slug}`}
              className={cn(
                "flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-colors",
                cat.slug === currentCategory?.slug ||
                  cat._id === currentCategory?.rootCategory?._id
                  ? "bg-[#d4af37]/10 text-[#2d5016] font-semibold"
                  : "hover:bg-gray-50 text-gray-600",
              )}
            >
              <span>{cat.name}</span>
              <ChevronRight className="w-3.5 h-3.5 opacity-40" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════
   MOBILE DRAWER
═══════════════════════════ */
function MobileFilterDrawer({
  isOpen,
  onClose,
  categories,
  currentCategory,
  children,
  activeChildId,
  onChildClick,
  searchQuery,
  setSearchQuery,
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed left-0 top-0 bottom-0 w-80 bg-white z-50 overflow-y-auto lg:hidden shadow-2xl"
          >
            <div className="p-5">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">Filters</h2>
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <FilterSidebar
                categories={categories}
                currentCategory={currentCategory}
                children={children}
                activeChildId={activeChildId}
                onChildClick={(id) => {
                  onChildClick(id);
                  onClose();
                }}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ═══════════════════════════
   PRODUCT CARD
═══════════════════════════ */
function ProductCard({ product, isAuthenticated }) {
  const { addToCart } = useCartStore();
  const { addItem: addGuestItem } = useGuestCartStore();
  const [isAdding, setIsAdding] = useState(false);

  const isPaan = product.isPaan;
  const hasVariants = isPaan && product.variants?.length > 0;

  /* ── category label ── */
  const categoryName = resolveName(product.category);
  const parentName = resolveName(product.parentCategory);
  const displayLabel =
    categoryName && categoryName !== parentName
      ? categoryName
      : parentName || categoryName;

  /* ── price ── */
  const displayPrice = hasVariants
    ? product.variants[0].discountedPrice
    : product.discountedPrice;

  const originalPrice = hasVariants
    ? product.variants[0].originalPrice
    : product.originalPrice;

  const priceRange =
    hasVariants && product.variants.length > 1
      ? (() => {
          const prices = product.variants.map((v) => v.discountedPrice);
          const min = Math.min(...prices);
          const max = Math.max(...prices);
          return min === max ? `₹${min}` : `₹${min} – ₹${max}`;
        })()
      : null;

  const discount =
    originalPrice && displayPrice && originalPrice > displayPrice
      ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100)
      : 0;

  const isOutOfStock = hasVariants
    ? product.variants.every((v) => (v.stock ?? 0) === 0)
    : (product.stock ?? 0) === 0;

  const handleAddToCart = async () => {
    if (isOutOfStock) return;

    // Paan products always go to detail page for variant selection
    if (isPaan) {
      window.location.href = `/shop/${product._id}`;
      return;
    }

    if (isAuthenticated) {
      setIsAdding(true);
      const ok = await addToCart({ productId: product._id, quantity: 1 });
      if (ok) toast.success("Added to cart!");
      setIsAdding(false);
    } else {
      // Guest — add to localStorage cart
      addGuestItem({
        productId: product._id,
        name: product.name,
        image: product.images?.[0] || null,
        price: displayPrice,
        originalPrice,
        isPaan: false,
        variantSetSize: null,
        quantity: 1,
      });
      toast.success(`${product.name} added to cart!`);
    }
  };

  return (
    <div className="h-full flex flex-col group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-500 overflow-hidden border border-gray-100">
      {/* Image */}
      <Link href={`/shop/${product._id}`}>
        <div className="relative h-48 md:h-56 overflow-hidden bg-gray-100">
          <Image
            src={product.images?.[0] || "/placeholder-product.png"}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700"
          />
          {discount > 0 && (
            <div className="absolute top-3 left-3">
              <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow">
                {discount}% OFF
              </span>
            </div>
          )}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
              <span className="bg-white text-gray-900 px-4 py-2 rounded-full font-bold text-sm">
                Out of Stock
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="flex-1 flex flex-col p-4 text-center">
        <p className="text-xs text-gray-400 mb-1">{displayLabel}</p>

        <Link href={`/shop/${product._id}`}>
          <h3 className="font-bold text-sm md:text-base text-gray-900 mb-2 line-clamp-2 group-hover:text-[#2d5016] transition-colors min-h-10">
            {product.name}
          </h3>
        </Link>

        <p className="text-xs text-gray-500 line-clamp-2 mb-3">
          {product.description}
        </p>

        <div className="flex-1" />

        {/* Price */}
        <div className="mb-4">
          {priceRange ? (
            <p className="text-lg font-bold text-gray-900">{priceRange}</p>
          ) : (
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {discount > 0 && (
                <span className="text-sm text-gray-400 line-through">
                  ₹{originalPrice}
                </span>
              )}
              <span className="text-lg font-bold text-[#2d5016]">
                ₹{displayPrice}
              </span>
            </div>
          )}
        </div>

        {/* CTA — same button for both auth and guest */}
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock || isAdding}
          className={cn(
            "w-full py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2",
            isOutOfStock
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-[#2d5016] hover:bg-[#3d6820] text-white shadow-md",
          )}
        >
          {isAdding ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Adding…
            </>
          ) : isPaan ? (
            <>
              <Eye className="w-4 h-4" />
              Select Options
            </>
          ) : (
            <>
              <ShoppingCart className="w-4 h-4" />
              Add to Cart
            </>
          )}
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════
   SKELETON + EMPTY
═══════════════════════════ */
function ProductSkeleton() {
  return (
    <div className="h-full flex flex-col bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 animate-pulse">
      <div className="h-48 md:h-56 bg-gray-200" />
      <div className="flex-1 flex flex-col p-4 text-center space-y-3">
        <div className="h-3 bg-gray-200 rounded w-20 mx-auto" />
        <div className="h-5 bg-gray-200 rounded w-3/4 mx-auto" />
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="flex-1" />
        <div className="h-6 bg-gray-200 rounded w-28 mx-auto" />
        <div className="h-10 bg-gray-200 rounded" />
      </div>
    </div>
  );
}

function EmptyState({ searchQuery, onClearSearch }) {
  return (
    <div className="text-center py-20 col-span-full">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-6">
        <ShoppingBag className="w-10 h-10 text-gray-300" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">
        {searchQuery ? "No products found" : "No products in this collection"}
      </h3>
      <p className="text-gray-500 mb-6 max-w-sm mx-auto text-sm">
        {searchQuery
          ? `Nothing matched "${searchQuery}". Try a different term.`
          : "Check back soon for new arrivals!"}
      </p>
      {searchQuery && (
        <button
          onClick={onClearSearch}
          className="px-6 py-2.5 bg-[#2d5016] text-white rounded-xl font-semibold hover:bg-[#3d6820] transition-colors"
        >
          Clear Search
        </button>
      )}
    </div>
  );
}
