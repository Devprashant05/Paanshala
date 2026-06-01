"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useVideoBannerStore } from "@/stores/useVideoBannerStore";
import { cn } from "@/lib/utils";

export default function VideoBannerSection() {
  const { banners, loading, fetchActiveBanners } = useVideoBannerStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const videoRef = useRef(null);

  // Stable display state — never blank, crossfade only
  const [stableBanners, setStableBanners] = useState([]);
  const [contentOpacity, setContentOpacity] = useState(1);
  const isInitialLoad = useRef(true);

  useEffect(() => {
    fetchActiveBanners();
  }, [fetchActiveBanners]);

  // Once banners load, crossfade them in — never flash blank
  useEffect(() => {
    if (loading) return;
    if (banners.length === 0) return;

    if (isInitialLoad.current) {
      setStableBanners(banners);
      setContentOpacity(1);
      isInitialLoad.current = false;
    } else {
      setContentOpacity(0);
      const t = setTimeout(() => {
        setStableBanners(banners);
        setCurrentIndex(0);
        setContentOpacity(1);
      }, 180);
      return () => clearTimeout(t);
    }
  }, [banners, loading]);

  // Auto-advance carousel
  useEffect(() => {
    if (stableBanners.length <= 1 || isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % stableBanners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [stableBanners.length, isPaused]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  if (loading && stableBanners.length === 0) {
    return <VideoBannerSkeleton />;
  }

  if (!stableBanners.length) return null;

  const currentBanner = stableBanners[currentIndex];
  const hasOverlay = Boolean(currentBanner.title || currentBanner.description);

  return (
    <section className="relative w-full bg-black">
      <div
        className="relative w-full aspect-video"
        style={{
          opacity: contentOpacity,
          transition: "opacity 0.18s ease",
        }}
      >
        {/* All banners stacked — CSS crossfade between slides */}
        <div className="absolute inset-0">
          {stableBanners.map((banner, index) => {
            const active = index === currentIndex;
            const bannerIsVideo = banner.type === "video";
            return (
              <div
                key={banner._id}
                className="absolute inset-0"
                style={{
                  opacity: active ? 1 : 0,
                  transition: "opacity 0.6s ease",
                  pointerEvents: active ? "auto" : "none",
                }}
              >
                {bannerIsVideo ? (
                  <video
                    ref={active ? videoRef : undefined}
                    src={banner.videoUrl}
                    autoPlay={active}
                    muted={isMuted}
                    loop
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <Image
                    src={banner.imageUrl}
                    alt={banner.title || "Banner"}
                    fill
                    className="object-cover"
                    priority={index === 0}
                    sizes="100vw"
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Content Overlay */}
        {hasOverlay && (
          <div className="absolute inset-0 flex items-center justify-center md:justify-start">
            <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-8 lg:px-16">
              <motion.div
                key={currentBanner._id}
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="max-w-3xl"
              >
                {currentBanner.title && (
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-heading font-normal text-white leading-tight md:leading-[0.95] mb-4 md:mb-6 tracking-wide uppercase">
                    {currentBanner.title}
                  </h1>
                )}
                {currentBanner.description && (
                  <p className="text-sm sm:text-base md:text-lg lg:text-xl text-body text-gray-200 mb-6 md:mb-10 max-w-2xl leading-relaxed font-light">
                    {currentBanner.description}
                  </p>
                )}
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

        {/* Dots Navigation */}
        {stableBanners.length > 1 && (
          <div className="absolute bottom-4 md:bottom-6 lg:bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2 md:gap-3">
            {stableBanners.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={cn(
                  "transition-all duration-300 rounded-full",
                  index === currentIndex
                    ? "w-12 h-2 md:w-16 md:h-3 bg-gold-bright shadow-gold"
                    : "w-2 h-2 md:w-3 md:h-3 bg-white/40 hover:bg-white/70 hover:scale-125",
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
              <div className="space-y-2 md:space-y-4">
                <div className="h-8 sm:h-12 md:h-16 lg:h-20 bg-linear-to-r from-gray-700 to-gray-800 rounded-lg w-3/4" />
                <div className="h-8 sm:h-12 md:h-16 lg:h-20 bg-linear-to-r from-gray-700 to-gray-800 rounded-lg w-2/3" />
              </div>
              <div className="space-y-2 md:space-y-3">
                <div className="h-4 md:h-6 bg-linear-to-r from-gray-700 to-gray-800 rounded-lg w-full" />
                <div className="h-4 md:h-6 bg-linear-to-r from-gray-700 to-gray-800 rounded-lg w-5/6" />
                <div className="h-4 md:h-6 bg-linear-to-r from-gray-700 to-gray-800 rounded-lg w-2/3" />
              </div>
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-2 md:pt-6">
                <div className="h-12 md:h-16 bg-linear-to-r from-gold-bright/20 to-[#d4a574]/20 rounded-lg w-40 sm:w-48" />
                <div className="h-12 md:h-16 bg-linear-to-r from-gray-700 to-gray-800 rounded-lg w-48 sm:w-56" />
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-4 md:bottom-6 lg:bottom-8 left-1/2 -translate-x-1/2 flex gap-2 md:gap-3">
          <div className="w-12 h-2 md:w-16 md:h-3 bg-gray-700 rounded-full animate-pulse" />
          <div className="w-2 h-2 md:w-3 md:h-3 bg-gray-700 rounded-full animate-pulse" />
          <div className="w-2 h-2 md:w-3 md:h-3 bg-gray-700 rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
}