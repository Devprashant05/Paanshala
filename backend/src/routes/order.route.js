import express from "express";
import {
    createPaymentOrder,
    verifyPaymentAndCreateOrder,
    getMyOrders,
    getOrderDetails,
    getAllOrdersAdmin,
    updateOrderStatus,
    updateOrderAddress,
    createCODOrder,
    updateLocalOrderStatus,
} from "../controllers/order.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";
import { adminMiddleware } from "../middlewares/admin.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
    guestCreateCODOrder,
    guestCreatePaymentOrder,
    guestVerifyAndCreateOrder,
} from "../controllers/guestCheckout.controller.js";

const router = express.Router();

/* =========================
   GUEST
========================= */
router.post("/guest/create-payment", guestCreatePaymentOrder);
router.post("/guest/verify", guestVerifyAndCreateOrder);
router.post("/guest/cod", guestCreateCODOrder);

/* =========================
   USER
========================= */
router.post("/create-payment", authMiddleware, createPaymentOrder);
router.post(
    "/verify",
    authMiddleware,
    upload.single("invoice"),
    verifyPaymentAndCreateOrder
);
router.post("/cod", authMiddleware, createCODOrder);
router.get("/my", authMiddleware, getMyOrders);

/* =========================
   ADMIN — all specific admin routes BEFORE /:orderId
========================= */
router.get("/admin/all", authMiddleware, adminMiddleware, getAllOrdersAdmin);
router.patch(
    "/admin/status/:orderId",
    authMiddleware,
    adminMiddleware,
    updateOrderStatus
);
router.put(
    "/admin/:orderId/address",
    authMiddleware,
    adminMiddleware,
    updateOrderAddress
);
router.patch(
    "/admin/local-status/:orderId",
    authMiddleware,
    adminMiddleware,
    updateLocalOrderStatus
);

/* =========================
   WILDCARD — must be last
========================= */
router.get("/:orderId", getOrderDetails);

export default router;