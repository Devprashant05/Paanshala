"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Quote, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const testimonials = [
  {
    name: "Priya Gupta",
    role: "NRI Customer",
    location: "New York, USA",
    image: "/testimonials/priya.webp",
    review:
      "As an Indian living abroad, finding authentic paan was a challenge until I discovered Paanshala. Every bite takes me back to my childhood. The quality and authenticity are simply unmatched!",
    rating: 5,
    date: "2 weeks ago",
  },
  {
    name: "Anil Mishra",
    role: "Food Blogger",
    location: "Mumbai, India",
    image: "/testimonials/anil.webp",
    review:
      "I've tried paan across India, but Paanshala stands apart. The balance of flavors and presentation is nothing short of a masterpiece. A must-try for every paan enthusiast!",
    rating: 5,
    date: "1 month ago",
  },
  {
    name: "Vishal Kushwaha",
    role: "Regular Customer",
    location: "Delhi, India",
    image: "/testimonials/vishal.jpg",
    review:
      "The team patiently helped me choose the perfect paan. The flavors were incredible and truly unique. I'm now a regular customer and can't recommend them enough!",
    rating: 5,
    date: "3 weeks ago",
  },
  {
    name: "Sneha Patel",
    role: "Corporate Client",
    location: "Bangalore, India",
    image: "/testimonials/sneha.webp",
    review:
      "Ordered Paanshala for our office celebration. Everyone loved it! The presentation was elegant and the taste was exceptional. Will definitely order again!",
    rating: 5,
    date: "1 week ago",
  },
];

export default function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const goToNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const goToPrevious = () => {
    setDirection(-1);
    setCurrentIndex(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length,
    );
  };

  const goToSlide = (index) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  return (
    <section className="relative py-20 overflow-hidden">
      {/* BACKGROUND */}
      <div className="absolute inset-0">
        {/* Base Image */}
        <div className="absolute inset-0 bg-linear-to-br from-[#f6c83f] via-[#f4d03f] to-[#d4af37]" />

        {/* Decorative Elements */}
        <div className="absolute inset-0">
          <motion.div
            animate={{
              rotate: 360,
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute -top-20 -right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              rotate: -360,
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute -bottom-20 -left-20 w-96 h-96 bg-[#2d5016]/10 rounded-full blur-3xl"
          />
        </div>

        {/* Pattern Overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(0,0,0,0.3) 1px, transparent 1px)`,
            backgroundSize: "30px 30px",
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
            <Sparkles className="w-4 h-4 text-[#2d5016]" />
            <span className="text-sm font-semibold text-[#2d5016] tracking-wide">
              WHAT PEOPLE SAY
            </span>
          </div>

          {/* Title */}
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#2b1605] mb-4">
            Customer{" "}
            <span className="bg-linear-to-r from-[#2d5016] via-[#3d6820] to-[#2d5016] bg-clip-text text-transparent">
              Testimonials
            </span>
          </h2>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-[#5c2c06] max-w-2xl mx-auto">
            Hear what our delighted customers have to say about their Paanshala
            experience
          </p>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 mt-8">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-[#2b1605]">
                1000+
              </div>
              <div className="text-sm text-[#5c2c06]">Happy Customers</div>
            </div>
            <div className="w-px h-12 bg-[#5c2c06]/20" />
            <div className="text-center">
              <div className="flex items-center gap-1 justify-center mb-1">
                <Star className="w-6 h-6 fill-[#2b1605] text-[#2b1605]" />
                <span className="text-3xl md:text-4xl font-bold text-[#2b1605]">
                  4.9
                </span>
              </div>
              <div className="text-sm text-[#5c2c06]">Average Rating</div>
            </div>
            <div className="w-px h-12 bg-[#5c2c06]/20" />
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-[#2b1605]">
                500+
              </div>
              <div className="text-sm text-[#5c2c06]">5-Star Reviews</div>
            </div>
          </div>
        </motion.div>

        {/* DESKTOP: Grid Layout */}
        <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.slice(0, 3).map((testimonial, index) => (
            <TestimonialCard
              key={testimonial.name}
              data={testimonial}
              index={index}
            />
          ))}
        </div>

        {/* MOBILE: Carousel */}
        <div className="md:hidden">
          <div className="relative">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentIndex}
                custom={direction}
                initial={{ opacity: 0, x: direction > 0 ? 100 : -100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction > 0 ? -100 : 100 }}
                transition={{ duration: 0.3 }}
              >
                <TestimonialCard data={testimonials[currentIndex]} index={0} />
              </motion.div>
            </AnimatePresence>

            {/* Navigation Arrows */}
            <button
              onClick={goToPrevious}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center hover:bg-white transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-[#2b1605]" />
            </button>

            <button
              onClick={goToNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center hover:bg-white transition-colors"
            >
              <ChevronRight className="w-6 h-6 text-[#2b1605]" />
            </button>
          </div>

          {/* Dots Navigation */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={cn(
                  "transition-all duration-300",
                  index === currentIndex
                    ? "w-8 h-2 bg-[#2b1605] rounded-full"
                    : "w-2 h-2 bg-[#2b1605]/30 rounded-full hover:bg-[#2b1605]/50",
                )}
              />
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <p className="text-[#2b1605] font-medium mb-4">
            Join thousands of satisfied customers
          </p>
          <Button
            size="lg"
            className="bg-[#2d5016] hover:bg-[#3d6820] text-white font-semibold px-8 h-14 text-base shadow-xl"
          >
            Start Your Paanshala Journey
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

/* =========================
   TESTIMONIAL CARD
========================= */
function TestimonialCard({ data, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.15, duration: 0.6 }}
      className="group relative"
    >
      <div className="relative bg-white rounded-3xl p-8 shadow-2xl hover:shadow-[0_20px_60px_rgba(0,0,0,0.2)] transition-all duration-500 h-full flex flex-col overflow-hidden">
        {/* Quote Icon */}
        <div className="absolute -top-4 -left-4 w-16 h-16 rounded-full bg-linear-to-br from-[#d4af37] to-[#f4d03f] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
          <Quote className="w-8 h-8 text-white" />
        </div>

        {/* Decorative Corner */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-linear-to-br from-[#d4af37]/10 to-transparent rounded-bl-full" />

        {/* Review */}
        <p className="text-gray-700 leading-relaxed mb-6 relative z-10 flex-1 text-base">
          "{data.review}"
        </p>

        {/* Stars */}
        <div className="flex justify-center gap-1 mb-6">
          {[...Array(data.rating)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.15 + i * 0.1 }}
              viewport={{ once: true }}
            >
              <Star className="w-5 h-5 fill-[#d4af37] text-[#d4af37]" />
            </motion.div>
          ))}
        </div>

        {/* User Info */}
        <div className="flex items-center gap-4 pt-6 border-t border-gray-100">
          {/* Avatar */}
          <div className="relative">
            <div className="relative w-14 h-14 rounded-full overflow-hidden ring-2 ring-[#d4af37]/30 group-hover:ring-[#d4af37] transition-all duration-300">
              <Image
                src={data.image}
                alt={data.name}
                fill
                className="object-cover"
              />
            </div>
            {/* Verified Badge */}
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-green-500 border-2 border-white flex items-center justify-center">
              <svg
                className="w-3 h-3 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <p className="font-bold text-[#1a1a1a] text-base truncate">
              {data.name}
            </p>
            <p className="text-sm text-gray-600 truncate">{data.role}</p>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-xs text-gray-500">{data.location}</p>
              <span className="text-gray-300">•</span>
              <p className="text-xs text-gray-500">{data.date}</p>
            </div>
          </div>
        </div>

        {/* Hover Accent Line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-[#d4af37] to-[#f4d03f] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 rounded-b-3xl" />
      </div>
    </motion.div>
  );
}
