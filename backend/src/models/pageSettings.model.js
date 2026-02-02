import mongoose from "mongoose";

const pageSettingsSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },

        address: {
            type: String,
            required: true,
        },

        phoneNumbers: [
            {
                type: String,
                match: [/^\d{10}$/, "Invalid phone number"],
            },
        ],

        whatsappNumber: {
            type: String,
            match: [/^\d{10}$/, "Invalid WhatsApp number"],
        },

        whatsappCommunityLink: {
            type: String,
        },

        socialLinks: {
            instagram: { type: String },
            facebook: { type: String },
            youtube: { type: String },
            twitterX: { type: String },
        },
    },
    { timestamps: true }
);

export const PageSettings = mongoose.model("PageSettings", pageSettingsSchema);
