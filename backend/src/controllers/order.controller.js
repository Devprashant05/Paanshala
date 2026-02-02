import crypto from "crypto";
import { razorpay } from "../utils/razorpay.js";
import { Order } from "../models/order.model.js";
import { Address } from "../models/address.model.js";
import { Cart } from "../models/cart.model.js";
import { uploadPdfToCloudinary } from "../utils/cloudinary.js";
import { generateInvoice } from "../utils/invoiceGenerator.js";
import { sendMail } from "../utils/sendMail.js";
import { baseEmailTemplate } from "../utils/emailTemplate.js";

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

        const cart = await Cart.findOne({ user: req.user._id }).populate(
            "items.product"
        );

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({
                message: "Cart is empty",
            });
        }

        const billing = await Address.findById(billingAddressId);
        const shipping = await Address.findById(shippingAddressId);

        if (!billing || !shipping) {
            return res.status(400).json({
                message: "Invalid billing or shipping address",
            });
        }

        const order = await Order.create({
            user: req.user._id,
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

        // Generate invoice
        const invoicePath = await generateInvoice(order);
        const invoiceUpload = await uploadPdfToCloudinary(
            invoicePath,
            order._id
        );

        order.invoiceUrl = invoiceUpload?.secure_url || invoiceUpload;
        await order.save();

        // Clear cart
        await Cart.findOneAndDelete({ user: req.user._id });

        // Send confirmation mail
        await sendMail(
            req.user.email,
            "Order Confirmed – Paanshala",
            baseEmailTemplate({
                title: "Order Confirmed",
                subtitle: `Order #${order._id}`,
                body: `
                    <p>Your order has been placed successfully.</p>
                    <p><b>Total Amount:</b> ₹${order.totalAmount}</p>
                `,
            }),
            [
                {
                    filename: `invoice-${order._id}.pdf`,
                    path: order.invoiceUrl,
                },
            ]
        );

        res.status(201).json({
            success: true,
            message: "Order placed successfully",
            order,
        });
    } catch (error) {
        console.error("verifyPaymentAndCreateOrder", error);
        res.status(500).json({
            message: "Error while creating order",
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
