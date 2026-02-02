import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
    {
        title: {
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

        excerpt: {
            type: String,
            required: true,
            maxlength: 300,
        },

        content: {
            type: String, // HTML / Markdown
            required: true,
        },

        coverImage: {
            type: String, // Cloudinary URL
            required: true,
        },

        author: {
            type: String,
            default: "Paanshala Team",
        },

        isPublished: {
            type: Boolean,
            default: false,
        },

        isFeatured: {
            type: Boolean,
            default: false,
        },

        publishedAt: {
            type: Date,
        },
    },
    { timestamps: true }
);

// Index for SEO & search
blogSchema.index({ title: "text", content: "text" });

export const Blog = mongoose.model("Blog", blogSchema);
