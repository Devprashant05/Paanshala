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
          {/* LEFT: Portrait video with ornate frame */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative mx-auto shrink-0 w-52 sm:w-72 md:w-80 lg:w-88"
            style={{ aspectRatio: "9 / 16" }}
          >
            {/* Layered glow backdrop */}
            <div
              className="absolute rounded-3xl"
              style={{
                inset: "-3px",
                background:
                  "linear-gradient(135deg, #d4af37 0%, #2d5016 40%, #d4af37 70%, #2d5016 100%)",
                padding: "2px",
                borderRadius: "28px",
              }}
            />

            {/* Outer decorative ring — dashed gold */}
            <div
              className="absolute"
              style={{
                inset: "-10px",
                borderRadius: "36px",
                border: "1px dashed #d4af3760",
              }}
            />

            {/* Animated shimmer ring */}
            {/* <div
              className="absolute"
              style={{
                inset: "-6px",
                borderRadius: "32px",
                background:
                  "conic-gradient(from 0deg, #d4af37, #2d5016, #d4af37, #2d5016, #d4af37)",
                opacity: 0.4,
                animation: "spin 8s linear infinite",
              }}
            /> */}
            <div
              className="absolute"
              style={{
                inset: "-4px",
                borderRadius: "30px",
                background: "#f5f2eb",
              }}
            />

            {/* Corner ornaments — SVG filigree */}
            {[
              { cls: "top-0 left-0", rot: "0deg" },
              { cls: "top-0 right-0", rot: "90deg" },
              { cls: "bottom-0 right-0", rot: "180deg" },
              { cls: "bottom-0 left-0", rot: "270deg" },
            ].map(({ cls, rot }, i) => (
              <svg
                key={i}
                viewBox="0 0 40 40"
                className={`absolute ${cls} w-10 h-10 sm:w-12 sm:h-12 z-30 pointer-events-none`}
                style={{ transform: `rotate(${rot})` }}
              >
                {/* L-bracket */}
                <path
                  d="M4 36 L4 4 L36 4"
                  fill="none"
                  stroke="#d4af37"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                {/* Inner decorative dot */}
                <circle cx="4" cy="4" r="2.5" fill="#d4af37" />
                {/* Small tick marks along the arms */}
                <line
                  x1="4"
                  y1="14"
                  x2="9"
                  y2="14"
                  stroke="#d4af3780"
                  strokeWidth="1"
                  strokeLinecap="round"
                />
                <line
                  x1="4"
                  y1="22"
                  x2="9"
                  y2="22"
                  stroke="#d4af3780"
                  strokeWidth="1"
                  strokeLinecap="round"
                />
                <line
                  x1="14"
                  y1="4"
                  x2="14"
                  y2="9"
                  stroke="#d4af3780"
                  strokeWidth="1"
                  strokeLinecap="round"
                />
                <line
                  x1="22"
                  y1="4"
                  x2="22"
                  y2="9"
                  stroke="#d4af3780"
                  strokeWidth="1"
                  strokeLinecap="round"
                />
              </svg>
            ))}

            {/* Video */}
            <div
              className="absolute z-10 overflow-hidden"
              style={{ inset: "2px", borderRadius: "22px" }}
            >
              <video
                src="https://res.cloudinary.com/lx9sbbut/video/upload/v1787743739/video_rc3xsv.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />

              {/* Inner vignette */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.35) 100%)",
                }}
              />
            </div>

            {/* Spin keyframe */}
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </motion.div>

          {/* https://res.cloudinary.com/lx9sbbut/video/upload/v1787743739/video_rc3xsv.mp4 */}

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
            <div className="flex justify-center gap-2.5 sm:gap-3 lg:justify-start">
              {TRUST_BADGES.map((badge, i) => (
                <motion.div
                  key={badge.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.06, y: -4 }}
                  className={`flex cursor-default items-center gap-2 rounded-xl bg-linear-to-br ${badge.bg} px-3.5 py-2.5 text-white shadow-lg sm:rounded-2xl sm:px-5 sm:py-3.5`}
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
