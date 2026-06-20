// scripts/clearHorecaPage.js
// Run with: node scripts/clearHorecaPage.js
// Make sure to backup your DB before running this on production.

import mongoose from "mongoose";
import dotenv from "dotenv";
import { HorecaPage } from "../models/horecaPage.model.js";
import { deleteFromCloudinary } from "../utils/cloudinary.js";

dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✓ Connected to MongoDB");

        const page = await HorecaPage.findOne();

        if (!page) {
            console.log("No HorecaPage document found — nothing to clear.");
            await mongoose.disconnect();
            return;
        }

        /* ── Clean up Cloudinary images before wiping the doc ── */
        const imagesToDelete = [];

        // Hero background image (skip default local path)
        if (page.hero?.backgroundImage?.includes("cloudinary")) {
            imagesToDelete.push(page.hero.backgroundImage);
        }

        // Who We Serve card images
        (page.whoWeServe?.cards || []).forEach((card) => {
            if (card.image?.includes("cloudinary")) {
                imagesToDelete.push(card.image);
            }
        });

        // Offering product images
        (page.offerings?.products || []).forEach((product) => {
            (product.images || []).forEach((img) => {
                if (img?.includes("cloudinary")) {
                    imagesToDelete.push(img);
                }
            });
        });

        console.log(
            `Found ${imagesToDelete.length} Cloudinary image(s) to delete...`
        );

        let deletedCount = 0;
        let failedCount = 0;

        for (const url of imagesToDelete) {
            try {
                await deleteFromCloudinary(url);
                deletedCount++;
            } catch (err) {
                console.error(`  ✗ Failed to delete: ${url}`, err.message);
                failedCount++;
            }
        }

        console.log(
            `✓ Deleted ${deletedCount} image(s), ${failedCount} failed`
        );

        /* ── Delete the entire document ── */
        await HorecaPage.deleteOne({ _id: page._id });
        console.log("✓ HorecaPage document deleted");

        /* ── Recreate a fresh singleton with schema defaults ── */
        const fresh = await HorecaPage.getSingleton();
        console.log(
            "✓ Fresh HorecaPage document created with defaults:",
            fresh._id
        );

        await mongoose.disconnect();
        console.log("✓ Done. Disconnected from MongoDB.");
        process.exit(0);
    } catch (error) {
        console.error("Error clearing HorecaPage data:", error);
        await mongoose.disconnect();
        process.exit(1);
    }
};

run();
