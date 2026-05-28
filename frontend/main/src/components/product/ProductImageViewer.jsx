"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════
   ProductImageViewer
   Drop-in replacement for the image section
   in ProductDetailPage.

   Props:
     images       string[]   — product image URLs
     productName  string     — used for alt text
     discount     number     — 0 or positive integer (%)
     isOutOfStock boolean
═══════════════════════════════════════ */
export default function ProductImageViewer({
  images = [],
  productName = "",
  discount = 0,
  isOutOfStock = false,
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  /* ── zoom state ── */
  const [zoomed, setZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 }); // percentage
  const imgContainerRef = useRef(null);

  const handleMouseMove = useCallback((e) => {
    if (!imgContainerRef.current) return;
    const rect = imgContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    });
  }, []);

  const openLightbox = (i) => {
    setLightboxIndex(i);
    setLightboxOpen(true);
  };
  const closeLightbox = () => setLightboxOpen(false);

  const lightboxPrev = (e) => {
    e.stopPropagation();
    setLightboxIndex((p) => (p - 1 + images.length) % images.length);
  };
  const lightboxNext = (e) => {
    e.stopPropagation();
    setLightboxIndex((p) => (p + 1) % images.length);
  };

  const currentImage = images[selectedIndex] || "/placeholder-product.png";

  return (
    <>
      <div className="space-y-4">
        {/* ── Main image ── */}
        <div
          ref={imgContainerRef}
          className={cn(
            "relative aspect-square bg-gray-100 rounded-2xl overflow-hidden select-none",
            !isOutOfStock && "cursor-zoom-in",
          )}
          onMouseEnter={() => {
            if (!isOutOfStock) setZoomed(true);
          }}
          onMouseLeave={() => setZoomed(false)}
          onMouseMove={handleMouseMove}
          onClick={() => !isOutOfStock && openLightbox(selectedIndex)}
        >
          {/* Base image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            key={selectedIndex}
            transition={{ duration: 0.25 }}
            className="absolute inset-0"
          >
            <Image
              src={currentImage}
              alt={productName}
              fill
              className="object-cover"
              priority
            />
          </motion.div>

          {/* Zoom overlay — background-position follows cursor */}
          {zoomed && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: `url(${currentImage})`,
                backgroundSize: "250%",
                backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
                backgroundRepeat: "no-repeat",
              }}
            />
          )}

          {/* Discount badge */}
          {discount > 0 && (
            <div className="absolute top-4 left-4 z-10">
              <span className="bg-red-500 text-white text-sm font-bold px-4 py-2 rounded-md shadow-lg">
                {discount}% OFF
              </span>
            </div>
          )}

          {/* Out of stock overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10">
              <span className="bg-white text-gray-900 px-6 py-3 rounded-full font-bold text-lg">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* ── Thumbnails ── */}
        {images.length > 1 && (
          <div className="grid grid-cols-4 gap-3">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedIndex(i)}
                className={cn(
                  "relative aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 transition-all",
                  selectedIndex === i
                    ? "border-[#d4af37] ring-2 ring-[#d4af37]/30"
                    : "border-gray-200 hover:border-[#d4af37]/50",
                )}
              >
                <Image
                  src={img}
                  alt={`${productName} ${i + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ════════════════════════
          LIGHTBOX
      ════════════════════════ */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeLightbox}
            className="fixed inset-0 z-100 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          >
            {/* Modal */}
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-3xl aspect-square rounded-2xl overflow-hidden bg-gray-900"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={lightboxIndex}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0"
                >
                  <Image
                    src={images[lightboxIndex] || "/placeholder-product.png"}
                    alt={`${productName} — view ${lightboxIndex + 1}`}
                    fill
                    className="object-contain"
                    priority
                  />
                </motion.div>
              </AnimatePresence>

              {/* Close */}
              <button
                onClick={closeLightbox}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>

              {/* Prev / Next */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={lightboxPrev}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm flex items-center justify-center transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-white" />
                  </button>
                  <button
                    onClick={lightboxNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm flex items-center justify-center transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-white" />
                  </button>
                </>
              )}

              {/* Image counter */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 bg-black/50 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                {lightboxIndex + 1} / {images.length}
              </div>

              {/* Thumbnail strip */}
              {images.length > 1 && (
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10 flex gap-2">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={(e) => {
                        e.stopPropagation();
                        setLightboxIndex(i);
                      }}
                      className={cn(
                        "h-1.5 rounded-full transition-all duration-300",
                        lightboxIndex === i
                          ? "w-8 bg-white"
                          : "w-1.5 bg-white/40 hover:bg-white/70",
                      )}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
