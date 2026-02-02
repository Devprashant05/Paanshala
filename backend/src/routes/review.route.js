import express from "express";
import {
    addOrUpdateReview,
    getProductReviews,
    getMyReview,
    toggleReviewApproval,
} from "../controllers/review.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";
import { adminMiddleware } from "../middlewares/admin.middleware.js";

const router = express.Router();

/* ======================
   USER
====================== */
router.post("/add", authMiddleware, addOrUpdateReview);
router.get("/product/:productId", getProductReviews);
router.get("/my/:productId", authMiddleware, getMyReview);

/* ======================
   ADMIN (optional)
====================== */
router.patch(
    "/admin/toggle/:reviewId",
    authMiddleware,
    adminMiddleware,
    toggleReviewApproval
);

export default router;
