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
  ChevronLeft,
  User,
} from "lucide-react";

export default function JournalPage() {
  const { blogs, featuredBlogs, fetchBlogs, fetchFeaturedBlogs, loading } =
    useBlogStore();

  useEffect(() => {
    fetchBlogs();
    fetchFeaturedBlogs();
  }, [fetchBlogs, fetchFeaturedBlogs]);

  return (
    <div className="min-h-screen bg-linear-to-b from-white via-[#f5f2eb] to-white">
      {/* ══════════════════════════════════════
          HERO SECTION - Simple, No Image
      ══════════════════════════════════════ */}
      <section className="relative bg-linear-to-br from-[#264B0E] via-[#2d5016] to-[#264B0E] py-14">
        <div className="max-w-7xl mx-auto px-4 md:px-6 text-left">
          {/* Breadcrumb */}
          <div className="flex items-center justify-start gap-2 text-body text-sm text-white/60">
            <Link href="/" className="hover:text-gold-bright transition-colors">
              Home
            </Link>
            <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
            <span className="text-white">Paan Stories</span>
          </div>

          <h1 className="text-heading text-6xl font-bold text-white mb-4 mt-2 uppercase tracking-wide">
           Paan Stories
          </h1>

          <p className="text-body text-lg md:text-xl text-white/80 max-w-3xl mb-8">
            Discover the rich heritage, craftsmanship, and stories behind
              India's beloved paan culture
          </p>
        </div>
      </section>

      {/* FEATURED SECTION - Hero Card */}
      {featuredBlogs.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-16">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl group">
            <FeaturedHeroCard blog={featuredBlogs[0]} />
          </div>
        </section>
      )}

      {/* ALL BLOGS GRID - Card Style */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 pb-20">
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <BlogCardSkeleton key={i} />
            ))}
          </div>
        ) : blogs.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog, index) => (
              <BlogCard key={blog._id} blog={blog} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-heading text-xl font-bold text-gray-900 mb-2 uppercase">
              No Articles Yet
            </h3>
            <p className="text-body text-gray-600">
              Check back soon for new stories and insights
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FEATURED HERO CARD - Large Horizontal Card
═══════════════════════════════════════════════════════════════ */
function FeaturedHeroCard({ blog }) {
  return (
    <Link href={`/journal/${blog.slug}`} className="group block">
      <div className="grid grid-cols-1 lg:grid-cols-5 min-h-100 lg:min-h-112.5">
        {/* Left - Image */}
        <div className="relative lg:col-span-2 h-64 lg:h-auto overflow-hidden">
          <Image
            src={blog.coverImage}
            alt={blog.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-linear-to-r from-transparent to-[#d4af37]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        {/* Right - Content */}
        <div className="lg:col-span-3 bg-linear-to-br from-[#d4af37] via-[#e0b955] to-[#d4af37] p-8 md:p-12 flex flex-col justify-center">
          {/* Read Time */}
          <div className="flex items-center gap-2 text-black/70 text-sm font-bold mb-4 uppercase tracking-wider">
            <Clock className="w-4 h-4" />
            <span>5 minute read</span>
          </div>

          {/* Title */}
          <h2 className="text-heading text-3xl md:text-4xl lg:text-5xl font-black text-black mb-6 uppercase leading-tight line-clamp-3 group-hover:text-white transition-colors duration-300">
            {blog.title}
          </h2>

          {/* Excerpt */}
          <p className="text-body text-black/80 text-base md:text-lg leading-relaxed mb-8 line-clamp-3">
            {blog.excerpt}
          </p>

          {/* CTA Button */}
          <div>
            <span className="inline-flex items-center gap-3 bg-black text-white px-8 py-4 rounded-full font-bold uppercase tracking-wider text-sm group-hover:bg-[#0b1f11] transition-all duration-300 group-hover:gap-4">
              Read More
              <ArrowRight className="w-5 h-5" strokeWidth={3} />
            </span>
          </div>

          {/* Navigation Arrows */}
          <div className="flex items-center gap-3 mt-8">
            <button className="w-12 h-12 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center transition-all">
              <ChevronLeft className="w-6 h-6 text-black" strokeWidth={3} />
            </button>
            <button className="w-12 h-12 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center transition-all">
              <ChevronRight className="w-6 h-6 text-black" strokeWidth={3} />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ═══════════════════════════════════════════════════════════════
   BLOG CARD - Vertical Card with Tan Background
═══════════════════════════════════════════════════════════════ */
function BlogCard({ blog, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
    >
      <Link
        href={`/journal/${blog.slug}`}
        className="group block rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 h-full"
      >
        {/* Image */}
        <div className="relative h-64 overflow-hidden bg-gray-200">
          <Image
            src={blog.coverImage}
            alt={blog.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700"
          />
        </div>

        {/* Content - Tan Background */}
        <div className="bg-[#d4af37]/30 backdrop-blur-sm p-6 border-b-4 border-[#d4af37]">
          {/* Meta */}
          <div className="flex items-center gap-4 text-xs font-bold text-[#0b1f11]/70 mb-4 uppercase tracking-wider">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>
                {new Date(blog.publishedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
            {blog.author && (
              <div className="flex items-center gap-1">
                <User className="w-3 h-3" />
                <span>{blog.author}</span>
              </div>
            )}
          </div>

          {/* Title */}
          <h3 className="text-heading text-xl md:text-2xl font-black text-[#0b1f11] mb-4 line-clamp-2 uppercase leading-tight group-hover:text-[#264B0E] transition-colors">
            {blog.title}
          </h3>

          {/* Excerpt - Optional, can be hidden on smaller cards */}
          <p className="text-body text-sm text-[#0b1f11]/80 line-clamp-2 mb-4 leading-relaxed hidden md:block">
            {blog.excerpt}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   BLOG CARD SKELETON
═══════════════════════════════════════════════════════════════ */
function BlogCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden shadow-lg animate-pulse">
      <div className="h-64 bg-gray-300" />
      <div className="bg-[#d4af37]/20 p-6">
        <div className="flex gap-4 mb-4">
          <div className="h-3 bg-gray-300 rounded w-24" />
          <div className="h-3 bg-gray-300 rounded w-20" />
        </div>
        <div className="h-6 bg-gray-300 rounded mb-3" />
        <div className="h-6 bg-gray-300 rounded w-3/4 mb-4" />
        <div className="h-4 bg-gray-300 rounded mb-2" />
        <div className="h-4 bg-gray-300 rounded w-2/3" />
      </div>
    </div>
  );
}