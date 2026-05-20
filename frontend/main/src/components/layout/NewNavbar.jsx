"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  User,
  ShoppingBag,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/stores/useUserStore";
import { useCartStore } from "@/stores/useCartStore";
import { useGuestCartStore } from "@/stores/useGuestCartStore";
import { useCouponStore } from "@/stores/useCouponStore";
import { useCategoryStore } from "@/stores/useCategoryStore";
import EventBookingModal from "../EventBookingModal";
import { useCartUIStore } from "@/stores/useCartUIStore";

export default function Navbar() {
  const [openMenu, setOpenMenu] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("shopping"); // 'shopping' or 'gifting'

  const router = useRouter();
  const { user, isAuthenticated, logout, fetchProfile } = useUserStore();
  const { cart, fetchCart } = useCartStore();
  const { items: guestItems } = useGuestCartStore();
  const { fetchAllCouponsUser } = useCouponStore();
  const { categories, fetchActiveCategories } = useCategoryStore();
  const { openCart } = useCartUIStore();

  // Unified cart badge
  const cartCount = isAuthenticated
    ? cart?.items?.length || 0
    : guestItems.reduce((s, i) => s + i.quantity, 0);

  const [coupons, setCoupons] = useState([]);
  const [activeCouponIndex, setActiveCouponIndex] = useState(0);

  /* ── fetch coupons ── */
  useEffect(() => {
    (async () => {
      const data = await fetchAllCouponsUser();
      setCoupons(data || []);
    })();
  }, []);

  /* ── fetch categories ── */
  useEffect(() => {
    fetchActiveCategories();
  }, []);

  /* ── rotate coupons ── */
  useEffect(() => {
    if (!coupons.length) return;
    const id = setInterval(
      () => setActiveCouponIndex((p) => (p + 1) % coupons.length),
      3500,
    );
    return () => clearInterval(id);
  }, [coupons]);

  /* ── cart ── */
  useEffect(() => {
    if (isAuthenticated) fetchCart();
  }, [isAuthenticated, fetchProfile]);

  /* ── scroll shadow ── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ── profile ── */
  useEffect(() => {
    fetchProfile();
  }, []);

  /* ── body scroll lock ── */
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  /* ── build category slug ── */
  const catSlug = (cat) => `/collections/${cat.slug}`;

  // Shopping navigation items
  const shoppingNav = [
    {
      type: "dropdown",
      label: "SHOP",
      items: categories
        .filter((cat) => cat.children?.length > 0)
        .map((cat) => ({
          label: cat.name,
          href: catSlug(cat),
          children: cat.children,
        })),
    },
    {
      type: "link",
      label: "CREATE YOUR BOX",
      href: "/create-your-paan",
    },
    {
      type: "dropdown",
      label: "EXPLORE",
      items: [
        { label: "Our Story", href: "/our-story" },
        { label: "Journal", href: "/journal" },
        { label: "Experiences", href: "/experiences" },
      ],
    },
  ];

  // Gifting navigation items
  const giftingNav = [
    {
      type: "link",
      label: "HORECA",
      href: "/horeca",
    },
    {
      type: "link",
      label: "EXPORTS",
      href: "/exports",
    },
    {
      type: "dropdown",
      label: "EXPLORE",
      items: [
        { label: "Our Story", href: "/our-story" },
        { label: "Journal", href: "/journal" },
        { label: "Corporate Gifting", href: "/corporate-gifting" },
      ],
    },
  ];

  const currentNav = activeSection === "shopping" ? shoppingNav : giftingNav;

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50">
        {/* ══════════════════════════════════════════════
            TOP BAR - Section Switcher (Gifting/Shopping)
        ══════════════════════════════════════════════ */}
        <div className="relative">
          <div className="flex items-stretch h-15">
            {/* Left - Gifting Button */}
            <button
              onClick={() => {
                setActiveSection("gifting");
              }}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 transition-all duration-300 relative",
                activeSection === "gifting"
                  ? "bg-gold-bright text-[#1a1a1a]"
                  : "bg-[#f5e6d3] text-gray-600 hover:text-[#1a1a1a]",
              )}
            >
              <span className="text-heading text-2xl md:text-3xl lg:text-4xl tracking-wider font-normal">
                GIFTING
              </span>
            </button>

            {/* Center - Logo (Absolutely positioned) */}
            <Link
              href="/"
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
            >
              <div className="relative transition-transform duration-300 hover:scale-105 bg-white rounded-full p-2 shadow-lg">
                <Image
                  src="/paan-logo.png"
                  alt="Paanshala"
                  width={120}
                  height={120}
                  priority
                  className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 object-contain"
                />
              </div>
            </Link>

            {/* Right - Shopping Button */}
            <button
              onClick={() => {
                setActiveSection("shopping");
              }}
              className={cn(
                "flex-1 flex items-center justify-center gap-3 transition-all duration-300 relative",
                activeSection === "shopping"
                  ? "bg-gold-bright text-[#1a1a1a]"
                  : "bg-[#f5e6d3] text-gray-600 hover:text-[#1a1a1a]",
              )}
            >
              <span className="text-heading text-2xl md:text-3xl lg:text-4xl tracking-wider font-normal">
                SHOPPING
              </span>
            </button>
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            MAIN NAVIGATION BAR
        ══════════════════════════════════════════════ */}
        <div
          className={cn(
            "transition-all duration-300",
            activeSection === "shopping" ? "bg-[#1a1a1a]" : "bg-[#1a1a1a]",
            scrolled && "shadow-2xl",
          )}
        >
          <div className="max-w-400 mx-auto px-4 md:px-6">
            <div className="h-16 flex items-center justify-between">
              {/* Left - Desktop Navigation Links */}
              <nav className="hidden lg:flex items-center gap-1">
                {currentNav.map((item, index) =>
                  item.type === "dropdown" ? (
                    <NavDropdownPremium
                      key={index}
                      label={item.label}
                      items={item.items}
                      open={openMenu === item.label}
                      onOpen={() => setOpenMenu(item.label)}
                      onClose={() => setOpenMenu(null)}
                      activeSection={activeSection}
                    />
                  ) : (
                    <NavLinkPremium
                      key={index}
                      href={item.href}
                      activeSection={activeSection}
                    >
                      {item.label}
                    </NavLinkPremium>
                  ),
                )}
              </nav>

              {/* Mobile Logo - Left */}
              <Link href="/" className="flex lg:hidden items-center">
                <Image
                  src="/paan-logo.png"
                  alt="Paanshala"
                  width={80}
                  height={80}
                  priority
                  className="w-16 h-16 hidden"
                />
              </Link>

              {/* Right Icons */}
              <div className="flex items-center gap-1 md:gap-2">
                <IconButtonPremium
                  icon={Search}
                  label="Search"
                  onClick={() => router.push("/search")}
                  activeSection={activeSection}
                />

                {/* User menu */}
                <div
                  className="relative"
                  onMouseEnter={() => isAuthenticated && setOpenMenu("user")}
                  onMouseLeave={() => setOpenMenu(null)}
                >
                  {!isAuthenticated ? (
                    <IconButtonPremium
                      icon={User}
                      label="Account"
                      onClick={() => router.push("/login")}
                      activeSection={activeSection}
                    />
                  ) : (
                    <button
                      className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center bg-gold-bright text-[#1a1a1a] font-semibold text-sm transition-all hover:ring-2 hover:ring-gold-bright hover:ring-offset-2 hover:ring-offset-[#1a1a1a]"
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
                        <span className="uppercase text-heading">
                          {user?.full_name?.charAt(0)}
                        </span>
                      )}
                    </button>
                  )}

                  <AnimatePresence>
                    {isAuthenticated && openMenu === "user" && (
                      <UserDropdown user={user} logout={logout} />
                    )}
                  </AnimatePresence>
                </div>

                <IconButtonPremium
                  icon={ShoppingBag}
                  label="Cart"
                  badge={cartCount > 0 ? cartCount : null}
                  onClick={() => openCart()}
                  activeSection={activeSection}
                />

                {/* Mobile menu toggle */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="lg:hidden p-2 rounded-lg transition text-gold-bright hover:bg-white/10"
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

        {/* ══════════════════════════════════════════════
            ANNOUNCEMENT BAR (Coupons)
        ══════════════════════════════════════════════ */}
        <div className="bg-linear-to-r from-[#264B0E] via-[#3d6820] to-[#264B0E] text-white text-center py-2.5 px-4 overflow-hidden">
          <AnimatePresence mode="wait">
            {coupons.length > 0 ? (
              <motion.p
                key={activeCouponIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="text-xs md:text-sm font-medium text-body"
              >
                ✨ Use Code{" "}
                <span className="font-bold text-gold-bright text-heading tracking-wider">
                  {coupons[activeCouponIndex].code}
                </span>{" "}
                for extra savings! 🎉
              </motion.p>
            ) : (
              <p className="text-xs md:text-sm font-medium text-body">
                ✨ Free Delivery on Orders Above ₹500 | Authentic Paan
                Experience
              </p>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <MobileMenuPremium
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            shoppingNav={shoppingNav}
            giftingNav={giftingNav}
            onClose={() => setMobileMenuOpen(false)}
            isAuthenticated={isAuthenticated}
            user={user}
            logout={logout}
          />
        )}
      </AnimatePresence>

      {/* Spacer */}
      <div className="h-34" />

      <EventBookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
      />
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PREMIUM NAV LINK
═══════════════════════════════════════════════════════════════ */
function NavLinkPremium({ href, children, activeSection }) {
  return (
    <Link
      href={href}
      className="px-4 py-2 text-heading text-base lg:text-lg tracking-wider transition-all duration-200 text-gold-bright hover:text-white relative group"
    >
      {children}
      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gold-bright transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
    </Link>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PREMIUM NAV DROPDOWN
═══════════════════════════════════════════════════════════════ */
function NavDropdownPremium({
  label,
  items,
  open,
  onOpen,
  onClose,
  activeSection,
}) {
  return (
    <div className="relative" onMouseEnter={onOpen} onMouseLeave={onClose}>
      <button className="px-4 py-2 text-heading text-base lg:text-lg tracking-wider transition-all duration-200 flex items-center gap-2 text-gold-bright hover:text-white group relative">
        {label}
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4" />
        </motion.span>
        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gold-bright transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 top-full mt-2 bg-[#1a1a1a] rounded-xl shadow-2xl border border-gray-dark overflow-hidden min-w-175 max-w-225"
          >
            <div className="p-6">
              <div className="grid grid-cols-2 gap-8">
                {items.map((item, index) => (
                  <div key={index} className="space-y-3">
                    {/* Category Header */}
                    <Link
                      href={item.href}
                      className="flex items-center justify-between px-4 py-3 text-base font-bold text-gold-bright border-b-2 border-gold-bright/30 hover:bg-white/5 rounded-t-lg transition-all group"
                    >
                      <span className="text-heading tracking-wide uppercase">
                        {item.label}
                      </span>
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>

                    {/* Subcategories */}
                    {item.children && (
                      <div className="space-y-1">
                        {item.children.map((child, childIndex) => (
                          <motion.div
                            key={child._id}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: childIndex * 0.02 }}
                          >
                            <Link
                              href={`/collections/${child.slug}`}
                              className="group flex items-center justify-between px-4 py-2.5 text-sm text-gray-300 hover:text-gold-bright hover:bg-white/5 rounded-lg transition-all text-body"
                            >
                              <span className="font-medium">{child.name}</span>
                              <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                            </Link>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   USER DROPDOWN
═══════════════════════════════════════════════════════════════ */
function UserDropdown({ user, logout }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2 }}
      className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden"
    >
      <div className="px-4 py-3 bg-linear-to-br from-[#264B0E]/5 to-[#d4a574]/5 border-b border-gray-100">
        <p className="text-sm font-bold text-gray-900 truncate text-body">
          {user.full_name}
        </p>
        <p className="text-xs text-gray-500 truncate text-body">{user.email}</p>
      </div>
      <div className="py-1">
        <DropdownLink href="/orders">My Orders</DropdownLink>
        <DropdownLink href="/wishlist">Wishlist</DropdownLink>
        <DropdownLink href="/profile">Profile</DropdownLink>
      </div>
      <div className="border-t border-gray-100">
        <button
          onClick={logout}
          className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium text-body"
        >
          Logout
        </button>
      </div>
    </motion.div>
  );
}

function DropdownLink({ href, children }) {
  return (
    <Link
      href={href}
      className="block px-4 py-2.5 text-sm text-gray-700 hover:text-[#264B0E] hover:bg-gray-50 transition-colors text-body"
    >
      {children}
    </Link>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PREMIUM ICON BUTTON
═══════════════════════════════════════════════════════════════ */
function IconButtonPremium({
  icon: Icon,
  label,
  badge,
  onClick,
  activeSection,
}) {
  return (
    <button
      onClick={onClick}
      className="relative p-2 rounded-lg transition-all text-gold-bright hover:bg-white/10 hover:text-white"
      aria-label={label}
    >
      <Icon className="w-5 h-5" strokeWidth={2.5} />
      {badge && (
        <span className="absolute -top-1 -right-1 w-5 h-5 text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg text-heading bg-gold-bright text-[#1a1a1a]">
          {badge}
        </span>
      )}
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MOBILE MENU PREMIUM
═══════════════════════════════════════════════════════════════ */
function MobileMenuPremium({
  activeSection,
  setActiveSection,
  shoppingNav,
  giftingNav,
  onClose,
  isAuthenticated,
  user,
  logout,
}) {
  const [expandedId, setExpandedId] = useState(null);
  const router = useRouter();

  const toggle = (id) => setExpandedId((prev) => (prev === id ? null : id));
  const currentNav = activeSection === "shopping" ? shoppingNav : giftingNav;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 lg:hidden"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-[#1a1a1a] shadow-2xl overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
            <Image
              src="/paan-logo.png"
              alt="Paanshala"
              width={80}
              height={80}
              className="w-16 h-16 invert-100"
            />
            <button
              onClick={onClose}
              className="p-2 rounded-lg transition text-gold-bright hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Section Switcher */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveSection("gifting")}
              className={cn(
                "flex-1 py-3 rounded-lg text-heading text-sm tracking-wider transition-all",
                activeSection === "gifting"
                  ? "bg-[#f5e6d3] text-[#1a1a1a]"
                  : "bg-white/5 text-white/50",
              )}
            >
              GIFTING
            </button>
            <button
              onClick={() => setActiveSection("shopping")}
              className={cn(
                "flex-1 py-3 rounded-lg text-heading text-sm tracking-wider transition-all",
                activeSection === "shopping"
                  ? "bg-gold-bright text-[#1a1a1a]"
                  : "bg-white/5 text-white/50",
              )}
            >
              SHOPPING
            </button>
          </div>

          {/* User card */}
          {isAuthenticated && user && (
            <div className="mb-6 p-4 bg-white/5 rounded-xl backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-gold-bright text-[#1a1a1a] font-bold text-heading">
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
                  <p className="text-sm font-bold truncate text-body text-gold-bright">
                    {user.full_name}
                  </p>
                  <p className="text-xs text-white/60 truncate text-body">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="space-y-1">
            {currentNav.map((item, index) =>
              item.type === "dropdown" ? (
                <MobileAccordionPremium
                  key={index}
                  title={item.label}
                  items={item.items}
                  expanded={expandedId === item.label}
                  onToggle={() => toggle(item.label)}
                  onClose={onClose}
                  activeSection={activeSection}
                />
              ) : (
                <MobileLinkPremium
                  key={index}
                  href={item.href}
                  onClick={onClose}
                  activeSection={activeSection}
                >
                  {item.label}
                </MobileLinkPremium>
              ),
            )}

            {/* Auth links */}
            {isAuthenticated ? (
              <div className="pt-4 mt-4 border-t border-white/10 space-y-1">
                <MobileLinkPremium
                  href="/orders"
                  onClick={onClose}
                  activeSection={activeSection}
                >
                  MY ORDERS
                </MobileLinkPremium>
                <MobileLinkPremium
                  href="/wishlist"
                  onClick={onClose}
                  activeSection={activeSection}
                >
                  WISHLIST
                </MobileLinkPremium>
                <MobileLinkPremium
                  href="/profile"
                  onClick={onClose}
                  activeSection={activeSection}
                >
                  PROFILE
                </MobileLinkPremium>
                <button
                  onClick={() => {
                    logout();
                    onClose();
                  }}
                  className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition font-medium text-heading tracking-wide"
                >
                  LOGOUT
                </button>
              </div>
            ) : (
              <div className="pt-4 mt-4 border-t border-white/10">
                <button
                  onClick={() => {
                    router.push("/login");
                    onClose();
                  }}
                  className="w-full px-4 py-3 text-sm font-semibold rounded-lg transition text-heading tracking-wide bg-gold-bright text-[#1a1a1a] hover:bg-[#d4a574]"
                >
                  LOGIN / SIGN UP
                </button>
              </div>
            )}
          </nav>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MOBILE ACCORDION PREMIUM
═══════════════════════════════════════════════════════════════ */
function MobileAccordionPremium({
  title,
  items,
  expanded,
  onToggle,
  onClose,
  activeSection,
}) {
  return (
    <div
      className={cn(
        "rounded-lg overflow-hidden transition-colors",
        expanded && "bg-white/5",
      )}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 rounded-lg transition text-heading tracking-wide text-gold-bright hover:bg-white/5"
      >
        <span className="font-medium text-sm">{title}</span>
        <motion.span
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-5 h-5" />
        </motion.span>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="pb-2 space-y-0.5">
              {items.map((item, index) =>
                item.children ? (
                  <div key={index}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-gold-bright hover:bg-white/5 rounded-lg transition text-body"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                      All {item.label}
                    </Link>
                    {item.children.map((child) => (
                      <Link
                        key={child._id}
                        href={`/collections/${child.slug}`}
                        onClick={onClose}
                        className="flex items-center justify-between px-8 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition group text-body"
                      >
                        <span>{child.name}</span>
                        <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition" />
                      </Link>
                    ))}
                  </div>
                ) : (
                  <Link
                    key={index}
                    href={item.href}
                    onClick={onClose}
                    className="flex items-center justify-between px-6 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition group text-body"
                  >
                    <span>{item.label}</span>
                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition" />
                  </Link>
                ),
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MOBILE LINK PREMIUM
═══════════════════════════════════════════════════════════════ */
function MobileLinkPremium({ href, children, onClick, activeSection }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block px-4 py-3 text-sm font-medium rounded-lg transition text-heading tracking-wide text-gold-bright hover:bg-white/5"
    >
      {children}
    </Link>
  );
}
