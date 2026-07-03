// scripts/checkMerchantProduct.js
// Run: node src/scripts/checkMerchantProduct.js <offerId>
// Example: node src/scripts/checkMerchantProduct.js 6a43fc11d680d09dbd538d63
//
// Directly queries the Merchant API for a specific product's processed
// state — this is ground truth, independent of whatever the Merchant
// Center dashboard UI happens to be showing (which can lag behind).

import "dotenv/config";
import { getAccessToken, MERCHANT_ID } from "../config/googleMerchant.js";

const offerId = process.argv[2];

if (!offerId) {
    console.error("Usage: node src/scripts/checkMerchantProduct.js <offerId>");
    process.exit(1);
}

async function checkProduct() {
    const token = await getAccessToken();

    // Product identifier format: contentLanguage~feedLabel~offerId
    const productId = `en~IN~${offerId}`;
    const url = `https://merchantapi.googleapis.com/products/v1/accounts/${MERCHANT_ID}/products/${productId}`;

    const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
    });

    const body = await res.text();

    if (!res.ok) {
        console.error(`Not found or error (${res.status}):`, body);
        process.exit(1);
    }

    console.log("Product found in Merchant Center:");
    console.log(body);
}

checkProduct().catch((err) => {
    console.error("Check failed:", err);
    process.exit(1);
});