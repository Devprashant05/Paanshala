"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { useBlogStore } from "@/stores/useBlogStore";
import {
  Calendar,
  Clock,
  ChevronRight,
  Facebook,
  Twitter,
  Linkedin,
  Copy,
  Check,
  User,
} from "lucide-react";

// Utility function to convert markdown to HTML
function parseMarkdown(markdown) {
  if (!markdown) return "";

  let html = markdown;

  // Convert headers
  html = html.replace(/^### (.*$)/gim, "<h3>$1</h3>");
  html = html.replace(/^## (.*$)/gim, "<h2>$1</h2>");
  html = html.replace(/^# (.*$)/gim, "<h1>$1</h1>");

  // Convert bold
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

  // Convert italic
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");

  // Convert horizontal rules
  html = html.replace(/^---$/gim, "<hr />");

  // Convert bullet lists
  html = html.replace(/^\- (.+)$/gim, "<li>$1</li>");
  html = html.replace(/(<li>.*<\/li>)/s, "<ul>$1</ul>");

  // Convert line breaks
  html = html.replace(/\r\n\r\n/g, "</p><p>");
  html = html.replace(/\n\n/g, "</p><p>");

  // Wrap in paragraphs if not already wrapped
  if (!html.startsWith("<")) {
    html = "<p>" + html + "</p>";
  }

  return html;
}

export default function BlogDetailsPage() {
  const { slug } = useParams();
  const { currentBlog, fetchBlogBySlug, loading } = useBlogStore();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchBlogBySlug(slug);
  }, [slug, fetchBlogBySlug]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = (platform) => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(currentBlog?.title || "");

    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      twitter: `https://twitter.com/intent/tweet?url=${url}&text=${title}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], "_blank", "width=600,height=400");
    }
  };

  // Get blog data - handle both direct and nested response
  const blogData = currentBlog?.blog || currentBlog;

  if (loading) {
    return <BlogDetailsSkeleton />;
  }

  if (!blogData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Article Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The article you're looking for doesn't exist.
          </p>
          <Link
            href="/journal"
            className="inline-flex items-center gap-2 text-[#d4af37] hover:text-[#f4d03f] font-semibold"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            Back to Journal
          </Link>
        </div>
      </div>
    );
  }

  // Parse markdown content to HTML
  const htmlContent = parseMarkdown(blogData.content);

  return (
    <article className="min-h-screen bg-linear-to-b from-white to-gray-50">
      {/* HERO SECTION */}
      <section className="relative h-125 md:h-150 flex items-end overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src={blogData.coverImage}
            alt={blogData.title}
            fill
            className="object-cover"
            priority
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/50 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative max-w-5xl mx-auto px-4 md:px-6 pb-12 md:pb-16 w-full">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-300 mb-6">
            <Link href="/" className="hover:text-[#d4af37] transition-colors">
              Home
            </Link>
            <ChevronRight className="w-4 h-4" />
            <Link
              href="/journal"
              className="hover:text-[#d4af37] transition-colors"
            >
              Journal
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white truncate max-w-50 md:max-w-none">
              {blogData.title}
            </span>
          </div>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300 mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>
                {new Date(
                  blogData.publishedAt || blogData.createdAt,
                ).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>5 min read</span>
            </div>
            {blogData.author && (
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{blogData.author}</span>
              </div>
            )}
          </div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight"
          >
            {blogData.title}
          </motion.h1>

          {/* Excerpt */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-200 max-w-3xl leading-relaxed"
          >
            {blogData.excerpt}
          </motion.p>
        </div>
      </section>

      {/* CONTENT SECTION */}
      <section className="max-w-4xl mx-auto px-4 md:px-6 py-16 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Sidebar - Social Share */}
          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-24">
              <div className="flex lg:flex-col items-center lg:items-start gap-3">
                <p className="text-sm font-semibold text-gray-700 mb-0 lg:mb-3">
                  Share
                </p>

                <div className="flex lg:flex-col gap-3">
                  <button
                    onClick={() => handleShare("facebook")}
                    className="w-10 h-10 rounded-full bg-gray-100 hover:bg-[#1877F2] flex items-center justify-center transition-colors group"
                    aria-label="Share on Facebook"
                  >
                    <Facebook className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
                  </button>

                  <button
                    onClick={() => handleShare("twitter")}
                    className="w-10 h-10 rounded-full bg-gray-100 hover:bg-[#1DA1F2] flex items-center justify-center transition-colors group"
                    aria-label="Share on Twitter"
                  >
                    <Twitter className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
                  </button>

                  <button
                    onClick={() => handleShare("linkedin")}
                    className="w-10 h-10 rounded-full bg-gray-100 hover:bg-[#0A66C2] flex items-center justify-center transition-colors group"
                    aria-label="Share on LinkedIn"
                  >
                    <Linkedin className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
                  </button>

                  <button
                    onClick={handleCopyLink}
                    className="w-10 h-10 rounded-full bg-gray-100 hover:bg-[#d4af37] flex items-center justify-center transition-colors group"
                    aria-label="Copy link"
                  >
                    {copied ? (
                      <Check className="w-5 h-5 text-white" />
                    ) : (
                      <Copy className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-10">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 md:p-12">
              <div
                className="prose prose-lg max-w-none
                  prose-headings:font-bold prose-headings:text-gray-900
                  prose-h1:text-4xl prose-h1:mt-8 prose-h1:mb-6
                  prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
                  prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
                  prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-6
                  prose-a:text-[#d4af37] prose-a:no-underline hover:prose-a:text-[#f4d03f]
                  prose-strong:text-gray-900 prose-strong:font-semibold
                  prose-ul:my-6 prose-ul:list-disc prose-ul:pl-6
                  prose-li:my-2 prose-li:text-gray-700 prose-li:leading-relaxed
                  prose-img:rounded-xl prose-img:shadow-lg prose-img:my-8
                  prose-blockquote:border-l-4 prose-blockquote:border-[#d4af37] 
                  prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-gray-700
                  prose-code:text-[#d4af37] prose-code:bg-gray-100 prose-code:px-2 prose-code:py-1 prose-code:rounded
                  prose-hr:my-8 prose-hr:border-gray-200"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* BACK TO JOURNAL CTA */}
      <section className="max-w-4xl mx-auto px-4 md:px-6 pb-20">
        <div className="bg-linear-to-r from-[#0b1f11] to-[#1a3d22] rounded-2xl p-8 md:p-12 text-center">
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Enjoyed This Article?
          </h3>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Explore more stories, traditions, and insights from the world of
            paan culture.
          </p>
          <Link
            href="/journal"
            className="inline-flex items-center gap-3 bg-linear-to-r from-[#d4af37] to-[#f4d03f] text-[#0b1f11] px-8 py-4 rounded-xl font-semibold hover:scale-105 transition-all duration-300 shadow-lg"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
            Back to Paan Journal
          </Link>
        </div>
      </section>
    </article>
  );
}

/* ======================
   BLOG DETAILS SKELETON
====================== */

function BlogDetailsSkeleton() {
  return (
    <div className="min-h-screen bg-linear-to-b from-white to-gray-50">
      {/* Hero Skeleton */}
      <div className="relative h-125 md:h-150 bg-gray-200 animate-pulse">
        <div className="absolute bottom-0 left-0 right-0 p-12">
          <div className="max-w-5xl mx-auto">
            <div className="h-4 bg-gray-300 rounded w-64 mb-6" />
            <div className="h-12 bg-gray-300 rounded w-3/4 mb-4" />
            <div className="h-6 bg-gray-300 rounded w-2/3" />
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-20">
        <div className="bg-white rounded-2xl shadow-lg p-12 animate-pulse">
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-64 bg-gray-200 rounded my-8" />
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
          </div>
        </div>
      </div>
    </div>
  );
}
