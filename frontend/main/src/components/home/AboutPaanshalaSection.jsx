"use client";

import { motion } from "framer-motion";

export default function AboutPaanshala() {
  return (
    <section className="relative overflow-hidden bg-[#f5e6d3] py-12 sm:py-16">
      {/* =========================
          TOP MARQUEE (Left to Right)
      ========================= */}
      <div className="absolute top-1/2 -translate-y-17.5 sm:-translate-y-22.5 md:-translate-y-24 lg:-translate-y-32 left-0 w-full overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: ["-50%", "0%"] }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear",
          }}
          className="flex whitespace-nowrap will-change-transform"
        >
          {[...Array(3)].map((_, i) => (
            <span
              key={i}
              className="
  text-heading
  text-[48px]
  sm:text-[70px]
  md:text-[90px]
  lg:text-[120px]
  xl:text-[150px]
  font-black
  uppercase
  leading-[0.85]
  tracking-[-0.04em]
  text-[#c4b89b]/55
  pr-6 sm:pr-12 md:pr-16
"
            >
              PREMIUM PAAN • MUKHWAS • CANDIES • DIGESTIVES • PAANSHALA •
            </span>
          ))}
        </motion.div>
      </div>

      {/* =========================
          BOTTOM MARQUEE (Right to Left)
      ========================= */}
      <div className="absolute top-1/2 translate-y-17.5 sm:translate-y-22.5 md:translate-y-24 lg:translate-y-32 left-0 w-full overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear",
          }}
          className="flex whitespace-nowrap will-change-transform"
        >
          {[...Array(3)].map((_, i) => (
            <span
              key={i}
              className="
  text-heading
  text-[48px]
  sm:text-[70px]
  md:text-[90px]
  lg:text-[120px]
  xl:text-[150px]
  font-black
  uppercase
  leading-[0.85]
  tracking-[-0.04em]
  text-[#c4b89b]/55
  pr-6 sm:pr-12 md:pr-16
"
            >
              TRADITION • FLAVOUR • LUXURY • AUTHENTIC INDIAN TASTE •
            </span>
          ))}
        </motion.div>
      </div>

      {/* =========================
          CENTER PLATTER - Fully Responsive
      ========================= */}
      <div className="relative z-10 flex items-center justify-center px-4 sm:px-6 md:px-8">
        <div className="w-full max-w-350 flex items-center justify-center py-8 sm:py-12 md:py-16 lg:py-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            viewport={{ once: true }}
            className="relative w-full max-w-70 sm:max-w-87.5 md:max-w-105 lg:max-w-125 xl:max-w-137.5 aspect-square"
          >
            {/* Subtle glow effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-radial from-[#d4af37]/20 via-[#d4af37]/10 to-transparent blur-2xl scale-110" />

            {/* Background circle (if you have asset-bg.webp) */}
            <div
              className="absolute inset-0 hidden rounded-full bg-cover bg-center opacity-90"
              style={{
                backgroundImage: "url(/asset-bg.webp)",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
              }}
            />

            {/* Rotating platter */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 22,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <img
                src="/asset.png"
                alt="Paan platter"
                className="w-[85%] h-[85%] object-contain drop-shadow-2xl"
              />
            </motion.div>

            {/* Center logo - Static */}
            <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
              <img
                src="/paan-logo.png"
                alt="Paanshala Logo"
                className="w-16 sm:w-20 md:w-24 lg:w-32 xl:w-36 h-auto object-contain drop-shadow-lg"
                style={{ filter: "brightness(0) invert(1)" }}
              />
            </div>

            {/* Optional: Decorative floating elements */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-[#d4af37]/40 blur-sm"
                style={{
                  left: `${50 + 45 * Math.cos((i * Math.PI * 2) / 6)}%`,
                  top: `${50 + 45 * Math.sin((i * Math.PI * 2) / 6)}%`,
                }}
                animate={{
                  y: [0, -15, 0],
                  opacity: [0.4, 0.8, 0.4],
                }}
                transition={{
                  duration: 3 + i * 0.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.3,
                }}
              />
            ))}
          </motion.div>
        </div>
      </div>

      {/* Optional: Decorative wave dividers */}
      <div className="absolute top-0 left-0 right-0 h-12 sm:h-16 md:h-20 pointer-events-none">
        <svg
          viewBox="0 0 1440 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          <path
            d="M0,50 Q360,10 720,50 T1440,50 L1440,0 L0,0 Z"
            fill="#1B370A"
            opacity="1"
          />
        </svg>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-12 sm:h-16 md:h-20 pointer-events-none rotate-180">
        <svg
          viewBox="0 0 1440 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          <path
            d="M0,50 Q360,10 720,50 T1440,50 L1440,0 L0,0 Z"
            fill="#1B1A18"
            opacity="1"
          />
        </svg>
      </div>
    </section>
  );
}