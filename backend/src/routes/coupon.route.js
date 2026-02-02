import express from "express";
import {
    createCoupon,
    updateCoupon,
    listCouponsAdmin,
    toggleCoupon,
    validateCoupon,
} from "../controllers/coupon.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";
import { adminMiddleware } from "../middlewares/admin.middleware.js";

const router = express.Router();

/* ===========================
   USER
=========================== */
router.post("/validate", authMiddleware, validateCoupon);

/* ===========================
   ADMIN
=========================== */
router.use(authMiddleware, adminMiddleware);

router.post("/admin/create", createCoupon);
router.get("/admin/all", listCouponsAdmin);
router.put("/admin/update/:couponId", updateCoupon);
router.patch("/admin/toggle/:couponId", toggleCoupon);

export default router;
