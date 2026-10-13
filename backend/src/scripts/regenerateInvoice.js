/**
 * One-off script: regenerate invoice for a specific order and update invoiceUrl
 *
 * Usage:
 *   cd /var/www/Paanshala/backend
 *   node regenerateInvoice.js
 */

import "dotenv/config";
import mongoose from "mongoose";
import fs from "fs";

import { Order } from "../models/order.model.js";
import { generateInvoice } from "../utils/invoiceGenerator.js";
import { uploadPdfToCloudinary } from "../utils/cloudinary.js";

const ORDER_NUMBER = "PAAN-26-20";

async function main() {
    console.log("🔌 Connecting to MongoDB…");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✓ Connected");

    /* ── Find order ── */
    const order = await Order.findOne({ orderNumber: ORDER_NUMBER });
    if (!order) {
        console.error(`❌ Order ${ORDER_NUMBER} not found`);
        process.exit(1);
    }
    console.log(`✓ Found order ${order.orderNumber} (${order._id})`);
    console.log(`   Current invoiceUrl: ${order.invoiceUrl || "(none)"}`);

    /* ── Regenerate PDF ── */
    console.log("📄 Generating invoice PDF…");
    let invoicePath;
    try {
        invoicePath = await generateInvoice(order);
        console.log(`✓ PDF generated at: ${invoicePath}`);
    } catch (err) {
        console.error("❌ Invoice generation failed:", err);
        await mongoose.disconnect();
        process.exit(1);
    }

    /* ── Upload to Cloudinary ── */
    console.log("☁️  Uploading to Cloudinary…");
    let uploadResult;
    try {
        uploadResult = await uploadPdfToCloudinary(
            invoicePath,
            order.orderNumber
        );
        console.log(`✓ Uploaded: ${uploadResult.secure_url}`);
    } catch (err) {
        console.error("❌ Cloudinary upload failed:", err);
        if (fs.existsSync(invoicePath)) fs.unlinkSync(invoicePath);
        await mongoose.disconnect();
        process.exit(1);
    }

    /* ── Update order ── */
    order.invoiceUrl = uploadResult.secure_url;
    await order.save();
    console.log(`✓ Order updated with new invoiceUrl`);

    /* ── Cleanup ── */
    if (fs.existsSync(invoicePath)) fs.unlinkSync(invoicePath);
    console.log("✓ Temp file cleaned up");

    await mongoose.disconnect();
    console.log("✅ Done! New invoice URL:");
    console.log("  ", uploadResult.secure_url);
}

main().catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
});
