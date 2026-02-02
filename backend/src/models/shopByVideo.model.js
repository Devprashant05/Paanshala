import mongoose from "mongoose";

const shopByVideoSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
        },

        videoUrl: {
            type: String, 
            required: true,
        },

        products: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: true,
            },
        ],

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

export const ShopByVideo = mongoose.model("ShopByVideo", shopByVideoSchema);
