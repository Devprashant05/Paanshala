"use client";

import { useCartUIStore } from "@/stores/useCartUIStore";
import { useCartStore } from "@/stores/useCartStore";
import { useGuestCartStore } from "@/stores/useGuestCartStore";
import { useCouponStore } from "@/stores/useCouponStore";
import { useUserStore } from "@/stores/useUserStore";
import { useProductStore } from "@/stores/useProductStore";

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

export default function CartDrawer() {
  const { isOpen, closeCart } = useCartUIStore();
  const { isAuthenticated } = useUserStore();

  const { cart, updateCartItem, removeFromCart, fetchCart } = useCartStore();
  const { items: guestItems, updateItem, removeItem } = useGuestCartStore();
  const { relatedProducts, fetchRelatedProductById } = useProductStore();
 const { openCheckout } = useCheckoutUIStore();
 const { openGuestCheckout } = useGuestCheckoutUIStore();

  const {
    coupon: appliedCoupon,
    validateCoupon,
    clearCoupon,
    loading: couponLoading,
  } = useCouponStore();

  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [removingCoupon, setRemovingCoupon] = useState(false);

  const items = isAuthenticated ? cart?.items || [] : guestItems;

  // Calculate subtotal
  let subtotal = isAuthenticated
    ? cart?.subtotal || 0
    : guestItems.reduce((s, i) => s + i.totalPrice, 0);

  // Calculate discount
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

  const total = Math.max(0, subtotal - discount);

  const handleApplyCoupon = async () => {
    const code = couponCode.trim();
    if (!code) return;
    setCouponError("");

    const result = await validateCoupon({
      code,
      cartTotal: subtotal,
    });

    if (result?.error) {
      setCouponError(result.error);
    } else {
      setCouponCode("");
      if (isAuthenticated) {
        fetchCart();
      }
    }
  };

  const handleRemoveCoupon = async () => {
    setRemovingCoupon(true);
    setCouponError("");
    clearCoupon();
    if (isAuthenticated) {
      await fetchCart();
    }
    setRemovingCoupon(false);
  };

  // Fetch related products
  useEffect(() => {
    if (items.length > 0) {
      const firstProductId = items[0]?.product?._id || items[0]?.productId;
      if (firstProductId) {
        fetchRelatedProductById(firstProductId);
      }
    }
  }, [items, fetchRelatedProductById]);

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
        {/* Header */}
        <div className="p-5 border-b bg-linear-to-r from-[#264B0E]/5 to-brand-green-light/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#264B0E]/10 flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-[#264B0E]" />
              </div>
              <div>
                <h2 className="font-bold text-xl text-gray-900">Your Cart</h2>
                <p className="text-sm text-gray-500">
                  {items.length} {items.length === 1 ? "item" : "items"}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={closeCart}
              className="h-10 w-10 text-black rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Guest sign-in nudge */}
          {!isAuthenticated && items.length > 0 && (
            <div className="mt-4 bg-[#264B0E]/10 border border-[#264B0E]/20 rounded-lg px-3 py-2 flex items-center justify-between gap-2">
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
                  className="border-[#264B0E] text-white hover:bg-[#264B0E] hover:text-white h-7 text-xs"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto">
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
                <Button className="bg-linear-to-r text-white from-[#264B0E] to-brand-green-light hover:opacity-90">
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Start Shopping
                </Button>
              </Link>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              <AnimatePresence mode="popLayout">
                {items.map((item, index) => (
                  <DrawerCartItem
                    key={`${item.product?.slug}`}
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

        {/* Coupon Section - Only show if cart has items and user is authenticated */}
        {items.length > 0 && isAuthenticated && (
          <div className="border-t px-4 py-4 bg-gray-50">
            <div className="flex items-center gap-2 mb-3">
              <Tag className="w-4 h-4 text-gold-bright" />
              <p className="text-sm font-semibold text-gray-900">
                Have a coupon?
              </p>
            </div>

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
                          ? `${appliedCoupon.discountValue}% off applied`
                          : `₹${appliedCoupon.discountValue} flat off applied`}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveCoupon}
                    disabled={removingCoupon}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 shrink-0 h-7 w-7 p-0"
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
                    onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                    className={cn(
                      "flex-1 font-mono tracking-widest text-sm h-9 text-accent-foreground",
                      couponError &&
                        "border-red-400 focus-visible:ring-red-300",
                    )}
                    disabled={couponLoading}
                  />
                  <Button
                    onClick={handleApplyCoupon}
                    disabled={couponLoading || !couponCode.trim()}
                    className="bg-gold-bright hover:bg-[#d4a574] text-[#1a1a1a] font-semibold shrink-0 h-9 px-4"
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
        )}

        {/* Related Products */}
        {items.length > 0 && relatedProducts.length > 0 && (
          <div className="border-t px-4 py-4 bg-gray-50">
            <p className="text-sm font-semibold mb-3 text-gray-900">
              You may also like
            </p>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
              {relatedProducts.slice(0, 5).map((product) => (
                <Link
                  key={product._id}
                  href={`/shop/${product.slug}`}
                  onClick={closeCart}
                  className="min-w-35 border border-gray-200 rounded-lg p-2.5 hover:border-[#264B0E] hover:shadow-md transition-all bg-white group"
                >
                  <div className="relative w-full h-24 mb-2 rounded-md overflow-hidden bg-gray-100">
                    <Image
                      src={product.images?.[0] || "/placeholder-product.png"}
                      alt={product.name}
                      fill
                      className="object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <p className="text-xs text-gray-900 line-clamp-2 leading-tight mb-1.5">
                    {product.name}
                  </p>
                  <p className="text-sm font-bold text-[#264B0E]">
                    ₹{product.discountedPrice || product.price}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Footer - Summary & Checkout */}
        {items.length > 0 && (
          <div className="border-t bg-white px-4 py-4 space-y-3 shadow-lg">
            {/* Summary */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Coupon ({appliedCoupon?.code})</span>
                  <span className="font-semibold">-₹{discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-green-600">
                <span>Shipping</span>
                <span className="font-semibold">FREE</span>
              </div>
              <div className="border-t pt-2 flex justify-between text-gray-900">
                <span className="font-bold text-base">Total</span>
                <span className="font-bold text-lg">₹{total.toFixed(2)}</span>
              </div>
            </div>

            {/* Savings Badge */}
            {discount > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-2 text-center">
                <p className="text-xs font-semibold text-green-800">
                  🎉 You're saving ₹{discount.toFixed(2)}!
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <Link href="/shop" onClick={closeCart}>
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
                className="w-full h-11 bg-linear-to-r text-white from-[#264B0E] to-brand-green-light hover:opacity-90 font-semibold"
              >
                Checkout
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
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

  const handleRemove = async () => {
    setIsRemoving(true);
    await remove({
      productId,
      variantSetSize: item.variantSetSize,
    });
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
        "border border-gray-200 rounded-xl p-3 bg-white hover:shadow-md transition-all",
        isRemoving && "opacity-50",
      )}
    >
      <div className="flex gap-3">
        {/* Product Image */}
        <Link
          href={`/shop/${product.slug}`}
          onClick={onClose}
          className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-gray-100 group"
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
          <div className="flex items-start justify-between gap-2 mb-2">
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
              className="h-7 w-7 text-red-400 hover:text-red-600 hover:bg-red-50 shrink-0"
            >
              {isRemoving ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Trash2 className="w-3 h-3" />
              )}
            </Button>
          </div>

          {/* Price and Quantity Controls */}
          <div className="flex items-center justify-between mt-2">
            <p className="text-base font-bold text-[#264B0E]">
              ₹{price.toFixed(2)}
            </p>

            {/* Quantity Controls */}
            <div className="flex items-center border-2 border-gray-200 rounded-lg overflow-hidden bg-white text-accent-foreground">
              <button
                onClick={() => handleUpdateQuantity(quantity - 1)}
                disabled={quantity <= 1}
                className="px-2 py-1 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="px-3 py-1 text-xs font-bold min-w-8 text-center">
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

          {/* Item Total */}
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
            <span className="text-xs text-gray-500">Item total</span>
            <span className="text-sm font-bold text-gray-900">
              ₹{(price * quantity).toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}