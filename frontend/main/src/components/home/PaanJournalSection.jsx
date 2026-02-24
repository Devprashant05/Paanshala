"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useBlogStore } from "@/stores/useBlogStore";
import {
  BookOpen,
  Calendar,
  Clock,
  User,
  ArrowRight,
  TrendingUp,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function PaanJournalSection() {
  const { featuredBlogs, fetchFeaturedBlogs, loading } = useBlogStore();

  useEffect(() => {
    fetchFeaturedBlogs();
  }, [fetchFeaturedBlogs]);

  return (
    <section className="relative bg-linear-to-b from-white via-[#fafaf6] to-white py-20 overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#d4af37]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#2d5016]/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-linear-to-r from-[#d4af37]/20 to-[#f4d03f]/20 px-4 py-2 rounded-full mb-4">
            <BookOpen className="w-4 h-4 text-[#d4af37]" />
            <span className="text-sm font-semibold text-[#2d5016] tracking-wide">
              PAAN JOURNAL
            </span>
          </div>

          {/* Title */}
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Stories, Insights &{" "}
            <span className="bg-linear-to-r from-[#2d5016] via-[#3d6820] to-[#2d5016] bg-clip-text text-transparent">
              Traditions
            </span>
          </h2>

          {/* Description */}
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Explore the rich heritage of paan culture, discover recipes, and
            stay updated with the latest from Paanshala
          </p>
        </motion.div>

        {/* BLOG GRID */}
        {loading ? (
          <BlogGridSkeleton />
        ) : featuredBlogs.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* Featured Blog (Large) */}
            {featuredBlogs[0] && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="mb-12"
              >
                <FeaturedBlogCard blog={featuredBlogs[0]} />
              </motion.div>
            )}

            {/* Other Blogs (Grid) */}
            {featuredBlogs.length > 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                {featuredBlogs.slice(1).map((blog, index) => (
                  <BlogCard key={blog._id} blog={blog} index={index} />
                ))}
              </div>
            )}
          </>
        )}

        {/* VIEW ALL BUTTON */}
        {!loading && featuredBlogs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-center mt-16"
          >
            <Link href="/journal">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-[#2d5016] text-[#2d5016] hover:bg-[#2d5016] hover:text-white font-semibold px-8 h-14 text-base group"
              >
                View All Articles
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight className="w-5 h-5 ml-2" />
                </motion.span>
              </Button>
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
}

/* =========================
   FEATURED BLOG CARD (LARGE)
========================= */
function FeaturedBlogCard({ blog }) {
  return (
    <Link href={`/journal/${blog.slug}`}>
      <Card className="group overflow-hidden hover:shadow-2xl transition-all duration-500 border-2 border-transparent hover:border-[#d4af37]/30">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
          {/* Image */}
          <div className="relative h-80 lg:h-auto bg-gray-100">
            <Image
              src={blog.coverImage || "/placeholder-blog.png"}
              alt={blog.title}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-700"
            />

            {/* Featured Badge */}
            <div className="absolute top-4 left-4">
              <Badge className="bg-linear-to-r from-[#d4af37] to-[#f4d03f] text-black border-0 font-semibold">
                <TrendingUp className="w-3 h-3 mr-1" />
                Featured
              </Badge>
            </div>

            {/* Category Badge */}
            {blog.category && (
              <div className="absolute top-4 right-4">
                <Badge
                  variant="secondary"
                  className="bg-white/90 backdrop-blur-sm"
                >
                  {blog.category}
                </Badge>
              </div>
            )}

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent lg:hidden" />
          </div>

          {/* Content */}
          <CardContent className="p-8 md:p-10 flex flex-col justify-center">
            {/* Meta */}
            <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span>{blog.author || "Paanshala Team"}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(blog.createdAt)}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{blog.readTime || "5 min read"}</span>
              </div>
            </div>

            {/* Title */}
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 group-hover:text-[#2d5016] transition-colors line-clamp-2">
              {blog.title}
            </h3>

            {/* Excerpt */}
            <p className="text-gray-600 leading-relaxed mb-6 line-clamp-3">
              {blog.excerpt || blog.content?.substring(0, 150) + "..."}
            </p>

            {/* Read More */}
            <div className="flex items-center text-[#2d5016] font-semibold group-hover:gap-3 transition-all">
              <span>Read Full Article</span>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </div>
          </CardContent>
        </div>
      </Card>
    </Link>
  );
}

/* =========================
   BLOG CARD (REGULAR)
========================= */
function BlogCard({ blog, index }) {
  console.log(blog)
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
    >
      <Link href={`/journal/${blog.slug}`}>
        <Card className="group h-full overflow-hidden hover:shadow-xl transition-all duration-500 border border-gray-200 hover:border-[#d4af37]/50">
          <div className="relative h-56 bg-gray-100">
            <Image
              src={blog.coverImage || "/placeholder-blog.png"}
              alt={blog.title}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-700"
            />

            {/* Category Badge */}
            {blog.category && (
              <div className="absolute top-3 left-3">
                <Badge
                  variant="secondary"
                  className="bg-white/90 backdrop-blur-sm text-xs"
                >
                  {blog.category}
                </Badge>
              </div>
            )}

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent" />
          </div>

          <CardContent className="p-5">
            {/* Meta */}
            <div className="flex items-center gap-2 mb-3 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{formatDate(blog.createdAt)}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{blog.readTime || "5 min"}</span>
              </div>
            </div>

            {/* Title */}
            <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-[#2d5016] transition-colors line-clamp-2 min-h-14">
              {blog.title}
            </h3>

            {/* Excerpt */}
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
              {blog.excerpt || blog.content?.substring(0, 80) + "..."}
            </p>

            {/* Read More */}
            <div className="flex items-center text-[#2d5016] text-sm font-semibold group-hover:gap-2 transition-all">
              <span>Read More</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}

/* =========================
   SKELETON LOADER
========================= */
function BlogGridSkeleton() {
  return (
    <div className="space-y-12">
      {/* Featured Skeleton */}
      <Card className="overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
          <div className="h-80 bg-gray-200 animate-pulse" />
          <div className="p-10 space-y-4">
            <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
            <div className="h-8 bg-gray-200 rounded w-full animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-4/6 animate-pulse" />
            <div className="h-10 bg-gray-200 rounded w-32 animate-pulse" />
          </div>
        </div>
      </Card>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <div className="h-56 bg-gray-200 animate-pulse" />
            <CardContent className="p-5 space-y-3">
              <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
              <div className="h-6 bg-gray-200 rounded w-full animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse" />
              <div className="h-8 bg-gray-200 rounded w-24 animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* =========================
   EMPTY STATE
========================= */
function EmptyState() {
  return (
    <div className="text-center py-20">
      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
        <BookOpen className="w-10 h-10 text-gray-400" />
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-2">No Articles Yet</h3>
      <p className="text-gray-600 mb-8">
        Check back soon for inspiring stories and insights!
      </p>
    </div>
  );
}

/* =========================
   HELPER FUNCTIONS
========================= */
function formatDate(dateString) {
  if (!dateString) return "Recently";

  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
