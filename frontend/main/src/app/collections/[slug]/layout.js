const BASE_URL = "https://paanshala.com";
const API_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8080/api"
    : `${process.env.NEXT_PUBLIC_API_URL}/api`;

/* =========================
   HELPER: flatten category tree + find by slug
   Same pattern as the sitemap — getActiveCategories returns a nested
   tree, so we flatten it and search for the matching slug, keeping
   track of the parent for breadcrumb/canonical purposes.
========================= */
function findCategoryBySlug(nodes, slug, parent = null) {
  for (const node of nodes) {
    if (node.slug === slug) {
      return { category: node, parent };
    }
    if (node.children?.length) {
      const found = findCategoryBySlug(node.children, slug, node);
      if (found) return found;
    }
  }
  return null;
}

async function getCategoryBySlug(slug) {
  try {
    const res = await fetch(`${API_URL}/categories`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;

    const data = await res.json();
    const tree = data?.categories || [];
    return findCategoryBySlug(tree, slug);
  } catch (err) {
    console.error("getCategoryBySlug: failed for slug", slug, err);
    return null;
  }
}

/* =========================
   GENERATE METADATA — dynamic per category
========================= */
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const result = await getCategoryBySlug(slug);

  if (!result) {
    return {
      title: "Collection",
      robots: { index: false, follow: false },
    };
  }

  const { category, parent } = result;
  const canonicalUrl = `${BASE_URL}/collections/${category.slug}`;

  // Dynamic, keyword-specific title per category — e.g.
  // "Buy Meetha Paan Online" instead of one generic title for all collections
  const pageTitle = `Buy ${category.name} Online`;
  const pageDescription = `Order premium ${category.name} online from Paanshala. Fresh, authentic, and delivered across Delhi NCR. Shop the full ${category.name} collection now.`;

  return {
    title: pageTitle,
    description: pageDescription,

    alternates: {
      canonical: canonicalUrl,
    },

    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
      },
    },

    openGraph: {
      type: "website",
      locale: "en_IN",
      url: canonicalUrl,
      siteName: "Paanshala",
      title: `${pageTitle} | Paanshala`,
      description: pageDescription,
      images: [
        {
          url: "https://paanshala.com/og-image.jpg",
          width: 1200,
          height: 630,
          alt: `Paanshala ${category.name} Collection`,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title: `${pageTitle} | Paanshala`,
      description: pageDescription,
      images: ["https://paanshala.com/og-image.jpg"],
    },
  };
}

/* =========================
   LAYOUT — injects CollectionPage + BreadcrumbList schema,
   passes the existing client page.jsx through untouched
========================= */
export default async function CollectionLayout({ children, params }) {
  const { slug } = await params;
  const result = await getCategoryBySlug(slug);

  if (!result) {
    return children;
  }

  const { category, parent } = result;
  const canonicalUrl = `${BASE_URL}/collections/${category.slug}`;

  const breadcrumbItems = [
    { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
  ];

  if (parent) {
    breadcrumbItems.push({
      "@type": "ListItem",
      position: 2,
      name: parent.name,
      item: `${BASE_URL}/collections/${parent.slug}`,
    });
    breadcrumbItems.push({
      "@type": "ListItem",
      position: 3,
      name: category.name,
      item: canonicalUrl,
    });
  } else {
    breadcrumbItems.push({
      "@type": "ListItem",
      position: 2,
      name: category.name,
      item: canonicalUrl,
    });
  }

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${canonicalUrl}#collectionpage`,
        name: `Buy ${category.name} Online`,
        url: canonicalUrl,
        isPartOf: { "@id": "https://paanshala.com/#website" },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: breadcrumbItems,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      {children}
    </>
  );
}
