"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

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
  Star,
  Loader2,
  Zap,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCartUIStore } from "@/stores/useCartUIStore";
import { useCheckoutUIStore } from "@/stores/useCheckoutUIStore";
import { useGuestCheckoutUIStore } from "@/stores/useGuestCheckoutUIStore";

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "newest", label: "Newest First" },
];

/* ── helpers ── */
const resolveId = (f) => (f && typeof f === "object" ? f._id : f) || null;
const resolveName = (f) => (f && typeof f === "object" ? f.name : f) || "";

export default function ShopPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { products, loading, filterProducts, fetchAllProducts } =
    useProductStore();
  const { categories, fetchActiveCategories } = useCategoryStore();
  const { isAuthenticated } = useUserStore();

  /* active root category id + active child id */
  const [activeCatId, setActiveCatId] = useState(null); // null = All
  const [activeChildId, setActiveChildId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [drawerOpen, setDrawerOpen] = useState(false);

  /* ── load categories once ── */
  useEffect(() => {
    fetchActiveCategories();
  }, []);

  /* ── sync URL params → state on mount ── */
  useEffect(() => {
    const cat = searchParams.get("cat");
    const child = searchParams.get("child");
    if (cat) setActiveCatId(cat);
    if (child) setActiveChildId(child);
  }, []);

  /* ── fetch products whenever filters change ── */
  useEffect(() => {
    if (!activeCatId) {
      fetchAllProducts();
      return;
    }
    const root = categories.find((c) => c._id === activeCatId);
    const hasChildren = (root?.children?.length ?? 0) > 0;

    if (activeChildId) {
      filterProducts({ category: activeChildId });
    } else if (hasChildren) {
      filterProducts({ parentCategory: activeCatId });
    } else {
      filterProducts({ category: activeCatId });
    }
  }, [activeCatId, activeChildId, categories]);

  /* ── client-side search + sort ── */
  const displayProducts = useMemo(() => {
    let list = [...products];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }

    switch (sortBy) {
      case "price-low":
        list.sort((a, b) => {
          const pa = a.discountedPrice ?? a.variants?.[0]?.discountedPrice ?? 0;
          const pb = b.discountedPrice ?? b.variants?.[0]?.discountedPrice ?? 0;
          return pa - pb;
        });
        break;
      case "price-high":
        list.sort((a, b) => {
          const pa = a.discountedPrice ?? a.variants?.[0]?.discountedPrice ?? 0;
          const pb = b.discountedPrice ?? b.variants?.[0]?.discountedPrice ?? 0;
          return pb - pa;
        });
        break;
      case "newest":
        list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case "featured":
      default:
        list.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    }

    return list;
  }, [products, searchQuery, sortBy]);

  /* ── navigation helpers ── */
  const selectRoot = (id) => {
    setActiveCatId(id);
    setActiveChildId(null);
    const params = id ? `?cat=${id}` : "";
    router.push(`/shop${params}`, { scroll: false });
    setDrawerOpen(false);
  };

  const selectChild = (id) => {
    setActiveChildId(id);
    router.push(`/shop?cat=${activeCatId}&child=${id}`, { scroll: false });
    setDrawerOpen(false);
  };

  const activeRoot = categories.find((c) => c._id === activeCatId);
  const activeChildren = activeRoot?.children || [];

  return (
    <div className="min-h-screen mt-8 bg-linear-to-b from-white to-gray-50">
      {/* ── Breadcrumb ── */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center gap-2 text-sm text-gray-500 flex-wrap">
          <Link href="/" className="hover:text-[#d4af37] transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className={cn(!activeCatId && "text-gray-900 font-medium")}>
            {activeCatId ? (
              <button
                onClick={() => selectRoot(null)}
                className="hover:text-[#d4af37] transition-colors"
              >
                All Products
              </button>
            ) : (
              "All Products"
            )}
          </span>
          {activeRoot && (
            <>
              <ChevronRight className="w-3.5 h-3.5" />
              <span
                className={cn(!activeChildId && "text-gray-900 font-medium")}
              >
                {activeChildId ? (
                  <button
                    onClick={() => selectChild(null)}
                    className="hover:text-[#d4af37]"
                  >
                    {activeRoot.name}
                  </button>
                ) : (
                  activeRoot.name
                )}
              </span>
            </>
          )}
          {activeChildId && (
            <>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-gray-900 font-medium">
                {activeChildren.find((c) => c._id === activeChildId)?.name}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="flex gap-8">
          {/* ── SIDEBAR (desktop) ── */}
          <aside className="hidden lg:block w-72 shrink-0">
            <FilterSidebar
              categories={categories}
              activeCatId={activeCatId}
              activeChildId={activeChildId}
              activeChildren={activeChildren}
              onSelectRoot={selectRoot}
              onSelectChild={selectChild}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          </aside>

          {/* ── PRODUCT AREA ── */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
              {/* Mobile filter button */}
              <button
                onClick={() => setDrawerOpen(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-black hover:border-[#2d5016] transition-colors shadow-sm"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
              </button>

              {/* Count */}
              <p className="hidden lg:block text-sm text-gray-500">
                <span className="font-bold text-gray-900">
                  {displayProducts.length}
                </span>{" "}
                products
              </p>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="ml-auto px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 text-accent-foreground focus:ring-[#2d5016]/20 shadow-sm"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Active filters pills */}
            {(activeCatId || searchQuery) && (
              <div className="flex flex-wrap gap-2 mb-5">
                {activeCatId && (
                  <span className="inline-flex items-center gap-1.5 bg-[#2d5016]/10 text-[#2d5016] text-xs font-semibold px-3 py-1.5 rounded-full">
                    {activeRoot?.name}
                    <button onClick={() => selectRoot(null)}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {activeChildId && (
                  <span className="inline-flex items-center gap-1.5 bg-[#d4af37]/15 text-[#9a7d20] text-xs font-semibold px-3 py-1.5 rounded-full">
                    {activeChildren.find((c) => c._id === activeChildId)?.name}
                    <button
                      onClick={() => {
                        setActiveChildId(null);
                        router.push(`/shop?cat=${activeCatId}`, {
                          scroll: false,
                        });
                      }}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {searchQuery && (
                  <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-full">
                    "{searchQuery}"
                    <button onClick={() => setSearchQuery("")}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            )}

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
                onClear={() => setSearchQuery("")}
              />
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {displayProducts.map((product, i) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.4 }}
                    className="h-full"
                  >
                    <ProductCard
                      product={product}
                      isAuthenticated={isAuthenticated}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile filter drawer ── */}
      <FilterDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        categories={categories}
        activeCatId={activeCatId}
        activeChildId={activeChildId}
        activeChildren={activeChildren}
        onSelectRoot={selectRoot}
        onSelectChild={selectChild}
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
  activeCatId,
  activeChildId,
  activeChildren,
  onSelectRoot,
  onSelectChild,
  searchQuery,
  setSearchQuery,
}) {
  return (
    <div className="sticky top-24 space-y-5">
      {/* Search */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider mb-4">
          Search
        </h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search products…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 text-accent-foreground focus:ring-[#2d5016]/20 focus:border-[#2d5016]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Categories */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider mb-4">
          Categories
        </h3>
        <div className="space-y-1">
          <button
            onClick={() => onSelectRoot(null)}
            className={cn(
              "w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
              !activeCatId
                ? "bg-[#2d5016] text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
            )}
          >
            All Products
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => onSelectRoot(cat._id)}
              className={cn(
                "w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                activeCatId === cat._id
                  ? "bg-[#2d5016] text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Sub-categories */}
      {activeChildren.length > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider mb-4">
            {categories.find((c) => c._id === activeCatId)?.name} Types
          </h3>
          <div className="space-y-1">
            <button
              onClick={() => onSelectChild(null)}
              className={cn(
                "w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                !activeChildId
                  ? "bg-[#d4af37]/15 text-[#9a7d20] font-semibold"
                  : "text-gray-600 hover:bg-gray-50",
              )}
            >
              All
            </button>
            {activeChildren.map((child) => (
              <button
                key={child._id}
                onClick={() => onSelectChild(child._id)}
                className={cn(
                  "w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                  activeChildId === child._id
                    ? "bg-[#d4af37]/15 text-[#9a7d20] font-semibold"
                    : "text-gray-600 hover:bg-gray-50",
                )}
              >
                {child.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════
   MOBILE FILTER DRAWER
═══════════════════════════ */
function FilterDrawer({ isOpen, onClose, ...sidebarProps }) {
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
            transition={{ type: "spring", damping: 26, stiffness: 280 }}
            className="fixed left-0 top-0 bottom-0 w-75 bg-white z-50 overflow-y-auto lg:hidden flex flex-col"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h2 className="font-bold text-gray-900">Filters</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-5 flex-1 overflow-y-auto">
              <FilterSidebar {...sidebarProps} />
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
  const router = useRouter();
  const { openCart } = useCartUIStore();
  const { openCheckout } = useCheckoutUIStore();
  const { openGuestCheckout } = useGuestCheckoutUIStore();

  const [isAddingCart, setIsAddingCart] = useState(false);
  const [isBuying, setIsBuying] = useState(false);

  const isPaan = product.isPaan;
  const hasVariants = product.variants?.length > 0;
  const images = product.images || [];

  /* ── price ── */
  const displayPrice = hasVariants
    ? product.variants[0].discountedPrice
    : product.discountedPrice;
  const originalPrice = hasVariants
    ? product.variants[0].originalPrice
    : product.originalPrice;

  const priceLabel =
    isPaan && hasVariants
      ? (() => {
          const prices = product.variants.map((v) => v.discountedPrice);
          const min = Math.min(...prices),
            max = Math.max(...prices);
          return min === max ? `₹${min}` : `₹${min} – ₹${max}`;
        })()
      : `₹${displayPrice}`;

  const discount =
    originalPrice && displayPrice && originalPrice > displayPrice
      ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100)
      : 0;

  const isOutOfStock = hasVariants
    ? product.variants.every((v) => (v.stock ?? 0) === 0)
    : (product.stock ?? 0) === 0;

  /* ── shared cart add logic ── */
  const doAddToCart = async () => {
    if (isPaan) {
      router.push(`/shop/${product._id}`);
      return;
    }
    if (isAuthenticated) {
      const ok = await addToCart({ productId: product._id, quantity: 1 });
      if (ok) toast.success(`${product.name} added to cart!`);
    } else {
      addGuestItem({
        productId: product._id,
        name: product.name,
        image: images[0] || null,
        price: displayPrice,
        originalPrice,
        isPaan,
        variantSetSize: null,
        quantity: 1,
      });
      toast.success(`${product.name} added to cart!`);
    }
  };

  const handleAddToCart = async () => {
    if (isOutOfStock) return;
    setIsAddingCart(true);
    await doAddToCart();
    setIsAddingCart(false);
    openCart();
  };

  const handleBuyNow = async () => {
    if (isOutOfStock) return;
    if (isPaan) {
      router.push(`/shop/${product._id}`);
      return;
    }
    setIsBuying(true);
    await doAddToCart();
    setIsBuying(false);
    // router.push(isAuthenticated ? "/checkout" : "/guest-checkout");
    if (isAuthenticated) {
      openCheckout();
    } else {
      openGuestCheckout();
    }
  };;

  return (
    <div className="h-full flex flex-col group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-400 overflow-hidden border border-gray-100 relative">
      {/* Image */}
      <Link
        href={`/shop/${product._id}`}
        className="relative block overflow-hidden bg-gray-50 shrink-0"
        style={{ paddingBottom: "72%" }}
      >
        <Image
          src={images[0] || "/placeholder-product.png"}
          alt={product.name}
          fill
          className="object-contain group-hover:scale-105 transition-transform duration-500"
        />
        {discount > 0 && (
          <span className="absolute top-2.5 left-2.5 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow z-10">
            {discount}% OFF
          </span>
        )}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-10">
            <span className="bg-white text-gray-900 px-3 py-1 rounded-full font-bold text-xs">
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1 p-3.5">
        {/* Category label */}
        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-medium mb-1">
          {resolveName(product.category) || resolveName(product.parentCategory)}
        </p>

        {/* Name */}
        <Link href={`/shop/${product._id}`}>
          <h3 className="font-bold text-[13px] md:text-sm text-gray-900 line-clamp-2 leading-snug mb-2 hover:text-[#2d5016] transition-colors min-h-9">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        {product.averageRating > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <Star className="w-3 h-3 fill-[#d4af37] text-[#d4af37]" />
            <span className="text-[11px] font-semibold text-gray-600">
              {product.averageRating.toFixed(1)}
            </span>
            <span className="text-[10px] text-gray-400">
              ({product.totalReviews})
            </span>
          </div>
        )}

        <div className="flex-1" />

        {/* Price row */}
        <div className="flex items-baseline gap-1.5 flex-wrap mb-1.5">
          <span className="text-base font-extrabold text-gray-900">
            {priceLabel}
          </span>
          {!isPaan && originalPrice > displayPrice && (
            <span className="text-xs text-gray-400 line-through">
              ₹{originalPrice}
            </span>
          )}
          {isPaan && hasVariants && (
            <span className="text-[10px] text-black">onwards</span>
          )}
        </div>

        {/* Discount pill */}
        {discount > 0 && (
          <p className="text-[10px] font-bold text-green-600 bg-green-50 border border-green-200 inline-flex w-fit items-center px-1.5 py-0.5 rounded-full mb-3">
            {discount}% off
          </p>
        )}

        {/* CTA buttons */}
        <div className="space-y-2">
          {/* Add to Cart */}
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || isAddingCart}
            className={cn(
              "w-full py-2.5 rounded-xl font-bold text-xs tracking-wide transition-all duration-200 flex items-center justify-center gap-1.5",
              isOutOfStock
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-linear-to-r from-[#2d5016] to-[#3d6820] hover:opacity-90 text-white shadow-sm",
            )}
          >
            {isAddingCart ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Adding…
              </>
            ) : isPaan ? (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                Select Options
              </>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5" />
                Add to Cart
              </>
            )}
          </button>

          {/* Buy Now — only for non-paan */}
          {!isPaan && (
            <button
              onClick={handleBuyNow}
              disabled={isOutOfStock || isBuying}
              className={cn(
                "w-full py-2 rounded-xl font-bold text-xs tracking-wide transition-all duration-200 flex items-center justify-center gap-1.5 border-2",
                isOutOfStock
                  ? "border-gray-200 text-gray-400 cursor-not-allowed"
                  : "border-[#d4af37] text-[#2d5016] hover:bg-[#d4af37] hover:text-black",
              )}
            >
              {isBuying ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Processing…
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5" />
                  Buy It Now
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════
   SKELETON & EMPTY
═══════════════════════════ */
function ProductSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
      <div className="bg-gray-200" style={{ paddingBottom: "72%" }} />
      <div className="p-3.5 space-y-2.5">
        <div className="h-3 bg-gray-200 rounded w-1/3" />
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-8 bg-gray-200 rounded-xl mt-3" />
        <div className="h-7 bg-gray-200 rounded-xl" />
      </div>
    </div>
  );
}

function EmptyState({ searchQuery, onClear }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-6">
        <ShoppingBag className="w-10 h-10 text-gray-300" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">
        {searchQuery ? "No results found" : "No products available"}
      </h3>
      <p className="text-gray-500 text-sm mb-6 max-w-xs">
        {searchQuery
          ? `No products match "${searchQuery}". Try a different search.`
          : "Check back soon for new arrivals!"}
      </p>
      {searchQuery && (
        <button
          onClick={onClear}
          className="px-6 py-2.5 bg-[#2d5016] text-white font-semibold rounded-full text-sm hover:bg-[#3d6820] transition-colors"
        >
          Clear Search
        </button>
      )}
    </div>
  );
}