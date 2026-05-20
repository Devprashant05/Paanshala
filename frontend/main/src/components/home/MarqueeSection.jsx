"use client";

import { motion } from "framer-motion";

export default function SimpleMarquee({
  text = "WARNING : MAY CAUSE AN IRRESISTIBLE URGE TO SNACK ALL THE TIME...",
  speed = 10,
}) {
  const repeatedText = `${text} • ${text} • ${text} • ${text} • ${text} • ${text} • ${text}`;

  return (
    <div className="relative w-full overflow-hidden">
      {/* Top border */}
      <div className="w-full h-1 bg-[#1a1a1a]" />

      {/* Marquee */}
      <div className="bg-gold-bright py-6 md:py-6 overflow-hidden">
        <motion.div
          className="flex whitespace-nowrap"
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            duration: speed,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <span className="text-heading uppercase font-semibold text-4xl md:text-5xl lg:text-6xl text-[#1a1a1a] inline-block pr-12">
            {repeatedText}
          </span>
          <span className="text-heading uppercase font-semibold text-4xl md:text-5xl lg:text-6xl text-[#1a1a1a] inline-block pr-12">
            {repeatedText}
          </span>
        </motion.div>
      </div>

      {/* Bottom border */}
      <div className="w-full h-1 bg-[#1a1a1a]" />
    </div>
  );
}
