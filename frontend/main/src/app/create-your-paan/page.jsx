"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { useProductStore } from "@/stores/useProductStore";
import { useCartStore } from "@/stores/useCartStore";
import { useUserStore } from "@/stores/useUserStore";
import { useGuestCartStore } from "@/stores/useGuestCartStore";
import { useCategoryStore } from "@/stores/useCategoryStore";
import { ShoppingBag, X, Sparkles, Package, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCartUIStore } from "@/stores/useCartUIStore";
import { useScheduleStore } from "@/stores/useScheduleStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar, AlertTriangle, CheckCircle } from "lucide-react";

const BOX_SIZES_PAAN = [
  { size: 6, label: "6 Pack" },
  { size: 12, label: "12 Pack" },
  { size: 24, label: "24 Pack" },
];

const BOX_SIZES_NON_PAAN = [
  { size: 4, label: "4 Pack" },
  { size: 8, label: "8 Pack" },
  { size: 12, label: "12 Pack" },
];

export default function CreateYourPaanPage() {
  const { filteredProducts, filterProducts, loading } = useProductStore();
  const { addToCart } = useCartStore();
  const { isAuthenticated } = useUserStore();
  const { addItem: addGuestItem } = useGuestCartStore();
  const { comboCategories, fetchComboCategories } = useCategoryStore();
  const { openCart } = useCartUIStore();
  const { scheduledDate, scheduledTime, setSchedule, clearSchedule } =
    useScheduleStore();

  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [activeChildId, setActiveChildId] = useState(null);
  const [boxSize, setBoxSize] = useState(6);
  const [selectedItems, setSelectedItems] = useState([]);

  // ── Scheduling state ──
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);

  /* ── load categories ── */
  useEffect(() => {
    fetchComboCategories();
  }, []);

  /* ── auto-select first root ── */
  useEffect(() => {
    if (comboCategories.length > 0 && !activeCategoryId) {
      setActiveCategoryId(comboCategories[0]._id);
    }
  }, [comboCategories]);

  /* ── fetch products whenever tab or child changes ── */
  useEffect(() => {
    if (!activeCategoryId) return;
    const root = comboCategories.find((c) => c._id === activeCategoryId);
    const hasChildren = (root?.children?.length ?? 0) > 0;
    if (activeChildId) {
      filterProducts({ category: activeChildId });
    } else if (hasChildren) {
      filterProducts({ parentCategory: activeCategoryId });
    } else {
      filterProducts({ category: activeCategoryId });
    }
  }, [activeCategoryId, activeChildId, comboCategories]);

  /* ── locally-filtered products ── */
  const visibleProducts = useMemo(() => {
    if (!filteredProducts.length || !activeCategoryId) return filteredProducts;
    return filteredProducts.filter((p) => {
      const pCatId = p.category?._id ?? p.category;
      const pParentId = p.parentCategory?._id ?? p.parentCategory;
      if (activeChildId) return pCatId === activeChildId;
      const root = comboCategories.find((c) => c._id === activeCategoryId);
      const hasChildren = (root?.children?.length ?? 0) > 0;
      if (hasChildren) return pParentId === activeCategoryId;
      return pCatId === activeCategoryId;
    });
  }, [filteredProducts, activeCategoryId, activeChildId, comboCategories]);

  const activeRoot = comboCategories.find((c) => c._id === activeCategoryId);

  /* ── detect if current tab needs scheduling ── */
  const isSchedulingCategory =
    activeRoot?.requiresScheduling ||
    activeRoot?.name?.toLowerCase().includes("paan");

  /* ── reset box when switching between paan / non-paan ── */
  useEffect(() => {
    const newIsPaan =
      activeRoot?.name?.toLowerCase().includes("paan") ||
      visibleProducts.some((p) => p.isPaan);
    const sizes = newIsPaan ? BOX_SIZES_PAAN : BOX_SIZES_NON_PAAN;
    if (!sizes.find((s) => s.size === boxSize)) {
      setBoxSize(sizes[0].size);
      setSelectedItems([]);
    }
  }, [activeCategoryId, visibleProducts.length]);

  const handleRootTabClick = (id) => {
    if (id === activeCategoryId) return;
    setActiveCategoryId(id);
    setActiveChildId(null);
  };

  /* ── add / remove items ── */
  const addItem = (product, variantSetSize) => {
    if (selectedItems.length >= boxSize) {
      toast.error(`Your box is full! Maximum ${boxSize} items allowed.`);
      return;
    }
    setSelectedItems((prev) => [
      ...prev,
      {
        product,
        variantSetSize: variantSetSize || null,
        id: `${product._id}-${variantSetSize || "default"}-${Date.now()}`,
      },
    ]);
    toast.success(`${product.name} added!`);
  };

  const removeItem = (id) =>
    setSelectedItems((prev) => prev.filter((i) => i.id !== id));

  /* ── total ── */
  const totalAmount = useMemo(
    () =>
      selectedItems.reduce((sum, item) => {
        if (item.variantSetSize) {
          const v = item.product.variants?.find(
            (v) => v.setSize === item.variantSetSize,
          );
          return sum + (v?.discountedPrice || 0);
        }
        return sum + (item.product.discountedPrice || 0);
      }, 0),
    [selectedItems],
  );

  /* ── add all to cart ── */
  const handleAddAllToCart = async () => {
    if (selectedItems.length === 0) {
      toast.error("Please add items to your box first!");
      return;
    }
    if (selectedItems.length < boxSize) {
      const diff = boxSize - selectedItems.length;
      toast.error(
        `Add ${diff} more item${diff > 1 ? "s" : ""} to complete your ${boxSize}-pack!`,
      );
      return;
    }

    // If this is a scheduling category and no date/time selected, open modal first
    if (isSchedulingCategory && (!scheduledDate || !scheduledTime)) {
      setScheduleModalOpen(true);
      return;
    }

    if (isAuthenticated) {
      for (const item of selectedItems) {
        await addToCart({
          productId: item.product._id,
          quantity: 1,
          variantSetSize: item.variantSetSize,
        });
      }
      openCart();
    } else {
      for (const item of selectedItems) {
        const matchedVariant = item.variantSetSize
          ? item.product.variants?.find(
              (v) => v.setSize === item.variantSetSize,
            )
          : null;
        const price = matchedVariant
          ? matchedVariant.discountedPrice || 0
          : item.product.discountedPrice || 0;
        const origPrice = matchedVariant
          ? matchedVariant.originalPrice || 0
          : item.product.originalPrice || 0;
        addGuestItem({
          productId: item.product._id,
          name: item.product.name,
          image: item.product.images?.[0] || null,
          price,
          originalPrice: origPrice,
          isPaan: item.product.isPaan,
          variantSetSize: item.variantSetSize || null,
          quantity: 1,
        });
      }
      openCart();
    }

    setSelectedItems([]);
    toast.success("Your custom paan box has been added to cart!");
  };;

  const activeChildren = activeRoot?.children || [];
  const filled = selectedItems.length;

  const isPaanCategory =
    activeRoot?.name?.toLowerCase().includes("paan") ||
    visibleProducts.some((p) => p.isPaan);

  const BOX_SIZES = isPaanCategory ? BOX_SIZES_PAAN : BOX_SIZES_NON_PAAN;

   const formatTime12hr = (time24) => {
     if (!time24) return "";
     const [h, m] = time24.split(":").map(Number);
     const period = h >= 12 ? "PM" : "AM";
     const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h;
     return `${displayH}:${String(m).padStart(2, "0")} ${period}`;
   };

  return (
    <div className="relative min-h-screen bg-[#f5f2eb] overflow-hidden">
      {/* ── HERO ── */}
      <div className="relative z-10 bg-linear-to-r from-[#264B0E] via-brand-green-dark to-[#264B0E] overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 bg-gold-bright rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#d4a574] rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 md:px-6 py-14 text-left">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-4">
              Create Your Perfect
              <span className="block text-gold-bright">Paan Bundle</span>
            </h1>
            <p className="text-white/80 text-base md:text-lg max-w-xl text-left">
              Pick your favourite paan, digestives and treats to build a
              personalised box that's uniquely yours.
            </p>
          </motion.div>
        </div>
      </div>

      {/* ── SCHEDULED BANNER — shows if date/time already selected ── */}
      <AnimatePresence>
        {scheduledDate && scheduledTime && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-[#264B0E] text-white px-4 py-3 flex items-center justify-center gap-2 text-sm font-medium"
          >
            <Clock className="w-4 h-4 shrink-0" />
            <span>
              Scheduled for{" "}
              <strong>
                {new Date(scheduledDate).toLocaleDateString("en-IN", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                })}
              </strong>{" "}
              at <strong>{formatTime12hr(scheduledTime)}</strong>
            </span>
            <button
              onClick={() => setScheduleModalOpen(true)}
              className="ml-1 underline text-white/80 hover:text-white text-xs"
            >
              Change
            </button>
            <button
              onClick={() => clearSchedule()}
              className="ml-1 opacity-70 hover:opacity-100"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── SECTION TITLE ── */}
      <div className="bg-white border-b border-gray-200 z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 text-center">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">
            Choose <span className="text-[#264B0E]">{boxSize} Packs</span> of
            Your Favourite Paanshala Products
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            To create your perfect bundle
          </p>
        </div>
      </div>

      {/* ── MAIN LAYOUT ── */}
      <div className="relative bg-[#f5f2eb] overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              "radial-gradient(rgba(45,80,22,0.14) 1.2px, transparent 1.2px)",
            backgroundSize: "26px 26px",
          }}
        />

        <div className="relative z-10 max-w-350 mx-auto px-4 md:px-6 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* LEFT — PRODUCTS */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden lg:h-[calc(100vh-150px)] flex flex-col">
              {comboCategories.length > 0 && (
                <div className="flex border-b border-gray-200 overflow-x-auto">
                  {comboCategories.map((cat) => (
                    <button
                      key={cat._id}
                      onClick={() => handleRootTabClick(cat._id)}
                      className={cn(
                        "flex-1 min-w-max px-5 py-4 text-sm font-semibold transition-all border-b-2 whitespace-nowrap",
                        activeCategoryId === cat._id
                          ? "border-[#264B0E] text-white bg-linear-to-r from-[#264B0E] to-brand-green-dark"
                          : "border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50",
                      )}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              )}

              {activeChildren.length > 0 && (
                <div className="flex gap-2 px-4 py-3 border-b border-gray-100 overflow-x-auto bg-gray-50/60">
                  <button
                    onClick={() => setActiveChildId(null)}
                    className={cn(
                      "shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border",
                      !activeChildId
                        ? "bg-[#264B0E] text-white border-[#264B0E]"
                        : "bg-white text-gray-500 border-gray-200 hover:border-[#264B0E]/40",
                    )}
                  >
                    All
                  </button>
                  {activeChildren.map((child) => (
                    <button
                      key={child._id}
                      onClick={() => setActiveChildId(child._id)}
                      className={cn(
                        "shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border whitespace-nowrap",
                        activeChildId === child._id
                          ? "bg-[#264B0E] text-white border-[#264B0E]"
                          : "bg-white text-gray-500 border-gray-200 hover:border-[#264B0E]/40",
                      )}
                    >
                      {child.name}
                    </button>
                  ))}
                </div>
              )}

              {/* Scheduling prompt inside product panel — only for scheduling categories */}
              {isSchedulingCategory && !scheduledDate && (
                <div className="mx-4 mt-4 p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-amber-800 font-medium mb-1.5">
                      Fresh paan requires scheduling — select a delivery date
                      and time before adding to cart.
                    </p>
                    <button
                      onClick={() => setScheduleModalOpen(true)}
                      className="text-xs font-bold text-[#264B0E] underline underline-offset-2 hover:text-[#3d6820]"
                    >
                      Select Date & Time →
                    </button>
                  </div>
                </div>
              )}

              <div className="p-5 flex-1 overflow-y-auto">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {loading &&
                    Array.from({ length: 6 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-72 rounded-2xl bg-gray-100 animate-pulse"
                      />
                    ))}

                  {!loading &&
                    visibleProducts.map((product, i) => (
                      <motion.div
                        key={product._id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <ProductCard
                          product={product}
                          onAdd={addItem}
                          disabled={filled >= boxSize}
                        />
                      </motion.div>
                    ))}

                  {!loading && visibleProducts.length === 0 && (
                    <div className="col-span-full flex flex-col items-center py-16 text-gray-400">
                      <Package className="w-12 h-12 mb-3 opacity-30" />
                      <p className="text-sm">No products in this category</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT — YOUR BOX */}
            <div className="lg:sticky lg:top-28">
              <YourBoxPanel
                boxSize={boxSize}
                setBoxSize={setBoxSize}
                boxSizes={BOX_SIZES}
                selectedItems={selectedItems}
                removeItem={removeItem}
                totalAmount={totalAmount}
                handleAddAllToCart={handleAddAllToCart}
                scheduledDate={scheduledDate}
                scheduledTime={scheduledTime}
                isSchedulingCategory={isSchedulingCategory}
                onOpenScheduleModal={() => setScheduleModalOpen(true)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── SCHEDULE MODAL ── */}
      <PaanScheduleModal
        isOpen={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        onConfirm={({ date, time }) => {
          setSchedule(date, time);
          setScheduleModalOpen(false);
          toast.success("Delivery scheduled!");
        }}
        existingDate={scheduledDate}
        existingTime={scheduledTime}
      />
    </div>
  );
}

/* ═══════════════════════════
   PRODUCT CARD
═══════════════════════════ */
function ProductCard({ product, onAdd, disabled }) {
  const isPaan = product.isPaan;
  const [variant, setVariant] = useState(
    isPaan ? product.variants?.[0]?.setSize : null,
  );

  const displayPrice =
    isPaan && variant
      ? product.variants?.find((v) => v.setSize === variant)?.discountedPrice
      : product.discountedPrice;

  const originalPrice =
    isPaan && variant
      ? product.variants?.find((v) => v.setSize === variant)?.originalPrice
      : product.originalPrice;

  return (
    <div className="bg-cream-light rounded-2xl overflow-hidden border border-[#f5e6d3] hover:border-gold-bright/60 hover:shadow-md transition-all duration-300 flex flex-col">
      <div className="relative h-44 bg-white shrink-0">
        <Image
          src={product.images?.[0] || "/placeholder-product.png"}
          alt={product.name}
          fill
          className="object-contain"
        />
        {product.isFeatured && (
          <div className="absolute top-2 left-2">
            <span className="bg-gold-bright text-[#1a1a1a] text-[10px] font-bold px-2 py-0.5 rounded-full">
              Popular
            </span>
          </div>
        )}
      </div>

      <div className="p-3 flex flex-col flex-1">
        <h4 className="text-xs font-bold text-gray-900 line-clamp-2 mb-2 leading-snug min-h-8">
          {product.name}
        </h4>

        {/* {isPaan && product.variants?.length > 0 && (
          <select
            value={variant}
            onChange={(e) => setVariant(Number(e.target.value))}
            className="w-full border text-accent-foreground border-gray-200 rounded-lg px-2 py-1.5 text-xs mb-2 bg-white focus:outline-none focus:ring-1 focus:ring-[#264B0E]"
          >
            {product.variants.map((v) => (
              <option key={v.setSize} value={v.setSize}>
                Set of {v.setSize} – ₹{v.discountedPrice}
              </option>
            ))}
          </select>
        )} */}

        <div className="flex items-baseline gap-1.5 mb-3">
          <span className="text-sm font-bold text-gray-800">
            ₹{displayPrice}
          </span>
          {originalPrice > displayPrice && (
            <span className="text-xs text-gray-400 line-through">
              ₹{originalPrice}
            </span>
          )}
        </div>

        <button
          onClick={() => onAdd(product, variant)}
          disabled={disabled}
          className={cn(
            "mt-auto w-full py-2 rounded-xl font-bold text-sm tracking-wide transition-all duration-200 border-2",
            disabled
              ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
              : "bg-white border-[#264B0E] text-[#264B0E] hover:bg-[#264B0E] hover:text-white",
          )}
        >
          {disabled ? "Box Full" : "ADD"}
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════
   YOUR BOX PANEL
═══════════════════════════ */
function YourBoxPanel({
  boxSize,
  setBoxSize,
  boxSizes,
  selectedItems,
  removeItem,
  totalAmount,
  handleAddAllToCart,
  scheduledDate,
  scheduledTime,
  isSchedulingCategory,
  onOpenScheduleModal,
}) {
  const filled = selectedItems.length;
  const progress = Math.round((filled / boxSize) * 100);

  const formatTime12hr = (time24) => {
    if (!time24) return "";
    const [h, m] = time24.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return `${displayH}:${String(m).padStart(2, "0")} ${period}`;
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="bg-linear-to-r from-[#264B0E] to-brand-green-dark px-6 py-5">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <ShoppingBag className="w-5 h-5" />
          Your Bundle
        </h3>
        <p className="text-white/70 text-xs mt-1">
          {filled < boxSize
            ? `Add ${boxSize - filled} more item${boxSize - filled > 1 ? "s" : ""} to complete your box`
            : "Your box is complete!"}
        </p>
      </div>

      <div className="p-5 space-y-5">
        {/* Scheduling section */}
        {isSchedulingCategory && (
          <div
            onClick={onOpenScheduleModal}
            className={cn(
              "rounded-xl border-2 px-4 py-3 cursor-pointer transition-all",
              scheduledDate && scheduledTime
                ? "bg-[#264B0E]/5 border-[#264B0E]/30 hover:border-[#264B0E]/50"
                : "bg-amber-50 border-amber-300 hover:border-amber-400",
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Clock
                  className={cn(
                    "w-4 h-4 shrink-0",
                    scheduledDate ? "text-[#264B0E]" : "text-amber-600",
                  )}
                />
                <div>
                  {scheduledDate && scheduledTime ? (
                    <>
                      <p className="text-xs font-bold text-[#264B0E]">
                        Delivery Scheduled
                      </p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {new Date(scheduledDate).toLocaleDateString("en-IN", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                        })}{" "}
                        at {formatTime12hr(scheduledTime)}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-xs font-bold text-amber-800">
                        Schedule Required
                      </p>
                      <p className="text-xs text-amber-700 mt-0.5">
                        Tap to select delivery date & time
                      </p>
                    </>
                  )}
                </div>
              </div>
              <span className="text-xs font-semibold text-[#264B0E] underline shrink-0">
                {scheduledDate ? "Change" : "Select"}
              </span>
            </div>
          </div>
        )}

        {/* Free shipping note */}
        <div className="bg-cream-light border border-gold-bright/40 rounded-xl px-4 py-3 text-center">
          <p className="text-xs text-gray-700">
            Shop for <span className="font-bold text-gray-900">₹500.00</span> or
            more and shipping is on us!
          </p>
        </div>

        {/* Box size */}
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
            Box Size
          </p>
          <div
            className={cn(
              "gap-2",
              boxSizes.length === 1 ? "flex" : "grid grid-cols-3",
            )}
          >
            {boxSizes.map((box) => (
              <button
                key={box.size}
                onClick={() => {
                  if (selectedItems.length > box.size) {
                    toast.error(
                      `Remove ${selectedItems.length - box.size} item(s) first`,
                    );
                    return;
                  }
                  setBoxSize(box.size);
                }}
                className={cn(
                  "py-2.5 rounded-xl font-bold text-sm transition-all border-2",
                  boxSize === box.size
                    ? "bg-[#264B0E] p-3 border-[#264B0E] text-white shadow-sm"
                    : "bg-white border-gray-200 text-gray-600 hover:border-gold-bright",
                )}
              >
                {box.label}
              </button>
            ))}
          </div>
        </div>

        {/* Progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-bold text-gray-800">
              {filled}{" "}
              <span className="text-gray-400 font-normal">
                / {boxSize} Pack
              </span>
            </p>
            <span className="text-xs text-gray-400">
              {boxSize - filled} remaining
            </span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-linear-to-r from-[#264B0E] to-brand-green-light rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>

        {/* Item slots grid */}
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: boxSize }).map((_, index) => {
            const item = selectedItems[index];
            return (
              <div
                key={index}
                className={cn(
                  "aspect-square rounded-xl border-2 border-dashed flex items-center justify-center transition-all relative group",
                  item
                    ? "border-gold-bright bg-cream-light"
                    : "border-gray-200 bg-gray-50",
                )}
              >
                {item ? (
                  <>
                    <div className="absolute inset-1 rounded-lg overflow-hidden">
                      <Image
                        src={
                          item.product.images?.[0] || "/placeholder-product.png"
                        }
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow z-10"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </>
                ) : (
                  <span className="text-sm font-semibold text-gray-300">
                    {index + 1}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Selected items list */}
        <AnimatePresence>
          {selectedItems.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="max-h-40 overflow-y-auto space-y-1.5"
            >
              {selectedItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between bg-cream-light rounded-lg px-3 py-2 border border-[#f5e6d3]"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="relative w-8 h-8 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                      <Image
                        src={
                          item.product.images?.[0] || "/placeholder-product.png"
                        }
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-gray-800 truncate">
                        {item.product.name}
                      </p>
                      {item.variantSetSize && (
                        <p className="text-[10px] text-gray-400">
                          {item.variantSetSize} pcs
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="ml-2 shrink-0 text-gray-400 hover:text-red-500 transition"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Total + CTA */}
        <div className="border-t border-gray-100 pt-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Your Total</span>
            <span className="text-2xl font-bold text-[#264B0E]">
              ₹{totalAmount.toFixed(2)}
            </span>
          </div>

          {/* Warning if scheduling needed but not set */}
          {isSchedulingCategory &&
            filled === boxSize &&
            (!scheduledDate || !scheduledTime) && (
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 shrink-0" />
                Please schedule your delivery before adding to cart
              </p>
            )}

          <button
            onClick={handleAddAllToCart}
            disabled={filled === 0}
            className={cn(
              "w-full py-4 rounded-xl font-bold text-sm tracking-wide transition-all duration-200",
              filled === boxSize
                ? "bg-linear-to-r from-[#264B0E] to-brand-green-light text-white shadow-lg hover:opacity-90 hover:scale-[1.01]"
                : filled > 0
                  ? "bg-[#264B0E]/20 text-[#264B0E] cursor-not-allowed"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed",
            )}
          >
            {filled === 0
              ? "Add Items to Your Box"
              : filled < boxSize
                ? `Add ${boxSize - filled} More Item${boxSize - filled > 1 ? "s" : ""}`
                : "ADD TO CART"}
          </button>
        </div>
      </div>
    </div>
  );
}


/* ═══════════════════════════
   PAAN SCHEDULE MODAL
═══════════════════════════ */
function PaanScheduleModal({ isOpen, onClose, onConfirm, existingDate, existingTime }) {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setSelectedDate(existingDate || "");
      setSelectedTime(existingTime || "");
      setError("");
    }
  }, [isOpen, existingDate, existingTime]);

  const today = new Date();
  const minDate = today.toISOString().split("T")[0];

  const timeSlots = [];
  for (let h = 9; h <= 21; h++) {
    for (let m = 0; m < 60; m += 30) {
      if (h === 21 && m > 0) break;
      const hh = String(h).padStart(2, "0");
      const mm = String(m).padStart(2, "0");
      const period = h < 12 ? "AM" : "PM";
      const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h;
      timeSlots.push({
        value: `${hh}:${mm}`,
        label: `${displayH}:${mm} ${period}`,
      });
    }
  }

  const getAvailableTimeSlots = () => {
    if (!selectedDate) return timeSlots;
    const todayStr = today.toISOString().split("T")[0];
    if (selectedDate !== todayStr) return timeSlots;
    const minDateTime = new Date(today.getTime() + 12 * 60 * 60 * 1000);
    return timeSlots.filter((slot) => {
      const [h, m] = slot.value.split(":").map(Number);
      const slotDateTime = new Date(selectedDate);
      slotDateTime.setHours(h, m, 0, 0);
      return slotDateTime >= minDateTime;
    });
  };

  const availableSlots = getAvailableTimeSlots();

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSelectedTime("");
    setError("");
  };

  const handleConfirm = () => {
    if (!selectedDate) { setError("Please select a delivery date"); return; }
    if (!selectedTime) { setError("Please select a delivery time"); return; }

    const [h, m] = selectedTime.split(":").map(Number);
    const selectedDateTime = new Date(selectedDate);
    selectedDateTime.setHours(h, m, 0, 0);
    const minDateTime = new Date(today.getTime() + 12 * 60 * 60 * 1000);

    if (selectedDateTime < minDateTime) {
      setError("Please select a time at least 12 hours from now");
      return;
    }

    setError("");
    onConfirm({ date: selectedDate, time: selectedTime });
  };

  const handleClose = () => {
    setError("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className="
        bg-white text-gray-900
        w-[calc(100vw-32px)] max-w-md
        max-h-[90vh]
        flex flex-col
        p-0 gap-0
        overflow-hidden
      "
      >
        {/* Fixed Header */}
        <DialogHeader className="shrink-0 px-5 pt-5 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#2d5016]/10 rounded-full shrink-0">
              <Calendar className="w-5 h-5 text-[#2d5016]" />
            </div>
            <div>
              <DialogTitle className="text-lg text-gray-900 leading-tight">
                Schedule Your Paan
              </DialogTitle>
              <p className="text-xs text-gray-500 mt-0.5">
                Select when you'd like your fresh paan delivered
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 min-h-0">
          {/* Info note */}
          <div className="flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 leading-relaxed">
              Fresh paan requires at least{" "}
              <strong>12 hours advance notice</strong> to prepare.
            </p>
          </div>

          {/* Date picker */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#2d5016]" />
              Delivery Date
            </label>
            <input
              type="date"
              value={selectedDate}
              min={minDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="w-full h-11 px-4 border border-gray-200 rounded-xl text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#2d5016]/20 focus:border-[#2d5016] transition-colors"
            />
          </div>

          {/* Time picker */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#2d5016]" />
              Delivery Time
            </label>

            {!selectedDate ? (
              <div className="h-11 px-4 border border-gray-200 rounded-xl flex items-center text-sm text-gray-400 bg-gray-50">
                Please select a date first
              </div>
            ) : availableSlots.length === 0 ? (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-xs text-red-700 flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  No slots for this date. Please select a later date.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-2 max-h-44 overflow-y-auto pr-1 pb-1">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot.value}
                      onClick={() => {
                        setSelectedTime(slot.value);
                        setError("");
                      }}
                      className={cn(
                        "py-2 px-1 rounded-xl text-xs font-semibold border-2 transition-all",
                        selectedTime === slot.value
                          ? "bg-[#2d5016] border-[#2d5016] text-white shadow-sm"
                          : "bg-white border-gray-200 text-gray-600 hover:border-[#2d5016]/50 hover:text-[#2d5016]",
                      )}
                    >
                      {slot.label}
                    </button>
                  ))}
                </div>
                {availableSlots.length > 9 && (
                  <p className="text-xs text-gray-400 text-center">
                    ↕ Scroll to see more times
                  </p>
                )}
              </>
            )}
          </div>

          {/* Selected summary */}
          {selectedDate && selectedTime && (
            <div className="p-3 bg-[#2d5016]/5 border border-[#2d5016]/20 rounded-xl">
              <p className="text-sm font-semibold text-[#2d5016] flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>
                  {new Date(selectedDate).toLocaleDateString("en-IN", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}{" "}
                  at{" "}
                  {availableSlots.find((s) => s.value === selectedTime)?.label}
                </span>
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="text-xs text-red-500 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              {error}
            </p>
          )}
        </div>

        {/* Fixed Footer — always visible */}
        <div className="shrink-0 px-5 py-4 border-t border-gray-100 bg-white flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 h-11 border-2 border-gray-200 rounded-xl font-semibold text-sm text-gray-600 bg-white hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedDate || !selectedTime}
            className={cn(
              "flex-1 h-11 rounded-xl font-bold text-sm transition-all",
              selectedDate && selectedTime
                ? "bg-[#2d5016] hover:bg-[#3d6820] text-white shadow-sm"
                : "bg-gray-100 text-gray-400 cursor-not-allowed",
            )}
          >
            Continue to Build Box
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
