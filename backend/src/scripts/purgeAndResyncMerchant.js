// scripts/purgeAndResyncMerchant.js
// Run: node src/scripts/purgeAndResyncMerchant.js
//
// Deletes every productInput for the current catalog, then re-inserts
// fresh. Use this only if the Merchant Center UI has no visible
// "Unarchive" option — a hard delete+recreate is more likely to clear
// a stuck `archived: true` flag than another insert-only pass, since
// insert merges into the existing processed product rather than
// rebuilding it.

import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../db/connectDB.js";
import { Product } from "../models/product.model.js";
import { Category } from "../models/category.model.js";
import {
    removeProductFromMerchant,
    bulkSyncAllProducts,
} from "../utils/merchantSync.js";

async function run() {
    await connectDB();

    const products = await Product.find({ isActive: true })
        .populate("category", "name")
        .lean();

    console.log(
        `Found ${products.length} product(s). Deleting existing productInputs first...`
    );

    let deleteIndex = 0;
    for (const product of products) {
        deleteIndex++;
        console.log(
            `[${deleteIndex}/${products.length}] Deleting: ${product.name}`
        );
        await removeProductFromMerchant(product);
    }

    console.log(
        "\nDelete pass complete. Waiting 10 seconds before re-insert...\n"
    );
    await new Promise((resolve) => setTimeout(resolve, 10000));

    console.log("Re-inserting fresh...\n");
    const results = await bulkSyncAllProducts(products);

    console.log("\nPurge + resync complete:", results);

    await mongoose.connection.close();
    process.exit(0);
}

run().catch((err) => {
    console.error("Purge and resync failed:", err);
    process.exit(1);
});
