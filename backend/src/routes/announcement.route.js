import express from "express";
import {
    getActiveAnnouncements,
    getAllAnnouncements,
    createAnnouncement,
    updateAnnouncement,
    toggleAnnouncement,
    reorderAnnouncements,
    deleteAnnouncement,
} from "../controllers/announcement.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { adminMiddleware } from "../middlewares/admin.middleware.js";

const router = express.Router();

/* ── PUBLIC ── */
router.get("/", getActiveAnnouncements);

/* ── ADMIN ── */
router.get("/admin/all", authMiddleware, adminMiddleware, getAllAnnouncements);
router.post("/admin", authMiddleware, adminMiddleware, createAnnouncement);
router.patch(
    "/admin/reorder",
    authMiddleware,
    adminMiddleware,
    reorderAnnouncements
);
router.patch("/admin/:id", authMiddleware, adminMiddleware, updateAnnouncement);
router.patch(
    "/admin/:id/toggle",
    authMiddleware,
    adminMiddleware,
    toggleAnnouncement
);
router.delete(
    "/admin/:id",
    authMiddleware,
    adminMiddleware,
    deleteAnnouncement
);

export default router;
