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
import { createShiprocketOrder } from "../services/shiprocket.service.js";
import { PageSettings } from "../models/pageSettings.model.js";
import { Category } from "../models/category.model.js"; // ← add
import fs from "fs";
import { notifyAdminsNewOrder } from "../utils/sendAdminOrderNotification.js";

/* ======================================================
   HELPER: Split order items into LOCAL vs SHIPPED
====================================================== */
const splitGuestItemsByFulfillment = async (orderItems) => {
    const localItems = [];
    const shippedItems = [];

    for (const item of orderItems) {
        const productDoc = await Product.findById(item.product)
            .populate("category")
            .populate("parentCategory");

        let requiresScheduling = false;

        if (productDoc?.category) {
            const cat = await Category.findById(
                productDoc.category._id || productDoc.category
            ).select("requiresScheduling");
            if (cat?.requiresScheduling) requiresScheduling = true;
        }

        if (!requiresScheduling && productDoc?.parentCategory) {
            const pCat = await Category.findById(
                productDoc.parentCategory._id || productDoc.parentCategory
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
   GUEST CHECKOUT — STEP 1
   Create Razorpay order from guest cart items
====================================================== */
export const guestCreatePaymentOrder = async (req, res) => {
    try {
        const {
            items,
            couponCode,
            fullName,
            companyName,
            streetAddress,
            landmark,
            city,
            state,
            pincode,
            phone,
            email,
            scheduledDate,
            scheduledTime,
        } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ message: "Cart is empty" });
        }
        if (
            !fullName ||
            !phone ||
            !email ||
            !streetAddress ||
            !city ||
            !state ||
            !pincode
        ) {
            return res
                .status(400)
                .json({ message: "Please fill all required checkout details" });
        }

        /* ── Create or find guest account ── */
        let user = await User.findOne({ email: email.toLowerCase(), phone });
        let isNewUser = false;
        if (!user) {
            const tempPassword = crypto.randomBytes(10).toString("hex");
            const hashedPassword = await bcrypt.hash(tempPassword, 10);
            user = await User.create({
                full_name: fullName,
                email: email.toLowerCase(),
                password: hashedPassword,
                phone,
                isVerified: true,
            });
            isNewUser = true;
            console.log("✓ Guest account created:", user._id);
        }

        /* ── Save address ── */
        await Address.create({
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

        /* ── Build order items ── */
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

        const { localItems, fulfillmentType } =
            await splitGuestItemsByFulfillment(orderItems);

        if (localItems.length > 0 && (!scheduledDate || !scheduledTime)) {
            return res.status(400).json({
                message:
                    "Please select a delivery date and time for your paan order",
            });
        }

        /* ── Coupon ── */
        let appliedCoupon = null;
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
                appliedCoupon = coupon;
            }
        }

        /* ── Shipping ── */
        const pageSettings = await PageSettings.findOne();
        const freeThreshold =
            pageSettings?.shippingSettings?.freeShippingThreshold ?? 500;
        const standardCharges =
            pageSettings?.shippingSettings?.standardCharges ?? 0;
        const shippingCharges =
            fulfillmentType === "LOCAL"
                ? 0
                : subtotal >= freeThreshold
                  ? 0
                  : standardCharges;

        const chargeAmount = Math.max(
            0,
            subtotal - discountAmount + shippingCharges
        );
        if (chargeAmount <= 0) {
            return res.status(400).json({ message: "Invalid cart amount" });
        }

        const razorpayOrder = await razorpay.orders.create({
            amount: Math.round(chargeAmount * 100),
            currency: "INR",
            receipt: `guest_${Date.now()}`,
        });

        /* ── Order number ── */
        const year = new Date().getFullYear() % 100;
        const lastOrder = await Order.findOne({ orderYear: year })
            .sort({ orderSequence: -1 })
            .select("orderSequence");
        const nextSequence = lastOrder ? lastOrder.orderSequence + 1 : 1;
        const orderNumber = `PAAN-${year}-${String(nextSequence).padStart(2, "0")}`;

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

        /* ── Create pending order (remarketing record) ──
           status defaults to "PENDING_PAYMENT", payment.status defaults to "PENDING" */
        const order = await Order.create({
            user: user._id,
            orderNumber,
            orderSequence: nextSequence,
            orderYear: year,

            items: orderItems.map((item) => ({
                ...item,
                fulfillmentType: localItems.some(
                    (l) => l.product.toString() === item.product.toString()
                )
                    ? "LOCAL"
                    : "SHIPPED",
            })),

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
            shippingCharges,
            totalAmount: chargeAmount,

            fulfillmentType,
            scheduledDate: localItems.length > 0 ? scheduledDate : null,
            scheduledTime: localItems.length > 0 ? scheduledTime : null,
            localStatus: localItems.length > 0 ? "PENDING" : undefined,

            paymentMethod: "ONLINE",
            payment: {
                razorpayOrderId: razorpayOrder.id,
                // status left unset → defaults to "PENDING"
            },
            // status left unset → defaults to "PENDING_PAYMENT"
        });

        console.log(
            "✓ Pending guest order recorded for remarketing:",
            order._id
        );

        return res.status(200).json({
            success: true,
            razorpayOrder,
            orderId: order._id,
            userId: user._id,
            isNewUser,
            subtotal,
            discountAmount,
            shippingCharges,
        });
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
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
            req.body;

        /* ── 1. Verify signature ── */
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

        /* ── 2. Find the pending order created in Step 1 ── */
        const order = await Order.findOne({
            "payment.razorpayOrderId": razorpay_order_id,
        });
        if (!order) {
            return res
                .status(404)
                .json({ message: "Order not found for this payment" });
        }
        if (order.status === "PAID" || order.payment?.status === "PAID") {
            return res.status(200).json({
                success: true,
                message: "Order already confirmed",
                order,
            });
        }

        const user = await User.findById(order.user);
        if (!user) return res.status(404).json({ message: "User not found" });

        /* ── 3. Re-validate stock (using saved order items) ── */
        for (const item of order.items) {
            const product = await Product.findById(item.product);
            if (!product) continue;
            if (item.variantSetSize) {
                const variant = product.variants?.find(
                    (v) => v.setSize === item.variantSetSize
                );
                if (!variant || variant.stock < item.quantity) {
                    return res
                        .status(400)
                        .json({ message: `${product.name} is out of stock` });
                }
            } else if (product.stock < item.quantity) {
                return res
                    .status(400)
                    .json({ message: `${product.name} is out of stock` });
            }
        }

        /* ── 4. Finalize ── */
        order.payment.razorpayPaymentId = razorpay_payment_id;
        order.payment.razorpaySignature = razorpay_signature;
        order.payment.status = "PAID";
        order.status = "PAID";
        await order.save();

        console.log("✓ Guest order finalized:", order._id);

        /* ── Decrement stock (only now) ── */
        try {
            for (const item of order.items) {
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
            console.log("✓ Stock decremented");
        } catch (e) {
            console.error("Stock decrement failed:", e);
        }

        /* ── Coupon usage ── */
        if (order.coupon?.couponId) {
            await CouponUsage.findOneAndUpdate(
                { couponId: order.coupon.couponId, userId: user._id },
                { $inc: { usedCount: 1 } },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
            await Coupon.findByIdAndUpdate(order.coupon.couponId, {
                $inc: { usedCount: 1 },
            });
        }

        /* ── Invoice ── */
        let invoicePath = null;
        try {
            invoicePath = await generateInvoice(order);
            const upload = await uploadPdfToCloudinary(
                invoicePath,
                order.orderNumber
            );
            order.invoiceUrl = upload.secure_url;
            await order.save();
            console.log("✓ Invoice uploaded");
        } catch (e) {
            console.error("Invoice failed:", e);
        }

        /* ── Shiprocket ── */
        const { shippedItems, fulfillmentType } =
            await splitGuestItemsByFulfillment(order.items);
        if (fulfillmentType !== "LOCAL") {
            try {
                const shiprocketOrder =
                    fulfillmentType === "MIXED"
                        ? {
                              ...order.toObject(),
                              items: shippedItems.map((item) => ({
                                  name: item.name,
                                  product: item.product,
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
                console.log("✓ Guest Shiprocket created");
            } catch (shiprocketError) {
                console.error("Shiprocket Error:", shiprocketError.message);
            }
        } else {
            console.log("⏭ Skipping Shiprocket — LOCAL fulfillment order");
        }

        /* ── Email ── */
        try {
            await sendMail(
                order.shippingAddress.email,
                isNewUserEmail(user) // see note below — or just use a static subject
                    ? "Welcome to Paanshala + Order Confirmed 🎉"
                    : "Order Confirmed – Paanshala",
                baseEmailTemplate({
                    title: "Order Confirmed! 🎉",
                    subtitle: `Order #${order.orderNumber}`,
                    body: `
                        <p style="font-size:16px;color:#333;">Your order has been confirmed.</p>
                        <div style="background:#f0f0f0;padding:20px;border-radius:8px;margin:20px 0;">
                            <p style="margin:5px 0;"><strong>Order Total:</strong> ₹${order.totalAmount}</p>
                            ${order.coupon ? `<p style="margin:5px 0;"><strong>Coupon:</strong> ${order.coupon.code} (–₹${order.coupon.discountAmount})</p>` : ""}
                            <p style="margin:5px 0;"><strong>Payment Status:</strong> ${order.payment.status}</p>
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
            await notifyAdminsNewOrder(order);
            console.log("✓ Guest email sent");
        } catch (emailError) {
            console.error("Guest email failed:", emailError);
        }

        if (invoicePath && fs.existsSync(invoicePath))
            fs.unlinkSync(invoicePath);

        return res.status(201).json({
            success: true,
            message: "Order placed successfully",
            order,
            userId: user._id,
        });
    } catch (error) {
        console.error("guestVerifyAndCreateOrder", error);
        return res
            .status(500)
            .json({ message: "Error placing order", error: error.message });
    }
};

/* ======================================================
   GUEST COD ORDER
====================================================== */
export const guestCreateCODOrder = async (req, res) => {
    try {
        const {
            items,
            fullName,
            companyName,
            streetAddress,
            landmark,
            city,
            state,
            pincode,
            phone,
            email,
            couponCode,
            scheduledDate, // ← new
            scheduledTime, // ← new
        } = req.body;

        /* ── 1. Basic validations ── */
        if (!items || items.length === 0) {
            return res.status(400).json({ message: "Cart is empty" });
        }

        if (
            !fullName ||
            !streetAddress ||
            !city ||
            !state ||
            !pincode ||
            !phone ||
            !email
        ) {
            return res
                .status(400)
                .json({ message: "All address fields are required" });
        }

        /* ── 2. Check COD enabled ── */
        const settings = await PageSettings.findOne();
        if (!settings?.codSettings?.enabled) {
            return res
                .status(400)
                .json({ message: "Cash on Delivery is currently unavailable" });
        }
        const codCharges = settings.codSettings.charges || 0;

        /* ── 3. Create / find user ── */
        let user = await User.findOne({
            email: email.toLowerCase(),
            phone: phone,
        });
        let isNewUser = false;

        if (!user) {
            const tempPassword = crypto.randomBytes(10).toString("hex");
            const hashedPassword = await bcrypt.hash(tempPassword, 10);

            user = await User.create({
                full_name: fullName,
                email: email.toLowerCase(),
                password: hashedPassword,
                phone,
                isVerified: true,
            });

            isNewUser = true;
            console.log("✓ Guest COD account created:", user._id);
        }

        /* ── 4. Save address ── */
        const existingAddress = await Address.findOne({ user: user._id });
        await Address.create({
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
            isDefault: !existingAddress,
        });

        /* ── 5. Validate stock ── */
        for (const item of items) {
            const product = await Product.findById(item.productId);
            if (!product) {
                return res.status(400).json({ message: "Product not found" });
            }

            if (item.variantSetSize) {
                const variant = product.variants?.find(
                    (v) => v.setSize === item.variantSetSize
                );
                if (!variant || variant.stock < item.quantity) {
                    return res
                        .status(400)
                        .json({ message: `${product.name} is out of stock` });
                }
            } else {
                if (product.stock < item.quantity) {
                    return res
                        .status(400)
                        .json({ message: `${product.name} is out of stock` });
                }
            }
        }

        /* ── 6. Build order items ── */
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

        /* ── 7. Split by fulfillment type ── */
        const { localItems, shippedItems, fulfillmentType } =
            await splitGuestItemsByFulfillment(orderItems);

        /* ── 8. Validate scheduling if local items exist ── */
        if (localItems.length > 0 && (!scheduledDate || !scheduledTime)) {
            return res.status(400).json({
                message:
                    "Please select a delivery date and time for your paan order",
            });
        }

        /* ── 9. Shipping charges ── */
        const freeThreshold =
            settings?.shippingSettings?.freeShippingThreshold ?? 500;
        const standardCharges =
            settings?.shippingSettings?.standardCharges ?? 0;
        const shippingCharges =
            fulfillmentType === "LOCAL"
                ? 0
                : subtotal >= freeThreshold
                  ? 0
                  : standardCharges;

        /* ── 10. Coupon ── */
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

        /* ── 11. Final total ── */
        const finalTotal = Math.max(
            0,
            subtotal - discountAmount + shippingCharges + codCharges
        );

        /* ── 12. Order number ── */
        const year = new Date().getFullYear() % 100;
        const lastOrder = await Order.findOne({ orderYear: year })
            .sort({ orderSequence: -1 })
            .select("orderSequence");

        const nextSequence = lastOrder ? lastOrder.orderSequence + 1 : 1;
        const orderNumber = `PAAN-${year}-${String(nextSequence).padStart(2, "0")}`;

        /* ── 13. Address snapshot ── */
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

        /* ── 14. Create order ── */
        const order = await Order.create({
            user: user._id,
            orderNumber,
            orderSequence: nextSequence,
            orderYear: year,

            items: orderItems.map((item) => ({
                ...item,
                fulfillmentType: localItems.some(
                    (l) => l.product.toString() === item.product.toString()
                )
                    ? "LOCAL"
                    : "SHIPPED",
            })),

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
            shippingCharges,
            codCharges,
            totalAmount: finalTotal,

            fulfillmentType,
            scheduledDate: localItems.length > 0 ? scheduledDate : null,
            scheduledTime: localItems.length > 0 ? scheduledTime : null,
            localStatus: localItems.length > 0 ? "PENDING" : undefined,

            paymentMethod: "COD",
            payment: { status: "PENDING" },
            status: "PROCESSING",
        });

        console.log("✓ Guest COD order created:", order._id);

        /* ── 15. Decrement stock ── */
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
            console.log("✓ Stock decremented");
        } catch (stockError) {
            console.error("⚠️ Stock decrement failed:", stockError);
        }

        /* ── 16. Track coupon usage ── */
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

        /* ── 17. Invoice ── */
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
            console.error("⚠️ Invoice failed:", invoiceError);
        }

        /* ── 18. Shiprocket — only for SHIPPED or MIXED ── */
        if (fulfillmentType !== "LOCAL") {
            try {
                const shiprocketOrder =
                    fulfillmentType === "MIXED"
                        ? {
                              ...order.toObject(),
                              items: shippedItems.map((item) => ({
                                  name: item.name,
                                  product: item.product,
                                  variantSetSize: item.variantSetSize,
                                  quantity: item.quantity,
                                  price: item.price,
                                  totalPrice: item.totalPrice,
                              })),
                              totalAmount:
                                  shippedItems.reduce(
                                      (s, i) => s + i.totalPrice,
                                      0
                                  ) +
                                  shippingCharges +
                                  codCharges,
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
                console.log("✓ Guest COD Shiprocket created");
            } catch (shiprocketError) {
                console.error("Shiprocket Error:", shiprocketError.message);
            }
        } else {
            console.log("⏭ Skipping Shiprocket — LOCAL fulfillment order");
        }

        /* ── 19. Email ── */
        try {
            await sendMail(
                email,
                isNewUser
                    ? "Welcome to Paanshala + COD Order Confirmed 🎉"
                    : "COD Order Confirmed – Paanshala",
                baseEmailTemplate({
                    title: "COD Order Confirmed! 🎉",
                    subtitle: `Order #${order.orderNumber}`,
                    body: `
                         ${
                             isNewUser
                                 ? `
                            <div style="background:#f0f7ed;padding:16px;border-radius:8px;margin-bottom:20px;border-left:4px solid #2d5016;">
                                <p style="margin:0;font-size:15px;color:#2d5016;font-weight:600;">Welcome to Paanshala!</p>
                                <p style="margin:8px 0 0;font-size:14px;color:#555;">
                                    Your account has been created. You can
                                    <a href="${process.env.CLIENT_ORIGIN}/forgot-password" style="color:#2d5016;">reset your password</a>
                                    to access your account and track orders.
                                </p>
                            </div>`
                                 : ""
                         }
                        <p style="font-size:16px;color:#333;">Your Cash on Delivery order has been confirmed.</p>
                        <div style="background:#f0f0f0;padding:20px;border-radius:8px;margin:20px 0;">
                            <p style="margin:5px 0;"><strong>Order Total:</strong> ₹${order.totalAmount}</p>
                            ${order.coupon ? `<p style="margin:5px 0;"><strong>Coupon:</strong> ${order.coupon.code} (–₹${order.coupon.discountAmount})</p>` : ""}
                            ${shippingCharges > 0 ? `<p style="margin:5px 0;"><strong>Shipping:</strong> ₹${shippingCharges}</p>` : `<p style="margin:5px 0;"><strong>Shipping:</strong> FREE</p>`}
                            ${codCharges > 0 ? `<p style="margin:5px 0;"><strong>COD Charges:</strong> ₹${codCharges}</p>` : ""}
                            ${localItems.length > 0 ? `<p style="margin:5px 0;"><strong>Scheduled:</strong> ${scheduledDate} at ${scheduledTime}</p>` : ""}
                            <p style="margin:5px 0;"><strong>Payment Method:</strong> Cash on Delivery</p>
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
            await notifyAdminsNewOrder(order);
            console.log("✓ Guest COD email sent");
        } catch (emailError) {
            console.error("⚠️ Guest COD email failed:", emailError);
        }

        /* ── 20. Cleanup ── */
        if (invoicePath && fs.existsSync(invoicePath))
            fs.unlinkSync(invoicePath);

        return res.status(201).json({
            success: true,
            message: "COD order placed successfully",
            order,
            isNewUser,
            userId: user._id,
        });
    } catch (error) {
        console.error("guestCreateCODOrder", error);
        return res.status(500).json({
            message: "Error placing COD order",
            error: error.message,
        });
    }
};
