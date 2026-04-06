"use client";

import { motion } from "framer-motion";

const TRUST_BADGES = [
  { emoji: "🌿", label: "Tobacco Free", bg: "from-[#2d5016] to-[#3d6820]" },
  { emoji: "❄️", label: "Non Addictive", bg: "from-[#1a6bb5] to-[#1e88e5]" },
  {
    emoji: "🌾",
    label: "Natural Ingredients",
    bg: "from-[#e07b2a] to-[#f59c47]",
  },
];

export default function AboutPaanshala() {
  return (
    <section className="relative overflow-hidden bg-[#f5f2eb] py-10 sm:py-14 lg:py-20 font-serif">
      {/* Dot pattern */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(45,80,22,0.12) 1.5px, transparent 1.5px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-8 lg:px-12">
        <div className="flex flex-col items-center gap-8 sm:gap-10 lg:flex-row lg:items-center lg:gap-16 xl:gap-24">
          {/* LEFT: Rotating paan image — smaller on mobile, larger on sm+ */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative mx-auto w-50 shrink-0 sm:w-75 md:w-95 lg:w-105"
            style={{ aspectRatio: "1 / 1" }}
          >
            {/* Background circle */}
            <div
              className="absolute inset-0 rounded-full bg-cover bg-center"
              style={{ backgroundImage: "url(/asset-bg.webp)" }}
            />

            {/* Rotating platter */}
            <motion.img
              src="/asset.png"
              alt="Paan platter"
              animate={{ rotate: 360 }}
              transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
              className="absolute left-1/2 top-1/2 z-10 block -translate-x-1/2 -translate-y-1/2 object-contain"
              style={{ width: "85%", height: "85%" }}
            />

            {/* Static logo */}
            <div className="pointer-events-none absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 text-center">
              <img
                src="/paan-logo.png"
                alt="Paanshala Logo"
                className="block h-auto w-14 object-contain opacity-95 sm:w-20 lg:w-28"
                style={{ filter: "brightness(0) invert(1)" }}
              />
            </div>
          </motion.div>

          {/* RIGHT: Content */}
          <motion.div
            initial={{ opacity: 0, x: 0 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="flex min-w-0 flex-1 flex-col items-center text-center lg:items-start lg:text-left"
          >
            {/* Eyebrow */}
            <p className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.22em] text-red-600 sm:text-xs">
              About Paanshala
            </p>

            {/* Heading — no forced <br> on mobile so it wraps naturally */}
            <h2 className="mb-4 text-2xl font-extrabold leading-[1.18] text-gray-900 sm:text-3xl md:text-4xl lg:text-[3rem]">
              A Modern Twist To{" "}
              <span className="block sm:inline">India's Healthy Dessert</span>
            </h2>

            {/* Body copy — reduced bottom margin on mobile */}
            <p className="mb-3 max-w-xl text-[14px] leading-[1.75] text-gray-500 sm:text-base sm:leading-[1.85]">
              Paanshala is deeply connected with traditions, culture, and
              delectable foods and flavors. The recipes are passed down through
              the generations. We are proud to bring this Indian tradition into
              the 21st century.
            </p>
            <p className="mb-7 max-w-xl text-[14px] leading-[1.75] text-gray-500 sm:mb-9 sm:text-base sm:leading-[1.85]">
              Paan is one such thing that has ruled the world's food culture for
              a long time. It is a delightful treat and a very effective mouth
              freshener loved by all.
            </p>

            {/* Trust badges */}
            <div className="flex flex-wrap justify-center gap-2.5 sm:gap-3 lg:justify-start">
              {TRUST_BADGES.map((badge, i) => (
                <motion.div
                  key={badge.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.06, y: -4 }}
                  className={`flex cursor-default items-center gap-2.5 rounded-xl bg-linear-to-br ${badge.bg} px-3.5 py-2.5 text-white shadow-lg sm:rounded-2xl sm:px-5 sm:py-3.5`}
                >
                  <span className="shrink-0 text-lg sm:text-[26px]">
                    {badge.emoji}
                  </span>
                  <span className="text-[12px] font-bold leading-snug sm:text-[15px]">
                    {badge.label}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}