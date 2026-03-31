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
  AlertCircle,
} from "lucide-react";
import { useUserStore } from "@/stores/useUserStore";
import { useCartStore } from "@/stores/useCartStore";
import { useGuestCartStore } from "@/stores/useGuestCartStore";
import { useCouponStore } from "@/stores/useCouponStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function CartPage() {
  const { isAuthenticated } = useUserStore();

  /* ── auth cart ── */
  const { cart, loading, fetchCart, updateCartItem, removeFromCart } =
    useCartStore();

  /* ── guest cart ── */
  const {
    items: guestItems,
    updateItem: guestUpdateItem,
    removeItem: guestRemoveItem,
  } = useGuestCartStore();

  /* ── coupon (auth only) ── */
  const {
    coupon: appliedCoupon,
    validateCoupon,
    clearCoupon,
    loading: couponLoading,
  } = useCouponStore();

  const [couponCode, setCouponCode] = useState("");
  const [removingCoupon, setRemovingCoupon] = useState(false);
  const [couponError, setCouponError] = useState("");

  useEffect(() => {
    if (isAuthenticated) fetchCart();
  }, [isAuthenticated, fetchCart]);

  /* ═══════════════════════════════
     GUEST CART PATH
  ═══════════════════════════════ */
  if (!isAuthenticated) {
    if (guestItems.length === 0) {
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

    const guestSubtotal = guestItems.reduce((s, i) => s + i.totalPrice, 0);

    return (
      <div className="min-h-screen bg-linear-to-b from-white to-gray-50 pb-32 md:pb-8">
        {/* Header */}
        <div className="bg-white border-b sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Link href="/collections/collections">
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
                    {guestItems.length}{" "}
                    {guestItems.length === 1 ? "item" : "items"}
                  </p>
                </div>
              </div>
              <div className="hidden md:flex gap-3">
                <Link href="/shop">
                  <Button variant="outline" className="gap-2">
                    <ShoppingBag className="w-4 h-4" />
                    Continue Shopping
                  </Button>
                </Link>
                <Link href="/guest-checkout">
                  <Button className="bg-linear-to-r from-[#2d5016] to-[#3d6820] gap-2">
                    <ShoppingCart className="w-4 h-4" />
                    Proceed to Checkout
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Guest sign-in nudge */}
        <div className="max-w-7xl mx-auto px-4 md:px-6 pt-6">
          <div className="bg-[#2d5016]/5 border border-[#2d5016]/20 rounded-xl px-4 py-3 flex items-center justify-between flex-wrap gap-3">
            <p className="text-sm text-gray-600">
              Shopping as a guest —{" "}
              <Link
                href="/login"
                className="text-[#2d5016] font-semibold underline"
              >
                Sign in
              </Link>{" "}
              to save your cart and track orders.
            </p>
            <Link href="/login">
              <Button
                size="sm"
                variant="outline"
                className="border-[#2d5016] text-[#2d5016] hover:bg-[#2d5016] hover:text-white h-8"
              >
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        {/* Items + summary */}
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence mode="popLayout">
                {guestItems.map((item, index) => (
                  <GuestCartItem
                    key={`${item.productId}-${item.variantSetSize || "default"}`}
                    item={item}
                    index={index}
                    onUpdate={guestUpdateItem}
                    onRemove={guestRemoveItem}
                  />
                ))}
              </AnimatePresence>
            </div>

            <div className="lg:sticky lg:top-24 h-fit">
              <Card>
                <CardContent className="p-5 space-y-4">
                  <h3 className="font-semibold text-lg text-gray-900">
                    Order Summary
                  </h3>
                  <div className="space-y-3 text-sm">
                    <SummaryRow
                      label="Subtotal"
                      value={`₹${guestSubtotal.toFixed(2)}`}
                    />
                    <SummaryRow
                      label="Shipping"
                      value="FREE"
                      className="text-green-600"
                    />
                    <div className="border-t pt-3">
                      <SummaryRow
                        label="Total"
                        value={`₹${guestSubtotal.toFixed(2)}`}
                        bold
                      />
                    </div>
                  </div>
                  <Link href="/guest-checkout" className="hidden md:block">
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

        {/* Mobile bar */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50">
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Total Amount</span>
              <span className="text-2xl font-bold text-gray-900">
                ₹{guestSubtotal.toFixed(2)}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/shop">
                <Button variant="outline" className="w-full h-12 font-semibold">
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Continue
                </Button>
              </Link>
              <Link href="/guest-checkout">
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

  /* ═══════════════════════════════
     AUTH CART PATH
  ═══════════════════════════════ */
  if (loading && !cart?.items) return <CartSkeleton />;

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
    const code = couponCode.trim();
    if (!code) return;
    setCouponError("");
    const result = await validateCoupon({
      code,
      cartTotal: cart.subtotal || cart.totalAmount || 0,
    });
    if (result?.error) {
      setCouponError(result.error);
    } else {
      setCouponCode("");
      fetchCart();
    }
  };

  const handleRemoveCoupon = async () => {
    setRemovingCoupon(true);
    setCouponError("");
    clearCoupon();
    await fetchCart();
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

      {/* Main */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart items */}
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

          {/* Sidebar */}
          <div className="lg:sticky lg:top-24 h-fit space-y-4">
            {/* Coupon */}
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Tag className="w-5 h-5 text-[#d4af37]" />
                  <h3 className="font-semibold text-gray-900">
                    Have a coupon?
                  </h3>
                </div>

                {appliedCoupon ? (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
                        <div className="min-w-0">
                          <p className="font-bold text-green-900 tracking-wider truncate">
                            {appliedCoupon.code}
                          </p>
                          <p className="text-xs text-green-700 mt-0.5">
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
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 shrink-0 h-8 w-8 p-0"
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
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) => {
                          setCouponCode(e.target.value.toUpperCase());
                          if (couponError) setCouponError("");
                        }}
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleApplyCoupon()
                        }
                        className={cn(
                          "flex-1 font-mono tracking-widest",
                          couponError &&
                            "border-red-400 focus-visible:ring-red-300",
                        )}
                        disabled={couponLoading}
                      />
                      <Button
                        onClick={handleApplyCoupon}
                        disabled={couponLoading || !couponCode.trim()}
                        className="bg-[#d4af37] hover:bg-[#c49d2f] text-black font-semibold shrink-0"
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
                        className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2"
                      >
                        <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-red-700 leading-snug">
                          {couponError}
                        </p>
                      </motion.div>
                    )}
                    <p className="text-xs text-gray-400">
                      Coupon codes are case-insensitive
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order summary */}
            <Card>
              <CardContent className="p-5 space-y-4">
                <h3 className="font-semibold text-lg text-gray-900">
                  Order Summary
                </h3>
                {(() => {
                  const subtotal = cart.subtotal || 0;
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
                  return (
                    <>
                      <div className="space-y-3 text-sm">
                        <SummaryRow
                          label="Subtotal"
                          value={`₹${subtotal.toFixed(2)}`}
                        />
                        {discount > 0 && (
                          <SummaryRow
                            label={`Coupon (${appliedCoupon.code})`}
                            value={`-₹${discount.toFixed(2)}`}
                            className="text-green-600"
                          />
                        )}
                        <SummaryRow
                          label="Shipping"
                          value="FREE"
                          className="text-green-600"
                        />
                        <div className="border-t pt-3">
                          <SummaryRow
                            label="Total"
                            value={`₹${total.toFixed(2)}`}
                            bold
                          />
                        </div>
                      </div>
                      {discount > 0 && (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
                          <p className="text-sm font-semibold text-green-800">
                            🎉 You're saving ₹{discount.toFixed(2)} on this
                            order!
                          </p>
                        </div>
                      )}
                    </>
                  );
                })()}
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

      {/* Mobile bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50">
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-gray-500">Total Amount</span>
              {appliedCoupon && (
                <span className="text-xs text-green-600 ml-2 font-semibold">
                  ({appliedCoupon.code} applied)
                </span>
              )}
            </div>
            <span className="text-2xl font-bold text-gray-900">
              ₹{(cart.totalAmount || cart.subtotal || 0).toFixed(2)}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/shop">
              <Button variant="outline" className="w-full h-12 font-semibold">
                <ShoppingBag className="w-4 h-4 mr-2" />
                Continue
              </Button>
            </Link>
            <Link href="/checkout">
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

/* ═══════════════════
   GUEST CART ITEM
═══════════════════ */
function GuestCartItem({ item, index, onUpdate, onRemove }) {
  const [isRemoving, setIsRemoving] = useState(false);

  return (
    <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }} transition={{ delay: index * 0.05 }}>
      <Card className={cn("overflow-hidden transition-opacity", isRemoving && "opacity-50")}>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <Link href={`/shop/${item.productId}`}
              className="relative w-24 h-24 md:w-28 md:h-28 shrink-0 rounded-xl overflow-hidden bg-gray-100 group">
              <Image src={item.image || "/placeholder-product.png"} alt={item.name} fill
                className="object-cover group-hover:scale-110 transition-transform duration-300" />
            </Link>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <Link href={`/shop/${item.productId}`}>
                    <h3 className="font-semibold text-gray-900 hover:text-[#2d5016] transition-colors line-clamp-2 leading-snug">
                      {item.name}
                    </h3>
                  </Link>
                  {item.variantSetSize && (
                    <Badge variant="secondary" className="mt-1.5 text-xs">{item.variantSetSize} Pieces</Badge>
                  )}
                  <p className="text-lg font-bold text-[#2d5016] mt-2">₹{(item.price || 0).toFixed(2)}</p>
                </div>
                <Button variant="ghost" size="icon" disabled={isRemoving}
                  onClick={() => { setIsRemoving(true); onRemove({ productId: item.productId, variantSetSize: item.variantSetSize }); }}
                  className="hidden md:flex h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50">
                  {isRemoving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </Button>
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                  <button onClick={() => onUpdate({ productId: item.productId, quantity: item.quantity - 1, variantSetSize: item.variantSetSize })}
                    disabled={item.quantity <= 1}
                    className="px-3 py-2 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 text-sm font-bold min-w-12 text-center">{item.quantity}</span>
                  <button onClick={() => onUpdate({ productId: item.productId, quantity: item.quantity + 1, variantSetSize: item.variantSetSize })}
                    className="px-3 py-2 hover:bg-gray-100 transition-colors">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <Button variant="ghost" size="sm" disabled={isRemoving}
                  onClick={() => { setIsRemoving(true); onRemove({ productId: item.productId, variantSetSize: item.variantSetSize }); }}
                  className="md:hidden text-red-400 hover:text-red-600 hover:bg-red-50 gap-1">
                  {isRemoving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Trash2 className="w-4 h-4" /><span className="text-sm">Remove</span></>}
                </Button>
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <span className="text-sm text-gray-500">Item total</span>
                <span className="text-base font-bold text-gray-900">₹{((item.price || 0) * (item.quantity || 1)).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );bg-linear-to-b
}

/* ═══════════════════
   AUTH CART ITEM
═══════════════════ */
function CartItem({ item, index, updateCartItem, removeFromCart }) {
  const [isRemoving, setIsRemoving] = useState(false);

  const product = item.product || {};
  const productId = product._id || item.productId;
  const productName = product.name || "Product";
  const productImage = product.images?.[0] || "/placeholder-product.png";

  const handleRemove = async () => {
    setIsRemoving(true);
    await removeFromCart({ productId, variantSetSize: item.variantSetSize });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card
        className={cn(
          "overflow-hidden transition-opacity",
          isRemoving && "opacity-50",
        )}
      >
        <CardContent className="p-4">
          <div className="flex gap-4">
            <Link
              href={`/shop/${productId}`}
              className="relative w-24 h-24 md:w-28 md:h-28 shrink-0 rounded-xl overflow-hidden bg-gray-100 group"
            >
              <Image
                src={productImage}
                alt={productName}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-300"
              />
            </Link>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <Link href={`/shop/${productId}`}>
                    <h3 className="font-semibold text-gray-900 hover:text-[#2d5016] transition-colors line-clamp-2 leading-snug">
                      {productName}
                    </h3>
                  </Link>
                  {item.variantSetSize && (
                    <Badge variant="secondary" className="mt-1.5 text-xs">
                      {item.variantSetSize} Pieces
                    </Badge>
                  )}
                  <p className="text-lg font-bold text-[#2d5016] mt-2">
                    ₹{(item.price || 0).toFixed(2)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRemove}
                  disabled={isRemoving}
                  className="hidden md:flex h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50"
                >
                  {isRemoving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </Button>
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() =>
                      updateCartItem({
                        productId,
                        quantity: item.quantity - 1,
                        variantSetSize: item.variantSetSize,
                      })
                    }
                    disabled={item.quantity <= 1}
                    className="px-3 py-2 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 text-sm font-bold min-w-12 text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() =>
                      updateCartItem({
                        productId,
                        quantity: item.quantity + 1,
                        variantSetSize: item.variantSetSize,
                      })
                    }
                    className="px-3 py-2 hover:bg-gray-100 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemove}
                  disabled={isRemoving}
                  className="md:hidden text-red-400 hover:text-red-600 hover:bg-red-50 gap-1"
                >
                  {isRemoving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      <span className="text-sm">Remove</span>
                    </>
                  )}
                </Button>
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <span className="text-sm text-gray-500">Item total</span>
                <span className="text-base font-bold text-gray-900">
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

/* ═══════════════════
   HELPERS
═══════════════════ */
function SummaryRow({ label, value, className, bold }) {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      <span
        className={cn(
          "text-gray-600",
          bold && "font-bold text-gray-900 text-base",
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          "font-semibold",
          bold && "font-bold text-gray-900 text-base",
        )}
      >
        {value}
      </span>
    </div>
  );
}

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

function CartSkeleton() {
  return (
    <div className="min-h-screen bg-linear-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex gap-4 animate-pulse">
                    <div className="w-24 h-24 bg-gray-200 rounded-xl" />
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
                <div className="h-10 bg-gray-200 rounded" />
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