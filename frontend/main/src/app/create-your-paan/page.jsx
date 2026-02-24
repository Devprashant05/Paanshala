"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { useProductStore } from "@/stores/useProductStore";
import { useCartStore } from "@/stores/useCartStore";
import { ShoppingBag, X, Plus, Minus, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { label: "Paan", value: "Paan" },
  { label: "Digestives", value: "Digestive" },
  { label: "Candy & More", value: "Candy & More" },
  { label: "Mouth Fresheners", value: "Mouth Fresheners" },
];

const BOX_SIZES = [
  { size: 6, label: "6 Pack" },
  { size: 12, label: "12 Pack" },
  { size: 24, label: "24 Pack" },
];

export default function CreateYourPaanPage() {
  const { products, filterProducts, loading } = useProductStore();
  const { addToCart } = useCartStore();

  const [activeCategory, setActiveCategory] = useState("Paan");
  const [boxSize, setBoxSize] = useState(6);
  const [selectedItems, setSelectedItems] = useState([]);

  /* Fetch products by category */
  useEffect(() => {
    filterProducts({ category: activeCategory });
  }, [activeCategory]);

  /* Add item to box */
  const addItem = (product, variantSetSize) => {
    if (selectedItems.length >= boxSize) {
      toast.error(`Your box is full! Maximum ${boxSize} items allowed.`);
      return;
    }

    const item = {
      product,
      variantSetSize: variantSetSize || null,
      id: `${product._id}-${variantSetSize || "default"}-${Date.now()}`,
    };

    setSelectedItems((prev) => [...prev, item]);
    toast.success(`${product.name} added to your box!`);
  };

  /* Remove item from box */
  const removeItem = (id) => {
    setSelectedItems((prev) => prev.filter((item) => item.id !== id));
  };

  /* Calculate total */
  const totalAmount = useMemo(() => {
    return selectedItems.reduce((sum, item) => {
      if (item.product.category === "Paan" && item.variantSetSize) {
        const variant = item.product.variants.find(
          (v) => v.setSize === item.variantSetSize,
        );
        return sum + (variant?.discountedPrice || 0);
      }
      return sum + (item.product.discountedPrice || 0);
    }, 0);
  }, [selectedItems]);

  /* Add all to cart */
  const handleAddAllToCart = async () => {
    if (selectedItems.length === 0) {
      toast.error("Please add items to your box first!");
      return;
    }

    if (selectedItems.length < boxSize) {
      toast.error(
        `Please add ${boxSize - selectedItems.length} more items to complete your ${boxSize}-pack box!`,
      );
      return;
    }

    for (const item of selectedItems) {
      await addToCart({
        productId: item.product._id,
        quantity: 1,
        variantSetSize: item.variantSetSize,
      });
    }

    setSelectedItems([]);
    toast.success("Your custom paan box has been added to cart! 🎉");
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-white via-[#fafaf6] to-white">
      {/* HERO BANNER */}
      <div className="relative bg-linear-to-r from-[#2d5016] via-[#3d6820] to-[#2d5016] overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-[#d4af37] rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#f4d03f] rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 md:px-6 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                <Sparkles className="w-4 h-4 text-[#f4d03f]" />
                <span className="text-sm font-semibold text-white">
                  CUSTOMIZE YOUR BOX
                </span>
              </div>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
                CREATE YOUR
                <span className="block text-[#f4d03f]">PERFECT PAAN BOX</span>
              </h1>

              <p className="text-lg md:text-xl text-white/90 leading-relaxed">
                Choose your favorite paan, digestives, and treats to create a
                personalized box that's uniquely yours!
              </p>
            </motion.div>

            {/* Right: Visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative w-full h-80">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-64 h-64 bg-linear-to-br from-[#d4af37]/20 to-[#f4d03f]/20 rounded-full blur-2xl" />
                </div>
                <div className="relative z-10 flex items-center justify-center h-full">
                  <ShoppingBag
                    className="w-48 h-48 text-white/20"
                    strokeWidth={1}
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* SUBTITLE */}
      <div className="bg-linear-to-r from-[#fafaf6] to-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            Choose <span className="text-[#2d5016]">{boxSize} Packs</span> Of
            Your Favourite Paanshala Products
          </h2>
          <p className="mt-2 text-gray-600">To Create Your Perfect Bundle</p>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
          {/* LEFT SIDE - PRODUCTS */}
          <div>
            {/* CATEGORY TABS */}
            <div className="mb-8 overflow-x-auto">
              <div className="flex gap-2 min-w-max">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setActiveCategory(cat.value)}
                    className={cn(
                      "px-6 py-3 rounded-xl font-semibold text-sm transition-all",
                      activeCategory === cat.value
                        ? "bg-linear-to-r from-[#2d5016] to-[#3d6820] text-white shadow-lg"
                        : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200",
                    )}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* PRODUCTS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {loading &&
                Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-80 rounded-2xl bg-gray-100 animate-pulse"
                  />
                ))}

              {!loading &&
                products.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    onAdd={addItem}
                    disabled={selectedItems.length >= boxSize}
                  />
                ))}

              {!loading && products.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-500">
                    No products found in this category
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SIDE - YOUR BOX */}
          <div className="lg:sticky lg:top-28 h-fit">
            <YourBoxSidebar
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

/* =========================
   PRODUCT CARD
========================= */
function ProductCard({ product, onAdd, disabled }) {
  const [variant, setVariant] = useState(
    product.category === "Paan" ? product.variants?.[0]?.setSize : null,
  );

  const displayPrice =
    product.category === "Paan" && variant
      ? product.variants.find((v) => v.setSize === variant)?.discountedPrice
      : product.discountedPrice;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300"
    >
      <div className="relative h-48 bg-gray-100">
        <Image
          src={product.images?.[0] || "/placeholder-product.png"}
          alt={product.name}
          fill
          className="object-cover"
        />
        {product.isFeatured && (
          <div className="absolute top-3 left-3">
            <span className="bg-[#d4af37] text-black text-xs font-bold px-2 py-1 rounded-full">
              Popular
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <h4 className="text-sm font-bold text-gray-900 line-clamp-2 mb-2">
          {product.name}
        </h4>

        {/* Variant Selector for Paan */}
        {product.category === "Paan" && product.variants?.length > 0 && (
          <select
            value={variant}
            onChange={(e) => setVariant(Number(e.target.value))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-[#2d5016]"
          >
            {product.variants.map((v) => (
              <option key={v.setSize} value={v.setSize}>
                Set of {v.setSize} – ₹{v.discountedPrice}
              </option>
            ))}
          </select>
        )}

        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-lg font-bold text-[#2d5016]">
              ₹{displayPrice}
            </span>
            {product.originalPrice > displayPrice && (
              <span className="text-xs text-gray-500 line-through ml-2">
                ₹{product.originalPrice}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={() => onAdd(product, variant)}
          disabled={disabled}
          className={cn(
            "w-full py-2.5 rounded-xl font-semibold text-sm transition-all",
            disabled
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-white border-2 border-[#2d5016] text-[#2d5016] hover:bg-[#2d5016] hover:text-white",
          )}
        >
          {disabled ? "Box Full" : "ADD"}
        </button>
      </div>
    </motion.div>
  );
}

/* =========================
   YOUR BOX SIDEBAR
========================= */
function YourBoxSidebar({
  boxSize,
  setBoxSize,
  selectedItems,
  removeItem,
  totalAmount,
  handleAddAllToCart,
}) {
  return (
    <div className="bg-linear-to-br from-[#fafaf6] to-white rounded-2xl shadow-2xl border-2 border-[#d4af37]/20 overflow-hidden">
      {/* Header */}
      <div className="bg-linear-to-r from-[#2d5016] to-[#3d6820] p-6">
        <h3 className="text-2xl font-bold text-white flex items-center gap-2">
          <ShoppingBag className="w-6 h-6" />
          Your Paan Box
        </h3>
      </div>

      <div className="p-6">
        {/* Box Size Selector */}
        <div className="mb-6">
          <p className="text-sm font-semibold text-gray-700 mb-3">
            Choose Box Size:
          </p>
          <div className="grid grid-cols-3 gap-2">
            {BOX_SIZES.map((box) => (
              <button
                key={box.size}
                onClick={() => {
                  if (selectedItems.length > box.size) {
                    toast.error(
                      `Please remove ${selectedItems.length - box.size} items first`,
                    );
                    return;
                  }
                  setBoxSize(box.size);
                }}
                className={cn(
                  "py-3 px-2 rounded-xl font-bold text-sm transition-all",
                  boxSize === box.size
                    ? "bg-[#2d5016] text-white shadow-lg"
                    : "bg-white border-2 border-gray-200 text-gray-700 hover:border-[#d4af37]",
                )}
              >
                {box.label}
              </button>
            ))}
          </div>
        </div>

        {/* Visual Grid */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-700">
              {selectedItems.length} / {boxSize} Pack
            </p>
            <span className="text-xs text-gray-500">
              {boxSize - selectedItems.length} remaining
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: boxSize }).map((_, index) => {
              const item = selectedItems[index];
              return (
                <div
                  key={index}
                  className={cn(
                    "aspect-square rounded-lg border-2 border-dashed flex items-center justify-center text-2xl font-bold transition-all",
                    item
                      ? "bg-linear-to-br from-[#d4af37]/20 to-[#f4d03f]/20 border-[#d4af37] relative group cursor-pointer"
                      : "bg-gray-50 border-gray-300 text-gray-400",
                  )}
                >
                  {item ? (
                    <>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-full h-full relative">
                          <Image
                            src={
                              item.product.images?.[0] ||
                              "/placeholder-product.png"
                            }
                            alt={item.product.name}
                            fill
                            className="object-cover rounded-lg"
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    index + 1
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Items List */}
        {selectedItems.length > 0 && (
          <div className="mb-6 max-h-48 overflow-y-auto space-y-2">
            {selectedItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between bg-white rounded-lg p-3 border border-gray-200"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-900 truncate">
                    {item.product.name}
                  </p>
                  {item.variantSetSize && (
                    <p className="text-xs text-gray-500">
                      {item.variantSetSize} pieces
                    </p>
                  )}
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="ml-2 text-red-500 hover:text-red-700 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Total */}
        <div className="border-t-2 border-gray-200 pt-6 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Your Total</span>
          </div>
          <div className="text-3xl font-bold text-[#2d5016]">
            ₹ {totalAmount.toFixed(2)}
          </div>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddAllToCart}
          disabled={selectedItems.length === 0}
          className={cn(
            "w-full py-4 rounded-xl font-bold text-base transition-all shadow-lg",
            selectedItems.length > 0
              ? "bg-linear-to-r from-[#2d5016] to-[#3d6820] text-white hover:opacity-90 hover:scale-105"
              : "bg-gray-200 text-gray-400 cursor-not-allowed",
          )}
        >
          {selectedItems.length === 0
            ? "Add Items to Box"
            : selectedItems.length < boxSize
              ? `Add ${boxSize - selectedItems.length} More Items`
              : "ADD TO CART"}
        </button>
      </div>
    </div>
  );
}
