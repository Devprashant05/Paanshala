import express from "express";
import {
    createCategory,
    getAllCategoriesAdmin,
    getActiveCategories,
    updateCategory,
    deleteCategory,
    toggleCategoryStatus,
} from "../controllers/category.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";
import { adminMiddleware } from "../middlewares/admin.middleware.js";

const router = express.Router();

/* =========================
   PUBLIC
========================= */
router.get("/", getActiveCategories);

/* =========================
   ADMIN
========================= */
router.post("/admin", authMiddleware, adminMiddleware, createCategory);

router.get("/admin", authMiddleware, adminMiddleware, getAllCategoriesAdmin);

router.patch("/admin/:id", authMiddleware, adminMiddleware, updateCategory);

router.patch(
    "/admin/status/:id",
    authMiddleware,
    adminMiddleware,
    toggleCategoryStatus
);

router.delete("/admin/:id", authMiddleware, adminMiddleware, deleteCategory);

export default router;
