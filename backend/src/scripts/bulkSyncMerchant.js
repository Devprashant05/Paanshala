// scripts/bulkSyncMerchant.js
// Run directly on the VPS: node src/scripts/bulkSyncMerchant.js
// Bypasses the HTTP admin endpoint entirely — connects to the DB
// directly and runs the same sync logic, since we're already running
// server-side with full access. No auth token needed.

import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../db/connectDB.js";
import { Product } from "../models/product.model.js";
import { Category } from "../models/category.model.js";
import { bulkSyncAllProducts } from "../utils/merchantSync.js";

// Optional: limit how many products to sync in this run, for a
// controlled first test instead of hitting the whole catalog at once.
// Usage: node src/scripts/bulkSyncMerchant.js 5
const limitArg = process.argv[2];
const limit = limitArg ? parseInt(limitArg, 10) : null;

async function run() {
    await connectDB();

    let query = Product.find({ isActive: true }).populate("category", "name");
    if (limit) query = query.limit(limit);

    const products = await query.lean();

    console.log(
        `Found ${products.length} active product(s) to sync${limit ? ` (limited to ${limit})` : ""}.`
    );

    const results = await bulkSyncAllProducts(products);

    console.log("Bulk sync complete:", results);

    await mongoose.connection.close();
    process.exit(0);
}

run().catch((err) => {
    console.error("Bulk sync script failed:", err);
    process.exit(1);
});
