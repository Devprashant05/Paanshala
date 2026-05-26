"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import {
  ChevronRight,
  Star,
  Sparkles,
  Award,
  Users,
  TrendingUp,
  Heart,
  Target,
  CheckCircle2,
  Leaf,
  Shield,
  Zap,
  ArrowRight,
  Globe,
  Package,
} from "lucide-react";
import TestimonialsSection from "@/components/home/TestimonialsSection";

/* =========================
   COUNT UP COMPONENT
========================= */
function CountUp({ to, suffix = "", duration = 2 }) {
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
    <div className="min-h-screen bg-cream-light">
      {/* =========================
          HERO SECTION - Bold & Impactful
      ========================== */}
      <section className="relative overflow-hidden w-full">
        <Image
          src="/promo-banner.webp"
          alt="About Paanshala"
          width={1920}
          height={600}
          priority
          className="w-full h-auto"
        />
      </section>

      {/* Text content */}
      <section className="bg-[#FAF8F5] py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Left Content */}
            <div>
              <h2
                className="text-[#1a1a1a] text-5xl md:text-6xl leading-[0.95] tracking-tight"
                style={{
                  fontWeight: 700,
                }}
              >
                Flavours of Paanshala’s luxurious past to the 21st century
              </h2>
            </div>

            {/* Right Content */}
            <div className="">
              <p className="text-[#6d685f] text-lg md:text-2xl font-regular leading-relaxed">
                Explore Paanshala’s online paan store and indulge in the rich
                flavors and aromatic blends of traditional and innovative paan
                varieties. Order now and experience the perfect blend of
                sweetness, spices, and freshness delivered to your doorstep.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================
          ORIGIN STORY - Split Layout
      ========================== */}
      <section className="relative overflow-hidden">
        <div className="grid lg:grid-cols-2 min-h-screen border-2 border-brand-green">
          {/* Left - Image */}
          <div className="relative h-125 lg:h-auto">
            <Image
              src="/Funky-Paan-1.webp"
              alt="Fresh Betel Leaves"
              fill
              className="object-cover"
            />
          </div>

          {/* Right - Content on Yellow/Gold */}
          <div className="bg-linear-to-r from-[#264B0E] via-brand-green-dark to-[#264B0E] p-8 md:p-16 flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <h2
                className=" text-5xl text-white md:text-6xl mb-8 leading-tight"
                style={{
                  fontFamily: "var(--font-special-gothic-condensed-one)",
                }}
              >
                Experience The Luxury of Paan
              </h2>

              <div className="space-y-6 text-white text-lg text-justify leading-relaxed max-w-2xl">
                <p>
                  Experience The Luxury of Paan Paanshala is deeply connected
                  with traditions, culture, and delectable foods and flavors.
                  The recipes are passed down through the generations. We proud
                  to bringing this Indian tradition past to 21 century.
                </p>
                <p>
                  Paan is one such thing that has ruled the world’s food culture
                  for a long time. It is a delightful treat and a very effective
                  mouth freshener loved by all. From the medical science
                  perspective, this act is considered good for the digestive
                  system, It is very effective for the digestive system, it help
                  digest food easily.
                </p>
                <p>
                  Paan is an art of delivering freshness, Paan holds a very
                  important role in the Indian lifestyle, Paan is loved by every
                  Indians after a meal digestive and mouth freshener is
                  tradition of our country.
                </p>
                <p>
                  At Paanshala all products made traditionally and authentic way
                  from homemade recipes, we use the best ingredients to make it
                  mouthwatering. A perfect delicious gift for all occasions and
                  sharing with your loved ones is a divine experience. Paanshala
                  is a part of Natural Food And Beverages.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* =========================
          TIMELINE SECTION - Enhanced Design
      ========================== */}
      <section className="bg-cream-light py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Left Column - Timeline Header & Image */}
            <div className="lg:sticky lg:top-30">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
              >
                {/* Section Header */}
                <div className="mb-8">
                  <h2
                    className="text-[#1a1a1a] text-5xl md:text-6xl lg:text-7xl mb-4"
                    style={{
                      fontFamily: "var(--font-special-gothic-condensed-one)",
                    }}
                  >
                    LOOKING BACK TO
                  </h2>
                  <div
                    className="text-[#1a1a1a] text-5xl lg:text-[10rem] opacity-10 leading-none"
                    style={{
                      fontFamily: "var(--font-special-gothic-condensed-one)",
                      WebkitTextStroke: "3px #1a1a1a",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    2019
                  </div>
                </div>

                {/* Timeline Image */}
                <div className="relative h-100 rounded-3xl overflow-hidden shadow-2xl mb-4">
                  <Image
                    src="/about-2.png"
                    alt="Paanshala Journey"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-[#264B0E]/60 to-transparent" />

                  {/* Floating Badge on Image */}
                  <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-linear-to-br from-gold-bright to-[#d4a574] flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p
                          className="text-2xl font-bold text-[#264B0E]"
                          style={{
                            fontFamily:
                              "var(--font-special-gothic-condensed-one)",
                          }}
                        >
                          5+ YEARS
                        </p>
                        <p className="text-sm text-[#6b6b6b] font-medium">
                          Of Excellence
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Image or Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-[#f5e6d3]">
                    <div className="w-10 h-10 rounded-xl bg-linear-to-br from-[#264B0E] to-brand-green-light flex items-center justify-center mb-3">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <p
                      className="text-3xl font-bold text-[#264B0E] mb-1"
                      style={{
                        fontFamily: "var(--font-special-gothic-condensed-one)",
                      }}
                    >
                      100K+
                    </p>
                    <p className="text-xs text-[#6b6b6b] uppercase tracking-wide">
                      Happy Customers
                    </p>
                  </div>
                  <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-[#f5e6d3]">
                    <div className="w-10 h-10 rounded-xl bg-linear-to-br from-gold-bright to-[#d4a574] flex items-center justify-center mb-3">
                      <Package className="w-5 h-5 text-white" />
                    </div>
                    <p
                      className="text-3xl font-bold text-[#264B0E] mb-1"
                      style={{
                        fontFamily: "var(--font-special-gothic-condensed-one)",
                      }}
                    >
                      450K+
                    </p>
                    <p className="text-xs text-[#6b6b6b] uppercase tracking-wide">
                      Paans Crafted
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Column - Timeline Items */}
            <div className="space-y-12">
              <EnhancedTimelineItem
                year="2019"
                title="THE FOUNDATION"
                description="Paanshala was born from a simple vision: to revolutionize India's paan experience. We started with authentic Banarasi recipes, premium ingredients, and a commitment to hygiene that was unheard of in the industry."
                icon={Target}
                color="from-[#f4c430] to-[#d4a574]"
              />

              <EnhancedTimelineItem
                year="2020"
                title="DIGITAL TRANSFORMATION"
                description="Launched our online platform during challenging times, making authentic premium paan accessible across India. We pioneered hygienically packaged paan delivery, setting new industry standards."
                icon={Globe}
                color="from-[#264B0E] to-[#4a7c2c]"
              />

              <EnhancedTimelineItem
                year="2021"
                title="PREMIUM INNOVATION"
                description="Introduced luxury packaging and exotic flavor combinations while staying true to our roots. Our signature blends became the talk of the town, attracting paan connoisseurs nationwide."
                icon={Sparkles}
                color="from-[#f4c430] to-[#d4a574]"
              />

              <EnhancedTimelineItem
                year="2023"
                title="EVENT EXCELLENCE"
                description="Expanded into premium event catering - weddings, corporate gatherings, and celebrations. Our live paan counters became the centerpiece of India's most prestigious events."
                icon={Award}
                color="from-[#264B0E] to-[#4a7c2c]"
              />

              <EnhancedTimelineItem
                year="2024"
                title="PAN-INDIA PRESENCE"
                description="Now serving 15+ stores across Delhi-NCR with same-day delivery in metros. With 6+ variants, 50+ mouth refreshing products and 100,000+ satisfied customers, we're India's fastest-growing premium paan brand."
                icon={TrendingUp}
                color="from-[#f4c430] to-[#d4a574]"
                isLast={true}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden w-full">
        <Image
          src="/paan-Actor-banner.webp"
          alt="About Paanshala"
          width={1920}
          height={1080}
          priority
          className="w-full h-auto"
        />
      </section>

      {/* =========================
          VALUES SECTION - Bold Cards
      ========================== */}
      {/* <section className="bg-white py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-20">
            <h2
              className="text-[#1a1a1a] text-5xl md:text-6xl lg:text-7xl mb-6"
              style={{ fontFamily: "var(--font-special-gothic-condensed-one)" }}
            >
              WHAT WE STAND FOR
            </h2>
            <p className="text-xl text-[#6b6b6b] max-w-3xl mx-auto">
              The core principles that drive every paan we create at Paanshala
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <BoldValueCard
              icon={Target}
              title="AUTHENTICITY"
              description="Traditional Banarasi recipes perfected over generations, served with modern premium standards"
              color="from-[#264B0E] to-[#1a3509]"
            />
            <BoldValueCard
              icon={Shield}
              title="QUALITY FIRST"
              description="Every ingredient hand-picked, every paan hygienically prepared in FSSAI-certified facilities"
              color="from-[#f4c430] to-[#d4a574]"
            />
            <BoldValueCard
              icon={Heart}
              title="CUSTOMER DELIGHT"
              description="Your satisfaction drives us. We're not happy until you're amazed by every bite"
              color="from-[#264B0E] to-[#1a3509]"
            />
          </div>
        </div>
      </section> */}

      {/* =========================
          WHY CHOOSE US - Feature Grid
      ========================== */}
      {/* <section className="bg-[#f5e6d3] py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-20">
            <h2
              className="text-[#1a1a1a] text-5xl md:text-6xl lg:text-7xl mb-6"
              style={{ fontFamily: "var(--font-special-gothic-condensed-one)" }}
            >
              THE PAANSHALA PROMISE
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <FeatureBox
              icon={Leaf}
              title="PREMIUM INGREDIENTS"
              description="Hand-picked betel leaves from finest farms, fresh areca nuts, and aromatic spices sourced directly from trusted suppliers"
            />
            <FeatureBox
              icon={Sparkles}
              title="HYGIENIC PREPARATION"
              description="FSSAI-certified kitchens with strict protocols. Every paan made fresh, packaged with care"
            />
            <FeatureBox
              icon={Award}
              title="AUTHENTIC RECIPES"
              description="Traditional Banarasi recipes passed through generations, perfected by master craftsmen"
            />
            <FeatureBox
              icon={Zap}
              title="QUALITY ASSURANCE"
              description="Rigorous quality checks on every batch. Zero compromise on freshness or taste"
            />
          </div>
        </div>
      </section> */}

      {/* =========================
          TESTIMONIALS - Clean & Bold
      ========================== */}
      <TestimonialsSection />
      {/* <section className="bg-white py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-20">
            <h2
              className="text-[#1a1a1a] text-5xl md:text-6xl lg:text-7xl mb-6"
              style={{ fontFamily: "var(--font-special-gothic-condensed-one)" }}
            >
              LOVED BY THOUSANDS
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <TestimonialBox
              name="Rajesh Kumar"
              location="New Delhi"
              text="The most authentic Banarasi paan outside Varanasi. Quality is exceptional!"
            />
            <TestimonialBox
              name="Priya Sharma"
              location="Mumbai"
              text="Used for my wedding. Guests still talk about the premium paan counter!"
            />
            <TestimonialBox
              name="Amit Patel"
              location="Bangalore"
              text="Love the packaging and freshness. Finally, premium paan delivered nationwide!"
            />
          </div>
        </div>
      </section> */}

      {/* =========================
          FINAL CTA - Bold & Dark
      ========================== */}
      {/* <section className="relative bg-[#1a1a1a] py-32 md:py-40 overflow-hidden">
        <div className="absolute top-20 right-20 w-96 h-96 bg-gold-bright/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-[#264B0E]/20 rounded-full blur-3xl" />

        <div className="relative max-w-5xl mx-auto px-4 md:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <Sparkles className="w-20 h-20 text-gold-bright mx-auto mb-12" />

            <h2
              className="text-white text-5xl md:text-6xl lg:text-7xl mb-8 leading-tight"
              style={{ fontFamily: "var(--font-special-gothic-condensed-one)" }}
            >
              READY TO EXPERIENCE
              <br />
              THE ROYAL TASTE?
            </h2>

            <p className="text-sage-light text-xl md:text-2xl mb-16 max-w-3xl mx-auto leading-relaxed">
              From intimate gatherings to grand celebrations, Paanshala brings
              the finest paan experience to your doorstep
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link
                href="/shop"
                className="inline-flex items-center gap-3 bg-linear-to-r from-gold-bright to-[#d4a574] text-[#1a1a1a] px-10 py-5 rounded-2xl text-xl font-bold hover:scale-105 transition-all duration-300 shadow-2xl"
                style={{
                  fontFamily: "var(--font-special-gothic-condensed-one)",
                }}
              >
                SHOP PREMIUM PAAN
                <ArrowRight className="w-6 h-6" />
              </Link>
              <Link
                href="/experiences"
                className="inline-flex items-center gap-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-10 py-5 rounded-2xl text-xl font-bold transition-all duration-300 border-2 border-white/30"
                style={{
                  fontFamily: "var(--font-special-gothic-condensed-one)",
                }}
              >
                BOOK AN EVENT
              </Link>
            </div>
          </motion.div>
        </div>
      </section> */}
    </div>
  );
}

/* =========================
   STAT ITEM
========================= */
function StatItem({ number, label }) {
  return (
    <div className="p-6 md:p-8 text-center">
      <div
        className="text-[#1a1a1a] text-4xl md:text-5xl lg:text-6xl mb-3 font-bold"
        style={{ fontFamily: "var(--font-special-gothic-condensed-one)" }}
      >
        {number}
      </div>
      <div className="text-[#1a1a1a] text-sm md:text-base font-medium">
        {label}
      </div>
    </div>
  );
}

/* =========================
   TIMELINE SECTION
========================= */
function TimelineSection({ title, year }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="border-l-4 border-gold-bright pl-8 py-4"
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-full bg-linear-to-br from-gold-bright to-[#d4a574] flex items-center justify-center text-[#1a1a1a] font-bold">
          {year}
        </div>
      </div>
      <h3
        className="text-[#1a1a1a] text-3xl md:text-4xl"
        style={{ fontFamily: "var(--font-special-gothic-condensed-one)" }}
      >
        {title}
      </h3>
    </motion.div>
  );
}

/* =========================
   ENHANCED TIMELINE ITEM
========================= */
function EnhancedTimelineItem({
  year,
  title,
  description,
  icon: Icon,
  color,
  isLast,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="relative"
    >
      {/* Connecting Line */}
      {!isLast && (
        <div className="absolute left-6 top-20 bottom-0 w-0.5 bg-linear-to-b from-gold-bright to-transparent -translate-x-1/2" />
      )}

      {/* Main Card */}
      <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-[#f5e6d3] hover:border-gold-bright relative">
        {/* Year Badge */}
        <div className="absolute -left-6 top-8 w-12 h-12 rounded-full bg-linear-to-br from-gold-bright to-[#d4a574] flex items-center justify-center text-[#1a1a1a] font-bold text-sm shadow-xl border-4 border-cream-light">
          {year}
        </div>

        {/* Icon */}
        <div
          className={`w-16 h-16 rounded-2xl bg-linear-to-br ${color} flex items-center justify-center mb-6 ml-8`}
        >
          <Icon className="w-8 h-8 text-white" />
        </div>

        {/* Content */}
        <div className="ml-8">
          <h3
            className="text-2xl md:text-3xl text-[#1a1a1a] mb-4"
            style={{ fontFamily: "var(--font-special-gothic-condensed-one)" }}
          >
            {title}
          </h3>
          <p className="text-[#6b6b6b] text-lg leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

/* =========================
   BOLD VALUE CARD
========================= */
function BoldValueCard({ icon: Icon, title, description, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="group"
    >
      <div
        className={`bg-linear-to-br ${color} rounded-3xl p-10 h-full text-white hover:scale-105 transition-all duration-300 shadow-2xl`}
      >
        <Icon className="w-16 h-16 mb-6" />
        <h3
          className="text-3xl md:text-4xl mb-4"
          style={{ fontFamily: "var(--font-special-gothic-condensed-one)" }}
        >
          {title}
        </h3>
        <p className="text-lg leading-relaxed opacity-90">{description}</p>
      </div>
    </motion.div>
  );
}

/* =========================
   FEATURE BOX
========================= */
function FeatureBox({ icon: Icon, title, description }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-3xl p-10 shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-gold-bright"
    >
      <Icon className="w-12 h-12 text-[#264B0E] mb-6" />
      <h3
        className="text-2xl md:text-3xl text-[#1a1a1a] mb-4"
        style={{ fontFamily: "var(--font-special-gothic-condensed-one)" }}
      >
        {title}
      </h3>
      <p className="text-[#6b6b6b] text-lg leading-relaxed">{description}</p>
    </motion.div>
  );
}

/* =========================
   TESTIMONIAL BOX
========================= */
function TestimonialBox({ name, location, text }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="bg-cream-light rounded-3xl p-10 shadow-lg hover:shadow-2xl transition-all duration-300"
    >
      <div className="flex items-center gap-1 mb-6">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="w-5 h-5 text-gold-bright fill-gold-bright" />
        ))}
      </div>
      <p className="text-gray-dark text-lg leading-relaxed mb-8 italic">
        "{text}"
      </p>
      <div className="pt-6 border-t-2 border-[#f5e6d3]">
        <p className="text-[#1a1a1a] font-bold text-lg">{name}</p>
        <p className="text-[#6b6b6b]">{location}</p>
      </div>
    </motion.div>
  );
}