import express from "express";
import {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    applyCouponToCart,
    clearCart,
} from "../controllers/cart.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", getCart);
router.post("/add", addToCart);
router.put("/update", updateCartItem);
router.delete("/remove", removeFromCart);
router.post("/apply-coupon", applyCouponToCart);
router.delete("/clear", clearCart);

export default router;
