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

  // Toggle mute
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

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
    <section className="relative w-full h-[calc(100vh-6rem)] md:h-[calc(100vh-7rem)] overflow-hidden bg-black">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentBanner._id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
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

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-linear-to-t from-black via-black/50 to-transparent" />

          {/* Content Overlay */}
          {hasOverlay && (
            <div className="absolute inset-0 flex items-center">
              <div className="max-w-7xl mx-auto w-full px-4 md:px-6">
                <motion.div
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="max-w-3xl"
                >
                  {/* Title */}
                  {currentBanner.title && (
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
                      {currentBanner.title}
                    </h1>
                  )}

                  {/* Description */}
                  {currentBanner.description && (
                    <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl leading-relaxed">
                      {currentBanner.description}
                    </p>
                  )}

                  {/* CTA Buttons */}
                  {currentBanner.ctaText && currentBanner.ctaLink && (
                    <div className="flex flex-wrap gap-4">
                      <a href={currentBanner.ctaLink}>
                        <Button
                          size="lg"
                          className="bg-linear-to-r from-[#d4af37] to-[#f4d03f] hover:opacity-90 text-black font-semibold px-8 h-14 text-lg shadow-xl hover:scale-105 transition-transform"
                        >
                          {currentBanner.ctaText}
                        </Button>
                      </a>
                      <a href="/shop">
                        <Button
                          size="lg"
                          variant="outline"
                          className="border-2 border-white text-white hover:bg-white hover:text-black h-14 px-8 text-lg font-semibold backdrop-blur-sm"
                        >
                          Explore Products
                        </Button>
                      </a>
                    </div>
                  )}
                </motion.div>
              </div>
            </div>
          )}

          {/* Video Controls - Bottom Right */}
          <div className="absolute bottom-6 right-4 md:bottom-8 md:right-8 flex gap-2 z-20">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsPaused(!isPaused)}
              className="bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm"
            >
              {isPaused ? (
                <Play className="w-4 h-4" />
              ) : (
                <Pause className="w-4 h-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMute}
              className="bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm"
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows - Only show if multiple banners */}
      {banners.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm flex items-center justify-center text-white transition-all hover:scale-110"
            aria-label="Previous banner"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm flex items-center justify-center text-white transition-all hover:scale-110"
            aria-label="Next banner"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Dots Navigation - Bottom Center */}
      {banners.length > 1 && (
        <div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                "transition-all duration-300",
                index === currentIndex
                  ? "w-12 h-2 bg-white rounded-full"
                  : "w-2 h-2 bg-white/50 hover:bg-white/80 rounded-full",
              )}
              aria-label={`Go to banner ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="absolute bottom-20 md:bottom-24 left-1/2 -translate-x-1/2 z-10 hidden md:block"
      >
        <div className="flex flex-col items-center gap-2 text-white">
          <span className="text-sm font-medium tracking-wider">
            SCROLL TO EXPLORE
          </span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <ChevronLeft className="w-5 h-5 -rotate-90" />
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

/* =========================
   VIDEO BANNER SKELETON
========================= */
function VideoBannerSkeleton() {
  return (
    <section className="relative w-full h-[calc(100vh-6rem)] md:h-[calc(100vh-7rem)] overflow-hidden bg-gray-900">
      <div className="absolute inset-0 bg-linear-to-t from-black via-black/50 to-transparent" />
      <div className="absolute inset-0 flex items-center">
        <div className="max-w-7xl mx-auto w-full px-4 md:px-6">
          <div className="max-w-3xl space-y-6 animate-pulse">
            <div className="h-16 bg-gray-700 rounded-lg w-3/4" />
            <div className="h-6 bg-gray-700 rounded-lg w-2/3" />
            <div className="h-6 bg-gray-700 rounded-lg w-1/2" />
            <div className="flex gap-4 mt-8">
              <div className="h-14 bg-gray-700 rounded-lg w-40" />
              <div className="h-14 bg-gray-700 rounded-lg w-48" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
