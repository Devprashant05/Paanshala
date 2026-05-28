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

        orderNumber: { type: String, unique: true },
        orderSequence: Number,
        orderYear: Number,

        items: [orderItemSchema],

        billingAddress: addressSnapshotSchema,
        shippingAddress: addressSnapshotSchema,

        coupon: {
            code: String,
            discountAmount: Number,
            couponId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Coupon",
            },
        },

        subtotal: Number,
        discount: Number,
        totalAmount: Number,

        rewardRedemption: {
            redeemedPoints: {
                type: Number,
                default: 0,
            },

            redeemedAmount: {
                type: Number,
                default: 0,
            },
        },

        paymentMethod: {
            type: String,
            enum: ["ONLINE", "COD"],
            default: "ONLINE",
        },

        codCharges: {
            type: Number,
            default: 0,
        },

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

        shiprocket: {
            orderId: String,

            shipmentId: String,

            awbCode: String,

            courierName: String,

            trackingNumber: String,
            trackingUrl: String,
            courierName: String,
            shippedAt: Date,

            labelUrl: String,

            manifestUrl: String,

            invoiceUrl: String,

            status: {
                type: String,
                default: "NOT_CREATED",
            },

            raw: mongoose.Schema.Types.Mixed,
        },

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

        rewardGiven: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

export const Order = mongoose.model("Order", orderSchema);
