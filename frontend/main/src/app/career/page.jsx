"use client";

import { motion } from "framer-motion";
import {
  Mail,
  Sparkles,
  Heart,
  TrendingUp,
  Coffee,
  Users,
  Leaf,
  Star,
  ArrowRight,
  Smile,
  Award,
  Zap,
  Target,
  Gift,
} from "lucide-react";

const PERKS = [
  {
    icon: Coffee,
    title: "Paan Every Day",
    desc: "Fresh handcrafted paan on the house - because every great day starts with one.",
    color: "from-amber-500 to-orange-600",
  },
  {
    icon: TrendingUp,
    title: "Grow With Us",
    desc: "A young brand where your ideas shape the product and your impact is always visible.",
    color: "from-emerald-500 to-teal-600",
  },
  {
    icon: Heart,
    title: "Purpose-Driven Work",
    desc: "Help preserve and modernise a 5,000-year-old Indian tradition loved by millions.",
    color: "from-rose-500 to-pink-600",
  },
  {
    icon: Users,
    title: "Close-Knit Team",
    desc: "Small, passionate people who genuinely care - and genuinely have fun doing it.",
    color: "from-blue-500 to-indigo-600",
  },
  {
    icon: Leaf,
    title: "Flexible Culture",
    desc: "We measure success by results, not by how many hours you spent at a desk.",
    color: "from-lime-500 to-green-600",
  },
  {
    icon: Star,
    title: "Always Rewarded",
    desc: "Generous discounts, milestone celebrations, and a team that appreciates great work.",
    color: "from-violet-500 to-purple-600",
  },
];

const VALUES = [
  {
    number: "01",
    title: "Authenticity",
    desc: "Everything we make is rooted in real tradition - no shortcuts, no imitations.",
    icon: Award,
  },
  {
    number: "02",
    title: "Craftsmanship",
    desc: "We obsess over details because the people who love paan deserve nothing less.",
    icon: Zap,
  },
  {
    number: "03",
    title: "Community",
    desc: "Paanshala is not just a brand - it's a shared love of culture, flavour, and people.",
    icon: Users,
  },
  {
    number: "04",
    title: "Curiosity",
    desc: "We're always asking how to do things better, fresher, and more delightfully.",
    icon: Target,
  },
];

const STATS = [
  { value: "100%", label: "Remote-Friendly", icon: Smile },
  { value: "5000+", label: "Years of Tradition", icon: Star },
  { value: "∞", label: "Growth Potential", icon: TrendingUp },
  { value: "1", label: "Big Happy Family", icon: Heart },
];

export default function CareerPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-gray-50">
      {/* ══ HERO ══ */}
      <section className="relative overflow-hidden bg-linear-to-br from-[#1a2e0a] via-[#2d5016] to-[#264B0E] py-20 sm:py-28 md:py-36">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(212,175,55,0.3) 2px, transparent 2px)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        {/* Floating shapes */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-[#d4af37]/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-gold-bright/10 rounded-full blur-3xl animate-pulse delay-700" />

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-24">
          <svg
            viewBox="0 0 1440 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
            preserveAspectRatio="none"
          >
            <path
              d="M0,50 Q360,0 720,50 T1440,50 L1440,100 L0,100 Z"
              fill="rgb(249, 250, 251)"
            />
          </svg>
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/25 px-6 py-3 rounded-full mb-8 shadow-xl"
              >
                <Sparkles className="w-5 h-5 text-gold-bright animate-pulse" />
                <span className="text-sm font-bold text-white tracking-[0.2em] uppercase">
                  Join Our Journey
                </span>
              </motion.div>

              {/* Main heading */}
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white leading-[1.1] mb-6 tracking-tight">
                Build Something
                <br />
                <span className="bg-linear-to-r from-gold-bright via-[#d4af37] to-gold-bright bg-clip-text text-transparent">
                  Truly Special.
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-white/80 text-lg sm:text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed mb-12">
                We're a passionate team on a mission to bring India's most
                beloved tradition to every doorstep.{" "}
                <span className="text-gold-bright font-semibold">
                  If that excites you
                </span>{" "}
                - we'd love to hear from you.
              </p>

              {/* Quick stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                {STATS.map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all"
                  >
                    <stat.icon className="w-8 h-8 text-gold-bright mx-auto mb-2" />
                    <p className="text-3xl font-black text-white mb-1">
                      {stat.value}
                    </p>
                    <p className="text-sm text-white/70 font-medium">
                      {stat.label}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══ STORY ══ */}
      <section className="py-16 sm:py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left - text */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 bg-linear-to-r from-[#2d5016]/10 to-[#264B0E]/10 px-4 py-2 rounded-full mb-6">
                <Leaf className="w-4 h-4 text-[#2d5016]" />
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#2d5016]">
                  Our Story
                </span>
              </div>

              <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 leading-[1.15] mb-6">
                More Than a Brand -
                <br />
                <span className="text-[#2d5016]">A Living Tradition.</span>
              </h2>

              <div className="space-y-5 text-gray-600 text-base sm:text-lg leading-relaxed">
                <p>
                  Paanshala was born from a simple belief: that paan - one of
                  India's oldest and most joyful rituals - deserves a home
                  worthy of its heritage. We blend century-old recipes with
                  modern craft to create something that feels both timeless and
                  fresh.
                </p>
                <p>
                  Behind every fold of paan is a team of people who genuinely
                  love what they do. We're chefs, creators, builders, and
                  storytellers - all united by a passion for authentic flavour
                  and cultural pride.
                </p>
                <p className="font-semibold text-[#2d5016]">
                  We're growing fast, and we're looking for people who bring
                  energy, ideas, and a bit of heart to everything they do.
                </p>
              </div>
            </motion.div>

            {/* Right - values grid */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-6"
            >
              {VALUES.map((v, i) => (
                <motion.div
                  key={v.number}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="relative bg-linear-to-br from-white to-gray-50 border-2 border-gray-100 rounded-3xl p-6 hover:border-[#2d5016]/30 hover:shadow-2xl transition-all duration-300 group overflow-hidden"
                >
                  {/* Background gradient on hover */}
                  <div className="absolute inset-0 bg-linear-to-br from-[#2d5016]/5 to-gold-bright/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="relative">
                    {/* Icon */}
                    <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-[#2d5016] to-[#264B0E] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                      <v.icon className="w-7 h-7 text-white" />
                    </div>

                    {/* Number */}
                    <p className="text-6xl font-black text-gold-bright/20 absolute top-0 right-0 leading-none">
                      {v.number}
                    </p>

                    {/* Content */}
                    <h3 className="font-black text-xl text-gray-900 mb-2">
                      {v.title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {v.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══ PERKS ══ */}
      <section className="py-20 sm:py-28 bg-linear-to-br from-gray-50 via-white to-gray-50 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold-bright/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#2d5016]/5 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-linear-to-r from-[#2d5016]/10 to-[#264B0E]/10 px-4 py-2 rounded-full mb-6">
              <Gift className="w-4 h-4 text-[#2d5016]" />
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#2d5016]">
                Why Paanshala
              </span>
            </div>

            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 mb-5">
              Life is{" "}
              <span className="text-[#2d5016]">sweeter</span> here.
            </h2>
            <p className="text-gray-600 text-lg sm:text-xl mt-4 max-w-2xl mx-auto leading-relaxed">
              We look after our people the way we look after our paan - with
              care, attention, and a little bit of extra love.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {PERKS.map((perk, i) => (
              <motion.div
                key={perk.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="relative bg-white rounded-3xl p-8 border-2 border-gray-100 shadow-lg hover:shadow-2xl hover:border-transparent transition-all duration-300 group overflow-hidden"
              >
                {/* Gradient overlay on hover */}
                <div
                  className={`absolute inset-0 bg-linear-to-br ${perk.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                />

                <div className="relative">
                  {/* Icon */}
                  <div
                    className={`w-16 h-16 rounded-2xl bg-linear-to-br ${perk.color} flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-xl`}
                  >
                    <perk.icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Title */}
                  <h3 className="font-black text-xl text-gray-900 mb-3 group-hover:text-[#2d5016] transition-colors">
                    {perk.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 leading-relaxed">{perk.desc}</p>
                </div>

                {/* Decorative corner */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-linear-to-bl from-gray-50 to-transparent rounded-bl-3xl opacity-50" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA ══ */}
      <section className="py-20 sm:py-28 bg-white relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-gold-bright/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-[#2d5016]/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            {/* Icon */}
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-linear-to-br from-[#2d5016] to-[#264B0E] shadow-2xl mb-8"
            >
              <Heart className="w-10 h-10 text-white" />
            </motion.div>

            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 leading-tight mb-6">
              Love for paan?
              <br />
              <span className="text-[#2d5016]">We'd love to talk.</span>
            </h2>

            <p className="text-gray-600 text-lg sm:text-xl leading-relaxed mb-10 max-w-2xl mx-auto">
              We don't have a long application form. Just send us a note - tell
              us who you are, what you'd bring, and why Paanshala feels like
              home.{" "}
              <span className="font-semibold text-[#2d5016]">
                We read every single email.
              </span>
            </p>

            {/* Decorative divider */}
            <div className="flex items-center justify-center gap-4 mb-12">
              <div className="h-px w-24 bg-linear-to-r from-transparent via-[#d4af37] to-transparent" />
              <Sparkles className="w-6 h-6 text-gold-bright animate-pulse" />
              <div className="h-px w-24 bg-linear-to-r from-transparent via-[#d4af37] to-transparent" />
            </div>

            {/* Email CTA */}
            <motion.a
              href="mailto:careers@paanshala.com?subject=I love paan - let's talk!&body=Hi Paanshala Team,%0A%0AI'm reaching out because I'd love to be part of what you're building.%0A%0AA little about me:%0A[Write a few lines about yourself]%0A%0AWhat I'd bring to the team:%0A[Tell us your superpower]%0A%0ALooking forward to hearing from you!%0A%0AWarm regards,%0A[Your Name]"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="group inline-flex items-center gap-3 px-10 py-5 bg-linear-to-r from-[#2d5016] via-[#264B0E] to-[#2d5016] bg-size-200 bg-pos-0 hover:bg-pos-100 text-white font-black rounded-full shadow-2xl hover:shadow-3xl transition-all duration-500 text-lg"
            >
              <Mail className="w-6 h-6" />
              careers@paanshala.com
              <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </motion.a>

            <p className="text-gray-400 text-sm mt-8 flex items-center justify-center gap-2">
              <Smile className="w-4 h-4" />
              No recruiters, no bots - just real people who love what they do.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}