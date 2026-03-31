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
import { ShoppingBag, X, Sparkles, Package } from "lucide-react";
import { cn } from "@/lib/utils";

const BOX_SIZES = [
  { size: 6,  label: "6 Pack"  },
  { size: 12, label: "12 Pack" },
  { size: 24, label: "24 Pack" },
];

export default function CreateYourPaanPage() {
  const { products, filterProducts, loading } = useProductStore();
  const { addToCart }                         = useCartStore();
  const { isAuthenticated }                   = useUserStore();
  const { addItem: addGuestItem }             = useGuestCartStore();
  const { categories, fetchActiveCategories } = useCategoryStore();

  // activeCategoryId = selected root tab _id
  // activeChildId    = selected child pill _id (null = all)
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [activeChildId,    setActiveChildId]    = useState(null);
  const [boxSize,          setBoxSize]          = useState(6);
  const [selectedItems,    setSelectedItems]    = useState([]);

  /* ── load categories ── */
  useEffect(() => {
    fetchActiveCategories();
  }, []);

  /* ── auto-select first root ── */
  useEffect(() => {
    if (categories.length > 0 && !activeCategoryId) {
      setActiveCategoryId(categories[0]._id);
    }
  }, [categories]);

  /* ── fetch products whenever tab or child changes ── */
  useEffect(() => {
    if (!activeCategoryId) return;

    const root        = categories.find((c) => c._id === activeCategoryId);
    const hasChildren = (root?.children?.length ?? 0) > 0;

    if (activeChildId) {
      filterProducts({ category: activeChildId });
    } else if (hasChildren) {
      // Root with children → parentCategory query returns all children's products
      filterProducts({ parentCategory: activeCategoryId });
    } else {
      // Leaf root (no children) → direct category filter
      filterProducts({ category: activeCategoryId });
    }
  }, [activeCategoryId, activeChildId, categories]);

  /* ── locally-filtered products (defensive guard against stale store data) ── */
  const visibleProducts = useMemo(() => {
    if (!products.length || !activeCategoryId) return products;

    return products.filter((p) => {
      const pCatId    = p.category?._id    ?? p.category;
      const pParentId = p.parentCategory?._id ?? p.parentCategory;

      if (activeChildId) {
        return pCatId === activeChildId;
      }

      const root        = categories.find((c) => c._id === activeCategoryId);
      const hasChildren = (root?.children?.length ?? 0) > 0;

      if (hasChildren) {
        // Show products whose parentCategory matches this root
        return pParentId === activeCategoryId;
      }
      // Leaf root — match by category directly
      return pCatId === activeCategoryId;
    });
  }, [products, activeCategoryId, activeChildId, categories]);

  const handleRootTabClick = (id) => {
    if (id === activeCategoryId) return;
    setActiveCategoryId(id);
    setActiveChildId(null);   // reset child filter on root change
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
      toast.error(`Add ${diff} more item${diff > 1 ? "s" : ""} to complete your ${boxSize}-pack!`);
      return;
    }

    if (isAuthenticated) {
      // Logged-in: push each item to the server cart
      for (const item of selectedItems) {
        await addToCart({
          productId:      item.product._id,
          quantity:       1,
          variantSetSize: item.variantSetSize,
        });
      }
    } else {
      // Guest: add each item to localStorage cart
      for (const item of selectedItems) {
        const matchedVariant = item.variantSetSize
          ? item.product.variants?.find((v) => v.setSize === item.variantSetSize)
          : null;

        const price = matchedVariant
          ? (matchedVariant.discountedPrice || 0)
          : (item.product.discountedPrice || 0);

        const origPrice = matchedVariant
          ? (matchedVariant.originalPrice || 0)
          : (item.product.originalPrice || 0);

        addGuestItem({
          productId:      item.product._id,
          name:           item.product.name,
          image:          item.product.images?.[0] || null,
          price,
          originalPrice:  origPrice,
          isPaan:         item.product.isPaan,
          variantSetSize: item.variantSetSize || null,
          quantity:       1,
        });
      }
    }

    setSelectedItems([]);
    toast.success("Your custom paan box has been added to cart! 🎉");
  };

  const activeRoot     = categories.find((c) => c._id === activeCategoryId);
  const activeChildren = activeRoot?.children || [];
  const filled         = selectedItems.length;

  return (
    <div className="min-h-screen bg-[#fdf8f0]">

      {/* ── HERO ── */}
      <div className="relative bg-linear-to-r from-[#2d5016] via-[#3d6820] to-[#2d5016] overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 bg-[#d4af37] rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#f4d03f] rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 md:px-6 py-14 md:py-20 text-center">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-5">
              <Sparkles className="w-4 h-4 text-[#f4d03f]" />
              <span className="text-xs font-bold text-white tracking-widest uppercase">Customize Your Box</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-4">
              Create Your Perfect
              <span className="block text-[#f4d03f]">Paan Bundle</span>
            </h1>
            <p className="text-white/80 text-base md:text-lg max-w-xl mx-auto">
              Pick your favourite paan, digestives and treats to build a personalised box that's uniquely yours.
            </p>
          </motion.div>
        </div>
      </div>

      {/* ── SECTION TITLE ── */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 text-center">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">
            Choose <span className="text-[#2d5016]">{boxSize} Packs</span> of Your Favourite Paanshala Products
          </h2>
          <p className="text-sm text-gray-500 mt-1">To create your perfect bundle</p>
        </div>
      </div>

      {/* ── MAIN 50/50 LAYOUT ── */}
      <div className="max-w-350 mx-auto px-4 md:px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

          {/* LEFT — PRODUCTS */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

            {/* Root category tabs */}
            {categories.length > 0 && (
              <div className="flex border-b border-gray-200 overflow-x-auto">
                {categories.map((cat) => (
                  <button
                    key={cat._id}
                    onClick={() => handleRootTabClick(cat._id)}
                    className={cn(
                      "flex-1 min-w-max px-5 py-4 text-sm font-semibold transition-all border-b-2 whitespace-nowrap",
                      activeCategoryId === cat._id
                        ? "border-[#2d5016] text-[#2d5016] bg-[#fdf8f0]"
                        : "border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50",
                    )}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}

            {/* Child sub-tabs */}
            {activeChildren.length > 0 && (
              <div className="flex gap-2 px-4 py-3 border-b border-gray-100 overflow-x-auto bg-gray-50/60">
                <button
                  onClick={() => setActiveChildId(null)}
                  className={cn(
                    "shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border",
                    !activeChildId
                      ? "bg-[#2d5016] text-white border-[#2d5016]"
                      : "bg-white text-gray-500 border-gray-200 hover:border-[#2d5016]/40",
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
                        ? "bg-[#2d5016] text-white border-[#2d5016]"
                        : "bg-white text-gray-500 border-gray-200 hover:border-[#2d5016]/40",
                    )}
                  >
                    {child.name}
                  </button>
                ))}
              </div>
            )}

            {/* Products grid */}
            <div className="p-5">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {loading && Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-72 rounded-2xl bg-gray-100 animate-pulse" />
                ))}

                {!loading && visibleProducts.map((product, i) => (
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
              selectedItems={selectedItems}
              removeItem={removeItem}
              totalAmount={totalAmount}
              handleAddAllToCart={handleAddAllToCart}
            />
          </div>
        </div>
      </div>
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

  const displayPrice = isPaan && variant
    ? product.variants?.find((v) => v.setSize === variant)?.discountedPrice
    : product.discountedPrice;

  const originalPrice = isPaan && variant
    ? product.variants?.find((v) => v.setSize === variant)?.originalPrice
    : product.originalPrice;

  return (
    <div className="bg-[#fdf8f0] rounded-2xl overflow-hidden border border-[#e8dcc8] hover:border-[#d4af37]/60 hover:shadow-md transition-all duration-300 flex flex-col">
      <div className="relative h-44 bg-[#f5ede0] shrink-0">
        <Image
          src={product.images?.[0] || "/placeholder-product.png"}
          alt={product.name}
          fill
          className="object-cover"
        />
        {product.isFeatured && (
          <div className="absolute top-2 left-2">
            <span className="bg-[#d4af37] text-black text-[10px] font-bold px-2 py-0.5 rounded-full">Popular</span>
          </div>
        )}
      </div>

      <div className="p-3 flex flex-col flex-1">
        <h4 className="text-xs font-bold text-gray-900 line-clamp-2 mb-2 leading-snug min-h-8">
          {product.name}
        </h4>

        {isPaan && product.variants?.length > 0 && (
          <select
            value={variant}
            onChange={(e) => setVariant(Number(e.target.value))}
            className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs mb-2 bg-white focus:outline-none focus:ring-1 focus:ring-[#2d5016]"
          >
            {product.variants.map((v) => (
              <option key={v.setSize} value={v.setSize}>
                Set of {v.setSize} – ₹{v.discountedPrice}
              </option>
            ))}
          </select>
        )}

        <div className="flex items-baseline gap-1.5 mb-3">
          <span className="text-sm font-bold text-gray-800">₹{displayPrice}</span>
          {originalPrice > displayPrice && (
            <span className="text-xs text-gray-400 line-through">₹{originalPrice}</span>
          )}
        </div>

        <button
          onClick={() => onAdd(product, variant)}
          disabled={disabled}
          className={cn(
            "mt-auto w-full py-2 rounded-xl font-bold text-sm tracking-wide transition-all duration-200 border-2",
            disabled
              ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
              : "bg-white border-[#2d5016] text-[#2d5016] hover:bg-[#2d5016] hover:text-white",
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
function YourBoxPanel({ boxSize, setBoxSize, selectedItems, removeItem, totalAmount, handleAddAllToCart }) {
  const filled   = selectedItems.length;
  const progress = Math.round((filled / boxSize) * 100);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="bg-linear-to-r from-[#2d5016] to-[#3d6820] px-6 py-5">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <ShoppingBag className="w-5 h-5" />
          Your Bundle
        </h3>
        <p className="text-white/70 text-xs mt-1">
          {filled < boxSize
            ? `Add ${boxSize - filled} more item${boxSize - filled > 1 ? "s" : ""} to complete your box`
            : "Your box is complete! 🎉"}
        </p>
      </div>

      <div className="p-5 space-y-5">
        <div className="bg-[#fdf8f0] border border-[#d4af37]/40 rounded-xl px-4 py-3 text-center">
          <p className="text-xs text-gray-700">
            Shop for <span className="font-bold text-gray-900">₹500.00</span> or more and shipping is on us!
          </p>
        </div>

        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Box Size</p>
          <div className="grid grid-cols-3 gap-2">
            {BOX_SIZES.map((box) => (
              <button
                key={box.size}
                onClick={() => {
                  if (selectedItems.length > box.size) {
                    toast.error(`Remove ${selectedItems.length - box.size} item(s) first`);
                    return;
                  }
                  setBoxSize(box.size);
                }}
                className={cn(
                  "py-2.5 rounded-xl font-bold text-sm transition-all border-2",
                  boxSize === box.size
                    ? "bg-[#2d5016] border-[#2d5016] text-white shadow-sm"
                    : "bg-white border-gray-200 text-gray-600 hover:border-[#d4af37]",
                )}
              >
                {box.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-bold text-gray-800">
              {filled} <span className="text-gray-400 font-normal">/ {boxSize} Pack</span>
            </p>
            <span className="text-xs text-gray-400">{boxSize - filled} remaining</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-linear-to-r from-[#2d5016] to-[#3d6820] rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: boxSize }).map((_, index) => {
            const item = selectedItems[index];
            return (
              <div
                key={index}
                className={cn(
                  "aspect-square rounded-xl border-2 border-dashed flex items-center justify-center transition-all relative group",
                  item ? "border-[#d4af37] bg-[#fdf8f0]" : "border-gray-200 bg-gray-50",
                )}
              >
                {item ? (
                  <>
                    <div className="absolute inset-1 rounded-lg overflow-hidden">
                      <Image
                        src={item.product.images?.[0] || "/placeholder-product.png"}
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
                  <span className="text-sm font-semibold text-gray-300">{index + 1}</span>
                )}
              </div>
            );
          })}
        </div>

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
                  className="flex items-center justify-between bg-[#fdf8f0] rounded-lg px-3 py-2 border border-[#e8dcc8]"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="relative w-8 h-8 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                      <Image
                        src={item.product.images?.[0] || "/placeholder-product.png"}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-gray-800 truncate">{item.product.name}</p>
                      {item.variantSetSize && (
                        <p className="text-[10px] text-gray-400">{item.variantSetSize} pcs</p>
                      )}
                    </div>
                  </div>
                  <button onClick={() => removeItem(item.id)} className="ml-2 shrink-0 text-gray-400 hover:text-red-500 transition">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="border-t border-gray-100 pt-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Your Total</span>
            <span className="text-2xl font-bold text-[#2d5016]">₹{totalAmount.toFixed(2)}</span>
          </div>
          <button
            onClick={handleAddAllToCart}
            disabled={filled === 0}
            className={cn(
              "w-full py-4 rounded-xl font-bold text-sm tracking-wide transition-all duration-200",
              filled === boxSize
                ? "bg-linear-to-r from-[#2d5016] to-[#3d6820] text-white shadow-lg hover:opacity-90 hover:scale-[1.01]"
                : filled > 0
                ? "bg-[#2d5016]/20 text-[#2d5016] cursor-not-allowed"
                : "bg-gray-100 text-gray-400 cursor-not-allowed",
            )}
          >
            {filled === 0
              ? "Add Items to Your Box"
              : filled < boxSize
              ? `Add ${boxSize - filled} More Item${boxSize - filled > 1 ? "s" : ""}`
              : "ADD TO CART 🛒"}
          </button>
        </div>
      </div>
    </div>
  );
}