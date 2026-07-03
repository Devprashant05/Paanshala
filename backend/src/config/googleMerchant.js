// config/googleMerchant.js
import { GoogleAuth } from "google-auth-library";

/* =========================
   SERVICE ACCOUNT AUTH — Merchant API
   Same service account setup as before, but the new Merchant API
   (merchantapi.googleapis.com) isn't reliably available in the
   `googleapis` npm package yet since it's a newer API — so this
   calls the REST endpoints directly via fetch, using
   google-auth-library only to obtain an OAuth2 access token.
========================= */

if (!process.env.GOOGLE_MERCHANT_SERVICE_ACCOUNT_B64) {
    console.warn(
        "GOOGLE_MERCHANT_SERVICE_ACCOUNT_B64 is not set — Merchant Center sync will fail"
    );
}
if (!process.env.GOOGLE_MERCHANT_ID) {
    console.warn("GOOGLE_MERCHANT_ID is not set — Merchant Center sync will fail");
}
if (!process.env.GOOGLE_MERCHANT_DATASOURCE_ID) {
    console.warn(
        "GOOGLE_MERCHANT_DATASOURCE_ID is not set — create an API-type Data Source in Merchant Center first"
    );
}

const credentials = process.env.GOOGLE_MERCHANT_SERVICE_ACCOUNT_B64
    ? JSON.parse(
          Buffer.from(
              process.env.GOOGLE_MERCHANT_SERVICE_ACCOUNT_B64,
              "base64"
          ).toString("utf-8")
      )
    : null;

const auth = credentials
    ? new GoogleAuth({
          credentials,
          scopes: ["https://www.googleapis.com/auth/content"],
      })
    : null;

export const getAccessToken = async () => {
    if (!auth) {
        throw new Error(
            "Google Merchant service account not configured (missing env var)"
        );
    }
    const client = await auth.getClient();
    const tokenResponse = await client.getAccessToken();
    return tokenResponse.token;
};

export const MERCHANT_ID = process.env.GOOGLE_MERCHANT_ID;
export const DATASOURCE_ID = process.env.GOOGLE_MERCHANT_DATASOURCE_ID;
export const MERCHANT_API_BASE = "https://merchantapi.googleapis.com/products/v1";