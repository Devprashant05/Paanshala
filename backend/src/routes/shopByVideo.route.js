import express from "express";
import {
    createShopByVideo,
    updateShopByVideo,
    toggleShopByVideo,
    listShopByVideoAdmin,
    getShopByVideos,
} from "../controllers/shopByVideo.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";
import { adminMiddleware } from "../middlewares/admin.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = express.Router();

/* =========================
   USER
========================= */
router.get("/", getShopByVideos);

/* =========================
   ADMIN
========================= */
router.use(authMiddleware, adminMiddleware);

router.get("/admin/all", listShopByVideoAdmin);
router.post("/admin/create", upload.single("video"), createShopByVideo);
router.put("/admin/update/:videoId", upload.single("video"), updateShopByVideo);
router.patch("/admin/toggle/:videoId", toggleShopByVideo);

export default router;
