import mongoose from "mongoose";

const rewardSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        orderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
        },

        type: {
            type: String,
            enum: ["earned", "redeemed"],
            required: true,
        },

        points: {
            type: Number,
            required: true,
        },

        description: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

export const Reward = mongoose.model("Reward", rewardSchema);
