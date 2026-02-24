"use client";

import { motion } from "framer-motion";
import { Leaf, Sparkles, Heart, ArrowRight } from "lucide-react";

const RITUAL_STEPS = [
  {
    icon: Leaf,
    title: "Select Your Mood",
    description:
      "From refreshing to indulgent, choose a paan that complements your moment and mindset.",
    color: "from-green-600 to-emerald-600",
    bgColor: "from-green-50 to-emerald-50",
    step: "01",
  },
  {
    icon: Sparkles,
    title: "Freshly Crafted",
    description:
      "Prepared using natural ingredients, folded with care, and perfected by tradition.",
    color: "from-amber-600 to-yellow-600",
    bgColor: "from-amber-50 to-yellow-50",
    step: "02",
  },
  {
    icon: Heart,
    title: "Savor the Moment",
    description:
      "Pause, indulge, and let the flavors unfold — a gentle reminder to slow down.",
    color: "from-rose-600 to-pink-600",
    bgColor: "from-rose-50 to-pink-50",
    step: "03",
  },
];

export default function PaanshalaRitual() {
  return (
    <section className="relative bg-linear-to-b from-white via-[#fafaf6] to-white py-20 overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Animated Circles */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-20 right-10 w-64 h-64 bg-[#d4af37]/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-20 left-10 w-80 h-80 bg-[#2d5016]/10 rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16 md:mb-20"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-linear-to-r from-[#d4af37]/20 to-[#f4d03f]/20 px-4 py-2 rounded-full mb-4">
            <Sparkles className="w-4 h-4 text-[#d4af37]" />
            <span className="text-sm font-semibold text-[#2d5016] tracking-wide">
              EXPERIENCE THE RITUAL
            </span>
          </div>

          {/* Title */}
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            The Paanshala{" "}
            <span className="bg-linear-to-r from-[#2d5016] via-[#3d6820] to-[#2d5016] bg-clip-text text-transparent">
              Ritual
            </span>
          </h2>

          {/* Description */}
          <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
            A mindful journey rooted in heritage, crafted for moments that
            deserve indulgence.
          </p>

          {/* Decorative Line */}
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: "100%" }}
            transition={{ duration: 1, delay: 0.3 }}
            viewport={{ once: true }}
            className="h-px bg-linear-to-r from-transparent via-[#d4af37] to-transparent mt-8 max-w-md mx-auto"
          />
        </motion.div>

        {/* RITUAL STEPS */}
        <div className="relative">
          {/* Connection Line - Desktop */}
          <div className="hidden md:block absolute top-24 left-0 right-0 h-0.5">
            <div className="relative h-full max-w-4xl mx-auto">
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                transition={{ duration: 1.5, delay: 0.5 }}
                viewport={{ once: true }}
                className="h-full bg-linear-to-r from-green-300 via-amber-300 to-rose-300 origin-left"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
            {RITUAL_STEPS.map((step, index) => (
              <RitualCard key={step.title} step={step} index={index} />
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <p className="text-gray-600 mb-6">Ready to begin your journey?</p>
          <a
            href="/shop"
            className="inline-flex items-center gap-2 px-8 py-4 bg-linear-to-r from-[#2d5016] to-[#3d6820] text-white rounded-full font-semibold hover:opacity-90 transition-all shadow-lg hover:shadow-xl group"
          >
            Explore Our Collection
            <motion.span
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <ArrowRight className="w-5 h-5" />
            </motion.span>
          </a>
        </motion.div>
      </div>
    </section>
  );
}

/* =========================
   RITUAL CARD
========================= */
function RitualCard({ step, index }) {
  const Icon = step.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.2, duration: 0.6 }}
      className="relative group"
    >
      {/* Connection Dot - Desktop */}
      <div
        className="hidden md:block absolute top-24 left-1/2 -translate-x-1/2 w-6 h-6 bg-white rounded-full border-4 border-current z-10 group-hover:scale-125 transition-transform duration-300"
        style={{
          color: `rgb(${
            index === 0
              ? "34, 197, 94" // green-500
              : index === 1
                ? "251, 191, 36" // amber-400
                : "244, 63, 94" // rose-500
          })`,
        }}
      />

      {/* Card */}
      <div
        className={`relative bg-linear-to-br ${step.bgColor} rounded-3xl p-8 md:p-10 text-center overflow-hidden group-hover:shadow-2xl transition-all duration-500 border-2 border-transparent group-hover:border-current/20`}
        style={{
          borderColor:
            index === 0 ? "#22c55e20" : index === 1 ? "#fbbf2420" : "#f43f5e20",
        }}
      >
        {/* Decorative Corner Element */}
        <div
          className={`absolute -top-12 -right-12 w-32 h-32 bg-linear-to-br ${step.color} rounded-full opacity-10 group-hover:scale-150 transition-transform duration-500`}
        />

        {/* Step Number Badge */}
        <div className="relative mb-6">
          <div className="inline-block">
            <div
              className={`relative w-20 h-20 rounded-2xl bg-linear-to-br ${step.color} shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}
            >
              <Icon className="absolute inset-0 m-auto w-10 h-10 text-white" />
            </div>

            {/* Step Number */}
            <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center">
              <span
                className={`text-sm font-bold bg-linear-to-br ${step.color} bg-clip-text text-transparent`}
              >
                {step.step}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 group-hover:text-[#2d5016] transition-colors duration-300">
          {step.title}
        </h3>

        <p className="text-gray-600 leading-relaxed text-base">
          {step.description}
        </p>

        {/* Bottom Accent Line */}
        <div
          className="mt-6 h-1 w-0 bg-linear-to-r from-transparent via-current to-transparent group-hover:w-full transition-all duration-500 mx-auto rounded-full"
          style={{
            color: `rgb(${
              index === 0
                ? "34, 197, 94"
                : index === 1
                  ? "251, 191, 36"
                  : "244, 63, 94"
            })`,
          }}
        />
      </div>

      {/* Arrow Connector - Desktop */}
      {index < RITUAL_STEPS.length - 1 && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.2 + 0.4 }}
          viewport={{ once: true }}
          className="hidden md:block absolute top-1/2 -right-8 text-gray-300 z-0"
        >
          <ArrowRight className="w-16 h-16" strokeWidth={1} />
        </motion.div>
      )}
    </motion.div>
  );
}
