"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useShopByVideoStore } from "@/stores/useShopByVideoStore";
import Link from "next/link";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  ShoppingBag,
  Heart,
} from "lucide-react";

export default function PaanshalaSpecialPaan() {
  const { videos, fetchShopByVideos, loading } = useShopByVideoStore();

  useEffect(() => {
    fetchShopByVideos();
  }, [fetchShopByVideos]);

  return (
    <section className="relative bg-linear-to-b from-[#1a1a1a] via-[#0d0d0d] to-[#1a1a1a] py-16 md:py-20 overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold-bright/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#264B0E]/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-400 mx-auto px-6 md:px-12 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12 md:mb-16"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-gold-bright/10 backdrop-blur-sm px-5 py-2.5 rounded-full mb-4 border border-gold-bright/20">
            <Play className="w-4 h-4 text-gold-bright" strokeWidth={2.5} />
            <span className="text-heading text-sm tracking-wider text-gold-bright uppercase">
              Shop By Video
            </span>
          </div>

          {/* Title */}
          <h2 className="text-heading text-5xl md:text-6xl lg:text-7xl text-white mb-4 uppercase tracking-wide">
            Paanshala Specials
          </h2>

          {/* Description */}
          <p className="text-body text-gray-300 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            Discover our signature creations — crafted to be seen, savored, and
            shared.
          </p>
        </motion.div>

        {/* Video Reels Grid */}
        {loading ? (
          <SkeletonGrid />
        ) : videos.length === 0 ? (
          <EmptyState />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4"
          >
            {videos.map((video, index) => (
              <VideoReelCard key={video._id} video={video} index={index} />
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
              <button className="btn-gold btn-lg flex items-center gap-3 mx-auto">
                <ShoppingBag className="w-5 h-5" />
                <span>Explore All Products</span>
              </button>
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   VIDEO REEL CARD (Instagram/TikTok Style)
═══════════════════════════════════════════════════════════════ */
function VideoReelCard({ video, index }) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef(null);

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

  const primaryProduct = video.products?.[0];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      viewport={{ once: true }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative aspect-9/16 rounded-2xl overflow-hidden bg-black shadow-2xl hover:shadow-gold-bright/30 transition-all duration-300 cursor-pointer"
    >
      {/* Video */}
      <video
        ref={videoRef}
        src={video.videoUrl}
        autoPlay
        muted={isMuted}
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />

      {/* Top Left - Shop Button */}
      {primaryProduct && (
        <div className="absolute top-3 left-3 z-20">
          <Link href={`/shop/${primaryProduct._id}`}>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-11 h-11 rounded-full bg-linear-to-br from-gold-bright to-[#d4a574] flex items-center justify-center text-[#1a1a1a] shadow-lg hover:shadow-gold transition-all"
            >
              <ShoppingBag className="w-5 h-5" strokeWidth={2.5} />
            </motion.button>
          </Link>
        </div>
      )}

      {/* Right Side Controls */}
      <div className="absolute right-3 top-3 flex flex-col gap-3 z-20">
        {/* Play/Pause */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={togglePlay}
          className="w-11 h-11 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/80 transition-all border border-white/10"
        >
          {isPlaying ? (
            <Pause className="w-5 h-5" strokeWidth={2.5} />
          ) : (
            <Play className="w-5 h-5 ml-0.5" strokeWidth={2.5} />
          )}
        </motion.button>

        {/* Mute/Unmute */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleMute}
          className="w-11 h-11 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/80 transition-all border border-white/10"
        >
          {isMuted ? (
            <VolumeX className="w-5 h-5" strokeWidth={2.5} />
          ) : (
            <Volume2 className="w-5 h-5" strokeWidth={2.5} />
          )}
        </motion.button>
      </div>

      {/* Bottom Product Info */}
      <AnimatePresence>
        {primaryProduct && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: isHovered ? 0 : 20, opacity: isHovered ? 1 : 0.9 }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-0 left-0 right-0 p-4 z-20"
          >
            <Link
              href={`/products/${primaryProduct._id}`}
              className="block bg-white/95 backdrop-blur-md rounded-xl p-3 hover:bg-white transition-all shadow-xl"
            >
              <h3 className="text-heading text-sm text-[#1a1a1a] line-clamp-2 uppercase tracking-wide mb-2">
                {primaryProduct.name}
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-heading text-xl text-[#264B0E]">
                  ₹{primaryProduct.discountedPrice}
                </span>
                {primaryProduct.originalPrice > primaryProduct.discountedPrice && (
                  <span className="text-body text-sm text-gray-500 line-through">
                    ₹{primaryProduct.originalPrice}
                  </span>
                )}
              </div>
            </Link>

            {/* Additional Products Indicator */}
            {video.products?.length > 1 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{
                  height: isHovered ? "auto" : 0,
                  opacity: isHovered ? 1 : 0,
                }}
                transition={{ duration: 0.3 }}
                className="mt-2 overflow-hidden"
              >
                <div className="bg-black/70 backdrop-blur-md rounded-lg p-2 border border-white/10">
                  <p className="text-body text-xs text-gray-300">
                    +{video.products.length - 1} more product{video.products.length - 1 > 1 ? "s" : ""}
                  </p>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hover Border Effect */}
      <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-gold-bright/50 transition-all duration-300 pointer-events-none" />
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   LOADING SKELETON
═══════════════════════════════════════════════════════════════ */
function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
      {[...Array(10)].map((_, i) => (
        <div
          key={i}
          className="aspect-9/16 rounded-2xl bg-white/5 animate-pulse"
        />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   EMPTY STATE
═══════════════════════════════════════════════════════════════ */
function EmptyState() {
  return (
    <div className="text-center py-20">
      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/10 flex items-center justify-center">
        <Play className="w-10 h-10 text-gold-bright" />
      </div>
      <h3 className="text-heading text-3xl text-white mb-2 uppercase">
        No Videos Yet
      </h3>
      <p className="text-body text-gray-400 mb-8">
        Check back soon for our latest creations!
      </p>
      <Link href="/shop">
        <button className="btn-outline p-2 rounded-xl border-gold-bright text-gold-bright hover:bg-gold-bright hover:text-[#1a1a1a]">
          Browse Products
        </button>
      </Link>
    </div>
  );
}