import { Order } from "../models/order.model.js";
import { authenticateShiprocket, createShiprocketOrder } from "../services/shiprocket.service.js";
import express from "express";

const router = express.Router();

router.get("/test-shiprocket", async (req, res) => {
    try {
        const token = await authenticateShiprocket();

        return res.status(200).json({
            success: true,
            token,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

router.get("/test-shipment/:id", async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        const shipment = await createShiprocketOrder(order);

        return res.status(200).json({
            success: true,
            shipment,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

export default router;
