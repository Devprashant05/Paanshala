import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            enum: ["contact", "event", "horeca", "paanThaal"],
            default: "contact",
        },

        fullName: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            required: function () {
                return (
                    this.type === "contact" ||
                    this.type === "horeca" ||
                    this.type === "paanThaal"
                ); // only required for contact and horeca
            },
            lowercase: true,
            trim: true,
        },

        phone: {
            type: String,
            required: true,
            match: [/^\d{10}$/, "Invalid phone number"],
        },

        message: {
            type: String,
            required: function () {
                return this.type === "contact";
            },
        },

        // =========================
        // EVENT BOOKING FIELDS
        // =========================
        eventDate: {
            type: Date,
            required: function () {
                return this.type === "event";
            },
        },

        eventLocation: {
            type: String,
            required: function () {
                return this.type === "event";
            },
        },

        gathering: {
            type: Number,
            required: function () {
                return this.type === "event";
            },
        },

        businessName: {
            type: String,
            required: function () {
                return this.type === "horeca";
            },
            trim: true,
        },

        businessType: {
            type: String,
            required: function () {
                return this.type === "horeca";
            },
            trim: true,
        },

        requirement: {
            type: String,
            required: function () {
                return this.type === "horeca";
            },
            trim: true,
        },

        city: {
            type: String,
            required: function () {
                return this.type === "horeca";
            },
            trim: true,
        },

        thaalQuantity: {
            type: Number,
            required: function () {
                return this.type === "paanThaal";
            },
            min: 100,
        },

        preferredDate: {
            type: Date,
            required: function () {
                return this.type === "paanThaal";
            },
        },

        preferredTime: {
            type: String,
            required: function () {
                return this.type === "paanThaal";
            },
            trim: true,
        },

        isRead: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

export const Contact = mongoose.model("Contact", contactSchema);
