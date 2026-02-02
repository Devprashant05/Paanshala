import express from "express";
import {
    loginUser,
    forgotPassword,
    resetPassword,
    listUsers,
    deleteUserByAdmin,
    createAdminByAdmin,
} from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { adminMiddleware } from "../middlewares/admin.middleware.js";

const router = express.Router();

router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// Admin protected routes
router.use(authMiddleware, adminMiddleware);

router.get("/users", listUsers);
router.post("/create-admin", createAdminByAdmin);
router.delete("/delete-user", deleteUserByAdmin);

export default router;
