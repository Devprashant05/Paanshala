const BASE_URL = "https://paanshala.com";
const API_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8080/api"
    : `${process.env.NEXT_PUBLIC_API_URL}/api`;

async function getProductBySlug(slug) {
  try {
    const res = await fetch(`${API_URL}/products/${slug}`, {
      next: { revalidate: 1800 }, // 30 min — prices/stock change more often than blog/category content
    });
    if (!res.ok) return null;

    const data = await res.json();
    // Adjust if your controller wraps the response differently
    return data?.product || null;
  } catch (err) {
    console.error("getProductBySlug: failed for slug", slug, err);
    return null;
  }
}

/* =========================
   GENERATE METADATA — dynamic per product
========================= */
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Product",
      robots: { index: false, follow: false },
    };
  }

  const canonicalUrl = `${BASE_URL}/shop/${product.slug}`;
  const pageTitle = product.seo?.title || `Buy ${product.name} Online`;
  const pageDescription =
    product.seo?.description ||
    (product.description
      ? product.description.slice(0, 155)
      : `Order ${product.name} online from Paanshala. Premium quality, delivered fresh across Delhi NCR.`);

  const isOutOfStock = product.variants?.length
    ? product.variants.every((v) => (v.stock ?? 0) === 0)
    : (product.stock ?? 0) === 0;

  return {
    title: `${pageTitle} | Paanshala`,
    description: pageDescription,
    keywords: product.seo?.keywords?.length ? product.seo.keywords : undefined,

    alternates: {
      canonical: canonicalUrl,
    },

    robots: {
      // Out-of-stock products stay indexed (they'll restock) unless inactive —
      // inactive ones never reach this page since getAllProducts filters them out server-side
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
      },
    },

    openGraph: {
      type: "website", // note: schema.org "product" isn't a valid OG type; "website" is correct here
      locale: "en_IN",
      url: canonicalUrl,
      siteName: "Paanshala",
      title: pageTitle,
      description: pageDescription,
      images: (product.images || []).slice(0, 4).map((img) => ({
        url: img,
        width: 1200,
        height: 1200,
        alt: product.name,
      })),
    },

    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: pageDescription,
      images: product.images?.[0] ? [product.images[0]] : [],
    },

    other: {
      // Some crawlers/aggregators still read these OG product extension tags
      "product:availability": isOutOfStock ? "out of stock" : "in stock",
      "product:price:currency": "INR",
    },
  };
}

/* =========================
   SCHEMA — Product + Offer/AggregateOffer + AggregateRating + Breadcrumb
========================= */
function buildProductSchema(product) {
  const canonicalUrl = `${BASE_URL}/shop/${product.slug}`;
  const categoryName =
    (product.category && typeof product.category === "object"
      ? product.category.name
      : null) || "Paan";

  let offers;

  if (product.variants?.length > 0) {
    // Multiple variants (paan set sizes, or weight options) → AggregateOffer
    const prices = product.variants.map((v) => v.discountedPrice);
    const inStock = product.variants.some((v) => (v.stock ?? 0) > 0);

    offers = {
      "@type": "AggregateOffer",
      priceCurrency: "INR",
      lowPrice: Math.min(...prices),
      highPrice: Math.max(...prices),
      offerCount: product.variants.length,
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    };
  } else {
    const inStock = (product.stock ?? 0) > 0;
    offers = {
      "@type": "Offer",
      url: canonicalUrl,
      priceCurrency: "INR",
      price: product.discountedPrice,
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    };
  }

  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${canonicalUrl}#product`,
    name: product.name,
    description: product.description,
    image: product.images || [],
    sku: product._id,
    category: categoryName,
    brand: {
      "@type": "Brand",
      name: "Paanshala",
    },
    offers,
  };

  // Only include aggregateRating if there are real reviews —
  // fabricated/empty rating schema is a Google Merchant policy violation
  if (product.totalReviews > 0 && product.averageRating > 0) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: product.averageRating,
      reviewCount: product.totalReviews,
    };
  }

  return schema;
}

function buildBreadcrumbSchema(product) {
  const canonicalUrl = `${BASE_URL}/shop/${product.slug}`;
  const category =
    product.category && typeof product.category === "object"
      ? product.category
      : null;
  const parentCategory =
    product.parentCategory && typeof product.parentCategory === "object"
      ? product.parentCategory
      : null;

  const items = [
    { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
    { "@type": "ListItem", position: 2, name: "Shop", item: `${BASE_URL}/shop` },
  ];

  let position = 3;
  if (parentCategory && parentCategory.slug !== category?.slug) {
    items.push({
      "@type": "ListItem",
      position: position++,
      name: parentCategory.name,
      item: `${BASE_URL}/collections/${parentCategory.slug}`,
    });
  }
  if (category) {
    items.push({
      "@type": "ListItem",
      position: position++,
      name: category.name,
      item: `${BASE_URL}/collections/${category.slug}`,
    });
  }
  items.push({
    "@type": "ListItem",
    position: position,
    name: product.name,
    item: canonicalUrl,
  });

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items,
  };
}

/* =========================
   LAYOUT — page.jsx stays untouched as a client component
========================= */
export default async function ProductLayout({ children, params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return children;
  }

  const productSchema = buildProductSchema(product);
  const breadcrumbSchema = buildBreadcrumbSchema(product);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {children}
    </>
  );
}