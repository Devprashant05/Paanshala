import express from "express";
import {
    createCoupon,
    updateCoupon,
    listCouponsAdmin,
    toggleCoupon,
    validateCoupon,
    listCouponsUser,
} from "../controllers/coupon.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";
import { adminMiddleware } from "../middlewares/admin.middleware.js";

const router = express.Router();

/* ===========================
   USER
=========================== */
router.post("/validate", authMiddleware, validateCoupon);
router.get("/all", listCouponsUser);

/* ===========================
ADMIN
=========================== */
router.use(authMiddleware, adminMiddleware);

router.get("/admin/all", listCouponsAdmin);
router.post("/admin/create", createCoupon);
router.put("/admin/update/:couponId", updateCoupon);
router.patch("/admin/toggle/:couponId", toggleCoupon);

export default router;
