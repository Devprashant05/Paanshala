"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Search, User, ShoppingBag, Menu, X, ChevronRight } from "lucide-react";
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

  const { user, isAuthenticated, logout, fetchProfile } = useUserStore();
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
  }, [isAuthenticated, fetchProfile]);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    fetchProfile();
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
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-white/95 backdrop-blur-xl shadow-lg"
            : "bg-white/90 backdrop-blur-md shadow-md",
        )}
      >
        {/* Top Announcement Bar */}
        <div className="bg-linear-to-r from-[#2d5016] via-[#3d6820] to-[#2d5016] text-white text-center py-2.5 px-4 overflow-hidden">
          <AnimatePresence mode="wait">
            {coupons.length > 0 ? (
              <motion.p
                key={activeCouponIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="text-xs md:text-sm font-medium"
              >
                Use Code{" "}
                <span className="font-bold text-[#f4d03f]">
                  {coupons[activeCouponIndex].code}
                </span>{" "}
                for extra savings! 🎉
              </motion.p>
            ) : (
              <p className="text-xs md:text-sm font-medium">
                ✨ Free Delivery on Orders Above ₹500 | Authentic Paan
                Experience
              </p>
            )}
          </AnimatePresence>
        </div>

        {/* Main Navigation */}
        <div className="border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="h-16 md:h-20 flex items-center justify-between">
              {/* LOGO */}
              <Link href="/" className="flex items-center group">
                <div className="relative transition-transform duration-300 group-hover:scale-105">
                  <Image
                    src="/paan-logo.png"
                    alt="Paanshala"
                    width={140}
                    height={42}
                    priority
                    className="w-28 md:w-36 h-auto"
                  />
                </div>
              </Link>

              {/* DESKTOP NAV LINKS */}
              <nav className="hidden lg:flex items-center gap-1">
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

                <NavLink href="/create-your-paan">Create Your Paan</NavLink>
                <NavLink href="/our-story">Our Story</NavLink>
                <NavLink href="/journal">Journal</NavLink>
                <NavLink href="/experiences">Experiences</NavLink>
                <NavLink href="/get-in-touch">Contact</NavLink>
              </nav>

              {/* RIGHT ICONS */}
              <div className="flex items-center gap-1 md:gap-2">
                <IconButton
                  icon={Search}
                  label="Search"
                  onClick={() => router.push("/search")}
                />

                {/* USER MENU */}
                <div
                  className="relative"
                  onMouseEnter={() => setOpenMenu("user")}
                  onMouseLeave={() => setOpenMenu(null)}
                >
                  {!isAuthenticated ? (
                    <IconButton
                      icon={User}
                      label="Account"
                      onClick={() => router.push("/login")}
                    />
                  ) : (
                    <button
                      className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center bg-linear-to-br from-[#2d5016] to-[#3d6820] text-white font-semibold text-sm hover:ring-2 hover:ring-[#d4af37] transition-all"
                      aria-label="User menu"
                    >
                      {user?.profile_image ? (
                        <Image
                          src={user.profile_image}
                          alt={user.full_name}
                          width={36}
                          height={36}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <span className="uppercase">
                          {user?.full_name?.charAt(0)}
                        </span>
                      )}
                    </button>
                  )}

                  {/* USER DROPDOWN */}
                  <AnimatePresence>
                    {isAuthenticated && openMenu === "user" && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden"
                      >
                        <div className="px-4 py-3 bg-linear-to-br from-[#2d5016]/5 to-[#d4af37]/5 border-b border-gray-100">
                          <p className="text-sm font-bold text-gray-900 truncate">
                            {user.full_name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {user.email}
                          </p>
                        </div>

                        <div className="py-1">
                          <DropdownLink href="/orders">My Orders</DropdownLink>
                          <DropdownLink href="/wishlist">Wishlist</DropdownLink>
                          <DropdownLink href="/profile">Profile</DropdownLink>
                        </div>

                        <div className="border-t border-gray-100">
                          <button
                            onClick={logout}
                            className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                          >
                            Logout
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
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
                  className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition text-gray-900"
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
            isAuthenticated={isAuthenticated}
            user={user}
            logout={logout}
          />
        )}
      </AnimatePresence>

      {/* Spacer */}
      <div className="h-24 md:h-28" />
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
      className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-[#2d5016] transition-colors rounded-lg hover:bg-gray-50"
    >
      {children}
    </Link>
  );
}

/* ===============================
   DROPDOWN (SIMPLE TEXT)
=============================== */
function NavDropdown({ label, items, open, onOpen, onClose }) {
  return (
    <div className="relative" onMouseEnter={onOpen} onMouseLeave={onClose}>
      <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-[#2d5016] transition-colors rounded-lg hover:bg-gray-50 flex items-center gap-1">
        {label}
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 top-full mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden"
          >
            <div className="py-2">
              {items.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    href={item.slug}
                    className="group flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 hover:text-[#2d5016] hover:bg-linear-to-r hover:from-[#2d5016]/5 hover:to-transparent transition-all"
                  >
                    <span className="font-medium">{item.name}</span>
                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
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
   DROPDOWN LINK
=============================== */
function DropdownLink({ href, children }) {
  return (
    <Link
      href={href}
      className="block px-4 py-2.5 text-sm text-gray-700 hover:text-[#2d5016] hover:bg-gray-50 transition-colors"
    >
      {children}
    </Link>
  );
}

/* ===============================
   MOBILE MENU
=============================== */
function MobileMenu({
  collections,
  signaturePaan,
  onClose,
  isAuthenticated,
  user,
  logout,
}) {
  const [expandedSection, setExpandedSection] = useState(null);
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 lg:hidden"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Menu Panel */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-2xl overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
            <Image
              src="/paan-logo.png"
              alt="Paanshala"
              width={100}
              height={30}
              className="w-24 h-auto"
            />
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Section (if logged in) */}
          {isAuthenticated && user && (
            <div className="mb-6 p-4 bg-linear-to-br from-[#2d5016]/5 to-[#d4af37]/5 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-linear-to-br from-[#2d5016] to-[#3d6820] text-white font-bold">
                  {user?.profile_image ? (
                    <Image
                      src={user.profile_image}
                      alt={user.full_name}
                      width={48}
                      height={48}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <span className="uppercase text-lg">
                      {user?.full_name?.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">
                    {user.full_name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="space-y-1">
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
              onClose={onClose}
            />

            {/* Signature Paan Accordion */}
            <MobileAccordion
              title="Signature Paan"
              items={signaturePaan}
              expanded={expandedSection === "paan"}
              onToggle={() =>
                setExpandedSection(expandedSection === "paan" ? null : "paan")
              }
              onClose={onClose}
            />

            {/* Regular Links */}
            <MobileLink href="/create-your-paan" onClick={onClose}>
              Create Your Paan
            </MobileLink>

            {/* Regular Links */}
            <MobileLink href="/our-story" onClick={onClose}>
              Our Story
            </MobileLink>
            <MobileLink href="/journal" onClick={onClose}>
              Journal
            </MobileLink>
            <MobileLink href="/experiences" onClick={onClose}>
              Experiences
            </MobileLink>
            <MobileLink href="/get-in-touch" onClick={onClose}>
              Contact
            </MobileLink>

            {/* User Links (if logged in) */}
            {isAuthenticated && (
              <>
                <div className="my-4 border-t border-gray-100" />
                <MobileLink href="/orders" onClick={onClose}>
                  My Orders
                </MobileLink>
                <MobileLink href="/wishlist" onClick={onClose}>
                  Wishlist
                </MobileLink>
                <MobileLink href="/profile" onClick={onClose}>
                  Profile
                </MobileLink>
                <button
                  onClick={() => {
                    logout();
                    onClose();
                  }}
                  className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-lg transition font-medium"
                >
                  Logout
                </button>
              </>
            )}

            {/* Login Link (if not logged in) */}
            {!isAuthenticated && (
              <>
                <div className="my-4 border-t border-gray-100" />
                <button
                  onClick={() => {
                    router.push("/login");
                    onClose();
                  }}
                  className="w-full px-4 py-3 bg-linear-to-r from-[#2d5016] to-[#3d6820] text-white text-sm font-semibold rounded-lg hover:opacity-90 transition"
                >
                  Login / Sign Up
                </button>
              </>
            )}
          </nav>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ===============================
   MOBILE ACCORDION
=============================== */
function MobileAccordion({ title, items, expanded, onToggle, onClose }) {
  return (
    <div className="border-b border-gray-100">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 text-gray-900 hover:bg-gray-50 rounded-lg transition"
      >
        <span className="font-medium text-sm">{title}</span>
        <motion.span
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </motion.span>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="py-2 space-y-1">
              {items.map((item) => (
                <Link
                  key={item.name}
                  href={item.slug}
                  onClick={onClose}
                  className="flex items-center justify-between px-6 py-2.5 text-sm text-gray-600 hover:text-[#2d5016] hover:bg-gray-50 rounded-lg transition group"
                >
                  <span>{item.name}</span>
                  <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition" />
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ===============================
   MOBILE LINK
=============================== */
function MobileLink({ href, children, onClick }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block px-4 py-3 text-sm text-gray-700 hover:text-[#2d5016] hover:bg-gray-50 rounded-lg transition border-b border-gray-100"
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
      className="relative p-2 rounded-lg hover:bg-gray-100 transition-all text-gray-700 hover:text-[#2d5016]"
      aria-label={label}
    >
      <Icon className="w-5 h-5" />
      {badge && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-linear-to-br from-[#d4af37] to-[#f4d03f] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg">
          {badge}
        </span>
      )}
    </button>
  );
}
