"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  ShoppingCart,
  ShoppingBag,
  Loader2,
  Star,
  Eye,
} from "lucide-react";

import { useWishlistStore } from "@/stores/useWishlistStore";
import { useUserStore } from "@/stores/useUserStore";
import { useCartStore } from "@/stores/useCartStore";
import { useGuestCartStore } from "@/stores/useGuestCartStore";
import { useCartUIStore } from "@/stores/useCartUIStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

export default function WishlistPage() {
  const router = useRouter();

  const { isAuthenticated } = useUserStore();

  const { wishlist, loading, getWishlist, removeFromWishlist } =
    useWishlistStore();

  const { addToCart } = useCartStore();
  const { addItem: addGuestItem } = useGuestCartStore();
  const { openCart } = useCartUIStore();

  const [removingId, setRemovingId] = useState(null);
  const [addingToCart, setAddingToCart] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    getWishlist();
  }, [isAuthenticated]);

  const handleRemove = async (productId) => {
    setRemovingId(productId);

    await removeFromWishlist(productId);

    setRemovingId(null);
  };

  const handleAddToCart = async (product) => {
    if (product.isPaan) {
      router.push(`/shop/${product.slug}`);
      return;
    }

    setAddingToCart(product._id);

    if (isAuthenticated) {
      await addToCart({
        productId: product._id,
        quantity: 1,
      });
    } else {
      addGuestItem({
        productId: product._id,
        name: product.name,
        image: product.images?.[0] || null,
        price: product.discountedPrice,
        originalPrice: product.originalPrice,
        isPaan: false,
        variantSetSize: null,
        quantity: 1,
      });
    }

    toast.success("Added to cart!");

    openCart();

    setAddingToCart(null);
  };

  const handleMoveAllToCart = async () => {
    for (const product of wishlist) {
      if (!product.isPaan && product.stock > 0) {
        await handleAddToCart(product);
      }
    }
  };

  return (
    <div className="min-h-screen bg-cream-light py-10">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* =========================
            HEADER
        ========================= */}
        <div className="mb-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-heading text-4xl md:text-5xl text-[#1a1a1a] mb-3 flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-linear-to-br from-[#264B0E] to-brand-green-light flex items-center justify-center shadow-lg">
                  <Heart className="w-7 h-7 text-white fill-white" />
                </div>
                My Wishlist
              </h1>

              <p className="text-[#6b6b6b] text-lg">
                {wishlist.length} {wishlist.length === 1 ? "item" : "items"}{" "}
                saved for later
              </p>
            </div>

            {wishlist.length > 0 && (
              <Button
                onClick={handleMoveAllToCart}
                className="h-12 px-6 rounded-xl bg-[#264B0E] hover:bg-[#1d3a0a] text-white shadow-lg"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add All to Cart
              </Button>
            )}
          </div>
        </div>

        {/* =========================
            LOADING
        ========================= */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card
                key={i}
                className="overflow-hidden rounded-[28px] border border-[#e8dccb]"
              >
                <CardContent className="p-0 animate-pulse">
                  <div className="aspect-square bg-[#ece7df]" />

                  <div className="p-5 space-y-4">
                    <div className="h-5 rounded bg-[#ece7df] w-3/4" />
                    <div className="h-8 rounded bg-[#ece7df] w-1/3" />

                    <div className="grid grid-cols-2 gap-3">
                      <div className="h-12 rounded-xl bg-[#ece7df]" />
                      <div className="h-12 rounded-xl bg-[#ece7df]" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* =========================
            EMPTY STATE
        ========================= */}
        {!loading && wishlist.length === 0 && (
          <Card className="rounded-4xl border border-[#e8dccb] bg-white shadow-xl">
            <CardContent className="p-14 text-center">
              <div className="w-28 h-28 mx-auto mb-8 rounded-full bg-[#f5e6d3] flex items-center justify-center">
                <Heart className="w-12 h-12 text-[#264B0E]" />
              </div>

              <h3 className="text-heading text-3xl text-[#1a1a1a] mb-4">
                Your Wishlist is Empty
              </h3>

              <p className="text-[#6b6b6b] text-lg mb-8 max-w-xl mx-auto">
                Start adding your favorite products and premium paan experiences
                to your wishlist.
              </p>

              <Button
                onClick={() => router.push("/shop")}
                className="h-12 px-8 rounded-xl bg-[#264B0E] text-white hover:bg-[#1d3a0a]"
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                Start Shopping
              </Button>
            </CardContent>
          </Card>
        )}

        {/* =========================
            WISHLIST GRID
        ========================= */}
        {!loading && wishlist.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {wishlist.map((product, index) => (
                <WishlistCard
                  key={product._id}
                  product={product}
                  index={index}
                  onRemove={handleRemove}
                  onAddToCart={handleAddToCart}
                  removingId={removingId}
                  addingToCart={addingToCart}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================
   WISHLIST CARD
========================= */

function WishlistCard({
  product,
  index,
  onRemove,
  onAddToCart,
  removingId,
  addingToCart,
}) {
  const router = useRouter();

  const [imgIndex, setImgIndex] = useState(0);

  const images = product.images || [];

  const hasSecond = images.length > 1;

  const isPaan = product.isPaan;

  const hasVariants = isPaan && product.variants?.length > 0;

  const displayPrice = hasVariants
    ? product.variants[0].discountedPrice
    : product.discountedPrice;

  const originalPrice = hasVariants
    ? product.variants[0].originalPrice
    : product.originalPrice;

  const discount =
    originalPrice && displayPrice && originalPrice > displayPrice
      ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100)
      : 0;

  const isOutOfStock = hasVariants
    ? product.variants.every((v) => (v.stock ?? 0) === 0)
    : (product.stock ?? 0) === 0;

  const isRemoving = removingId === product._id;

  const isAdding = addingToCart === product._id;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <div
        className={cn(
          "group overflow-hidden rounded-[28px] bg-white border border-[#e8dccb]",
          "shadow-[0_10px_40px_rgba(0,0,0,0.06)]",
          "hover:shadow-[0_20px_60px_rgba(0,0,0,0.12)]",
          "transition-all duration-500 hover:-translate-y-1",
          isRemoving && "opacity-50",
        )}
        onMouseEnter={() => hasSecond && setImgIndex(1)}
        onMouseLeave={() => setImgIndex(0)}
      >
        {/* =========================
            IMAGE
        ========================= */}
        <Link
          href={`/shop/${product.slug}`}
          className="block relative overflow-hidden bg-[#f8f3eb]"
          style={{ paddingBottom: "100%" }}
        >
          {/* Primary Image */}
          <Image
            src={images[0] || "/placeholder-product.png"}
            alt={product.name}
            fill
            className={cn(
              "object-cover absolute inset-0 transition-all duration-500 group-hover:scale-105",
              imgIndex === 1 ? "opacity-0 scale-105" : "opacity-100 scale-100",
            )}
          />

          {/* Secondary Image */}
          {hasSecond && (
            <Image
              src={images[1]}
              alt={`${product.name} view 2`}
              fill
              className={cn(
                "object-cover absolute inset-0 transition-all duration-500 group-hover:scale-105",
                imgIndex === 1
                  ? "opacity-100 scale-100"
                  : "opacity-0 scale-105",
              )}
            />
          )}

          {/* Discount Badge */}
          {discount > 0 && (
            <span className="absolute top-4 left-4 bg-[#ff3b30] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg z-10 tracking-wide">
              {discount}% OFF
            </span>
          )}

          {/* Remove Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              onRemove(product._id);
            }}
            disabled={isRemoving}
            className="absolute top-4 right-4 w-11 h-11 rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center hover:bg-[#fff5f5] transition-all shadow-xl z-10 border border-[#f1e7d8]"
          >
            {isRemoving ? (
              <Loader2 className="w-5 h-5 animate-spin text-red-500" />
            ) : (
              <Heart className="w-5 h-5 fill-red-500 text-red-500" />
            )}
          </button>

          {/* Out Of Stock */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center z-10">
              <span className="bg-white text-[#1a1a1a] px-5 py-2 rounded-full font-semibold">
                Out of Stock
              </span>
            </div>
          )}
        </Link>

        {/* =========================
            CONTENT
        ========================= */}
        <div className="bg-white p-5">
          {/* Product Name */}
          <Link href={`/shop/${product.slug}`}>
            <h3 className="text-[#1a1a1a] font-bold text-lg uppercase tracking-wide mb-2 line-clamp-1 hover:text-[#264B0E] transition-colors">
              {product.name}
            </h3>
          </Link>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-4">
            <Star
              className={cn(
                "w-4 h-4",
                product.averageRating > 0
                  ? "fill-gold-bright text-gold-bright"
                  : "text-[#cfcfcf]",
              )}
            />

            <span className="text-sm text-[#6b6b6b]">
              {product.averageRating > 0
                ? `${product.averageRating.toFixed(1)} (${product.totalReviews})`
                : "No reviews yet"}
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-3 mb-5">
            <span className="text-3xl font-black text-[#264B0E]">
              ₹{displayPrice}
            </span>

            {discount > 0 && (
              <span className="text-base text-gray-light line-through">
                ₹{originalPrice}
              </span>
            )}
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => router.push(`/shop/${product.slug}`)}
              className="h-12 rounded-xl border border-[#d8c7af] bg-cream-light text-[#264B0E] font-semibold hover:bg-[#f5e6d3] transition-all flex items-center justify-center gap-2"
            >
              <Eye className="w-4 h-4" />
              View
            </button>

            <button
              onClick={() => onAddToCart(product)}
              disabled={isOutOfStock || isAdding}
              className={cn(
                "h-12 rounded-xl font-semibold transition-all flex items-center justify-center gap-2",
                isOutOfStock
                  ? "bg-[#e5e5e5] text-gray-light cursor-not-allowed"
                  : "bg-[#264B0E] text-white hover:bg-[#1d3a0a] shadow-lg hover:shadow-[#264B0E]/20",
              )}
            >
              {isAdding ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Adding
                </>
              ) : isPaan ? (
                <>
                  <Eye className="w-4 h-4" />
                  Options
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  Add
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
