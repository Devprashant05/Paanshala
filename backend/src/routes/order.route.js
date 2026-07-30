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
    exportOrders,
    generateShippingLabel,
} from "../controllers/order.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";
import { adminMiddleware } from "../middlewares/admin.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
    guestCreateCODOrder,
    guestCreatePaymentOrder,
    guestVerifyAndCreateOrder,
} from "../controllers/guestCheckout.controller.js";
import { handleShiprocketWebhook } from "../controllers/shiprocket.webhook.controller.js";

const router = express.Router();

/* =========================
   SHIPROCKET WEBHOOK
   Public — no auth (Shiprocket calls this).
   Register this URL in Shiprocket dashboard:
   Settings → API → Webhooks → POST /api/orders/tracking/status
========================= */

router.post("/tracking/status", handleShiprocketWebhook);

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

router.get("/admin/export", authMiddleware, adminMiddleware, exportOrders);

router.get(
    "/admin/:orderId/label",
    authMiddleware,
    adminMiddleware,
    generateShippingLabel
);

/* =========================
   WILDCARD — must be last
========================= */
router.get("/:orderId", getOrderDetails);

export default router;
