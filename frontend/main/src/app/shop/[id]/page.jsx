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

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { currentProduct, loading, error, fetchProductById } =
    useProductStore();
  const { addToCart, loading: cartLoading } = useCartStore();
  const { isAuthenticated } = useUserStore();
  const {
    reviews,
    myReview,
    loading: reviewLoading,
    fetchProductReviews,
    fetchMyReview,
    submitReview,
  } = useReviewStore();
  const { addToWishlist, removeFromWishlist, checkWishlistStatus } =
    useWishlistStore();

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [isAdding, setIsAdding] = useState(false);

  // Review form state
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchProductById(params.id);
      fetchProductReviews(params.id);

      // Fetch user's review if authenticated
      if (isAuthenticated) {
        fetchMyReview(params.id);
      }
    }
  }, [
    params.id,
    isAuthenticated,
    fetchProductById,
    fetchProductReviews,
    fetchMyReview,
  ]);

  // Initialize review form with existing review
  useEffect(() => {
    if (myReview) {
      setReviewRating(myReview.rating);
      setReviewText(myReview.review || "");
    }
  }, [myReview]);

  // Initialize variant for Paan products
  useEffect(() => {
    if (
      currentProduct?.category === "Paan" &&
      currentProduct?.variants?.length > 0
    ) {
      setSelectedVariant(currentProduct.variants[0]);
    }
  }, [currentProduct]);

  useEffect(() => {
    const checkStatus = async () => {
      if (isAuthenticated && currentProduct?._id) {
        const status = await checkWishlistStatus(currentProduct._id);
        setIsWishlisted(status);
      }
    };

    checkStatus();
  }, [isAuthenticated, currentProduct?._id, checkWishlistStatus]);

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to manage your wishlist");
      return;
    }

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
    const shareUrl = `${window.location.origin}/shop/${currentProduct._id}`;
    const shareTitle = currentProduct.name;
    const shareText = `Check out ${currentProduct.name} on Paanshala`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Product link copied to clipboard");
      }
    } catch (error) {
      console.error("Share failed", error);
      toast.error("Unable to share product");
    }
  };

  if (loading) {
    return <ProductDetailSkeleton />;
  }

  if (error || !currentProduct) {
    return <ProductNotFound />;
  }

  const isPaan = currentProduct.category === "Paan";
  const hasVariants = currentProduct.variants?.length > 0;

  // Calculate price
  const price =
    isPaan && selectedVariant
      ? selectedVariant.discountedPrice
      : currentProduct.discountedPrice;

  const originalPrice =
    isPaan && selectedVariant
      ? selectedVariant.originalPrice
      : currentProduct.originalPrice;

  const discount =
    originalPrice && price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : 0;

  const isOutOfStock = isPaan
    ? selectedVariant?.stock === 0
    : currentProduct.stock === 0;

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    setIsAdding(true);
    const success = await addToCart({
      productId: currentProduct._id,
      quantity,
      variantSetSize: selectedVariant?.setSize,
    });
    setIsAdding(false);

    if (success) {
      setQuantity(1);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (reviewRating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setIsSubmittingReview(true);
    const success = await submitReview({
      productId: currentProduct._id,
      rating: reviewRating,
      review: reviewText,
    });
    setIsSubmittingReview(false);

    if (success) {
      // Form will be updated automatically from myReview state
    }
  };

  // Parse additional info
  const parseAdditionalInfo = (infoString) => {
    if (!infoString) return [];

    return infoString
      .split("\n")
      .filter((line) => line.trim() && line.includes(":"))
      .map((line) => {
        const [key, ...valueParts] = line.split(":");
        return {
          key: key.trim(),
          value: valueParts.join(":").trim(),
        };
      });
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-white to-gray-50">
      {/* Breadcrumb */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-[#d4af37] transition-colors">
              Home
            </Link>
            <ChevronRight className="w-4 h-4" />
            <Link
              href="/shop"
              className="hover:text-[#d4af37] transition-colors"
            >
              Shop
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium line-clamp-1">
              {currentProduct.name}
            </span>
          </div>
        </div>
      </section>

      {/* Product Details */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left: Images */}
          <div className="space-y-4">
            {/* Main Image */}
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

              {/* Discount Badge */}
              {discount > 0 && (
                <div className="absolute top-4 left-4">
                  <span className="bg-red-500 text-white text-sm font-bold px-4 py-2 rounded-md shadow-lg">
                    {discount}% OFF
                  </span>
                </div>
              )}

              {/* Out of Stock Overlay */}
              {isOutOfStock && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                  <span className="bg-white text-gray-900 px-6 py-3 rounded-full font-bold text-lg">
                    Out of Stock
                  </span>
                </div>
              )}
            </motion.div>

            {/* Thumbnail Gallery */}
            {currentProduct.images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {currentProduct.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={cn(
                      "relative aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 transition-all",
                      selectedImage === index
                        ? "border-[#d4af37] ring-2 ring-[#d4af37]/30"
                        : "border-gray-200 hover:border-[#d4af37]/50",
                    )}
                  >
                    <Image
                      src={image}
                      alt={`${currentProduct.name} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Info */}
          <div className="space-y-6">
            {/* Category */}
            <div>
              <span className="inline-block text-sm font-medium text-[#d4af37] bg-[#d4af37]/10 px-3 py-1 rounded-full">
                {currentProduct.subcategory || currentProduct.category}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              {currentProduct.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "w-5 h-5",
                      i < Math.floor(currentProduct.averageRating || 0)
                        ? "fill-[#d4af37] text-[#d4af37]"
                        : "text-gray-300",
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
              <div className="flex items-baseline gap-3">
                {discount > 0 && (
                  <span className="text-2xl text-gray-400 line-through">
                    ₹{originalPrice}.00
                  </span>
                )}
                <span className="text-4xl font-bold text-[#d4af37]">
                  ₹{price}.00
                </span>
                {isPaan && selectedVariant && (
                  <span className="text-lg text-gray-600">
                    / {selectedVariant.setSize} pcs
                  </span>
                )}
              </div>
              {discount > 0 && (
                <p className="text-sm text-green-600 mt-2 font-medium">
                  You save ₹{originalPrice - price}.00 ({discount}% off)
                </p>
              )}
            </div>

            {/* Variant Selection (for Paan) */}
            {isPaan && hasVariants && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Select Size:
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {currentProduct.variants.map((variant) => (
                    <button
                      key={variant.setSize}
                      onClick={() => setSelectedVariant(variant)}
                      disabled={variant.stock === 0}
                      className={cn(
                        "p-4 rounded-xl border-2 transition-all text-left",
                        selectedVariant?.setSize === variant.setSize
                          ? "border-[#d4af37] bg-[#d4af37]/10"
                          : "border-gray-200 hover:border-[#d4af37]/50",
                        variant.stock === 0 && "opacity-50 cursor-not-allowed",
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {variant.setSize} Pieces
                          </p>
                          <p className="text-sm text-gray-600">
                            ₹{variant.discountedPrice}.00
                          </p>
                        </div>
                        {selectedVariant?.setSize === variant.setSize && (
                          <Check className="w-5 h-5 text-[#d4af37]" />
                        )}
                      </div>
                      {variant.stock === 0 && (
                        <p className="text-xs text-red-500 mt-2">
                          Out of stock
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Quantity:
              </h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
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
            </div>

            {/* Add to Cart Button */}
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock || isAdding}
                className={cn(
                  "flex-1 py-4 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-3",
                  isOutOfStock
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-linear-to-r from-[#2d5016] to-[#3d6820] text-white hover:shadow-xl hover:scale-105",
                )}
              >
                {isAdding ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-6 h-6" />
                    {isAuthenticated ? "Add to Cart" : "Login to Purchase"}
                  </>
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
                  wishlistLoading && "opacity-60 cursor-not-allowed",
                )}
              >
                <Heart
                  className={cn(
                    "w-6 h-6 transition-colors",
                    isWishlisted
                      ? "fill-[#d4af37] text-[#d4af37]"
                      : "text-gray-600",
                  )}
                />
              </button>

              <button
                onClick={handleShare}
                className="p-4 border-2 border-gray-200 rounded-xl hover:border-[#d4af37] hover:bg-[#d4af37]/10 transition-all"
              >
                <Share2 className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4 pt-6 border-t">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Premium Quality
                  </p>
                  <p className="text-xs text-gray-600">Authentic ingredients</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Truck className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Fast Delivery
                  </p>
                  <p className="text-xs text-gray-600">Within 2-3 days</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    100% Hygienic
                  </p>
                  <p className="text-xs text-gray-600">Safe preparation</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Award className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Certified
                  </p>
                  <p className="text-xs text-gray-600">Quality assured</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Information Tabs */}
        <div className="mt-12">
          <div className="border-b border-gray-200">
            <div className="flex gap-8">
              <button
                onClick={() => setActiveTab("description")}
                className={cn(
                  "pb-4 font-semibold transition-colors relative",
                  activeTab === "description"
                    ? "text-[#d4af37]"
                    : "text-gray-600 hover:text-gray-900",
                )}
              >
                Description
                {activeTab === "description" && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#d4af37]"
                  />
                )}
              </button>

              <button
                onClick={() => setActiveTab("info")}
                className={cn(
                  "pb-4 font-semibold transition-colors relative",
                  activeTab === "info"
                    ? "text-[#d4af37]"
                    : "text-gray-600 hover:text-gray-900",
                )}
              >
                Additional Information
                {activeTab === "info" && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#d4af37]"
                  />
                )}
              </button>

              <button
                onClick={() => setActiveTab("reviews")}
                className={cn(
                  "pb-4 font-semibold transition-colors relative flex items-center gap-2",
                  activeTab === "reviews"
                    ? "text-[#d4af37]"
                    : "text-gray-600 hover:text-gray-900",
                )}
              >
                Reviews ({reviews.length})
                {activeTab === "reviews" && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#d4af37]"
                  />
                )}
              </button>
            </div>
          </div>

          <div className="py-8">
            {activeTab === "description" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="prose prose-gray max-w-none"
              >
                <p className="text-gray-700 leading-relaxed text-lg">
                  {currentProduct.description}
                </p>
              </motion.div>
            )}

            {activeTab === "info" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {currentProduct.additionalInfo ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {parseAdditionalInfo(currentProduct.additionalInfo).map(
                      (item, index) => (
                        <div
                          key={index}
                          className="flex justify-between py-3 border-b"
                        >
                          <span className="font-semibold text-gray-900">
                            {item.key}:
                          </span>
                          <span className="text-gray-700 text-right">
                            {item.value}
                          </span>
                        </div>
                      ),
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex justify-between py-3 border-b">
                        <span className="font-semibold text-gray-900">
                          Category:
                        </span>
                        <span className="text-gray-700">
                          {currentProduct.category}
                        </span>
                      </div>
                      {currentProduct.subcategory && (
                        <div className="flex justify-between py-3 border-b">
                          <span className="font-semibold text-gray-900">
                            Subcategory:
                          </span>
                          <span className="text-gray-700">
                            {currentProduct.subcategory}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between py-3 border-b">
                        <span className="font-semibold text-gray-900">
                          Availability:
                        </span>
                        <span
                          className={cn(
                            "font-medium",
                            isOutOfStock ? "text-red-600" : "text-green-600",
                          )}
                        >
                          {isOutOfStock ? "Out of Stock" : "In Stock"}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between py-3 border-b">
                        <span className="font-semibold text-gray-900">
                          Product ID:
                        </span>
                        <span className="text-gray-700 font-mono text-sm">
                          {currentProduct._id.slice(-8).toUpperCase()}
                        </span>
                      </div>
                      {isPaan && hasVariants && (
                        <div className="flex justify-between py-3 border-b">
                          <span className="font-semibold text-gray-900">
                            Variants:
                          </span>
                          <span className="text-gray-700">
                            {currentProduct.variants.length} options
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between py-3 border-b">
                        <span className="font-semibold text-gray-900">
                          Rating:
                        </span>
                        <span className="text-gray-700">
                          {currentProduct.averageRating > 0
                            ? `${currentProduct.averageRating.toFixed(1)} / 5.0`
                            : "Not rated yet"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "reviews" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                {/* Review Summary */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div className="text-center md:text-left">
                      <div className="flex items-baseline gap-2 justify-center md:justify-start mb-2">
                        <span className="text-5xl font-bold text-gray-900">
                          {currentProduct.averageRating > 0
                            ? currentProduct.averageRating.toFixed(1)
                            : "0.0"}
                        </span>
                        <span className="text-gray-600">/ 5.0</span>
                      </div>
                      <div className="flex items-center gap-1 justify-center md:justify-start mb-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "w-5 h-5",
                              i < Math.floor(currentProduct.averageRating || 0)
                                ? "fill-[#d4af37] text-[#d4af37]"
                                : "text-gray-300",
                            )}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-gray-600">
                        Based on {currentProduct.totalReviews} review
                        {currentProduct.totalReviews !== 1 ? "s" : ""}
                      </p>
                    </div>

                    {isAuthenticated && (
                      <button
                        onClick={() => {
                          const form = document.getElementById("review-form");
                          form?.scrollIntoView({ behavior: "smooth" });
                        }}
                        className="bg-[#d4af37] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#c49d2f] transition-colors"
                      >
                        {myReview ? "Edit Your Review" : "Write a Review"}
                      </button>
                    )}
                  </div>
                </div>

                {/* Write Review Form (Authenticated Users) */}
                {isAuthenticated && (
                  <form
                    id="review-form"
                    onSubmit={handleSubmitReview}
                    className="bg-white border-2 border-gray-200 rounded-xl p-6"
                  >
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      {myReview ? "Edit Your Review" : "Write a Review"}
                    </h3>

                    {/* Star Rating */}
                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Your Rating *
                      </label>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewRating(star)}
                            className="focus:outline-none transition-transform hover:scale-110"
                          >
                            <Star
                              className={cn(
                                "w-8 h-8 cursor-pointer",
                                star <= reviewRating
                                  ? "fill-[#d4af37] text-[#d4af37]"
                                  : "text-gray-300 hover:text-[#d4af37]",
                              )}
                            />
                          </button>
                        ))}
                        {reviewRating > 0 && (
                          <span className="ml-2 text-sm font-medium text-gray-700">
                            {reviewRating}{" "}
                            {reviewRating === 1 ? "star" : "stars"}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Review Text */}
                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Your Review (Optional)
                      </label>
                      <textarea
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-transparent resize-none"
                        placeholder="Share your experience with this product..."
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmittingReview || reviewRating === 0}
                      className={cn(
                        "w-full md:w-auto px-8 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2",
                        isSubmittingReview || reviewRating === 0
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-linear-to-r from-[#2d5016] to-[#3d6820] text-white hover:shadow-lg",
                      )}
                    >
                      {isSubmittingReview ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <MessageSquare className="w-5 h-5" />
                          {myReview ? "Update Review" : "Submit Review"}
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* Login Prompt for Non-Authenticated Users */}
                {!isAuthenticated && (
                  <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-8 text-center">
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Want to share your experience?
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Login to write a review for this product
                    </p>
                    <Link
                      href="/login"
                      className="inline-flex items-center gap-2 bg-[#d4af37] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#c49d2f] transition-colors"
                    >
                      Login to Review
                    </Link>
                  </div>
                )}

                {/* Reviews List */}
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-gray-900">
                    Customer Reviews ({reviews.length})
                  </h3>

                  {reviewLoading ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-[#d4af37]" />
                    </div>
                  ) : reviews.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-xl">
                      <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">
                        No reviews yet. Be the first to review this product!
                      </p>
                    </div>
                  ) : (
                    reviews.map((review) => (
                      <div
                        key={review._id}
                        className="bg-white border border-gray-200 rounded-xl p-6"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-[#d4af37]/10 rounded-full flex items-center justify-center">
                              <User className="w-6 h-6 text-[#d4af37]" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">
                                {review.user?.full_name || "Anonymous"}
                              </p>
                              <p className="text-sm text-gray-600">
                                {new Date(review.createdAt).toLocaleDateString(
                                  "en-US",
                                  {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  },
                                )}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 mb-3">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={cn(
                                "w-4 h-4",
                                i < review.rating
                                  ? "fill-[#d4af37] text-[#d4af37]"
                                  : "text-gray-300",
                              )}
                            />
                          ))}
                          <span className="ml-2 text-sm font-medium text-gray-700">
                            {review.rating}.0
                          </span>
                        </div>

                        {review.review && (
                          <p className="text-gray-700 leading-relaxed">
                            {review.review}
                          </p>
                        )}
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

/* =========================
   LOADING SKELETON
========================= */
function ProductDetailSkeleton() {
  return (
    <div className="min-h-screen bg-linear-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 animate-pulse">
          {/* Left */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-200 rounded-2xl" />
            <div className="grid grid-cols-4 gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-square bg-gray-200 rounded-lg" />
              ))}
            </div>
          </div>

          {/* Right */}
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

/* =========================
   PRODUCT NOT FOUND
========================= */
function ProductNotFound() {
  return (
    <div className="min-h-screen bg-linear-to-b from-white to-gray-50 flex items-center justify-center">
      <div className="text-center px-4">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mb-6">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Product Not Found
        </h1>

        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          The product you're looking for doesn't exist or has been removed.
        </p>

        <Link
          href="/shop"
          className="inline-flex items-center gap-2 bg-linear-to-r from-[#d4af37] to-[#f4d03f] text-[#0b1f11] px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-all duration-300 shadow-lg"
        >
          Back to Shop
        </Link>
      </div>
    </div>
  );
}
