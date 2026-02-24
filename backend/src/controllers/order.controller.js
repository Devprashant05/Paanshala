import crypto from "crypto";
import { razorpay } from "../utils/razorpay.js";
import { Order } from "../models/order.model.js";
import { Address } from "../models/address.model.js";
import { Cart } from "../models/cart.model.js";
import { uploadPdfToCloudinary } from "../utils/cloudinary.js";
import { generateInvoice } from "../utils/invoiceGenerator.js";
import { sendMail } from "../utils/sendMail.js";
import { baseEmailTemplate } from "../utils/emailTemplate.js";
import fs from "fs";

/* ======================================================
   CREATE RAZORPAY PAYMENT ORDER
====================================================== */
export const createPaymentOrder = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id });

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({
                message: "Cart is empty",
            });
        }

        if (cart.totalAmount <= 0) {
            return res.status(400).json({
                message: "Invalid cart amount",
            });
        }

        const razorpayOrder = await razorpay.orders.create({
            amount: Math.round(cart.totalAmount * 100), // INR → paise
            currency: "INR",
            receipt: `order_${Date.now()}`,
        });

        res.status(200).json({
            success: true,
            razorpayOrder,
        });
    } catch (error) {
        console.error("createPaymentOrder", error);
        res.status(500).json({
            message: "Error while creating payment order",
        });
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
        } = req.body;

        // Verify payment signature
        const body = `${razorpay_order_id}|${razorpay_payment_id}`;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({
                message: "Payment verification failed",
            });
        }

        // Get cart
        const cart = await Cart.findOne({ user: req.user._id }).populate(
            "items.product"
        );

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({
                message: "Cart is empty",
            });
        }

        // Get addresses
        const billing = await Address.findById(billingAddressId);
        const shipping = await Address.findById(shippingAddressId);

        if (!billing || !shipping) {
            return res.status(400).json({
                message: "Invalid billing or shipping address",
            });
        }

        const year = new Date().getFullYear() % 100; // 26
        const lastOrder = await Order.findOne({ orderYear: year })
            .sort({ orderSequence: -1 })
            .select("orderSequence");

        const nextSequence = lastOrder ? lastOrder.orderSequence + 1 : 1;

        const orderNumber = `PAAN-${year}-${String(nextSequence).padStart(2, "0")}`;

        // Create order
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
            billingAddress: billing.toObject(),
            shippingAddress: shipping.toObject(),
            subtotal: cart.subtotal,
            discount: cart.discount,
            totalAmount: cart.totalAmount,
            payment: {
                razorpayOrderId: razorpay_order_id,
                razorpayPaymentId: razorpay_payment_id,
                razorpaySignature: razorpay_signature,
                status: "PAID",
            },
            status: "PAID",
        });

        console.log("✓ Order created:", order._id);

        // Generate and upload invoice
        let invoiceUrl = null;
        let invoicePath = null;
        try {
            invoicePath = await generateInvoice(order);
            const uploadResult = await uploadPdfToCloudinary(
                invoicePath,
                order.orderNumber
            );

            order.invoiceUrl = uploadResult.secure_url;
            await order.save();
        } catch (invoiceError) {
            console.error("⚠️ Invoice generation/upload failed:", invoiceError);
            // Don't fail the order creation if invoice fails
        }

        // Clear cart
        await Cart.findOneAndDelete({ user: req.user._id });
        console.log("✓ Cart cleared");

        // Send confirmation email
        try {
            await sendMail(
                req.user.email,
                "Order Confirmed – Paanshala",
                baseEmailTemplate({
                    title: "Order Confirmed! 🎉",
                    subtitle: `Order #${order.orderNumber}`,
                    body: `
                        <p style="font-size: 16px; color: #333;">
                            Thank you for your order! Your purchase has been confirmed.
                        </p>
                        <div style="background: #f0f0f0; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <p style="margin: 5px 0;"><strong>Order Total:</strong> ₹${order.totalAmount}</p>
                            <p style="margin: 5px 0;"><strong>Payment Status:</strong> ${order.payment.status}</p>
                            <p style="margin: 5px 0;"><strong>Order Status:</strong> ${order.status}</p>
                        </div>
                        <p style="font-size: 14px; color: #666;">
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
            // Don't fail the order creation if email fails
        }

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
            .select("items totalAmount status createdAt invoiceUrl");

        res.status(200).json({
            success: true,
            count: orders.length,
            orders,
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
            user: req.user._id,
        }).populate("items.product", "name images category");

        if (!order) {
            return res.status(404).json({
                message: "Order not found",
            });
        }

        res.status(200).json({
            success: true,
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
        res.status(500).json({
            message: "Error while fetching orders",
        });
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
                message: `Cannot change order status from ${order.status} to ${status}`,
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
