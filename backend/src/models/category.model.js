import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },

        parent: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            default: null, // null = root category
        },

        level: {
            type: Number,
            default: 0, // 0 = parent, 1 = subcategory
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

export const Category = mongoose.model("Category", categorySchema);
