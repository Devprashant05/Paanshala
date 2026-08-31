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
        <div className="flex flex-col items-center gap-8 sm:gap-10 lg:flex-row lg:items-stretch lg:gap-16 xl:gap-24">
          {/* LEFT: Portrait video with ornate frame */}
          {/* LEFT: Portrait video with SVG frame */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative mx-auto shrink-0 w-52 sm:w-72 md:w-80 lg:w-88 lg:h-full"
            style={{ aspectRatio: "9 / 16" }}
          >
            {/* Video — inset slightly so frame sits on top of edges */}
            <div
              className="absolute overflow-hidden"
              style={{ inset: "10px", borderRadius: "18px" }}
            >
              <video
                src="https://res.cloudinary.com/lx9sbbut/video/upload/v1787743739/video_rc3xsv.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            </div>

            {/* SVG frame — sits over the video, pointer-events-none */}
            <svg
              viewBox="0 0 280 520"
              xmlns="http://www.w3.org/2000/svg"
              className="absolute inset-0 w-full h-full pointer-events-none"
              preserveAspectRatio="none"
            >
              {/* Outer dashed ring */}
              <rect
                x="2"
                y="2"
                width="276"
                height="516"
                rx="24"
                fill="none"
                stroke="#d4af37"
                strokeWidth="0.8"
                strokeDasharray="5 4"
                opacity="0.5"
              />

              {/* Main double border */}
              <rect
                x="8"
                y="8"
                width="264"
                height="504"
                rx="20"
                fill="none"
                stroke="#d4af37"
                strokeWidth="1.5"
              />
              <rect
                x="11"
                y="11"
                width="258"
                height="498"
                rx="18"
                fill="none"
                stroke="#d4af3750"
                strokeWidth="0.6"
              />

              {/* TOP-LEFT corner */}
              <path
                d="M8 52 L8 8 L52 8"
                fill="none"
                stroke="#d4af37"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle
                cx="8"
                cy="8"
                r="3.5"
                fill="none"
                stroke="#d4af37"
                strokeWidth="1"
              />
              <rect
                x="4"
                y="4"
                width="8"
                height="8"
                rx="1"
                fill="#d4af37"
                transform="rotate(45 8 8)"
              />
              <path
                d="M8 34 Q1 28 5 21"
                fill="none"
                stroke="#d4af37"
                strokeWidth="0.8"
                strokeLinecap="round"
                opacity="0.7"
              />
              <path
                d="M8 44 Q-1 38 4 29"
                fill="none"
                stroke="#d4af37"
                strokeWidth="0.6"
                strokeLinecap="round"
                opacity="0.4"
              />
              <path
                d="M28 8 Q22 1 15 6"
                fill="none"
                stroke="#d4af37"
                strokeWidth="0.8"
                strokeLinecap="round"
                opacity="0.7"
              />
              <path
                d="M38 8 Q32 0 24 5"
                fill="none"
                stroke="#d4af37"
                strokeWidth="0.6"
                strokeLinecap="round"
                opacity="0.4"
              />
              <circle cx="8" cy="34" r="1.5" fill="#d4af37" opacity="0.8" />
              <circle cx="8" cy="44" r="1" fill="#d4af37" opacity="0.5" />
              <circle cx="28" cy="8" r="1.5" fill="#d4af37" opacity="0.8" />
              <circle cx="38" cy="8" r="1" fill="#d4af37" opacity="0.5" />

              {/* TOP-RIGHT corner */}
              <path
                d="M272 52 L272 8 L228 8"
                fill="none"
                stroke="#d4af37"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle
                cx="272"
                cy="8"
                r="3.5"
                fill="none"
                stroke="#d4af37"
                strokeWidth="1"
              />
              <rect
                x="268"
                y="4"
                width="8"
                height="8"
                rx="1"
                fill="#d4af37"
                transform="rotate(45 272 8)"
              />
              <path
                d="M272 34 Q279 28 275 21"
                fill="none"
                stroke="#d4af37"
                strokeWidth="0.8"
                strokeLinecap="round"
                opacity="0.7"
              />
              <path
                d="M272 44 Q281 38 276 29"
                fill="none"
                stroke="#d4af37"
                strokeWidth="0.6"
                strokeLinecap="round"
                opacity="0.4"
              />
              <path
                d="M252 8 Q258 1 265 6"
                fill="none"
                stroke="#d4af37"
                strokeWidth="0.8"
                strokeLinecap="round"
                opacity="0.7"
              />
              <path
                d="M242 8 Q248 0 256 5"
                fill="none"
                stroke="#d4af37"
                strokeWidth="0.6"
                strokeLinecap="round"
                opacity="0.4"
              />
              <circle cx="272" cy="34" r="1.5" fill="#d4af37" opacity="0.8" />
              <circle cx="272" cy="44" r="1" fill="#d4af37" opacity="0.5" />
              <circle cx="252" cy="8" r="1.5" fill="#d4af37" opacity="0.8" />
              <circle cx="242" cy="8" r="1" fill="#d4af37" opacity="0.5" />

              {/* BOTTOM-LEFT corner */}
              <path
                d="M8 468 L8 512 L52 512"
                fill="none"
                stroke="#d4af37"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle
                cx="8"
                cy="512"
                r="3.5"
                fill="none"
                stroke="#d4af37"
                strokeWidth="1"
              />
              <rect
                x="4"
                y="508"
                width="8"
                height="8"
                rx="1"
                fill="#d4af37"
                transform="rotate(45 8 512)"
              />
              <path
                d="M8 486 Q1 492 5 499"
                fill="none"
                stroke="#d4af37"
                strokeWidth="0.8"
                strokeLinecap="round"
                opacity="0.7"
              />
              <path
                d="M8 476 Q-1 482 4 491"
                fill="none"
                stroke="#d4af37"
                strokeWidth="0.6"
                strokeLinecap="round"
                opacity="0.4"
              />
              <path
                d="M28 512 Q22 519 15 514"
                fill="none"
                stroke="#d4af37"
                strokeWidth="0.8"
                strokeLinecap="round"
                opacity="0.7"
              />
              <path
                d="M38 512 Q32 520 24 515"
                fill="none"
                stroke="#d4af37"
                strokeWidth="0.6"
                strokeLinecap="round"
                opacity="0.4"
              />
              <circle cx="8" cy="486" r="1.5" fill="#d4af37" opacity="0.8" />
              <circle cx="8" cy="476" r="1" fill="#d4af37" opacity="0.5" />
              <circle cx="28" cy="512" r="1.5" fill="#d4af37" opacity="0.8" />
              <circle cx="38" cy="512" r="1" fill="#d4af37" opacity="0.5" />

              {/* BOTTOM-RIGHT corner */}
              <path
                d="M272 468 L272 512 L228 512"
                fill="none"
                stroke="#d4af37"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle
                cx="272"
                cy="512"
                r="3.5"
                fill="none"
                stroke="#d4af37"
                strokeWidth="1"
              />
              <rect
                x="268"
                y="508"
                width="8"
                height="8"
                rx="1"
                fill="#d4af37"
                transform="rotate(45 272 512)"
              />
              <path
                d="M272 486 Q279 492 275 499"
                fill="none"
                stroke="#d4af37"
                strokeWidth="0.8"
                strokeLinecap="round"
                opacity="0.7"
              />
              <path
                d="M272 476 Q281 482 276 491"
                fill="none"
                stroke="#d4af37"
                strokeWidth="0.6"
                strokeLinecap="round"
                opacity="0.4"
              />
              <path
                d="M252 512 Q258 519 265 514"
                fill="none"
                stroke="#d4af37"
                strokeWidth="0.8"
                strokeLinecap="round"
                opacity="0.7"
              />
              <path
                d="M242 512 Q248 520 256 515"
                fill="none"
                stroke="#d4af37"
                strokeWidth="0.6"
                strokeLinecap="round"
                opacity="0.4"
              />
              <circle cx="272" cy="486" r="1.5" fill="#d4af37" opacity="0.8" />
              <circle cx="272" cy="476" r="1" fill="#d4af37" opacity="0.5" />
              <circle cx="252" cy="512" r="1.5" fill="#d4af37" opacity="0.8" />
              <circle cx="242" cy="512" r="1" fill="#d4af37" opacity="0.5" />

              {/* Mid-side ornaments */}
              <path
                d="M8 246 Q-4 256 8 266"
                fill="none"
                stroke="#d4af37"
                strokeWidth="1"
                strokeLinecap="round"
                opacity="0.6"
              />
              <circle cx="8" cy="256" r="2.5" fill="#d4af37" opacity="0.9" />
              <path
                d="M272 246 Q284 256 272 266"
                fill="none"
                stroke="#d4af37"
                strokeWidth="1"
                strokeLinecap="round"
                opacity="0.6"
              />
              <circle cx="272" cy="256" r="2.5" fill="#d4af37" opacity="0.9" />
              <path
                d="M126 8 Q140 -2 154 8"
                fill="none"
                stroke="#d4af37"
                strokeWidth="1"
                strokeLinecap="round"
                opacity="0.6"
              />
              <circle cx="140" cy="8" r="2.5" fill="#d4af37" opacity="0.9" />
              <path
                d="M126 512 Q140 522 154 512"
                fill="none"
                stroke="#d4af37"
                strokeWidth="1"
                strokeLinecap="round"
                opacity="0.6"
              />
              <circle cx="140" cy="512" r="2.5" fill="#d4af37" opacity="0.9" />
            </svg>
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
