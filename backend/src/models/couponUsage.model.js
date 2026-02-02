import mongoose from "mongoose";

const couponUsageSchema = new mongoose.Schema(
    {
        couponId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Coupon",
            required: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        usedCount: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

couponUsageSchema.index({ couponId: 1, userId: 1 }, { unique: true });

export const CouponUsage = mongoose.model("CouponUsage", couponUsageSchema);
