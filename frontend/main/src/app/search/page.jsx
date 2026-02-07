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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

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

const ALL_CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: "Digestive", label: "Digestives" },
  { value: "Candy & More", label: "Candy & More" },
  { value: "Mouth Fresheners", label: "Mouth Fresheners" },
  { value: "Paan", label: "Paan" },
];

const SORT_OPTIONS = [
  { value: "relevance", label: "Most Relevant" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "newest", label: "Newest First" },
  { value: "rating", label: "Highest Rated" },
];

const POPULAR_SEARCHES = [
  "Banarasi Paan",
  "Digestive",
  "Mouth Freshener",
  "Meetha Paan",
  "Sada Paan",
  "Candy",
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
      // Clear results if search is empty
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

  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory);
    if (searchQuery.trim()) {
      performSearch(searchQuery, newCategory);
      updateURL(searchQuery, newCategory);
    }
  };

  const handlePopularSearch = (term) => {
    setSearchQuery(term);
    // Search will trigger via useEffect
  };

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
    <div className="min-h-screen bg-linear-to-b from-white to-gray-50">
      {/* Search Hero */}
      <section className="bg-linear-to-br from-[#0b1f11] to-[#1a3d1f] text-white py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Search Products
              </h1>
              <p className="text-gray-300 text-lg">
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
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                  <Input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for products..."
                    className="pl-10 pr-10 h-12 bg-white text-gray-900 border-0 focus-visible:ring-2 focus-visible:ring-[#d4af37]"
                  />
                  {searchQuery && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                  {isSearching && (
                    <div className="absolute right-10 top-1/2 -translate-y-1/2">
                      <Loader2 className="w-4 h-4 animate-spin text-[#d4af37]" />
                    </div>
                  )}
                </div>
              </div>

              {/* Real-time search indicator */}
              {searchQuery && (
                <div className="text-center">
                  <Badge
                    variant="secondary"
                    className="bg-white/10 text-white hover:bg-white/20"
                  >
                    {isSearching ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Searching...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        ✓ Search updated
                      </span>
                    )}
                  </Badge>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Search Results */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {hasSearched && (
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            {/* Results Info */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-gray-600">
                <TrendingUp className="w-5 h-5 text-[#d4af37]" />
                <span className="text-sm">
                  <span className="font-semibold text-gray-900">
                    {sortedProducts.length}
                  </span>{" "}
                  {sortedProducts.length === 1 ? "result" : "results"} found
                  {searchQuery && (
                    <>
                      {" "}
                      for{" "}
                      <span className="font-semibold text-gray-900">
                        "{searchQuery}"
                      </span>
                    </>
                  )}
                </span>
              </div>

              {/* Clear Button */}
              {(searchQuery || category !== "all") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSearch}
                  className="text-gray-600 hover:text-[#d4af37]"
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>

            {/* Sort Dropdown */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-56">
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

/* =========================
   PRODUCT CARD
========================= */
function ProductCard({ product, isAuthenticated }) {
  const { addToCart } = useCartStore();
  const [isAdding, setIsAdding] = useState(false);

  const isPaan = product.category === "Paan";
  const hasVariants = product.variants?.length > 0;

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
    return null;
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

    if (isPaan) {
      window.location.href = `/shop/${product._id}`;
      return;
    }

    setIsAdding(true);
    await addToCart({
      productId: product._id,
      quantity: 1,
    });
    setIsAdding(false);
  };

  return (
    <Card className="h-full group overflow-hidden hover:shadow-2xl transition-all duration-500">
      <Link href={`/shop/${product._id}`}>
        <div className="relative h-48 md:h-56 overflow-hidden bg-gray-100">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700"
          />

          {discount > 0 && (
            <Badge className="absolute top-3 left-3 bg-red-500 hover:bg-red-600">
              {discount}% OFF
            </Badge>
          )}

          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
              <Badge variant="secondary" className="bg-white text-gray-900">
                Out of Stock
              </Badge>
            </div>
          )}
        </div>
      </Link>

      <CardContent className="p-3 md:p-4 flex flex-col flex-1">
        <Link href={`/shop/${product._id}`}>
          <Badge variant="outline" className="mb-2 w-fit text-xs">
            {product.subcategory || product.category}
          </Badge>

          <h3 className="font-bold text-sm md:text-base text-gray-900 line-clamp-2 group-hover:text-[#d4af37] transition-colors min-h-10 md:min-h-12">
            {product.name}
          </h3>
        </Link>

        <p className="text-xs md:text-sm text-gray-500 line-clamp-2 mb-2">
          {product.description}
        </p>

        <div className="flex-1"></div>

        <div className="mb-4">
          {isPaan ? (
            <p className="text-lg md:text-xl font-bold text-gray-900 text-center">
              {getPriceDisplay()}
            </p>
          ) : (
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {discount > 0 && product.originalPrice && (
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

        {isAuthenticated ? (
          <Button
            onClick={handleAddToCart}
            disabled={isOutOfStock || isAdding}
            className={cn(
              "w-full",
              isOutOfStock
                ? "bg-gray-100 text-gray-400 cursor-not-allowed hover:bg-gray-100"
                : "bg-[#2d5016] hover:bg-[#3d6820]",
            )}
          >
            {isAdding ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add To Cart
              </>
            )}
          </Button>
        ) : (
          <Button asChild className="w-full bg-[#2d5016] hover:bg-[#3d6820]">
            <Link href={`/shop/${product._id}`}>
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

/* =========================
   EMPTY SEARCH STATE
========================= */
function EmptySearchState() {
  return (
    <div className="text-center py-20">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-6">
        <Search className="w-10 h-10 text-gray-400" />
      </div>

      <h3 className="text-2xl font-bold text-gray-900 mb-2">Start Searching</h3>

      <p className="text-gray-600 max-w-md mx-auto">
        Start typing to search for products. Results will appear automatically.
      </p>
    </div>
  );
}

/* =========================
   NO RESULTS STATE
========================= */
function NoResultsState({ searchQuery, onClear }) {
  return (
    <div className="text-center py-20">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-6">
        <ShoppingBag className="w-10 h-10 text-gray-400" />
      </div>

      <h3 className="text-2xl font-bold text-gray-900 mb-2">
        No Results Found
      </h3>

      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        We couldn't find any products matching{" "}
        {searchQuery && <span className="font-semibold">"{searchQuery}"</span>}.
        Try different keywords or browse all products.
      </p>

      <div className="flex gap-3 justify-center">
        <Button variant="outline" onClick={onClear}>
          Clear Search
        </Button>

        <Button
          asChild
          className="bg-linear-to-r from-[#d4af37] to-[#f4d03f] text-[#0b1f11] hover:opacity-90"
        >
          <Link href="/shop">Browse All Products</Link>
        </Button>
      </div>
    </div>
  );
}

/* =========================
   PRODUCT SKELETON
========================= */
function ProductSkeleton() {
  return (
    <Card className="h-full overflow-hidden">
      <div className="h-48 md:h-56 bg-gray-200 animate-pulse" />
      <CardContent className="p-3 md:p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
        <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
        <div className="flex-1"></div>
        <div className="h-6 bg-gray-200 rounded w-32 mx-auto animate-pulse" />
        <div className="h-10 bg-gray-200 rounded animate-pulse" />
      </CardContent>
    </Card>
  );
}
