"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ChevronRight,
  Calendar,
  Users,
  Heart,
  PartyPopper,
  Cake,
  Wine,
  Utensils,
  Check,
  Phone,
  Star,
  Award,
  Clock,
  Shield,
  Sparkles,
  Mail,
  MessageCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import EventBookingModal from "@/components/EventBookingModal";

const EXPERIENCES = [
  {
    title: "Wedding",
    icon: Heart,
    image: "/wedding.jpg",
    color: "from-rose-500 to-pink-500",
    description:
      "Make your special day unforgettable with our curated wedding paan counters. We offer customized paan varieties, elegant presentation, and dedicated service staff to create a royal experience for your guests.",
    features: [
      "Custom paan varieties tailored to your preferences",
      "Elegant setup with traditional decor",
      "Dedicated professional staff",
      "Traditional & modern fusion options",
    ],
  },
  {
    title: "Theme Party",
    icon: PartyPopper,
    image: "/theme-party.jpg",
    color: "from-purple-500 to-indigo-500",
    description:
      "Transform your themed event with our creative paan presentations. From Bollywood nights to retro parties, we customize our offerings to match your theme perfectly with unique flavors and presentations.",
    features: [
      "Theme-matched flavors and colors",
      "Creative presentations and setups",
      "Custom decorations included",
      "Interactive live paan-making counters",
    ],
  },
  {
    title: "Cocktail Party",
    icon: Wine,
    image: "/cocktail.jpg",
    color: "from-amber-500 to-orange-500",
    description:
      "Add sophistication to your cocktail events with our premium paan selection. Perfect pairings with your beverages, modern presentation, and a unique conversation starter for your guests.",
    features: [
      "Premium varieties with exotic ingredients",
      "Modern, elegant presentations",
      "Cocktail pairing recommendations",
      "White-glove service staff",
    ],
  },
  {
    title: "Private Party",
    icon: Users,
    image: "/private.jpg",
    color: "from-teal-500 to-cyan-500",
    description:
      "Intimate gatherings deserve special attention. Our private party services offer personalized paan menus, flexible timing, and customized setups to match your home's ambiance perfectly.",
    features: [
      "Personalized menus for small groups",
      "Flexible timing and duration",
      "Home service with setup included",
      "Small batch fresh preparation",
    ],
  },
  {
    title: "Corporate Catering",
    icon: Utensils,
    image: "/catering.jpg",
    color: "from-emerald-500 to-green-500",
    description:
      "Impress your clients and colleagues with our corporate catering services. Professional setup, hygiene-first approach, and a memorable culinary experience that elevates your business events.",
    features: [
      "Professional corporate setup",
      "Hygiene-certified preparation",
      "Bulk orders handled efficiently",
      "On-time guaranteed service",
    ],
  },
  {
    title: "Birthday Party",
    icon: Cake,
    image: "/birthday.jpg",
    color: "from-pink-500 to-rose-500",
    description:
      "Make birthdays extra special with our fun and colorful paan selections. From kids-friendly options to adult favorites, we create a delightful experience for guests of all ages.",
    features: [
      "Age-appropriate flavor options",
      "Colorful, festive presentations",
      "Fun flavors for all ages",
      "Complimentary party favors",
    ],
  },
];

const WHY_CHOOSE = [
  {
    icon: Heart,
    title: "Authentic Recipes",
    description: "Traditional preparations passed down through generations",
  },
  {
    icon: Sparkles,
    title: "Premium Ingredients",
    description: "Only the finest quality ingredients in every paan",
  },
  {
    icon: Users,
    title: "Expert Staff",
    description: "Professional and courteous service team",
  },
  {
    icon: Calendar,
    title: "Flexible Booking",
    description: "Customizable packages for any event size",
  },
  {
    icon: Shield,
    title: "Hygiene First",
    description: "FSSAI certified with highest safety standards",
  },
  {
    icon: Clock,
    title: "Punctual Service",
    description: "Always on time, every time guaranteed",
  },
];

const TESTIMONIALS = [
  {
    name: "Priya & Rahul",
    event: "Wedding Reception",
    quote:
      "Paanshala made our wedding reception truly special. The paan counter was a huge hit with all our guests! The presentation was elegant and the variety was incredible.",
  },
  {
    name: "Amit Sharma",
    event: "Corporate Event",
    quote:
      "Professional service and amazing variety. Our clients were impressed with the unique addition to our event. Will definitely book again for future events!",
  },
  {
    name: "Neha Kapoor",
    event: "Birthday Party",
    quote:
      "The team was fantastic! They customized flavors for kids and adults. Everyone loved it! The setup was beautiful and staff was so friendly.",
  },
];

export default function ExperiencesPage() {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedExperience, setSelectedExperience] = useState(null);

  const handleBooking = (experience) => {
    setSelectedExperience(experience);
    setBookingOpen(true);
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-white via-[#f5f2eb] to-white">
      {/* ══════════════════════════════════════
          HERO SECTION - Simple, No Image
      ══════════════════════════════════════ */}
      <section className="relative bg-linear-to-br from-[#264B0E] via-[#2d5016] to-[#264B0E] py-14">
        <div className="max-w-7xl mx-auto px-4 md:px-6 text-left">
          {/* Breadcrumb */}
          <div className="flex items-center justify-start gap-2 text-body text-sm text-white/60">
            <Link href="/" className="hover:text-gold-bright transition-colors">
              Home
            </Link>
            <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
            <span className="text-white">Experiences</span>
          </div>

          <h1 className="text-heading text-6xl font-bold text-white mb-4 mt-2 uppercase tracking-wide">
            Events & Experiences
          </h1>

          <p className="text-body text-lg md:text-xl text-white/80 max-w-3xl mb-8">
            Celebrate life's finest moments with Paanshala's bespoke paan
            experiences tailored for every occasion.
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════
          QUICK STATS CARDS
      ══════════════════════════════════════ */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 -mt-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <QuickStatCard
            icon={Calendar}
            title="100+ Events"
            value="Successfully Hosted"
          />
          <QuickStatCard icon={Users} title="50K+ Guests" value="Made Happy" />
          <QuickStatCard
            icon={Star}
            title="100% Satisfaction"
            value="Guaranteed"
          />
        </div>
      </div>

      {/* ══════════════════════════════════════
          INTRO SECTION
      ══════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-16 md:py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-heading text-4xl md:text-5xl font-bold text-[#264B0E] mb-4 uppercase">
            Creating Memorable Moments
          </h2>
          <p className="text-body text-gray-600 leading-relaxed text-lg">
            Whether it's an intimate celebration or a grand event, Paanshala
            brings the authentic taste of traditional paan with a modern twist.
            Our expert team ensures every detail is perfect, making your event
            truly unforgettable.
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════
          EXPERIENCE GRID - Simplified
      ══════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 pb-16 md:pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {EXPERIENCES.map((item, i) => (
            <ExperienceCard
              key={item.title}
              experience={item}
              onBook={() => handleBooking(item)}
            />
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════
          WHY CHOOSE US
      ══════════════════════════════════════ */}
      <section className="bg-[#f5e6d3]/50 py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-heading text-4xl md:text-5xl font-bold text-[#264B0E] mb-4 uppercase">
              Why Choose Paanshala?
            </h2>
            <p className="text-body text-gray-600 max-w-2xl mx-auto">
              We go beyond serving paan – we create experiences
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {WHY_CHOOSE.map((feature) => (
              <FeatureCard key={feature.title} feature={feature} />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          TESTIMONIALS
      ══════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-16 md:py-20">
        <div className="text-center mb-12">
          <h2 className="text-heading text-4xl md:text-5xl font-bold text-[#264B0E] mb-4 uppercase">
            What Our Clients Say
          </h2>
          <p className="text-body text-gray-600">
            Real experiences from real events
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((testimonial, i) => (
            <TestimonialCard key={i} testimonial={testimonial} />
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════
          CTA SECTION
      ══════════════════════════════════════ */}
      <section className="bg-linear-to-br from-[#264B0E] via-[#2d5016] to-[#264B0E] py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-heading text-4xl md:text-5xl font-bold text-white mb-6 uppercase">
              Ready to Make Your Event Special?
            </h2>
            <p className="text-body text-white/90 text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
              Let's create an unforgettable paan experience for your special
              occasion. Our team is ready to customize everything to your needs.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <button
                onClick={() => setBookingOpen(true)}
                className="inline-flex items-center gap-3 bg-linear-to-r from-gold-bright to-[#d4a574] hover:from-[#d4a574] hover:to-gold-bright text-white px-8 py-4 rounded-xl font-bold transition-all duration-300 shadow-lg hover:scale-105"
              >
                <Calendar className="w-5 h-5" strokeWidth={2.5} />
                Book Your Event Now
              </button>

              <a
                href="tel:+918510851039"
                className="inline-flex items-center gap-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-bold transition-all duration-300 border-2 border-white/30"
              >
                <Phone className="w-5 h-5" strokeWidth={2.5} />
                Call: +91 8510851039
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 md:gap-8 pt-12 border-t border-white/20">
              <div>
                <div className="text-heading text-3xl md:text-4xl font-bold text-gold-bright mb-2">
                  100+
                </div>
                <div className="text-body text-xs md:text-sm text-white/80">
                  Events Hosted
                </div>
              </div>
              <div>
                <div className="text-heading text-3xl md:text-4xl font-bold text-gold-bright mb-2">
                  50K+
                </div>
                <div className="text-body text-xs md:text-sm text-white/80">
                  Happy Guests
                </div>
              </div>
              <div>
                <div className="text-heading text-3xl md:text-4xl font-bold text-gold-bright mb-2">
                  100%
                </div>
                <div className="text-body text-xs md:text-sm text-white/80">
                  Satisfaction Rate
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-16 md:py-20">
        <div className="text-center mb-12">
          <h2 className="text-heading text-4xl md:text-5xl font-bold text-[#264B0E] mb-4 uppercase">
            Frequently Asked Questions
          </h2>
          <p className="text-body text-gray-600 max-w-2xl mx-auto">
            Quick answers to common questions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          <FAQCard
            question="What types of events do you cater?"
            answer="We cater to all types of events including weddings, corporate events, birthday parties, cocktail parties, theme parties, and private gatherings of any size."
          />
          <FAQCard
            question="How far in advance should I book?"
            answer="We recommend booking at least 2-3 weeks in advance for regular events and 1-2 months for weddings and large corporate events to ensure availability."
          />
          <FAQCard
            question="Do you provide staff for events?"
            answer="Yes! We provide trained and professional staff for all events. Our team handles setup, service, and cleanup so you can enjoy your event worry-free."
          />
          <FAQCard
            question="Can you customize the menu?"
            answer="Absolutely! We work closely with you to create a customized menu that matches your event theme, guest preferences, and dietary requirements."
          />
        </div>
      </section>

      {/* Booking Modal */}
      <EventBookingModal
        isOpen={bookingOpen}
        onClose={() => setBookingOpen(false)}
        selectedExperience={selectedExperience}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   QUICK STAT CARD
═══════════════════════════════════════════════════════════════ */
function QuickStatCard({ icon: Icon, title, value }) {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 text-center hover:shadow-xl transition-all duration-300">
      <div className="w-14 h-14 rounded-full bg-linear-to-br from-gold-bright to-[#d4a574] flex items-center justify-center mx-auto mb-4">
        <Icon className="w-7 h-7 text-white" strokeWidth={2} />
      </div>
      <h3 className="text-heading text-sm font-bold text-[#264B0E] mb-1 uppercase">
        {title}
      </h3>
      <p className="text-body text-xs text-gray-600">{value}</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   EXPERIENCE CARD - Simplified
═══════════════════════════════════════════════════════════════ */
function ExperienceCard({ experience, onBook }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full">
      {/* Image */}
      <div className="relative h-64 overflow-hidden">
        <Image
          src={experience.image}
          alt={experience.title}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />

        {/* Icon Badge */}
        <div
          className={cn(
            "absolute top-4 right-4 w-14 h-14 rounded-xl bg-linear-to-br flex items-center justify-center shadow-lg",
            experience.color,
          )}
        >
          <experience.icon className="w-7 h-7 text-white" strokeWidth={2} />
        </div>

        {/* Title */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h3 className="text-heading text-2xl font-bold text-white uppercase">
            {experience.title}
          </h3>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col">
        <p className="text-body text-sm text-gray-600 leading-relaxed mb-4 flex-1">
          {experience.description}
        </p>

        {/* Features */}
        <div className="space-y-2 mb-6">
          {experience.features.map((feature, i) => (
            <div key={i} className="flex items-start gap-2 text-sm">
              <Check
                className="w-4 h-4 text-[#264B0E] shrink-0 mt-0.5"
                strokeWidth={2.5}
              />
              <span className="text-body text-gray-700">{feature}</span>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <button
          onClick={onBook}
          className={cn(
            "w-full inline-flex items-center justify-center gap-2 bg-linear-to-r text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 shadow-md hover:shadow-lg hover:scale-[1.02]",
            experience.color,
          )}
        >
          <Calendar className="w-5 h-5" strokeWidth={2.5} />
          Book Your Events
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FEATURE CARD
═══════════════════════════════════════════════════════════════ */
function FeatureCard({ feature }) {
  return (
    <div className="bg-white rounded-xl p-6 text-center hover:shadow-xl transition-all duration-300 border border-gray-100">
      <div className="w-16 h-16 rounded-full bg-linear-to-br from-gold-bright to-[#d4a574] flex items-center justify-center mx-auto mb-4">
        <feature.icon className="w-8 h-8 text-white" strokeWidth={2} />
      </div>
      <h3 className="text-heading text-lg font-bold text-[#264B0E] mb-2 uppercase">
        {feature.title}
      </h3>
      <p className="text-body text-sm text-gray-600 leading-relaxed">
        {feature.description}
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TESTIMONIAL CARD
═══════════════════════════════════════════════════════════════ */
function TestimonialCard({ testimonial }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
      <div className="flex items-center gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="w-4 h-4 text-gold-bright fill-gold-bright" />
        ))}
      </div>
      <p className="text-body text-gray-700 italic mb-4 leading-relaxed">
        "{testimonial.quote}"
      </p>
      <div className="border-t border-gray-100 pt-4">
        <p className="text-heading font-bold text-[#264B0E]">{testimonial.name}</p>
        <p className="text-body text-sm text-gray-500">{testimonial.event}</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FAQ CARD
═══════════════════════════════════════════════════════════════ */
function FAQCard({ question, answer }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:border-gold-bright hover:shadow-lg transition-all duration-300">
      <h3 className="text-heading text-lg font-bold text-[#264B0E] mb-3 uppercase">
        {question}
      </h3>
      <p className="text-body text-sm text-gray-600 leading-relaxed">{answer}</p>
    </div>
  );
}