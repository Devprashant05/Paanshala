const BASE_URL = "https://paanshala.com";
const API_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8080/api"
    : `${process.env.NEXT_PUBLIC_API_URL}/api`;

/* =========================
   HELPER: flatten category tree
   getActiveCategories returns nested { ...cat, children: [...] }
   We need every level (root + sub) as flat slugs for the sitemap.
========================= */
function flattenCategories(nodes, acc = []) {
  for (const node of nodes) {
    acc.push(node);
    if (node.children && node.children.length > 0) {
      flattenCategories(node.children, acc);
    }
  }
  return acc;
}

export default async function sitemap() {
  /* =========================
     STATIC ROUTES
  ========================= */
  const staticPages = [
    {
      url: `${BASE_URL}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/paan-catering`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/journal`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/create-your-paan`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/bulk-order`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/our-story`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/get-in-touch`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/shipping`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/return-policy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.2,
    },
    // Intentionally excluded: /cart, /checkout, /guest-checkout, /login, /register,
    // /forgot-password, /profile, /wishlist, /search, /orders, /order-success, /career
  ];

  /* =========================
     PRODUCTS → /shop/[slug]
     getAllProducts hardcodes isActive:true server-side — no client filtering needed.
  ========================= */
  let productPages = [];
  try {
    const res = await fetch(`${API_URL}/products`, {
      next: { revalidate: 3600 }, // re-fetch at most once/hour — sitemap doesn't need real-time
    });
    const data = await res.json();

    productPages = (data?.products || [])
      .filter((p) => p.slug)
      .map((p) => ({
        url: `${BASE_URL}/shop/${p.slug}`,
        lastModified: p.updatedAt || new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      }));
  } catch (err) {
    console.error("sitemap: failed to fetch products", err);
    // Fail gracefully — a broken products fetch shouldn't take down the whole sitemap
  }

  /* =========================
     CATEGORIES → /collections/[slug]
     Response is a nested tree (root + children) — flatten before mapping.
  ========================= */
  let categoryPages = [];
  try {
    const res = await fetch(`${API_URL}/categories`, {
      next: { revalidate: 3600 },
    });
    const data = await res.json();

    const flatCategories = flattenCategories(data?.categories || []);

    categoryPages = flatCategories
      .filter((c) => c.slug)
      .map((c) => ({
        url: `${BASE_URL}/collections/${c.slug}`,
        lastModified: c.updatedAt || new Date(),
        changeFrequency: c.parent ? "weekly" : "daily",
        priority: c.parent ? 0.75 : 0.9,
      }));
  } catch (err) {
    console.error("sitemap: failed to fetch categories", err);
  }

  /* =========================
     BLOGS → /journal/[slug]
     getBlogs already filters isPublished:true server-side.
  ========================= */
  let blogPages = [];
  try {
    const res = await fetch(`${API_URL}/blogs`, {
      next: { revalidate: 3600 },
    });
    const data = await res.json();

    blogPages = (data?.blogs || [])
      .filter((b) => b.slug)
      .map((b) => ({
        url: `${BASE_URL}/journal/${b.slug}`,
        lastModified: b.updatedAt || b.publishedAt || new Date(),
        changeFrequency: "monthly",
        priority: 0.65,
      }));
  } catch (err) {
    console.error("sitemap: failed to fetch blogs", err);
  }

  return [...staticPages, ...productPages, ...categoryPages, ...blogPages];
}
