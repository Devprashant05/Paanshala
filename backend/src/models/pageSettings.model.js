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

        mapUrl: {
            type: String,
        },

        offlineStores: [
            {
                name: {
                    type: String,
                    required: true,
                    trim: true,
                },
                address: {
                    type: String,
                    required: true,
                },
                mapUrl: {
                    type: String, // Google Maps embed/share URL
                },
                phoneNumber: {
                    type: String,
                    match: [/^\d{10}$/, "Invalid phone number"],
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
        ],

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

        codSettings: {
            enabled: {
                type: Boolean,
                default: true,
            },
            charges: {
                type: Number,
                default: 0,
            },
        },

        shippingSettings: {
            freeShippingThreshold: {
                type: Number,
                default: 500,
            },
            standardCharges: {
                type: Number,
                default: 0,
            },
        },
    },
    { timestamps: true }
);

export const PageSettings = mongoose.model("PageSettings", pageSettingsSchema);
