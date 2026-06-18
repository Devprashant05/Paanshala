"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  User,
  ShoppingBag,
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  Copy,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/stores/useUserStore";
import { useCartStore } from "@/stores/useCartStore";
import { useGuestCartStore } from "@/stores/useGuestCartStore";
import { useCouponStore } from "@/stores/useCouponStore";
import { useCategoryStore } from "@/stores/useCategoryStore";
import { useAnnouncementStore } from "@/stores/useAnnouncementStore";
import EventBookingModal from "../EventBookingModal";
import { useCartUIStore } from "@/stores/useCartUIStore";

export default function Navbar() {
  const [openMenu, setOpenMenu] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  const router = useRouter();
  const { user, isAuthenticated, logout, fetchProfile } = useUserStore();
  const { cart, fetchCart } = useCartStore();
  const { items: guestItems } = useGuestCartStore();
  const { fetchAllCouponsUser } = useCouponStore();
  const { categories, fetchActiveCategories } = useCategoryStore();
  const { activeAnnouncements, fetchActiveAnnouncements } =
    useAnnouncementStore();
  const { openCart } = useCartUIStore();

  const cartCount = isAuthenticated
    ? cart?.items?.length || 0
    : guestItems.reduce((s, i) => s + i.quantity, 0);

  const [coupons, setCoupons] = useState([]);

  /* ── Build merged slides: static announcements + coupon slides ── */
  const allSlides = [
    ...activeAnnouncements.map((a) => ({
      type: "static",
      text: a.text,
      link: a.link,
      linkLabel: a.linkLabel,
      bgColor: a.bgColor || "#2d5016",
      textColor: a.textColor || "#ffffff",
    })),
    ...coupons.map((c) => ({
      type: "coupon",
      code: c.code,
      text:
        c.discountType === "percentage"
          ? `Use code ${c.code} for ${c.discountValue}% off${c.maxDiscount ? ` (max ₹${c.maxDiscount})` : ""}! 🎉`
          : `Use code ${c.code} for flat ₹${c.discountValue} off! 🎉`,
      bgColor: "#2d5016",
      textColor: "#ffffff",
    })),
  ];

  // Fallback slide when nothing is configured
  const slides =
    allSlides.length > 0
      ? allSlides
      : [
          {
            type: "static",
            text: "✨ Free Delivery on Orders Above ₹500 | Authentic Paan Experience",
            bgColor: "#2d5016",
            textColor: "#ffffff",
          },
        ];

  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [copied, setCopied] = useState(false);
  const timerRef = useRef(null);

  const startTimer = () => {
    clearInterval(timerRef.current);
    if (slides.length <= 1) return;
    timerRef.current = setInterval(() => {
      setDirection(1);
      setActiveIndex((p) => (p + 1) % slides.length);
    }, 4000);
  };

  useEffect(() => {
    startTimer();
    return () => clearInterval(timerRef.current);
  }, [slides.length]);

  // Reset index if slides shrink below current index
  useEffect(() => {
    if (activeIndex >= slides.length) setActiveIndex(0);
  }, [slides.length]);

  const goSlide = (dir) => {
    setDirection(dir);
    setActiveIndex((p) => (p + dir + slides.length) % slides.length);
    startTimer();
  };

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /* ── fetch announcements ── */
  useEffect(() => {
    fetchActiveAnnouncements();
  }, []);

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

  // Add this useEffect inside Navbar:
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (openMenu === "user" && !e.target.closest("[data-user-menu]")) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("touchstart", handleOutsideClick);
    return () => document.removeEventListener("touchstart", handleOutsideClick);
  }, [openMenu]);

  const catSlug = (cat) => `/collections/${cat.slug}`;
  const parentCategories = categories.filter((cat) => cat.level === 0);

  const currentSlide = slides[activeIndex] || slides[0];

  const variants = {
    enter: (dir) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? "-100%" : "100%", opacity: 0 }),
  };

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
        {/* ── Announcement bar ── */}
        <div
          className="relative overflow-hidden h-9 flex items-center transition-colors duration-500"
          style={{ backgroundColor: currentSlide?.bgColor || "#2d5016" }}
        >
          {/* Prev arrow */}
          {slides.length > 1 && (
            <button
              onClick={() => goSlide(-1)}
              className="absolute left-2 z-10 p-1 rounded-full hover:bg-white/10 transition-colors shrink-0"
              aria-label="Previous"
            >
              <ChevronRight
                className="w-3.5 h-3.5 rotate-180"
                style={{ color: currentSlide?.textColor || "#ffffff" }}
              />
            </button>
          )}

          {/* Slide content */}
          <div className="flex-1 overflow-hidden px-7 relative h-full flex items-center">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={activeIndex}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="absolute inset-0 flex items-center justify-center gap-2 px-2"
              >
                <p
                  className="text-xs md:text-sm font-medium text-center leading-tight"
                  style={{ color: currentSlide?.textColor || "#ffffff" }}
                >
                  {currentSlide?.type === "coupon" ? (
                    <>
                      Use Code{" "}
                      <span className="font-bold" style={{ color: "#f4d03f" }}>
                        {currentSlide.code}
                      </span>{" "}
                      for extra savings! 🎉
                    </>
                  ) : (
                    currentSlide?.text
                  )}
                </p>

                {/* Copy button for coupon slides */}
                {currentSlide?.type === "coupon" && currentSlide.code && (
                  <button
                    onClick={() => handleCopy(currentSlide.code)}
                    className="flex items-center gap-1 bg-white/15 hover:bg-white/25 border border-white/30 rounded-md px-2 py-0.5 text-[10px] font-bold transition-all shrink-0"
                    style={{ color: currentSlide?.textColor || "#ffffff" }}
                  >
                    {copied ? (
                      <>
                        <Check className="w-3 h-3 text-green-400" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        {currentSlide.code}
                      </>
                    )}
                  </button>
                )}

                {/* CTA link for static slides */}
                {currentSlide?.type === "static" && currentSlide.link && (
                  <a
                    href={currentSlide.link}
                    className="text-[10px] font-bold underline underline-offset-2 shrink-0 hover:opacity-80 transition-opacity"
                    style={{ color: currentSlide?.textColor || "#ffffff" }}
                  >
                    {currentSlide.linkLabel || "Learn More"}
                  </a>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Next arrow */}
          {slides.length > 1 && (
            <button
              onClick={() => goSlide(1)}
              className="absolute right-2 z-10 p-1 rounded-full hover:bg-white/10 transition-colors shrink-0"
              aria-label="Next"
            >
              <ChevronRight
                className="w-3.5 h-3.5"
                style={{ color: currentSlide?.textColor || "#ffffff" }}
              />
            </button>
          )}

          {/* Dot indicators
          {slides.length > 1 && (
            <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 flex gap-1">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setDirection(i > activeIndex ? 1 : -1);
                    setActiveIndex(i);
                    startTimer();
                  }}
                  className={cn(
                    "rounded-full transition-all duration-300",
                    i === activeIndex ? "w-3 h-1" : "w-1 h-1 opacity-40",
                  )}
                  style={{
                    backgroundColor: currentSlide?.textColor || "#ffffff",
                  }}
                />
              ))}
            </div>
          )} */}
        </div>

        {/* ── Main nav ── */}
        <div className="border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="h-16 md:h-20 flex items-center justify-between">
              {/* Logo */}
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

              {/* Desktop nav */}
              <nav className="hidden lg:flex items-center gap-1">
                <ShopMegaDropdown
                  categories={parentCategories}
                  catSlug={catSlug}
                  open={openMenu === "shop"}
                  onOpen={() => setOpenMenu("shop")}
                  onClose={() => setOpenMenu(null)}
                />
                <NavLink href="/horeca">Horeca</NavLink>
                <NavLink href="/create-your-paan">Make Your Own Combo</NavLink>
                <NavLink href="/our-story">Our Story</NavLink>
                <NavLink href="/experiences">Catering</NavLink>
                <NavLink href="/journal">Paan Stories</NavLink>
                <NavLink href="/get-in-touch">Contact</NavLink>
              </nav>

              {/* Right icons */}
              <div className="flex items-center gap-1 md:gap-2">
                <IconButton
                  icon={Search}
                  label="Search"
                  onClick={() => router.push("/search")}
                />

                {/* User menu */}
                <div
                  className="relative"
                  data-user-menu
                  onMouseEnter={() => isAuthenticated && setOpenMenu("user")}
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
                      onClick={() =>
                        setOpenMenu(openMenu === "user" ? null : "user")
                      } // ← toggle on tap
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

                  <AnimatePresence>
                    {isAuthenticated && openMenu === "user" && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50"
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
                          <DropdownLink
                            href="/orders"
                            onClick={() => setOpenMenu(null)}
                          >
                            My Orders
                          </DropdownLink>
                          <DropdownLink
                            href="/wishlist"
                            onClick={() => setOpenMenu(null)}
                          >
                            Wishlist
                          </DropdownLink>
                          <DropdownLink
                            href="/profile"
                            onClick={() => setOpenMenu(null)}
                          >
                            Profile
                          </DropdownLink>
                        </div>
                        <div className="border-t border-gray-100">
                          <button
                            onClick={() => {
                              logout();
                              setOpenMenu(null);
                            }} // ← close on logout
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
                  badge={cartCount > 0 ? cartCount : null}
                  onClick={() => openCart()}
                />

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

      <AnimatePresence>
        {mobileMenuOpen && (
          <MobileMenu
            categories={parentCategories}
            catSlug={catSlug}
            onClose={() => setMobileMenuOpen(false)}
            isAuthenticated={isAuthenticated}
            user={user}
            logout={logout}
          />
        )}
      </AnimatePresence>

      <div className="h-24 md:h-28" />
      <EventBookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
      />
    </>
  );
}

/* ── NAV LINK ── */
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

/* ── SHOP MEGA DROPDOWN ── */
function ShopMegaDropdown({ categories, catSlug, open, onOpen, onClose }) {
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const activeCategory = categories.find((c) => c._id === hoveredCategory);

  return (
    <div
      className="relative"
      onMouseEnter={onOpen}
      onMouseLeave={() => {
        onClose();
        setHoveredCategory(null);
      }}
    >
      <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-[#2d5016] transition-colors rounded-lg hover:bg-gray-50 flex items-center gap-1">
        Shop
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4" />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.18 }}
            className="absolute left-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden flex"
          >
            <div className="py-3 w-52">
              {categories.map((parentCat) => {
                const isActive = hoveredCategory === parentCat._id;
                const hasChildren = parentCat.children?.length > 0;
                return (
                  <div
                    key={parentCat._id}
                    onMouseEnter={() => setHoveredCategory(parentCat._id)}
                    className={cn(
                      "flex items-center justify-between px-5 py-2.5 cursor-pointer transition-colors",
                      isActive ? "bg-gray-50" : "hover:bg-gray-50",
                    )}
                  >
                    <Link
                      href={catSlug(parentCat)}
                      className={cn(
                        "text-sm flex-1 transition-colors",
                        isActive
                          ? "font-semibold text-[#2d5016]"
                          : "font-medium text-gray-700 hover:text-[#2d5016]",
                      )}
                    >
                      {parentCat.name}
                    </Link>
                    {hasChildren && (
                      <ChevronRight
                        className={cn(
                          "w-4 h-4 shrink-0 transition-colors",
                          isActive ? "text-[#2d5016]" : "text-gray-300",
                        )}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {activeCategory?.children?.length > 0 && (
              <div className="w-px bg-gray-200 my-3" />
            )}

            {activeCategory?.children?.length > 0 && (
              <div className="py-3 w-52">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeCategory._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.12 }}
                  >
                    {/* <Link
                      href={catSlug(activeCategory)}
                      className="block px-5 py-2 text-sm font-bold text-[#2d5016] hover:bg-gray-50 transition-colors border-b border-gray-100 mb-1"
                    >
                      All {activeCategory.name}
                    </Link> */}
                    {activeCategory.children.map((child) => (
                      <Link
                        key={child._id}
                        href={catSlug(child)}
                        className="flex items-center justify-between px-5 py-2.5 text-sm text-gray-600 hover:text-[#2d5016] hover:bg-gray-50 transition-colors group/child"
                      >
                        <span>{child.name}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-gray-300 opacity-0 group-hover/child:opacity-100 transition-opacity" />
                      </Link>
                    ))}
                  </motion.div>
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── DROPDOWN LINK ── */
function DropdownLink({ href, children, onClick }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block px-4 py-2.5 text-sm text-gray-700 hover:text-[#2d5016] hover:bg-gray-50 transition-colors"
    >
      {children}
    </Link>
  );
}

/* ── MOBILE MENU ── */
function MobileMenu({ categories, catSlug, onClose, isAuthenticated, user, logout }) {
  const [expandedId, setExpandedId] = useState(null);
  const [shopExpanded, setShopExpanded] = useState(false);
  const router = useRouter();
  const toggle = (id) => setExpandedId((prev) => (prev === id ? null : id));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 lg:hidden"
      style={{ top: "var(--navbar-height, 95px)" }}
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-2xl overflow-y-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 pt-4">
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
                    <p className="text-xs text-gray-500 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <nav className="space-y-0.5">
              <div
                className={cn(
                  "rounded-lg overflow-hidden transition-colors",
                  shopExpanded && "bg-gray-50",
                )}
              >
                <button
                  onClick={() => setShopExpanded(!shopExpanded)}
                  className="w-full flex items-center justify-between px-4 py-3 text-gray-900 hover:bg-gray-50 rounded-lg transition"
                >
                  <span className="font-medium text-sm">Shop</span>
                  <motion.span
                    animate={{ rotate: shopExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  </motion.span>
                </button>

                <AnimatePresence>
                  {shopExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22 }}
                      className="overflow-hidden"
                    >
                      <div className="pb-2 space-y-0.5">
                        {categories.map((cat) => (
                          <MobileAccordion
                            key={cat._id}
                            title={cat.name}
                            rootSlug={catSlug(cat)}
                            items={cat.children || []}
                            expanded={expandedId === cat._id}
                            onToggle={() => toggle(cat._id)}
                            onClose={onClose}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="border-gray-100 pt-1 mt-2 space-y-0.5">
                <MobileLink href="/horeca" onClick={onClose}>
                  Horeca
                </MobileLink>
                <MobileLink href="/create-your-paan" onClick={onClose}>
                  Make Your Own Combo
                </MobileLink>
                <MobileLink href="/our-story" onClick={onClose}>
                  Our Story
                </MobileLink>
                <MobileLink href="/experiences" onClick={onClose}>
                  Catering
                </MobileLink>
                <MobileLink href="/journal" onClick={onClose}>
                  Paan Stories
                </MobileLink>
                <MobileLink href="/get-in-touch" onClick={onClose}>
                  Contact
                </MobileLink>
              </div>

              {isAuthenticated ? (
                <div className="pt-1 border-t border-gray-100 mt-2 space-y-0.5">
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
                </div>
              ) : (
                <div className="border-gray-100 pt-2 mt-2">
                  <button
                    onClick={() => {
                      router.push("/login");
                      onClose();
                    }}
                    className="w-full px-4 py-3 bg-linear-to-r from-[#2d5016] to-[#3d6820] text-white text-sm font-semibold rounded-lg hover:opacity-90 transition"
                  >
                    Login / Sign Up
                  </button>
                </div>
              )}
            </nav>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── MOBILE ACCORDION ── */
function MobileAccordion({ title, rootSlug, items, expanded, onToggle, onClose }) {
  const hasChildren = items.length > 0;

  return (
    <div className="pl-4">
      <div
        className={cn(
          "rounded-lg overflow-hidden transition-colors",
          expanded && hasChildren && "bg-gray-50",
        )}
      >
        {/* If no children — just a direct link, no accordion */}
        {!hasChildren ? (
          <Link
            href={rootSlug}
            onClick={onClose}
            className="flex items-center justify-between px-4 py-2.5 text-gray-900 hover:bg-gray-50 hover:text-[#2d5016] rounded-lg transition"
          >
            <span className="font-medium text-sm">{title}</span>
            <ChevronRight className="w-4 h-4 text-gray-300" />
          </Link>
        ) : (
          /* Has children — accordion behavior */
          <>
            <button
              onClick={onToggle}
              className="w-full flex items-center justify-between px-4 py-2.5 text-gray-900 hover:bg-gray-50 rounded-lg transition"
            >
              <span className="font-medium text-sm">{title}</span>
              <motion.span
                animate={{ rotate: expanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-4 h-4 text-gray-500" />
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
                    {/* "View All" link for the root category */}
                    <Link
                      href={rootSlug}
                      onClick={onClose}
                      className="flex items-center gap-2 px-6 py-2 text-sm font-bold text-[#2d5016] hover:bg-[#2d5016]/5 rounded-lg transition"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                      All {title}
                    </Link>
                    {items.map((child) => (
                      <Link
                        key={child._id}
                        href={`/collections/${child.slug}`}
                        onClick={onClose}
                        className="flex items-center justify-between px-6 py-2 text-sm text-gray-600 hover:text-[#2d5016] hover:bg-gray-100 rounded-lg transition group"
                      >
                        <span>{child.name}</span>
                        <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition" />
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </div>
  );
}

/* ── MOBILE LINK ── */
function MobileLink({ href, children, onClick }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block px-4 py-3 text-sm font-medium text-gray-700 hover:text-[#2d5016] hover:bg-gray-50 rounded-lg transition"
    >
      {children}
    </Link>
  );
}

/* ── ICON BUTTON ── */
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