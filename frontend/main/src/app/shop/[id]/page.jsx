"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useProductStore } from "@/stores/useProductStore";
import { useCartStore } from "@/stores/useCartStore";
import { useUserStore } from "@/stores/useUserStore";
import { useGuestCartStore } from "@/stores/useGuestCartStore";
import { useReviewStore } from "@/stores/useReviewStore";
import { useWishlistStore } from "@/stores/useWishlistStore";
import {
  ChevronRight,
  Star,
  ShoppingCart,
  Heart,
  Share2,
  Minus,
  Plus,
  Loader2,
  Check,
  AlertCircle,
  Package,
  Truck,
  Shield,
  Award,
  MessageSquare,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ── helpers ── */
const resolveName = (f) => (f && typeof f === "object" ? f.name : f) || "";
const resolveSlug = (f) => (f && typeof f === "object" ? f.slug : null);

export default function ProductDetailPage() {
  const params  = useParams();
  const router  = useRouter();

  const { currentProduct, loading, error, fetchProductById } = useProductStore();
  const { addToCart, loading: cartLoading } = useCartStore();
  const { isAuthenticated }                 = useUserStore();
  const { addItem: addGuestItem }           = useGuestCartStore();
  const {
    reviews, myReview, loading: reviewLoading,
    fetchProductReviews, fetchMyReview, submitReview,
  } = useReviewStore();
  const { addToWishlist, removeFromWishlist, checkWishlistStatus } = useWishlistStore();

  const [selectedImage,  setSelectedImage]  = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity,       setQuantity]       = useState(1);
  const [activeTab,      setActiveTab]      = useState("description");
  const [isAdding,       setIsAdding]       = useState(false);

  const [reviewRating,       setReviewRating]       = useState(0);
  const [reviewText,         setReviewText]         = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const [isWishlisted,   setIsWishlisted]   = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  /* ── fetch on mount ── */
  useEffect(() => {
    if (!params.id) return;
    fetchProductById(params.id);
    fetchProductReviews(params.id);
    if (isAuthenticated) fetchMyReview(params.id);
  }, [params.id, isAuthenticated]);

  /* ── pre-fill review form ── */
  useEffect(() => {
    if (myReview) {
      setReviewRating(myReview.rating);
      setReviewText(myReview.review || "");
    }
  }, [myReview]);

  /* ── init variant for paan products ── */
  useEffect(() => {
    if (currentProduct?.isPaan && currentProduct.variants?.length > 0) {
      setSelectedVariant(currentProduct.variants[0]);
    }
  }, [currentProduct]);

  /* ── wishlist status ── */
  useEffect(() => {
    if (isAuthenticated && currentProduct?._id) {
      checkWishlistStatus(currentProduct._id).then(setIsWishlisted);
    }
  }, [isAuthenticated, currentProduct?._id]);

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) { toast.error("Please login to manage your wishlist"); return; }
    setWishlistLoading(true);
    if (isWishlisted) {
      await removeFromWishlist(currentProduct._id);
      setIsWishlisted(false);
    } else {
      await addToWishlist(currentProduct._id);
      setIsWishlisted(true);
    }
    setWishlistLoading(false);
  };

  const handleShare = async () => {
    const url  = `${window.location.origin}/shop/${currentProduct._id}`;
    const text = `Check out ${currentProduct.name} on Paanshala`;
    try {
      if (navigator.share) {
        await navigator.share({ title: currentProduct.name, text, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Product link copied to clipboard");
      }
    } catch { toast.error("Unable to share product"); }
  };

  if (loading)                       return <ProductDetailSkeleton />;
  if (error || !currentProduct)      return <ProductNotFound />;

  /* ── derived values (all using isPaan flag + populated objects) ── */
  const isPaan      = currentProduct.isPaan;
  const hasVariants = isPaan && currentProduct.variants?.length > 0;

  // Category display
  const categoryName    = resolveName(currentProduct.category);
  const parentCatName   = resolveName(currentProduct.parentCategory);
  const categorySlug    = resolveSlug(currentProduct.category);
  const parentCatSlug   = resolveSlug(currentProduct.parentCategory);

  // Badge label: show leaf if different from root, else root
  const badgeLabel = categoryName && categoryName !== parentCatName
    ? categoryName
    : parentCatName || categoryName;

  // Breadcrumb collection link
  const collectionHref = categorySlug
    ? `/collections/${categorySlug}`
    : parentCatSlug
    ? `/collections/${parentCatSlug}`
    : "/shop";

  // Pricing
  const price = isPaan && selectedVariant
    ? selectedVariant.discountedPrice
    : currentProduct.discountedPrice;

  const originalPrice = isPaan && selectedVariant
    ? selectedVariant.originalPrice
    : currentProduct.originalPrice;

  const discount = originalPrice && price && originalPrice > price
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  // Stock
  const isOutOfStock = isPaan
    ? !selectedVariant || (selectedVariant.stock ?? 0) === 0
    : (currentProduct.stock ?? 0) === 0;

  const handleAddToCart = async () => {
    if (isOutOfStock) return;

    if (isAuthenticated) {
      setIsAdding(true);
      const success = await addToCart({
        productId:      currentProduct._id,
        quantity,
        variantSetSize: selectedVariant?.setSize,
      });
      setIsAdding(false);
      if (success) setQuantity(1);
    } else {
      // Guest — add to localStorage cart
      addGuestItem({
        productId:      currentProduct._id,
        name:           currentProduct.name,
        image:          currentProduct.images?.[0] || null,
        price:          price,
        originalPrice:  originalPrice,
        isPaan:         currentProduct.isPaan,
        variantSetSize: selectedVariant?.setSize || null,
        quantity,
      });
      toast.success(`${currentProduct.name} added to cart!`);
      setQuantity(1);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { router.push("/login"); return; }
    if (reviewRating === 0) { toast.error("Please select a rating"); return; }
    setIsSubmittingReview(true);
    await submitReview({ productId: currentProduct._id, rating: reviewRating, review: reviewText });
    setIsSubmittingReview(false);
  };

  const parseAdditionalInfo = (str) => {
    if (!str) return [];
    return str.split("\n")
      .filter((l) => l.trim() && l.includes(":"))
      .map((l) => {
        const [key, ...rest] = l.split(":");
        return { key: key.trim(), value: rest.join(":").trim() };
      });
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-white to-gray-50">

      {/* ── Breadcrumb ── */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 flex-wrap">
            <Link href="/" className="hover:text-[#d4af37] transition-colors">Home</Link>
            <ChevronRight className="w-4 h-4 shrink-0" />
            {parentCatName && parentCatName !== categoryName && (
              <>
                <Link href={`/collections/${parentCatSlug}`} className="hover:text-[#d4af37] transition-colors">
                  {parentCatName}
                </Link>
                <ChevronRight className="w-4 h-4 shrink-0" />
              </>
            )}
            {categoryName && (
              <>
                <Link href={collectionHref} className="hover:text-[#d4af37] transition-colors">
                  {categoryName}
                </Link>
                <ChevronRight className="w-4 h-4 shrink-0" />
              </>
            )}
            <span className="text-gray-900 font-medium line-clamp-1">{currentProduct.name}</span>
          </div>
        </div>
      </section>

      {/* ── Product Details ── */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

          {/* Left: Images */}
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative aspect-square bg-gray-100 rounded-2xl overflow-hidden"
            >
              <Image
                src={currentProduct.images[selectedImage]}
                alt={currentProduct.name}
                fill
                className="object-cover"
                priority
              />
              {discount > 0 && (
                <div className="absolute top-4 left-4">
                  <span className="bg-red-500 text-white text-sm font-bold px-4 py-2 rounded-md shadow-lg">
                    {discount}% OFF
                  </span>
                </div>
              )}
              {isOutOfStock && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                  <span className="bg-white text-gray-900 px-6 py-3 rounded-full font-bold text-lg">
                    Out of Stock
                  </span>
                </div>
              )}
            </motion.div>

            {currentProduct.images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {currentProduct.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={cn(
                      "relative aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 transition-all",
                      selectedImage === i
                        ? "border-[#d4af37] ring-2 ring-[#d4af37]/30"
                        : "border-gray-200 hover:border-[#d4af37]/50"
                    )}
                  >
                    <Image src={img} alt={`${currentProduct.name} ${i + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Info */}
          <div className="space-y-6">
            {/* Category badge — links to collection */}
            <div className="flex items-center gap-2 flex-wrap">
              {parentCatName && parentCatName !== categoryName && (
                <Link href={`/collections/${parentCatSlug}`}>
                  <span className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full hover:bg-[#d4af37]/10 hover:text-[#d4af37] transition-colors">
                    {parentCatName}
                  </span>
                </Link>
              )}
              <Link href={collectionHref}>
                <span className="text-sm font-medium text-[#d4af37] bg-[#d4af37]/10 px-3 py-1 rounded-full hover:bg-[#d4af37]/20 transition-colors">
                  {badgeLabel}
                </span>
              </Link>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{currentProduct.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn("w-5 h-5",
                      i < Math.floor(currentProduct.averageRating || 0)
                        ? "fill-[#d4af37] text-[#d4af37]"
                        : "text-gray-300"
                    )}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {currentProduct.averageRating > 0
                  ? `${currentProduct.averageRating.toFixed(1)} (${currentProduct.totalReviews} reviews)`
                  : "No reviews yet"}
              </span>
            </div>

            {/* Price */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <div className="flex items-baseline gap-3 flex-wrap">
                {discount > 0 && (
                  <span className="text-2xl text-gray-400 line-through">₹{originalPrice}.00</span>
                )}
                <span className="text-4xl font-bold text-[#d4af37]">₹{price}.00</span>
                {isPaan && selectedVariant && (
                  <span className="text-lg text-gray-600">/ {selectedVariant.setSize} pcs</span>
                )}
              </div>
              {discount > 0 && (
                <p className="text-sm text-green-600 mt-2 font-medium">
                  You save ₹{originalPrice - price}.00 ({discount}% off)
                </p>
              )}
            </div>

            {/* Variant selector (paan only) */}
            {isPaan && hasVariants && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Select Size:</h3>
                <div className="grid grid-cols-2 gap-3">
                  {currentProduct.variants.map((v) => (
                    <button
                      key={v.setSize}
                      onClick={() => setSelectedVariant(v)}
                      disabled={(v.stock ?? 0) === 0}
                      className={cn(
                        "p-4 rounded-xl border-2 transition-all text-left",
                        selectedVariant?.setSize === v.setSize
                          ? "border-[#d4af37] bg-[#d4af37]/10"
                          : "border-gray-200 hover:border-[#d4af37]/50",
                        (v.stock ?? 0) === 0 && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">{v.setSize} Pieces</p>
                          <p className="text-sm text-gray-600">₹{v.discountedPrice}.00</p>
                        </div>
                        {selectedVariant?.setSize === v.setSize && (
                          <Check className="w-5 h-5 text-[#d4af37]" />
                        )}
                      </div>
                      {(v.stock ?? 0) === 0 && (
                        <p className="text-xs text-red-500 mt-2">Out of stock</p>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Quantity:</h3>
              <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden w-fit">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 hover:bg-gray-100 transition-colors"
                  disabled={quantity <= 1}
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="px-6 font-semibold text-lg">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-3 hover:bg-gray-100 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* CTA buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock || isAdding}
                className={cn(
                  "flex-1 py-4 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-3",
                  isOutOfStock
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-linear-to-r from-[#2d5016] to-[#3d6820] text-white hover:shadow-xl hover:scale-105"
                )}
              >
                {isAdding ? (
                  <><Loader2 className="w-6 h-6 animate-spin" />Adding…</>
                ) : (
                  <><ShoppingCart className="w-6 h-6" />Add to Cart</>
                )}
              </button>

              <button
                onClick={handleWishlistToggle}
                disabled={wishlistLoading}
                className={cn(
                  "p-4 border-2 rounded-xl transition-all flex items-center justify-center",
                  isWishlisted
                    ? "border-[#d4af37] bg-[#d4af37]/10"
                    : "border-gray-200 hover:border-[#d4af37] hover:bg-[#d4af37]/10",
                  wishlistLoading && "opacity-60 cursor-not-allowed"
                )}
              >
                <Heart className={cn("w-6 h-6 transition-colors", isWishlisted ? "fill-[#d4af37] text-[#d4af37]" : "text-gray-600")} />
              </button>

              <button
                onClick={handleShare}
                className="p-4 border-2 border-gray-200 rounded-xl hover:border-[#d4af37] hover:bg-[#d4af37]/10 transition-all"
              >
                <Share2 className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Features grid */}
            <div className="grid grid-cols-2 gap-4 pt-6 border-t">
              {[
                { icon: Package, bg: "bg-green-100",  color: "text-green-600",  title: "Premium Quality", sub: "Authentic ingredients" },
                { icon: Truck,   bg: "bg-blue-100",   color: "text-blue-600",   title: "Fast Delivery",   sub: "Within 2-3 days" },
                { icon: Shield,  bg: "bg-purple-100", color: "text-purple-600", title: "100% Hygienic",   sub: "Safe preparation" },
                { icon: Award,   bg: "bg-amber-100",  color: "text-amber-600",  title: "Certified",       sub: "Quality assured" },
              ].map(({ icon: Icon, bg, color, title, sub }) => (
                <div key={title} className="flex items-center gap-3">
                  <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center", bg)}>
                    <Icon className={cn("w-6 h-6", color)} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{title}</p>
                    <p className="text-xs text-gray-600">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="mt-12">
          <div className="border-b border-gray-200">
            <div className="flex gap-8 overflow-x-auto">
              {["description", "info", "reviews"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "pb-4 font-semibold transition-colors relative whitespace-nowrap shrink-0",
                    activeTab === tab ? "text-[#d4af37]" : "text-gray-600 hover:text-gray-900"
                  )}
                >
                  {tab === "description" && "Description"}
                  {tab === "info" && "Additional Information"}
                  {tab === "reviews" && `Reviews (${reviews.length})`}
                  {activeTab === tab && (
                    <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#d4af37]" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="py-8">
            {/* Description */}
            {activeTab === "description" && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed text-lg">{currentProduct.description}</p>
              </motion.div>
            )}

            {/* Additional Info */}
            {activeTab === "info" && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                {currentProduct.additionalInfo ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {parseAdditionalInfo(currentProduct.additionalInfo).map((item, i) => (
                      <div key={i} className="flex justify-between py-3 border-b">
                        <span className="font-semibold text-gray-900">{item.key}:</span>
                        <span className="text-gray-700 text-right">{item.value}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <InfoRow label="Category" value={
                        <Link href={collectionHref} className="text-[#d4af37] hover:underline">{categoryName}</Link>
                      } />
                      {parentCatName && parentCatName !== categoryName && (
                        <InfoRow label="Parent Category" value={
                          <Link href={`/collections/${parentCatSlug}`} className="text-[#d4af37] hover:underline">{parentCatName}</Link>
                        } />
                      )}
                      <InfoRow
                        label="Availability"
                        value={
                          <span className={isOutOfStock ? "text-red-600 font-medium" : "text-green-600 font-medium"}>
                            {isOutOfStock ? "Out of Stock" : "In Stock"}
                          </span>
                        }
                      />
                    </div>
                    <div className="space-y-4">
                      <InfoRow label="Product ID" value={
                        <span className="font-mono text-sm">{currentProduct._id.slice(-8).toUpperCase()}</span>
                      } />
                      {isPaan && hasVariants && (
                        <InfoRow label="Variants" value={`${currentProduct.variants.length} options`} />
                      )}
                      <InfoRow
                        label="Rating"
                        value={currentProduct.averageRating > 0
                          ? `${currentProduct.averageRating.toFixed(1)} / 5.0`
                          : "Not rated yet"}
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Reviews */}
            {activeTab === "reviews" && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                {/* Summary */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div className="text-center md:text-left">
                      <div className="flex items-baseline gap-2 justify-center md:justify-start mb-2">
                        <span className="text-5xl font-bold text-gray-900">
                          {currentProduct.averageRating > 0 ? currentProduct.averageRating.toFixed(1) : "0.0"}
                        </span>
                        <span className="text-gray-600">/ 5.0</span>
                      </div>
                      <div className="flex items-center gap-1 justify-center md:justify-start mb-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={cn("w-5 h-5", i < Math.floor(currentProduct.averageRating || 0) ? "fill-[#d4af37] text-[#d4af37]" : "text-gray-300")} />
                        ))}
                      </div>
                      <p className="text-sm text-gray-600">
                        Based on {currentProduct.totalReviews} review{currentProduct.totalReviews !== 1 ? "s" : ""}
                      </p>
                    </div>
                    {isAuthenticated && (
                      <button
                        onClick={() => document.getElementById("review-form")?.scrollIntoView({ behavior: "smooth" })}
                        className="bg-[#d4af37] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#c49d2f] transition-colors"
                      >
                        {myReview ? "Edit Your Review" : "Write a Review"}
                      </button>
                    )}
                  </div>
                </div>

                {/* Review form */}
                {isAuthenticated && (
                  <form id="review-form" onSubmit={handleSubmitReview} className="bg-white border-2 border-gray-200 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      {myReview ? "Edit Your Review" : "Write a Review"}
                    </h3>
                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Your Rating *</label>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button key={star} type="button" onClick={() => setReviewRating(star)} className="focus:outline-none transition-transform hover:scale-110">
                            <Star className={cn("w-8 h-8 cursor-pointer", star <= reviewRating ? "fill-[#d4af37] text-[#d4af37]" : "text-gray-300 hover:text-[#d4af37]")} />
                          </button>
                        ))}
                        {reviewRating > 0 && (
                          <span className="ml-2 text-sm font-medium text-gray-700">{reviewRating} {reviewRating === 1 ? "star" : "stars"}</span>
                        )}
                      </div>
                    </div>
                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Your Review (Optional)</label>
                      <textarea
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-transparent resize-none"
                        placeholder="Share your experience with this product…"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmittingReview || reviewRating === 0}
                      className={cn(
                        "w-full md:w-auto px-8 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2",
                        isSubmittingReview || reviewRating === 0
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-linear-to-r from-[#2d5016] to-[#3d6820] text-white hover:shadow-lg"
                      )}
                    >
                      {isSubmittingReview
                        ? <><Loader2 className="w-5 h-5 animate-spin" />Submitting…</>
                        : <><MessageSquare className="w-5 h-5" />{myReview ? "Update Review" : "Submit Review"}</>}
                    </button>
                  </form>
                )}

                {/* Login prompt */}
                {!isAuthenticated && (
                  <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-8 text-center">
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Want to share your experience?</h3>
                    <p className="text-gray-600 mb-6">Login to write a review for this product</p>
                    <Link href="/login" className="inline-flex items-center gap-2 bg-[#d4af37] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#c49d2f] transition-colors">
                      Login to Review
                    </Link>
                  </div>
                )}

                {/* Reviews list */}
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-gray-900">Customer Reviews ({reviews.length})</h3>
                  {reviewLoading ? (
                    <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-[#d4af37]" /></div>
                  ) : reviews.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-xl">
                      <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No reviews yet. Be the first to review this product!</p>
                    </div>
                  ) : (
                    reviews.map((review) => (
                      <div key={review._id} className="bg-white border border-gray-200 rounded-xl p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-[#d4af37]/10 rounded-full flex items-center justify-center">
                              <User className="w-6 h-6 text-[#d4af37]" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{review.user?.full_name || "Anonymous"}</p>
                              <p className="text-sm text-gray-600">
                                {new Date(review.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 mb-3">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={cn("w-4 h-4", i < review.rating ? "fill-[#d4af37] text-[#d4af37]" : "text-gray-300")} />
                          ))}
                          <span className="ml-2 text-sm font-medium text-gray-700">{review.rating}.0</span>
                        </div>
                        {review.review && <p className="text-gray-700 leading-relaxed">{review.review}</p>}
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

/* ── helpers ── */
function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between items-center py-3 border-b">
      <span className="font-semibold text-gray-900">{label}:</span>
      <span className="text-gray-700 text-right">{value}</span>
    </div>
  );
}

function ProductDetailSkeleton() {
  return (
    <div className="min-h-screen bg-linear-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 animate-pulse">
          <div className="space-y-4">
            <div className="aspect-square bg-gray-200 rounded-2xl" />
            <div className="grid grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="aspect-square bg-gray-200 rounded-lg" />
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <div className="h-6 bg-gray-200 rounded w-24" />
            <div className="h-10 bg-gray-200 rounded w-3/4" />
            <div className="h-6 bg-gray-200 rounded w-40" />
            <div className="h-24 bg-gray-200 rounded" />
            <div className="h-32 bg-gray-200 rounded" />
            <div className="h-16 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center px-4">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mb-6">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Product Not Found</h1>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          The product you're looking for doesn't exist or has been removed.
        </p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 bg-linear-to-r from-[#d4af37] to-[#f4d03f] text-[#0b1f11] px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-all shadow-lg"
        >
          Back to Shop
        </Link>
      </div>
    </div>
  );
}