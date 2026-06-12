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
router.get("/my", authMiddleware, getMyOrders);
router.get("/:orderId", getOrderDetails);

/* =========================
   ADMIN
========================= */
router.get("/admin/all", authMiddleware, adminMiddleware, getAllOrdersAdmin);

router.post("/cod", authMiddleware, createCODOrder);

router.patch("/:orderId/local-status", adminMiddleware, updateLocalOrderStatus);

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

export default router;
