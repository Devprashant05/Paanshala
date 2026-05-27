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
  Sparkles,
  ArrowLeft,
} from "lucide-react";

/* ─────────────────────────────────────────
   MARKDOWN PARSER - Converts markdown to HTML
───────────────────────────────────────── */
function parseMarkdown(md) {
  if (!md) return "";

  let html = md
    // Escape HTML
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")

    // Headings
    .replace(
      /^### (.+)$/gm,
      '<h3 class="text-xl font-normal text-[#1a1a1a] mt-12 mb-4 uppercase tracking-wider">$1</h3>',
    )
    .replace(
      /^## (.+)$/gm,
      '<h2 class="text-2xl font-normal text-[#1a1a1a] mt-14 mb-5 uppercase tracking-wider">$1</h2>',
    )
    .replace(
      /^# (.+)$/gm,
      '<h1 class="text-3xl font-normal text-[#1a1a1a] mt-16 mb-6 uppercase tracking-wider">$1</h1>',
    )

    // Bold + italic
    .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
    .replace(
      /\*\*(.+?)\*\*/g,
      '<strong class="font-bold text-[#1a1a1a]">$1</strong>',
    )
    .replace(/\*(.+?)\*/g, '<em class="italic text-[#d4a574]">$1</em>')

    // Blockquote
    .replace(
      /^&gt; (.+)$/gm,
      '<blockquote class="border-l-4 border-[#d4a574] pl-6 py-0 my-6"><p class="text-base text-gray-dark italic leading-relaxed">$1</p></blockquote>',
    )

    // Horizontal rule
    .replace(/^---$/gm, '<hr class="my-10 border-0 h-0.5 bg-linear-to-r from-transparent via-[#d4a574] to-transparent" />')

    // Unordered list items (process before paragraphs)
    .replace(
      /^- (.+)$/gm,
      '<li class="flex items-start gap-2 text-base text-gray-dark leading-[1.8] my-2.5"><span class="w-2 h-2 rounded-sm bg-[#d4a574] shrink-0 mt-[0.65em] rotate-45"></span><span>$1</span></li>',
    )

    // Ordered list items
    .replace(
      /^\d+\. (.+)$/gm,
      '<li class="list-decimal list-inside text-base text-gray-dark leading-[1.8] ml-2">$1</li>',
    )

    // Wrap consecutive <li> tags in <ul>
    .replace(
      /(<li[\s\S]*?<\/li>\n?)+/g,
      (match) => `<ul class="my-6 list-none pl-0">${match}</ul>`,
    )

    // Paragraphs — lines that aren't already tags
    .replace(
      /^(?!\s*<)(?!\s*$)(.+)$/gm,
      '<p class="text-base text-gray-dark leading-[1.9] my-5">$1</p>',
    )

    // Links
    .replace(/\[(.+?)\]\((.+?)\)/g, (_, text, url) => {
      const isExternal = /^https?:\/\//.test(url);
      return `<a href="${url}" class="text-[#264B0E] no-underline font-semibold hover:text-gold-bright transition-colors" ${isExternal ? 'target="_blank" rel="noopener noreferrer"' : ""}>${text}</a>`;
    })

    // Inline code
    .replace(
      /`(.+?)`/g,
      '<code class="font-mono text-sm bg-[#f5e6d3] px-2 py-1 rounded text-[#264B0E] font-semibold">$1</code>',
    );

  return html;
}

/* ─────────────────────────────────────────
   READING PROGRESS BAR
───────────────────────────────────────── */
function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docH > 0 ? Math.min((window.scrollY / docH) * 100, 100) : 0);
    };
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1">
      <div
        className="h-full bg-linear-to-r from-[#264B0E] to-gold-bright transition-all duration-100"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

export default function BlogDetailsPage() {
  const { slug } = useParams();
  const { currentBlog, fetchBlogBySlug, loading } = useBlogStore();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchBlogBySlug(slug);
    }
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
      <div className="min-h-screen flex items-center justify-center bg-cream-light">
        <div className="text-center">
          <h2 className="text-heading text-3xl text-[#1a1a1a] mb-4">
            Article Not Found
          </h2>
          <p className="text-[#6b6b6b] mb-8 text-lg">
            The article you're looking for doesn't exist.
          </p>
          <Link
            href="/journal"
            className="btn btn-primary inline-flex items-center gap-2"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
            Back to Paan Journal
          </Link>
        </div>
      </div>
    );
  }

  return (
    <article className="min-h-screen bg-cream-light">
      <ReadingProgress />

      {/* HERO SECTION */}
      <section className="relative h-[55vh] md:h-[70vh] lg:h-[85vh] flex items-end overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src={blogData.coverImage}
            alt={blogData.title}
            fill
            className="object-cover object-center"
            priority
          />
          {/* Premium Overlay */}
          <div className="absolute inset-0 bg-linear-to-t from-[#1a1a1a]/95 via-[#1a1a1a]/60 to-transparent" />
          <div className="absolute inset-0 bg-linear-to-r from-[#264B0E]/20 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative max-w-6xl mx-auto px-4 md:px-8 pb-16 md:pb-20 w-full">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm font-medium text-sage-light mb-8">
            <Link href="/" className="hover:text-gold-bright transition-colors uppercase tracking-wide">
              Home
            </Link>
            <ChevronRight className="w-4 h-4" />
            <Link
              href="/journal"
              className="hover:text-gold-bright transition-colors uppercase tracking-wide"
            >
              Paan Journal
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gold-bright truncate max-w-50 md:max-w-none uppercase tracking-wide">
              Article
            </span>
          </div>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-sage-light mb-8">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
              <Calendar className="w-4 h-4 text-gold-bright" />
              <span className="uppercase tracking-wide">
                {new Date(
                  blogData.publishedAt || blogData.createdAt,
                ).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
              <Clock className="w-4 h-4 text-gold-bright" />
              <span className="uppercase tracking-wide">5 min read</span>
            </div>
            {blogData.author && (
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <User className="w-4 h-4 text-gold-bright" />
                <span className="uppercase tracking-wide">{blogData.author}</span>
              </div>
            )}
          </div>

          {/* Title with Gold Accent Bar */}
          <div className="mb-6">
            <div className="w-20 h-1 bg-linear-to-r from-gold-bright to-[#d4a574] mb-6"></div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-heading text-4xl md:text-5xl lg:text-6xl text-white mb-6 leading-tight max-w-4xl"
              style={{ fontFamily: 'var(--font-special-gothic-condensed-one)' }}
            >
              {blogData.title}
            </motion.h1>
          </div>

          {/* Excerpt */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-[#f5e6d3] max-w-3xl leading-relaxed font-light"
          >
            {blogData.excerpt}
          </motion.p>
        </div>
      </section>

      {/* CONTENT SECTION */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Sidebar - Social Share */}
          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-24">
              <div className="flex lg:flex-col items-center lg:items-start gap-4">
                <p className="text-heading text-sm text-[#264B0E] mb-0 lg:mb-4 uppercase tracking-wider">
                  Share
                </p>

                <div className="flex lg:flex-col gap-3">
                  <button
                    onClick={() => handleShare("facebook")}
                    className="w-12 h-12 rounded-full bg-white hover:bg-[#1877F2] border-2 border-[#e5e5e5] hover:border-[#1877F2] flex items-center justify-center transition-all duration-300 group shadow-md hover:shadow-lg"
                    aria-label="Share on Facebook"
                  >
                    <Facebook className="w-5 h-5 text-[#6b6b6b] group-hover:text-white transition-colors" />
                  </button>

                  <button
                    onClick={() => handleShare("twitter")}
                    className="w-12 h-12 rounded-full bg-white hover:bg-[#1DA1F2] border-2 border-[#e5e5e5] hover:border-[#1DA1F2] flex items-center justify-center transition-all duration-300 group shadow-md hover:shadow-lg"
                    aria-label="Share on Twitter"
                  >
                    <Twitter className="w-5 h-5 text-[#6b6b6b] group-hover:text-white transition-colors" />
                  </button>

                  <button
                    onClick={() => handleShare("linkedin")}
                    className="w-12 h-12 rounded-full bg-white hover:bg-[#0A66C2] border-2 border-[#e5e5e5] hover:border-[#0A66C2] flex items-center justify-center transition-all duration-300 group shadow-md hover:shadow-lg"
                    aria-label="Share on LinkedIn"
                  >
                    <Linkedin className="w-5 h-5 text-[#6b6b6b] group-hover:text-white transition-colors" />
                  </button>

                  <button
                    onClick={handleCopyLink}
                    className="w-12 h-12 rounded-full bg-white hover:bg-gold-bright border-2 border-[#e5e5e5] hover:border-gold-bright flex items-center justify-center transition-all duration-300 group shadow-md hover:shadow-lg"
                    aria-label="Copy link"
                  >
                    {copied ? (
                      <Check className="w-5 h-5 text-[#264B0E]" />
                    ) : (
                      <Copy className="w-5 h-5 text-[#6b6b6b] group-hover:text-[#264B0E] transition-colors" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-10">
            {/* Premium Content Card */}
            <div className="card-premium p-8 md:p-12 lg:p-16">
              {/* Gold Accent */}
              <div className="flex items-center gap-3 mb-8">
                {/* <Sparkles className="w-5 h-5 text-gold-bright" /> */}
                <div className="h-px flex-1 bg-linear-to-r from-gold-bright via-[#d4a574] to-transparent"></div>
              </div>

              {/* Rendered Markdown Content */}
              <div
                className="blog-content"
                dangerouslySetInnerHTML={{ __html: parseMarkdown(blogData.content) }}
              />

              {/* Bottom Gold Accent */}
              <div className="flex items-center gap-3 mt-12">
                <div className="h-px flex-1 bg-linear-to-r from-transparent via-[#d4a574] to-gold-bright"></div>
                {/* <Sparkles className="w-5 h-5 text-gold-bright" /> */}
              </div>
            </div>

            {/* Back to Journal Button */}
            <div className="mt-8">
              <Link
                href="/journal"
                className="inline-flex items-center gap-2 h-12 px-6 rounded-xl border-2 border-[#264B0E] text-[#264B0E] font-semibold hover:bg-[#264B0E] hover:text-white transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Paan Journal
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* BACK TO JOURNAL CTA */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 pb-24">
        <div className="bg-premium-gradient rounded-3xl p-10 md:p-16 text-center relative overflow-hidden shadow-2xl">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold-bright/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            
            <h3 className="text-heading text-3xl md:text-4xl lg:text-5xl text-white mb-6">
              Enjoyed This Article?
            </h3>
            <p className="text-sage-light text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
              Explore more stories, traditions, and insights from the world of
              paan culture in our premium journal.
            </p>
            <Link
              href="/journal"
              className="btn-gold btn-lg inline-flex items-center gap-3 shadow-2xl hover:shadow-gold"
            >
              <ChevronRight className="w-5 h-5 rotate-180" />
              Back to Paan Journal
            </Link>
          </div>
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
    <div className="min-h-screen bg-cream-light">
      {/* Hero Skeleton */}
      <div className="relative h-128 md:h-160 bg-[#e5e5e5] animate-pulse">
        <div className="absolute bottom-0 left-0 right-0 p-12 md:p-20">
          <div className="max-w-6xl mx-auto">
            <div className="h-4 bg-white/30 rounded-full w-64 mb-8" />
            <div className="h-3 bg-white/30 rounded-full w-48 mb-6" />
            <div className="w-20 h-1 bg-white/40 mb-6" />
            <div className="h-16 bg-white/30 rounded-xl w-3/4 mb-6" />
            <div className="h-6 bg-white/30 rounded-lg w-2/3" />
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-2">
            <div className="flex lg:flex-col gap-3">
              <div className="w-12 h-12 bg-white border-2 border-[#e5e5e5] rounded-full animate-pulse" />
              <div className="w-12 h-12 bg-white border-2 border-[#e5e5e5] rounded-full animate-pulse" />
              <div className="w-12 h-12 bg-white border-2 border-[#e5e5e5] rounded-full animate-pulse" />
            </div>
          </div>
          
          <div className="lg:col-span-10">
            <div className="bg-white rounded-3xl border-2 border-[#d4a574] shadow-2xl p-12 lg:p-16 animate-pulse">
              <div className="space-y-6">
                <div className="h-4 bg-[#e5e5e5] rounded-full w-full" />
                <div className="h-4 bg-[#e5e5e5] rounded-full w-full" />
                <div className="h-4 bg-[#e5e5e5] rounded-full w-3/4" />
                <div className="h-64 bg-[#e5e5e5] rounded-2xl my-12" />
                <div className="h-4 bg-[#e5e5e5] rounded-full w-full" />
                <div className="h-4 bg-[#e5e5e5] rounded-full w-5/6" />
                <div className="h-4 bg-[#e5e5e5] rounded-full w-4/5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}