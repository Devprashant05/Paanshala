"use client";

import { useEffect, useState, useMemo, useRef } from "react";
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
  Check,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { useCartUIStore } from "@/stores/useCartUIStore";
import { useCheckoutUIStore } from "@/stores/useCheckoutUIStore";
import { useGuestCheckoutUIStore } from "@/stores/useGuestCheckoutUIStore";

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "newest", label: "Newest First" },
];

const resolveName = (f) => (f && typeof f === "object" ? f.name : f) || "";
const resolveId = (f) => (f && typeof f === "object" ? f._id : f) || null;

export default function CollectionPage() {
  const { slug } = useParams();
  const router = useRouter();

  const { categories, fetchActiveCategories } = useCategoryStore();
  const { filteredProducts, loading, filterProducts } = useProductStore();
  const { isAuthenticated } = useUserStore();

  const [activeChildId, setActiveChildId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  useEffect(() => {
    if (!categories.length) fetchActiveCategories();
  }, []);

  const currentCategory = useMemo(() => {
    if (!slug || !categories.length) return null;
    for (const root of categories) {
      if (root.slug === slug) return { ...root, isRoot: true };
      const child = root.children?.find((c) => c.slug === slug);
      if (child) return { ...child, isRoot: false, rootCategory: root };
    }
    return null;
  }, [slug, categories]);

  useEffect(() => {
    if (!currentCategory) return;
    if (activeChildId) {
      filterProducts({ category: activeChildId });
    } else if (currentCategory.isRoot) {
      filterProducts({ parentCategory: currentCategory._id });
    } else {
      filterProducts({ category: currentCategory._id });
    }
  }, [currentCategory, activeChildId]);

  const displayProducts = useMemo(() => {
    let result = [...filteredProducts];
    if (currentCategory) {
      result = result.filter((p) => {
        const catId = resolveId(p.category);
        const parentId = resolveId(p.parentCategory);
        if (activeChildId) return catId === activeChildId;
        if (currentCategory.isRoot) return parentId === currentCategory._id;
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
      default:
        result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    }
    return result;
  }, [filteredProducts, searchQuery, sortBy, currentCategory, activeChildId]);

  const handleChildClick = (childId) => {
    setActiveChildId((prev) => (prev === childId ? null : childId));
  };

  if (categories.length > 0 && !currentCategory) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
        <ShoppingBag className="w-16 h-16 text-gray-300" />
        <h1 className="text-2xl font-bold text-gray-900">Category not found</h1>
        <p className="text-gray-500">The collection "{slug}" doesn't exist.</p>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#2d5016] text-white rounded-xl font-semibold hover:bg-[#3d6820] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Go Back
        </button>
      </div>
    );
  }

  const children = currentCategory?.children || [];
  const activeFilters = (activeChildId ? 1 : 0) + (searchQuery ? 1 : 0);

  return (
    <div className="min-h-screen bg-[#fafaf7]">
      {/* ── Hero ── */}
      <div className="relative bg-linear-to-br from-[#1e3a0f] via-[#2d5016] to-[#3d6820] overflow-hidden">
        {/* Subtle grain texture */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")",
            backgroundSize: "200px",
          }}
        />
        {/* Gold accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-0.75 bg-linear-to-r from-transparent via-[#d4af37] to-transparent opacity-60" />

        <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-14">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-[11px] text-white/50 mb-5 uppercase tracking-widest font-medium">
            <Link href="/" className="hover:text-white/80 transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3 h-3" />
            {currentCategory?.rootCategory && (
              <>
                <Link
                  href={`/collections/${currentCategory.rootCategory.slug}`}
                  className="hover:text-white/80 transition-colors"
                >
                  {currentCategory.rootCategory.name}
                </Link>
                <ChevronRight className="w-3 h-3" />
              </>
            )}
            <span className="text-white/80">
              {currentCategory?.name || "…"}
            </span>
          </nav>

          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10">
                {currentCategory?.isRoot ? (
                  <FolderOpen className="w-8 h-8 text-[#d4af37]" />
                ) : (
                  <Tag className="w-4 h-4 text-[#d4af37]" />
                )}
              </div>
              <div>
                <h1 className=" md:text-6xl font-bold text-white tracking-tight">
                  {currentCategory?.name || "Collection"}
                </h1>
                <p className="text-lg text-white/50  mt-0.5">
                  {displayProducts.length} product
                  {displayProducts.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Sub-category pills ── */}
      {children.length > 0 && (
        <div className="bg-white border-b border-gray-100 shadow-sm sticky top-18 z-20">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center gap-2 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setActiveChildId(null)}
              className={cn(
                "shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-all border",
                !activeChildId
                  ? "bg-[#2d5016] text-white border-[#2d5016]"
                  : "bg-white text-gray-600 border-gray-200 hover:border-[#2d5016]/40",
              )}
            >
              All
            </button>
            {children.map((child) => (
              <button
                key={child._id}
                onClick={() => handleChildClick(child._id)}
                className={cn(
                  "shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-all border whitespace-nowrap",
                  activeChildId === child._id
                    ? "bg-[#2d5016] text-white border-[#2d5016]"
                    : "bg-white text-gray-600 border-gray-200 hover:border-[#2d5016]/40",
                )}
              >
                {child.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Main ── */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-7 gap-3">
          <div className="flex items-center gap-3">
            {/* Filter button — always visible, opens drawer */}
            <button
              onClick={() => setFilterDrawerOpen(true)}
              className="relative flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl font-semibold text-sm text-accent-foreground hover:border-[#2d5016]/50 hover:text-[#2d5016] transition-all shadow-sm"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {activeFilters > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#d4af37] text-black text-[10px] font-bold rounded-full flex items-center justify-center">
                  {activeFilters}
                </span>
              )}
            </button>

            {/* Active filter chips */}
            {searchQuery && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2d5016]/8 text-[#2d5016] text-xs font-semibold rounded-full border border-[#2d5016]/20">
                "{searchQuery}"
                <button onClick={() => setSearchQuery("")}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <p className="hidden sm:block text-sm text-gray-400">
              <span className="font-bold text-gray-700">
                {displayProducts.length}
              </span>{" "}
              products
            </p>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#2d5016]/20 text-gray-700 shadow-sm"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Product grid — 3 columns always (2 on mobile) */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5 md:gap-7">
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
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5 md:gap-7">
            <AnimatePresence>
              {displayProducts.map((product, index) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.35 }}
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
      </section>

      {/* ── Filter Drawer (slides in from left) ── */}
      <FilterDrawer
        isOpen={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        categories={categories}
        currentCategory={currentCategory}
        children={children}
        activeChildId={activeChildId}
        onChildClick={(id) => {
          handleChildClick(id);
        }}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        sortBy={sortBy}
        setSortBy={setSortBy}
        displayCount={displayProducts.length}
      />
    </div>
  );
}

/* ═══════════════════════════
   FILTER DRAWER
   Hidden by default, triggered by the Filter button
═══════════════════════════ */
function FilterDrawer({
  isOpen,
  onClose,
  categories,
  currentCategory,
  children,
  activeChildId,
  onChildClick,
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  displayCount,
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="fixed left-0 top-0 bottom-0 w-[320px] max-w-[90vw] bg-white z-50 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#2d5016]" />
                Filters
              </h2>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-7">
              {/* Search */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                  Search
                </p>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-9 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-accent-foreground focus:outline-none focus:ring-2 focus:ring-[#2d5016]/20 focus:border-[#2d5016]"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      <X className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                  )}
                </div>
              </div>

              {/* Sort */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                  Sort By
                </p>
                <div className="space-y-1">
                  {SORT_OPTIONS.map((o) => (
                    <button
                      key={o.value}
                      onClick={() => setSortBy(o.value)}
                      className={cn(
                        "w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm transition-colors",
                        sortBy === o.value
                          ? "bg-[#2d5016]/8 text-[#2d5016] font-semibold"
                          : "text-gray-600 hover:bg-gray-50",
                      )}
                    >
                      <span>{o.label}</span>
                      {sortBy === o.value && <Check className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sub-categories */}
              {children.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                    {currentCategory?.name} Types
                  </p>
                  <div className="space-y-1">
                    <button
                      onClick={() => onChildClick(null)}
                      className={cn(
                        "w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm transition-colors",
                        !activeChildId
                          ? "bg-[#2d5016]/8 text-[#2d5016] font-semibold"
                          : "text-gray-600 hover:bg-gray-50",
                      )}
                    >
                      <span>All {currentCategory?.name}</span>
                      {!activeChildId && <Check className="w-4 h-4" />}
                    </button>
                    {children.map((child) => (
                      <button
                        key={child._id}
                        onClick={() => onChildClick(child._id)}
                        className={cn(
                          "w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm transition-colors",
                          activeChildId === child._id
                            ? "bg-[#2d5016]/8 text-[#2d5016] font-semibold"
                            : "text-gray-600 hover:bg-gray-50",
                        )}
                      >
                        <span>{child.name}</span>
                        {activeChildId === child._id && (
                          <Check className="w-4 h-4" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Browse */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                  Browse Collections
                </p>
                <div className="space-y-1">
                  {categories.map((cat) => (
                    <Link
                      key={cat._id}
                      href={`/collections/${cat.slug}`}
                      onClick={onClose}
                      className={cn(
                        "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm transition-colors",
                        cat.slug === currentCategory?.slug ||
                          cat._id === currentCategory?.rootCategory?._id
                          ? "bg-[#d4af37]/10 text-[#2d5016] font-semibold"
                          : "text-gray-600 hover:bg-gray-50",
                      )}
                    >
                      <span>{cat.name}</span>
                      <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/60">
              <button
                onClick={onClose}
                className="w-full py-3 bg-[#2d5016] hover:bg-[#3d6820] text-white font-bold rounded-xl transition-colors text-sm"
              >
                Show {displayCount} Product{displayCount !== 1 ? "s" : ""}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ═══════════════════════════
   PRODUCT CARD
   3-column big cards with image swap on hover
═══════════════════════════ */
function ProductCard({ product, isAuthenticated }) {
  const router = useRouter();
  const { addToCart } = useCartStore();
  const { addItem: addGuestItem } = useGuestCartStore();
  const { openCart } = useCartUIStore();
 const { openCheckout } = useCheckoutUIStore();
 const { openGuestCheckout } = useGuestCheckoutUIStore();
  const [isAdding, setIsAdding] = useState(false);
  const [imgIndex, setImgIndex] = useState(0); // 0 = first, 1 = second
  const hoverTimeout = useRef(null);

  const isPaan = product.isPaan;
  const hasVariants = isPaan && product.variants?.length > 0;
  const images = product.images || [];
  const hasSecond = images.length > 1;
  const isFreshPaan =
    product.parentCategory?.name === "Fresh Paan" &&
    product.category?.name !== "Paan Truffle";

  const categoryName = resolveName(product.category);
  const parentName = resolveName(product.parentCategory);
  const displayLabel =
    categoryName && categoryName !== parentName
      ? categoryName
      : parentName || categoryName;

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

  const handleMouseEnter = () => {
    if (!hasSecond) return;
    hoverTimeout.current = setTimeout(() => setImgIndex(1), 120);
  };
  const handleMouseLeave = () => {
    clearTimeout(hoverTimeout.current);
    setImgIndex(0);
  };

  const handleCreatePaanBox = () => {
    router.push("/create-your-paan");
  };

  const handleAddToCart = async () => {
    if (isOutOfStock) return;
    if (isPaan) {
      window.location.href = `/shop/${product.slug}`;
      return;
    }
    if (isAuthenticated) {
      setIsAdding(true);
      const ok = await addToCart({ productId: product._id, quantity: 1 });
      if (ok) toast.success("Added to cart!");
      openCart();
      setIsAdding(false);
    } else {
      addGuestItem({
        productId: product._id,
        name: product.name,
        image: images[0] || null,
        price: displayPrice,
        originalPrice,
        isPaan: false,
        variantSetSize: null,
        quantity: 1,
      });
      toast.success(`${product.name} added to cart!`);
      openCart();
    }
  };

  const handleBuyNow = async () => {
    if (isOutOfStock) return;

    if (isPaan) {
      router.push(`/shop/${product.slug}`);
      return;
    }

    if (isAuthenticated) {
      await addToCart({ productId: product._id, quantity: 1 });
      openCheckout();
    } else {
      addGuestItem({
        productId: product._id,
        name: product.name,
        image: images[0] || null,
        price: displayPrice,
        originalPrice,
        isPaan: false,
        variantSetSize: null,
        quantity: 1,
      });
      openGuestCheckout();
    }
  };

  return (
    <div
      className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-400"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Image area */}
      <Link
        href={`/shop/${product.slug}`}
        className="block relative overflow-hidden bg-gray-50"
        style={{ paddingBottom: "100%" }}
      >
        {/* Primary image */}
        <Image
          src={images[0] || "/placeholder-product.png"}
          alt={product.name}
          fill
          className={cn(
            "object-cover absolute inset-0 transition-all duration-500",
            imgIndex === 1 ? "opacity-0 scale-105" : "opacity-100 scale-100",
          )}
        />
        {/* Secondary image */}
        {hasSecond && (
          <Image
            src={images[1]}
            alt={`${product.name} – view 2`}
            fill
            className={cn(
              "object-cover absolute inset-0 transition-all duration-500",
              imgIndex === 1 ? "opacity-100 scale-100" : "opacity-0 scale-105",
            )}
          />
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {/* {discount > 0 && (
            <span className="bg-red-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg shadow">
              {discount}% OFF
            </span>
          )} */}
          {product.isFeatured && !discount && (
            <span className="bg-[#d4af37] text-black text-[11px] font-bold px-2.5 py-1 rounded-lg shadow">
              Popular
            </span>
          )}
        </div>

        {/* Out of stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px] flex items-center justify-center z-10">
            <span className="bg-white text-gray-900 px-5 py-2 rounded-full font-bold text-sm tracking-wide">
              Out of Stock
            </span>
          </div>
        )}

        {/* Quick-view hint on hover (desktop) */}
        {!isOutOfStock && (
          <div
            className="absolute inset-x-0 bottom-0 h-12 bg-linear-to-t from-black/30 to-transparent
                          opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end pb-2 justify-center z-10"
          >
            <span className="text-white text-xs font-semibold tracking-wide">
              View Details
            </span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 md:p-5">
        {/* Category + label */}
        <p className="text-[11px] text-black uppercase tracking-widest font-medium mb-1.5">
          {displayLabel}
        </p>

        <Link href={`/shop/${product.slug}`}>
          <h3 className="font-bold text-[15px] md:text-base text-gray-900 line-clamp-2 leading-snug mb-2 group-hover:text-[#2d5016] transition-colors">
            {product.name}
          </h3>
        </Link>

        <p className="text-[12px] text-gray-400 truncate line-clamp-2 leading-relaxed mb-4 hidden md:block">
          {product.description}
        </p>

        <div className="flex-1" />

        {/* Price */}
        <div className="flex items-baseline gap-2 flex-wrap mb-2">
          {priceRange ? (
            <span className="text-lg font-extrabold text-gray-900">
              {priceRange}
            </span>
          ) : (
            <>
              <span className="text-xl font-extrabold text-[#2d5016]">
                ₹{displayPrice}
              </span>
              {discount > 0 && (
                <span className="text-sm text-gray-400 line-through font-medium">
                  ₹{originalPrice}
                </span>
              )}
            </>
          )}
        </div>

        {/* Discount % + Rating row */}
        <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4 min-h-5">
          {/* Discount pill */}
          {discount > 0 ? (
            <span className="text-[10px] sm:text-[11px] font-bold text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 sm:py-1 rounded-full whitespace-nowrap">
              {discount}% off
            </span>
          ) : (
            <span />
          )}

          {/* Rating */}
          {product.averageRating > 0 ? (
            <div className="flex items-center gap-0.5 sm:gap-1">
              <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-[#d4af37] text-[#d4af37]" />
              <span className="text-[11px] sm:text-[12px] font-semibold text-gray-700">
                {product.averageRating.toFixed(1)}
              </span>
              <span className="text-[10px] sm:text-[11px] text-gray-400">
                ({product.totalReviews})
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-0.5 sm:gap-1">
              <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-black" />
              <span className="text-[8px] sm:text-[11px] text-black">
                No reviews
              </span>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-2">
          {isFreshPaan ? (
            <button
              onClick={handleCreatePaanBox}
              className="
        w-full
        py-2.5 sm:py-3
        rounded-xl
        font-bold
        text-xs sm:text-sm
        flex items-center justify-center gap-2
        transition-all
        border-2
        border-[#264B0E]
        bg-[#264B0E]
        text-white
        hover:opacity-90
      "
            >
              <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Make Paan Box</span>
            </button>
          ) : (
            <>
              {/* Add to Cart / Options */}
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock || isAdding}
                className={cn(
                  "w-full sm:flex-1 py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 transition-all",
                  isOutOfStock
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : isPaan
                      ? "bg-[#fdf8f0] border-2 border-[#2d5016] text-[#2d5016] hover:bg-[#2d5016] hover:text-white"
                      : "bg-[#2d5016] hover:bg-[#3d6820] text-white",
                )}
              >
                {isAdding ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                    <span>Adding...</span>
                  </>
                ) : isPaan ? (
                  <>
                    <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    Options
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    Add To Cart
                  </>
                )}
              </button>

              {/* Buy Now */}
              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className={cn(
                  "w-full sm:flex-1 py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 transition-all border-2",
                  isOutOfStock
                    ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "border-[#d4af37] text-[#2d5016] bg-[#d4af37]/10 hover:bg-[#d4af37] hover:text-black",
                )}
              >
                <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Buy Now</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════
   SKELETON + EMPTY
═══════════════════════════ */
function ProductSkeleton() {
  return (
    <div className="flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
      <div className="w-full bg-gray-200" style={{ paddingBottom: "100%" }} />
      <div className="p-4 md:p-5 space-y-3">
        <div className="h-3 bg-gray-200 rounded w-20" />
        <div className="h-5 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-7 bg-gray-200 rounded w-24" />
        <div className="h-11 bg-gray-200 rounded-xl" />
      </div>
    </div>
  );
}

function EmptyState({ searchQuery, onClearSearch }) {
  return (
    <div className="text-center py-24 col-span-full">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-6">
        <ShoppingBag className="w-10 h-10 text-gray-300" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">
        {searchQuery ? "No products found" : "No products in this collection"}
      </h3>
      <p className="text-gray-400 mb-6 max-w-xs mx-auto text-sm">
        {searchQuery
          ? `Nothing matched "${searchQuery}".`
          : "Check back soon for new arrivals!"}
      </p>
      {searchQuery && (
        <button
          onClick={onClearSearch}
          className="px-6 py-2.5 bg-[#2d5016] text-white rounded-xl font-semibold hover:bg-[#3d6820] transition-colors text-sm"
        >
          Clear Search
        </button>
      )}
    </div>
  );
}