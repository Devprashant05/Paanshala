// scripts/registerGcpDeveloper.js
// Run this ONCE: node src/scripts/registerGcpDeveloper.js
// This registers your GCP project with the Merchant Center account —
// a one-time requirement in Merchant API v1 that didn't exist in the
// old Content API. Without this, every insert/delete call fails with
// a 401 GCP_NOT_REGISTERED error, even with otherwise-correct auth
// and payload.
//
// IMPORTANT: "dotenv/config" (side-effect import) must be the very
// FIRST import in this file. ES modules hoist and evaluate ALL
// imports before any other top-level code runs — so a later
// `import dotenv from "dotenv"; dotenv.config()` pattern actually
// loads .env AFTER config/googleMerchant.js has already been
// evaluated (and already read process.env as empty). This form
// avoids that ordering trap entirely.
import "dotenv/config";

import { getAccessToken, MERCHANT_ID } from "../config/googleMerchant.js";

async function registerGcpDeveloper() {
    const token = await getAccessToken();

    // Use the service account's own email — it's already added as an
    // Admin user in Merchant Center account access, so this registers
    // that same identity as the API developer without needing a
    // separate invitation-acceptance step.
    const credentials = JSON.parse(
        Buffer.from(
            process.env.GOOGLE_MERCHANT_SERVICE_ACCOUNT_B64,
            "base64"
        ).toString("utf-8")
    );
    const developerEmail = credentials.client_email;

    const url = `https://merchantapi.googleapis.com/accounts/v1/accounts/${MERCHANT_ID}/developerRegistration:registerGcp`;

    const res = await fetch(url, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ developerEmail }),
    });

    const body = await res.text();

    if (!res.ok) {
        console.error(`Registration failed (${res.status}):`, body);
        process.exit(1);
    }

    console.log("GCP project registered successfully:");
    console.log(body);
    console.log(
        "\nWait ~5 minutes before retrying product sync — Google's message says the registration needs a few minutes to propagate."
    );
}

registerGcpDeveloper().catch((err) => {
    console.error("Unexpected error:", err);
    process.exit(1);
});