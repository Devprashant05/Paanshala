// utils/merchantSync.js
import {
    getAccessToken,
    MERCHANT_ID,
    DATASOURCE_ID,
    MERCHANT_API_BASE,
} from "../config/googleMerchant.js";

const SITE_URL = "https://paanshala.com";

/* =========================
   BUILD PRODUCT INPUT(S) — verified against Google's current v1
   Merchant API docs (developers.google.com/merchant/api).
   Key shape, confirmed from official docs:
   - price is { amountMicros, currencyCode } — amountMicros is the
     price multiplied by 1,000,000, as a STRING (e.g. ₹150.00 → "150000000")
   - availability/condition are UPPERCASE enums ("IN_STOCK", "NEW")
   - product details are nested under "productAttributes" (NOT
     "attributes" — that was a v1beta-era guess that v1 rejects)
   - there is NO "channel" field in v1 at all — it was removed
   - top-level fields are just: contentLanguage, feedLabel, offerId,
     productAttributes
   - Paan products with multiple variants (setSize) become multiple
     productInputs, linked via itemGroupId inside productAttributes
========================= */
function toMicros(price) {
    return String(Math.round(price * 1_000_000));
}

function buildProductInputs(product) {
    const categoryName = product.category?.name || "Paan";
    const link = `${SITE_URL}/shop/${product.slug}`;
    const imageLink = product.images?.[0];

    if (!imageLink) return []; // Merchant API rejects items with no image

    const additionalImageLinks = (product.images || []).slice(1, 10);

    const baseAttributes = {
        title: product.name,
        description: (product.description || product.name).slice(0, 5000),
        link,
        imageLink,
        additionalImageLinks,
        condition: "NEW",
        brand: "Paanshala",
        productTypes: [categoryName],
        identifierExists: false,
    };

    if (product.isPaan && product.variants?.length > 0) {
        return product.variants.map((variant) => {
            const hasDiscount = variant.originalPrice > variant.discountedPrice;

            return {
                contentLanguage: "en",
                feedLabel: "IN",
                offerId: `${product._id}-${variant.setSize}`,
                productAttributes: {
                    ...baseAttributes,
                    title: `${product.name} - ${variant.setSize} Pieces`,
                    itemGroupId: String(product._id),
                    availability:
                        (variant.stock ?? 0) > 0 ? "IN_STOCK" : "OUT_OF_STOCK",
                    // price = regular/original price; salePrice = the discounted
                    // price customers actually pay. Sending only one flat price
                    // (the old bug) means Google never shows the strikethrough
                    // discount at all, even though your storefront does.
                    price: {
                        amountMicros: toMicros(
                            hasDiscount
                                ? variant.originalPrice
                                : variant.discountedPrice
                        ),
                        currencyCode: "INR",
                    },
                    ...(hasDiscount && {
                        salePrice: {
                            amountMicros: toMicros(variant.discountedPrice),
                            currencyCode: "INR",
                        },
                    }),
                },
            };
        });
    }

    const hasDiscount = product.originalPrice > product.discountedPrice;

    return [
        {
            contentLanguage: "en",
            feedLabel: "IN",
            offerId: String(product._id),
            productAttributes: {
                ...baseAttributes,
                availability:
                    (product.stock ?? 0) > 0 ? "IN_STOCK" : "OUT_OF_STOCK",
                price: {
                    amountMicros: toMicros(
                        hasDiscount
                            ? product.originalPrice
                            : product.discountedPrice
                    ),
                    currencyCode: "INR",
                },
                ...(hasDiscount && {
                    salePrice: {
                        amountMicros: toMicros(product.discountedPrice),
                        currencyCode: "INR",
                    },
                }),
            },
        },
    ];
}

/* =========================
   FETCH WITH TIMEOUT — a hung network request (bad connectivity,
   Google API slow response, DNS issue on the VPS) should fail loudly
   after N seconds, not hang the whole bulk sync loop forever with no
   feedback.
========================= */
async function fetchWithTimeout(url, options, timeoutMs = 15000) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
        return await fetch(url, { ...options, signal: controller.signal });
    } finally {
        clearTimeout(timeout);
    }
}

/* =========================
   PUSH (INSERT/UPDATE) — productInputs.insert acts as an upsert,
   same as the old API: same offerId overwrites the existing entry.
========================= */
export async function syncProductToMerchant(product) {
    if (!process.env.GOOGLE_MERCHANT_SERVICE_ACCOUNT_B64) return;

    try {
        const token = await getAccessToken();
        const inputs = buildProductInputs(product);

        for (const input of inputs) {
            const url = `${MERCHANT_API_BASE}/accounts/${MERCHANT_ID}/productInputs:insert?dataSource=accounts/${MERCHANT_ID}/dataSources/${DATASOURCE_ID}`;

            const res = await fetchWithTimeout(url, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(input),
            });

            const responseBody = await res.text();

            if (!res.ok) {
                throw new Error(
                    `Merchant API insert failed (${res.status}): ${responseBody}`
                );
            }

            console.log(
                `syncProductToMerchant OK for offerId ${input.offerId}:`,
                responseBody
            );
        }
    } catch (error) {
        // Best-effort — Merchant Center sync must never block the
        // actual product save/update in your database
        console.error(
            "syncProductToMerchant failed for product",
            product._id,
            error?.message || error
        );
    }
}

/* =========================
   REMOVE — productInputs.delete.
   Resource name format: accounts/{account}/productInputs/{channel}~{contentLanguage}~{feedLabel}~{offerId}
========================= */
export async function removeProductFromMerchant(product) {
    if (!process.env.GOOGLE_MERCHANT_SERVICE_ACCOUNT_B64) return;

    try {
        const token = await getAccessToken();

        const offerIds =
            product.isPaan && product.variants?.length > 0
                ? product.variants.map((v) => `${product._id}-${v.setSize}`)
                : [String(product._id)];

        for (const offerId of offerIds) {
            const resourceName = `accounts/${MERCHANT_ID}/productInputs/en~IN~${offerId}`;
            const url = `${MERCHANT_API_BASE}/${resourceName}?dataSource=accounts/${MERCHANT_ID}/dataSources/${DATASOURCE_ID}`;

            const res = await fetchWithTimeout(url, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            // 404 means it was never synced — not a real failure, ignore
            if (!res.ok && res.status !== 404) {
                const errBody = await res.text();
                throw new Error(`Merchant API delete failed (${res.status}): ${errBody}`);
            }
        }
    } catch (error) {
        console.error(
            "removeProductFromMerchant failed for product",
            product._id,
            error?.message || error
        );
    }
}

/* =========================
   BULK SYNC — for pushing your entire existing catalog once.
   Logs progress per-product so a hang is visible (which product it
   stalled on) instead of silence for minutes with no feedback.
========================= */
export async function bulkSyncAllProducts(products) {
    const results = { synced: 0, skipped: 0, failed: 0 };
    let index = 0;

    for (const product of products) {
        index++;
        console.log(
            `[${index}/${products.length}] Syncing: ${product.name} (${product._id})`
        );

        try {
            const inputs = buildProductInputs(product);
            if (inputs.length === 0) {
                console.log(`  -> skipped (no image)`);
                results.skipped++;
                continue;
            }
            await syncProductToMerchant(product);
            console.log(`  -> done`);
            results.synced++;
        } catch (error) {
            results.failed++;
            console.error(`  -> failed:`, error?.message);
        }
    }

    return results;
}