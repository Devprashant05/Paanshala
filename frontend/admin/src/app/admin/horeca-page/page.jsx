"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  Building2,
  Package,
  Users,
  Smartphone,
  MessageSquare,
  Plus,
  Trash2,
  Edit,
  X,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Upload,
  ImageIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import { useHorecaPageAdminStore } from "@/stores/useHorecaPageStore";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay },
});

/* ── section wrapper ── */
function Section({ title, icon, accent, children, delay = 0 }) {
  return (
    <motion.div {...fadeUp(delay)}>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div
          className={cn(
            "px-6 py-4 border-b border-gray-100 flex items-center gap-3",
            accent,
          )}
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/70">
            {icon}
          </div>
          <h2 className="font-bold text-sm uppercase tracking-widest text-gray-700">
            {title}
          </h2>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </motion.div>
  );
}

function Field({ label, error, children, span2 = false }) {
  return (
    <div className={cn("space-y-1.5", span2 && "md:col-span-2")}>
      <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
        {label}
      </Label>
      {children}
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
          <AlertCircle className="w-3 h-3 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

/* ════════════════════════════
   MAIN PAGE
════════════════════════════ */
export default function HorecaPageAdmin() {
  const {
    page,
    loading,
    saving,
    fetchHorecaPageAdmin,
    updateHero,
    updateOfferingsMeta,
    addOfferingProduct,
    updateOfferingProduct,
    toggleOfferingProduct,
    deleteOfferingProduct,
    reorderOfferingProducts,
    updateWhoWeServeMeta,
    addWhoWeServeCard,
    updateWhoWeServeCard,
    toggleWhoWeServeCard,
    deleteWhoWeServeCard,
    reorderWhoWeServeCards,
    updateMobileApp,
    updateInquiryModal,
  } = useHorecaPageAdminStore();

  useEffect(() => {
    fetchHorecaPageAdmin();
  }, []);

  if (loading || !page) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-[#12351a]" />
      </div>
    );
  }

  return (
    <div className="space-y-7 max-w-4xl">
      <motion.div {...fadeUp(0)}>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#12351a]/60 mb-1">
              Admin
            </p>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
              HORECA Page
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Manage content shown on the public HORECA partnerships page
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full">
            <CheckCircle className="w-3.5 h-3.5" />
            Loaded
          </span>
        </div>
      </motion.div>

      <HeroSection
        page={page}
        updateHero={updateHero}
        saving={saving}
        delay={0.08}
      />

      <OfferingsSection
        page={page}
        updateOfferingsMeta={updateOfferingsMeta}
        addOfferingProduct={addOfferingProduct}
        updateOfferingProduct={updateOfferingProduct}
        toggleOfferingProduct={toggleOfferingProduct}
        deleteOfferingProduct={deleteOfferingProduct}
        reorderOfferingProducts={reorderOfferingProducts}
        saving={saving}
        delay={0.14}
      />

      <WhoWeServeSection
        page={page}
        updateWhoWeServeMeta={updateWhoWeServeMeta}
        addWhoWeServeCard={addWhoWeServeCard}
        updateWhoWeServeCard={updateWhoWeServeCard}
        toggleWhoWeServeCard={toggleWhoWeServeCard}
        deleteWhoWeServeCard={deleteWhoWeServeCard}
        reorderWhoWeServeCards={reorderWhoWeServeCards}
        saving={saving}
        delay={0.2}
      />

      <MobileAppSection
        page={page}
        updateMobileApp={updateMobileApp}
        saving={saving}
        delay={0.26}
      />

      <InquiryModalSection
        page={page}
        updateInquiryModal={updateInquiryModal}
        saving={saving}
        delay={0.32}
      />
    </div>
  );
}

/* ════════════════════════════
   HERO SECTION
════════════════════════════ */
function HeroSection({ page, updateHero, saving, delay }) {
  const [form, setForm] = useState({
    heading: page.hero.heading || "",
    subheading: page.hero.subheading || "",
    ctaText: page.hero.ctaText || "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(page.hero.backgroundImage);
  const fileRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    const ok = await updateHero({ ...form, imageFile });
    if (ok) setImageFile(null);
  };

  return (
    <Section
      title="Hero Section"
      delay={delay}
      accent="bg-emerald-50/60"
      icon={<Building2 className="w-4 h-4 text-emerald-600" />}
    >
      <div className="space-y-5">
        <Field label="Background Image">
          <div className="flex items-start gap-4">
            <div className="relative w-40 h-24 rounded-xl overflow-hidden border-2 border-gray-200 bg-gray-50 shrink-0">
              {preview ? (
                <Image
                  src={preview}
                  alt="Hero background"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <ImageIcon className="w-8 h-8" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-700 hover:border-[#12351a]/30 hover:bg-gray-50 transition-colors"
              >
                <Upload className="w-4 h-4" />
                {imageFile ? "Change Image" : "Upload New Image"}
              </button>
              {imageFile && (
                <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  New image ready — click Save to apply
                </p>
              )}
              <p className="text-xs text-gray-400 mt-2">
                Recommended: 1920×1080px, JPG or PNG
              </p>
            </div>
          </div>
        </Field>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Heading">
            <Input
              value={form.heading}
              onChange={(e) => setForm({ ...form, heading: e.target.value })}
              placeholder="HORECA"
              className="h-11 border-gray-200 focus:border-[#12351a]"
            />
          </Field>
          <Field label="CTA Button Text">
            <Input
              value={form.ctaText}
              onChange={(e) => setForm({ ...form, ctaText: e.target.value })}
              placeholder="GET IN TOUCH"
              className="h-11 border-gray-200 focus:border-[#12351a]"
            />
          </Field>
          <Field label="Subheading" span2>
            <Textarea
              value={form.subheading}
              onChange={(e) =>
                setForm({ ...form, subheading: e.target.value })
              }
              placeholder="Premium Paan Solutions For Hotels, Restaurants & Catering Services"
              className="min-h-20 border-gray-200 focus:border-[#12351a] resize-none text-sm"
            />
          </Field>
        </div>

        <SaveButton onClick={handleSave} saving={saving} />
      </div>
    </Section>
  );
}

/* ════════════════════════════
   OFFERINGS SECTION — admin-entered products (name + multiple images)
════════════════════════════ */
function OfferingsSection({
  page,
  updateOfferingsMeta,
  addOfferingProduct,
  updateOfferingProduct,
  toggleOfferingProduct,
  deleteOfferingProduct,
  reorderOfferingProducts,
  saving,
  delay,
}) {
  const [form, setForm] = useState({
    heading: page.offerings.heading || "",
    subheading: page.offerings.subheading || "",
  });
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [productForm, setProductForm] = useState({ name: "" });
  const [imageFiles, setImageFiles] = useState([]); // new files to upload
  const [previews, setPreviews] = useState([]); // { url, isNew, file? }
  const [removedExisting, setRemovedExisting] = useState([]); // existing URLs marked for removal
  const [productSaving, setProductSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const fileRef = useRef(null);

  const products = [...(page.offerings.products || [])].sort(
    (a, b) => a.order - b.order,
  );

  const handleSaveMeta = async () => {
    await updateOfferingsMeta(form);
  };

  const resetProductForm = () => {
    setProductForm({ name: "" });
    setImageFiles([]);
    setPreviews([]);
    setRemovedExisting([]);
    setEditingId(null);
    setShowForm(false);
  };

  const handleEditProduct = (product) => {
    setEditingId(product._id);
    setProductForm({ name: product.name });
    setPreviews(
      (product.images || []).map((url) => ({ url, isNew: false })),
    );
    setImageFiles([]);
    setRemovedExisting([]);
    setShowForm(true);
  };

  const handleFilesChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setImageFiles((prev) => [...prev, ...files]);
    setPreviews((prev) => [
      ...prev,
      ...files.map((file) => ({
        url: URL.createObjectURL(file),
        isNew: true,
        file,
      })),
    ]);
    e.target.value = ""; // allow re-selecting same file
  };

  const handleRemovePreview = (index) => {
    const item = previews[index];
    if (item.isNew) {
      setImageFiles((prev) => prev.filter((f) => f !== item.file));
    } else {
      setRemovedExisting((prev) => [...prev, item.url]);
    }
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmitProduct = async () => {
    if (!productForm.name.trim()) {
      toast.error("Product name is required");
      return;
    }
    if (previews.length === 0) {
      toast.error("Please add at least one image");
      return;
    }

    setProductSaving(true);
    let ok;
    if (editingId) {
      ok = await updateOfferingProduct(editingId, {
        name: productForm.name,
        imageFiles,
        removeImages: removedExisting,
      });
    } else {
      ok = await addOfferingProduct({
        name: productForm.name,
        imageFiles,
      });
    }
    setProductSaving(false);
    if (ok) resetProductForm();
  };

  const handleToggle = async (productId, currentActive) => {
    setTogglingId(productId);
    await toggleOfferingProduct(productId, !currentActive);
    setTogglingId(null);
  };

  const handleDelete = async (productId) => {
    if (!confirm("Delete this product?")) return;
    setDeletingId(productId);
    await deleteOfferingProduct(productId);
    setDeletingId(null);
  };

  const handleMove = async (index, dir) => {
    const target = index + dir;
    if (target < 0 || target >= products.length) return;
    const reordered = [...products];
    [reordered[index], reordered[target]] = [
      reordered[target],
      reordered[index],
    ];
    await reorderOfferingProducts(
      reordered.map((p, i) => ({ productId: p._id, order: i })),
    );
  };

  return (
    <Section
      title="Our Offerings"
      delay={delay}
      accent="bg-blue-50/60"
      icon={<Package className="w-4 h-4 text-blue-600" />}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Heading">
            <Input
              value={form.heading}
              onChange={(e) => setForm({ ...form, heading: e.target.value })}
              placeholder="OUR OFFERINGS"
              className="h-11 border-gray-200 focus:border-[#12351a]"
            />
          </Field>
          <Field label="Subheading">
            <Input
              value={form.subheading}
              onChange={(e) =>
                setForm({ ...form, subheading: e.target.value })
              }
              placeholder="Premium Fresh Paan Collection For Your Establishment"
              className="h-11 border-gray-200 focus:border-[#12351a]"
            />
          </Field>
        </div>
        <SaveButton
          onClick={handleSaveMeta}
          saving={saving}
          label="Save Text"
        />

        <div className="border-t border-gray-100 pt-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Products ({products.length})
            </p>
            <button
              type="button"
              onClick={() => {
                resetProductForm();
                setShowForm(true);
              }}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#12351a] hover:text-[#0f2916] transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Product
            </button>
          </div>

          {/* Product form */}
          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mb-5"
              >
                <div className="rounded-xl border-2 border-[#12351a]/15 bg-gray-50/60 p-5 space-y-4">
                  <Input
                    value={productForm.name}
                    onChange={(e) =>
                      setProductForm({ ...productForm, name: e.target.value })
                    }
                    placeholder="Product name — e.g. Banarasi Meetha Paan"
                    className="h-10 bg-white"
                  />

                  {/* Image grid */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Images ({previews.length})
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {previews.map((p, i) => (
                        <div
                          key={p.url + i}
                          className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-gray-200 bg-white shrink-0 group"
                        >
                          <Image
                            src={p.url}
                            alt={`Preview ${i + 1}`}
                            fill
                            className="object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemovePreview(i)}
                            className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-white/95 shadow flex items-center justify-center text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}

                      <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFilesChange}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 hover:border-[#12351a]/40 flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-[#12351a] transition-colors shrink-0"
                      >
                        <Upload className="w-4 h-4" />
                        <span className="text-[10px] font-semibold">Add</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleSubmitProduct}
                      disabled={productSaving}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#12351a] hover:bg-[#0f2916] text-white text-sm font-bold transition-colors disabled:opacity-60"
                    >
                      {productSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Saving…
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />{" "}
                          {editingId ? "Save Changes" : "Add Product"}
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={resetProductForm}
                      className="px-5 py-2.5 rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Products list */}
          {products.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl">
              <Package className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400 mb-3">
                No products added yet
              </p>
              <button
                type="button"
                onClick={() => {
                  resetProductForm();
                  setShowForm(true);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#12351a] hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                Add your first product
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              <AnimatePresence>
                {products.map((product, index) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl border-2 transition-all",
                      product.isActive
                        ? "border-gray-200 bg-white"
                        : "border-dashed border-gray-200 bg-gray-50/60",
                    )}
                  >
                    <div className="flex -space-x-2 shrink-0">
                      {(product.images || []).slice(0, 3).map((img, i) => (
                        <div
                          key={i}
                          className="relative w-12 h-12 rounded-lg overflow-hidden border-2 border-white bg-gray-50 shadow-sm"
                          style={{ zIndex: 3 - i }}
                        >
                          <Image
                            src={img}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ))}
                      {(product.images || []).length > 3 && (
                        <div className="relative w-12 h-12 rounded-lg border-2 border-white bg-gray-100 shadow-sm flex items-center justify-center text-[10px] font-bold text-gray-500">
                          +{product.images.length - 3}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          "text-sm font-semibold truncate",
                          !product.isActive && "opacity-50",
                        )}
                      >
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {(product.images || []).length} image
                        {(product.images || []).length !== 1 ? "s" : ""}
                      </p>
                    </div>

                    {product.isActive ? (
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full shrink-0">
                        Active
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full shrink-0">
                        Hidden
                      </span>
                    )}

                    <div className="flex items-center gap-1 shrink-0">
                      <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                        <button
                          onClick={() => handleMove(index, -1)}
                          disabled={index === 0}
                          className="p-1.5 hover:bg-gray-100 disabled:opacity-30 transition-colors"
                        >
                          <ArrowUp className="w-3.5 h-3.5 text-gray-600" />
                        </button>
                        <div className="w-px bg-gray-200" />
                        <button
                          onClick={() => handleMove(index, 1)}
                          disabled={index === products.length - 1}
                          className="p-1.5 hover:bg-gray-100 disabled:opacity-30 transition-colors"
                        >
                          <ArrowDown className="w-3.5 h-3.5 text-gray-600" />
                        </button>
                      </div>

                      <button
                        onClick={() =>
                          handleToggle(product._id, product.isActive)
                        }
                        disabled={togglingId === product._id}
                        className={cn(
                          "p-1.5 rounded-lg border transition-colors",
                          product.isActive
                            ? "bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100"
                            : "bg-gray-50 border-gray-200 text-gray-400 hover:bg-gray-100",
                        )}
                      >
                        {togglingId === product._id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : product.isActive ? (
                          <Eye className="w-3.5 h-3.5" />
                        ) : (
                          <EyeOff className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        onClick={() => handleEditProduct(product)}
                        className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDelete(product._id)}
                        disabled={deletingId === product._id}
                        className="p-1.5 rounded-lg border border-red-100 bg-white text-red-400 hover:bg-red-50 transition-colors"
                      >
                        {deletingId === product._id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </Section>
  );
}

/* ════════════════════════════
   WHO WE SERVE SECTION
════════════════════════════ */
function WhoWeServeSection({
  page,
  updateWhoWeServeMeta,
  addWhoWeServeCard,
  updateWhoWeServeCard,
  toggleWhoWeServeCard,
  deleteWhoWeServeCard,
  reorderWhoWeServeCards,
  saving,
  delay,
}) {
  const [form, setForm] = useState({
    heading: page.whoWeServe.heading || "",
    subheading: page.whoWeServe.subheading || "",
  });
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [cardForm, setCardForm] = useState({ title: "", description: "" });
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [cardSaving, setCardSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const fileRef = useRef(null);

  const cards = [...(page.whoWeServe.cards || [])].sort(
    (a, b) => a.order - b.order,
  );

  const handleSaveMeta = async () => {
    await updateWhoWeServeMeta(form);
  };

  const resetCardForm = () => {
    setCardForm({ title: "", description: "" });
    setImageFile(null);
    setPreview(null);
    setEditingId(null);
    setShowForm(false);
  };

  const handleEditCard = (card) => {
    setEditingId(card._id);
    setCardForm({ title: card.title, description: card.description });
    setPreview(card.image);
    setShowForm(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmitCard = async () => {
    if (!cardForm.title.trim() || !cardForm.description.trim()) {
      toast.error("Title and description are required");
      return;
    }
    if (!editingId && !imageFile) {
      toast.error("Please select an image");
      return;
    }

    setCardSaving(true);
    let ok;
    if (editingId) {
      ok = await updateWhoWeServeCard(editingId, { ...cardForm, imageFile });
    } else {
      ok = await addWhoWeServeCard({ ...cardForm, imageFile });
    }
    setCardSaving(false);
    if (ok) resetCardForm();
  };

  const handleToggle = async (cardId, currentActive) => {
    setTogglingId(cardId);
    await toggleWhoWeServeCard(cardId, !currentActive);
    setTogglingId(null);
  };

  const handleDelete = async (cardId) => {
    if (!confirm("Delete this card?")) return;
    setDeletingId(cardId);
    await deleteWhoWeServeCard(cardId);
    setDeletingId(null);
  };

  const handleMove = async (index, dir) => {
    const target = index + dir;
    if (target < 0 || target >= cards.length) return;
    const reordered = [...cards];
    [reordered[index], reordered[target]] = [
      reordered[target],
      reordered[index],
    ];
    await reorderWhoWeServeCards(
      reordered.map((c, i) => ({ cardId: c._id, order: i })),
    );
  };

  return (
    <Section
      title="Who We Serve"
      delay={delay}
      accent="bg-rose-50/60"
      icon={<Users className="w-4 h-4 text-rose-600" />}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Heading">
            <Input
              value={form.heading}
              onChange={(e) => setForm({ ...form, heading: e.target.value })}
              placeholder="WHO WE SERVE"
              className="h-11 border-gray-200 focus:border-[#12351a]"
            />
          </Field>
          <Field label="Subheading">
            <Input
              value={form.subheading}
              onChange={(e) =>
                setForm({ ...form, subheading: e.target.value })
              }
              placeholder="Paanshala partners with…"
              className="h-11 border-gray-200 focus:border-[#12351a]"
            />
          </Field>
        </div>
        <SaveButton
          onClick={handleSaveMeta}
          saving={saving}
          label="Save Text"
        />

        <div className="border-t border-gray-100 pt-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Cards ({cards.length})
            </p>
            <button
              type="button"
              onClick={() => {
                resetCardForm();
                setShowForm(true);
              }}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#12351a] hover:text-[#0f2916] transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Card
            </button>
          </div>

          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mb-5"
              >
                <div className="rounded-xl border-2 border-[#12351a]/15 bg-gray-50/60 p-5 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="relative w-28 h-28 rounded-xl overflow-hidden border-2 border-gray-200 bg-white shrink-0">
                      {preview ? (
                        <Image
                          src={preview}
                          alt="Card preview"
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <ImageIcon className="w-7 h-7" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-3">
                      <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border-2 border-gray-200 text-xs font-semibold text-gray-700 hover:border-[#12351a]/30 bg-white transition-colors"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        {imageFile ? "Change Image" : "Upload Image"}
                      </button>
                      <Input
                        value={cardForm.title}
                        onChange={(e) =>
                          setCardForm({ ...cardForm, title: e.target.value })
                        }
                        placeholder="Card title — e.g. Hotels"
                        className="h-10 bg-white"
                      />
                    </div>
                  </div>
                  <Textarea
                    value={cardForm.description}
                    onChange={(e) =>
                      setCardForm({
                        ...cardForm,
                        description: e.target.value,
                      })
                    }
                    placeholder="Short description for this card…"
                    className="min-h-16 bg-white resize-none text-sm"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleSubmitCard}
                      disabled={cardSaving}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#12351a] hover:bg-[#0f2916] text-white text-sm font-bold transition-colors disabled:opacity-60"
                    >
                      {cardSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Saving…
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />{" "}
                          {editingId ? "Save Changes" : "Add Card"}
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={resetCardForm}
                      className="px-5 py-2.5 rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {cards.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl">
              <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No cards added yet</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              <AnimatePresence>
                {cards.map((card, index) => (
                  <motion.div
                    key={card._id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl border-2 transition-all",
                      card.isActive
                        ? "border-gray-200 bg-white"
                        : "border-dashed border-gray-200 bg-gray-50/60",
                    )}
                  >
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0 border border-gray-200">
                      <Image
                        src={card.image}
                        alt={card.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          "text-sm font-semibold truncate",
                          !card.isActive && "opacity-50",
                        )}
                      >
                        {card.title}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {card.description}
                      </p>
                    </div>

                    {card.isActive ? (
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full shrink-0">
                        Active
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full shrink-0">
                        Hidden
                      </span>
                    )}

                    <div className="flex items-center gap-1 shrink-0">
                      <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                        <button
                          onClick={() => handleMove(index, -1)}
                          disabled={index === 0}
                          className="p-1.5 hover:bg-gray-100 disabled:opacity-30 transition-colors"
                        >
                          <ArrowUp className="w-3.5 h-3.5 text-gray-600" />
                        </button>
                        <div className="w-px bg-gray-200" />
                        <button
                          onClick={() => handleMove(index, 1)}
                          disabled={index === cards.length - 1}
                          className="p-1.5 hover:bg-gray-100 disabled:opacity-30 transition-colors"
                        >
                          <ArrowDown className="w-3.5 h-3.5 text-gray-600" />
                        </button>
                      </div>

                      <button
                        onClick={() => handleToggle(card._id, card.isActive)}
                        disabled={togglingId === card._id}
                        className={cn(
                          "p-1.5 rounded-lg border transition-colors",
                          card.isActive
                            ? "bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100"
                            : "bg-gray-50 border-gray-200 text-gray-400 hover:bg-gray-100",
                        )}
                      >
                        {togglingId === card._id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : card.isActive ? (
                          <Eye className="w-3.5 h-3.5" />
                        ) : (
                          <EyeOff className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        onClick={() => handleEditCard(card)}
                        className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDelete(card._id)}
                        disabled={deletingId === card._id}
                        className="p-1.5 rounded-lg border border-red-100 bg-white text-red-400 hover:bg-red-50 transition-colors"
                      >
                        {deletingId === card._id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </Section>
  );
}

/* ════════════════════════════
   MOBILE APP SECTION
════════════════════════════ */
function MobileAppSection({ page, updateMobileApp, saving, delay }) {
  const [form, setForm] = useState({
    isVisible: page.mobileApp.isVisible ?? true,
    heading: page.mobileApp.heading || "",
    subheading: page.mobileApp.subheading || "",
    appTitle: page.mobileApp.appTitle || "",
    appDescription: page.mobileApp.appDescription || "",
    badgeText: page.mobileApp.badgeText || "",
    playStoreUrl: page.mobileApp.playStoreUrl || "",
    appStoreUrl: page.mobileApp.appStoreUrl || "",
  });

  const handleSave = async () => {
    await updateMobileApp(form);
  };

  return (
    <Section
      title="Mobile App Section"
      delay={delay}
      accent="bg-purple-50/60"
      icon={<Smartphone className="w-4 h-4 text-purple-600" />}
    >
      <div className="space-y-5">
        <div
          onClick={() => setForm({ ...form, isVisible: !form.isVisible })}
          className={cn(
            "flex items-center gap-4 px-5 py-4 rounded-xl border-2 cursor-pointer transition-all select-none",
            form.isVisible
              ? "border-[#12351a]/30 bg-[#12351a]/5"
              : "border-gray-200 bg-gray-50",
          )}
        >
          <div
            className={cn(
              "w-10 h-6 rounded-full relative transition-colors shrink-0",
              form.isVisible ? "bg-[#12351a]" : "bg-gray-300",
            )}
          >
            <div
              className={cn(
                "absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all",
                form.isVisible ? "left-5" : "left-1",
              )}
            />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">
              {form.isVisible ? "Section Visible" : "Section Hidden"}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              Show or hide this section on the public page
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Heading">
            <Input
              value={form.heading}
              onChange={(e) => setForm({ ...form, heading: e.target.value })}
              className="h-11 border-gray-200 focus:border-[#12351a]"
            />
          </Field>
          <Field label="Subheading">
            <Input
              value={form.subheading}
              onChange={(e) =>
                setForm({ ...form, subheading: e.target.value })
              }
              className="h-11 border-gray-200 focus:border-[#12351a]"
            />
          </Field>
          <Field label="App Title">
            <Input
              value={form.appTitle}
              onChange={(e) => setForm({ ...form, appTitle: e.target.value })}
              className="h-11 border-gray-200 focus:border-[#12351a]"
            />
          </Field>
          <Field label="Badge Text">
            <Input
              value={form.badgeText}
              onChange={(e) =>
                setForm({ ...form, badgeText: e.target.value })
              }
              className="h-11 border-gray-200 focus:border-[#12351a]"
            />
          </Field>
          <Field label="App Description" span2>
            <Textarea
              value={form.appDescription}
              onChange={(e) =>
                setForm({ ...form, appDescription: e.target.value })
              }
              className="min-h-16 border-gray-200 focus:border-[#12351a] resize-none text-sm"
            />
          </Field>
          <Field label="Play Store URL">
            <Input
              value={form.playStoreUrl}
              onChange={(e) =>
                setForm({ ...form, playStoreUrl: e.target.value })
              }
              placeholder="Leave empty for 'Coming Soon'"
              className="h-11 border-gray-200 focus:border-[#12351a]"
            />
          </Field>
          <Field label="App Store URL">
            <Input
              value={form.appStoreUrl}
              onChange={(e) =>
                setForm({ ...form, appStoreUrl: e.target.value })
              }
              placeholder="Leave empty for 'Coming Soon'"
              className="h-11 border-gray-200 focus:border-[#12351a]"
            />
          </Field>
        </div>

        <SaveButton onClick={handleSave} saving={saving} />
      </div>
    </Section>
  );
}

/* ════════════════════════════
   INQUIRY MODAL SECTION
════════════════════════════ */
function InquiryModalSection({ page, updateInquiryModal, saving, delay }) {
  const [form, setForm] = useState({
    title: page.inquiryModal.title || "",
    description: page.inquiryModal.description || "",
  });

  const handleSave = async () => {
    await updateInquiryModal(form);
  };

  return (
    <Section
      title="Inquiry Modal"
      delay={delay}
      accent="bg-amber-50/60"
      icon={<MessageSquare className="w-4 h-4 text-amber-600" />}
    >
      <div className="space-y-5">
        <Field label="Modal Title">
          <Input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="h-11 border-gray-200 focus:border-[#12351a]"
          />
        </Field>
        <Field label="Modal Description">
          <Textarea
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
            className="min-h-16 border-gray-200 focus:border-[#12351a] resize-none text-sm"
          />
        </Field>
        <SaveButton onClick={handleSave} saving={saving} />
      </div>
    </Section>
  );
}

/* ── shared save button ── */
function SaveButton({ onClick, saving, label = "Save Changes" }) {
  return (
    <div className="flex justify-end">
      <button
        type="button"
        onClick={onClick}
        disabled={saving}
        className={cn(
          "inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm text-white",
          "bg-[#12351a] hover:bg-[#0f2916] shadow-md transition-all",
          "disabled:opacity-60 disabled:cursor-not-allowed hover:scale-[1.01]",
        )}
      >
        {saving ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Saving…
          </>
        ) : (
          <>
            <Save className="w-4 h-4" /> {label}
          </>
        )}
      </button>
    </div>
  );
}