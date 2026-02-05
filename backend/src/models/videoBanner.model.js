import mongoose from "mongoose";

const videoBannerSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            trim: true,
        },

        description: {
            type: String,
        },

        videoUrl: {
            type: String,
            required: true,
        },

        thumbnail: {
            type: String, // optional poster image
        },

        isActive: {
            type: Boolean,
            default: true,
        },

        order: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

export const VideoBanner = mongoose.model("VideoBanner", videoBannerSchema);
