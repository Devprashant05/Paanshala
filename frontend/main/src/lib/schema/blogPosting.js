// lib/schema/blogPosting.js
// Call this from journal/[slug]/page.jsx (the Server Component that
// fetches the blog data) and inject via <script type="application/ld+json">

export function getBlogPostingSchema(blog) {
  const BASE_URL = "https://paanshala.com";

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${BASE_URL}/journal/${blog.slug}#article`,
    headline: blog.title,
    description: blog.excerpt,
    image: blog.coverImage,
    datePublished: blog.publishedAt,
    dateModified: blog.updatedAt || blog.publishedAt,
    author: {
      "@type": "Organization",
      name: blog.author || "Paanshala Team",
    },
    publisher: {
      "@type": "Organization",
      name: "Paanshala",
      logo: {
        "@type": "ImageObject",
        url: `${BASE_URL}/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${BASE_URL}/journal/${blog.slug}`,
    },
  };
}
