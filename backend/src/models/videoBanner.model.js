import mongoose from "mongoose";

const textStyleSchema = new mongoose.Schema(
    {
        fontSize: {
            type: String,
            default: "16px", // e.g. "16px", "1.5rem", "2xl"
        },
        color: {
            type: String,
            default: "#ffffff", // hex color
        },
    },
    { _id: false }
);

const videoBannerSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            trim: true,
        },

        description: {
            type: String,
        },

        titleStyle: {
            type: textStyleSchema,
            default: () => ({ fontSize: "32px", color: "#ffffff" }),
        },
        descriptionStyle: {
            type: textStyleSchema,
            default: () => ({ fontSize: "16px", color: "#ffffff" }),
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

        mobileImageUrl: { type: String },

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
