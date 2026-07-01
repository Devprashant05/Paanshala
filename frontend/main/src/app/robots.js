const BASE_URL = "https://paanshala.com";

export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          // Account / auth — no search value, some contain session-specific data
          "/login",
          "/register",
          "/forgot-password",
          "/profile",
          "/profile/*",

          // Transactional — must never be indexed (duplicate/empty-state pages, PII risk)
          "/cart",
          "/checkout",
          "/guest-checkout",
          "/order-success",
          "/orders",
          "/orders/*",

          // Utility — no unique indexable content
          "/wishlist",
          "/search",
          "/search?*",

          // Internal/admin (if same domain)
          "/admin",
          "/admin/*",
          "/api/*",

          // Query params that create duplicate/near-duplicate crawlable URLs
          "/shop/*?*",
          "/collections/*?*",
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
