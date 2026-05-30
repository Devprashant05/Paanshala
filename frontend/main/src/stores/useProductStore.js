import { create } from "zustand";
import api from "@/lib/axios";

export const useProductStore = create((set) => ({
  // =========================
  // STATE
  // =========================
  products: [],
  featuredProducts: [],
  filteredProducts: [],
  relatedProducts: [],
  subcategoryProducts: [],
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
  filterProducts: async ({ category, parentCategory }) => {
    set({ loading: true, products: [] }); // ← clear immediately
    try {
      const params = {};
      if (category) params.category = category;
      if (parentCategory) params.parentCategory = parentCategory;
      const res = await api.get("/products/filter", { params });
      set({ filteredProducts: res.data.products || [], loading: false });
    } catch {
      toast.error("Failed to fetch products");
      set({ loading: false });
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
  fetchProductById: async (slug) => {
    try {
      set({ loading: true, error: null });

      const res = await api.get(`/products/${slug}`);

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
  // PRODUCT DETAILS
  // =========================
  fetchSubcategoriesProducts: async (parentCategoryId) => {
    try {
      set({ loading: true, error: null });

      const res = await api.get(`/products/subcategories/${parentCategoryId}`);

      set({
        subcategoryProducts: res.data.products,
        loading: false,
      });
      return res.data.products;
    } catch (error) {
      set({
        loading: false,
        error: error?.response?.data?.message || "Product not found",
      });
    }
  },

  fetchRelatedProductById: async (productId) => {
    try {
      set({ loading: true, error: null });

      const res = await api.get(`/products/related/${productId}`);

      set({ relatedProducts: res.data.products, loading: false });
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
      subcategoryProducts: [],
      filteredProducts: [],
      currentProduct: null,
      loading: false,
      error: null,
    });
  },
}));
