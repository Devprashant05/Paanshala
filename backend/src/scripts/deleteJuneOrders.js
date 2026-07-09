// scripts/deleteJuneOrders.js
// Run with: node scripts/deleteJuneOrders.js
// ⚠️ Backup your database before running on production.

import mongoose from "mongoose";
import dotenv from "dotenv";
import { Order } from "../models/order.model.js";

dotenv.config();

// Change to false when you're ready to delete
const DRY_RUN = true;

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✓ Connected to MongoDB");

        // June 1 → June 30
        const startDate = new Date("2026-06-01T00:00:00.000Z");
        const endDate = new Date("2026-06-30T23:59:59.999Z");

        const filter = {
            createdAt: {
                $gte: startDate,
                $lte: endDate,
            },
        };

        const orders = await Order.find(filter).select(
            "orderNumber createdAt totalAmount"
        );

        console.log(`Found ${orders.length} order(s) from June.\n`);

        orders.forEach((order) => {
            console.log(
                `${order.orderNumber} | ${order.createdAt.toISOString()} | ₹${order.totalAmount}`
            );
        });

        if (DRY_RUN) {
            console.log("\n⚠️ DRY_RUN enabled.");
            console.log(
                "No orders were deleted. Set DRY_RUN = false to delete them."
            );

            await mongoose.disconnect();
            process.exit(0);
        }

        const result = await Order.deleteMany(filter);

        console.log(
            `\n✓ Successfully deleted ${result.deletedCount} June order(s).`
        );

        await mongoose.disconnect();
        console.log("✓ Disconnected from MongoDB.");
        process.exit(0);
    } catch (error) {
        console.error("Error deleting June orders:", error);

        await mongoose.disconnect();
        process.exit(1);
    }
};

run();
