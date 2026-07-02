import { notFound } from "next/navigation";
import JournalDetailClient from "./JournalDetailClient";
import { getBlogPostingSchema } from "@/lib/schema/blogPosting";

const BASE_URL = "https://paanshala.com";
const API_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8080/api"
    : `${process.env.NEXT_PUBLIC_API_URL}/api`;

/* =========================
   DATA FETCH — shared by generateMetadata and the page itself.
   Next.js automatically dedupes identical fetch() calls within the
   same request, so this doesn't double-hit your backend even though
   it's called from two places.
========================= */
async function getBlog(slug) {
  try {
    const res = await fetch(`${API_URL}/blogs/${slug}`, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) return null;

    const data = await res.json();
    // Adjust this line if your controller returns the blog object
    // wrapped differently than { success, blog }
    return data?.blog || null;
  } catch (err) {
    console.error("getBlog: failed to fetch blog for slug", slug, err);
    return null;
  }
}

/* =========================
   GENERATE METADATA
========================= */
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const blog = await getBlog(slug);

  if (!blog) {
    return {
      title: "Journal",
      robots: { index: false, follow: false },
    };
  }

  const pageTitle = blog.seo?.title || blog.title;
  const pageDescription = blog.seo?.description || blog.excerpt;
  const canonicalUrl = `${BASE_URL}/journal/${blog.slug}`;

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
      type: "article",
      locale: "en_IN",
      url: canonicalUrl,
      siteName: "Paanshala",
      title: pageTitle,
      description: pageDescription,
      publishedTime: blog.publishedAt,
      modifiedTime: blog.updatedAt,
      authors: [blog.author || "Paanshala Team"],
      images: [
        {
          url: blog.coverImage,
          width: 1200,
          height: 630,
          alt: blog.title,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: pageDescription,
      images: [blog.coverImage],
    },
  };
}

/* =========================
   PAGE — Server Component
   Fetches blog once (deduped with generateMetadata's fetch),
   404s cleanly if not found/unpublished, injects BlogPosting
   schema, then hands off to the Client Component for interactivity.
========================= */
export default async function JournalDetailPage({ params }) {
  const { slug } = await params;
  const blog = await getBlog(slug);

  if (!blog) {
    notFound();
  }

  const schema = getBlogPostingSchema(blog);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <JournalDetailClient blog={blog} />
    </>
  );
}