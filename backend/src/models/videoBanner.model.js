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

        type: {
            type: String,
            enum: ["video", "image"],
            required: true,
            default: "video",
        },

        videoUrl: {
            type: String,
        },

        imageUrl: {
            type: String,
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
