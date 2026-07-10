import express from "express";
const router = express.Router();

router.post("/ping", (req, res) => {
    res.sendStatus(200);
});

export default router;
