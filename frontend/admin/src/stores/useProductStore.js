import { create } from "zustand";
import api from "@/lib/axios";
import toast from "react-hot-toast";

export const useProductStore = create((set) => ({
  // =========================
  // STATE
  // =========================
  products: [],
  loading: false,

  // =========================
  // FETCH ALL PRODUCTS (ADMIN)
  // =========================
  fetchProducts: async () => {
    try {
      set({ loading: true });
      const res = await api.get("/products/admin/all");
      set({ products: res.data.products, loading: false });
    } catch {
      toast.error("Failed to fetch products");
      set({ loading: false });
    }
  },

  // =========================
  // CREATE PRODUCT
  // =========================
  createProduct: async (formData) => {
    try {
      set({ loading: true });
      await api.post("/products/admin/create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Product created successfully");
      set({ loading: false });
      return true;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to create product");
      set({ loading: false });
      return false;
    }
  },

  // =========================
  // UPDATE PRODUCT
  // =========================
  updateProduct: async (productId, formData) => {
    try {
      set({ loading: true });

      await api.put(`/products/admin/update/${productId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Product updated successfully");
      set({ loading: false });
      return true;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update product");
      set({ loading: false });
      return false;
    }
  },

  // =========================
  // TOGGLE PRODUCT FLAGS
  // =========================
  toggleProduct: async (productId, payload) => {
    try {
      await api.patch(`/products/admin/toggle/${productId}`, payload);
      toast.success("Product updated");
      return true;
    } catch {
      toast.error("Failed to update product");
      return false;
    }
  },

  // =========================
  // DELETE PRODUCT
  // =========================
  deleteProduct: async (productId) => {
    try {
      await api.delete(`/products/admin/delete/${productId}`);
      toast.success("Product deleted");
      return true;
    } catch {
      toast.error("Failed to delete product");
      return false;
    }
  },

  // =========================
  // SEARCH PRODUCTS (ADMIN)
  // =========================
  searchProducts: async (query) => {
    try {
      const res = await api.get(`/products/admin/search?q=${query}`);
      set({ products: res.data.products });
    } catch {
      toast.error("Search failed");
    }
  },
}));
