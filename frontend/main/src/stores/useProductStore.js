import { create } from "zustand";
import api from "@/lib/axios";

export const useProductStore = create((set) => ({
  // =========================
  // STATE
  // =========================
  products: [],
  featuredProducts: [],
  currentProduct: null,
  loading: false,
  error: null,

  // =========================
  // HELPERS
  // =========================
  setLoading: (value) => set({ loading: value }),

  // =========================
  // GET ALL PRODUCTS (SHOP)
  // =========================
  fetchAllProducts: async () => {
    try {
      set({ loading: true, error: null });

      const res = await api.get("/products");

      set({
        products: res.data.products,
        loading: false,
      });
    } catch (error) {
      set({
        loading: false,
        error: error?.response?.data?.message || "Failed to fetch products",
      });
    }
  },

  // =========================
  // FEATURED PRODUCTS
  // =========================
  fetchFeaturedProducts: async () => {
    try {
      const res = await api.get("/products/featured");
      set({ featuredProducts: res.data.products });
    } catch (error) {
      console.error("fetchFeaturedProducts", error);
    }
  },

  // =========================
  // FILTER PRODUCTS
  // =========================
  filterProducts: async ({ category, subcategory }) => {
    try {
      set({ loading: true, error: null });

      const res = await api.get("/products/filter", {
        params: { category, subcategory },
      });

      set({
        products: res.data.products,
        loading: false,
      });
    } catch (error) {
      set({
        loading: false,
        error: error?.response?.data?.message || "Failed to filter products",
      });
    }
  },

  // =========================
  // SEARCH PRODUCTS
  // =========================
  searchProducts: async ({ q, category, subcategory }) => {
    try {
      set({ loading: true, error: null });

      const res = await api.get("/products/search", {
        params: { q, category, subcategory },
      });

      set({
        products: res.data.products,
        loading: false,
      });
    } catch (error) {
      set({
        loading: false,
        error: error?.response?.data?.message || "Failed to search products",
      });
    }
  },

  // =========================
  // PRODUCT DETAILS
  // =========================
  fetchProductById: async (productId) => {
    try {
      set({ loading: true, error: null });

      const res = await api.get(`/products/${productId}`);

      set({
        currentProduct: res.data.product,
        loading: false,
      });
    } catch (error) {
      set({
        loading: false,
        error: error?.response?.data?.message || "Product not found",
      });
    }
  },

  // =========================
  // RESET
  // =========================
  resetProducts: () => {
    set({
      products: [],
      featuredProducts: [],
      currentProduct: null,
      loading: false,
      error: null,
    });
  },
}));
