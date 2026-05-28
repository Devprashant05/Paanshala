"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { useProductStore } from "@/stores/useProductStore";
import { useCartStore } from "@/stores/useCartStore";
import { useUserStore } from "@/stores/useUserStore";
import { useGuestCartStore } from "@/stores/useGuestCartStore";
import { useReviewStore } from "@/stores/useReviewStore";
import { useWishlistStore } from "@/stores/useWishlistStore";
import ProductImageViewer from "@/components/product/ProductImageViewer";

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
  ShoppingBag,
  Zap,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCartUIStore } from "@/stores/useCartUIStore";
import { useCheckoutUIStore } from "@/stores/useCheckoutUIStore";
import { useGuestCheckoutUIStore } from "@/stores/useGuestCheckoutUIStore";

/* ── helpers ── */
const resolveName = (f) => (f && typeof f === "object" ? f.name : f) || "";
const resolveSlug = (f) => (f && typeof f === "object" ? f.slug : null);

const PROMO_BANNERS = {
  paan: ["/paan-b1.webp", "/paan-b2.webp"],

  default: ["/mukh-b1.webp", "/mukh-b2.webp", "/mukh-b3.webp"],
};

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();

  const {
    currentProduct,
    loading,
    error,
    fetchProductById,
    relatedProducts,
    fetchRelatedProductById,
  } = useProductStore();
  const { addToCart, loading: cartLoading } = useCartStore();
  const { isAuthenticated } = useUserStore();
  const { addItem: addGuestItem } = useGuestCartStore();
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
  const { openCart } = useCartUIStore();
  const { openCheckout } = useCheckoutUIStore();
  const { openGuestCheckout } = useGuestCheckoutUIStore();

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [isAdding, setIsAdding] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [selectedWeightKey, setSelectedWeightKey] = useState("1x");
  const [currentBanner, setCurrentBanner] = useState(0);

  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  /* ── fetch on mount ── */
  useEffect(() => {
    if (!params.slug) return;

    fetchProductById(params.slug);
  }, [params.slug]);

  useEffect(() => {
    if (!currentProduct?._id) return;

    fetchProductReviews(currentProduct._id);
    fetchRelatedProductById(currentProduct._id);

    if (isAuthenticated) {
      fetchMyReview(currentProduct._id);
    }
  }, [currentProduct?._id, isAuthenticated]);

  /* ── pre-fill review form ── */
  useEffect(() => {
    if (myReview) {
      setReviewRating(myReview.rating);
      setReviewText(myReview.review || "");
    }
  }, [myReview]);

  /* ── init variant for products with variants ── */
  useEffect(() => {
    if (currentProduct?.variants?.length > 0) {
      setSelectedVariant(currentProduct.variants[0]);
    }
  }, [currentProduct]);

  /* ── wishlist status ── */
  useEffect(() => {
    if (isAuthenticated && currentProduct?._id) {
      checkWishlistStatus(currentProduct._id).then(setIsWishlisted);
    }
  }, [isAuthenticated, currentProduct?._id]);

  /* ── banner auto-advance ── */
  const promoBanners = currentProduct
    ? currentProduct.isPaan
      ? PROMO_BANNERS.paan
      : PROMO_BANNERS.default
    : [];

  useEffect(() => {
    if (!promoBanners?.length) return;
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % promoBanners.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [promoBanners.length]);

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
    const url = `${window.location.origin}/shop/${currentProduct.slug}`;
    const text = `Check out ${currentProduct.name} on Paanshala`;
    try {
      if (navigator.share) {
        await navigator.share({ title: currentProduct.name, text, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Product link copied to clipboard");
      }
    } catch {
      toast.error("Unable to share product");
    }
  };

  if (loading) return <ProductDetailSkeleton />;
  if (error || !currentProduct) return <ProductNotFound />;

  /* ── derived values (all using isPaan flag + populated objects) ── */
  const isPaan = currentProduct.isPaan;
  const hasVariants = currentProduct.variants?.length > 0;

  // Category display
  const categoryName = resolveName(currentProduct.category);
  const parentCatName = resolveName(currentProduct.parentCategory);
  const categorySlug = resolveSlug(currentProduct.category);
  const parentCatSlug = resolveSlug(currentProduct.parentCategory);

  // Badge label: show leaf if different from root, else root
  const badgeLabel =
    categoryName && categoryName !== parentCatName
      ? categoryName
      : parentCatName || categoryName;

  // Breadcrumb collection link
  const collectionHref = categorySlug
    ? `/collections/${categorySlug}`
    : parentCatSlug
      ? `/collections/${parentCatSlug}`
      : "/shop";

  // Pricing — selectedVariant works for both paan and non-paan variants
  const price =
    hasVariants && selectedVariant
      ? selectedVariant.discountedPrice
      : currentProduct.discountedPrice;

  const originalPrice =
    hasVariants && selectedVariant
      ? selectedVariant.originalPrice
      : currentProduct.originalPrice;

  const discount =
    originalPrice && price && originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : 0;

  // Stock — check selectedVariant stock when any variant product
  const isOutOfStock = hasVariants
    ? !selectedVariant || (selectedVariant.stock ?? 0) === 0
    : (currentProduct.stock ?? 0) === 0;

  /* ── Virtual weight options for non-paan products with baseWeight ── */
  // Generates: 1× (base), 2× (5% off), 3× (10% off) options on the fly
  const baseWeight =
    !isPaan && !hasVariants && currentProduct.baseWeight
      ? currentProduct.baseWeight
      : null;

  const weightOptions = baseWeight
    ? [
        {
          key: "1x",
          label: `${baseWeight} g`,
          multiplier: 1,
          price: currentProduct.discountedPrice,
          originalPrice: currentProduct.originalPrice,
          discount:
            currentProduct.originalPrice > currentProduct.discountedPrice
              ? Math.round(
                  ((currentProduct.originalPrice -
                    currentProduct.discountedPrice) /
                    currentProduct.originalPrice) *
                    100,
                )
              : 0,
        },
        {
          key: "2x",
          label: `2 × ${baseWeight} g`,
          multiplier: 2,
          price: Math.round(currentProduct.discountedPrice * 2 * 0.95), // 5% bundle discount
          originalPrice: currentProduct.originalPrice * 2,
          discount: Math.round(
            ((currentProduct.originalPrice * 2 -
              Math.round(currentProduct.discountedPrice * 2 * 0.95)) /
              (currentProduct.originalPrice * 2)) *
              100,
          ),
        },
        {
          key: "3x",
          label: `3 × ${baseWeight} g`,
          multiplier: 3,
          price: Math.round(currentProduct.discountedPrice * 3 * 0.9), // 10% bundle discount
          originalPrice: currentProduct.originalPrice * 3,
          discount: Math.round(
            ((currentProduct.originalPrice * 3 -
              Math.round(currentProduct.discountedPrice * 3 * 0.9)) /
              (currentProduct.originalPrice * 3)) *
              100,
          ),
        },
      ]
    : [];

  const selectedWeightOption =
    weightOptions.find((o) => o.key === selectedWeightKey) ?? weightOptions[0];

  // Override price/originalPrice/discount when weight options are active
  const effectivePrice = selectedWeightOption
    ? selectedWeightOption.price
    : price;
  const effectiveOriginal = selectedWeightOption
    ? selectedWeightOption.originalPrice
    : originalPrice;
  const effectiveDiscount = selectedWeightOption
    ? selectedWeightOption.discount
    : discount;
  const effectiveQty = selectedWeightOption
    ? selectedWeightOption.multiplier
    : quantity;

  const handleAddToCart = async () => {
    if (isOutOfStock) return;
    const qty = weightOptions.length > 0 ? effectiveQty : quantity;

    if (isAuthenticated) {
      setIsAdding(true);
      const success = await addToCart({
        productId: currentProduct._id,
        quantity: qty,
        variantSetSize:
          selectedVariant?.setSize ?? selectedVariant?.size ?? undefined,
        customPrice: effectivePrice,
      });
      setIsAdding(false);
      if (success) setQuantity(1);
      openCart();
    } else {
      addGuestItem({
        productId: currentProduct._id,
        name: currentProduct.name,
        image: currentProduct.images?.[0] || null,
        price: effectivePrice,
        originalPrice: effectiveOriginal,
        isPaan: currentProduct.isPaan,
        variantSetSize:
          selectedVariant?.setSize ?? selectedVariant?.size ?? null,
        quantity: qty,
      });
      toast.success(`${currentProduct.name} added to cart!`);
      setQuantity(1);
      openCart();
    }
  };

  const handleBuyNow = async () => {
    if (isOutOfStock) return;
    const qty = weightOptions.length > 0 ? effectiveQty : quantity;
    setIsBuyingNow(true);
    if (isAuthenticated) {
      await addToCart({
        productId: currentProduct._id,
        quantity: qty,
        variantSetSize:
          selectedVariant?.setSize ?? selectedVariant?.size ?? undefined,
        customPrice: effectivePrice,
      });
      openCheckout();
    } else {
      addGuestItem({
        productId: currentProduct._id,
        name: currentProduct.name,
        image: currentProduct.images?.[0] || null,
        price: effectivePrice,
        originalPrice: effectiveOriginal,
        isPaan: currentProduct.isPaan,
        variantSetSize:
          selectedVariant?.setSize ?? selectedVariant?.size ?? null,
        quantity: qty,
      });
      openGuestCheckout();
    }
    setIsBuyingNow(false);
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
    await submitReview({
      productId: currentProduct._id,
      rating: reviewRating,
      review: reviewText,
    });
    setIsSubmittingReview(false);
  };

  const parseAdditionalInfo = (str) => {
    if (!str) return [];
    return str
      .split("\n")
      .filter((l) => l.trim() && l.includes(":"))
      .map((l) => {
        const [key, ...rest] = l.split(":");
        return { key: key.trim(), value: rest.join(":").trim() };
      });
  };

  return (
    <div className="min-h-screen mt-1 sm:mt-2 bg-linear-to-b from-white to-gray-50">
      {/* ── Breadcrumb ── */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 flex-wrap">
            <Link href="/" className="hover:text-[#d4af37] transition-colors">
              Home
            </Link>
            <ChevronRight className="w-4 h-4 shrink-0" />
            {parentCatName && parentCatName !== categoryName && (
              <>
                <Link
                  href={`/collections/${parentCatSlug}`}
                  className="hover:text-[#d4af37] transition-colors"
                >
                  {parentCatName}
                </Link>
                <ChevronRight className="w-4 h-4 shrink-0" />
              </>
            )}
            {categoryName && (
              <>
                <Link
                  href={collectionHref}
                  className="hover:text-[#d4af37] transition-colors"
                >
                  {categoryName}
                </Link>
                <ChevronRight className="w-4 h-4 shrink-0" />
              </>
            )}
            <span className="text-gray-900 font-medium line-clamp-1">
              {currentProduct.name}
            </span>
          </div>
        </div>
      </section>

      {/* ── Product Details ── */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left: Images */}
          <ProductImageViewer
            images={currentProduct.images}
            productName={currentProduct.name}
            discount={discount}
            isOutOfStock={isOutOfStock}
          />

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
              <div className="flex items-baseline gap-3 flex-wrap">
                {effectiveDiscount > 0 && (
                  <span className="text-2xl text-gray-400 line-through">
                    ₹{effectiveOriginal}.00
                  </span>
                )}
                <span className="text-4xl font-bold text-[#d4af37]">
                  ₹{effectivePrice}.00
                </span>
                {isPaan && selectedVariant && (
                  <span className="text-lg text-gray-600">
                    / {selectedVariant.setSize} pcs
                  </span>
                )}
              </div>
              {effectiveDiscount > 0 && (
                <p className="text-sm text-green-600 mt-2 font-medium">
                  You save ₹{effectiveOriginal - effectivePrice}.00 (
                  {effectiveDiscount}% off)
                </p>
              )}
            </div>

            {/* ── Weight options (non-paan with baseWeight, no DB variants) ── */}
            {weightOptions.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-sm font-semibold text-gray-900">Size:</h3>
                  <span className="text-sm text-gray-500">
                    {selectedWeightOption?.label}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {weightOptions.map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => setSelectedWeightKey(opt.key)}
                      className={cn(
                        "relative px-5 py-2.5 rounded-lg border-2 text-sm font-semibold transition-all duration-200",
                        selectedWeightKey === opt.key
                          ? "border-gray-900 bg-white text-gray-900 shadow-sm"
                          : "border-gray-200 bg-white text-gray-600 hover:border-gray-400",
                      )}
                    >
                      {opt.label}
                      {opt.key !== "1x" && opt.discount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-green-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                          {opt.discount}% off
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── DB Variant selector (paan setSize or non-paan size/weight field) ── */}
            {hasVariants && (
              <div>
                {/* Label row: "Size: 150 g" style */}
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-sm font-semibold text-gray-900">
                    {isPaan ? "Select Size:" : "Size:"}
                  </h3>
                  {selectedVariant && (
                    <span className="text-sm text-gray-500">
                      {isPaan
                        ? `${selectedVariant.setSize} Pieces`
                        : selectedVariant.size ||
                          selectedVariant.weight ||
                          selectedVariant.setSize}
                    </span>
                  )}
                </div>

                {isPaan ? (
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
                          (v.stock ?? 0) === 0 &&
                            "opacity-50 cursor-not-allowed",
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-gray-900">
                              {v.setSize} Pieces
                            </p>
                            <p className="text-sm text-gray-600">
                              ₹{v.discountedPrice}.00
                            </p>
                          </div>
                          {selectedVariant?.setSize === v.setSize && (
                            <Check className="w-5 h-5 text-[#d4af37]" />
                          )}
                        </div>
                        {(v.stock ?? 0) === 0 && (
                          <p className="text-xs text-red-500 mt-2">
                            Out of stock
                          </p>
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {currentProduct.variants.map((v) => {
                      const label =
                        v.size ||
                        v.weight ||
                        (v.setSize ? `${v.setSize}` : null) ||
                        "Option";

                      const variantKey = v._id;
                      const selectedKey = selectedVariant?._id;

                      const isSelected = variantKey === selectedKey;

                      const outOfStock = (v.stock ?? 0) === 0;

                      return (
                        <button
                          key={variantKey}
                          onClick={() => setSelectedVariant(v)}
                          disabled={outOfStock}
                          className={cn(
                            "relative px-5 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all duration-200",
                            isSelected
                              ? "border-[#264B0E] bg-[#264B0E] text-white shadow-lg scale-[1.03]"
                              : "border-gray-200 bg-white text-gray-700 hover:border-[#264B0E]/40 hover:bg-[#264B0E]/5",
                            outOfStock &&
                              "opacity-40 cursor-not-allowed line-through",
                          )}
                        >
                          {isSelected && (
                            <Check className="absolute top-1.5 right-1.5 w-3.5 h-3.5" />
                          )}

                          {label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Quantity */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Quantity:
              </h3>
              <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden w-fit text-accent-foreground">
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
            <div className="space-y-3">
              {/* Row: Add to Cart + Wishlist + Share */}
              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || isAdding}
                  className={cn(
                    "flex-1 py-4 rounded-xl font-semibold text-base transition-all duration-300 flex items-center justify-center gap-2.5",
                    isOutOfStock
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-linear-to-r from-[#2d5016] to-[#3d6820] text-white hover:shadow-xl hover:scale-[1.02]",
                  )}
                >
                  {isAdding ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Adding…
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5" />
                      Add to Cart
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

              {/* Buy It Now — full width */}
              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock || isBuyingNow}
                className={cn(
                  "w-full py-4 rounded-xl font-semibold text-base transition-all duration-300 flex items-center justify-center gap-2.5 border-2",
                  isOutOfStock
                    ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "border-[#d4af37] bg-[#d4af37]/10 hover:bg-[#d4af37] text-[#2d5016] hover:text-black hover:shadow-lg hover:scale-[1.02]",
                )}
              >
                {isBuyingNow ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing…
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    Buy It Now
                  </>
                )}
              </button>
            </div>

            {/* Features grid */}
            <div className="grid grid-cols-2 gap-4 pt-6 border-t">
              {[
                {
                  icon: Package,
                  bg: "bg-green-100",
                  color: "text-green-600",
                  title: "Premium Quality",
                  sub: "Authentic ingredients",
                },
                {
                  icon: Truck,
                  bg: "bg-blue-100",
                  color: "text-blue-600",
                  title: "Fast Delivery",
                  sub: "Within 2-3 days",
                },
                {
                  icon: Shield,
                  bg: "bg-purple-100",
                  color: "text-purple-600",
                  title: "100% Hygienic",
                  sub: "Safe preparation",
                },
                {
                  icon: Award,
                  bg: "bg-amber-100",
                  color: "text-amber-600",
                  title: "Certified",
                  sub: "Quality assured",
                },
              ].map(({ icon: Icon, bg, color, title, sub }) => (
                <div key={title} className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-lg flex items-center justify-center",
                      bg,
                    )}
                  >
                    <Icon className={cn("w-6 h-6", color)} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {title}
                    </p>
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
                    activeTab === tab
                      ? "text-[#d4af37]"
                      : "text-gray-600 hover:text-gray-900",
                  )}
                >
                  {tab === "description" && "Description"}
                  {tab === "info" && "Additional Information"}
                  {tab === "reviews" && `Reviews (${reviews.length})`}
                  {activeTab === tab && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#d4af37]"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="py-8">
            {/* Description */}
            {activeTab === "description" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="prose prose-gray max-w-none"
              >
                <p className="text-gray-700 text-justify leading-relaxed text-lg">
                  {currentProduct.description}
                </p>
              </motion.div>
            )}

            {/* Additional Info */}
            {activeTab === "info" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {currentProduct.additionalInfo ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {parseAdditionalInfo(currentProduct.additionalInfo).map(
                      (item, i) => (
                        <div
                          key={i}
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
                      <InfoRow
                        label="Category"
                        value={
                          <Link
                            href={collectionHref}
                            className="text-[#d4af37] hover:underline"
                          >
                            {categoryName}
                          </Link>
                        }
                      />
                      {parentCatName && parentCatName !== categoryName && (
                        <InfoRow
                          label="Parent Category"
                          value={
                            <Link
                              href={`/collections/${parentCatSlug}`}
                              className="text-[#d4af37] hover:underline"
                            >
                              {parentCatName}
                            </Link>
                          }
                        />
                      )}
                      <InfoRow
                        label="Availability"
                        value={
                          <span
                            className={
                              isOutOfStock
                                ? "text-red-600 font-medium"
                                : "text-green-600 font-medium"
                            }
                          >
                            {isOutOfStock ? "Out of Stock" : "In Stock"}
                          </span>
                        }
                      />
                    </div>
                    <div className="space-y-4">
                      <InfoRow
                        label="Product ID"
                        value={
                          <span className="font-mono text-sm">
                            {currentProduct._id.slice(-8).toUpperCase()}
                          </span>
                        }
                      />
                      {hasVariants && (
                        <InfoRow
                          label="Variants"
                          value={`${currentProduct.variants.length} options`}
                        />
                      )}
                      <InfoRow
                        label="Rating"
                        value={
                          currentProduct.averageRating > 0
                            ? `${currentProduct.averageRating.toFixed(1)} / 5.0`
                            : "Not rated yet"
                        }
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Reviews */}
            {activeTab === "reviews" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                {/* Summary */}
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
                        onClick={() =>
                          document
                            .getElementById("review-form")
                            ?.scrollIntoView({ behavior: "smooth" })
                        }
                        className="bg-[#d4af37] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#c49d2f] transition-colors"
                      >
                        {myReview ? "Edit Your Review" : "Write a Review"}
                      </button>
                    )}
                  </div>
                </div>

                {/* Review form */}
                {isAuthenticated && (
                  <form
                    id="review-form"
                    onSubmit={handleSubmitReview}
                    className="bg-white border-2 border-gray-200 rounded-xl p-6"
                  >
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      {myReview ? "Edit Your Review" : "Write a Review"}
                    </h3>
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
                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Your Review (Optional)
                      </label>
                      <textarea
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 text-black focus:ring-[#d4af37] focus:border-transparent resize-none"
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
                          : "bg-linear-to-r from-[#2d5016] to-[#3d6820] text-white hover:shadow-lg",
                      )}
                    >
                      {isSubmittingReview ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Submitting…
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

                {/* Login prompt */}
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

                {/* Reviews list */}
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

      {/* ── Dynamic Promo Banner Slider ── */}
      <section className="relative w-full bg-black overflow-hidden">
        <div className="relative w-full overflow-hidden">
          <motion.div
            className="flex"
            animate={{
              x: `-${currentBanner * 100}%`,
            }}
            transition={{
              duration: 0.8,
              ease: "easeInOut",
            }}
          >
            {promoBanners.map((banner, i) => (
              <div
                key={i}
                className="min-w-full flex items-center justify-center bg-black"
              >
                <Image
                  src={banner}
                  alt={`Promo Banner ${i + 1}`}
                  width={1200}
                  height={500}
                  priority={false}
                  className="
              w-full
              h-auto
              object-contain
            "
                />
              </div>
            ))}
          </motion.div>

          {/* Overlay */}
          <div className="absolute inset-0 bg-black/5 z-10 pointer-events-none" />

          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
            {promoBanners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentBanner(i)}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  currentBanner === i
                    ? "w-8 bg-white"
                    : "w-2 bg-white/50 hover:bg-white/80",
                )}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── You May Also Like ── */}
      {relatedProducts.length > 0 && (
        <section className="bg-[#fafaf6] py-14 md:py-20">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="flex items-end justify-between mb-8 gap-4 flex-wrap"
            >
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#2d5016] mb-2">
                  Discover More
                </p>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                  You May Also Like
                </h2>
              </div>
              <Link
                href="/shop"
                className="flex items-center gap-1.5 text-sm font-semibold text-[#2d5016] hover:text-[#3d6820] transition-colors"
              >
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6">
              {relatedProducts.slice(0, 4).map((product, i) => (
                <RelatedProductCard
                  key={product._id}
                  product={product}
                  index={i}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

/* ── Related Product Card ── */
function RelatedProductCard({ product, index }) {
  const { addToCart } = useCartStore();
  const { isAuthenticated } = useUserStore();
  const { addItem: addGuestItem } = useGuestCartStore();
  const [isAdding, setIsAdding] = useState(false);

  const images = product.images || [];
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

  const handleAdd = async (e) => {
    e.preventDefault();
    if (isOutOfStock) return;
    if (isPaan) {
      window.location.href = `/shop/${product.slug}`;
      return;
    }
    if (isAuthenticated) {
      setIsAdding(true);
      await addToCart({ productId: product._id, quantity: 1 });
      setIsAdding(false);
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      viewport={{ once: true }}
      className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-400 flex flex-col"
    >
      <Link
        href={`/shop/${product.slug}`}
        className="relative block overflow-hidden bg-gray-50 shrink-0"
        style={{ paddingBottom: "100%" }}
      >
        <Image
          src={images[0] || "/placeholder-product.png"}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {discount > 0 && (
          <span className="absolute top-2.5 left-2.5 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md z-10">
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

      <div className="flex flex-col flex-1 p-3.5">
        <Link href={`/shop/${product.slug}`}>
          <h4 className="font-bold text-[13px] text-gray-900 line-clamp-2 leading-snug mb-1.5 hover:text-[#2d5016] transition-colors">
            {product.name}
          </h4>
        </Link>

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

        <div className="flex items-baseline gap-1.5 mb-3">
          <span className="text-sm font-extrabold text-[#2d5016]">
            ₹{displayPrice}
          </span>
          {originalPrice > displayPrice && (
            <span className="text-xs text-gray-400 line-through">
              ₹{originalPrice}
            </span>
          )}
        </div>

        <button
          onClick={handleAdd}
          disabled={isOutOfStock || isAdding}
          className={cn(
            "w-full py-2 rounded-xl font-bold text-xs transition-all duration-300 flex items-center justify-center gap-1.5",
            isOutOfStock
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-linear-to-r from-[#2d5016] to-[#3d6820] hover:opacity-90 text-white shadow-sm",
          )}
        >
          {isAdding ? (
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
              <ShoppingBag className="w-3.5 h-3.5" />
              Add to Cart
            </>
          )}
        </button>
      </div>
    </motion.div>
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
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Product Not Found
        </h1>
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
