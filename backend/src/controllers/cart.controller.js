import { Cart } from "../models/cart.model.js";
import { Product } from "../models/product.model.js";
import { Coupon } from "../models/coupon.model.js";
import { calculateCartTotals } from "../utils/cartCalculator.js";

const getPopulatedCart = async (userId) => {
    return Cart.findOne({ user: userId })
        .populate("items.product")
        .populate("coupon");
};

// =============================
// GET CART
// =============================
export const getCart = async (req, res) => {
    const cart = await Cart.findOne({ user: req.user._id })
        .populate("items.product")
        .populate("coupon");

    if (!cart) {
        return res.status(200).json({
            success: true,
            cart: {
                items: [],
                subtotal: 0,
                discount: 0,
                totalAmount: 0,
            },
        });
    }

    res.status(200).json({ success: true, cart });
};

// =============================
// ADD TO CART
// =============================
export const addToCart = async (req, res) => {
    try {
        const { productId, quantity = 1, variantSetSize } = req.body;

        const product = await Product.findById(productId);
        if (!product || !product.isActive) {
            return res.status(404).json({ message: "Product not available" });
        }

        let price, totalPrice;

        // PAAN PRODUCT
        if (product.category === "Paan") {
            const variant = product.variants.find(
                (v) => v.setSize === variantSetSize
            );

            if (!variant) {
                return res.status(400).json({
                    message: "Invalid paan set selected",
                });
            }

            price = variant.discountedPrice;
            totalPrice = price;
        } else {
            // NON-PAAN
            price = product.discountedPrice;
            totalPrice = price * quantity;
        }

        let cart = await Cart.findOne({ user: req.user._id });

        if (!cart) {
            cart = await Cart.create({
                user: req.user._id,
                items: [],
            });
        }

        // Check if item exists
        const existingItem = cart.items.find((item) => {
            if (product.category === "Paan") {
                return (
                    item.product.toString() === productId &&
                    item.variantSetSize === variantSetSize
                );
            }
            return item.product.toString() === productId;
        });

        if (existingItem) {
            if (product.category !== "Paan") {
                existingItem.quantity += quantity;
                existingItem.totalPrice = existingItem.quantity * price;
            }
        } else {
            cart.items.push({
                product: productId,
                variantSetSize,
                quantity: product.category === "Paan" ? 1 : quantity,
                price,
                totalPrice,
            });
        }

        const totals = calculateCartTotals(cart.items, cart.discount);
        cart.subtotal = totals.subtotal;
        cart.totalAmount = totals.totalAmount;

        await cart.save();

        const populatedCart = await getPopulatedCart(req.user._id);

        res.status(200).json({
            success: true,
            message: "Item added to cart",
            cart: populatedCart,
        });
    } catch (error) {
        console.error("addToCart", error);
        res.status(500).json({
            message: "Error while adding to cart",
        });
    }
};

// =============================
// UPDATE CART ITEM
// =============================
export const updateCartItem = async (req, res) => {
    const { productId, quantity } = req.body;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.items.find((i) => i.product.toString() === productId);

    if (!item) {
        return res.status(404).json({ message: "Item not found" });
    }

    item.quantity = quantity;
    item.totalPrice = item.price * quantity;

    const totals = calculateCartTotals(cart.items, cart.discount);
    cart.subtotal = totals.subtotal;
    cart.totalAmount = totals.totalAmount;

    await cart.save();

    const populatedCart = await getPopulatedCart(req.user._id);

    res.status(200).json({ success: true, cart: populatedCart });
};

import { CouponUsage } from "../models/couponUsage.model.js";

// =============================
// APPLY COUPON
// =============================
export const applyCouponToCart = async (req, res) => {
    const { code } = req.body;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const coupon = await Coupon.findOne({
        code: code.toUpperCase(),
        isActive: true,
        expiryDate: { $gte: new Date() },
    });

    if (!coupon) {
        return res.status(400).json({ message: "Invalid coupon" });
    }

    let discount = 0;

    if (coupon.discountType === "percentage") {
        discount = (cart.subtotal * coupon.discountValue) / 100;
        if (coupon.maxDiscount) {
            discount = Math.min(discount, coupon.maxDiscount);
        }
    } else {
        discount = coupon.discountValue;
    }

    cart.coupon = coupon._id;
    cart.discount = discount;

    const totals = calculateCartTotals(cart.items, discount);
    cart.totalAmount = totals.totalAmount;

    await cart.save();

    const populatedCart = await getPopulatedCart(req.user._id);

    res.status(200).json({
        success: true,
        message: "Coupon applied",
        cart: populatedCart,
    });
};

// =============================
// REMOVE FROM CART
// =============================
export const removeFromCart = async (req, res) => {
    const { productId, variantSetSize } = req.body;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter((item) => {
        if (variantSetSize) {
            return !(
                item.product.toString() === productId &&
                item.variantSetSize === variantSetSize
            );
        }
        return item.product.toString() !== productId;
    });

    const totals = calculateCartTotals(cart.items, cart.discount);
    cart.subtotal = totals.subtotal;
    cart.totalAmount = totals.totalAmount;

    await cart.save();
    const populatedCart = await getPopulatedCart(req.user._id);

    res.status(200).json({ success: true, cart: populatedCart });
};

// =============================
// REMOVE COUPON FROM CART
// =============================
export const removeCouponFromCart = async (req, res) => {
    try {
        const userId = req.user._id;

        const cart = await Cart.findOne({ user: userId });

        cart.coupon = null;
        cart.discount = 0;

        const totals = calculateCartTotals(cart.items, 0);
        cart.totalAmount = totals.totalAmount;

        await cart.save();

        const populatedCart = await getPopulatedCart(userId);

        return res.status(200).json({
            success: true,
            message: "Coupon removed successfully",
            cart: populatedCart,
        });
    } catch (error) {
        console.error("removeCouponFromCart", error);
        return res.status(500).json({
            message: "Error while removing coupon",
        });
    }
};

// =============================
// CLEAR CART
// =============================
export const clearCart = async (req, res) => {
    await Cart.findOneAndDelete({ user: req.user._id });

    res.status(200).json({
        success: true,
        message: "Cart cleared",
    });
};
