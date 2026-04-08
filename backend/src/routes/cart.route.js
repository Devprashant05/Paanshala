import express from "express";
import {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    applyCouponToCart,
    clearCart,
    removeCouponFromCart,
    getUsersWithCartDetails,
} from "../controllers/cart.controller.js";

import {
    adminMiddleware,
    authMiddleware,
} from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", getCart);
router.post("/add", addToCart);
router.put("/update", updateCartItem);
router.delete("/remove", removeFromCart);
router.post("/apply-coupon", applyCouponToCart);
router.post("/remove-coupon", removeCouponFromCart);
router.delete("/clear", clearCart);

router.get("/admin", adminMiddleware, getUsersWithCartDetails);

export default router;
