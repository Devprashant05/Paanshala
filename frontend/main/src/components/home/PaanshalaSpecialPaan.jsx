"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useShopByVideoStore } from "@/stores/useShopByVideoStore";
import Link from "next/link";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  ShoppingBag,
  ExternalLink,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function PaanshalaSpecialPaan() {
  const { videos, fetchShopByVideos, loading } = useShopByVideoStore();

  useEffect(() => {
    fetchShopByVideos();
  }, [fetchShopByVideos]);

  return (
    <section className="relative bg-linear-to-b from-[#0b1f11] via-[#0d2413] to-[#0b1f11] py-16 md:py-20 overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#d4af37]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#2d5016]/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        {/* SECTION HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12 md:mb-16"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
            <Play className="w-4 h-4 text-[#d4af37]" />
            <span className="text-sm font-semibold text-white tracking-wide">
              SHOP BY VIDEO
            </span>
          </div>

          {/* Title */}
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            Paanshala Special Paan
          </h2>

          {/* Description */}
          <p className="text-gray-300 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            Discover our signature creations — crafted to be seen, savored, and
            shared.
          </p>
        </motion.div>

        {/* VIDEO GRID */}
        {loading ? (
          <SkeletonGrid />
        ) : videos.length === 0 ? (
          <EmptyState />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
          >
            {videos.map((video, index) => (
              <VideoCard key={video._id} video={video} index={index} />
            ))}
          </motion.div>
        )}

        {/* View All Button */}
        {!loading && videos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Link href="/shop">
              <Button
                size="lg"
                className="bg-linear-to-r from-[#d4af37] to-[#f4d03f] hover:opacity-90 text-black font-semibold px-8 h-14 text-base shadow-xl"
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                Explore All Products
              </Button>
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
}

/* =========================
   VIDEO CARD
========================= */
function VideoCard({ video, index }) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useState(null);

  const togglePlay = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Get first product for quick access
  const primaryProduct = video.products?.[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative aspect-9/16 rounded-2xl overflow-hidden bg-black shadow-2xl hover:shadow-[#d4af37]/20 transition-all duration-300"
    >
      {/* VIDEO */}
      <video
        ref={videoRef}
        src={video.videoUrl}
        autoPlay
        muted={isMuted}
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-linear-to-t from-black via-transparent to-transparent opacity-60" />

      {/* Video Controls - Top Right */}
      <div className="absolute top-3 right-3 flex flex-col gap-2 z-20">
        <button
          onClick={togglePlay}
          className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors"
        >
          {isPlaying ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5" />
          )}
        </button>
        <button
          onClick={toggleMute}
          className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors"
        >
          {isMuted ? (
            <VolumeX className="w-5 h-5" />
          ) : (
            <Volume2 className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Title Badge - Top Left */}
      {video.title && (
        <div className="absolute top-3 left-3 z-20">
          <Badge className="bg-black/70 backdrop-blur-sm text-white border-0 px-3 py-1.5 font-medium">
            {video.title}
          </Badge>
        </div>
      )}

      {/* Product Information - Bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
        {primaryProduct && (
          <Link
            href={`/shop/${primaryProduct._id}`}
            className="block bg-white/95 backdrop-blur-sm rounded-xl p-4 hover:bg-white transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm md:text-base font-bold text-gray-900 line-clamp-2 mb-1">
                  {primaryProduct.name}
                </h3>
                {/* <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-[#2d5016]">
                    ₹{primaryProduct.discountedPrice}
                  </span>
                  {primaryProduct.originalPrice >
                    primaryProduct.discountedPrice && (
                    <span className="text-sm text-gray-500 line-through">
                      ₹{primaryProduct.originalPrice}
                    </span>
                  )}
                </div> */}
              </div>
              {/* <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-[#d4af37] to-[#f4d03f] flex items-center justify-center">
                <ExternalLink className="w-5 h-5 text-black" />
              </div> */}
            </div>
          </Link>
        )}

        {/* Additional Products Count */}
        {video.products?.length > 1 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{
              opacity: isHovered ? 1 : 0,
              height: isHovered ? "auto" : 0,
            }}
            transition={{ duration: 0.3 }}
            className="mt-2 overflow-hidden"
          >
            <div className="bg-black/70 backdrop-blur-sm rounded-lg p-3">
              <p className="text-xs text-gray-300 mb-2">
                +{video.products.length - 1} more product
                {video.products.length - 1 > 1 ? "s" : ""} in this video
              </p>
              <div className="flex flex-wrap gap-1">
                {video.products.slice(1, 4).map((product) => (
                  <Link
                    key={product._id}
                    href={`/shop/${product._id}`}
                    className="text-xs text-white hover:text-[#d4af37] transition-colors"
                  >
                    {product.name}
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Like Button - Right Side (Instagram style) */}
      {/* <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="absolute right-3 bottom-32 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors z-20"
      >
        <Heart className="w-6 h-6" />
      </motion.button> */}

      {/* Shop Bag Button - Right Side */}
      {primaryProduct && (
        <Link href={`/shop/${primaryProduct._id}`}>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="absolute right-3 bottom-20 w-12 h-12 rounded-full bg-linear-to-br from-[#d4af37] to-[#f4d03f] flex items-center justify-center text-black shadow-lg z-20"
          >
            <ShoppingBag className="w-6 h-6" />
          </motion.button>
        </Link>
      )}

      {/* Hover Border Effect */}
      <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-[#d4af37]/50 transition-colors duration-300 pointer-events-none" />
    </motion.div>
  );
}

/* =========================
   LOADING SKELETON
========================= */
function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="aspect-9/16 rounded-2xl bg-white/10 animate-pulse"
        />
      ))}
    </div>
  );
}

/* =========================
   EMPTY STATE
========================= */
function EmptyState() {
  return (
    <div className="text-center py-20">
      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/10 flex items-center justify-center">
        <Play className="w-10 h-10 text-gray-400" />
      </div>
      <h3 className="text-2xl font-bold text-white mb-2">No Videos Yet</h3>
      <p className="text-gray-400 mb-8">
        Check back soon for our latest creations!
      </p>
      <Link href="/shop">
        <Button
          variant="outline"
          className="border-2 border-white text-white hover:bg-white hover:text-black"
        >
          Browse Products
        </Button>
      </Link>
    </div>
  );
}
