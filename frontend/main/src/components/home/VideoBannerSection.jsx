"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useVideoBannerStore } from "@/stores/useVideoBannerStore";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function VideoBannerSection() {
  const { banners, loading, fetchActiveBanners } = useVideoBannerStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef(null);

  useEffect(() => {
    fetchActiveBanners();
  }, [fetchActiveBanners]);

  // Auto-advance carousel
  useEffect(() => {
    if (banners.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [banners.length, isPaused]);

  // Navigate to specific banner
  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  // Previous/Next
  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  if (loading) {
    return <VideoBannerSkeleton />;
  }

  if (!banners.length) return null;

  const currentBanner = banners[currentIndex];
  const hasOverlay = Boolean(currentBanner.title || currentBanner.description);
  const isVideo = currentBanner.type === "video";

  return (
    <section className="relative w-full bg-black">
      {/* Container with aspect ratio */}
      <div className="relative w-full aspect-video">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentBanner._id}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.7, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            {/* Video Banner */}
            {isVideo ? (
              <>
                <video
                  ref={videoRef}
                  src={currentBanner.videoUrl}
                  autoPlay
                  muted={isMuted}
                  loop
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover"
                />

                {/* Premium Gradient Overlay
                <div className="absolute inset-0 bg-linear-to-t from-black via-black/40 to-transparent" />
                <div className="absolute inset-0 bg-linear-to-r from-black/60 via-transparent to-black/40" /> */}
              </>
            ) : (
              <>
                {/* Image Banner */}
                <Image
                  src={currentBanner.imageUrl}
                  alt={currentBanner.title || "Banner"}
                  fill
                  className="absolute inset-0 w-full h-full object-cover"
                  priority
                  sizes="100vw"
                />

                {/* Premium Gradient Overlay */}
                {/* <div className="absolute inset-0 bg-linear-to-t from-black via-black/40 to-transparent" />
                <div className="absolute inset-0 bg-linear-to-r from-black/60 via-transparent to-black/40" /> */}
              </>
            )}

            {/* Content Overlay */}
            {hasOverlay && (
              <div className="absolute inset-0 flex items-center justify-center md:justify-start">
                <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-8 lg:px-16">
                  <motion.div
                    initial={{ y: 60, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="max-w-3xl"
                  >
                    {/* Title */}
                    {currentBanner.title && (
                      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-heading font-normal text-white leading-tight md:leading-[0.95] mb-4 md:mb-6 tracking-wide uppercase">
                        {currentBanner.title}
                      </h1>
                    )}

                    {/* Description */}
                    {currentBanner.description && (
                      <p className="text-sm sm:text-base md:text-lg lg:text-xl text-body text-gray-200 mb-6 md:mb-10 max-w-2xl leading-relaxed font-light">
                        {currentBanner.description}
                      </p>
                    )}

                    {/* CTA Buttons */}
                    {currentBanner.ctaText && currentBanner.ctaLink && (
                      <div className="flex flex-col sm:flex-row flex-wrap gap-3 md:gap-4">
                        <a href={currentBanner.ctaLink}>
                          <button className="btn-gold btn-lg whitespace-nowrap">
                            {currentBanner.ctaText}
                          </button>
                        </a>
                        <a href="/shop">
                          <button className="btn-outline btn-lg border-white text-white hover:bg-white hover:text-black whitespace-nowrap">
                            EXPLORE PRODUCTS
                          </button>
                        </a>
                      </div>
                    )}
                  </motion.div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Video Controls - Only show if current banner is video */}
        {/* {isVideo && banners.length > 0 && (
          <div className="absolute top-4 md:top-6 lg:top-12 right-4 md:right-6 lg:right-12 z-20 flex gap-2 md:gap-3">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/40 hover:bg-gold-bright backdrop-blur-md flex items-center justify-center text-white hover:text-black transition-all hover:scale-110 border border-white/20 hover:border-gold-bright"
              aria-label={isPaused ? "Play" : "Pause"}
            >
              {isPaused ? (
                <Play className="w-4 h-4 md:w-5 md:h-5 fill-current" />
              ) : (
                <Pause className="w-4 h-4 md:w-5 md:h-5" />
              )}
            </button>

            <button
              onClick={() => setIsMuted(!isMuted)}
              className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/40 hover:bg-gold-bright backdrop-blur-md flex items-center justify-center text-white hover:text-black transition-all hover:scale-110 border border-white/20 hover:border-gold-bright"
              aria-label={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 md:w-5 md:h-5" />
              ) : (
                <Volume2 className="w-4 h-4 md:w-5 md:h-5" />
              )}
            </button>
          </div>
        )} */}

        {/* Dots Navigation - Bottom Center */}
        {banners.length > 1 && (
          <div className="absolute bottom-4 md:bottom-6 lg:bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2 md:gap-3">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={cn(
                  "transition-all duration-300 rounded-full",
                  index === currentIndex
                    ? "w-12 h-2 md:w-16 md:h-3 bg-gold-bright shadow-gold"
                    : "w-2 h-2 md:w-3 md:h-3 bg-white/40 hover:bg-white/70 hover:scale-125"
                )}
                aria-label={`Go to banner ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* =========================
   VIDEO BANNER SKELETON
========================= */
function VideoBannerSkeleton() {
  return (
    <section className="relative w-full bg-black">
      <div className="relative w-full aspect-video overflow-hidden bg-linear-to-br from-gray-900 via-black to-gray-900">
        <div className="absolute inset-0 bg-linear-to-t from-black via-black/50 to-transparent" />
        
        <div className="absolute inset-0 flex items-center justify-center md:justify-start">
          <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-8 lg:px-16">
            <div className="max-w-3xl space-y-4 md:space-y-8 animate-pulse">
              {/* Title skeleton */}
              <div className="space-y-2 md:space-y-4">
                <div className="h-8 sm:h-12 md:h-16 lg:h-20 bg-linear-to-r from-gray-700 to-gray-800 rounded-lg w-3/4" />
                <div className="h-8 sm:h-12 md:h-16 lg:h-20 bg-linear-to-r from-gray-700 to-gray-800 rounded-lg w-2/3" />
              </div>
              
              {/* Description skeleton */}
              <div className="space-y-2 md:space-y-3">
                <div className="h-4 md:h-6 bg-linear-to-r from-gray-700 to-gray-800 rounded-lg w-full" />
                <div className="h-4 md:h-6 bg-linear-to-r from-gray-700 to-gray-800 rounded-lg w-5/6" />
                <div className="h-4 md:h-6 bg-linear-to-r from-gray-700 to-gray-800 rounded-lg w-2/3" />
              </div>
              
              {/* Buttons skeleton */}
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-2 md:pt-6">
                <div className="h-12 md:h-16 bg-linear-to-r from-gold-bright/20 to-[#d4a574]/20 rounded-lg w-40 sm:w-48" />
                <div className="h-12 md:h-16 bg-linear-to-r from-gray-700 to-gray-800 rounded-lg w-48 sm:w-56" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Skeleton dots */}
        <div className="absolute bottom-4 md:bottom-6 lg:bottom-8 left-1/2 -translate-x-1/2 flex gap-2 md:gap-3">
          <div className="w-12 h-2 md:w-16 md:h-3 bg-gray-700 rounded-full animate-pulse" />
          <div className="w-2 h-2 md:w-3 md:h-3 bg-gray-700 rounded-full animate-pulse" />
          <div className="w-2 h-2 md:w-3 md:h-3 bg-gray-700 rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
}