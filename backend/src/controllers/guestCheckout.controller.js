import crypto from "crypto";
import bcrypt from "bcryptjs";
import { razorpay } from "../utils/razorpay.js";
import { Order } from "../models/order.model.js";
import { User } from "../models/user.model.js";
import { Address } from "../models/address.model.js";
import { Product } from "../models/product.model.js";
import { Coupon } from "../models/coupon.model.js";
import { CouponUsage } from "../models/couponUsage.model.js";
import { generateInvoice } from "../utils/invoiceGenerator.js";
import { uploadPdfToCloudinary } from "../utils/cloudinary.js";
import { sendMail } from "../utils/sendMail.js";
import { baseEmailTemplate } from "../utils/emailTemplate.js";
import fs from "fs";

/* ======================================================
   GUEST CHECKOUT — STEP 1
   Create Razorpay order from guest cart items
====================================================== */
export const guestCreatePaymentOrder = async (req, res) => {
    try {
        const { items, couponCode } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ message: "Cart is empty" });
        }

        /* ── Compute subtotal from guest items ── */
        let subtotal = 0;
        for (const item of items) {
            // Verify price server-side against DB (security: don't trust client price)
            const product = await Product.findById(item.productId);
            if (!product) continue;

            let unitPrice = 0;
            if (item.variantSetSize) {
                const variant = product.variants?.find(
                    (v) => v.setSize === item.variantSetSize
                );
                unitPrice = variant?.discountedPrice || 0;
            } else {
                unitPrice = product.discountedPrice || 0;
            }

            subtotal += unitPrice * item.quantity;
        }

        /* ── Coupon ── */
        let discountAmount = 0;
        if (couponCode) {
            const coupon = await Coupon.findOne({
                code: couponCode.toUpperCase(),
                isActive: true,
                expiryDate: { $gte: new Date() },
            });

            if (coupon && subtotal >= (coupon.minCartValue || 0)) {
                if (coupon.discountType === "percentage") {
                    discountAmount = (subtotal * coupon.discountValue) / 100;
                    if (coupon.maxDiscount)
                        discountAmount = Math.min(
                            discountAmount,
                            coupon.maxDiscount
                        );
                } else {
                    discountAmount = coupon.discountValue;
                }
                discountAmount = Math.min(discountAmount, subtotal);
            }
        }

        const chargeAmount = Math.max(0, subtotal - discountAmount);

        if (chargeAmount <= 0) {
            return res.status(400).json({ message: "Invalid cart amount" });
        }

        const razorpayOrder = await razorpay.orders.create({
            amount: Math.round(chargeAmount * 100),
            currency: "INR",
            receipt: `guest_${Date.now()}`,
        });

        return res
            .status(200)
            .json({ success: true, razorpayOrder, subtotal, discountAmount });
    } catch (error) {
        console.error("guestCreatePaymentOrder", error);
        return res
            .status(500)
            .json({ message: "Error creating payment order" });
    }
};

/* ======================================================
   GUEST CHECKOUT — STEP 2
   Verify payment, create/find account, save address, place order
====================================================== */
export const guestVerifyAndCreateOrder = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            /* guest items array */
            items,
            /* address fields (flat) */
            fullName,
            companyName,
            streetAddress,
            landmark,
            city,
            state,
            pincode,
            phone,
            email,
            /* optional coupon */
            couponCode,
        } = req.body;

        /* ── 1. Verify Razorpay signature ── */
        const body = `${razorpay_order_id}|${razorpay_payment_id}`;
        const expectedSig = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest("hex");

        if (expectedSig !== razorpay_signature) {
            return res
                .status(400)
                .json({ message: "Payment verification failed" });
        }

        /* ── 2. Create or find user account by email ── */
        let user = await User.findOne({ email: email.toLowerCase() });
        let isNewUser = false;

        if (!user) {
            // Auto-create account with a random password
            // User can reset it later via "Forgot Password"
            const tempPassword = crypto.randomBytes(10).toString("hex");
            const hashedPassword = await bcrypt.hash(tempPassword, 10);

            user = await User.create({
                full_name: fullName,
                email: email.toLowerCase(),
                password: hashedPassword,
                phone: phone,
                isVerified: true, // auto-verify guest accounts
            });

            isNewUser = true;
            console.log("✓ Guest account created:", user._id);
        }

        /* ── 3. Save address for the user ── */
        const address = await Address.create({
            user: user._id,
            fullName,
            companyName,
            streetAddress,
            landmark,
            city,
            state,
            pincode,
            phone,
            email,
            isDefault: true,
        });

        /* ── 4. Re-verify prices server-side & build order items ── */
        let subtotal = 0;
        const orderItems = [];

        for (const item of items) {
            const product = await Product.findById(item.productId);
            if (!product) continue;

            let unitPrice = 0;
            if (item.variantSetSize) {
                const variant = product.variants?.find(
                    (v) => v.setSize === item.variantSetSize
                );
                unitPrice = variant?.discountedPrice || 0;
            } else {
                unitPrice = product.discountedPrice || 0;
            }

            const itemTotal = unitPrice * item.quantity;
            subtotal += itemTotal;

            orderItems.push({
                product: product._id,
                name: product.name,
                image: product.images?.[0],
                variantSetSize: item.variantSetSize || null,
                quantity: item.quantity,
                price: unitPrice,
                totalPrice: itemTotal,
            });
        }

        /* ── 5. Resolve coupon ── */
        let appliedCoupon = null;
        let discountAmount = 0;

        if (couponCode) {
            const coupon = await Coupon.findOne({
                code: couponCode.toUpperCase(),
                isActive: true,
                expiryDate: { $gte: new Date() },
            });

            if (coupon) {
                const existingUsage = await CouponUsage.findOne({
                    couponId: coupon._id,
                    userId: user._id,
                });

                const withinUserLimit =
                    !existingUsage ||
                    existingUsage.usedCount < coupon.usagePerUser;
                const withinGlobalLimit =
                    !coupon.usageLimit || coupon.usedCount < coupon.usageLimit;

                if (withinUserLimit && withinGlobalLimit) {
                    appliedCoupon = coupon;
                    if (coupon.discountType === "percentage") {
                        discountAmount =
                            (subtotal * coupon.discountValue) / 100;
                        if (coupon.maxDiscount)
                            discountAmount = Math.min(
                                discountAmount,
                                coupon.maxDiscount
                            );
                    } else {
                        discountAmount = coupon.discountValue;
                    }
                    discountAmount = Math.min(discountAmount, subtotal);
                }
            }
        }

        const finalTotal = Math.max(0, subtotal - discountAmount);

        /* ── 6. Generate order number ── */
        const year = new Date().getFullYear() % 100;
        const lastOrder = await Order.findOne({ orderYear: year })
            .sort({ orderSequence: -1 })
            .select("orderSequence");

        const nextSequence = lastOrder ? lastOrder.orderSequence + 1 : 1;
        const orderNumber = `PAAN-${year}-${String(nextSequence).padStart(2, "0")}`;

        /* ── 7. Create order ── */
        const addrSnapshot = {
            fullName,
            companyName,
            streetAddress,
            landmark,
            city,
            state,
            pincode,
            phone,
            email,
        };

        const order = await Order.create({
            user: user._id,
            orderNumber,
            orderSequence: nextSequence,
            orderYear: year,
            items: orderItems,
            billingAddress: addrSnapshot,
            shippingAddress: addrSnapshot,
            ...(appliedCoupon && {
                coupon: {
                    couponId: appliedCoupon._id,
                    code: appliedCoupon.code,
                    discountAmount,
                },
            }),
            subtotal,
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

        console.log("✓ Guest order created:", order._id);

        /* ── 8. Decrement stock ── */
        try {
            for (const item of orderItems) {
                if (item.variantSetSize) {
                    await Product.updateOne(
                        {
                            _id: item.product,
                            "variants.setSize": item.variantSetSize,
                        },
                        { $inc: { "variants.$.stock": -item.quantity } }
                    );
                } else {
                    await Product.updateOne(
                        { _id: item.product },
                        { $inc: { stock: -item.quantity } }
                    );
                }
            }
        } catch (e) {
            console.error("⚠️ Stock decrement failed:", e);
        }

        /* ── 9. Track coupon usage ── */
        if (appliedCoupon) {
            await CouponUsage.findOneAndUpdate(
                { couponId: appliedCoupon._id, userId: user._id },
                { $inc: { usedCount: 1 } },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
            await Coupon.findByIdAndUpdate(appliedCoupon._id, {
                $inc: { usedCount: 1 },
            });
        }

        /* ── 10. Invoice ── */
        let invoicePath = null;
        try {
            invoicePath = await generateInvoice(order);
            const upload = await uploadPdfToCloudinary(
                invoicePath,
                order.orderNumber
            );
            order.invoiceUrl = upload.secure_url;
            await order.save();
        } catch (e) {
            console.error("⚠️ Invoice failed:", e);
        }

        /* ── 11. Welcome + order email ── */
        try {
            await sendMail(
                email,
                isNewUser
                    ? "Welcome to Paanshala + Order Confirmed 🎉"
                    : "Order Confirmed – Paanshala",
                baseEmailTemplate({
                    title: "Order Confirmed! 🎉",
                    subtitle: `Order #${order.orderNumber}`,
                    body: `
            ${
                isNewUser
                    ? `
              <div style="background:#f0f7ed;padding:16px;border-radius:8px;margin-bottom:20px;border-left:4px solid #2d5016;">
                <p style="margin:0;font-size:15px;color:#2d5016;font-weight:600;">Welcome to Paanshala!</p>
                <p style="margin:8px 0 0;font-size:14px;color:#555;">
                  Your account has been created. You can
                  <a href="${process.env.NEXT_PUBLIC_URL}/forgot-password" style="color:#2d5016;">reset your password</a>
                  to access your account and track orders.
                </p>
              </div>`
                    : ""
            }
            <p style="font-size:16px;color:#333;">Thank you for your order!</p>
            <div style="background:#f0f0f0;padding:20px;border-radius:8px;margin:20px 0;">
              <p style="margin:5px 0;"><strong>Order Total:</strong> ₹${order.totalAmount}</p>
              ${order.coupon ? `<p style="margin:5px 0;"><strong>Coupon:</strong> ${order.coupon.code} (–₹${order.coupon.discountAmount})</p>` : ""}
              <p style="margin:5px 0;"><strong>Status:</strong> ${order.status}</p>
            </div>
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
        } catch (e) {
            console.error("⚠️ Email failed:", e);
        }

        if (invoicePath && fs.existsSync(invoicePath))
            fs.unlinkSync(invoicePath);

        return res.status(201).json({
            success: true,
            message: "Order placed successfully",
            order,
            isNewUser,
            userId: user._id,
        });
    } catch (error) {
        console.error("guestVerifyAndCreateOrder", error);
        return res.status(500).json({
            message: "Error placing order",
            error: error.message,
        });
    }
};
