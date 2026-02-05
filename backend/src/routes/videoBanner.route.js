import express from "express";
import {
    createVideoBanner,
    getAllVideoBannersAdmin,
    updateVideoBanner,
    deleteVideoBanner,
    getActiveVideoBanners,
} from "../controllers/videoBanner.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";
import { adminMiddleware } from "../middlewares/admin.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = express.Router();

/* =========================
   PUBLIC
========================= */
router.get("/", getActiveVideoBanners);

/* =========================
   ADMIN
========================= */
router.post(
    "/admin",
    authMiddleware,
    adminMiddleware,
    upload.single("video"),
    createVideoBanner
);

router.get("/admin", authMiddleware, adminMiddleware, getAllVideoBannersAdmin);

router.patch("/admin/:id", authMiddleware, adminMiddleware, updateVideoBanner);

router.delete("/admin/:id", authMiddleware, adminMiddleware, deleteVideoBanner);

export default router;
