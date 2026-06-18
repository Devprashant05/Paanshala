"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { useVideoBannerStore } from "@/stores/useVideoBannerStore";
import { cn } from "@/lib/utils";

export default function VideoBannerSection() {
  const { banners, loading, fetchActiveBanners } = useVideoBannerStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const videoRef = useRef(null);

  const [stableBanners, setStableBanners] = useState([]);
  const [contentOpacity, setContentOpacity] = useState(1);
  const isInitialLoad = useRef(true);

  useEffect(() => {
    fetchActiveBanners();
  }, [fetchActiveBanners]);

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

  useEffect(() => {
    if (stableBanners.length <= 1 || isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % stableBanners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [stableBanners.length, isPaused]);

  const goToSlide = (index) => setCurrentIndex(index);

  if (!stableBanners.length) return null;

  const currentBanner = stableBanners[currentIndex];
  const hasOverlay = Boolean(currentBanner.title || currentBanner.description);

  return (
    <section className="relative w-full bg-black">
      <div
        className="relative w-full"
        style={{
          opacity: contentOpacity,
          transition: "opacity 0.18s ease",
        }}
      >
        {/*
          Height strategy:
          - Mobile:  aspect-[3/4]  → tall portrait feel, works great with portrait mobile images
          - Tablet:  aspect-video  → standard 16:9
          - Desktop: fixed vh      → full-bleed hero
        */}
        <div className="relative w-full aspect-4/3 sm:aspect-16/7 md:aspect-auto md:h-134">
          {/* All banners stacked — CSS crossfade between slides */}
          <div className="absolute inset-0">
            {stableBanners.map((banner, index) => {
              const active = index === currentIndex;
              const isVideo = banner.type === "video";

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
                  {isVideo ? (
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
                    <picture className="absolute inset-0 w-full h-full">
                      {/* Portrait image for mobile screens */}
                      {banner.mobileImageUrl && (
                        <source
                          media="(max-width: 639px)"
                          srcSet={banner.mobileImageUrl}
                        />
                      )}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={banner.imageUrl}
                        alt={banner.title || "Banner"}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </picture>
                  )}
                </div>
              );
            })}
          </div>

          {/* Dark gradient scrim — ensures text is always readable regardless of banner color */}
          {/* {hasOverlay && (
            <div className="absolute inset-0 bg-linear-to-b from-black/50 via-black/20 to-black/40 sm:bg-linear-to-r sm:from-black/60 sm:via-black/30 sm:to-transparent" />
          )} */}

          {/* Content Overlay */}
          {hasOverlay && (
            <div className="absolute inset-0 flex items-center justify-start pt-24 sm:pt-0">
              <div className="max-w-7xl mx-auto w-full px-5 sm:px-6 md:px-8 lg:px-16">
                <motion.div
                  key={currentBanner._id}
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="max-w-3xl"
                >
                  {currentBanner.title && (
                    <h1
                      className="text-heading font-normal leading-tight md:leading-[0.95] mb-3 md:mb-6 tracking-wide uppercase drop-shadow-lg"
                      style={{
                        fontSize:
                          currentBanner.titleStyle?.fontSize ||
                          "clamp(1.75rem, 5vw, 4.5rem)",
                        color: currentBanner.titleStyle?.color || "#ffffff",
                      }}
                    >
                      {currentBanner.title}
                    </h1>
                  )}

                  {currentBanner.description && (
                    <p
                      className="text-body max-w-2xl leading-relaxed font-light drop-shadow-md"
                      style={{
                        fontSize:
                          currentBanner.descriptionStyle?.fontSize ||
                          "clamp(0.875rem, 2vw, 1.125rem)",
                        color:
                          currentBanner.descriptionStyle?.color || "#e5e7eb",
                      }}
                    >
                      {currentBanner.description}
                    </p>
                  )}

                  {currentBanner.ctaText && currentBanner.ctaLink && (
                    <div className="flex flex-col sm:flex-row flex-wrap gap-3 md:gap-4 mt-6 md:mt-10">
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
          {/* {stableBanners.length > 1 && (
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
          )} */}
        </div>
      </div>
    </section>
  );
}