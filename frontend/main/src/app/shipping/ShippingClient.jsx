import Link from "next/link";
import {
  ChevronRight,
  Truck,
  Package,
  MapPin,
  Clock,
  CheckCircle,
  IndianRupee,
} from "lucide-react";

export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-white via-cream-light to-[#f5e6d3]">
      {/* HERO SECTION */}
      <section className="relative bg-linear-to-br from-[#264B0E] via-brand-green-dark to-[#264B0E] py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-6 text-center">
          <h1 className="text-heading text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 uppercase tracking-wide">
            Shipping & Delivery
          </h1>

          <p className="text-body text-lg md:text-xl text-white/80 max-w-3xl mx-auto mb-8">
            We deliver authentic paan experiences right to your doorstep
          </p>

          {/* Breadcrumb */}
          <div className="flex items-center justify-center gap-2 text-body text-sm text-white/60">
            <Link href="/" className="hover:text-gold-bright transition-colors">
              Home
            </Link>
            <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
            <span className="text-white">Shipping & Delivery</span>
          </div>
        </div>
      </section>

      {/* QUICK INFO CARDS */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 -mt-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <DeliveryInfoCard
            icon={IndianRupee}
            title="Free Shipping"
            description="On orders above ₹500"
            highlight="₹500+"
          />
          <DeliveryInfoCard
            icon={Clock}
            title="Quick Delivery"
            description="3-5 business days"
            highlight="3-5 Days"
          />
          <DeliveryInfoCard
            icon={MapPin}
            title="Pan India"
            description="Delivery across India"
            highlight="All Cities"
          />
          <DeliveryInfoCard
            icon={CheckCircle}
            title="Order Tracking"
            description="Track your package"
            highlight="Real-time"
          />
        </div>
      </div>

      {/* CONTENT */}
      <section className="max-w-5xl mx-auto px-4 md:px-6 py-16 md:py-24">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 md:p-12">
          <div className="mb-12 pb-8 border-b border-gray-200">
            <h2 className="text-heading text-3xl md:text-4xl font-bold text-[#264B0E] mb-4 uppercase">
              Delivering Fresh Paan to Your Doorstep
            </h2>
            <p className="text-body text-gray-600 leading-relaxed">
              We understand the importance of timely delivery when it comes to
              fresh paan products. Our shipping process is designed to ensure
              your order reaches you quickly and in perfect condition.
            </p>
          </div>

          <div className="space-y-10">
            <ShippingSection
              number="1"
              title="Shipping Zones & Availability"
              content="We currently ship to the following locations:"
              items={[
                "Major Metro Cities: Delhi, Mumbai, Bangalore, Chennai, Kolkata, Hyderabad",
                "Tier 1 & 2 Cities: All major cities across India",
                "Selected Tier 3 Cities: Check availability at checkout",
                "Rural Areas: Limited availability, contact support for details",
                "International Shipping: Coming soon!",
              ]}
            />

            <ShippingSection
              number="2"
              title="Delivery Timeline"
              content="Estimated delivery time from order confirmation:"
              zones={[
                {
                  name: "Same City Delivery",
                  time: "1-2 business days",
                  note: "Available in select metro cities",
                },
                {
                  name: "Metro Cities",
                  time: "2-3 business days",
                  note: "Delhi, Mumbai, Bangalore, etc.",
                },
                {
                  name: "Tier 1 & 2 Cities",
                  time: "3-5 business days",
                  note: "Most major cities",
                },
                {
                  name: "Tier 3 Cities & Remote Areas",
                  time: "5-7 business days",
                  note: "Subject to courier availability",
                },
              ]}
            />

            <ShippingSection
              number="3"
              title="Shipping Charges"
              content="Our shipping rates are designed to be fair and transparent:"
              pricing={[
                {
                  condition: "Orders ₹500 and above",
                  cost: "FREE",
                  badge: "Most Popular",
                },
                {
                  condition: "Orders below ₹500 (Metro Cities)",
                  cost: "₹50",
                  badge: null,
                },
                {
                  condition: "Orders below ₹500 (Other Cities)",
                  cost: "₹75",
                  badge: null,
                },
                {
                  condition: "Express Delivery (Next Day)",
                  cost: "₹150",
                  badge: "Premium",
                },
              ]}
            />

            <ShippingSection
              number="4"
              title="Order Processing Time"
              content="Here's what happens after you place your order:"
              steps={[
                {
                  title: "Order Confirmation",
                  description:
                    "You'll receive an email within 5 minutes of placing your order",
                  time: "Immediate",
                },
                {
                  title: "Quality Check & Packaging",
                  description:
                    "Our team carefully prepares and packs your fresh paan products",
                  time: "2-4 hours",
                },
                {
                  title: "Dispatch",
                  description: "Order handed over to our courier partner",
                  time: "Same day or next day",
                },
                {
                  title: "In Transit",
                  description:
                    "Your package is on its way with real-time tracking",
                  time: "1-7 days based on location",
                },
                {
                  title: "Delivery",
                  description: "Package delivered to your doorstep",
                  time: "As per delivery timeline",
                },
              ]}
            />

            <ShippingSection
              number="5"
              title="Package & Product Protection"
              content="We take extra care to ensure your products arrive fresh:"
              items={[
                "Temperature-controlled packaging for heat-sensitive items",
                "Bubble wrap and cushioning for fragile products",
                "Sealed containers to maintain freshness",
                "Tamper-proof packaging for security",
                "Special handling labels for couriers",
                "Ice packs for products requiring refrigeration (seasonal)",
              ]}
            />

            <ShippingSection
              number="6"
              title="Order Tracking"
              content="Stay updated on your order status:"
              items={[
                "SMS & Email notifications at every stage",
                "Real-time tracking link sent after dispatch",
                "Track your order anytime on our website",
                "Estimated delivery date provided upfront",
                "Delivery partner details shared",
                "Call/WhatsApp support for tracking queries",
              ]}
            />

            <ShippingSection
              number="7"
              title="Delivery Options"
              content="Choose the delivery option that suits you best:"
              items={[
                "Standard Delivery: Regular delivery within estimated timeline",
                "Express Delivery: Next-day delivery in select cities (₹150 extra)",
                "Scheduled Delivery: Choose a preferred delivery date (coming soon)",
                "Contactless Delivery: Safe delivery at your doorstep",
                "Multiple Addresses: Ship to different addresses in single order",
              ]}
            />

            <ShippingSection
              number="8"
              title="What If You're Not Home?"
              content="Don't worry if you miss the delivery:"
              items={[
                "Courier will attempt 2-3 delivery tries",
                "You'll receive SMS/call before each attempt",
                "Reschedule delivery for a convenient time",
                "Provide alternate delivery address",
                "Authorize neighbor/security to receive",
                "Pick up from nearest courier office (if preferred)",
              ]}
            />

            <ShippingSection
              number="9"
              title="Delivery Issues & Support"
              content="If you face any issues with delivery:"
              items={[
                "Damaged Package: Take photos and contact us within 24 hours",
                "Missing Items: Report within 48 hours of delivery",
                "Delayed Delivery: Track your order and contact support",
                "Wrong Address: Contact us immediately to update",
                "Package Lost: We'll investigate and arrange replacement/refund",
              ]}
              subcontent={
                <>
                  <strong>Contact Delivery Support:</strong>
                  <br />
                  Phone:{" "}
                  <a
                    href="tel:+918510851039"
                    className="text-[#264B0E] hover:text-gold-bright font-bold transition-colors"
                  >
                    +91 8510851039
                  </a>{" "}
                  (9 AM - 9 PM)
                  <br />
                  Email:{" "}
                  <a
                    href="mailto:delivery@paanshala.com"
                    className="text-[#264B0E] hover:text-gold-bright font-bold transition-colors"
                  >
                    delivery@paanshala.com
                  </a>
                  <br />
                  WhatsApp:{" "}
                  <a
                    href="https://wa.me/918510851039"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#264B0E] hover:text-gold-bright font-bold transition-colors"
                  >
                    Chat with us
                  </a>
                </>
              }
            />

            <ShippingSection
              number="10"
              title="Special Delivery Instructions"
              content="You can add special instructions during checkout:"
              items={[
                "Gate code or building entry instructions",
                "Preferred delivery time window",
                "Leave at doorstep (contactless)",
                "Call upon arrival",
                "Deliver to security/reception",
                "Alternate contact number",
              ]}
            />

            <ShippingSection
              number="11"
              title="Bulk & Corporate Orders"
              content="Special shipping arrangements for large orders:"
              items={[
                "Minimum Order: 50+ units for bulk pricing",
                "Free shipping on all bulk orders",
                "Dedicated delivery executive",
                "Flexible delivery scheduling",
                "Multiple delivery locations",
                "Corporate invoicing available",
              ]}
              subcontent={
                <>
                  For bulk orders, contact:{" "}
                  <a
                    href="mailto:corporate@paanshala.com"
                    className="text-[#264B0E] hover:text-gold-bright font-bold transition-colors"
                  >
                    corporate@paanshala.com
                  </a>
                </>
              }
            />

            <ShippingSection
              number="12"
              title="Holidays & Peak Season"
              content="Please note during festive seasons:"
              items={[
                "Delivery may take 1-2 extra days during festivals",
                "Place orders early during Diwali, Holi, etc.",
                "No deliveries on national holidays",
                "Express delivery not available during peak season",
                "We'll notify you of any delays in advance",
              ]}
            />
          </div>

          {/* CTA */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="bg-linear-to-r from-[#264B0E] to-brand-green-dark rounded-2xl p-8 md:p-12 text-center shadow-xl">
              <Package
                className="w-16 h-16 text-gold-bright mx-auto mb-4"
                strokeWidth={2}
              />
              <h3 className="text-heading text-3xl md:text-4xl font-bold text-white mb-4 uppercase tracking-wide">
                Ready to Order?
              </h3>
              <p className="text-body text-base md:text-lg text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
                Experience the authentic taste of traditional paan, delivered
                fresh to your doorstep.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/shop">
                  <button className="btn-gold w-full sm:w-auto px-8 py-4 text-base inline-flex items-center justify-center gap-2">
                    <span className="font-bold">Start Shopping</span>
                    <ChevronRight className="w-5 h-5" strokeWidth={2.5} />
                  </button>
                </Link>
                <Link href="/get-in-touch">
                  <button className="btn-outline w-full sm:w-auto px-8 py-4 text-base border-2 border-white text-white hover:bg-white hover:text-[#264B0E] inline-flex items-center justify-center gap-2">
                    <span className="font-bold text-white">
                      Contact Support
                    </span>
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Related Links */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <RelatedLink
            href="/return-policy"
            icon={Package}
            title="Return Policy"
            description="7-day hassle-free returns"
          />
          <RelatedLink
            href="/terms"
            icon={CheckCircle}
            title="Terms & Conditions"
            description="Our terms of service"
          />
          <RelatedLink
            href="/get-in-touch"
            icon={Truck}
            title="Track Order"
            description="Track your delivery status"
          />
        </div>
      </section>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   DELIVERY INFO CARD
═══════════════════════════════════════════════════════════════ */
function DeliveryInfoCard({ icon: Icon, title, description, highlight }) {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 text-center hover:shadow-xl hover:border-gold-bright transition-all duration-300 group">
      <div className="w-14 h-14 rounded-full bg-linear-to-br from-gold-bright to-[#d4a574] flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
        <Icon className="w-7 h-7 text-white" strokeWidth={2} />
      </div>
      <div className="text-heading text-2xl font-bold text-gold-bright mb-2">
        {highlight}
      </div>
      <h3 className="text-body text-sm font-bold text-[#264B0E] mb-1 uppercase">
        {title}
      </h3>
      <p className="text-body text-xs text-gray-600">{description}</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SHIPPING SECTION
═══════════════════════════════════════════════════════════════ */
function ShippingSection({
  number,
  title,
  content,
  items,
  zones,
  pricing,
  steps,
  subcontent,
}) {
  return (
    <div className="group">
      <div className="flex gap-4 md:gap-6">
        <div className="shrink-0">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-linear-to-br from-gold-bright to-[#d4a574] flex items-center justify-center font-bold text-white shadow-lg group-hover:scale-110 transition-transform">
            {number}
          </div>
        </div>
        <div className="flex-1 pt-1">
          <h3 className="text-heading text-xl md:text-2xl font-bold text-[#264B0E] mb-3 group-hover:text-gold-bright transition-colors uppercase">
            {title}
          </h3>
          <p className="text-body text-gray-600 leading-relaxed mb-3">
            {content}
          </p>

          {/* Regular Items List */}
          {items && (
            <ul className="space-y-2 mt-4">
              {items.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-gold-bright mt-2 shrink-0" />
                  <span className="text-body text-gray-600">{item}</span>
                </li>
              ))}
            </ul>
          )}

          {/* Delivery Zones */}
          {zones && (
            <div className="space-y-3 mt-4">
              {zones.map((zone, index) => (
                <div
                  key={index}
                  className="bg-[#f5e6d3]/30 rounded-lg p-4 hover:bg-[#f5e6d3]/50 transition-colors border border-gold-bright/20"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-heading font-bold text-[#264B0E] text-sm uppercase">
                      {zone.name}
                    </h4>
                    <span className="text-heading text-gold-bright font-bold">
                      {zone.time}
                    </span>
                  </div>
                  <p className="text-body text-sm text-gray-600">{zone.note}</p>
                </div>
              ))}
            </div>
          )}

          {/* Pricing Table */}
          {pricing && (
            <div className="space-y-3 mt-4">
              {pricing.map((price, index) => (
                <div
                  key={index}
                  className="bg-linear-to-r from-[#f5e6d3]/30 to-white rounded-lg p-4 border border-gold-bright/30 hover:border-gold-bright transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-body font-semibold text-[#264B0E]">
                        {price.condition}
                      </p>
                      {price.badge && (
                        <span className="inline-block mt-1 text-xs bg-linear-to-r from-gold-bright to-[#d4a574] text-white px-2 py-1 rounded-full font-bold">
                          {price.badge}
                        </span>
                      )}
                    </div>
                    <div className="text-heading text-xl font-bold text-[#264B0E]">
                      {price.cost}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Process Steps */}
          {steps && (
            <div className="space-y-4 mt-4">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className="flex gap-4 bg-[#f5e6d3]/30 rounded-lg p-4 hover:bg-[#f5e6d3]/50 transition-colors border border-gold-bright/20"
                >
                  <div className="shrink-0">
                    <div className="w-10 h-10 rounded-full bg-linear-to-br from-gold-bright to-[#d4a574] text-white flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-heading font-bold text-[#264B0E] text-sm uppercase">
                        {step.title}
                      </h4>
                      <span className="text-body text-xs text-gray-500 font-semibold">
                        {step.time}
                      </span>
                    </div>
                    <p className="text-body text-sm text-gray-600">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Subcontent */}
          {subcontent && (
            <div className="mt-4 pl-4 border-l-2 border-gold-bright/50 text-body text-gray-600 text-sm">
              {subcontent}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   RELATED LINK
═══════════════════════════════════════════════════════════════ */
function RelatedLink({ href, icon: Icon, title, description }) {
  return (
    <Link
      href={href}
      className="group bg-white rounded-xl border border-gray-200 p-6 hover:border-gold-bright hover:shadow-lg transition-all duration-300"
    >
      <div className="w-12 h-12 rounded-xl bg-linear-to-br from-gold-bright/10 to-[#d4a574]/10 flex items-center justify-center mb-4 group-hover:bg-linear-to-br group-hover:from-gold-bright group-hover:to-[#d4a574] transition-all border border-gold-bright/20">
        <Icon
          className="w-6 h-6 text-[#264B0E] group-hover:text-white transition-colors"
          strokeWidth={2}
        />
      </div>
      <h4 className="text-heading text-lg font-bold text-[#264B0E] mb-2 group-hover:text-gold-bright transition-colors uppercase">
        {title}
      </h4>
      <p className="text-body text-sm text-gray-600">{description}</p>
    </Link>
  );
}
