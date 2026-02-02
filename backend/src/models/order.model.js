import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
        },
        name: String,
        image: String,

        variantSetSize: Number, // for Paan

        quantity: Number,
        price: Number,
        totalPrice: Number,
    },
    { _id: false }
);

const addressSnapshotSchema = new mongoose.Schema(
    {
        fullName: String,
        companyName: String,
        streetAddress: String,
        landmark: String,
        city: String,
        state: String,
        pincode: String,
        phone: String,
        email: String,
    },
    { _id: false }
);

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        items: [orderItemSchema],

        billingAddress: addressSnapshotSchema,
        shippingAddress: addressSnapshotSchema,

        subtotal: Number,
        discount: Number,
        totalAmount: Number,

        payment: {
            razorpayOrderId: String,
            razorpayPaymentId: String,
            razorpaySignature: String,
            status: {
                type: String,
                enum: ["PENDING", "PAID"],
                default: "PENDING",
            },
        },

        invoiceUrl: String,

        status: {
            type: String,
            enum: [
                "PENDING_PAYMENT",
                "PAID",
                "PROCESSING",
                "SHIPPED",
                "DELIVERED",
                "CANCELLED",
            ],
            default: "PENDING_PAYMENT",
        },
    },
    { timestamps: true }
);

export const Order = mongoose.model("Order", orderSchema);
