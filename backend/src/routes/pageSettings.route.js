import express from "express";
import {
    getPageSettings,
    upsertPageSettings,
} from "../controllers/pageSettings.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";
import { adminMiddleware } from "../middlewares/admin.middleware.js";

const router = express.Router();

/* =========================
   PUBLIC
========================= */
router.get("/", getPageSettings);

/* =========================
   ADMIN
========================= */
router.use(authMiddleware, adminMiddleware);
router.post("/admin/update", upsertPageSettings);

export default router;
