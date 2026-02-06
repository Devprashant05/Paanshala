"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  Calendar,
  Sparkles,
  Users,
  Heart,
  PartyPopper,
  Cake,
  Wine,
  Utensils,
  ArrowRight,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

const EXPERIENCES = [
  {
    title: "Wedding",
    icon: Heart,
    image: "/experiences/wedding.jpg",
    color: "from-rose-500 to-pink-500",
    description:
      "Make your special day unforgettable with our curated wedding paan counters. We offer customized paan varieties, elegant presentation, and dedicated service staff to create a royal experience for your guests.",
    features: [
      "Custom paan varieties",
      "Elegant setup",
      "Dedicated staff",
      "Traditional & modern options",
    ],
  },
  {
    title: "Theme Party",
    icon: PartyPopper,
    image: "/experiences/theme-party.jpg",
    color: "from-purple-500 to-indigo-500",
    description:
      "Transform your themed event with our creative paan presentations. From Bollywood nights to retro parties, we customize our offerings to match your theme perfectly with unique flavors and presentations.",
    features: [
      "Theme-matched flavors",
      "Creative presentations",
      "Custom decorations",
      "Interactive counters",
    ],
  },
  {
    title: "Cocktail Party",
    icon: Wine,
    image: "/experiences/cocktail.jpg",
    color: "from-amber-500 to-orange-500",
    description:
      "Add sophistication to your cocktail events with our premium paan selection. Perfect pairings with your beverages, modern presentation, and a unique conversation starter for your guests.",
    features: [
      "Premium varieties",
      "Modern presentations",
      "Cocktail pairings",
      "Elegant service",
    ],
  },
  {
    title: "Private Party",
    icon: Users,
    image: "/experiences/private.jpg",
    color: "from-teal-500 to-cyan-500",
    description:
      "Intimate gatherings deserve special attention. Our private party services offer personalized paan menus, flexible timing, and customized setups to match your home's ambiance perfectly.",
    features: [
      "Personalized menus",
      "Flexible timing",
      "Home service",
      "Small batch preparation",
    ],
  },
  {
    title: "Catering",
    icon: Utensils,
    image: "/experiences/catering.png",
    color: "from-emerald-500 to-green-500",
    description:
      "Impress your clients and colleagues with our corporate catering services. Professional setup, hygiene-first approach, and a memorable culinary experience that elevates your business events.",
    features: [
      "Professional setup",
      "Hygiene certified",
      "Bulk orders",
      "Timely service",
    ],
  },
  {
    title: "Birthday Party",
    icon: Cake,
    image: "/experiences/birthday.jpg",
    color: "from-pink-500 to-rose-500",
    description:
      "Make birthdays extra special with our fun and colorful paan selections. From kids-friendly options to adult favorites, we create a delightful experience for guests of all ages.",
    features: [
      "Age-appropriate options",
      "Colorful presentations",
      "Fun flavors",
      "Party favors available",
    ],
  },
];

export default function ExperiencesPage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-white to-gray-50">
      {/* HERO SECTION */}
      <section className="relative h-100 md:h-125 flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/footer-bg.png"
            alt="Paanshala Experiences"
            fill
            priority
            className="object-cover"
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-linear-to-b from-[#0b1f11]/95 via-[#0b1f11]/85 to-[#0b1f11]/95" />
        </div>

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 md:px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-[#d4af37]/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-[#d4af37]" />
            <span className="text-sm font-medium text-[#d4af37]">
              Premium Event Services
            </span>
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6"
          >
            Events & Experiences
          </motion.h1>

          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Celebrate life's finest moments with Paanshala's bespoke paan
            experiences tailored for every occasion.
          </p>

          {/* Breadcrumb */}
          <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
            <Link href="/" className="hover:text-[#d4af37] transition-colors">
              Home
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white">Experiences</span>
          </div>
        </div>

        {/* Decorative gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-linear-to-t from-white to-transparent" />
      </section>

      {/* INTRO SECTION */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Creating Memorable Moments
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Whether it's an intimate celebration or a grand event, Paanshala
            brings the authentic taste of traditional paan with a modern twist.
            Our expert team ensures every detail is perfect, making your event
            truly unforgettable.
          </p>
        </div>
      </section>

      {/* EXPERIENCE GRID */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 pb-16 md:pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {EXPERIENCES.map((item, i) => (
            <ExperienceCard key={item.title} experience={item} index={i} />
          ))}
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="bg-gray-100 py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Paanshala for Events?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We go beyond serving paan – we create experiences
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={Heart}
              title="Authentic Recipes"
              description="Traditional preparations passed down through generations"
            />
            <FeatureCard
              icon={Sparkles}
              title="Premium Ingredients"
              description="Only the finest quality ingredients in every paan"
            />
            <FeatureCard
              icon={Users}
              title="Expert Staff"
              description="Professional and courteous service team"
            />
            <FeatureCard
              icon={Calendar}
              title="Flexible Booking"
              description="Customizable packages for any event size"
            />
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="relative py-20 md:py-24 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <Image
            src="/footer-bg.png"
            alt="Book Event"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-r from-[#0b1f11]/98 to-[#1a3d22]/98" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-[#d4af37]/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-[#d4af37]" />
              <span className="text-sm font-medium text-[#d4af37]">
                Book Your Event
              </span>
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to Make Your Event Special?
            </h2>
            <p className="text-white/90 text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
              Let's create an unforgettable paan experience for your special
              occasion. Our team is ready to customize everything to your needs.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link
                href="/contact"
                className="inline-flex items-center gap-3 bg-linear-to-r from-[#d4af37] to-[#f4d03f] text-[#0b1f11] px-8 py-4 rounded-xl font-semibold hover:scale-105 transition-all duration-300 shadow-2xl"
              >
                <Calendar className="w-5 h-5" />
                Book Your Event Now
              </Link>
              <a
                href="tel:+918510851039"
                className="inline-flex items-center gap-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 border border-white/30"
              >
                Call Us: +91 8510851039
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 md:gap-8 pt-12 border-t border-white/20">
              <div>
                <div className="text-3xl md:text-4xl font-bold text-[#d4af37] mb-2">
                  100+
                </div>
                <div className="text-xs md:text-sm text-white/80">
                  Events Hosted
                </div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-[#d4af37] mb-2">
                  10K+
                </div>
                <div className="text-xs md:text-sm text-white/80">
                  Happy Guests
                </div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-[#d4af37] mb-2">
                  100%
                </div>
                <div className="text-xs md:text-sm text-white/80">
                  Satisfaction Rate
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIAL SECTION */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-16 md:py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            What Our Clients Say
          </h2>
          <p className="text-gray-600">Real experiences from real events</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <TestimonialCard
            name="Priya & Rahul"
            event="Wedding Reception"
            quote="Paanshala made our wedding reception truly special. The paan counter was a huge hit with all our guests!"
          />
          <TestimonialCard
            name="Amit Sharma"
            event="Corporate Event"
            quote="Professional service and amazing variety. Our clients were impressed with the unique addition to our event."
          />
          <TestimonialCard
            name="Neha Kapoor"
            event="Birthday Party"
            quote="The team was fantastic! They customized flavors for kids and adults. Everyone loved it!"
          />
        </div>
      </section>
    </div>
  );
}

/* ===============================
   EXPERIENCE CARD
=============================== */

function ExperienceCard({ experience, index }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group h-full"
    >
      {/* Premium Card Design */}
      <div className="relative h-full rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 bg-white flex flex-col">
        {/* Image Section */}
        <div className="relative h-70 md:h-80 overflow-hidden">
          <Image
            src={experience.image}
            alt={experience.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700"
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent" />

          {/* Icon Badge */}
          <div
            className={cn(
              "absolute top-4 right-4 w-14 h-14 rounded-full bg-linear-to-br flex items-center justify-center shadow-xl",
              experience.color,
            )}
          >
            <experience.icon className="w-7 h-7 text-white" />
          </div>

          {/* Title - Always Visible */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h3 className="text-2xl md:text-3xl font-bold text-white">
              {experience.title}
            </h3>
          </div>
        </div>

        {/* Content Section - Mobile Always Visible, Desktop on Hover */}
        <div className="md:hidden p-6 flex-1 flex flex-col">
          <p className="text-gray-600 text-sm leading-relaxed mb-4 flex-1">
            {experience.description}
          </p>
          <div className="space-y-2 mb-4">
            {experience.features.map((feature, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-sm text-gray-700"
              >
                <Check className="w-4 h-4 text-[#d4af37] shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
          <Link
            href="/get-in-touch"
            className="w-full inline-flex items-center justify-center gap-2 bg-linear-to-r from-[#d4af37] to-[#f4d03f] text-[#0b1f11] px-6 py-3 rounded-xl font-semibold text-sm hover:scale-105 transition-transform shadow-lg"
          >
            <Calendar className="w-4 h-4" />
            Book This Experience
          </Link>
        </div>

        {/* Desktop Hover Overlay - Fixed Height Issue */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="hidden md:flex absolute inset-0 bg-linear-to-t from-[#0b1f11] via-[#0b1f11]/98 to-[#0b1f11]/95 p-6 flex-col justify-between"
            >
              {/* Header with badge */}
              <div>
                <div
                  className={cn(
                    "inline-flex items-center gap-2 px-4 py-2 rounded-full bg-linear-to-r text-white text-sm font-semibold shadow-lg",
                    experience.color,
                  )}
                >
                  <experience.icon className="w-5 h-5" />
                  {experience.title}
                </div>
              </div>

              {/* Scrollable Content Area */}
              <div className="flex-1 overflow-y-auto my-4 pr-2 scrollbar-thin scrollbar-thumb-[#d4af37] scrollbar-track-white/10">
                <p className="text-white/95 text-sm leading-relaxed mb-4">
                  {experience.description}
                </p>

                <div className="space-y-2.5">
                  {experience.features.map((feature, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2.5 text-sm text-white/90"
                    >
                      <Check className="w-4 h-4 text-[#d4af37] shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA Button */}
              <Link
                href="/get-in-touch"
                className="inline-flex items-center justify-center gap-2 bg-linear-to-r from-[#d4af37] to-[#f4d03f] text-[#0b1f11] px-6 py-3 rounded-xl font-semibold text-sm hover:scale-105 transition-all duration-300 shadow-xl group/link w-full"
              >
                Book This Experience
                <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/* ===============================
   FEATURE CARD
=============================== */

function FeatureCard({ icon: Icon, title, description }) {
  return (
    <div className="bg-white rounded-xl p-6 text-center hover:shadow-xl transition-all duration-300 group border border-gray-100">
      <div className="w-16 h-16 rounded-full bg-linear-to-br from-[#d4af37] to-[#f4d03f] flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg">
        <Icon className="w-8 h-8 text-white" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}

/* ===============================
   TESTIMONIAL CARD
=============================== */

function TestimonialCard({ name, event, quote }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
      <div className="flex items-center gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <Sparkles key={i} className="w-4 h-4 text-[#d4af37] fill-[#d4af37]" />
        ))}
      </div>
      <p className="text-gray-700 italic mb-4 leading-relaxed">"{quote}"</p>
      <div className="border-t border-gray-100 pt-4">
        <p className="font-semibold text-gray-900">{name}</p>
        <p className="text-sm text-gray-500">{event}</p>
      </div>
    </div>
  );
}
