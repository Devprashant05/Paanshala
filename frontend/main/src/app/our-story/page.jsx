"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import {
  ChevronRight,
  Star,
  Sparkles,
  Crown,
  Leaf,
  Heart,
  Award,
  Users,
  TrendingUp,
  Shield,
  CheckCircle,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* =========================
   COUNT UP COMPONENT
========================= */
function CountUp({ to, suffix = "", duration = 1.8 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    let start = 0;
    const end = to;
    const increment = end / (duration * 60);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        start = end;
        clearInterval(timer);
      }
      setCount(Math.floor(start));
    }, 16);

    return () => clearInterval(timer);
  }, [isInView, to, duration]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

/* =========================
   MAIN PAGE
========================= */
export default function OurStoryPage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-white to-gray-50">
      {/* =========================
          HERO SECTION
      ========================== */}
      <section className="relative h-100 md:h-125 flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/footer-bg.png"
            alt="Our Story"
            fill
            priority
            className="object-cover"
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-linear-to-b from-[#0b1f11]/95 via-[#0b1f11]/85 to-[#0b1f11]/95" />
        </div>

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 md:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-[#d4af37]/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Crown className="w-4 h-4 text-[#d4af37]" />
              <span className="text-sm font-medium text-[#d4af37]">
                Our Heritage
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              The Paanshala Story
            </h1>

            <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Where 5000 years of tradition meets modern luxury — Crafting
              India's finest paan experience
            </p>

            {/* Breadcrumb */}
            <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
              <Link href="/" className="hover:text-[#d4af37] transition-colors">
                Home
              </Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-white">Our Story</span>
            </div>
          </motion.div>
        </div>

        {/* Decorative gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-linear-to-t from-white to-transparent" />
      </section>

      {/* =========================
          INTRO SECTION
      ========================== */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-16 md:py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-[#d4af37]/10 px-3 py-1 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-[#d4af37]" />
              <span className="text-sm font-semibold text-[#d4af37]">
                Since 2019
              </span>
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              A Legacy Wrapped in Leaves
            </h2>

            <p className="text-gray-700 leading-relaxed mb-4">
              The betel leaf, or paan, holds a history that dates back more than{" "}
              <strong className="text-[#d4af37]">5000 years</strong>. From royal
              courts to cultural rituals, paan has always symbolized
              hospitality, indulgence, and refinement.
            </p>

            <p className="text-gray-700 leading-relaxed mb-6">
              At Paanshala, we honor this timeless tradition by bringing the
              authentic Banarasi craftsmanship into the modern era — combining
              heritage recipes with contemporary hygiene standards, elegant
              packaging, and premium quality.
            </p>

            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle className="w-5 h-5 text-[#d4af37]" />
                <span>100% Authentic</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle className="w-5 h-5 text-[#d4af37]" />
                <span>Premium Quality</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle className="w-5 h-5 text-[#d4af37]" />
                <span>Modern Standards</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="relative h-100 rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="/about-history.png"
                alt="Paan Heritage"
                fill
                className="object-cover"
              />
            </div>
            {/* Floating badge */}
            <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-2xl p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-linear-to-br from-[#d4af37] to-[#f4d03f] flex items-center justify-center">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">5000+</p>
                  <p className="text-sm text-gray-600">Years of Heritage</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* =========================
          STATS SECTION
      ========================== */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 ">
          <Image
            src="/footer-bg.png"
            alt="Stats Background"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-r from-[#0b1f11]/95 to-[#1a3d22]/95" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Our Journey in Numbers
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Growing stronger every day, powered by your love and trust
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <StatCard
              icon={TrendingUp}
              label="Years of Experience"
              color="from-blue-500 to-cyan-500"
            >
              <CountUp to={5} suffix="+" />
            </StatCard>
            <StatCard
              icon={Users}
              label="Happy Customers"
              color="from-green-500 to-emerald-500"
            >
              <CountUp to={250000} suffix="+" />
            </StatCard>
            <StatCard
              icon={Heart}
              label="Paans Delivered"
              color="from-rose-500 to-pink-500"
            >
              <CountUp to={450000} suffix="+" />
            </StatCard>
            <StatCard
              icon={Star}
              label="5-Star Reviews"
              color="from-amber-500 to-yellow-500"
            >
              <CountUp to={15000} suffix="+" />
            </StatCard>
          </div>
        </div>
      </section>

      {/* =========================
          OUR VALUES
      ========================== */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            What We Stand For
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our core values that guide everything we do at Paanshala
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <ValueCard
            icon={Crown}
            title="Authenticity"
            description="We stay true to traditional Banarasi recipes while embracing modern quality standards"
            color="from-purple-500 to-indigo-500"
          />
          <ValueCard
            icon={Shield}
            title="Quality First"
            description="Every paan is crafted with premium ingredients and undergoes strict quality checks"
            color="from-emerald-500 to-teal-500"
          />
          <ValueCard
            icon={Heart}
            title="Customer Love"
            description="Your satisfaction and happiness drive every decision we make at Paanshala"
            color="from-rose-500 to-pink-500"
          />
        </div>
      </section>

      {/* =========================
          TIMELINE SECTION
      ========================== */}
      <section className="bg-gray-100 py-20">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Journey
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              From a small venture to India's premium paan brand
            </p>
          </div>

          <div className="space-y-8">
            <TimelineItem
              year="2019"
              title="The Beginning"
              description="Paanshala was founded with a vision to revolutionize the traditional paan experience"
              side="left"
            />
            <TimelineItem
              year="2020"
              title="Going Digital"
              description="Launched our online platform, making authentic paan accessible across India"
              side="right"
            />
            <TimelineItem
              year="2021"
              title="Product Innovation"
              description="Introduced premium packaging and new exotic flavors while maintaining authenticity"
              side="left"
            />
            <TimelineItem
              year="2023"
              title="Event Services"
              description="Expanded to corporate and wedding catering, becoming the go-to for celebrations"
              side="right"
            />
            <TimelineItem
              year="2024"
              title="Pan-India Reach"
              description="Now serving customers in 100+ cities with same-day delivery in metros"
              side="left"
            />
          </div>
        </div>
      </section>

      {/* =========================
          CULTURAL HERITAGE
      ========================== */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative h-100 rounded-2xl overflow-hidden shadow-2xl order-2 md:order-1"
          >
            <Image
              src="/footer-bg.png"
              alt="Paan Cultural Heritage"
              fill
              className="object-cover"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="order-1 md:order-2"
          >
            <div className="inline-flex items-center gap-2 bg-purple-100 px-3 py-1 rounded-full mb-6">
              <Star className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-semibold text-purple-600">
                Cultural Icon
              </span>
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Paan in Indian Culture
            </h2>

            <p className="text-gray-700 leading-relaxed mb-4">
              Paan has been immortalized in Indian cinema, poetry, and art for
              decades. From legendary actors making it a symbol of style to its
              presence in countless celebrations, paan represents timeless cool
              and cultural pride.
            </p>

            <p className="text-gray-700 leading-relaxed mb-6">
              At Paanshala, we celebrate this rich heritage while making it
              accessible to modern India — preserving tradition while embracing
              innovation.
            </p>

            <div className="flex items-center gap-4">
              <div className="flex -space-x-2">
                <div className="w-10 h-10 rounded-full bg-[#d4af37] border-2 border-white flex items-center justify-center text-white text-xs font-bold">
                  5K
                </div>
                <div className="w-10 h-10 rounded-full bg-[#f4d03f] border-2 border-white flex items-center justify-center text-white text-xs font-bold">
                  YRS
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Celebrating 5000 years of paan culture
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* =========================
          PHILOSOPHY / WHY CHOOSE US
      ========================== */}
      <section className="relative py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              The Paanshala Promise
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              What makes us India's most trusted paan brand
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <FeatureCard
              icon={Leaf}
              title="Premium Ingredients"
              description="Hand-picked betel leaves from the finest farms, fresh areca nuts, and aromatic spices sourced directly from trusted suppliers"
            />
            <FeatureCard
              icon={Sparkles}
              title="Hygienic Preparation"
              description="Prepared in FSSAI-certified kitchens with strict hygiene protocols. Every paan is made fresh and packaged hygienically"
            />
            <FeatureCard
              icon={Crown}
              title="Authentic Recipes"
              description="Traditional Banarasi recipes passed down through generations, perfected over decades of craftsmanship"
            />
            <FeatureCard
              icon={Award}
              title="Quality Assurance"
              description="Each batch undergoes rigorous quality checks. We never compromise on freshness, taste, or presentation"
            />
          </div>

          <div className="relative h-100 rounded-2xl overflow-hidden shadow-2xl">
            <Image
              src="/footer-bg.png"
              alt="Premium Paan Quality"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent flex items-end">
              <div className="p-8">
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  Experience Luxury in Every Bite
                </h3>
                <p className="text-gray-200">
                  From selection to serving, excellence at every step
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================
          TESTIMONIALS
      ========================== */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Loved by Thousands
            </h2>
            <p className="text-gray-600">
              Here's what our customers say about us
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <TestimonialCard
              name="Rajesh Kumar"
              location="Delhi"
              text="The most authentic Banarasi paan I've had outside Varanasi. The quality is unmatched!"
              rating={5}
            />
            <TestimonialCard
              name="Priya Sharma"
              location="Mumbai"
              text="Used Paanshala for my wedding. Guests are still talking about how amazing the paan counter was!"
              rating={5}
            />
            <TestimonialCard
              name="Amit Patel"
              location="Bangalore"
              text="Love the packaging and freshness. Finally, a premium paan brand that delivers pan-India!"
              rating={5}
            />
          </div>
        </div>
      </section>

      {/* =========================
          CTA SECTION
      ========================== */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/footer-bg.png"
            alt="Join Us"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-r from-[#0b1f11]/95 to-[#0b1f11]/90" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 md:px-6 text-center">
          <Sparkles className="w-12 h-12 text-[#d4af37] mx-auto mb-6" />

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Experience the Royal Taste?
          </h2>

          <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            From intimate gatherings to grand celebrations, Paanshala brings the
            finest paan experience to your doorstep
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/collections"
              className="inline-flex items-center gap-3 bg-linear-to-r from-[#d4af37] to-[#f4d03f] text-[#0b1f11] px-8 py-4 rounded-xl font-semibold hover:scale-105 transition-all duration-300 shadow-2xl"
            >
              Shop Now
              <ChevronRight className="w-5 h-5" />
            </Link>
            <Link
              href="/experiences"
              className="inline-flex items-center gap-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 border border-white/30"
            >
              Book an Event
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

/* =========================
   STAT CARD COMPONENT
========================= */
function StatCard({ icon: Icon, label, children, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center hover:bg-white/20 transition-all duration-300 border border-white/20"
    >
      <div
        className={cn(
          "w-14 h-14 rounded-full bg-linear-to-br flex items-center justify-center mx-auto mb-4",
          color,
        )}
      >
        <Icon className="w-7 h-7 text-white" />
      </div>
      <div className="text-4xl md:text-5xl font-bold text-white mb-2">
        {children}
      </div>
      <p className="text-sm font-medium text-gray-300">{label}</p>
    </motion.div>
  );
}

/* =========================
   VALUE CARD COMPONENT
========================= */
function ValueCard({ icon: Icon, title, description, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 group"
    >
      <div
        className={cn(
          "w-16 h-16 rounded-2xl bg-linear-to-br flex items-center justify-center mb-6 group-hover:scale-110 transition-transform",
          color,
        )}
      >
        <Icon className="w-8 h-8 text-white" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </motion.div>
  );
}

/* =========================
   TIMELINE ITEM COMPONENT
========================= */
function TimelineItem({ year, title, description, side }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: side === "left" ? -30 : 30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className="flex items-center gap-4 md:gap-8"
    >
      {/* Left Side Content (Desktop Only) */}
      <div className="flex-1 hidden md:flex justify-end">
        {side === "left" && (
          <div className="bg-white rounded-xl p-6 shadow-lg max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-2 text-right">
              {title}
            </h3>
            <p className="text-gray-600 text-right">{description}</p>
          </div>
        )}
      </div>

      {/* Year Badge */}
      <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-linear-to-br from-[#d4af37] to-[#f4d03f] flex items-center justify-center shadow-xl shrink-0">
        <span className="text-white font-bold text-base md:text-lg">
          {year}
        </span>
      </div>

      {/* Right Side Content */}
      <div className="flex-1">
        {side === "right" ? (
          <div className="bg-white rounded-xl p-6 shadow-lg max-w-md">
            <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600">{description}</p>
          </div>
        ) : (
          /* Mobile view for left items */
          <div className="md:hidden bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600">{description}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* =========================
   FEATURE CARD COMPONENT
========================= */
function FeatureCard({ icon: Icon, title, description }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="flex items-start gap-4 bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
    >
      <div className="w-12 h-12 rounded-xl bg-linear-to-br from-[#d4af37] to-[#f4d03f] flex items-center justify-center shrink-0">
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}

/* =========================
   TESTIMONIAL CARD COMPONENT
========================= */
function TestimonialCard({ name, location, text, rating }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
    >
      <div className="flex items-center gap-1 mb-4">
        {[...Array(rating)].map((_, i) => (
          <Star key={i} className="w-5 h-5 text-[#d4af37] fill-[#d4af37]" />
        ))}
      </div>
      <p className="text-gray-700 italic mb-6 leading-relaxed">"{text}"</p>
      <div className="border-t border-gray-100 pt-4">
        <p className="font-semibold text-gray-900">{name}</p>
        <p className="text-sm text-gray-500">{location}</p>
      </div>
    </motion.div>
  );
}
