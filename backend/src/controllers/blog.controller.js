import { Blog } from "../models/blog.model.js";
import {
    uploadOnCloudinary,
    deleteFromCloudinary,
} from "../utils/cloudinary.js";
import slugify from "slugify";

// =============================
// (Admin) CREATE BLOG
// =============================
export const createBlog = async (req, res) => {
    try {
        const { title, excerpt, content, author } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: "Cover image is required" });
        }

        const coverImage = await uploadOnCloudinary(req.file.path, "blogs");

        const slug = slugify(title, { lower: true, strict: true });

        const blog = await Blog.create({
            title,
            slug,
            excerpt,
            content,
            author,
            coverImage,
        });

        return res.status(201).json({
            success: true,
            message: "Blog created successfully",
            blog,
        });
    } catch (error) {
        console.error("createBlog", error);
        return res.status(500).json({
            message: "Error while creating blog",
        });
    }
};

// =============================
// (Admin) UPDATE BLOG
// =============================
export const updateBlog = async (req, res) => {
    try {
        const { blogId } = req.params;
        const data = req.body;

        const blog = await Blog.findById(blogId);
        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }

        // Update cover image if provided
        if (req.file) {
            await deleteFromCloudinary(blog.coverImage);
            data.coverImage = await uploadOnCloudinary(req.file.path, "blogs");
        }

        // Update slug if title changes
        if (data.title) {
            data.slug = slugify(data.title, {
                lower: true,
                strict: true,
            });
        }

        const updatedBlog = await Blog.findByIdAndUpdate(blogId, data, {
            new: true,
        });

        return res.status(200).json({
            success: true,
            message: "Blog updated successfully",
            blog: updatedBlog,
        });
    } catch (error) {
        console.error("updateBlog", error);
        return res.status(500).json({
            message: "Error while updating blog",
        });
    }
};

// =============================
// (Admin) TOGGLE BLOG STATUS
// =============================
export const toggleBlogStatus = async (req, res) => {
    try {
        const { blogId } = req.params;
        const { isPublished, isFeatured } = req.body;

        const update = { isPublished, isFeatured };

        if (isPublished) {
            update.publishedAt = new Date();
        }

        const blog = await Blog.findByIdAndUpdate(blogId, update, {
            new: true,
        });

        return res.status(200).json({
            success: true,
            blog,
        });
    } catch (error) {
        console.error("toggleBlogStatus", error);
        return res.status(500).json({
            message: "Error while updating blog status",
        });
    }
};

// =============================
// (Admin) DELETE BLOG
// =============================
export const deleteBlog = async (req, res) => {
    try {
        const { blogId } = req.params;

        const blog = await Blog.findById(blogId);
        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }

        await deleteFromCloudinary(blog.coverImage);
        await Blog.findByIdAndDelete(blogId);

        return res.status(200).json({
            success: true,
            message: "Blog deleted successfully",
        });
    } catch (error) {
        console.error("deleteBlog", error);
        return res.status(500).json({
            message: "Error while deleting blog",
        });
    }
};

// =============================
// (Admin) LIST BLOGS
// =============================
export const listBlogsAdmin = async (req, res) => {
    const blogs = await Blog.find().sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: blogs.length,
        blogs,
    });
};

// =============================
// (User) LIST BLOGS
// =============================
export const getBlogs = async (req, res) => {
    const blogs = await Blog.find({ isPublished: true })
        .sort({ publishedAt: -1 })
        .select("-content");

    res.status(200).json({
        success: true,
        blogs,
    });
};

// =============================
// (User) FEATURED BLOGS
// =============================
export const getFeaturedBlogs = async (req, res) => {
    const blogs = await Blog.find({
        isPublished: true,
        isFeatured: true,
    }).limit(5);

    res.status(200).json({
        success: true,
        blogs,
    });
};

// =============================
// (User) BLOG DETAILS
// =============================
export const getBlogBySlug = async (req, res) => {
    const { slug } = req.params;

    const blog = await Blog.findOne({
        slug,
        isPublished: true,
    });

    if (!blog) {
        return res.status(404).json({ message: "Blog not found" });
    }

    res.status(200).json({
        success: true,
        blog,
    });
};
