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
} from "lucide-react";

const PERKS = [
  {
    icon: Coffee,
    title: "Paan Every Day",
    desc: "Fresh handcrafted paan on the house - because every great day starts with one.",
  },
  {
    icon: TrendingUp,
    title: "Grow With Us",
    desc: "A young brand where your ideas shape the product and your impact is always visible.",
  },
  {
    icon: Heart,
    title: "Purpose-Driven Work",
    desc: "Help preserve and modernise a 5,000-year-old Indian tradition loved by millions.",
  },
  {
    icon: Users,
    title: "Close-Knit Team",
    desc: "Small, passionate people who genuinely care - and genuinely have fun doing it.",
  },
  {
    icon: Leaf,
    title: "Flexible Culture",
    desc: "We measure success by results, not by how many hours you spent at a desk.",
  },
  {
    icon: Star,
    title: "Always Rewarded",
    desc: "Generous discounts, milestone celebrations, and a team that appreciates great work.",
  },
];

const VALUES = [
  {
    number: "01",
    title: "Authenticity",
    desc: "Everything we make is rooted in real tradition - no shortcuts, no imitations.",
  },
  {
    number: "02",
    title: "Craftsmanship",
    desc: "We obsess over details because the people who love paan deserve nothing less.",
  },
  {
    number: "03",
    title: "Community",
    desc: "Paanshala is not just a brand - it's a shared love of culture, flavour, and people.",
  },
  {
    number: "04",
    title: "Curiosity",
    desc: "We're always asking how to do things better, fresher, and more delightfully.",
  },
];

export default function CareerPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* ══ HERO ══ */}
      <section className="relative overflow-hidden bg-linear-to-br from-[#1a2e0a] via-[#2d5016] to-[#3d6820] py-30">
        {/* Dot pattern */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(212,175,55,0.18) 1.5px, transparent 1.5px)",
            backgroundSize: "30px 30px",
          }}
        />
        {/* Gold blobs */}
        <div className="pointer-events-none absolute -top-20 -right-20 w-125 h-125 bg-[#d4af37]/10 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 w-100 h-100 bg-[#d4af37]/8 rounded-full blur-3xl" />
        {/* Bottom wave */}
        <div
          className="absolute bottom-0 left-0 right-0 h-20 bg-white"
          style={{ clipPath: "ellipse(58% 100% at 50% 100%)" }}
        />

        <div className="relative max-w-3xl mx-auto px-4 md:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-5 py-2.5 rounded-full mb-8">
              <Sparkles className="w-4 h-4 text-[#d4af37]" />
              <span className="text-sm font-semibold text-white tracking-widest uppercase">
                Come Join Us
              </span>
            </div>

            <h1
              className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-white leading-[1.08] mb-6 tracking-tight"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Build Something
              <br />
              <span className="text-[#d4af37]">Truly Special.</span>
            </h1>

            <p className="text-white/65 text-lg md:text-xl max-w-xl mx-auto leading-relaxed">
              We're a passionate team on a mission to bring India's most beloved
              tradition to every doorstep. If that excites you - we'd love to
              hear from you.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ══ STORY ══ */}
      <section className="py-14 md:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center">
            {/* Left - text */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
            >
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#2d5016] mb-4">
                Our Story
              </p>
              <h2
                className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight mb-6"
                style={{ fontFamily: "Georgia, serif" }}
              >
                More Than a Brand -<br />A Living Tradition.
              </h2>
              <div className="space-y-4 text-gray-500 leading-relaxed">
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
                <p>
                  We're growing fast, and we're looking for people who bring
                  energy, ideas, and a bit of heart to everything they do.
                </p>
              </div>
            </motion.div>

            {/* Right - values grid */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-5"
            >
              {VALUES.map((v, i) => (
                <motion.div
                  key={v.number}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-[#fafaf6] border border-gray-100 rounded-2xl p-5 hover:border-[#2d5016]/20 hover:shadow-md transition-all duration-300"
                >
                  <p className="text-3xl font-extrabold text-[#d4af37] mb-2 leading-none">
                    {v.number}
                  </p>
                  <h3 className="font-bold text-gray-900 mb-1.5">{v.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {v.desc}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══ PERKS ══ */}
      <section className="py-20 bg-[#fafaf6]">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#2d5016] mb-4">
              Why Paanshala
            </p>
            <h2
              className="text-3xl md:text-4xl font-extrabold text-gray-900"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Life is sweeter here.
            </h2>
            <p className="text-gray-500 mt-4 max-w-xl mx-auto">
              We look after our people the way we look after our paan - with
              care, attention, and a little bit of extra love.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {PERKS.map((perk, i) => (
              <motion.div
                key={perk.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:border-[#2d5016]/20 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-linear-to-br from-[#2d5016] to-[#3d6820] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                  <perk.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{perk.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {perk.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA ══ */}
      <section className="py-10 bg-white relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute top-0 right-0 w-96 h-96 bg-[#d4af37]/6 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 w-80 h-80 bg-[#2d5016]/5 rounded-full blur-3xl" />

        <div className="relative max-w-2xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            <h2
              className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-5"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Love for paan?
              <br />
              We'd love to talk.
            </h2>

            <p className="text-gray-500 text-lg leading-relaxed mb-10 max-w-lg mx-auto">
              We don't have a long application form. Just send us a note - tell
              us who you are, what you'd bring, and why Paanshala feels like
              home. We read every single email.
            </p>

            {/* Divider */}
            <div className="flex items-center gap-4 mb-10 max-w-xs mx-auto">
              <div className="flex-1 h-px bg-linear-to-r from-transparent to-[#d4af37]/40" />
              <Sparkles className="w-4 h-4 text-[#d4af37]" />
              <div className="flex-1 h-px bg-linear-to-l from-transparent to-[#d4af37]/40" />
            </div>

            {/* Email CTA */}
            <a
              href="mailto:careers@paanshala.com?subject=I love paan - let's talk!&body=Hi Paanshala Team,%0A%0AI'm reaching out because I'd love to be part of what you're building.%0A%0AA little about me:%0A[Write a few lines about yourself]%0A%0AWhat I'd bring to the team:%0A[Tell us your superpower]%0A%0ALooking forward to hearing from you!%0A%0AWarm regards,%0A[Your Name]"
              className="group inline-flex items-center gap-3 px-9 py-4 bg-linear-to-r from-[#2d5016] to-[#3d6820] hover:opacity-90 text-white font-bold rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 text-base"
            >
              <Mail className="w-5 h-5" />
              careers@paanshala.com
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>

            <p className="text-gray-400 text-sm mt-5">
              No recruiters, no bots - just real people who love what they do.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
