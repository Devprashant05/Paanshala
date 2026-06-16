"use client";

import { usePathname } from "next/navigation";

import { useCartUIStore } from "@/stores/useCartUIStore";
import { useCartStore } from "@/stores/useCartStore";
import { useGuestCartStore } from "@/stores/useGuestCartStore";
import { useCouponStore } from "@/stores/useCouponStore";
import { useUserStore } from "@/stores/useUserStore";
import { useProductStore } from "@/stores/useProductStore";
import { usePageSettingsStore } from "@/stores/usePageSettingsStore";
import { useScheduleStore } from "@/stores/useScheduleStore";

import {
  X,
  ShoppingCart,
  Tag,
  Loader2,
  CheckCircle,
  AlertCircle,
  Trash2,
  Minus,
  Plus,
  ShoppingBag,
  ArrowRight,
  Clock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCheckoutUIStore } from "@/stores/useCheckoutUIStore";
import { useGuestCheckoutUIStore } from "@/stores/useGuestCheckoutUIStore";
import { useCategoryStore } from "@/stores/useCategoryStore";

export default function CartDrawer() {
  const pathname = usePathname();
  const { isOpen, closeCart } = useCartUIStore();
  const { isAuthenticated } = useUserStore();

  const { cart, updateCartItem, removeFromCart, fetchCart } = useCartStore();
  const { items: guestItems, updateItem, removeItem } = useGuestCartStore();
  const { relatedProducts, fetchRelatedProductById } = useProductStore();
  const { openCheckout } = useCheckoutUIStore();
  const { openGuestCheckout } = useGuestCheckoutUIStore();
  const { settings, fetchPageSettings } = usePageSettingsStore();

  const {
    coupon: appliedCoupon,
    validateCoupon,
    clearCoupon,
    loading: couponLoading,
  } = useCouponStore();

  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [removingCoupon, setRemovingCoupon] = useState(false);

  // Collapsible bottom panel state
  const [showRelated, setShowRelated] = useState(false);
  const [showCoupon, setShowCoupon] = useState(false);

  const { scheduledDate, scheduledTime, clearSchedule } = useScheduleStore();
  const { categories, fetchActiveCategories } = useCategoryStore();

  const items = isAuthenticated ? cart?.items || [] : guestItems;

  useEffect(() => {
    fetchPageSettings();
  }, []);
  useEffect(() => {
    if (!categories.length) fetchActiveCategories();
  }, []);

  useEffect(() => {
    if (!scheduledDate) return;
    if (pathname?.includes("create-your-paan")) return;
    if (items.length === 0) {
      clearSchedule();
      return;
    }

    const hasSchedulingItem = items.some((item) => {
      const product = item.product || {};
      const parentCatId = product.parentCategory?._id || product.parentCategory;
      const catId = product.category?._id || product.category;
      const allCats = categories.flatMap((c) => [c, ...(c.children || [])]);
      const matchedCat = allCats.find(
        (c) => c._id === parentCatId || c._id === catId,
      );
      return matchedCat?.requiresScheduling === true;
    });

    if (!hasSchedulingItem) clearSchedule();
  }, [items, categories, scheduledDate, pathname]);

  // Pricing
  let subtotal = isAuthenticated
    ? cart?.subtotal || 0
    : guestItems.reduce((s, i) => s + i.totalPrice, 0);

  let discount = 0;
  if (appliedCoupon) {
    discount =
      appliedCoupon.discountType === "percentage"
        ? Math.min(
            (subtotal * appliedCoupon.discountValue) / 100,
            appliedCoupon.maxDiscount || Infinity,
          )
        : appliedCoupon.discountValue;
    discount = Math.min(discount, subtotal);
  }

  const freeThreshold =
    settings?.shippingSettings?.freeShippingThreshold ?? 500;
  const standardCharges = settings?.shippingSettings?.standardCharges ?? 0;
  const shippingCharges = subtotal >= freeThreshold ? 0 : standardCharges;
  const total = Math.max(0, subtotal - discount + shippingCharges);

  const handleApplyCoupon = async () => {
    const code = couponCode.trim();
    if (!code) return;
    setCouponError("");
    const result = await validateCoupon({ code, cartTotal: subtotal });
    if (result?.error) {
      setCouponError(result.error);
    } else {
      setCouponCode("");
      if (isAuthenticated) fetchCart();
    }
  };

  const handleRemoveCoupon = async () => {
    setRemovingCoupon(true);
    setCouponError("");
    clearCoupon();
    if (isAuthenticated) await fetchCart();
    setRemovingCoupon(false);
  };

  useEffect(() => {
    if (!isOpen || items.length === 0) return;
    const firstProductId = items[0]?.product?._id || items[0]?.productId;
    if (firstProductId) fetchRelatedProductById(firstProductId);
  }, [isOpen, items[0]?.productId]);

  const formatTime12hr = (time24) => {
    if (!time24) return "";
    const [h, m] = time24.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return `${displayH}:${String(m).padStart(2, "0")} ${period}`;
  };

  const freeShippingProgress = Math.min((subtotal / freeThreshold) * 100, 100);
  const amountToFreeShipping = Math.max(0, freeThreshold - subtotal);

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 z-50 transition-opacity duration-300",
          isOpen ? "opacity-100 visible" : "opacity-0 invisible",
        )}
        onClick={closeCart}
      />

      {/* Drawer */}
      <div
        className={cn(
          "fixed right-0 top-0 h-full w-full sm:w-120 bg-white z-50 shadow-2xl transition-transform duration-300 flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        {/* ── HEADER (fixed) ── */}
        <div className="shrink-0 p-4 border-b bg-linear-to-r from-[#264B0E]/5 to-[#264B0E]/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#264B0E]/10 flex items-center justify-center">
                <ShoppingCart className="w-4 h-4 text-[#264B0E]" />
              </div>
              <div>
                <h2 className="font-bold text-lg text-gray-900 leading-tight">
                  Your Cart
                </h2>
                <p className="text-xs text-gray-500">
                  {items.length} {items.length === 1 ? "item" : "items"}
                  {subtotal > 0 && (
                    <span className="ml-1 text-[#264B0E] font-semibold">
                      · ₹{subtotal.toFixed(0)}
                    </span>
                  )}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={closeCart}
              className="h-9 w-9 text-black rounded-full hover:bg-gray-100"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Free shipping progress bar */}
          {items.length > 0 && (
            <div className="mt-3">
              {amountToFreeShipping > 0 ? (
                <p className="text-xs text-gray-600 mb-1.5">
                  Add{" "}
                  <span className="font-bold text-[#264B0E]">
                    ₹{amountToFreeShipping.toFixed(0)}
                  </span>{" "}
                  more for{" "}
                  <span className="font-bold text-green-600">
                    FREE delivery
                  </span>
                </p>
              ) : (
                <p className="text-xs font-semibold text-green-600 mb-1.5">
                  🎉 You've unlocked free delivery!
                </p>
              )}
              <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-[#264B0E] to-green-500 rounded-full transition-all duration-500"
                  style={{ width: `${freeShippingProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Guest sign-in nudge */}
          {!isAuthenticated && items.length > 0 && (
            <div className="mt-3 bg-[#264B0E]/10 border border-[#264B0E]/20 rounded-lg px-3 py-2 flex items-center justify-between gap-2">
              <p className="text-xs text-gray-700">
                <Link
                  href="/login"
                  onClick={closeCart}
                  className="text-[#264B0E] font-semibold underline"
                >
                  Sign in
                </Link>{" "}
                to save your cart
              </p>
              <Link href="/login" onClick={closeCart}>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-[#264B0E] text-[#264B0E] hover:bg-[#264B0E] hover:text-white h-7 text-xs"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* ── CART ITEMS (scrollable, takes all available space) ── */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-4 text-center">
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <ShoppingBag className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="font-semibold text-lg text-gray-900 mb-2">
                Your cart is empty
              </h3>
              <p className="text-sm text-gray-500 mb-6 max-w-xs">
                Add items to your cart to get started with your order
              </p>
              <Link href="/shop" onClick={closeCart}>
                <Button className="bg-linear-to-r text-white from-[#264B0E] to-green-600 hover:opacity-90">
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Start Shopping
                </Button>
              </Link>
            </div>
          ) : (
            <div className="p-3 space-y-2.5">
              <AnimatePresence mode="popLayout">
                {items.map((item, index) => (
                  <DrawerCartItem
                    key={
                      item._key ||
                      `${item.productId}-${item.variantSetSize ?? "default"}`
                    }
                    item={item}
                    index={index}
                    isAuthenticated={isAuthenticated}
                    update={isAuthenticated ? updateCartItem : updateItem}
                    remove={isAuthenticated ? removeFromCart : removeItem}
                    onClose={closeCart}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* ── BOTTOM PANEL (fixed height, its own scroll) ── */}
        {items.length > 0 && (
          <div className="shrink-0 border-t bg-white flex flex-col max-h-[55vh] overflow-y-auto">
            {/* Coupon — collapsible */}
            {isAuthenticated && (
              <div className="border-b">
                <button
                  type="button"
                  onClick={() => setShowCoupon((p) => !p)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-amber-500" />
                    <span className="text-sm font-semibold text-gray-800">
                      {appliedCoupon ? (
                        <span className="text-green-700">
                          ✓ Coupon applied: {appliedCoupon.code}
                        </span>
                      ) : (
                        "Have a coupon?"
                      )}
                    </span>
                  </div>
                  {showCoupon ? (
                    <ChevronUp className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  )}
                </button>

                <AnimatePresence>
                  {showCoupon && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-3">
                        {appliedCoupon ? (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                                <div className="min-w-0">
                                  <p className="font-bold text-green-900 tracking-wider text-sm truncate">
                                    {appliedCoupon.code}
                                  </p>
                                  <p className="text-xs text-green-700">
                                    {appliedCoupon.discountType === "percentage"
                                      ? `${appliedCoupon.discountValue}% off`
                                      : `₹${appliedCoupon.discountValue} flat off`}
                                  </p>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleRemoveCoupon}
                                disabled={removingCoupon}
                                className="text-red-500 hover:text-red-600 hover:bg-red-50 h-7 w-7 p-0 shrink-0"
                              >
                                {removingCoupon ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <X className="w-3 h-3" />
                                )}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="flex gap-2">
                              <Input
                                type="text"
                                placeholder="Enter code"
                                value={couponCode}
                                onChange={(e) => {
                                  setCouponCode(e.target.value.toUpperCase());
                                  if (couponError) setCouponError("");
                                }}
                                onKeyDown={(e) =>
                                  e.key === "Enter" && handleApplyCoupon()
                                }
                                className={cn(
                                  "flex-1 font-mono tracking-widest text-sm h-9",
                                  couponError &&
                                    "border-red-400 focus-visible:ring-red-300",
                                )}
                                disabled={couponLoading}
                              />
                              <Button
                                onClick={handleApplyCoupon}
                                disabled={couponLoading || !couponCode.trim()}
                                className="bg-amber-400 hover:bg-amber-500 text-[#1a1a1a] font-semibold h-9 px-4"
                              >
                                {couponLoading ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  "Apply"
                                )}
                              </Button>
                            </div>
                            {couponError && (
                              <motion.div
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-2 py-1.5"
                              >
                                <AlertCircle className="w-3 h-3 text-red-500 shrink-0 mt-0.5" />
                                <p className="text-xs text-red-700 leading-snug">
                                  {couponError}
                                </p>
                              </motion.div>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Related Products — collapsible */}
            {relatedProducts.length > 0 && (
              <div className="border-b">
                <button
                  type="button"
                  onClick={() => setShowRelated((p) => !p)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <span className="text-sm font-semibold text-gray-800">
                    You may also like
                  </span>
                  {showRelated ? (
                    <ChevronUp className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  )}
                </button>

                <AnimatePresence>
                  {showRelated && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-3">
                        <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1">
                          {relatedProducts.slice(0, 5).map((product) => (
                            <RelatedProductCard
                              key={product._id}
                              product={product}
                              onClose={closeCart}
                              isAuthenticated={isAuthenticated}
                            />
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Order Summary + Checkout (always visible) */}
            <div className="px-4 py-3 space-y-3 bg-white">
              {/* Summary rows */}
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({items.length} items)</span>
                  <span className="font-semibold text-gray-900">
                    ₹{subtotal.toFixed(2)}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Coupon ({appliedCoupon?.code})</span>
                    <span className="font-semibold">
                      -₹{discount.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  {shippingCharges === 0 ? (
                    <span className="font-semibold text-green-600">FREE</span>
                  ) : (
                    <span className="font-semibold text-gray-600">
                      ₹{shippingCharges.toFixed(2)}
                    </span>
                  )}
                </div>
                <div className="border-t pt-2 flex justify-between">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="font-bold text-lg text-[#264B0E]">
                    ₹{total.toFixed(2)}
                  </span>
                </div>
              </div>
bg-linear-to-r
              {/* Savings badge */}
              {discount > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-2 text-center">
                  <p className="text-xs font-semibold text-green-800">
                    🎉 You're saving ₹{discount.toFixed(2)}!
                  </p>
                </div>
              )}

              {/* Scheduled paan info */}
              {scheduledDate && scheduledTime && (
                <div className="flex items-center gap-2 bg-[#264B0E]/5 border border-[#264B0E]/20 rounded-lg px-3 py-2">
                  <Clock className="w-3.5 h-3.5 text-[#264B0E] shrink-0" />
                  <p className="text-xs text-[#264B0E] font-medium">
                    Paan scheduled for{" "}
                    <strong>
                      {new Date(scheduledDate).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </strong>{" "}
                    at <strong>{formatTime12hr(scheduledTime)}</strong>
                  </p>
                </div>
              )}

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-2">
                <Link href="/shop" onClick={closeCart} className="block">
                  <Button
                    variant="outline"
                    className="w-full h-11 font-semibold border-2 hover:bg-gray-50"
                  >
                    Shop More
                  </Button>
                </Link>
                <Button
                  onClick={() => {
                    closeCart();
                    isAuthenticated ? openCheckout() : openGuestCheckout();
                  }}
                  className="w-full h-11 bg-linear-to-r text-white from-[#264B0E] to-green-600 hover:opacity-90 font-semibold"
                >
                  Checkout
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

/* ═══════════════════
   DRAWER CART ITEM
═══════════════════ */
function DrawerCartItem({
  item,
  index,
  isAuthenticated,
  update,
  remove,
  onClose,
}) {
  const [isRemoving, setIsRemoving] = useState(false);

  const product = item.product || {};
  const productId = product._id || item.productId;
  const productName = product.name || item.name || "Product";
  const productImage =
    product.images?.[0] || item.image || "/placeholder-product.png";
  const price = item.price || 0;
  const quantity = item.quantity || 1;

  const handleRemove = () => {
    if (!isAuthenticated) {
      remove({ productId, variantSetSize: item.variantSetSize });
      return;
    }
    setIsRemoving(true);
    remove({ productId, variantSetSize: item.variantSetSize });
  };

  const handleUpdateQuantity = (newQuantity) => {
    if (newQuantity < 1) return;
    update({
      productId,
      quantity: newQuantity,
      variantSetSize: item.variantSetSize,
    });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ delay: index * 0.03 }}
      className={cn(
        "border border-gray-200 rounded-xl p-3 bg-white hover:shadow-sm transition-all",
        isRemoving && "opacity-50",
      )}
    >
      <div className="flex gap-3">
        {/* Product Image */}
        <Link
          href={`/shop/${product.slug}`}
          onClick={onClose}
          className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-gray-100 group"
        >
          <Image
            src={productImage}
            alt={productName}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-300"
          />
        </Link>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <Link
                href={`/shop/${product.slug}`}
                onClick={onClose}
                className="block"
              >
                <h3 className="font-semibold text-sm text-gray-900 hover:text-[#264B0E] transition-colors line-clamp-2 leading-tight">
                  {productName}
                </h3>
              </Link>
              {item.variantSetSize && (
                <Badge
                  variant="secondary"
                  className="mt-1 text-xs h-5 px-2 py-0"
                >
                  {item.variantSetSize} Pieces
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRemove}
              disabled={isRemoving}
              className="h-6 w-6 text-red-400 hover:text-red-600 hover:bg-red-50 shrink-0 -mt-0.5"
            >
              {isRemoving ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Trash2 className="w-3 h-3" />
              )}
            </Button>
          </div>

          {/* Price + quantity on same row */}
          <div className="flex items-center justify-between mt-2">
            <div>
              <p className="text-sm font-bold text-[#264B0E]">
                ₹{(price * quantity).toFixed(0)}
              </p>
              {quantity > 1 && (
                <p className="text-xs text-gray-400">
                  ₹{price.toFixed(0)} each
                </p>
              )}
            </div>

            {/* Quantity Controls */}
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white">
              <button
                onClick={() => handleUpdateQuantity(quantity - 1)}
                disabled={quantity <= 1}
                className="px-2 py-1 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="px-3 py-1 text-xs font-bold min-w-7 text-center border-x border-gray-200">
                {quantity}
              </span>
              <button
                onClick={() => handleUpdateQuantity(quantity + 1)}
                className="px-2 py-1 hover:bg-gray-100 transition-colors"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════
   RELATED PRODUCT CARD
═══════════════════════════ */
function RelatedProductCard({ product, onClose, isAuthenticated }) {
  const { addToCart } = useCartStore();
  const { addItem: addGuestItem } = useGuestCartStore();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const parentCatName =
    product.parentCategory?.name ||
    (typeof product.parentCategory === "string" ? "" : "");
  const categoryName =
    product.category?.name || (typeof product.category === "string" ? "" : "");

  const isTruffle =
    parentCatName.toLowerCase().includes("truffle") ||
    categoryName.toLowerCase().includes("truffle");

  const isPaan = product.isPaan && !isTruffle;
  const hasVariants = product.variants?.length > 0;

  const price = hasVariants
    ? product.variants[0]?.discountedPrice
    : product.discountedPrice;
  const isOutOfStock = hasVariants
    ? product.variants.every((v) => (v.stock ?? 0) === 0)
    : (product.stock ?? 0) === 0;

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    if (isOutOfStock || isPaan) return;
    setAdding(true);
    if (isAuthenticated) {
      await addToCart({ productId: product._id, quantity: 1 });
    } else {
      addGuestItem({
        productId: product._id,
        name: product.name,
        categoryId: product.category?._id || product.category || null,
        parentCategoryId:
          product.parentCategory?._id || product.parentCategory || null,
        image: product.images?.[0] || null,
        price,
        originalPrice: product.originalPrice,
        isPaan: false,
        variantSetSize: null,
        quantity: 1,
      });
    }
    setAdding(false);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="min-w-28 max-w-28 flex flex-col bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-[#264B0E]/40 hover:shadow-md transition-all group shrink-0">
      <Link
        href={`/shop/${product.slug}`}
        onClick={onClose}
        className="relative w-full h-20 bg-gray-50 overflow-hidden"
      >
        <Image
          src={product.images?.[0] || "/placeholder-product.png"}
          alt={product.name}
          fill
          className="object-contain group-hover:scale-105 transition-transform duration-300"
        />
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="text-[9px] font-bold text-gray-500">
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      <div className="p-2 flex flex-col flex-1">
        <Link href={`/shop/${product.slug}`} onClick={onClose}>
          <p className="text-[11px] font-semibold text-gray-800 line-clamp-2 leading-tight mb-1 hover:text-[#264B0E] transition-colors">
            {product.name}
          </p>
        </Link>
        <p className="text-xs font-bold text-[#264B0E] mb-2">₹{price || 0}</p>

        {isPaan ? (
          <Link
            href={`/shop/${product.slug}`}
            onClick={onClose}
            className="mt-auto w-full py-1.5 rounded-lg text-[10px] font-bold text-center border-2 border-[#264B0E] text-[#264B0E] hover:bg-[#264B0E] hover:text-white transition-all"
          >
            View
          </Link>
        ) : (
          <button
            onClick={handleQuickAdd}
            disabled={adding || isOutOfStock}
            className={cn(
              "mt-auto w-full py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1",
              added
                ? "bg-green-500 text-white"
                : isOutOfStock
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-[#264B0E] hover:bg-[#3d6820] text-white",
            )}
          >
            {adding ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : added ? (
              <>
                <CheckCircle className="w-3 h-3" /> Added
              </>
            ) : (
              <>
                <Plus className="w-3 h-3" /> Add
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}