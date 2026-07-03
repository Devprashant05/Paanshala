// scripts/generateProductSeo.js
// Run: node src/scripts/generateProductSeo.js
// Add --force to overwrite products that already have SEO data set
// (default behavior SKIPS products with a non-empty seo.title, so
// this is safe to re-run without clobbering manual edits).
//
// Generates seo.title, seo.description, seo.keywords for every
// active product using a deterministic template — no AI call, no
// external dependency, matches the SEO formula used across the rest
// of the site (keyword-first title, hook-driven description, real
// price/discount language where relevant).

import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../db/connectDB.js";
import { Product } from "../models/product.model.js";
import { Category } from "../models/category.model.js";

const FORCE = process.argv.includes("--force");

/* =========================
   TITLE — "Buy {Name} Online | Paanshala" pattern, truncated to the
   schema's 70-char maxlength. Matches the fallback logic already
   built into shop/[slug]/layout.js, so this just makes the fallback
   redundant with real, stored data instead of computed-on-the-fly text.
========================= */
function buildTitle(product) {
    let title = `Buy ${product.name} Online`;
    if (title.length > 70) {
        title = title.slice(0, 67).trim() + "...";
    }
    return title;
}

/* =========================
   DESCRIPTION — pulls the real opening of the product's own
   description (already well-written, per the JSON export), trims to
   fit the 160-char schema limit, and appends a short CTA/price hook
   if there's room. Sentence-boundary aware where possible instead of
   a hard mid-word cut.
========================= */
function buildDescription(product) {
    const raw = (product.description || "").trim();
    const maxLen = 160;

    // Try to cut at the end of a sentence within the limit
    const sentences = raw.split(/(?<=[.!?])\s+/);
    let result = "";
    for (const sentence of sentences) {
        if ((result + " " + sentence).trim().length > maxLen - 20) break; // leave room for CTA
        result = (result + " " + sentence).trim();
    }

    // Fallback: hard truncate if no sentence fit at all
    if (!result) {
        result = raw.slice(0, maxLen - 25).trim();
    }

    const price = product.isPaan
        ? product.variants?.[0]?.discountedPrice
        : product.discountedPrice;

    const cta = price
        ? ` Order online, from ₹${price}.`
        : " Order online today.";

    let description = result + cta;
    if (description.length > maxLen) {
        description = description.slice(0, maxLen - 3).trim() + "...";
    }

    return description;
}

/* =========================
   KEYWORDS — derived from product name, category, and common
   commercial search patterns. Filters out empty/falsy entries to
   also clean up the [""] artifacts already present in some existing
   records (a leftover from earlier comma-split parsing on empty
   input in the admin form).
========================= */
function buildKeywords(product, categoryName) {
    const nameLower = product.name.toLowerCase();
    const categoryLower = (categoryName || "").toLowerCase();

    const candidates = [
        `buy ${nameLower} online`,
        nameLower,
        categoryLower ? `${categoryLower} online` : null,
        `paanshala ${nameLower}`,
    ];

    return [
        ...new Set(
            candidates.filter(Boolean).map((k) => k.trim().toLowerCase())
        ),
    ];
}

async function run() {
    await connectDB();

    const products = await Product.find({ isActive: true }).populate(
        "category",
        "name"
    );

    console.log(
        `Found ${products.length} active product(s). Force overwrite: ${FORCE}\n`
    );

    let updated = 0;
    let skipped = 0;

    for (const product of products) {
        const hasExistingSeo =
            product.seo?.title && product.seo.title.trim().length > 0;

        if (hasExistingSeo && !FORCE) {
            console.log(`Skipped (already has SEO): ${product.name}`);
            skipped++;
            continue;
        }

        const categoryName = product.category?.name;

        product.seo = {
            title: buildTitle(product),
            description: buildDescription(product),
            keywords: buildKeywords(product, categoryName),
        };

        await product.save();
        console.log(`Updated: ${product.name}`);
        console.log(`  Title: ${product.seo.title}`);
        console.log(`  Description: ${product.seo.description}`);
        console.log(`  Keywords: ${product.seo.keywords.join(", ")}\n`);
        updated++;
    }

    console.log(`\nDone. Updated: ${updated}, Skipped: ${skipped}`);

    await mongoose.connection.close();
    process.exit(0);
}

run().catch((err) => {
    console.error("generateProductSeo failed:", err);
    process.exit(1);
});
