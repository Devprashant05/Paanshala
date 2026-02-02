import express from "express";
import { getAdminDashboardMetrics } from "../controllers/dashboard.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { adminMiddleware } from "../middlewares/admin.middleware.js";

const router = express.Router();

router.get(
    "/admin/metrics",
    authMiddleware,
    adminMiddleware,
    getAdminDashboardMetrics
);

export default router;
