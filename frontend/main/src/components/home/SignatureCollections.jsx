"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useProductStore } from "@/stores/useProductStore";
import { useCartStore } from "@/stores/useCartStore";
import {
  ShoppingBag,
  Star,
  Heart,
  TrendingUp,
  Package,
  Sparkles,
  ArrowRight,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function SignatureCollections() {
  const { featuredProducts, fetchFeaturedProducts, loading } =
    useProductStore();

  useEffect(() => {
    fetchFeaturedProducts();
  }, [fetchFeaturedProducts]);

  return (
    <section className="relative bg-linear-to-b from-[#fafaf6] via-white to-[#fafaf6] py-20 overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-0 w-96 h-96 bg-[#d4af37]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-0 w-96 h-96 bg-[#2d5016]/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-linear-to-r from-[#d4af37]/20 to-[#f4d03f]/20 px-4 py-2 rounded-full mb-4">
            <Sparkles className="w-4 h-4 text-[#d4af37]" />
            <span className="text-sm font-semibold text-[#2d5016] tracking-wide">
              CURATED PICKS
            </span>
          </div>

          {/* Title */}
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Signature{" "}
            <span className="bg-linear-to-r from-[#2d5016] via-[#3d6820] to-[#2d5016] bg-clip-text text-transparent">
              Collections
            </span>
          </h2>

          {/* Description */}
          <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
            Hand-crafted paans and delicacies, chosen for those who appreciate
            authenticity and indulgence.
          </p>
        </motion.div>

        {/* PRODUCT GRID */}
        {loading ? (
          <ProductGridSkeleton />
        ) : featuredProducts.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {featuredProducts.map((product, index) => (
              <ProductCard key={product._id} product={product} index={index} />
            ))}
          </div>
        )}

        {/* CTA */}
        {!loading && featuredProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="mt-16 text-center"
          >
            <Link href="/shop">
              <Button
                size="lg"
                className="bg-linear-to-r from-[#2d5016] to-[#3d6820] hover:opacity-90 text-white font-semibold px-8 h-14 text-base shadow-xl group"
              >
                Explore All Products
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight className="w-5 h-5 ml-2" />
                </motion.span>
              </Button>
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
}

/* =========================
   PRODUCT CARD
========================= */
function ProductCard({ product, index }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const { addToCart } = useCartStore();

  const images = product.images || [];
  const hasMultipleImages = images.length > 1;
  const hasVariants = product.variants && product.variants.length > 0;
  const isOutOfStock = product.stock === 0 && !hasVariants;

  // Calculate discount percentage
  const discountPercent =
    product.originalPrice && product.discountedPrice
      ? Math.round(
          ((product.originalPrice - product.discountedPrice) /
            product.originalPrice) *
            100,
        )
      : 0;

  // Get price display
  const displayPrice = hasVariants
    ? product.variants[0].discountedPrice
    : product.discountedPrice;

  const displayOriginalPrice = hasVariants
    ? product.variants[0].originalPrice
    : product.originalPrice;

  // Cycle through images on hover
  useEffect(() => {
    if (isHovered && hasMultipleImages) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
      }, 1500);
      return () => clearInterval(interval);
    } else {
      setCurrentImageIndex(0);
    }
  }, [isHovered, hasMultipleImages, images.length]);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (isOutOfStock) return;

    await addToCart({
      productId: product._id,
      quantity: 1,
      variantSetSize: hasVariants ? product.variants[0].setSize : undefined,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500"
    >
      {/* IMAGE CONTAINER */}
      <Link
        href={`/shop/${product._id}`}
        className="block relative h-80 bg-gray-100"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentImageIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            <Image
              src={images[currentImageIndex] || "/placeholder-product.png"}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-700"
            />
          </motion.div>
        </AnimatePresence>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
          {discountPercent > 0 && (
            <Badge className="bg-red-600 hover:bg-red-700 text-white border-0 font-bold">
              {discountPercent}% OFF
            </Badge>
          )}
          {product.isFeatured && (
            <Badge className="bg-linear-to-r from-[#d4af37] to-[#f4d03f] text-black border-0 font-semibold">
              <TrendingUp className="w-3 h-3 mr-1" />
              Featured
            </Badge>
          )}
          {isOutOfStock && (
            <Badge
              variant="secondary"
              className="bg-gray-800 text-white border-0"
            >
              Out of Stock
            </Badge>
          )}
        </div>

        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            setIsFavorite(!isFavorite);
          }}
          className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors z-10"
        >
          <Heart
            className={cn(
              "w-5 h-5 transition-colors",
              isFavorite ? "fill-red-500 text-red-500" : "text-gray-600",
            )}
          />
        </button>

        {/* Image Indicators */}
        {hasMultipleImages && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {images.map((_, idx) => (
              <div
                key={idx}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  idx === currentImageIndex
                    ? "w-6 bg-white"
                    : "w-1.5 bg-white/50",
                )}
              />
            ))}
          </div>
        )}

        {/* Quick View Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="flex gap-3">
            <Button
              size="sm"
              variant="secondary"
              className="bg-white hover:bg-gray-100 text-black"
            >
              <Eye className="w-4 h-4 mr-2" />
              Quick View
            </Button>
          </div>
        </div>
      </Link>

      {/* CONTENT */}
      <div className="p-5">
        {/* Category & Rating */}
        <div className="flex items-center justify-between mb-2">
          <Badge variant="outline" className="text-xs">
            {product.subcategory || product.category}
          </Badge>

          {product.averageRating > 0 && (
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">
                {product.averageRating}
              </span>
              <span className="text-xs text-gray-500">
                ({product.totalReviews})
              </span>
            </div>
          )}
        </div>

        {/* Product Name */}
        <Link href={`/shop/${product._id}`}>
          <h3 className="font-bold text-lg text-gray-900 line-clamp-2 mb-3 hover:text-[#2d5016] transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Variants Info */}
        {/* {hasVariants && (
          <div className="flex items-center gap-2 mb-3">
            <Package className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              {product.variants.length} size
              {product.variants.length > 1 ? "s" : ""} available
            </span>
          </div>
        )} */}

        {/* Price */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl font-bold text-gray-900">
            ₹{displayPrice}
          </span>
          {displayOriginalPrice && displayOriginalPrice > displayPrice && (
            <span className="text-sm text-gray-500 line-through">
              ₹{displayOriginalPrice}
            </span>
          )}
          {hasVariants && (
            <span className="text-xs text-gray-500">onwards</span>
          )}
        </div>

        {/* Add to Cart Button */}
        <Button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={cn(
            "w-full h-11 font-semibold transition-all duration-300",
            isOutOfStock
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-linear-to-r from-[#2d5016] to-[#3d6820] hover:opacity-90 text-white",
          )}
        >
          {isOutOfStock ? (
            "Out of Stock"
          ) : (
            <>
              <ShoppingBag className="w-4 h-4 mr-2" />
              Add to Cart
            </>
          )}
        </Button>
      </div>

      {/* Hover Border Effect */}
      <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-[#d4af37]/50 transition-colors duration-300 pointer-events-none" />
    </motion.div>
  );
}

/* =========================
   SKELETON LOADER
========================= */
function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl overflow-hidden shadow-lg animate-pulse"
        >
          <div className="h-80 bg-gray-200" />
          <div className="p-5 space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/3" />
            <div className="h-6 bg-gray-200 rounded w-3/4" />
            <div className="h-8 bg-gray-200 rounded w-1/2" />
            <div className="h-11 bg-gray-200 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* =========================
   EMPTY STATE
========================= */
function EmptyState() {
  return (
    <div className="text-center py-20">
      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
        <ShoppingBag className="w-10 h-10 text-gray-400" />
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-2">
        No Featured Products Yet
      </h3>
      <p className="text-gray-600 mb-8">
        Check back soon for our curated collections!
      </p>
      <Link href="/shop">
        <Button
          variant="outline"
          className="border-2 border-[#2d5016] text-[#2d5016] hover:bg-[#2d5016] hover:text-white"
        >
          Browse All Products
        </Button>
      </Link>
    </div>
  );
}
