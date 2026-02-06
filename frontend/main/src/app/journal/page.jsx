"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useBlogStore } from "@/stores/useBlogStore";
import {
  Calendar,
  ArrowRight,
  ChevronRight,
  Sparkles,
  Clock,
} from "lucide-react";

export default function JournalPage() {
  const { blogs, featuredBlogs, fetchBlogs, fetchFeaturedBlogs, loading } =
    useBlogStore();

  useEffect(() => {
    fetchBlogs();
    fetchFeaturedBlogs();
  }, [fetchBlogs, fetchFeaturedBlogs]);

  return (
    <div className="min-h-screen bg-linear-to-b from-white to-gray-50">
      {/* HERO SECTION */}
      <section className="relative h-100 md:h-125 flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/footer-bg.png"
            alt="Paan Journal"
            fill
            priority
            className="object-cover"
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-linear-to-b from-[#0b1f11]/95 via-[#0b1f11]/85 to-[#0b1f11]/95" />
        </div>

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 md:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-[#d4af37]/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-[#d4af37]" />
              <span className="text-sm font-medium text-[#d4af37]">
                Stories & Traditions
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Paan Journal
            </h1>

            <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Discover the rich heritage, craftsmanship, and stories behind
              India's beloved paan culture
            </p>

            {/* Breadcrumb */}
            <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
              <Link
                href="/"
                className="hover:text-[#d4af37] transition-colors"
              >
                Home
              </Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-white">Paan Journal</span>
            </div>
          </motion.div>
        </div>

        {/* Decorative gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-linear-to-t from-white to-transparent" />
      </section>

      {/* FEATURED BLOGS */}
      {featuredBlogs.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 md:px-6 -mt-8 relative z-10 mb-16">
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Featured Stories
            </h2>
            <p className="text-gray-600">
              Our most popular articles and stories
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {featuredBlogs.slice(0, 2).map((blog, index) => (
              <FeaturedBlogCard key={blog._id} blog={blog} index={index} />
            ))}
          </div>
        </section>
      )}

      {/* ALL BLOGS GRID */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 pb-20">
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Latest Articles
          </h2>
          <p className="text-gray-600">
            Explore our collection of stories and insights
          </p>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <BlogCardSkeleton key={i} />
            ))}
          </div>
        ) : blogs.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog, index) => (
              <BlogCard key={blog._id} blog={blog} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Articles Yet
            </h3>
            <p className="text-gray-600">
              Check back soon for new stories and insights
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

/* ======================
   FEATURED BLOG CARD
====================== */

function FeaturedBlogCard({ blog, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
    >
      <Link
        href={`/journal/${blog.slug}`}
        className="group relative block rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 h-100 md:h-112.5"
      >
        {/* Image */}
        <Image
          src={blog.coverImage}
          alt={blog.title}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-700"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/50 to-transparent" />

        {/* Badge */}
        <div className="absolute top-4 left-4">
          <div className="inline-flex items-center gap-2 bg-[#d4af37]/90 backdrop-blur-sm px-3 py-1 rounded-full">
            <Sparkles className="w-3 h-3 text-white" />
            <span className="text-xs font-semibold text-white">Featured</span>
          </div>
        </div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <div className="flex items-center gap-4 text-sm text-gray-300 mb-3">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{new Date(blog.publishedAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>5 min read</span>
            </div>
          </div>

          <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 line-clamp-2">
            {blog.title}
          </h3>

          <p className="text-gray-200 line-clamp-2 mb-4">{blog.excerpt}</p>

          <span className="inline-flex items-center gap-2 text-[#d4af37] font-semibold group-hover:gap-3 transition-all">
            Read Article
            <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

/* ======================
   BLOG CARD
====================== */

function BlogCard({ blog, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
    >
      <Link
        href={`/journal/${blog.slug}`}
        className="group block bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 h-full"
      >
        {/* Image */}
        <div className="relative h-56 overflow-hidden">
          <Image
            src={blog.coverImage}
            alt={blog.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Meta */}
          <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{new Date(blog.publishedAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>5 min</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-[#d4af37] transition-colors">
            {blog.title}
          </h3>

          {/* Excerpt */}
          <p className="text-sm text-gray-600 line-clamp-3 mb-4 leading-relaxed">
            {blog.excerpt}
          </p>

          {/* CTA */}
          <span className="inline-flex items-center gap-2 text-[#d4af37] text-sm font-semibold group-hover:gap-3 transition-all">
            Read More
            <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

/* ======================
   BLOG CARD SKELETON
====================== */

function BlogCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-lg animate-pulse">
      <div className="h-56 bg-gray-200" />
      <div className="p-6">
        <div className="flex gap-4 mb-3">
          <div className="h-4 bg-gray-200 rounded w-24" />
          <div className="h-4 bg-gray-200 rounded w-16" />
        </div>
        <div className="h-6 bg-gray-200 rounded mb-3" />
        <div className="h-4 bg-gray-200 rounded mb-2" />
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4" />
        <div className="h-4 bg-gray-200 rounded w-24" />
      </div>
    </div>
  );
}