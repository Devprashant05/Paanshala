import { create } from "zustand";
import api from "@/lib/axios";
import toast from "react-hot-toast";

export const useHorecaPageAdminStore = create((set, get) => ({
  page: null,
  loading: false,
  saving: false,

  // ─────────────────────────────────
  // FETCH (admin — raw, populated)
  // ─────────────────────────────────
  fetchHorecaPageAdmin: async () => {
    try {
      set({ loading: true });
      const res = await api.get("/horeca-page/admin");
      set({ page: res.data.page, loading: false });
    } catch (error) {
      toast.error("Failed to fetch HORECA page settings");
      set({ loading: false });
    }
  },

  // ─────────────────────────────────
  // HERO — supports optional image file
  // ─────────────────────────────────
  updateHero: async ({ heading, subheading, ctaText, imageFile }) => {
    try {
      set({ saving: true });

      const formData = new FormData();
      if (heading !== undefined) formData.append("heading", heading);
      if (subheading !== undefined) formData.append("subheading", subheading);
      if (ctaText !== undefined) formData.append("ctaText", ctaText);
      if (imageFile) formData.append("backgroundImage", imageFile);

      const res = await api.patch("/horeca-page/admin/hero", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      set((state) => ({
        page: { ...state.page, hero: res.data.hero },
        saving: false,
      }));
      toast.success("Hero section updated");
      return true;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update hero");
      set({ saving: false });
      return false;
    }
  },

  // ─────────────────────────────────
  // OFFERINGS — meta text
  // ─────────────────────────────────
  updateOfferingsMeta: async (data) => {
    try {
      set({ saving: true });
      const res = await api.patch("/horeca-page/admin/offerings", data);
      set((state) => ({
        page: {
          ...state.page,
          offerings: { ...state.page.offerings, ...res.data.offerings },
        },
        saving: false,
      }));
      toast.success("Offerings section updated");
      return true;
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to update offerings",
      );
      set({ saving: false });
      return false;
    }
  },

  // ─────────────────────────────────
  // OFFERINGS — products (name + multiple images, FormData)
  // ─────────────────────────────────
  addOfferingProduct: async ({ name, imageFiles }) => {
    try {
      if (!name?.trim()) {
        toast.error("Product name is required");
        return false;
      }
      if (!imageFiles?.length) {
        toast.error("Please select at least one image");
        return false;
      }

      const formData = new FormData();
      formData.append("name", name);
      imageFiles.forEach((file) => formData.append("images", file));

      const res = await api.post(
        "/horeca-page/admin/offerings/products",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );

      set((state) => ({
        page: {
          ...state.page,
          offerings: { ...state.page.offerings, products: res.data.products },
        },
      }));
      toast.success("Product added");
      return true;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to add product");
      return false;
    }
  },

  updateOfferingProduct: async (
    productId,
    { name, imageFiles, removeImages, order, isActive },
  ) => {
    try {
      const formData = new FormData();
      if (name !== undefined) formData.append("name", name);
      if (order !== undefined) formData.append("order", order);
      if (typeof isActive === "boolean") formData.append("isActive", isActive);
      if (imageFiles?.length) {
        imageFiles.forEach((file) => formData.append("images", file));
      }
      if (removeImages?.length) {
        removeImages.forEach((url) => formData.append("removeImages", url));
      }

      const res = await api.patch(
        `/horeca-page/admin/offerings/products/${productId}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );

      set((state) => ({
        page: {
          ...state.page,
          offerings: { ...state.page.offerings, products: res.data.products },
        },
      }));
      toast.success("Product updated");
      return true;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update product");
      return false;
    }
  },

  // Lightweight toggle — no files, plain JSON is fine
  toggleOfferingProduct: async (productId, isActive) => {
    try {
      const res = await api.patch(
        `/horeca-page/admin/offerings/products/${productId}`,
        { isActive },
      );
      set((state) => ({
        page: {
          ...state.page,
          offerings: { ...state.page.offerings, products: res.data.products },
        },
      }));
      return true;
    } catch (error) {
      toast.error("Failed to toggle product");
      return false;
    }
  },

  deleteOfferingProduct: async (productId) => {
    try {
      const res = await api.delete(
        `/horeca-page/admin/offerings/products/${productId}`,
      );
      set((state) => ({
        page: {
          ...state.page,
          offerings: { ...state.page.offerings, products: res.data.products },
        },
      }));
      toast.success("Product deleted");
      return true;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete product");
      return false;
    }
  },

  reorderOfferingProducts: async (items) => {
    try {
      const res = await api.patch(
        "/horeca-page/admin/offerings/products/reorder",
        { items },
      );
      set((state) => ({
        page: {
          ...state.page,
          offerings: { ...state.page.offerings, products: res.data.products },
        },
      }));
      return true;
    } catch (error) {
      toast.error("Failed to reorder products");
      return false;
    }
  },

  // ─────────────────────────────────
  // WHO WE SERVE — meta
  // ─────────────────────────────────
  updateWhoWeServeMeta: async (data) => {
    try {
      set({ saving: true });
      const res = await api.patch("/horeca-page/admin/who-we-serve", data);
      set((state) => ({
        page: { ...state.page, whoWeServe: res.data.whoWeServe },
        saving: false,
      }));
      toast.success("Section updated");
      return true;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update section");
      set({ saving: false });
      return false;
    }
  },

  // ─────────────────────────────────
  // WHO WE SERVE — cards (image FILE + title + description)
  // ─────────────────────────────────
  addWhoWeServeCard: async ({ imageFile, title, description }) => {
    try {
      if (!imageFile) {
        toast.error("Please select an image");
        return false;
      }

      const formData = new FormData();
      formData.append("image", imageFile);
      formData.append("title", title);
      formData.append("description", description);

      const res = await api.post(
        "/horeca-page/admin/who-we-serve/cards",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );

      set((state) => ({
        page: {
          ...state.page,
          whoWeServe: { ...state.page.whoWeServe, cards: res.data.cards },
        },
      }));
      toast.success("Card added");
      return true;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to add card");
      return false;
    }
  },

  updateWhoWeServeCard: async (
    cardId,
    { imageFile, title, description, order, isActive },
  ) => {
    try {
      const formData = new FormData();
      if (imageFile) formData.append("image", imageFile);
      if (title !== undefined) formData.append("title", title);
      if (description !== undefined)
        formData.append("description", description);
      if (order !== undefined) formData.append("order", order);
      if (typeof isActive === "boolean") formData.append("isActive", isActive);

      const res = await api.patch(
        `/horeca-page/admin/who-we-serve/cards/${cardId}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );

      set((state) => ({
        page: {
          ...state.page,
          whoWeServe: { ...state.page.whoWeServe, cards: res.data.cards },
        },
      }));
      toast.success("Card updated");
      return true;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update card");
      return false;
    }
  },

  // Lightweight toggle — no file, plain JSON is fine
  toggleWhoWeServeCard: async (cardId, isActive) => {
    try {
      const res = await api.patch(
        `/horeca-page/admin/who-we-serve/cards/${cardId}`,
        { isActive },
      );
      set((state) => ({
        page: {
          ...state.page,
          whoWeServe: { ...state.page.whoWeServe, cards: res.data.cards },
        },
      }));
      return true;
    } catch (error) {
      toast.error("Failed to toggle card");
      return false;
    }
  },

  deleteWhoWeServeCard: async (cardId) => {
    try {
      const res = await api.delete(
        `/horeca-page/admin/who-we-serve/cards/${cardId}`,
      );
      set((state) => ({
        page: {
          ...state.page,
          whoWeServe: { ...state.page.whoWeServe, cards: res.data.cards },
        },
      }));
      toast.success("Card deleted");
      return true;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete card");
      return false;
    }
  },

  reorderWhoWeServeCards: async (items) => {
    try {
      const res = await api.patch(
        "/horeca-page/admin/who-we-serve/cards/reorder",
        { items },
      );
      set((state) => ({
        page: {
          ...state.page,
          whoWeServe: { ...state.page.whoWeServe, cards: res.data.cards },
        },
      }));
      return true;
    } catch (error) {
      toast.error("Failed to reorder cards");
      return false;
    }
  },

  // ─────────────────────────────────
  // MOBILE APP
  // ─────────────────────────────────
  updateMobileApp: async (data) => {
    try {
      set({ saving: true });
      const res = await api.patch("/horeca-page/admin/mobile-app", data);
      set((state) => ({
        page: { ...state.page, mobileApp: res.data.mobileApp },
        saving: false,
      }));
      toast.success("Mobile app section updated");
      return true;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update section");
      set({ saving: false });
      return false;
    }
  },

  // ─────────────────────────────────
  // INQUIRY MODAL
  // ─────────────────────────────────
  updateInquiryModal: async (data) => {
    try {
      set({ saving: true });
      const res = await api.patch("/horeca-page/admin/inquiry-modal", data);
      set((state) => ({
        page: { ...state.page, inquiryModal: res.data.inquiryModal },
        saving: false,
      }));
      toast.success("Inquiry modal updated");
      return true;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update section");
      set({ saving: false });
      return false;
    }
  },
}));