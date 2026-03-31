import crypto from "crypto";
import { razorpay } from "../utils/razorpay.js";
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
import fs from "fs";

/* ======================================================
   CREATE RAZORPAY PAYMENT ORDER
====================================================== */
export const createPaymentOrder = async (req, res) => {
    try {
        const { couponCode } = req.body;

        const cart = await Cart.findOne({ user: req.user._id });

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: "Cart is empty" });
        }

        if (cart.subtotal <= 0) {
            return res.status(400).json({ message: "Invalid cart amount" });
        }

        /* ── Apply coupon discount to get correct Razorpay amount ── */
        let discountAmount = 0;

        if (couponCode) {
            const coupon = await Coupon.findOne({
                code: couponCode.toUpperCase(),
                isActive: true,
                expiryDate: { $gte: new Date() },
            });

            if (coupon) {
                if (coupon.discountType === "percentage") {
                    discountAmount =
                        (cart.subtotal * coupon.discountValue) / 100;
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
        }

        const chargeAmount = Math.max(0, cart.subtotal - discountAmount);

        const razorpayOrder = await razorpay.orders.create({
            amount: Math.round(chargeAmount * 100), // INR → paise
            currency: "INR",
            receipt: `order_${Date.now()}`,
        });

        res.status(200).json({ success: true, razorpayOrder });
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

        const finalTotal = Math.max(0, cart.subtotal - discountAmount);

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
            })),

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

            payment: {
                razorpayOrderId: razorpay_order_id,
                razorpayPaymentId: razorpay_payment_id,
                razorpaySignature: razorpay_signature,
                status: "PAID",
            },

            status: "PAID",
        });

        console.log("✓ Order created:", order._id);

        /* ── 7. Decrement product stock ── */
        try {
            for (const item of cart.items) {
                const product = item.product;
                const qty = item.quantity;

                if (item.variantSetSize) {
                    // Paan product — decrement matching variant stock
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
                    // Regular product — decrement top-level stock (floor at 0)
                    await Product.updateOne(
                        { _id: product._id },
                        { $inc: { stock: -qty } }
                    );
                }
            }
            console.log(
                "✓ Stock decremented for",
                cart.items.length,
                "item(s)"
            );
        } catch (stockError) {
            // Non-fatal — order is already created and paid
            console.error("⚠️ Stock decrement failed:", stockError);
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
export const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .select(
                "orderNumber items totalAmount discount coupon status createdAt invoiceUrl"
            );

        res.status(200).json({
            success: true,
            count: orders.length,
            orders,
        });
    } catch (error) {
        console.error("getMyOrders", error);
        res.status(500).json({ message: "Error while fetching orders" });
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
            user: req.user._id,
        }).populate("items.product", "name images category");

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.status(200).json({ success: true, order });
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
        const orders = await Order.find()
            .populate("user", "full_name email")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: orders.length,
            orders,
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
        const { status } = req.body;

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
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

        order.status = status;
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