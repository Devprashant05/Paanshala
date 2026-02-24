"use client";

import { motion } from "framer-motion";
import { Leaf, Heart, Sparkles, Shield, CheckCircle2 } from "lucide-react";

const STORY = [
  {
    title: "Rooted in Tradition",
    text: "Paanshala draws inspiration from centuries-old paan culture, where craftsmanship, balance, and ritual defined every bite.",
    icon: Leaf,
    color: "from-green-600 to-emerald-600",
  },
  {
    title: "Crafted with Care",
    text: "Every paan is hand-finished using carefully sourced ingredients, preserving authenticity without compromise.",
    icon: Heart,
    color: "from-rose-600 to-pink-600",
  },
  {
    title: "Reimagined for Today",
    text: "We bring paan into the modern lifestyle — refined, tobacco-free, and designed for mindful indulgence.",
    icon: Sparkles,
    color: "from-amber-600 to-yellow-600",
  },
];

const TRUST_PILLARS = [
  {
    icon: Shield,
    title: "Tobacco Free",
    subtitle: "Pure indulgence without compromise",
    stat: "100%",
    label: "Natural",
  },
  {
    icon: Heart,
    title: "Non Addictive",
    subtitle: "Designed for mindful enjoyment",
    stat: "0%",
    label: "Harmful",
  },
  {
    icon: Leaf,
    title: "Natural Ingredients",
    subtitle: "Nothing artificial, ever",
    stat: "Fresh",
    label: "Daily",
  },
];

export default function AboutPaanshalaJourney() {
  return (
    <section className="relative bg-linear-to-b from-white via-[#fafaf6] to-white py-20 overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute -top-40 -right-40 w-80 h-80 bg-linear-to-br from-[#d4af37]/10 to-[#f4d03f]/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            rotate: -360,
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-linear-to-tr from-[#2d5016]/10 to-[#3d6820]/10 rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        {/* SECTION HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center max-w-4xl mx-auto mb-16 md:mb-24"
        >
          {/* Label */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-linear-to-r from-[#d4af37]/20 to-[#f4d03f]/20 px-4 py-2 rounded-full mb-6"
          >
            <Sparkles className="w-4 h-4 text-[#d4af37]" />
            <span className="text-sm font-semibold text-[#2d5016] tracking-wide">
              ABOUT PAANSHALA
            </span>
          </motion.div>

          {/* Title */}
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
            Where Heritage Meets
            <span className="block mt-2 bg-linear-to-r from-[#2d5016] via-[#3d6820] to-[#2d5016] bg-clip-text text-transparent">
              Modern Indulgence
            </span>
          </h2>

          {/* Description */}
          <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
            Paanshala is not just a dessert — it is a journey through India's
            culinary heritage, thoughtfully adapted for the present generation.
          </p>

          {/* Decorative Line */}
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: "100%" }}
            transition={{ duration: 1, delay: 0.5 }}
            viewport={{ once: true }}
            className="h-px bg-linear-to-r from-transparent via-[#d4af37] to-transparent mt-8 max-w-md mx-auto"
          />
        </motion.div>

        {/* STORY TIMELINE */}
        <div className="relative mb-20 md:mb-32">
          {/* Connection Line - Desktop */}
          <div className="hidden md:block absolute top-24 left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-gray-300 to-transparent" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
            {STORY.map((item, index) => (
              <StoryCard key={item.title} item={item} index={index} />
            ))}
          </div>
        </div>

        {/* TRUST PILLARS */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative"
        >
          {/* Section Title */}
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Promise to You
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Every bite is a commitment to quality, tradition, and your
              well-being
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {TRUST_PILLARS.map((pillar, index) => (
              <TrustPillar key={pillar.title} pillar={pillar} index={index} />
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="mt-20 text-center"
        >
          <a href="/our-story">
            <button className="group relative px-8 py-4 bg-linear-to-r from-[#2d5016] to-[#3d6820] text-white font-semibold rounded-full overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
              <span className="relative z-10 flex items-center gap-2">
                Discover Our Full Story
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  →
                </motion.span>
              </span>
              <div className="absolute inset-0 bg-linear-to-r from-[#3d6820] to-[#2d5016] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
          </a>
        </motion.div>
      </div>
    </section>
  );
}

/* =========================
   STORY CARD
========================= */
function StoryCard({ item, index }) {
  const Icon = item.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: index * 0.15 }}
      viewport={{ once: true }}
      className="relative group"
    >
      {/* Card */}
      <div className="relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-[#d4af37]/30 overflow-hidden">
        {/* Decorative Corner */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-[#d4af37]/10 to-transparent rounded-bl-full transform translate-x-8 -translate-y-8 group-hover:scale-150 transition-transform duration-500" />

        {/* Icon Badge */}
        <div className="relative mb-6">
          <div
            className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br ${item.color} shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}
          >
            <Icon className="w-8 h-8 text-white" />
          </div>

          {/* Step Number */}
          <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-[#2d5016] text-white flex items-center justify-center text-sm font-bold shadow-md">
            0{index + 1}
          </div>
        </div>

        {/* Content */}
        <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 group-hover:text-[#2d5016] transition-colors duration-300">
          {item.title}
        </h3>

        <p className="text-gray-600 leading-relaxed">{item.text}</p>

        {/* Bottom Accent */}
        <div className="mt-6 h-1 w-0 bg-linear-to-r from-[#d4af37] to-[#f4d03f] group-hover:w-full transition-all duration-500 rounded-full" />
      </div>

      {/* Connection Dot - Desktop */}
      <div className="hidden md:block absolute top-24 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-4 border-[#d4af37] rounded-full z-10 group-hover:scale-150 transition-transform duration-300" />
    </motion.div>
  );
}

/* =========================
   TRUST PILLAR
========================= */
function TrustPillar({ pillar, index }) {
  const Icon = pillar.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="group relative"
    >
      <div className="relative bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-[#d4af37] transition-all duration-500 overflow-hidden h-full">
        {/* Background Gradient on Hover */}
        <div className="absolute inset-0 bg-linear-to-br from-[#d4af37]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="relative z-10">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-linear-to-br from-[#2d5016] to-[#3d6820] text-white mb-4 group-hover:scale-110 transition-transform duration-300">
            <Icon className="w-7 h-7" />
          </div>

          {/* Stat Badge */}
          <div className="mb-4">
            <span className="inline-block px-4 py-1 bg-[#d4af37]/10 text-[#2d5016] font-bold rounded-full text-sm">
              {pillar.stat} {pillar.label}
            </span>
          </div>

          {/* Title */}
          <h4 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#2d5016] transition-colors duration-300">
            {pillar.title}
          </h4>

          {/* Subtitle */}
          <p className="text-gray-600 mb-4">{pillar.subtitle}</p>

          {/* Check Icon */}
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-sm font-medium">Verified Quality</span>
          </div>
        </div>

        {/* Decorative Element */}
        <div className="absolute bottom-0 right-0 w-24 h-24 bg-linear-to-tl from-[#d4af37]/10 to-transparent rounded-tl-full transform translate-x-8 translate-y-8 group-hover:scale-150 transition-transform duration-500" />
      </div>
    </motion.div>
  );
}
