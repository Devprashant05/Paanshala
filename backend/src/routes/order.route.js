import express from "express";
import {
    createPaymentOrder,
    verifyPaymentAndCreateOrder,
    getMyOrders,
    getOrderDetails,
    getAllOrdersAdmin,
    updateOrderStatus,
} from "../controllers/order.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";
import { adminMiddleware } from "../middlewares/admin.middleware.js";

const router = express.Router();

/* =========================
   USER
========================= */
router.post("/create-payment", authMiddleware, createPaymentOrder);
router.post("/verify", authMiddleware, verifyPaymentAndCreateOrder);
router.get("/my", authMiddleware, getMyOrders);
router.get("/:orderId", authMiddleware, getOrderDetails);

/* =========================
   ADMIN
========================= */
router.get("/admin/all", authMiddleware, adminMiddleware, getAllOrdersAdmin);

router.patch(
    "/admin/status/:orderId",
    authMiddleware,
    adminMiddleware,
    updateOrderStatus
);

export default router;
