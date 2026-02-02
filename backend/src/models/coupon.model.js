import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
        },

        discountType: {
            type: String,
            enum: ["percentage", "flat"],
            required: true,
        },

        discountValue: {
            type: Number,
            required: true,
        },

        maxDiscount: {
            type: Number, // only for percentage
        },

        minCartValue: {
            type: Number,
            default: 0,
        },

        applicableCategories: [
            {
                type: String,
                enum: ["Digestive", "Candy & More", "Mouth Fresheners", "Paan"],
            },
        ],

        expiryDate: {
            type: Date,
            required: true,
        },

        usageLimit: {
            type: Number, // total usage
        },

        usedCount: {
            type: Number,
            default: 0,
        },

        usagePerUser: {
            type: Number,
            default: 1,
        },

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

export const Coupon = mongoose.model("Coupon", couponSchema);
