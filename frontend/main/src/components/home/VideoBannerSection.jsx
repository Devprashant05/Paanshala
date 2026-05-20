"use client";

import { useEffect, useState, useRef } from "react";
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

  return (
    <section className="relative w-full h-[calc(100vh-136px)] overflow-hidden bg-black">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentBanner._id}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          {/* Video */}
          <video
            ref={videoRef}
            src={currentBanner.videoUrl}
            autoPlay
            muted={isMuted}
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Premium Gradient Overlay */}
          <div className="absolute inset-0 bg-linear-to-t from-black via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-linear-to-r from-black/60 via-transparent to-black/40" />

          {/* Content Overlay */}
          {hasOverlay && (
            <div className="absolute inset-0 flex items-center">
              <div className="max-w-400 mx-auto w-full px-6 md:px-12 lg:px-16">
                <motion.div
                  initial={{ y: 60, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="max-w-3xl"
                >
                  {/* Title */}
                  {currentBanner.title && (
                    <h1 className="text-5xl md:text-6xl lg:text-7xl text-heading font-normal text-white leading-[0.95] mb-6 tracking-wide uppercase">
                      {currentBanner.title}
                    </h1>
                  )}

                  {/* Description */}
                  {currentBanner.description && (
                    <p className="text-md md:text-lg lg:text-xl text-body text-gray-200 mb-10 max-w-2xl leading-relaxed font-light">
                      {currentBanner.description}
                    </p>
                  )}

                  {/* CTA Buttons */}
                  {currentBanner.ctaText && currentBanner.ctaLink && (
                    <div className="flex flex-wrap gap-4">
                      <a href={currentBanner.ctaLink}>
                        <button className="btn-gold btn-lg">
                          {currentBanner.ctaText}
                        </button>
                      </a>
                      <a href="/shop">
                        <button className="btn-outline btn-lg border-white text-white hover:bg-white hover:text-black">
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

      {/* Navigation Arrows - Only show if multiple banners */}
      {/* {banners.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-6 md:left-12 top-1/2 -translate-y-1/2 z-20 w-14 h-14 rounded-full bg-black/40 hover:bg-gold-bright backdrop-blur-md flex items-center justify-center text-white hover:text-black transition-all hover:scale-110 border border-white/20 hover:border-gold-bright"
            aria-label="Previous banner"
          >
            <ChevronLeft className="w-7 h-7" strokeWidth={2.5} />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-6 md:right-12 top-1/2 -translate-y-1/2 z-20 w-14 h-14 rounded-full bg-black/40 hover:bg-gold-bright backdrop-blur-md flex items-center justify-center text-white hover:text-black transition-all hover:scale-110 border border-white/20 hover:border-gold-bright"
            aria-label="Next banner"
          >
            <ChevronRight className="w-7 h-7" strokeWidth={2.5} />
          </button>
        </>
      )} */}

      {/* Dots Navigation - Bottom Center */}
      {banners.length > 1 && (
        <div className="absolute bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 z-20 flex gap-3">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                "transition-all duration-300 rounded-full",
                index === currentIndex
                  ? "w-16 h-3 bg-gold-bright shadow-gold"
                  : "w-3 h-3 bg-white/40 hover:bg-white/70 hover:scale-125"
              )}
              aria-label={`Go to banner ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

/* =========================
   VIDEO BANNER SKELETON
========================= */
function VideoBannerSkeleton() {
  return (
    <section className="relative w-full h-[calc(100vh-136px)] overflow-hidden bg-linear-to-br from-gray-900 via-black to-gray-900">
      <div className="absolute inset-0 bg-linear-to-t from-black via-black/50 to-transparent" />
      <div className="absolute inset-0 flex items-center">
        <div className="max-w-400 mx-auto w-full px-6 md:px-12 lg:px-16">
          <div className="max-w-3xl space-y-8 animate-pulse">
            {/* Title skeleton */}
            <div className="space-y-4">
              <div className="h-20 bg-linear-to-r from-gray-700 to-gray-800 rounded-lg w-3/4" />
              <div className="h-20 bg-linear-to-r from-gray-700 to-gray-800 rounded-lg w-2/3" />
            </div>
            
            {/* Description skeleton */}
            <div className="space-y-3">
              <div className="h-6 bg-linear-to-r from-gray-700 to-gray-800 rounded-lg w-full" />
              <div className="h-6 bg-linear-to-r from-gray-700 to-gray-800 rounded-lg w-5/6" />
              <div className="h-6 bg-linear-to-r from-gray-700 to-gray-800 rounded-lg w-2/3" />
            </div>
            
            {/* Buttons skeleton */}
            <div className="flex gap-4 mt-10">
              <div className="h-16 bg-linear-to-r from-gold-bright/20 to-[#d4a574]/20 rounded-lg w-48" />
              <div className="h-16 bg-linear-to-r from-gray-700 to-gray-800 rounded-lg w-56" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Skeleton dots */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-3">
        <div className="w-16 h-3 bg-gray-700 rounded-full animate-pulse" />
        <div className="w-3 h-3 bg-gray-700 rounded-full animate-pulse" />
        <div className="w-3 h-3 bg-gray-700 rounded-full animate-pulse" />
      </div>
    </section>
  );
}