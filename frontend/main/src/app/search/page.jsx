"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useProductStore } from "@/stores/useProductStore";
import { useCartStore } from "@/stores/useCartStore";
import { useUserStore } from "@/stores/useUserStore";
import {
  Search,
  X,
  ShoppingBag,
  TrendingUp,
  Loader2,
  ShoppingCart,
  Eye,
  SlidersHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCartUIStore } from "@/stores/useCartUIStore";

// Debounce hook
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

const SORT_OPTIONS = [
  { value: "relevance", label: "Most Relevant" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "newest", label: "Newest First" },
  { value: "rating", label: "Highest Rated" },
];

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { products, loading, searchProducts } = useProductStore();
  const { isAuthenticated } = useUserStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("relevance");
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Debounce search query
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Initialize from URL params
  useEffect(() => {
    const q = searchParams.get("q") || "";
    const cat = searchParams.get("category") || "all";

    setSearchQuery(q);
    setCategory(cat);

    if (q) {
      performSearch(q, cat);
    }
  }, []);

  // Perform search when debounced query changes
  useEffect(() => {
    if (debouncedSearchQuery.trim()) {
      performSearch(debouncedSearchQuery, category);
      updateURL(debouncedSearchQuery, category);
    } else if (hasSearched) {
      setHasSearched(false);
    }
  }, [debouncedSearchQuery, category]);

  const performSearch = async (query, selectedCategory) => {
    if (!query.trim()) return;

    setHasSearched(true);
    setIsSearching(true);

    await searchProducts({
      q: query,
      category: selectedCategory === "all" ? undefined : selectedCategory,
    });

    setIsSearching(false);
  };

  const updateURL = useCallback(
    (query, cat) => {
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      if (cat && cat !== "all") params.set("category", cat);

      const newURL = params.toString()
        ? `/search?${params.toString()}`
        : "/search";
      router.replace(newURL, { scroll: false });
    },
    [router],
  );

  const clearSearch = () => {
    setSearchQuery("");
    setCategory("all");
    setHasSearched(false);
    router.replace("/search", { scroll: false });
  };

  // Sort products
  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return (a.discountedPrice || 0) - (b.discountedPrice || 0);
      case "price-high":
        return (b.discountedPrice || 0) - (a.discountedPrice || 0);
      case "newest":
        return new Date(b.createdAt) - new Date(a.createdAt);
      case "rating":
        return (b.averageRating || 0) - (a.averageRating || 0);
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-linear-to-b from-white via-cream-light to-[#f5e6d3]">
      {/* Search Hero */}
      <section className="bg-linear-to-br from-[#264B0E] via-brand-green-dark to-[#264B0E] text-white py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <h1 className="text-heading text-5xl md:text-6xl font-bold mb-4 uppercase tracking-wide">
                Search Products
              </h1>
              <p className="text-body text-white/80 text-lg">
                Find your favorite paan, digestives, and more
              </p>
            </motion.div>

            {/* Search Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-4"
            >
              <div className="flex flex-col md:flex-row gap-3">
                {/* Search Input */}
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" strokeWidth={2.5} />
                  <Input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for products..."
                    className="pl-12 pr-12 h-14 bg-white text-gray-900 border-0 rounded-xl shadow-lg focus-visible:ring-2 focus-visible:ring-gold-bright text-base"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 p-0 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-400" strokeWidth={2.5} />
                    </button>
                  )}
                  {isSearching && (
                    <div className="absolute right-12 top-1/2 -translate-y-1/2">
                      <Loader2 className="w-5 h-5 animate-spin text-gold-bright" strokeWidth={2.5} />
                    </div>
                  )}
                </div>
              </div>

              {/* Real-time search indicator */}
              {searchQuery && (
                <div className="text-center">
                  <div className="inline-block bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-body text-sm">
                    {isSearching ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2.5} />
                        Searching...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        ✓ Search updated
                      </span>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Search Results */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {hasSearched && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              {/* Results Info */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-body">
                  <TrendingUp className="w-5 h-5 text-gold-bright" strokeWidth={2.5} />
                  <span className="text-sm">
                    <span className="font-bold text-[#264B0E]">
                      {sortedProducts.length}
                    </span>{" "}
                    <span className="text-gray-600">
                      {sortedProducts.length === 1 ? "result" : "results"} found
                    </span>
                    {searchQuery && (
                      <>
                        {" "}
                        <span className="text-gray-600">for</span>{" "}
                        <span className="font-bold text-[#264B0E]">
                          "{searchQuery}"
                        </span>
                      </>
                    )}
                  </span>
                </div>

                {/* Clear Button */}
                {(searchQuery || category !== "all") && (
                  <button
                    onClick={clearSearch}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-body text-sm text-gray-700 transition-colors"
                  >
                    <X className="w-4 h-4" strokeWidth={2.5} />
                    Clear
                  </button>
                )}
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2 text-black">
                <SlidersHorizontal className="w-4 h-4 text-gray-400" strokeWidth={2.5} />
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full md:w-56 h-10 border-gray-300 focus:border-[#264B0E] focus:ring-[#264B0E] rounded-lg">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* Products Grid */}
        {loading && !isSearching ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[...Array(8)].map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : !hasSearched ? (
          <EmptySearchState />
        ) : sortedProducts.length === 0 ? (
          <NoResultsState searchQuery={searchQuery} onClear={clearSearch} />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {sortedProducts.map((product, index) => (
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
      </section>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PRODUCT CARD
═══════════════════════════════════════════════════════════════ */
const resolveName = (f) => (f && typeof f === "object" ? f.name : f) || "";

function ProductCard({ product, isAuthenticated }) {
  const { addToCart } = useCartStore();
  const { openCart } = useCartUIStore();
  const [isAdding, setIsAdding] = useState(false);

  const isPaan = product.isPaan;
  const hasVariants = isPaan && product.variants?.length > 0;

  const categoryName = resolveName(product.category);
  const parentName = resolveName(product.parentCategory);

  const displayLabel =
    categoryName && categoryName !== parentName
      ? categoryName
      : parentName || categoryName;

  const displayPrice = hasVariants
    ? product.variants[0]?.discountedPrice
    : product.discountedPrice;

  const originalPrice = hasVariants
    ? product.variants[0]?.originalPrice
    : product.originalPrice;

  const priceRange =
    hasVariants && product.variants.length > 1
      ? (() => {
          const prices = product.variants.map((v) => v.discountedPrice);
          const min = Math.min(...prices);
          const max = Math.max(...prices);
          return min === max ? null : `₹${min} – ₹${max}`;
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
    if (!isAuthenticated) return;

    if (isPaan) {
      window.location.href = `/shop/${product.slug}`;
      return;
    }

    setIsAdding(true);
    await addToCart({
      productId: product._id,
      quantity: 1,
    });
    openCart();
    setIsAdding(false);
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 group h-full flex flex-col border border-gray-100">
      <Link href={`/shop/${product.slug}`}>
        <div className="relative aspect-square overflow-hidden bg-linear-to-br from-gray-50 to-gray-100">
          <Image
            src={product.images?.[0] || "/placeholder-product.png"}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700"
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />

          {discount > 0 && (
            <div className="absolute top-3 left-3 bg-linear-to-r from-[#264B0E] to-brand-green-dark text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
              {discount}% OFF
            </div>
          )}

          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
              <div className="bg-white px-6 py-2.5 rounded-full shadow-xl">
                <span className="text-body text-sm font-bold text-gray-900">
                  Out of Stock
                </span>
              </div>
            </div>
          )}
        </div>
      </Link>

      <div className="p-4 md:p-5 flex flex-col flex-1">
        {/* Category Badge */}
        {/* <div className="mb-2">
          <span className="inline-block px-3 py-1 bg-linear-to-r from-gold-bright/10 to-[#d4a574]/10 border border-gold-bright/20 text-center rounded-full text-body text-xs font-bold text-[#264B0E] uppercase tracking-wider">
            {displayLabel}
          </span>
        </div> */}

        {/* Product Name */}
        <Link href={`/shop/${product.slug}`}>
          <h3 className="text-heading text-base md:text-lg text-gray-900 line-clamp-2 group-hover:text-[#264B0E] transition-colors min-h-6 uppercase leading-tight">
            {product.name}
          </h3>
        </Link>

        {/* Description */}
        <p className="text-body text-xs md:text-sm text-black line-clamp-2 mb-3 leading-relaxed">
          {product.description}
        </p>

        <div className="flex-1"></div>

        {/* Price */}
        <div className="mb-4 pt-2 border-t border-gray-100">
          {priceRange ? (
            <div className="text-center">
              <p className="text-heading text-lg md:text-xl font-bold text-[#264B0E]">
                {priceRange}
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {discount > 0 && (
                <span className="text-body text-sm text-black line-through">
                  ₹{originalPrice}
                </span>
              )}
              <span className="text-heading text-xl md:text-2xl font-bold text-[#264B0E]">
                ₹{displayPrice}
              </span>
            </div>
          )}
        </div>

        {/* CTA Button */}
        {isAuthenticated ? (
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || isAdding}
            className={cn(
              "w-full h-11 rounded-xl font-bold text-sm uppercase tracking-wide transition-all duration-300 flex items-center justify-center gap-2",
              isOutOfStock
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-linear-to-r from-[#264B0E] to-brand-green-dark text-white hover:shadow-lg hover:scale-[1.02]",
            )}
          >
            {isAdding ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2.5} />
                Adding...
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" strokeWidth={2.5} />
                Add To Cart
              </>
            )}
          </button>
        ) : (
          <Link href={`/shop/${product.slug}`} className="w-full">
            <button className="w-full h-11 rounded-xl border-2 border-[#264B0E] text-[#264B0E] hover:bg-[#264B0E] hover:text-white font-bold text-sm uppercase tracking-wide transition-all duration-300 flex items-center justify-center gap-2">
              View
            </button>
          </Link>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   EMPTY SEARCH STATE
═══════════════════════════════════════════════════════════════ */
function EmptySearchState() {
  return (
    <div className="text-center py-20">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#f5e6d3] mb-6">
        <Search className="w-10 h-10 text-[#264B0E]" strokeWidth={2} />
      </div>

      <h3 className="text-heading text-3xl text-[#264B0E] mb-2 uppercase">Start Searching</h3>

      <p className="text-body text-gray-600 max-w-md mx-auto">
        Start typing to search for products. Results will appear automatically.
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   NO RESULTS STATE
═══════════════════════════════════════════════════════════════ */
function NoResultsState({ searchQuery, onClear }) {
  return (
    <div className="text-center py-20">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#f5e6d3] mb-6">
        <ShoppingBag className="w-10 h-10 text-[#264B0E]" strokeWidth={2} />
      </div>

      <h3 className="text-heading text-3xl text-[#264B0E] mb-2 uppercase">
        No Results Found
      </h3>

      <p className="text-body text-gray-600 mb-8 max-w-md mx-auto">
        We couldn't find any products matching{" "}
        {searchQuery && <span className="font-bold">"{searchQuery}"</span>}.
        Try different keywords or browse all products.
      </p>

      <div className="flex gap-3 justify-center flex-wrap">
        <button onClick={onClear} className="btn-outline">
          Clear Search
        </button>

        <Link href="/shop">
          <button className="btn-gold">
            Browse All Products
          </button>
        </Link>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PRODUCT SKELETON
═══════════════════════════════════════════════════════════════ */
function ProductSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100 h-full">
      <div className="aspect-square bg-linear-to-br from-gray-200 to-gray-300 animate-pulse" />
      <div className="p-4 md:p-5 space-y-3">
        <div className="h-6 bg-gray-200 rounded-full w-24 animate-pulse" />
        <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
        <div className="flex-1 py-4"></div>
        <div className="h-8 bg-gray-200 rounded w-32 mx-auto animate-pulse" />
        <div className="h-11 bg-gray-200 rounded-xl animate-pulse" />
      </div>
    </div>
  );
}