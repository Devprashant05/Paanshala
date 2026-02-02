import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },

        // Only for PAAN
        variantSetSize: {
            type: Number, // 6, 12, 24
        },

        quantity: {
            type: Number,
            default: 1,
        },

        price: {
            type: Number, // unit price (discounted)
            required: true,
        },

        totalPrice: {
            type: Number,
            required: true,
        },
    },
    { _id: false }
);

const cartSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },

        items: [cartItemSchema],

        subtotal: {
            type: Number,
            default: 0,
        },

        discount: {
            type: Number,
            default: 0,
        },

        coupon: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Coupon",
        },

        totalAmount: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

export const Cart = mongoose.model("Cart", cartSchema);
