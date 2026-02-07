"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Search, User, ShoppingBag, Menu, X, ChevronDown } from "lucide-react";
import { collections, signaturePaan } from "@/data/navbar";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/stores/useUserStore";
import { useCartStore } from "@/stores/useCartStore";
import { useCouponStore } from "@/stores/useCouponStore";

export default function Navbar() {
  const [openMenu, setOpenMenu] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const router = useRouter();

  const { user, isAuthenticated, logout } = useUserStore();
  const { cart, fetchCart } = useCartStore();
  const { fetchAllCouponsUser } = useCouponStore();

  const [coupons, setCoupons] = useState([]);
  const [activeCouponIndex, setActiveCouponIndex] = useState(0);

  // Fetch coupons on mount
  useEffect(() => {
    (async () => {
      const data = await fetchAllCouponsUser();
      setCoupons(data || []);
    })();
  }, []);

  // Rotate coupons
  useEffect(() => {
    if (!coupons.length) return;

    const interval = setInterval(() => {
      setActiveCouponIndex((prev) => (prev + 1) % coupons.length);
    }, 3500);

    return () => clearInterval(interval);
  }, [coupons]);

  // Fetch cart when user logged in
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated]);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          scrolled
            ? "bg-[#F6F2E9] backdrop-blur-2xl shadow-xl shadow-black/5"
            : "bg-[#F6F2E9] backdrop-blur-xl shadow-md shadow-black/5",
        )}
      >
        {/* Top bar with announcement */}
        <div className="bg-linear-to-b from-[#0d2915] via-[#12351a] to-[#0b1f11] text-white text-center py-2.5 px-4 overflow-hidden">
          <AnimatePresence mode="wait">
            {coupons.length > 0 ? (
              <motion.p
                key={activeCouponIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="text-xs md:text-sm font-semibold tracking-wide"
              >
                Use Code{" "}
                <span className="text-[#f4d03f]">
                  {coupons[activeCouponIndex].code}
                </span>{" "}
                for more savings!
              </motion.p>
            ) : (
              <p className="text-xs md:text-sm font-semibold tracking-wide">
                ✨ Free Delivery on Orders Above ₹500 | Authentic Paan
                Experience
              </p>
            )}
          </AnimatePresence>
        </div>

        <div className="border-b border-gray-200/60">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="h-20 md:h-24 flex items-center justify-between">
              {/* LOGO */}
              <Link
                href="/"
                className="relative z-10 flex items-center gap-2 group"
              >
                <div className="relative transition-transform duration-300 group-hover:scale-105">
                  <Image
                    src="/paan-logo.png"
                    alt="Paanshala"
                    width={160}
                    height={48}
                    priority
                    className="w-32 md:w-40 h-auto"
                  />
                </div>
              </Link>

              {/* DESKTOP NAV LINKS */}
              <nav className="hidden lg:flex items-center gap-8 xl:gap-10">
                <NavDropdown
                  label="Collections"
                  items={collections}
                  open={openMenu === "collections"}
                  onOpen={() => setOpenMenu("collections")}
                  onClose={() => setOpenMenu(null)}
                />

                <NavDropdown
                  label="Signature Paan"
                  items={signaturePaan}
                  open={openMenu === "paan"}
                  onOpen={() => setOpenMenu("paan")}
                  onClose={() => setOpenMenu(null)}
                />

                <NavLink href="/our-story">Our Story</NavLink>
                <NavLink href="/journal">Paan Journal</NavLink>
                <NavLink href="/experiences">Experiences</NavLink>
                <NavLink href="/get-in-touch">Get In Touch</NavLink>
              </nav>

              {/* RIGHT ICONS */}
              <div className="flex items-center gap-3 md:gap-4">
                <IconButton
                  icon={Search}
                  label="Search"
                  onClick={() => router.push("/search")}
                />
                <div className="relative">
                  <IconButton
                    icon={User}
                    label="Account"
                    onClick={() => {
                      if (!isAuthenticated) {
                        router.push("/login");
                      }
                    }}
                  />

                  {isAuthenticated && (
                    <AnimatePresence>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-xl border overflow-hidden z-50"
                      >
                        <Link
                          href="/orders"
                          className="block px-4 py-3 text-sm hover:bg-gray-50"
                        >
                          My Orders
                        </Link>
                        <Link
                          href="/profile"
                          className="block px-4 py-3 text-sm hover:bg-gray-50"
                        >
                          My Profile
                        </Link>
                        <button
                          onClick={logout}
                          className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50"
                        >
                          Logout
                        </button>
                      </motion.div>
                    </AnimatePresence>
                  )}
                </div>

                <IconButton
                  icon={ShoppingBag}
                  label="Cart"
                  badge={cart?.items?.length > 0 ? cart.items.length : null}
                  onClick={() => router.push("/cart")}
                />

                {/* MOBILE MENU BUTTON */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="lg:hidden p-2 rounded-lg hover:bg-[#d4af37]/10 transition text-[#0b1f11]"
                  aria-label="Toggle menu"
                >
                  {mobileMenuOpen ? (
                    <X className="w-6 h-6" />
                  ) : (
                    <Menu className="w-6 h-6" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <MobileMenu
            collections={collections}
            signaturePaan={signaturePaan}
            onClose={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Spacer to prevent content jump */}
      <div className="h-27 md:h-32" />
    </>
  );
}

/* ===============================
   NAV LINK
=============================== */

function NavLink({ href, children }) {
  return (
    <Link
      href={href}
      className="relative text-[15px] font-medium text-[#1a1a1a] hover:text-[#d4af37] transition-colors duration-300 group"
    >
      {children}
      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-linear-to-r from-[#d4af37] to-[#f4d03f] group-hover:w-full transition-all duration-500" />
    </Link>
  );
}

/* ===============================
   DROPDOWN
=============================== */

function NavDropdown({ label, items, open, onOpen, onClose }) {
  const gridCols = items.length <= 3 ? 3 : items.length <= 4 ? 4 : 4;

  return (
    <div className="relative" onMouseEnter={onOpen} onMouseLeave={onClose}>
      <button className="flex items-center gap-1.5 text-[15px] font-medium text-[#1a1a1a] hover:text-[#d4af37] transition-colors duration-300 group">
        {label}
        <ChevronDown
          className={cn(
            "w-4 h-4 opacity-70 transition-transform duration-300",
            open && "rotate-180",
          )}
        />
        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-linear-to-r from-[#d4af37] to-[#f4d03f] group-hover:w-full transition-all duration-500" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "absolute left-1/2 -translate-x-1/2 top-full mt-6",
              "bg-[#F6F2E9] backdrop-blur-xl rounded-2xl shadow-2xl",
              "border border-gray-100 overflow-hidden",
              items.length <= 3 ? "w-180" : "w-200",
            )}
          >
            {/* Decorative top border */}
            <div className="h-1 bg-linear-to-r from-transparent via-[#d4af37] to-transparent" />

            <div
              className={cn("p-6 grid gap-4")}
              style={{
                gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
              }}
            >
              {items.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    href={item.slug}
                    className="group relative block rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500"
                  >
                    <div className="relative h-40 w-full overflow-hidden">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/30 to-transparent" />
                      {/* Hover effect overlay */}
                      <div className="absolute inset-0 bg-linear-to-t from-[#d4af37]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <p className="text-white font-semibold text-sm md:text-base tracking-wide">
                        {item.name}
                      </p>
                      <div className="w-8 h-0.5 bg-[#d4af37] mt-2 group-hover:w-full transition-all duration-500" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ===============================
   MOBILE MENU
=============================== */

function MobileMenu({ collections, signaturePaan, onClose }) {
  const [expandedSection, setExpandedSection] = useState(null);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 lg:hidden"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Menu Panel */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {/* Header with Logo */}
          <div className="flex items-center justify-between mb-8">
            <Image
              src="/paan-logo.png"
              alt="Paanshala"
              width={120}
              height={36}
              className="w-28 h-auto"
            />
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition text-[#1a1a1a]"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            {/* Collections Accordion */}
            <MobileAccordion
              title="Collections"
              items={collections}
              expanded={expandedSection === "collections"}
              onToggle={() =>
                setExpandedSection(
                  expandedSection === "collections" ? null : "collections",
                )
              }
            />

            {/* Signature Paan Accordion */}
            <MobileAccordion
              title="Signature Paan"
              items={signaturePaan}
              expanded={expandedSection === "paan"}
              onToggle={() =>
                setExpandedSection(expandedSection === "paan" ? null : "paan")
              }
            />

            {/* Regular Links */}
            <MobileLink href="/our-story" onClick={onClose}>
              Our Story
            </MobileLink>
            <MobileLink href="/journal" onClick={onClose}>
              Paan Journal
            </MobileLink>
            <MobileLink href="/experiences" onClick={onClose}>
              Experiences
            </MobileLink>
            <MobileLink href="/contact" onClick={onClose}>
              Connect
            </MobileLink>
          </nav>

          {/* Footer */}
          <div className="mt-12 pt-6 border-t border-gray-200">
            <p className="text-gray-500 text-sm text-center">
              Experience Authentic Paan
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function MobileAccordion({ title, items, expanded, onToggle }) {
  return (
    <div className="border-b border-gray-200">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-4 text-[#1a1a1a] hover:text-[#d4af37] transition-colors"
      >
        <span className="font-medium text-base">{title}</span>
        <ChevronDown
          className={cn(
            "w-5 h-5 transition-transform duration-300",
            expanded && "rotate-180",
          )}
        />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="pb-4 space-y-2">
              {items.map((item) => (
                <Link
                  key={item.name}
                  href={item.slug}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition group"
                >
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <span className="text-sm text-[#1a1a1a] group-hover:text-[#d4af37] transition-colors">
                    {item.name}
                  </span>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MobileLink({ href, children, onClick }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block py-4 text-base text-[#1a1a1a] hover:text-[#d4af37] transition-colors border-b border-gray-200"
    >
      {children}
    </Link>
  );
}

/* ===============================
   ICON BUTTON
=============================== */

function IconButton({ icon: Icon, label, badge, onClick }) {
  return (
    <button
      onClick={onClick}
      className="relative p-2 md:p-2.5 rounded-full hover:bg-[#d4af37]/10 transition-all duration-300 text-[#1a1a1a] hover:text-[#d4af37]"
      aria-label={label}
    >
      <Icon className="w-5 h-5" />
      {badge && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-linear-to-r from-[#d4af37] to-[#f4d03f] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
          {badge}
        </span>
      )}
    </button>
  );
}
