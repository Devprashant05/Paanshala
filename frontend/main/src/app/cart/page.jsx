"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  Minus,
  Plus,
  Trash2,
  ShoppingCart,
  ArrowLeft,
  Tag,
  Loader2,
  X,
  CheckCircle,
} from "lucide-react";
import { useUserStore } from "@/stores/useUserStore";
import { useCartStore } from "@/stores/useCartStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function CartPage() {
  const { isAuthenticated } = useUserStore();
  const {
    cart,
    loading,
    fetchCart,
    updateCartItem,
    removeFromCart,
    applyCoupon,
    removeCoupon,
  } = useCartStore();

  const [couponCode, setCouponCode] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [removingCoupon, setRemovingCoupon] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated, fetchCart]);

  /* =========================
     NOT LOGGED IN
  ========================= */
  if (!isAuthenticated) {
    return (
      <EmptyState
        icon={<ShoppingCart className="w-16 h-16 text-gray-400" />}
        title="Please login to view your cart"
        description="You need to be logged in to see items in your cart and proceed to checkout."
        actionLabel="Login to Continue"
        actionHref="/login"
      />
    );
  }

  /* =========================
     LOADING STATE
  ========================= */
  if (loading && !cart?.items) {
    return <CartSkeleton />;
  }

  /* =========================
     EMPTY CART
  ========================= */
  if (cart?.items?.length === 0) {
    return (
      <EmptyState
        icon={<ShoppingBag className="w-16 h-16 text-gray-400" />}
        title="Your cart is empty"
        description="Looks like you haven't added anything yet. Start shopping to fill your cart!"
        actionLabel="Start Shopping"
        actionHref="/shop"
      />
    );
  }

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    setApplyingCoupon(true);
    await applyCoupon(couponCode);
    setApplyingCoupon(false);
    setCouponCode(""); // Clear input after applying
  };

  const handleRemoveCoupon = async () => {
    setRemovingCoupon(true);
    await removeCoupon();
    setRemovingCoupon(false);
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-white to-gray-50 pb-32 md:pb-8">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/shop">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Back to Shop</span>
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Shopping Cart
                </h1>
                <p className="text-sm text-gray-500">
                  {cart.items.length}{" "}
                  {cart.items.length === 1 ? "item" : "items"}
                </p>
              </div>
            </div>

            {/* Desktop Buttons */}
            <div className="hidden md:flex gap-3">
              <Link href="/shop">
                <Button variant="outline" className="gap-2">
                  <ShoppingBag className="w-4 h-4" />
                  Continue Shopping
                </Button>
              </Link>
              <Link href="/checkout">
                <Button className="bg-linear-to-r from-[#2d5016] to-[#3d6820] gap-2">
                  <ShoppingCart className="w-4 h-4" />
                  Proceed to Checkout
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence mode="popLayout">
              {cart.items.map((item, index) => (
                <CartItem
                  key={`${item.product?._id || item.productId}-${item.variantSetSize || "default"}`}
                  item={item}
                  index={index}
                  updateCartItem={updateCartItem}
                  removeFromCart={removeFromCart}
                />
              ))}
            </AnimatePresence>
          </div>

          {/* Order Summary */}
          <div className="lg:sticky lg:top-24 h-fit space-y-4">
            {/* Coupon Section */}
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Tag className="w-5 h-5 text-[#d4af37]" />
                  <h3 className="font-semibold text-gray-900">
                    Have a coupon?
                  </h3>
                </div>

                {cart.coupon ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
                        <div className="min-w-0">
                          <p className="font-medium text-green-900 truncate">
                            {cart.coupon.code || cart.coupon}
                          </p>
                          {cart.coupon.discountType && (
                            <p className="text-sm text-green-700">
                              {cart.coupon.discountType === "percentage"
                                ? `${cart.coupon.discountValue}% off`
                                : `₹${cart.coupon.discountValue} off`}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveCoupon}
                        disabled={removingCoupon}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 shrink-0"
                      >
                        {removingCoupon ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <X className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) =>
                        setCouponCode(e.target.value.toUpperCase())
                      }
                      onKeyPress={(e) =>
                        e.key === "Enter" && handleApplyCoupon()
                      }
                      className="flex-1"
                      disabled={applyingCoupon}
                    />
                    <Button
                      onClick={handleApplyCoupon}
                      disabled={applyingCoupon || !couponCode.trim()}
                      className="bg-[#d4af37] hover:bg-[#c49d2f]"
                    >
                      {applyingCoupon ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Apply"
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Summary Card */}
            <Card>
              <CardContent className="p-5 space-y-4">
                <h3 className="font-semibold text-lg text-gray-900">
                  Order Summary
                </h3>

                <div className="space-y-3">
                  <SummaryRow
                    label="Subtotal"
                    value={`₹${(cart.subtotal || 0).toFixed(2)}`}
                  />

                  {cart.discount > 0 && (
                    <SummaryRow
                      label="Discount"
                      value={`-₹${(cart.discount || 0).toFixed(2)}`}
                      className="text-green-600"
                    />
                  )}

                  <div className="border-t pt-3">
                    <SummaryRow
                      label="Total"
                      value={`₹${(cart.totalAmount || 0).toFixed(2)}`}
                      className="text-lg font-bold"
                    />
                  </div>
                </div>

                {/* Savings Badge */}
                {cart.discount > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                    <p className="text-sm font-medium text-green-800">
                      You're saving ₹{(cart.discount || 0).toFixed(2)} on this
                      order! 🎉
                    </p>
                  </div>
                )}

                {/* Desktop Checkout Button */}
                <Link href="/checkout" className="hidden md:block">
                  <Button className="w-full h-12 bg-linear-to-r from-[#2d5016] to-[#3d6820] hover:opacity-90 font-semibold">
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Proceed to Checkout
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Mobile Fixed Bottom Buttons */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50">
        <div className="p-4 space-y-3">
          {/* Total */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Total Amount</span>
            <span className="text-2xl font-bold text-gray-900">
              ₹{(cart.totalAmount || 0).toFixed(2)}
            </span>
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Link href="/shop" className="w-full">
              <Button variant="outline" className="w-full h-12 font-semibold">
                <ShoppingBag className="w-4 h-4 mr-2" />
                Continue
              </Button>
            </Link>
            <Link href="/checkout" className="w-full">
              <Button className="w-full h-12 bg-linear-to-r from-[#2d5016] to-[#3d6820] font-semibold">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Checkout
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================
   CART ITEM COMPONENT
========================= */
function CartItem({ item, index, updateCartItem, removeFromCart }) {
  const [isRemoving, setIsRemoving] = useState(false);

  // Safety check for product data
  const product = item.product || {};
  const productId = product._id || item.productId;
  const productName = product.name || "Product";
  const productImages = product.images || [];
  const productImage = productImages[0] || "/placeholder-product.png";

  const handleRemove = async () => {
    setIsRemoving(true);
    await removeFromCart({
      productId: productId,
      variantSetSize: item.variantSetSize,
    });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className={cn("overflow-hidden", isRemoving && "opacity-50")}>
        <CardContent className="p-4">
          <div className="flex gap-4">
            {/* Product Image */}
            <Link
              href={`/shop/${productId}`}
              className="relative w-24 h-24 md:w-28 md:h-28 shrink-0 rounded-lg overflow-hidden bg-gray-100 group"
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
                  <Link href={`/shop/${productId}`}>
                    <h3 className="font-semibold text-gray-900 hover:text-[#d4af37] transition-colors line-clamp-2">
                      {productName}
                    </h3>
                  </Link>

                  {item.variantSetSize && (
                    <Badge variant="secondary" className="mt-2">
                      {item.variantSetSize} Pieces
                    </Badge>
                  )}

                  <p className="text-lg font-bold text-[#2d5016] mt-2">
                    ₹{(item.price || 0).toFixed(2)}
                  </p>
                </div>

                {/* Remove Button - Desktop */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemove}
                  disabled={isRemoving}
                  className="hidden md:flex text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  {isRemoving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </Button>
              </div>

              {/* Quantity Controls & Remove Button */}
              <div className="flex items-center justify-between mt-4">
                {/* Quantity */}
                <div className="flex items-center border-2 border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() =>
                      updateCartItem({
                        productId: productId,
                        quantity: item.quantity - 1,
                        variantSetSize: item.variantSetSize,
                      })
                    }
                    disabled={item.quantity <= 1}
                    className="px-3 py-2 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>

                  <span className="px-4 py-2 text-sm font-semibold min-w-12 text-center">
                    {item.quantity}
                  </span>

                  <button
                    onClick={() =>
                      updateCartItem({
                        productId: productId,
                        quantity: item.quantity + 1,
                        variantSetSize: item.variantSetSize,
                      })
                    }
                    className="px-3 py-2 hover:bg-gray-100 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Remove Button - Mobile */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemove}
                  disabled={isRemoving}
                  className="md:hidden text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  {isRemoving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-1" />
                      <span className="text-sm">Remove</span>
                    </>
                  )}
                </Button>
              </div>

              {/* Subtotal */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t">
                <span className="text-sm text-gray-600">Subtotal:</span>
                <span className="text-lg font-bold text-gray-900">
                  ₹{((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* =========================
   SUMMARY ROW
========================= */
function SummaryRow({ label, value, className }) {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      <span className="text-gray-600">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

/* =========================
   TRUST BADGE
========================= */
function TrustBadge({ icon, title, description }) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 text-center">
      <div className="text-2xl mb-2">{icon}</div>
      <p className="font-semibold text-sm text-gray-900">{title}</p>
      <p className="text-xs text-gray-600">{description}</p>
    </div>
  );
}

/* =========================
   EMPTY STATE
========================= */
function EmptyState({ icon, title, description, actionLabel, actionHref }) {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="w-24 h-24 flex items-center justify-center rounded-full bg-gray-100 mb-6"
      >
        {icon}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
          {title}
        </h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">{description}</p>

        <Link href={actionHref}>
          <Button className="bg-linear-to-r from-[#2d5016] to-[#3d6820] hover:opacity-90 h-12 px-8">
            {actionLabel}
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}

/* =========================
   CART SKELETON
========================= */
function CartSkeleton() {
  return (
    <div className="min-h-screen bg-linear-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex gap-4 animate-pulse">
                    <div className="w-24 h-24 bg-gray-200 rounded-lg" />
                    <div className="flex-1 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                      <div className="h-8 bg-gray-200 rounded w-32" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="space-y-4">
            <Card>
              <CardContent className="p-5 space-y-3 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-32" />
                <div className="h-4 bg-gray-200 rounded" />
                <div className="h-4 bg-gray-200 rounded" />
                <div className="h-12 bg-gray-200 rounded" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
