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
  LayoutGrid,
  ShoppingCart,
  MessageCircle,
  Star,
  Megaphone,
  Hotel,
  LucideVideotape,
} from "lucide-react";
import { useState } from "react";

import { useUserStore } from "@/stores/useUserStore";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

/* ── Grouped nav structure — each group gets a quiet label, not its own icon noise ── */
const navGroups = [
  {
    label: null, // ungrouped — top-level
    items: [{ name: "Dashboard", href: "/admin", icon: LayoutDashboard }],
  },
  {
    label: "Catalog",
    items: [
      { name: "Categories", href: "/admin/categories", icon: LayoutGrid },
      { name: "Products", href: "/admin/products", icon: Package },
      { name: "Reviews", href: "/admin/reviews", icon: Star },
      { name: "Shop By Video", href: "/admin/shop-by-video", icon: Video },
    ],
  },
  {
    label: "Sales",
    items: [
      { name: "Orders", href: "/admin/orders", icon: ShoppingBag },
      { name: "User Cart", href: "/admin/cart", icon: ShoppingCart },
      { name: "Coupons", href: "/admin/coupons", icon: TicketPercent },
    ],
  },
  {
    label: "Content",
    items: [
      { name: "Announcements", href: "/admin/announcement", icon: Megaphone },
      { name: "Blogs", href: "/admin/blogs", icon: FileText },
      { name: "Video Banners", href: "/admin/video-banners", icon: LucideVideotape },
      { name: "Horeca Page", href: "/admin/horeca-page", icon: Hotel },
    ],
  },
  {
    label: "System",
    items: [
      { name: "Page Settings", href: "/admin/page-settings", icon: Settings },
      { name: "Contacts", href: "/admin/contacts", icon: MessageCircle },
      { name: "Users", href: "/admin/users", icon: Users },
    ],
  },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useUserStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const userPermissions = user?.permissions || [];
  const isSuperAdmin = userPermissions.length === 0;

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  const visibleGroups = navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        const permKey = item.href.replace("/admin/", "") || "dashboard";
        if (isSuperAdmin) return true;
        return userPermissions.includes(permKey);
      }),
    }))
    .filter((group) => group.items.length > 0);

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

      {/* SIDEBAR */}
      <aside
        className={cn(
          "fixed lg:sticky top-0 h-screen w-72 z-50 lg:z-0",
          "bg-[#12351a] text-white flex flex-col",
          "shadow-2xl",
          "transition-transform duration-300 ease-in-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* CLOSE BUTTON (MOBILE) */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(false)}
          className="absolute top-3.5 right-3.5 lg:hidden text-white/70 hover:bg-white/10 hover:text-white z-10"
        >
          <X className="w-4.5 h-4.5" />
        </Button>

        {/* LOGO */}
        <div className="h-20 flex items-center px-6 border-b border-white/10 shrink-0">
          <Image
            src="/paan-logo.png"
            alt="Paanshala"
            width={120}
            height={36}
            className="object-contain brightness-0 invert opacity-90"
          />
        </div>

        {/* USER PROFILE — compact single row */}
        <div className="px-5 py-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 shrink-0">
              <AvatarImage src={user?.profile_image} />
              <AvatarFallback className="bg-white/10 text-white text-xs font-semibold">
                {getInitials(user?.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate leading-tight">
                {user?.full_name || "Admin User"}
              </p>
              <p className="text-xs text-white/45 truncate leading-tight mt-0.5">
                {isSuperAdmin ? "Super Admin" : "Admin"}
              </p>
            </div>
          </div>
        </div>

        {/* NAVIGATION — grouped, quiet section labels */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto custom-scrollbar">
          {visibleGroups.map((group, gIndex) => (
            <div key={group.label || "top"} className={cn(gIndex > 0 && "mt-5")}>
              {group.label && (
                <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/35">
                  {group.label}
                </p>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.name}
                      onClick={() => {
                        router.push(item.href);
                        setSidebarOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors duration-150",
                        isActive
                          ? "bg-white/10 text-white font-medium"
                          : "text-white/60 hover:text-white hover:bg-white/5",
                      )}
                    >
                      <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-[#d4af37]" : "text-white/40")} />
                      <span className="truncate">{item.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* FOOTER — profile + logout */}
        <div className="p-3 border-t border-white/10 space-y-0.5 shrink-0">
          <button
            onClick={() => {
              router.push("/admin/profile");
              setSidebarOpen(false);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-white/60 hover:bg-white/5 hover:text-white transition-colors"
          >
            <User className="w-4 h-4 text-white/40 shrink-0" />
            My Profile
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-300/80 hover:bg-red-500/10 hover:text-red-300 transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
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
            <Menu className="w-5 h-5" />
          </Button>
          <div className="bg-[#12351a] px-4 py-1.5 rounded-lg">
            <Image
              src="/paan-logo.png"
              alt="Paanshala"
              width={90}
              height={32}
              className="object-contain brightness-0 invert"
            />
          </div>
          <div className="w-9" />
        </header>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 xl:p-10 overflow-y-auto">
          <div className="max-w-450 mx-auto">{children}</div>
        </main>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.12);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}