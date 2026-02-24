"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useProductStore } from "@/stores/useProductStore";
import { useCartStore } from "@/stores/useCartStore";
import { useUserStore } from "@/stores/useUserStore";
import {
  ChevronRight,
  Star,
  Search,
  SlidersHorizontal,
  ShoppingBag,
  Crown,
  X,
  ShoppingCart,
  Eye,
  Plus,
  Minus,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

// Import collections data
import { collections, signaturePaan } from "@/data/navbar";
import toast from "react-hot-toast";

const ALL_CATEGORIES = [
  { value: null, label: "All Products" },
  { value: "Digestive", label: "Digestives" },
  { value: "Candy & More", label: "Candy & More" },
  { value: "Mouth Fresheners", label: "Mouth Fresheners" },
  { value: "Paan", label: "Paan" },
];

const PAAN_SUBCATEGORIES = signaturePaan.map((p) => ({
  value: p.name,
  label: p.name,
}));

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "newest", label: "Newest First" },
];

export default function ShopPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const categoryFromUrl = searchParams.get("category");
  const { products, loading, fetchAllProducts, filterProducts } =
    useProductStore();
  const { isAuthenticated } = useUserStore();

  const [activeCategory, setActiveCategory] = useState(null);
  const [activeSubcategory, setActiveSubcategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    const category = searchParams.get("category");
    const subcategory = searchParams.get("subcategory");

    if (category) {
      setActiveCategory(category);

      if (subcategory) {
        setActiveSubcategory(subcategory);
        filterProducts({ category, subcategory });
      } else {
        setActiveSubcategory(null);
        filterProducts({ category });
      }
    } else {
      setActiveCategory(null);
      setActiveSubcategory(null);
      fetchAllProducts();
    }
  }, [searchParams]);

  // Filter and sort products
  useEffect(() => {
    let result = [...products];

    // Search filter
    if (searchQuery) {
      result = result.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Sort
    switch (sortBy) {
      case "price-low":
        result.sort((a, b) => {
          const priceA =
            a.discountedPrice || a.variants?.[0]?.discountedPrice || 0;
          const priceB =
            b.discountedPrice || b.variants?.[0]?.discountedPrice || 0;
          return priceA - priceB;
        });
        break;
      case "price-high":
        result.sort((a, b) => {
          const priceA =
            a.discountedPrice || a.variants?.[0]?.discountedPrice || 0;
          const priceB =
            b.discountedPrice || b.variants?.[0]?.discountedPrice || 0;
          return priceB - priceA;
        });
        break;
      case "newest":
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case "featured":
        result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
        break;
    }

    setFilteredProducts(result);
  }, [products, searchQuery, sortBy]);

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    setActiveSubcategory(null);

    if (!category) {
      router.push("/shop");
    } else {
      router.push(`/shop?category=${encodeURIComponent(category)}`);
    }

    setMobileFiltersOpen(false);
  };

  const handleSubcategoryChange = (subcategory) => {
    setActiveCategory("Paan");
    setActiveSubcategory(subcategory);

    router.push(
      `/shop?category=Paan&subcategory=${encodeURIComponent(subcategory)}`,
    );

    setMobileFiltersOpen(false);
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-white to-gray-50">
      {/* HERO */}
      <section className="relative h-100 md:h-125 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/footer-bg.png"
            alt="Shop Paanshala"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-b from-[#0b1f11]/95 via-[#0b1f11]/85 to-[#0b1f11]/95" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 md:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-[#d4af37]/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <ShoppingBag className="w-4 h-4 text-[#d4af37]" />
              <span className="text-sm font-medium text-[#d4af37]">
                Premium Collection
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Shop Paanshala
            </h1>

            <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Discover authentic paan, mouth fresheners, and royal delicacies
            </p>

            <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
              <Link href="/" className="hover:text-[#d4af37] transition-colors">
                Home
              </Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-white">Shop</span>
            </div>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-24 bg-linear-to-t from-white to-transparent" />
      </section>

      {/* MAIN CONTENT */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="flex gap-8">
          {/* SIDEBAR - Desktop */}
          <aside className="hidden lg:block w-80 shrink-0">
            <FilterSidebar
              activeCategory={activeCategory}
              activeSubcategory={activeSubcategory}
              onCategoryChange={handleCategoryChange}
              onSubcategoryChange={handleSubcategoryChange}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          </aside>

          {/* PRODUCTS */}
          <div className="flex-1">
            {/* Mobile Filter Button + Sort */}
            <div className="flex items-center justify-between mb-6 lg:hidden">
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl font-semibold hover:border-[#d4af37] transition-colors"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
              </button>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Desktop Sort + Count */}
            <div className="hidden lg:flex items-center justify-between mb-6 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="font-semibold text-gray-900">
                  {filteredProducts.length}
                </span>
                <span>products found</span>
              </div>

              <div className="flex items-center gap-3">
                <SlidersHorizontal className="w-4 h-4 text-gray-500" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {[...Array(6)].map((_, i) => (
                  <ProductSkeleton key={i} />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <EmptyState
                searchQuery={searchQuery}
                onClearSearch={() => setSearchQuery("")}
              />
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.5 }}
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
      </section>

      {/* Mobile Filter Drawer */}
      <MobileFilterDrawer
        isOpen={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        activeCategory={activeCategory}
        activeSubcategory={activeSubcategory}
        onCategoryChange={handleCategoryChange}
        onSubcategoryChange={handleSubcategoryChange}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
    </div>
  );
}

/* =========================
   FILTER SIDEBAR
========================= */
function FilterSidebar({
  activeCategory,
  activeSubcategory,
  onCategoryChange,
  onSubcategoryChange,
  searchQuery,
  setSearchQuery,
}) {
  return (
    <div className="sticky top-24 space-y-6">
      {/* Search */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-900 mb-4">Search Products</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-transparent"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-900 mb-4">Categories</h3>
        <div className="space-y-2">
          {ALL_CATEGORIES.map((cat) => (
            <button
              key={cat.value || "all"}
              onClick={() => onCategoryChange(cat.value)}
              className={cn(
                "w-full text-left px-4 py-3 rounded-lg transition-colors",
                activeCategory === cat.value
                  ? "bg-[#d4af37]/10 text-[#d4af37] font-semibold"
                  : "hover:bg-gray-50 text-gray-700",
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Paan Subcategories */}
      {activeCategory === "Paan" && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4">Paan Types</h3>
          <div className="space-y-2">
            {PAAN_SUBCATEGORIES.map((sub) => (
              <button
                key={sub.value}
                onClick={() => onSubcategoryChange(sub.value)}
                className={cn(
                  "w-full text-left px-4 py-3 rounded-lg transition-colors text-sm",
                  activeSubcategory === sub.value
                    ? "bg-[#d4af37]/10 text-[#d4af37] font-semibold"
                    : "hover:bg-gray-50 text-gray-600",
                )}
              >
                {sub.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================
   MOBILE FILTER DRAWER
========================= */
function MobileFilterDrawer({
  isOpen,
  onClose,
  activeCategory,
  activeSubcategory,
  onCategoryChange,
  onSubcategoryChange,
  searchQuery,
  setSearchQuery,
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
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 20 }}
            className="fixed left-0 top-0 bottom-0 w-80 bg-white z-50 overflow-y-auto lg:hidden"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Filters</h2>
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Search</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
                  />
                </div>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Categories</h3>
                <div className="space-y-2">
                  {ALL_CATEGORIES.map((cat) => (
                    <button
                      key={cat.value || "all"}
                      onClick={() => onCategoryChange(cat.value)}
                      className={cn(
                        "w-full text-left px-4 py-3 rounded-lg transition-colors",
                        activeCategory === cat.value
                          ? "bg-[#d4af37]/10 text-[#d4af37] font-semibold"
                          : "hover:bg-gray-50 text-gray-700",
                      )}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Paan Subcategories */}
              {activeCategory === "Paan" && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Paan Types
                  </h3>
                  <div className="space-y-2">
                    {PAAN_SUBCATEGORIES.map((sub) => (
                      <button
                        key={sub.value}
                        onClick={() => onSubcategoryChange(sub.value)}
                        className={cn(
                          "w-full text-left px-4 py-3 rounded-lg transition-colors text-sm",
                          activeSubcategory === sub.value
                            ? "bg-[#d4af37]/10 text-[#d4af37] font-semibold"
                            : "hover:bg-gray-50 text-gray-600",
                        )}
                      >
                        {sub.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* =========================
   PRODUCT CARD
========================= */
function ProductCard({ product, isAuthenticated }) {
  const { addToCart, loading } = useCartStore();
  const [isAdding, setIsAdding] = useState(false);

  const isPaan = product.category === "Paan";
  const hasVariants = product.variants?.length > 0;

  // Calculate price range for Paan products
  const getPriceDisplay = () => {
    if (isPaan && hasVariants) {
      const prices = product.variants.map((v) => v.discountedPrice);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);

      if (minPrice === maxPrice) {
        return `₹${minPrice}.00`;
      }
      return `₹${minPrice}.00 - ₹${maxPrice}.00`;
    }
    return null; // Return null for non-Paan, we show separate prices
  };

  const discount =
    product.originalPrice && product.discountedPrice
      ? Math.round(
          ((product.originalPrice - product.discountedPrice) /
            product.originalPrice) *
            100,
        )
      : 0;

  const isOutOfStock = isPaan
    ? hasVariants && product.variants.every((v) => v.stock === 0)
    : product.stock === 0;

  const handleAddToCart = async () => {
    if (!isAuthenticated) return;

    // For Paan products, redirect to details page
    if (isPaan) {
      window.location.href = `/shop/${product._id}`;
      return;
    }

    // For non-Paan products, add directly to cart
    setIsAdding(true);
    const success = await addToCart({
      productId: product._id,
      quantity: 1,
    });
    if(success) {
      toast.success("Item added to cart.")
    }
    setIsAdding(false);
  };

  return (
    <div className="h-full flex flex-col group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100">
      {/* Image */}
      <Link href={`/shop/${product._id}`}>
        <div className="relative h-48 md:h-56 overflow-hidden bg-gray-100">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700"
          />

          {/* Discount Badge */}
          {discount > 0 && (
            <div className="absolute top-3 left-3">
              <span className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-md shadow-lg">
                {discount}% OFF
              </span>
            </div>
          )}

          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
              <span className="bg-white text-gray-900 px-3 md:px-4 py-1.5 md:py-2 rounded-full font-bold text-xs md:text-sm">
                Out of Stock
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="flex-1 flex flex-col p-3 md:p-4 text-center">
        {/* Category & Subcategory */}
        <Link href={`/shop/${product._id}`}>
          <p className="text-xs md:text-sm text-gray-500 mb-1">
            {product.subcategory || product.category}
          </p>

          {/* Title */}
          <h3 className="font-bold text-sm md:text-base text-gray-900 mb-2 line-clamp-2 group-hover:text-[#d4af37] transition-colors min-h-10 md:min-h-12">
            {product.name}
          </h3>
        </Link>

        {/* Description */}
        <div className="mb-2">
          <p className="text-xs md:text-sm text-gray-500 line-clamp-2">
            {product.description}
          </p>
        </div>

        {/* Spacer */}
        <div className="flex-1"></div>

        {/* Price */}
        <div className="mb-4">
          {isPaan ? (
            // Paan products: Show price range
            <p className="text-lg md:text-xl font-bold text-gray-900">
              {getPriceDisplay()}
            </p>
          ) : (
            // Non-Paan products: Show original + discounted price
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {discount > 0 && (
                <span className="text-sm md:text-base text-gray-400 line-through">
                  ₹{product.originalPrice}.00
                </span>
              )}
              <span className="text-lg md:text-xl font-bold text-[#d4af37]">
                ₹{product.discountedPrice}.00
              </span>
            </div>
          )}
        </div>

        {/* Action Button */}
        {isAuthenticated ? (
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || isAdding}
            className={cn(
              "w-full py-2.5 md:py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 text-sm md:text-base",
              isOutOfStock
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-[#2d5016] hover:bg-[#3d6820] text-white shadow-lg",
            )}
          >
            {isAdding ? (
              <>
                <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
                <span>Adding...</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4 md:w-5 md:h-5" />
                <span>Add To Cart</span>
              </>
            )}
          </button>
        ) : (
          <Link
            href={`/shop/${product._id}`}
            className="w-full py-2.5 md:py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 bg-[#2d5016] hover:bg-[#3d6820] text-white shadow-lg text-sm md:text-base"
          >
            <Eye className="w-4 h-4 md:w-5 md:h-5" />
            <span>View Details</span>
          </Link>
        )}
      </div>
    </div>
  );
}

/* =========================
   SKELETON & EMPTY STATE
========================= */
function ProductSkeleton() {
  return (
    <div className="h-full flex flex-col bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 animate-pulse">
      <div className="h-48 md:h-56 bg-gray-200" />
      <div className="flex-1 flex flex-col p-3 md:p-4 text-center">
        <div className="h-4 bg-gray-200 rounded w-24 mx-auto mb-1" />
        <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto mb-2" />
        <div className="h-4 bg-gray-200 rounded w-full mb-2" />
        <div className="flex-1"></div>
        <div className="h-6 bg-gray-200 rounded w-32 mx-auto mb-4" />
        <div className="h-10 md:h-12 bg-gray-200 rounded" />
      </div>
    </div>
  );
}

function EmptyState({ searchQuery, onClearSearch }) {
  return (
    <div className="text-center py-20">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-6">
        <ShoppingBag className="w-10 h-10 text-gray-400" />
      </div>

      <h3 className="text-2xl font-bold text-gray-900 mb-2">
        {searchQuery ? "No products found" : "No products available"}
      </h3>

      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        {searchQuery
          ? `We couldn't find any products matching "${searchQuery}".`
          : "Check back soon for new arrivals!"}
      </p>

      {searchQuery && (
        <button
          onClick={onClearSearch}
          className="inline-flex items-center gap-2 bg-linear-to-r from-[#d4af37] to-[#f4d03f] text-[#0b1f11] px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-all duration-300 shadow-lg"
        >
          Clear Search
        </button>
      )}
    </div>
  );
}
