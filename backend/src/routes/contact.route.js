import { Router } from "express";
import {
    submitContactForm,
    getAllContactsAdmin,
    markContactAsRead,
} from "../controllers/contact.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";
import { adminMiddleware } from "../middlewares/admin.middleware.js";

const router = Router();

/* =========================
   USER
========================= */
router.post("/submit", submitContactForm);

/* =========================
   ADMIN
========================= */
router.use(authMiddleware, adminMiddleware);

router.get("/admin/all", getAllContactsAdmin);
router.patch("/admin/read/:id", markContactAsRead);

export default router;
