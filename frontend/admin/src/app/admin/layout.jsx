"use client";

import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  Video,
  ShoppingBag,
  TicketPercent,
  FileText,
  Settings,
  Users,
  User,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

import { useUserStore } from "@/stores/useUserStore";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Shop By Video", href: "/admin/shop-by-video", icon: Video },
  { name: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { name: "Coupons", href: "/admin/coupons", icon: TicketPercent },
  { name: "Blogs", href: "/admin/blogs", icon: FileText },
  { name: "Page Settings", href: "/admin/page-settings", icon: Settings },
  { name: "Users", href: "/admin/users", icon: Users },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useUserStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  // Get user initials
  const getInitials = (name) => {
    if (!name) return "AD";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex min-h-screen bg-linear-to-br from-[#f6f2e9] via-[#f8f4ec] to-[#faf6ef]">
      {/* MOBILE OVERLAY */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* SIDEBAR - Always visible on desktop, slide-in on mobile */}
      <aside
        className={cn(
          "fixed lg:sticky top-0 h-screen w-80 z-50 lg:z-0",
          "bg-linear-to-b from-[#0d2915] via-[#12351a] to-[#0b1f11]",
          "text-white flex flex-col",
          "shadow-2xl",
          "transition-transform duration-300 ease-in-out",
          // Mobile: translate based on state, Desktop: always visible
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* CLOSE BUTTON (MOBILE ONLY) */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(false)}
          className="absolute top-4 right-4 lg:hidden text-white hover:bg-white/10 z-10"
        >
          <X className="w-5 h-5" />
        </Button>

        {/* LOGO SECTION */}
        <div className="h-24 flex items-center justify-center border-b border-white/10 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#d4af37] rounded-full blur-3xl" />
          </div>

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-[#f6f2e9] px-6 py-3 rounded-xl shadow-2xl relative z-10"
          >
            <Image
              src="/paan-logo.png"
              alt="Paanshala"
              width={160}
              height={60}
              className="object-contain"
            />
          </motion.div>
        </div>

        {/* USER PROFILE SECTION */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="p-6 border-b border-white/10"
        >
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14 border-2 border-[#d4af37]/50 shadow-lg">
              <AvatarImage src={user?.profile_image} />
              <AvatarFallback className="bg-linear-to-br from-[#d4af37] to-[#b8941f] text-[#12351a] font-bold text-lg">
                {getInitials(user?.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white truncate">
                {user?.full_name || "Admin User"}
              </h3>
              <p className="text-xs text-white/60 truncate">
                {user?.email || "admin@paanshala.com"}
              </p>
              <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-[#d4af37]/20 text-[#d4af37] rounded-full border border-[#d4af37]/30">
                Administrator
              </span>
            </div>
          </div>
        </motion.div>

        {/* NAVIGATION */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item, index) => {
            const isActive = pathname === item.href;

            const Icon = item.icon;

            return (
              <motion.button
                key={item.name}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 * index }}
                onClick={() => {
                  router.push(item.href);
                  setSidebarOpen(false);
                }}
                className={cn(
                  "w-full flex items-center justify-between group px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-300 relative overflow-hidden",
                  isActive
                    ? "bg-linear-to-r from-white/15 to-white/5 text-white shadow-lg"
                    : "text-white/70 hover:text-white hover:bg-white/5",
                )}
              >
                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#d4af37] rounded-r-full"
                  />
                )}

                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "p-2 rounded-lg transition-all duration-300",
                      isActive
                        ? "bg-[#d4af37]/20 text-[#d4af37]"
                        : "bg-white/5 text-white/70 group-hover:bg-white/10 group-hover:text-white",
                    )}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span>{item.name}</span>
                </div>

                <ChevronRight
                  className={cn(
                    "w-4 h-4 transition-all duration-300",
                    isActive
                      ? "opacity-100 translate-x-0"
                      : "opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0",
                  )}
                />
              </motion.button>
            );
          })}
        </nav>

        {/* PROFILE & LOGOUT */}
        <div className="p-4 border-t border-white/10 space-y-2">
          <button
            onClick={() => {
              router.push("/admin/profile");
              setSidebarOpen(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/80 hover:bg-white/5 hover:text-white transition-all group"
          >
            <div className="p-2 rounded-lg bg-white/5 group-hover:bg-white/10 transition-all">
              <User className="w-4 h-4" />
            </div>
            My Profile
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-300 hover:bg-red-500/10 hover:text-red-400 transition-all group"
          >
            <div className="p-2 rounded-lg bg-red-500/5 group-hover:bg-red-500/20 transition-all">
              <LogOut className="w-4 h-4" />
            </div>
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* MOBILE HEADER */}
        <header className="lg:hidden sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-xl border-b border-gray-200 px-4 flex items-center justify-between shadow-sm">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="text-[#12351a] hover:bg-[#12351a]/10"
          >
            <Menu className="w-6 h-6" />
          </Button>
          {/* Mobile Logo - with better contrast */}
          <div className="bg-linear-to-br from-[#12351a] to-[#0f2916] px-5 py-2 rounded-xl shadow-lg">
            <Image
              src="/paan-logo.png"
              alt="Paanshala"
              width={100}
              height={40}
              className="object-contain brightness-0 invert"
            />
          </div>
          <div className="w-10" /> {/* Spacer for centering */}
        </header>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 xl:p-10 overflow-y-auto">
          <div className="max-w-450 mx-auto">{children}</div>
        </main>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  );
}
