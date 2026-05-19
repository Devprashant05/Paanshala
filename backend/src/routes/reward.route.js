import express from "express";

import { authMiddleware } from "../middlewares/auth.middleware.js";

import { getMyRewardHistory } from "../controllers/reward.controller.js";

const router = express.Router();

/* ======================================================
   USER REWARD HISTORY
====================================================== */
router.get("/my-history", authMiddleware, getMyRewardHistory);

export default router;
