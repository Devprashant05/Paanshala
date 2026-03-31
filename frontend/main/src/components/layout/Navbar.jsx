"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Search, User, ShoppingBag, Menu, X, ChevronRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/stores/useUserStore";
import { useCartStore } from "@/stores/useCartStore";
import { useGuestCartStore } from "@/stores/useGuestCartStore";
import { useCouponStore } from "@/stores/useCouponStore";
import { useCategoryStore } from "@/stores/useCategoryStore";

export default function Navbar() {
  const [openMenu, setOpenMenu] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const router = useRouter();
  const { user, isAuthenticated, logout, fetchProfile } = useUserStore();
  const { cart, fetchCart } = useCartStore();
  const { items: guestItems } = useGuestCartStore();
  const { fetchAllCouponsUser } = useCouponStore();
  const { categories, fetchActiveCategories } = useCategoryStore();

  // Unified cart badge: auth users use server cart, guests use localStorage cart
  const cartCount = isAuthenticated
    ? (cart?.items?.length || 0)
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

  /* ── fetch categories (public tree) ── */
  useEffect(() => {
    fetchActiveCategories();
  }, []);

  /* ── rotate coupons ── */
  useEffect(() => {
    if (!coupons.length) return;
    const id = setInterval(
      () => setActiveCouponIndex((p) => (p + 1) % coupons.length),
      3500
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
    return () => { document.body.style.overflow = "unset"; };
  }, [mobileMenuOpen]);

  /* ── build category slug ── */
  const catSlug = (cat) => `/collections/${cat.slug}`;

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
                ✨ Free Delivery on Orders Above ₹500 | Authentic Paan Experience
              </p>
            )}
          </AnimatePresence>
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

              {/* Desktop nav — dynamic categories */}
              <nav className="hidden lg:flex items-center gap-1">
                {categories.map((cat) =>
                  cat.children?.length > 0 ? (
                    <NavDropdown
                      key={cat._id}
                      label={cat.name}
                      items={cat.children}
                      rootSlug={catSlug(cat)}
                      open={openMenu === cat._id}
                      onOpen={() => setOpenMenu(cat._id)}
                      onClose={() => setOpenMenu(null)}
                    />
                  ) : (
                    <NavLink key={cat._id} href={catSlug(cat)}>
                      {cat.name}
                    </NavLink>
                  )
                )}

                {/* Static links */}
                <NavLink href="/create-your-paan">Create Your Paan</NavLink>
                <NavLink href="/our-story">Our Story</NavLink>
                <NavLink href="/journal">Journal</NavLink>
                <NavLink href="/experiences">Experiences</NavLink>
                <NavLink href="/get-in-touch">Contact</NavLink>
              </nav>

              {/* Right icons */}
              <div className="flex items-center gap-1 md:gap-2">
                <IconButton icon={Search} label="Search" onClick={() => router.push("/search")} />

                {/* User menu */}
                <div
                  className="relative"
                  onMouseEnter={() => isAuthenticated && setOpenMenu("user")}
                  onMouseLeave={() => setOpenMenu(null)}
                >
                  {!isAuthenticated ? (
                    <IconButton icon={User} label="Account" onClick={() => router.push("/login")} />
                  ) : (
                    <button
                      className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center bg-linear-to-br from-[#2d5016] to-[#3d6820] text-white font-semibold text-sm hover:ring-2 hover:ring-[#d4af37] transition-all"
                      aria-label="User menu"
                    >
                      {user?.profile_image ? (
                        <Image src={user.profile_image} alt={user.full_name} width={36} height={36} className="object-cover w-full h-full" />
                      ) : (
                        <span className="uppercase">{user?.full_name?.charAt(0)}</span>
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
                        className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden"
                      >
                        <div className="px-4 py-3 bg-linear-to-br from-[#2d5016]/5 to-[#d4af37]/5 border-b border-gray-100">
                          <p className="text-sm font-bold text-gray-900 truncate">{user.full_name}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
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
                  badge={cartCount > 0 ? cartCount : null}
                  onClick={() => router.push("/cart")}
                />

                {/* Mobile menu toggle */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition text-gray-900"
                  aria-label="Toggle menu"
                >
                  {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <MobileMenu
            categories={categories}
            catSlug={catSlug}
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
   NAV DROPDOWN
   — root category label + children list
=============================== */
function NavDropdown({ label, items, rootSlug, open, onOpen, onClose }) {
  return (
    <div className="relative" onMouseEnter={onOpen} onMouseLeave={onClose}>
      <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-[#2d5016] transition-colors rounded-lg hover:bg-gray-50 flex items-center gap-1">
        {label}
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4" />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 top-full mt-2 w-60 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden"
          >
            {/* "View all" link for root */}
            <Link
              href={rootSlug}
              className="flex items-center justify-between px-4 py-3 text-sm font-bold text-[#2d5016] border-b border-gray-100 hover:bg-[#2d5016]/5 transition-colors"
            >
              <span>All {label}</span>
              <ChevronRight className="w-4 h-4" />
            </Link>

            {/* Children */}
            <div className="py-1.5">
              {items.map((child, index) => (
                <motion.div
                  key={child._id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.04 }}
                >
                  <Link
                    href={`/collections/${child.slug}`}
                    className="group flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 hover:text-[#2d5016] hover:bg-linear-to-r hover:from-[#2d5016]/5 hover:to-transparent transition-all"
                  >
                    <span className="font-medium">{child.name}</span>
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
function MobileMenu({ categories, catSlug, onClose, isAuthenticated, user, logout }) {
  const [expandedId, setExpandedId] = useState(null);
  const router = useRouter();

  const toggle = (id) => setExpandedId((prev) => (prev === id ? null : id));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 lg:hidden"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

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
            <Image src="/paan-logo.png" alt="Paanshala" width={100} height={30} className="w-24 h-auto" />
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User card */}
          {isAuthenticated && user && (
            <div className="mb-6 p-4 bg-linear-to-br from-[#2d5016]/5 to-[#d4af37]/5 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-linear-to-br from-[#2d5016] to-[#3d6820] text-white font-bold">
                  {user?.profile_image ? (
                    <Image src={user.profile_image} alt={user.full_name} width={48} height={48} className="object-cover w-full h-full" />
                  ) : (
                    <span className="uppercase text-lg">{user?.full_name?.charAt(0)}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{user.full_name}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="space-y-0.5">

            {/* Dynamic categories */}
            {categories.map((cat) =>
              cat.children?.length > 0 ? (
                <MobileAccordion
                  key={cat._id}
                  title={cat.name}
                  rootSlug={catSlug(cat)}
                  items={cat.children}
                  expanded={expandedId === cat._id}
                  onToggle={() => toggle(cat._id)}
                  onClose={onClose}
                />
              ) : (
                <MobileLink key={cat._id} href={catSlug(cat)} onClick={onClose}>
                  {cat.name}
                </MobileLink>
              )
            )}

            {/* Static links */}
            <div className="pt-1 border-t border-gray-100 mt-2 space-y-0.5">
              <MobileLink href="/create-your-paan" onClick={onClose}>Create Your Paan</MobileLink>
              <MobileLink href="/our-story" onClick={onClose}>Our Story</MobileLink>
              <MobileLink href="/journal" onClick={onClose}>Journal</MobileLink>
              <MobileLink href="/experiences" onClick={onClose}>Experiences</MobileLink>
              <MobileLink href="/get-in-touch" onClick={onClose}>Contact</MobileLink>
            </div>

            {/* Auth links */}
            {isAuthenticated ? (
              <div className="pt-1 border-t border-gray-100 mt-2 space-y-0.5">
                <MobileLink href="/orders" onClick={onClose}>My Orders</MobileLink>
                <MobileLink href="/wishlist" onClick={onClose}>Wishlist</MobileLink>
                <MobileLink href="/profile" onClick={onClose}>Profile</MobileLink>
                <button
                  onClick={() => { logout(); onClose(); }}
                  className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-lg transition font-medium"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="pt-2 border-t border-gray-100 mt-2">
                <button
                  onClick={() => { router.push("/login"); onClose(); }}
                  className="w-full px-4 py-3 bg-linear-to-r from-[#2d5016] to-[#3d6820] text-white text-sm font-semibold rounded-lg hover:opacity-90 transition"
                >
                  Login / Sign Up
                </button>
              </div>
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
function MobileAccordion({ title, rootSlug, items, expanded, onToggle, onClose }) {
  return (
    <div className={cn("rounded-lg overflow-hidden transition-colors", expanded && "bg-gray-50")}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 text-gray-900 hover:bg-gray-50 rounded-lg transition"
      >
        <span className="font-medium text-sm">{title}</span>
        <motion.span animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-5 h-5 text-gray-500" />
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
              {/* "View all" for root */}
              <Link
                href={rootSlug}
                onClick={onClose}
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-[#2d5016] hover:bg-[#2d5016]/5 rounded-lg transition"
              >
                <ChevronRight className="w-3.5 h-3.5" />
                All {title}
              </Link>

              {items.map((child) => (
                <Link
                  key={child._id}
                  href={`/collections/${child.slug}`}
                  onClick={onClose}
                  className="flex items-center justify-between px-6 py-2.5 text-sm text-gray-600 hover:text-[#2d5016] hover:bg-gray-100 rounded-lg transition group"
                >
                  <span>{child.name}</span>
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
      className="block px-4 py-3 text-sm font-medium text-gray-700 hover:text-[#2d5016] hover:bg-gray-50 rounded-lg transition"
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