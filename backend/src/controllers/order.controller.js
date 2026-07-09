import crypto from "crypto";
import { razorpay } from "../utils/razorpay.js";
import { Reward } from "../models/reward.model.js";
import { User } from "../models/user.model.js";
import { Order } from "../models/order.model.js";
import { Address } from "../models/address.model.js";
import { Cart } from "../models/cart.model.js";
import { Product } from "../models/product.model.js";
import { uploadPdfToCloudinary } from "../utils/cloudinary.js";
import { generateInvoice } from "../utils/invoiceGenerator.js";
import { sendMail } from "../utils/sendMail.js";
import { baseEmailTemplate } from "../utils/emailTemplate.js";
import { Coupon } from "../models/coupon.model.js";
import { CouponUsage } from "../models/couponUsage.model.js";
import { PageSettings } from "../models/pageSettings.model.js";
import fs from "fs";
import {
    createShiprocketOrder,
    updateShiprocketOrderAddress,
} from "../services/shiprocket.service.js";
import { Category } from "../models/category.model.js";
import { Parser } from "json2csv";

const decrementStock = async (cartItems) => {
    for (const item of cartItems) {
        const product = item.product;
        const qty = item.quantity;

        if (item.variantSetSize) {
            // Paan variant stock
            await Product.updateOne(
                {
                    _id: product._id,
                    "variants.setSize": item.variantSetSize,
                },
                {
                    $inc: { "variants.$.stock": -qty },
                }
            );
        } else {
            // Regular stock
            await Product.updateOne(
                { _id: product._id },
                { $inc: { stock: -qty } }
            );
        }
    }
};

/* ======================================================
   HELPER: Split cart items into LOCAL vs SHIPPED
   Returns { localItems, shippedItems, requiresScheduling }
====================================================== */
const splitItemsByFulfillment = async (cartItems) => {
    const localItems = [];
    const shippedItems = [];

    for (const item of cartItems) {
        const product = item.product || item; // works for both populated cart and orderItems array

        // Get the product's category
        const productDoc = await Product.findById(product._id || product)
            .populate("category")
            .populate("parentCategory");

        // Check if category or parentCategory requires scheduling
        const category = productDoc?.category;
        const parentCategory = productDoc?.parentCategory;

        let requiresScheduling = false;

        if (category) {
            const cat = await Category.findById(
                category._id || category
            ).select("requiresScheduling");
            if (cat?.requiresScheduling) requiresScheduling = true;
        }

        if (!requiresScheduling && parentCategory) {
            const pCat = await Category.findById(
                parentCategory._id || parentCategory
            ).select("requiresScheduling");
            if (pCat?.requiresScheduling) requiresScheduling = true;
        }

        if (requiresScheduling) {
            localItems.push(item);
        } else {
            shippedItems.push(item);
        }
    }

    return {
        localItems,
        shippedItems,
        fulfillmentType:
            localItems.length > 0 && shippedItems.length > 0
                ? "MIXED"
                : localItems.length > 0
                  ? "LOCAL"
                  : "SHIPPED",
    };
};

/* ======================================================
   CREATE RAZORPAY PAYMENT ORDER
====================================================== */
export const createPaymentOrder = async (req, res) => {
    try {
        const { couponCode, redeemPoints = 0 } = req.body;

        const cart = await Cart.findOne({ user: req.user._id }).populate(
            "items.product"
        );

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: "Cart is empty" });
        }

        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: "User not found" });

        /* ── Coupon ── */
        let discountAmount = 0;
        if (couponCode) {
            const coupon = await Coupon.findOne({
                code: couponCode.toUpperCase(),
                isActive: true,
                expiryDate: { $gte: new Date() },
            });

            if (!coupon)
                return res
                    .status(400)
                    .json({ message: "Invalid or expired coupon" });
            if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit)
                return res
                    .status(400)
                    .json({ message: "Coupon usage limit exceeded" });

            const existingUsage = await CouponUsage.findOne({
                couponId: coupon._id,
                userId: req.user._id,
            });
            if (existingUsage && existingUsage.usedCount >= coupon.usagePerUser)
                return res
                    .status(400)
                    .json({ message: "You have already used this coupon" });

            if (coupon.discountType === "percentage") {
                discountAmount = (cart.subtotal * coupon.discountValue) / 100;
                if (coupon.maxDiscount)
                    discountAmount = Math.min(
                        discountAmount,
                        coupon.maxDiscount
                    );
            } else {
                discountAmount = coupon.discountValue;
            }
            discountAmount = Math.min(discountAmount, cart.subtotal);
        }

        /* ── Reward points ── */
        if (redeemPoints < 0)
            return res.status(400).json({ message: "Invalid reward points" });
        if (redeemPoints > 0 && redeemPoints < 50)
            return res
                .status(400)
                .json({ message: "Minimum 50 reward points required" });

        const freshUser = await User.findById(req.user._id);
        if (redeemPoints > freshUser.rewardPoints)
            return res
                .status(400)
                .json({ message: "Insufficient reward points" });

        const maxRedeemablePoints = Math.max(0, cart.subtotal - discountAmount);
        if (redeemPoints > maxRedeemablePoints)
            return res.status(400).json({
                message: `You can redeem maximum ${maxRedeemablePoints} points`,
            });

        /* ── Fulfillment split — needed to determine shipping charges ── */
        const { fulfillmentType } = await splitItemsByFulfillment(cart.items);

        /* ── Shipping charges ── */
        const pageSettings = await PageSettings.findOne();
        const freeThreshold =
            pageSettings?.shippingSettings?.freeShippingThreshold ?? 500;
        const standardCharges =
            pageSettings?.shippingSettings?.standardCharges ?? 0;
        const shippingCharges =
            fulfillmentType === "LOCAL"
                ? 0
                : cart.subtotal >= freeThreshold
                  ? 0
                  : standardCharges;

        const chargeAmount = Math.max(
            0,
            cart.subtotal - discountAmount - redeemPoints + shippingCharges
        );

        if (chargeAmount <= 0) {
            return res.status(400).json({
                message: "Final payable amount must be greater than 0",
            });
        }

        const razorpayOrder = await razorpay.orders.create({
            amount: Math.round(chargeAmount * 100),
            currency: "INR",
            receipt: `order_${Date.now()}`,
        });

        res.status(200).json({
            success: true,
            razorpayOrder,
            shippingCharges,
            fulfillmentType,
        });
    } catch (error) {
        console.error("createPaymentOrder", error);
        res.status(500).json({ message: "Error while creating payment order" });
    }
};

/* ======================================================
   VERIFY PAYMENT & CREATE ORDER
====================================================== */
export const verifyPaymentAndCreateOrder = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            billingAddressId,
            shippingAddressId,
            couponCode,
            redeemPoints = 0,
            scheduledDate,
            scheduledTime,
        } = req.body;

        /* ── 1. Verify Razorpay signature ── */
        const body = `${razorpay_order_id}|${razorpay_payment_id}`;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return res
                .status(400)
                .json({ message: "Payment verification failed" });
        }

        /* ── 2. Load cart ── */
        const cart = await Cart.findOne({ user: req.user._id }).populate(
            "items.product"
        );

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: "Cart is empty" });
        }

        /* ── Split items by fulfillment type ── */
        const { localItems, shippedItems, fulfillmentType } =
            await splitItemsByFulfillment(cart.items);

        /* ── Validate scheduling for local items ── */
        if (localItems.length > 0 && (!scheduledDate || !scheduledTime)) {
            return res.status(400).json({
                message:
                    "Please select a delivery date and time for your paan order",
            });
        }

        /* ─────────────────────────────────────
   VALIDATE STOCK
───────────────────────────────────── */

        for (const item of cart.items) {
            const product = item.product;

            // Variant products
            if (item.variantSetSize) {
                const variant = product.variants.find(
                    (v) => v.setSize === item.variantSetSize
                );

                if (!variant || variant.stock < item.quantity) {
                    return res.status(400).json({
                        message: `${product.name} is out of stock`,
                    });
                }
            }

            // Regular products
            else {
                if (product.stock < item.quantity) {
                    return res.status(400).json({
                        message: `${product.name} is out of stock`,
                    });
                }
            }
        }

        /* ── Fetch user reward balance ── */
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        /* ── 3. Load addresses (no addressType needed anymore) ── */
        const [billing, shipping] = await Promise.all([
            Address.findById(billingAddressId),
            Address.findById(shippingAddressId),
        ]);

        if (!billing || !shipping) {
            return res
                .status(400)
                .json({ message: "Invalid billing or shipping address" });
        }

        /* ── Shipping charges ── */
        const pageSettings = await PageSettings.findOne();
        const freeThreshold =
            pageSettings?.shippingSettings?.freeShippingThreshold ?? 500;
        const standardCharges =
            pageSettings?.shippingSettings?.standardCharges ?? 0;
        const shippingCharges =
            fulfillmentType === "LOCAL"
                ? 0 // local-only orders don't ship
                : cart.subtotal >= freeThreshold
                  ? 0
                  : standardCharges;

        /* ── 4. Generate sequential order number ── */
        const year = new Date().getFullYear() % 100; // e.g. 26

        const lastOrder = await Order.findOne({ orderYear: year })
            .sort({ orderSequence: -1 })
            .select("orderSequence");

        const nextSequence = lastOrder ? lastOrder.orderSequence + 1 : 1;
        const orderNumber = `PAAN-${year}-${String(nextSequence).padStart(2, "0")}`;

        /* ── 5. Resolve coupon ── */
        let appliedCoupon = null;
        let discountAmount = 0;

        if (couponCode) {
            const coupon = await Coupon.findOne({
                code: couponCode.toUpperCase(),
                isActive: true,
                expiryDate: { $gte: new Date() },
            });

            if (!coupon) {
                return res
                    .status(400)
                    .json({ message: "Invalid or expired coupon" });
            }

            // Global usage limit
            if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
                return res
                    .status(400)
                    .json({ message: "Coupon usage limit exceeded" });
            }

            // Per-user usage limit
            const existingUsage = await CouponUsage.findOne({
                couponId: coupon._id,
                userId: req.user._id,
            });

            if (
                existingUsage &&
                existingUsage.usedCount >= coupon.usagePerUser
            ) {
                return res
                    .status(400)
                    .json({ message: "You have already used this coupon" });
            }

            appliedCoupon = coupon;

            // Calculate discount
            if (coupon.discountType === "percentage") {
                discountAmount = (cart.subtotal * coupon.discountValue) / 100;
                if (coupon.maxDiscount) {
                    discountAmount = Math.min(
                        discountAmount,
                        coupon.maxDiscount
                    );
                }
            } else {
                // flat
                discountAmount = coupon.discountValue;
            }

            // Clamp to cart subtotal (can't discount more than total)
            discountAmount = Math.min(discountAmount, cart.subtotal);
        }

        /* ─────────────────────────────────────
   VALIDATE REWARD REDEMPTION
───────────────────────────────────── */

        if (redeemPoints < 0) {
            return res.status(400).json({
                message: "Invalid reward points",
            });
        }

        // Optional minimum redemption
        if (redeemPoints > 0 && redeemPoints < 50) {
            return res.status(400).json({
                message: "Minimum 50 reward points required",
            });
        }

        // Check user balance
        const freshUser = await User.findById(req.user._id);

        if (redeemPoints > freshUser.rewardPoints) {
            return res.status(400).json({
                message: "Insufficient reward points",
            });
        }

        // Prevent over redemption
        const maxRedeemablePoints = Math.max(0, cart.subtotal - discountAmount);

        if (redeemPoints > maxRedeemablePoints) {
            return res.status(400).json({
                message: `You can redeem maximum ${maxRedeemablePoints} points`,
            });
        }

        const finalTotal =
            Math.max(0, cart.subtotal - discountAmount - redeemPoints) +
            shippingCharges;

        if (finalTotal <= 0) {
            return res.status(400).json({
                message: "Final payable amount must be greater than 0",
            });
        }

        /* ── 6. Create order ── */
        const order = await Order.create({
            user: req.user._id,
            orderNumber,
            orderSequence: nextSequence,
            orderYear: year,

            items: cart.items.map((item) => ({
                product: item.product._id,
                name: item.product.name,
                image: item.product.images?.[0],
                variantSetSize: item.variantSetSize,
                quantity: item.quantity,
                price: item.price,
                totalPrice: item.totalPrice,
                fulfillmentType: localItems.some(
                    (l) =>
                        l.product._id.toString() === item.product._id.toString()
                )
                    ? "LOCAL"
                    : "SHIPPED",
            })),

            fulfillmentType,
            scheduledDate: localItems.length > 0 ? scheduledDate : null,
            scheduledTime: localItems.length > 0 ? scheduledTime : null,
            localStatus: localItems.length > 0 ? "PENDING" : undefined,
            shippingCharges,
            totalAmount: finalTotal,

            // Snapshot addresses — no addressType field
            billingAddress: {
                fullName: billing.fullName,
                companyName: billing.companyName,
                streetAddress: billing.streetAddress,
                landmark: billing.landmark,
                city: billing.city,
                state: billing.state,
                pincode: billing.pincode,
                phone: billing.phone,
                email: billing.email,
            },
            shippingAddress: {
                fullName: shipping.fullName,
                companyName: shipping.companyName,
                streetAddress: shipping.streetAddress,
                landmark: shipping.landmark,
                city: shipping.city,
                state: shipping.state,
                pincode: shipping.pincode,
                phone: shipping.phone,
                email: shipping.email,
            },

            // Coupon data embedded in order
            ...(appliedCoupon && {
                coupon: {
                    couponId: appliedCoupon._id,
                    code: appliedCoupon.code,
                    discountAmount,
                },
            }),

            subtotal: cart.subtotal,
            discount: discountAmount,
            totalAmount: finalTotal,

            rewardRedemption: {
                redeemedPoints: redeemPoints,
                redeemedAmount: redeemPoints,
            },

            payment: {
                razorpayOrderId: razorpay_order_id,
                razorpayPaymentId: razorpay_payment_id,
                razorpaySignature: razorpay_signature,
                status: "PAID",
            },

            status: "PAID",
        });

        console.log("✓ Order created:", order._id);

        /* ─────────────────────────────────────
   DEDUCT REWARD POINTS
───────────────────────────────────── */

        if (redeemPoints > 0) {
            const updatedUser = await User.findOneAndUpdate(
                {
                    _id: req.user._id,
                    rewardPoints: { $gte: redeemPoints },
                },
                {
                    $inc: {
                        rewardPoints: -redeemPoints,
                        totalRewardRedeemed: redeemPoints,
                    },
                },
                { new: true }
            );

            if (!updatedUser) {
                return res.status(400).json({
                    message: "Insufficient reward points during processing",
                });
            }

            await Reward.create({
                userId: req.user._id,
                orderId: order._id,
                type: "redeemed",
                points: redeemPoints,
                description: `Reward points redeemed on order ${order.orderNumber}`,
            });

            console.log("✓ Reward points redeemed:", redeemPoints);
        }

        /* ── 7. Decrement product stock ── */
        try {
            await decrementStock(cart.items);

            console.log("Stock decremented for", cart.items.length, "item(s)");
        } catch (stockError) {
            console.error(" Stock decrement failed:", stockError);
        }

        /* ── 8. Track coupon usage (only after successful order creation) ── */
        if (appliedCoupon) {
            // Upsert CouponUsage — increment per-user count
            await CouponUsage.findOneAndUpdate(
                { couponId: appliedCoupon._id, userId: req.user._id },
                { $inc: { usedCount: 1 } },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );

            // Increment global usedCount on the coupon
            await Coupon.findByIdAndUpdate(appliedCoupon._id, {
                $inc: { usedCount: 1 },
            });

            console.log("✓ Coupon usage tracked:", appliedCoupon.code);
        }

        /* ── 9. Generate & upload invoice ── */
        let invoicePath = null;
        try {
            invoicePath = await generateInvoice(order);
            const uploadResult = await uploadPdfToCloudinary(
                invoicePath,
                order.orderNumber
            );
            order.invoiceUrl = uploadResult.secure_url;
            await order.save();
            /* ── Shiprocket — only for orders with shipped items ── */
            if (fulfillmentType !== "LOCAL") {
                try {
                    const shiprocketOrder =
                        fulfillmentType === "MIXED"
                            ? {
                                  ...order.toObject(),
                                  items: shippedItems.map((item) => ({
                                      name: item.product?.name || item.name,
                                      product:
                                          item.product?._id || item.product,
                                      variantSetSize: item.variantSetSize,
                                      quantity: item.quantity,
                                      price: item.price,
                                      totalPrice: item.totalPrice,
                                  })),
                              }
                            : order;

                    const shiprocketResponse =
                        await createShiprocketOrder(shiprocketOrder);
                    order.shiprocket = {
                        orderId: shiprocketResponse.order_id,
                        shipmentId: shiprocketResponse.shipment_id,
                        status: "NEW",
                        raw: shiprocketResponse,
                    };
                    await order.save();
                    console.log("✓ Shiprocket shipment created");
                } catch (shiprocketError) {
                    console.error("Shiprocket Error:", shiprocketError.message);
                }
            }
            console.log("✓ Invoice uploaded");
        } catch (invoiceError) {
            console.error("⚠️ Invoice generation/upload failed:", invoiceError);
            // Non-fatal — order already created
        }

        /* ── 10. Clear cart ── */
        await Cart.findOneAndDelete({ user: req.user._id });
        console.log("✓ Cart cleared");

        /* ── 11. Send confirmation email ── */
        try {
            await sendMail(
                req.user.email,
                "Order Confirmed – Paanshala",
                baseEmailTemplate({
                    title: "Order Confirmed! 🎉",
                    subtitle: `Order #${order.orderNumber}`,
                    body: `
                        <p style="font-size:16px;color:#333;">
                            Thank you for your order! Your purchase has been confirmed.
                        </p>
                        <div style="background:#f0f0f0;padding:20px;border-radius:8px;margin:20px 0;">
                            <p style="margin:5px 0;"><strong>Order Total:</strong> ₹${order.totalAmount}</p>
                            ${
                                order.coupon
                                    ? `<p style="margin:5px 0;"><strong>Coupon Applied:</strong> ${order.coupon.code} (–₹${order.coupon.discountAmount})</p>`
                                    : ""
                            }
                            <p style="margin:5px 0;"><strong>Payment Status:</strong> ${order.payment.status}</p>
                            <p style="margin:5px 0;"><strong>Order Status:</strong> ${order.status}</p>
                        </div>
                        <p style="font-size:14px;color:#666;">
                            We'll send you another email when your order ships.
                        </p>
                    `,
                }),
                invoicePath
                    ? [
                          {
                              filename: `invoice-${order.orderNumber}.pdf`,
                              path: invoicePath,
                          },
                      ]
                    : []
            );
            console.log("✓ Confirmation email sent");
        } catch (emailError) {
            console.error("⚠️ Email sending failed:", emailError);
            // Non-fatal
        }

        /* ── 12. Cleanup temp invoice file ── */
        if (invoicePath && fs.existsSync(invoicePath)) {
            fs.unlinkSync(invoicePath);
        }

        res.status(201).json({
            success: true,
            message: "Order placed successfully",
            order,
        });
    } catch (error) {
        console.error("verifyPaymentAndCreateOrder", error);
        res.status(500).json({
            message: "Error while creating order",
            error: error.message,
        });
    }
};

/* ======================================================
   (USER) GET MY ORDERS
====================================================== */
/* ======================================================
   (USER) GET MY ORDERS
====================================================== */
export const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({
            user: req.user._id,
        }).sort({ createdAt: -1 }).select(`
                orderNumber
                items
                totalAmount
                subtotal
                discount
                coupon
                rewardRedemption
                paymentMethod
                payment.status
                status
                createdAt
                invoiceUrl
                rewardGiven
            `);

        // Add earned reward points
        const formattedOrders = orders.map((order) => {
            const rewardBaseAmount =
                order.subtotal -
                (order.discount || 0) -
                (order.rewardRedemption?.redeemedAmount || 0);

            const earnedRewardPoints = order.rewardGiven
                ? Math.floor(rewardBaseAmount * 0.04)
                : 0;

            return {
                ...order.toObject(),
                earnedRewardPoints,
            };
        });

        res.status(200).json({
            success: true,
            count: formattedOrders.length,
            orders: formattedOrders,
        });
    } catch (error) {
        console.error("getMyOrders", error);

        res.status(500).json({
            message: "Error while fetching orders",
        });
    }
};

/* ======================================================
   (USER) GET ORDER DETAILS
====================================================== */
export const getOrderDetails = async (req, res) => {
    try {
        const { orderId } = req.params;

        const order = await Order.findOne({
            _id: orderId,
        }).populate("items.product", "name images category");

        if (!order) {
            return res.status(404).json({
                message: "Order not found",
            });
        }

        // =====================================
        // CALCULATE EARNED REWARD POINTS
        // =====================================

        const rewardBaseAmount =
            order.subtotal -
            (order.discount || 0) -
            (order.rewardRedemption?.redeemedAmount || 0);

        const earnedRewardPoints = order.rewardGiven
            ? Math.floor(rewardBaseAmount * 0.04)
            : 0;

        // =====================================
        // RESPONSE
        // =====================================

        res.status(200).json({
            success: true,

            earnedRewardPoints,

            redeemedRewardPoints: order.rewardRedemption?.redeemedPoints || 0,

            order,
        });
    } catch (error) {
        console.error("getOrderDetails", error);

        res.status(500).json({
            message: "Error while fetching order details",
        });
    }
};

/* ======================================================
   (ADMIN) GET ALL ORDERS
====================================================== */
export const getAllOrdersAdmin = async (req, res) => {
    try {
        const { fulfillmentType, localStatus } = req.query;

        const filter = {};
        if (fulfillmentType) filter.fulfillmentType = fulfillmentType;
        if (localStatus) filter.localStatus = localStatus;

        const orders = await Order.find(filter)
            .populate("user", "full_name email rewardPoints")
            .sort({ createdAt: -1 });

        const formattedOrders = orders.map((order) => {
            const rewardBaseAmount =
                order.subtotal -
                (order.discount || 0) -
                (order.rewardRedemption?.redeemedAmount || 0);

            const earnedRewardPoints = order.rewardGiven
                ? Math.floor(rewardBaseAmount * 0.04)
                : 0;

            return {
                ...order.toObject(),
                earnedRewardPoints,
            };
        });

        res.status(200).json({
            success: true,
            count: formattedOrders.length,
            orders: formattedOrders,
        });
    } catch (error) {
        console.error("getAllOrdersAdmin", error);
        res.status(500).json({ message: "Error while fetching orders" });
    }
};

/* ======================================================
   (ADMIN) UPDATE ORDER STATUS
====================================================== */
export const updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const {
            status,

            trackingNumber,
            trackingUrl,
            courierName,
        } = req.body;

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                message: "Order not found",
            });
        }

        const statusFlow = {
            PAID: ["PROCESSING", "CANCELLED"],
            PROCESSING: ["SHIPPED", "CANCELLED"],
            SHIPPED: ["DELIVERED"],
            DELIVERED: [],
            CANCELLED: [],
        };

        if (!statusFlow[order.status]?.includes(status)) {
            return res.status(400).json({
                message: `Cannot change status from ${order.status} to ${status}`,
            });
        }

        /* =====================================
   SHIPPING VALIDATION
===================================== */

        if (status === "SHIPPED") {
            if (!trackingNumber || !courierName) {
                return res.status(400).json({
                    message: "Tracking number and courier name are required",
                });
            }
        }

        // =====================================
        // UPDATE STATUS
        // =====================================

        order.status = status;

        /* =====================================
   SHIPPING INFO
===================================== */

        if (status === "SHIPPED") {
            order.shiprocket = {
                ...order.shiprocket,

                trackingNumber,

                trackingUrl,

                courierName,

                shippedAt: new Date(),

                status: "SHIPPED",
            };
        }

        // =====================================
        // REWARD SYSTEM
        // =====================================

        if (status === "DELIVERED" && !order.rewardGiven) {
            const rewardBaseAmount = order.subtotal - (order.discount || 0);

            const rewardPoints = Math.floor(rewardBaseAmount * 0.04);

            if (rewardPoints > 0) {
                // Update user reward balance
                await User.findByIdAndUpdate(order.user, {
                    $inc: {
                        rewardPoints,
                        totalRewardEarned: rewardPoints,
                    },
                });

                // Create reward history
                await Reward.create({
                    userId: order.user,
                    orderId: order._id,
                    type: "earned",
                    points: rewardPoints,
                    description: `Reward earned from order ${order.orderNumber}`,
                });

                // Prevent duplicate rewards
                order.rewardGiven = true;
            }
        }

        /* =====================================
   SHIPPING EMAIL
===================================== */

        if (status === "SHIPPED") {
            try {
                await sendMail(
                    order.shippingAddress.email,

                    "Your Order Has Been Shipped 🚚",

                    baseEmailTemplate({
                        title: "Order Shipped Successfully",

                        subtitle: `Order #${order.orderNumber}`,

                        body: `
                    <p style="font-size:16px;color:#333;">
                        Great news! Your Paanshala order has been shipped.
                    </p>

                    <div style="background:#f5f5f5;padding:20px;border-radius:8px;margin:20px 0;">

                        <p style="margin:8px 0;">
                            <strong>Courier:</strong>
                            ${courierName}
                        </p>

                        <p style="margin:8px 0;">
                            <strong>Tracking Number:</strong>
                            ${trackingNumber}
                        </p>

                        ${
                            trackingUrl
                                ? `
                                <p style="margin-top:20px;">
                                    <a
                                        href="${trackingUrl}"
                                        style="
                                            background:#000;
                                            color:#fff;
                                            padding:12px 18px;
                                            border-radius:6px;
                                            text-decoration:none;
                                            display:inline-block;
                                        "
                                    >
                                        Track Shipment
                                    </a>
                                </p>
                            `
                                : ""
                        }
                    </div>

                    <p style="font-size:14px;color:#666;">
                        Thank you for choosing Paanshala ❤️
                    </p>
                `,
                    })
                );

                console.log("✓ Shipment email sent");
            } catch (emailError) {
                console.error("Shipment email failed:", emailError);
            }
        }

        await order.save();

        res.status(200).json({
            success: true,
            message: "Order status updated successfully",
            order,
        });
    } catch (error) {
        console.error("updateOrderStatus", error);

        res.status(500).json({
            message: "Error while updating order status",
        });
    }
};

/* ======================================================
   (ADMIN) UPDATE ORDER ADDRESS (SAFE VERSION)
====================================================== */
export const updateOrderAddress = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { billingAddress, shippingAddress } = req.body;

        const order = await Order.findById(orderId).populate("user");

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // Restrict updates after shipping
        if (["SHIPPED", "DELIVERED", "CANCELLED"].includes(order.status)) {
            return res.status(400).json({
                message: "Cannot update address after order is shipped",
            });
        }

        /* ── Validation ── */
        const validateAddress = (addr) => {
            if (addr.pincode && !/^\d{6}$/.test(addr.pincode)) {
                return "Invalid pincode";
            }
            if (addr.phone && !/^\d{10}$/.test(addr.phone)) {
                return "Invalid phone number";
            }
            return null;
        };

        /* ── Update billing address ── */
        if (billingAddress) {
            const error = validateAddress(billingAddress);
            if (error) {
                return res.status(400).json({ message: error });
            }
            order.billingAddress = {
                ...order.billingAddress.toObject(),
                ...billingAddress,
            };
        }

        /* ── Update shipping address ── */
        if (shippingAddress) {
            const error = validateAddress(shippingAddress);
            if (error) {
                return res.status(400).json({ message: error });
            }
            order.shippingAddress = {
                ...order.shippingAddress.toObject(),
                ...shippingAddress,
            };
        }

        await order.save();

        /* ── Sync to Shiprocket if order was sent there ──
              Only sync if:
              1. Order has a Shiprocket order ID
              2. Fulfillment type is not purely LOCAL
              3. Shiprocket status is not already SHIPPED
        ── */
        const shiprocketOrderId = order.shiprocket?.orderId;
        const shiprocketStatus = order.shiprocket?.status;
        const isShippableOrder = order.fulfillmentType !== "LOCAL";
        const notYetShipped = !["SHIPPED", "DELIVERED"].includes(
            shiprocketStatus
        );

        let shiprocketSyncResult = null;

        if (
            shiprocketOrderId &&
            isShippableOrder &&
            notYetShipped &&
            shippingAddress
        ) {
            try {
                shiprocketSyncResult = await updateShiprocketOrderAddress(
                    shiprocketOrderId,
                    order.shippingAddress // use the already-merged address
                );
                console.log("✓ Shiprocket address updated:", shiprocketOrderId);
            } catch (shiprocketError) {
                // Non-fatal — order address is updated in our DB regardless
                console.error(
                    "⚠️ Shiprocket address sync failed:",
                    shiprocketError.message
                );
                shiprocketSyncResult = { error: shiprocketError.message };
            }
        }

        await order.populate("user");

        res.status(200).json({
            success: true,
            message: "Order address updated successfully",
            order,
            shiprocket:
                shiprocketOrderId && isShippableOrder
                    ? {
                          synced:
                              shiprocketSyncResult &&
                              !shiprocketSyncResult.error,
                          message: shiprocketSyncResult?.error
                              ? `Address updated in our system but Shiprocket sync failed: ${shiprocketSyncResult.error}`
                              : "Address synced to Shiprocket successfully",
                      }
                    : {
                          synced: false,
                          message: "Order not on Shiprocket — no sync needed",
                      },
        });
    } catch (error) {
        console.error("updateOrderAddress", error);
        res.status(500).json({
            message: "Error while updating order address",
        });
    }
};

export const createCODOrder = async (req, res) => {
    try {
        const {
            billingAddressId,
            shippingAddressId,
            couponCode,
            redeemPoints = 0,
            scheduledDate,
            scheduledTime,
        } = req.body;

        /* ─────────────────────────────────────
           1. CHECK COD ENABLED
        ───────────────────────────────────── */
        const settings = await PageSettings.findOne();

        if (!settings?.codSettings?.enabled) {
            return res.status(400).json({
                message: "COD is currently disabled",
            });
        }

        const codCharge = settings.codSettings.charges || 0;

        /* ─────────────────────────────────────
           2. LOAD CART
        ───────────────────────────────────── */
        const cart = await Cart.findOne({
            user: req.user._id,
        }).populate("items.product");

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({
                message: "Cart is empty",
            });
        }

        /* ── Fetch user reward balance ── */
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        const { localItems, shippedItems, fulfillmentType } =
            await splitItemsByFulfillment(cart.items);

        if (localItems.length > 0 && (!scheduledDate || !scheduledTime)) {
            return res.status(400).json({
                message:
                    "Please select a delivery date and time for your paan order",
            });
        }

        const freeThreshold =
            settings?.shippingSettings?.freeShippingThreshold ?? 500;
        const standardCharges =
            settings?.shippingSettings?.standardCharges ?? 0;
        const shippingCharges =
            fulfillmentType === "LOCAL"
                ? 0
                : cart.subtotal >= freeThreshold
                  ? 0
                  : standardCharges;

        /* ─────────────────────────────────────
           3. VALIDATE STOCK
        ───────────────────────────────────── */
        for (const item of cart.items) {
            const product = item.product;

            // Variant products
            if (item.variantSetSize) {
                const variant = product.variants.find(
                    (v) => v.setSize === item.variantSetSize
                );

                if (!variant || variant.stock < item.quantity) {
                    return res.status(400).json({
                        message: `${product.name} is out of stock`,
                    });
                }
            }

            // Regular products
            else {
                if (product.stock < item.quantity) {
                    return res.status(400).json({
                        message: `${product.name} is out of stock`,
                    });
                }
            }
        }

        /* ─────────────────────────────────────
           4. LOAD ADDRESSES
        ───────────────────────────────────── */
        const [billing, shipping] = await Promise.all([
            Address.findById(billingAddressId),
            Address.findById(shippingAddressId),
        ]);

        if (!billing || !shipping) {
            return res.status(400).json({
                message: "Invalid address",
            });
        }

        /* ─────────────────────────────────────
           5. APPLY COUPON
        ───────────────────────────────────── */
        let discountAmount = 0;
        let appliedCoupon = null;

        if (couponCode) {
            const coupon = await Coupon.findOne({
                code: couponCode.toUpperCase(),
                isActive: true,
                expiryDate: { $gte: new Date() },
            });

            if (!coupon) {
                return res.status(400).json({
                    message: "Invalid or expired coupon",
                });
            }

            // Global usage limit
            if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
                return res.status(400).json({
                    message: "Coupon usage limit exceeded",
                });
            }

            // Per-user usage limit
            const existingUsage = await CouponUsage.findOne({
                couponId: coupon._id,
                userId: req.user._id,
            });

            if (
                existingUsage &&
                existingUsage.usedCount >= coupon.usagePerUser
            ) {
                return res.status(400).json({
                    message: "You have already used this coupon",
                });
            }

            appliedCoupon = coupon;

            // Calculate discount
            if (coupon.discountType === "percentage") {
                discountAmount = (cart.subtotal * coupon.discountValue) / 100;

                if (coupon.maxDiscount) {
                    discountAmount = Math.min(
                        discountAmount,
                        coupon.maxDiscount
                    );
                }
            } else {
                discountAmount = coupon.discountValue;
            }

            discountAmount = Math.min(discountAmount, cart.subtotal);
        }

        /* ─────────────────────────────────────
   VALIDATE REWARD REDEMPTION
───────────────────────────────────── */

        if (redeemPoints < 0) {
            return res.status(400).json({
                message: "Invalid reward points",
            });
        }

        // Optional minimum redemption
        if (redeemPoints > 0 && redeemPoints < 50) {
            return res.status(400).json({
                message: "Minimum 50 reward points required",
            });
        }

        // Check user balance
        const freshUser = await User.findById(req.user._id);

        if (redeemPoints > freshUser.rewardPoints) {
            return res.status(400).json({
                message: "Insufficient reward points",
            });
        }

        // Prevent over redemption
        const maxRedeemablePoints = Math.max(
            0,
            cart.subtotal - discountAmount - codCharge
        );

        if (redeemPoints > maxRedeemablePoints) {
            return res.status(400).json({
                message: `You can redeem maximum ${maxRedeemablePoints} points`,
            });
        }

        /* ─────────────────────────────────────
           6. FINAL AMOUNT
        ───────────────────────────────────── */
        const finalTotal =
            Math.max(0, cart.subtotal - discountAmount - redeemPoints) +
            codCharge +
            shippingCharges;

        if (finalTotal <= codCharge) {
            return res.status(400).json({
                message:
                    "Final payable amount must be greater than COD charges",
            });
        }

        /* ─────────────────────────────────────
           7. GENERATE ORDER NUMBER
        ───────────────────────────────────── */
        const year = new Date().getFullYear() % 100;

        const lastOrder = await Order.findOne({
            orderYear: year,
        })
            .sort({ orderSequence: -1 })
            .select("orderSequence");

        const nextSequence = lastOrder ? lastOrder.orderSequence + 1 : 1;

        const orderNumber = `PAAN-${year}-${String(nextSequence).padStart(
            2,
            "0"
        )}`;

        /* ─────────────────────────────────────
           8. CREATE ORDER
        ───────────────────────────────────── */
        const order = await Order.create({
            user: req.user._id,

            orderNumber,
            orderSequence: nextSequence,
            orderYear: year,

            items: cart.items.map((item) => ({
                product: item.product._id,
                name: item.product.name,
                image: item.product.images?.[0],
                variantSetSize: item.variantSetSize,
                quantity: item.quantity,
                price: item.price,
                totalPrice: item.totalPrice,
                fulfillmentType: localItems.some(
                    (l) =>
                        l.product._id.toString() === item.product._id.toString()
                )
                    ? "LOCAL"
                    : "SHIPPED",
            })),

            // Billing Snapshot
            billingAddress: {
                fullName: billing.fullName,
                companyName: billing.companyName,
                streetAddress: billing.streetAddress,
                landmark: billing.landmark,
                city: billing.city,
                state: billing.state,
                pincode: billing.pincode,
                phone: billing.phone,
                email: billing.email,
            },

            // Shipping Snapshot
            shippingAddress: {
                fullName: shipping.fullName,
                companyName: shipping.companyName,
                streetAddress: shipping.streetAddress,
                landmark: shipping.landmark,
                city: shipping.city,
                state: shipping.state,
                pincode: shipping.pincode,
                phone: shipping.phone,
                email: shipping.email,
            },

            ...(appliedCoupon && {
                coupon: {
                    couponId: appliedCoupon._id,
                    code: appliedCoupon.code,
                    discountAmount,
                },
            }),

            subtotal: cart.subtotal,
            discount: discountAmount,
            totalAmount: finalTotal,

            rewardRedemption: {
                redeemedPoints: redeemPoints,
                redeemedAmount: redeemPoints,
            },

            paymentMethod: "COD",

            codCharges: codCharge,

            payment: {
                status: "PENDING",
            },

            status: "PROCESSING",
        });

        console.log("✓ COD Order created:", order._id);

        /* ─────────────────────────────────────
   DEDUCT REWARD POINTS
───────────────────────────────────── */

        if (redeemPoints > 0) {
            const updatedUser = await User.findOneAndUpdate(
                {
                    _id: req.user._id,
                    rewardPoints: { $gte: redeemPoints },
                },
                {
                    $inc: {
                        rewardPoints: -redeemPoints,
                        totalRewardRedeemed: redeemPoints,
                    },
                },
                { new: true }
            );

            if (!updatedUser) {
                return res.status(400).json({
                    message: "Insufficient reward points during processing",
                });
            }

            await Reward.create({
                userId: req.user._id,
                orderId: order._id,
                type: "redeemed",
                points: redeemPoints,
                description: `Reward points redeemed on order ${order.orderNumber}`,
            });

            console.log("✓ Reward points redeemed:", redeemPoints);
        }

        /* ─────────────────────────────────────
           9. TRACK COUPON USAGE
        ───────────────────────────────────── */
        if (appliedCoupon) {
            await CouponUsage.findOneAndUpdate(
                {
                    couponId: appliedCoupon._id,
                    userId: req.user._id,
                },
                {
                    $inc: {
                        usedCount: 1,
                    },
                },
                {
                    upsert: true,
                    new: true,
                    setDefaultsOnInsert: true,
                }
            );

            await Coupon.findByIdAndUpdate(appliedCoupon._id, {
                $inc: {
                    usedCount: 1,
                },
            });

            console.log("✓ Coupon usage tracked:", appliedCoupon.code);
        }

        /* ─────────────────────────────────────
           10. DECREMENT STOCK
        ───────────────────────────────────── */
        try {
            await decrementStock(cart.items);

            console.log(
                "✓ Stock decremented for",
                cart.items.length,
                "item(s)"
            );
        } catch (stockError) {
            console.error("⚠️ Stock decrement failed:", stockError);
        }

        /* ─────────────────────────────────────
           11. CLEAR CART
        ───────────────────────────────────── */
        await Cart.findOneAndDelete({
            user: req.user._id,
        });

        console.log("✓ Cart cleared");

        /* ─────────────────────────────────────
   12. GENERATE & UPLOAD INVOICE
───────────────────────────────────── */
        let invoicePath = null;

        try {
            invoicePath = await generateInvoice(order);

            const uploadResult = await uploadPdfToCloudinary(
                invoicePath,
                order.orderNumber
            );

            order.invoiceUrl = uploadResult.secure_url;

            await order.save();

            console.log("✓ Invoice uploaded");
        } catch (invoiceError) {
            console.error("⚠️ Invoice generation/upload failed:", invoiceError);
        }

        /* ─────────────────────────────────────
   13. CREATE SHIPROCKET SHIPMENT
───────────────────────────────────── */
        if (fulfillmentType !== "LOCAL") {
            try {
                const shiprocketOrder =
                    fulfillmentType === "MIXED"
                        ? {
                              ...order.toObject(),
                              items: shippedItems.map((item) => ({
                                  name: item.product?.name || item.name,
                                  product: item.product?._id || item.product,
                                  variantSetSize: item.variantSetSize,
                                  quantity: item.quantity,
                                  price: item.price,
                                  totalPrice: item.totalPrice,
                              })),
                          }
                        : order;
                const shiprocketResponse =
                    await createShiprocketOrder(shiprocketOrder);
                order.shiprocket = {
                    orderId: shiprocketResponse.order_id,
                    shipmentId: shiprocketResponse.shipment_id,
                    status: "NEW",
                    raw: shiprocketResponse,
                };
                await order.save();
            } catch (err) {
                console.error("Shiprocket Error:", err.message);
            }
        }

        /* ─────────────────────────────────────
   14. SEND CONFIRMATION EMAIL
───────────────────────────────────── */
        try {
            await sendMail(
                user.email,

                "COD Order Confirmed – Paanshala",

                baseEmailTemplate({
                    title: "COD Order Confirmed! 🎉",

                    subtitle: `Order #${order.orderNumber}`,

                    body: `
                <p style="font-size:16px;color:#333;">
                    Thank you for your order! Your Cash on Delivery order has been confirmed.
                </p>

                <div style="background:#f0f0f0;padding:20px;border-radius:8px;margin:20px 0;">

                    <p style="margin:5px 0;">
                        <strong>Order Total:</strong>
                        ₹${order.totalAmount}
                    </p>

                    ${
                        order.coupon
                            ? `
                            <p style="margin:5px 0;">
                                <strong>Coupon Applied:</strong>
                                ${order.coupon.code}
                                (–₹${order.coupon.discountAmount})
                            </p>
                        `
                            : ""
                    }

                    <p style="margin:5px 0;">
                        <strong>Payment Method:</strong>
                        Cash on Delivery
                    </p>

                    <p style="margin:5px 0;">
                        <strong>Order Status:</strong>
                        ${order.status}
                    </p>
                </div>

                <p style="font-size:14px;color:#666;">
                    We'll notify you once your order is shipped.
                </p>
            `,
                }),

                invoicePath
                    ? [
                          {
                              filename: `invoice-${order.orderNumber}.pdf`,
                              path: invoicePath,
                          },
                      ]
                    : []
            );

            console.log("✓ COD confirmation email sent");
        } catch (emailError) {
            console.error("⚠️ COD email sending failed:", emailError);
        }

        /* ─────────────────────────────────────
   15. CLEANUP TEMP INVOICE FILE
───────────────────────────────────── */
        if (invoicePath && fs.existsSync(invoicePath)) {
            fs.unlinkSync(invoicePath);
        }

        /* ─────────────────────────────────────
           16. RESPONSE
        ───────────────────────────────────── */
        res.status(201).json({
            success: true,
            message: "COD Order placed successfully",
            order,
            earnedRewardEstimate: Math.floor(
                (cart.subtotal - discountAmount - redeemPoints) * 0.04
            ),
        });
    } catch (error) {
        console.error("createCODOrder", error);

        res.status(500).json({
            message: "Error creating COD order",
            error: error.message,
        });
    }
};

/* ======================================================
   (ADMIN) UPDATE LOCAL FULFILLMENT STATUS
====================================================== */
export const updateLocalOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { localStatus } = req.body;

        const validStatuses = [
            "PENDING",
            "CONFIRMED",
            "PREPARING",
            "READY",
            "DELIVERED",
            "CANCELLED",
        ];

        if (!validStatuses.includes(localStatus)) {
            return res.status(400).json({
                message: `Invalid local status. Must be one of: ${validStatuses.join(", ")}`,
            });
        }

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        if (!["LOCAL", "MIXED"].includes(order.fulfillmentType)) {
            return res.status(400).json({
                message: "This order does not have local fulfillment items",
            });
        }

        const localStatusFlow = {
            PENDING: ["CONFIRMED", "CANCELLED"],
            CONFIRMED: ["PREPARING", "CANCELLED"],
            PREPARING: ["READY", "CANCELLED"],
            READY: ["DELIVERED"],
            DELIVERED: [],
            CANCELLED: [],
        };

        if (!localStatusFlow[order.localStatus]?.includes(localStatus)) {
            return res.status(400).json({
                message: `Cannot change local status from ${order.localStatus} to ${localStatus}`,
            });
        }

        order.localStatus = localStatus;

        /* ── If local part delivered and it's a MIXED order,
              check if shipped part is also delivered
              then mark overall order as DELIVERED ── */
        if (localStatus === "DELIVERED") {
            if (order.fulfillmentType === "LOCAL") {
                // Pure local order — mark overall as delivered too
                order.status = "DELIVERED";

                // Give reward points
                if (!order.rewardGiven) {
                    const rewardBaseAmount =
                        order.subtotal - (order.discount || 0);
                    const rewardPoints = Math.floor(rewardBaseAmount * 0.04);

                    if (rewardPoints > 0) {
                        await User.findByIdAndUpdate(order.user, {
                            $inc: {
                                rewardPoints,
                                totalRewardEarned: rewardPoints,
                            },
                        });

                        await Reward.create({
                            userId: order.user,
                            orderId: order._id,
                            type: "earned",
                            points: rewardPoints,
                            description: `Reward earned from order ${order.orderNumber}`,
                        });

                        order.rewardGiven = true;
                    }
                }
            }
            // For MIXED — overall status stays until shipped part is also DELIVERED
            // Admin handles that via updateOrderStatus separately
        }

        /* ── If local part cancelled and it's a pure LOCAL order ── */
        if (localStatus === "CANCELLED" && order.fulfillmentType === "LOCAL") {
            order.status = "CANCELLED";
        }

        await order.save();

        await order.populate("user", "full_name email rewardPoints");

        /* ── Send email notification for key status changes ── */
        const notifyStatuses = ["CONFIRMED", "READY", "DELIVERED"];
        if (notifyStatuses.includes(localStatus)) {
            try {
                const emailSubjects = {
                    CONFIRMED: "Your Paan Order Has Been Confirmed 🎉",
                    READY: "Your Paan Order Is Ready! 🌿",
                    DELIVERED: "Your Paan Order Has Been Delivered ✅",
                };

                const emailMessages = {
                    CONFIRMED:
                        "Great news! Your paan order has been confirmed and we're preparing it for your scheduled time.",
                    READY: "Your paan order is ready! Our team will deliver it at your scheduled time.",
                    DELIVERED:
                        "Your paan order has been delivered. We hope you enjoy it!",
                };

                await sendMail(
                    order.shippingAddress.email,
                    emailSubjects[localStatus],
                    baseEmailTemplate({
                        title: emailSubjects[localStatus],
                        subtitle: `Order #${order.orderNumber}`,
                        body: `
                            <p style="font-size:16px;color:#333;">
                                ${emailMessages[localStatus]}
                            </p>
                            <div style="background:#f0f0f0;padding:20px;border-radius:8px;margin:20px 0;">
                                <p style="margin:5px 0;">
                                    <strong>Order:</strong> #${order.orderNumber}
                                </p>
                                <p style="margin:5px 0;">
                                    <strong>Scheduled Date:</strong> ${order.scheduledDate}
                                </p>
                                <p style="margin:5px 0;">
                                    <strong>Scheduled Time:</strong> ${order.scheduledTime}
                                </p>
                                <p style="margin:5px 0;">
                                    <strong>Status:</strong> ${localStatus}
                                </p>
                            </div>
                            <p style="font-size:14px;color:#666;">
                                Thank you for choosing Paanshala ❤️
                            </p>
                        `,
                    })
                );
                console.log(`✓ Local status email sent: ${localStatus}`);
            } catch (emailError) {
                console.error("⚠️ Local status email failed:", emailError);
            }
        }

        res.status(200).json({
            success: true,
            message: "Local fulfillment status updated",
            order,
        });
    } catch (error) {
        console.error("updateLocalOrderStatus", error);
        res.status(500).json({
            message: "Error updating local order status",
        });
    }
};

/* ======================================================
   (ADMIN) EXPORT ORDERS CSV
====================================================== */
export const exportOrders = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const filter = {};

        // Date Filter (Order Created Date)
        if (startDate || endDate) {
            filter.createdAt = {};

            if (startDate) {
                filter.createdAt.$gte = new Date(
                    `${startDate}T00:00:00.000Z`
                );
            }

            if (endDate) {
                filter.createdAt.$lte = new Date(
                    `${endDate}T23:59:59.999Z`
                );
            }
        }

        const orders = await Order.find(filter)
            .populate("user", "full_name email")
            .sort({ createdAt: -1 });

        if (orders.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No orders found for the selected date range.",
            });
        }

        const rows = orders.map((order) => ({
            "Order Number": order.orderNumber,

            "Order Date": new Date(order.createdAt).toLocaleString("en-IN"),

            Customer: order.user?.full_name || "",

            Email:
                order.shippingAddress?.email ||
                order.user?.email ||
                "",

            Phone: order.shippingAddress?.phone || "",

            Status: order.status,

            "Local Status": order.localStatus || "",

            Fulfillment: order.fulfillmentType,

            "Payment Method": order.paymentMethod,

            "Payment Status": order.payment?.status || "",

            Subtotal: order.subtotal,

            Discount: order.discount || 0,

            Shipping: order.shippingCharges || 0,

            COD: order.codCharges || 0,

            Total: order.totalAmount,

            Coupon: order.coupon?.code || "",

            "Reward Redeemed":
                order.rewardRedemption?.redeemedPoints || 0,

            "Reward Earned": order.rewardGiven
                ? Math.floor(
                      (order.subtotal -
                          (order.discount || 0) -
                          (order.rewardRedemption?.redeemedAmount || 0)) *
                          0.04
                  )
                : 0,

            Items: order.items
                .map((item) => `${item.name} x${item.quantity}`)
                .join(" | "),

            Quantity: order.items.reduce(
                (sum, item) => sum + item.quantity,
                0
            ),

            Address: [
                order.shippingAddress?.streetAddress,
                order.shippingAddress?.landmark,
            ]
                .filter(Boolean)
                .join(", "),

            City: order.shippingAddress?.city || "",

            State: order.shippingAddress?.state || "",

            Pincode: order.shippingAddress?.pincode || "",

            Courier: order.shiprocket?.courierName || "",

            "Tracking Number":
                order.shiprocket?.trackingNumber || "",

            "Scheduled Date": order.scheduledDate || "",

            "Scheduled Time": order.scheduledTime || "",

            Invoice: order.invoiceUrl || "",
        }));

        const parser = new Parser({
            fields: [
                "Order Number",
                "Order Date",
                "Customer",
                "Email",
                "Phone",
                "Status",
                "Local Status",
                "Fulfillment",
                "Payment Method",
                "Payment Status",
                "Subtotal",
                "Discount",
                "Shipping",
                "COD",
                "Total",
                "Coupon",
                "Reward Redeemed",
                "Reward Earned",
                "Items",
                "Quantity",
                "Address",
                "City",
                "State",
                "Pincode",
                "Courier",
                "Tracking Number",
                "Scheduled Date",
                "Scheduled Time",
                "Invoice",
            ],
        });

        const csv = parser.parse(rows);

        const fileName =
            startDate || endDate
                ? `orders_${startDate || "start"}_to_${endDate || "today"}.csv`
                : `orders_${new Date().toISOString().slice(0, 10)}.csv`;

        res.setHeader("Content-Type", "text/csv");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${fileName}"`
        );

        return res.status(200).send(csv);
    } catch (error) {
        console.error("exportOrders", error);

        return res.status(500).json({
            success: false,
            message: "Error exporting orders.",
        });
    }
};
