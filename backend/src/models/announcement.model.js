import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema(
    {
        text: {
            type: String,
            required: true,
            trim: true,
        },

        link: {
            type: String,
            default: null,
            trim: true,
        },

        linkLabel: {
            type: String,
            default: null,
            trim: true,
        },

        bgColor: {
            type: String,
            default: "#12351a", // default dark green
            trim: true,
        },

        textColor: {
            type: String,
            default: "#ffffff",
            trim: true,
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

export const Announcement = mongoose.model("Announcement", announcementSchema);
