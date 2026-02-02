import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        addressType: {
            type: String,
            enum: ["billing", "shipping"],
            required: true,
        },

        fullName: {
            type: String,
            required: true,
            trim: true,
        },

        companyName: {
            type: String,
            trim: true,
        },

        streetAddress: {
            type: String,
            required: true,
        },

        landmark: {
            type: String,
        },

        city: {
            type: String,
            required: true,
        },

        state: {
            type: String,
            required: true,
        },

        pincode: {
            type: String,
            required: true,
            match: [/^\d{6}$/, "Invalid pincode"],
        },

        phone: {
            type: String,
            required: true,
            match: [/^\d{10}$/, "Invalid phone number"],
        },

        email: {
            type: String,
            required: true,
            lowercase: true,
        },

        isDefault: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

export const Address = mongoose.model("Address", addressSchema);
