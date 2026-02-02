import express from "express";
import {
    createBlog,
    updateBlog,
    deleteBlog,
    toggleBlogStatus,
    listBlogsAdmin,
    getBlogs,
    getFeaturedBlogs,
    getBlogBySlug,
} from "../controllers/blog.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";
import { adminMiddleware } from "../middlewares/admin.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = express.Router();

/* =========================
   USER ROUTES
========================= */
router.get("/", getBlogs);
router.get("/featured", getFeaturedBlogs);
router.get("/:slug", getBlogBySlug);

/* =========================
   ADMIN ROUTES
========================= */
router.use(authMiddleware, adminMiddleware);

router.get("/admin/all", listBlogsAdmin);
router.post("/admin/create", upload.single("coverImage"), createBlog);
router.put("/admin/update/:blogId", upload.single("coverImage"), updateBlog);
router.patch("/admin/toggle/:blogId", toggleBlogStatus);
router.delete("/admin/delete/:blogId", deleteBlog);

export default router;
