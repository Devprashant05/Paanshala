"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  Users,
  CheckCircle,
  Clock,
  Loader2,
  Search,
  X,
  MessageSquare,
  PartyPopper,
  InboxIcon,
  Building2,
  UtensilsCrossed,
  Trash2,
  AlertTriangle,
  Package,
  Sparkles,
} from "lucide-react";
import { useContactStore } from "@/stores/useContactStore";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "all", label: "All", icon: InboxIcon },
  { id: "contact", label: "Messages", icon: MessageSquare },
  { id: "event", label: "Event Bookings", icon: PartyPopper },
  { id: "horeca", label: "HoReCa", icon: UtensilsCrossed },
  { id: "paanThaal", label: "Paan Thaal", icon: Sparkles },
];

const STATUS = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "read", label: "Read" },
];

export default function AdminContactsPage() {
  const {
    contacts,
    loading,
    fetchAllContactsAdmin,
    markContactAsRead,
    deleteSingleContact,
    deleteAllContacts,
  } = useContactStore();

  const [activeTab, setActiveTab] = useState("all");
  const [activeStatus, setActiveStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchAllContactsAdmin();
  }, []);

  /* ── filter ── */
  const filtered = contacts.filter((c) => {
    if (activeTab !== "all" && c.type !== activeTab) return false;
    if (activeStatus === "unread" && c.isRead) return false;
    if (activeStatus === "read" && !c.isRead) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        c.fullName?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.phone?.includes(q) ||
        c.message?.toLowerCase().includes(q) ||
        c.eventLocation?.toLowerCase().includes(q) ||
        c.businessName?.toLowerCase().includes(q) ||
        c.city?.toLowerCase().includes(q) ||
        c.preferredTime?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const unreadCount = contacts.filter((c) => !c.isRead).length;

  const handleExpand = async (c) => {
    setExpanded((prev) => (prev?._id === c._id ? null : c));
    if (!c.isRead) await markContactAsRead(c._id);
  };

  return (
    <div className="space-y-7 max-w-5xl">
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#2d5016] mb-1">
              Admin Panel
            </p>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
              Contacts
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Messages, event, HoReCa &amp; Paan Thaal requests
            </p>
          </div>
          {unreadCount > 0 && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-4 py-2 rounded-full">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-xs font-semibold text-amber-700">
                {unreadCount} unread
              </span>
            </div>
          )}
          <button
            onClick={async () => {
              const confirmDelete = window.confirm(
                "Are you sure you want to delete all contacts?",
              );

              if (!confirmDelete) return;

              try {
                setDeleteLoading(true);
                await deleteAllContacts();
              } finally {
                setDeleteLoading(false);
              }
            }}
            disabled={deleteLoading || contacts.length === 0}
            className="inline-flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
          >
            {deleteLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            Delete All
          </button>
        </div>
      </motion.div>

      {/* ── Filters ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-4"
      >
        {/* Type tabs */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {TABS.map((tab) => {
            const count =
              tab.id === "all"
                ? contacts.length
                : contacts.filter((c) => c.type === tab.id).length;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all border",
                  activeTab === tab.id
                    ? "bg-[#2d5016] text-white border-[#2d5016] shadow-sm"
                    : "bg-white text-gray-600 border-gray-200 hover:border-[#2d5016]/30",
                )}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
                <span
                  className={cn(
                    "text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                    activeTab === tab.id
                      ? "bg-white/20 text-white"
                      : "bg-gray-100 text-gray-500",
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Status + Search row */}
        <div className="flex gap-3 flex-wrap">
          {/* Status pills */}
          <div className="flex gap-1.5">
            {STATUS.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveStatus(s.id)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border",
                  activeStatus === s.id
                    ? "bg-[#2d5016]/10 text-[#2d5016] border-[#2d5016]/30"
                    : "bg-white text-gray-500 border-gray-200 hover:border-gray-300",
                )}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, phone…"
              className="w-full pl-8 pr-8 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2d5016]/20 focus:border-[#2d5016]"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* ── List ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-7 h-7 animate-spin text-[#2d5016]" />
            <p className="text-sm text-gray-400">Loading contacts…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 bg-white rounded-2xl border border-gray-100">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
              <InboxIcon className="w-7 h-7 text-gray-300" />
            </div>
            <p className="font-semibold text-gray-600">
              {search ? `No results for "${search}"` : "No contacts yet"}
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filtered.map((c, i) => (
              <ContactCard
                key={c._id}
                contact={c}
                index={i}
                isExpanded={expanded?._id === c._id}
                onToggle={() => handleExpand(c)}
                onDelete={async () => {
                  const confirmDelete = window.confirm(
                    "Delete this contact permanently?",
                  );

                  if (!confirmDelete) return;

                  await deleteSingleContact(c._id);
                }}
              />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════
   CONTACT CARD
═══════════════════════════ */
function ContactCard({ contact: c, index, isExpanded, onToggle, onDelete }) {
  /* ── per-type config ── */
  const typeConfig = {
    contact: {
      icon: <MessageSquare className="w-4 h-4" />,
      bg: "bg-blue-100 text-blue-600",
      label: "Message",
      preview: c.message?.slice(0, 80) || "—",
    },
    event: {
      icon: <PartyPopper className="w-4 h-4" />,
      bg: "bg-purple-100 text-purple-600",
      label: "Event",
      preview: `${c.eventLocation || "—"} · ${c.gathering ? `${c.gathering} guests` : ""}`,
    },
    horeca: {
      icon: <UtensilsCrossed className="w-4 h-4" />,
      bg: "bg-emerald-100 text-emerald-600",
      label: "HoReCa",
      preview: `${c.businessName || "—"} · ${c.businessType || ""} · ${c.city || ""}`,
    },
    paanThaal: {
      icon: <Sparkles className="w-4 h-4" />,
      bg: "bg-amber-100 text-amber-600",
      label: "Paan Thaal",
      preview: `${c.thaalQuantity ? `${c.thaalQuantity} thaal(s)` : "—"} · ${
        c.preferredDate
          ? new Date(c.preferredDate).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
            })
          : ""
      } ${c.preferredTime || ""}`,
    },
  };
  const cfg = typeConfig[c.type] ?? typeConfig.contact;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className={cn(
        "bg-white rounded-2xl border transition-all duration-200 overflow-hidden",
        isExpanded
          ? "border-[#2d5016]/30 shadow-md"
          : c.isRead
            ? "border-gray-100 shadow-sm hover:border-gray-200"
            : "border-amber-200 shadow-sm hover:border-amber-300 bg-amber-50/30",
      )}
    >
      {/* ── Summary row ── */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 px-5 py-4 text-left"
      >
        {/* Type badge */}
        <div
          className={cn(
            "shrink-0 w-9 h-9 rounded-xl flex items-center justify-center",
            cfg.bg,
          )}
        >
          {cfg.icon}
        </div>

        {/* Name + preview */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-bold text-sm text-gray-900">{c.fullName}</p>
            {!c.isRead && (
              <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
            )}
            <span
              className={cn(
                "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
                cfg.bg,
              )}
            >
              {cfg.label}
            </span>
          </div>
          <p className="text-xs text-gray-400 truncate mt-0.5">{cfg.preview}</p>
        </div>

        {/* Meta */}
        <div className="hidden sm:flex flex-col items-end gap-1 shrink-0">
          <span className="text-[10px] text-gray-400">
            {new Date(c.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
          <span
            className={cn(
              "text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1",
              c.isRead
                ? "bg-green-50 text-green-600"
                : "bg-amber-50 text-amber-600",
            )}
          >
            {c.isRead ? (
              <>
                <CheckCircle className="w-2.5 h-2.5" />
                Read
              </>
            ) : (
              <>
                <Clock className="w-2.5 h-2.5" />
                Unread
              </>
            )}
          </span>
        </div>

        {/* Chevron */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Delete */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="w-8 h-8 rounded-full bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {/* Chevron */}
          <div
            className={cn(
              "w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center transition-transform",
              isExpanded && "rotate-180",
            )}
          >
            <svg
              className="w-3.5 h-3.5 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </button>

      {/* ── Expanded detail ── */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-1 border-t border-gray-100 bg-gray-50/50">
              {c.type === "event" ? (
                <EventDetail c={c} />
              ) : c.type === "horeca" ? (
                <HorecaDetail c={c} />
              ) : c.type === "paanThaal" ? (
                <PaanThaalDetail c={c} />
              ) : (
                <MessageDetail c={c} />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ── Contact message detail ── */
function MessageDetail({ c }) {
  return (
    <div className="pt-4 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <InfoChip
          icon={<Mail className="w-3.5 h-3.5" />}
          label="Email"
          value={
            <a
              href={`mailto:${c.email}`}
              className="text-[#2d5016] hover:underline"
            >
              {c.email}
            </a>
          }
        />
        <InfoChip
          icon={<Phone className="w-3.5 h-3.5" />}
          label="Phone"
          value={
            <a href={`tel:${c.phone}`} className="hover:text-[#2d5016]">
              {c.phone}
            </a>
          }
        />
        <InfoChip
          icon={<Clock className="w-3.5 h-3.5" />}
          label="Received"
          value={new Date(c.createdAt).toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        />
      </div>
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
          Message
        </p>
        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
          {c.message || "—"}
        </p>
      </div>
      <a
        href={`mailto:${c.email}?subject=Re: Your message to Paanshala`}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2d5016] hover:bg-[#3d6820] text-white text-sm font-semibold rounded-full transition-colors"
      >
        <Mail className="w-4 h-4" />
        Reply via Email
      </a>
    </div>
  );
}

/* ── Event booking detail ── */
function EventDetail({ c }) {
  return (
    <div className="pt-4 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <InfoChip
          icon={<Phone className="w-3.5 h-3.5" />}
          label="Phone"
          value={
            <a href={`tel:${c.phone}`} className="hover:text-[#2d5016]">
              {c.phone}
            </a>
          }
        />
        <InfoChip
          icon={<Calendar className="w-3.5 h-3.5" />}
          label="Event Date"
          value={
            c.eventDate
              ? new Date(c.eventDate).toLocaleDateString("en-IN", {
                  dateStyle: "long",
                })
              : "—"
          }
        />
        <InfoChip
          icon={<MapPin className="w-3.5 h-3.5" />}
          label="Location"
          value={c.eventLocation || "—"}
        />
        <InfoChip
          icon={<Users className="w-3.5 h-3.5" />}
          label="Expected Guests"
          value={c.gathering ? `${c.gathering} people` : "—"}
        />
      </div>
      <InfoChip
        icon={<Clock className="w-3.5 h-3.5" />}
        label="Requested on"
        value={new Date(c.createdAt).toLocaleString("en-IN", {
          dateStyle: "medium",
          timeStyle: "short",
        })}
      />
      <a
        href={`tel:${c.phone}`}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2d5016] hover:bg-[#3d6820] text-white text-sm font-semibold rounded-full transition-colors"
      >
        <Phone className="w-4 h-4" />
        Call Back
      </a>
    </div>
  );
}

/* ── HoReCa inquiry detail ── */
function HorecaDetail({ c }) {
  return (
    <div className="pt-4 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <InfoChip
          icon={<Mail className="w-3.5 h-3.5" />}
          label="Email"
          value={
            <a
              href={`mailto:${c.email}`}
              className="text-[#2d5016] hover:underline break-all"
            >
              {c.email}
            </a>
          }
        />
        <InfoChip
          icon={<Phone className="w-3.5 h-3.5" />}
          label="Phone"
          value={
            <a href={`tel:${c.phone}`} className="hover:text-[#2d5016]">
              {c.phone}
            </a>
          }
        />
        <InfoChip
          icon={<Building2 className="w-3.5 h-3.5" />}
          label="Business"
          value={c.businessName || "—"}
        />
        <InfoChip
          icon={<UtensilsCrossed className="w-3.5 h-3.5" />}
          label="Type"
          value={c.businessType || "—"}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <InfoChip
          icon={<MapPin className="w-3.5 h-3.5" />}
          label="City"
          value={c.city || "—"}
        />
        <InfoChip
          icon={<Clock className="w-3.5 h-3.5" />}
          label="Received"
          value={new Date(c.createdAt).toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        />
      </div>
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
          Requirement
        </p>
        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
          {c.requirement || "—"}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <a
          href={`mailto:${c.email}?subject=Re: HoReCa Partnership Inquiry – Paanshala`}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2d5016] hover:bg-[#3d6820] text-white text-sm font-semibold rounded-full transition-colors"
        >
          <Mail className="w-4 h-4" />
          Reply via Email
        </a>
        <a
          href={`tel:${c.phone}`}
          className="inline-flex items-center gap-2 px-5 py-2.5 border border-[#2d5016] text-[#2d5016] hover:bg-[#2d5016] hover:text-white text-sm font-semibold rounded-full transition-colors"
        >
          <Phone className="w-4 h-4" />
          Call Back
        </a>
      </div>
    </div>
  );
}

/* ── Paan Thaal customization detail ── */
function PaanThaalDetail({ c }) {
  const formattedTime = (() => {
    if (!c.preferredTime) return "—";
    const [h, m] = c.preferredTime.split(":").map(Number);
    if (Number.isNaN(h)) return c.preferredTime;
    const period = h >= 12 ? "PM" : "AM";
    const dh = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return `${dh}:${String(m).padStart(2, "0")} ${period}`;
  })();

  return (
    <div className="pt-4 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <InfoChip
          icon={<Mail className="w-3.5 h-3.5" />}
          label="Email"
          value={
            <a
              href={`mailto:${c.email}`}
              className="text-[#2d5016] hover:underline break-all"
            >
              {c.email}
            </a>
          }
        />
        <InfoChip
          icon={<Phone className="w-3.5 h-3.5" />}
          label="Phone"
          value={
            <a href={`tel:${c.phone}`} className="hover:text-[#2d5016]">
              {c.phone}
            </a>
          }
        />
        <InfoChip
          icon={<Package className="w-3.5 h-3.5" />}
          label="Thaal Quantity"
          value={c.thaalQuantity ? `${c.thaalQuantity} thaal(s)` : "—"}
        />
        <InfoChip
          icon={<Clock className="w-3.5 h-3.5" />}
          label="Received"
          value={new Date(c.createdAt).toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <InfoChip
          icon={<Calendar className="w-3.5 h-3.5" />}
          label="Preferred Date"
          value={
            c.preferredDate
              ? new Date(c.preferredDate).toLocaleDateString("en-IN", {
                  dateStyle: "long",
                })
              : "—"
          }
        />
        <InfoChip
          icon={<Clock className="w-3.5 h-3.5" />}
          label="Preferred Time"
          value={formattedTime}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <a
          href={`mailto:${c.email}?subject=Re: Your Paan Thaal Request – Paanshala`}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2d5016] hover:bg-[#3d6820] text-white text-sm font-semibold rounded-full transition-colors"
        >
          <Mail className="w-4 h-4" />
          Reply via Email
        </a>
        <a
          href={`tel:${c.phone}`}
          className="inline-flex items-center gap-2 px-5 py-2.5 border border-[#2d5016] text-[#2d5016] hover:bg-[#2d5016] hover:text-white text-sm font-semibold rounded-full transition-colors"
        >
          <Phone className="w-4 h-4" />
          Call Back
        </a>
      </div>
    </div>
  );
}

/* ── Info chip ── */
function InfoChip({ icon, label, value }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 px-3.5 py-3">
      <div className="flex items-center gap-1.5 text-gray-400 mb-1">
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-widest">
          {label}
        </span>
      </div>
      <div className="text-sm font-semibold text-gray-800">{value}</div>
    </div>
  );
}
