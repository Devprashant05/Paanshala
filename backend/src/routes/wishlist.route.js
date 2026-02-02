import express from "express";
import {
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    checkWishlistStatus,
} from "../controllers/wishlist.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", getWishlist);
router.post("/add", addToWishlist);
router.delete("/remove/:productId", removeFromWishlist);
router.get("/check/:productId", checkWishlistStatus);

export default router;
