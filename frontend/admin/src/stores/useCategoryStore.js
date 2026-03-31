import { create } from "zustand";
import api from "@/lib/axios";
import toast from "react-hot-toast";

export const useCategoryStore = create((set) => ({
  categories: [],
  loading: false,

  /* ========================= */
  setLoading: (val) => set({ loading: val }),

  /* =========================
     ADMIN FETCH
  ========================== */
  fetchCategories: async () => {
    try {
      set({ loading: true });
      const res = await api.get("/categories/admin");
      set({
        categories: res.data.categories || [],
        loading: false,
      });
    } catch {
      toast.error("Failed to fetch categories");
      set({ loading: false });
    }
  },

  /* =========================
     PUBLIC FETCH (TREE)
  ========================== */
  fetchActiveCategories: async () => {
    try {
      const res = await api.get("/categories");
      set({ categories: res.data.categories || [] });
    } catch {
      toast.error("Failed to fetch categories");
    }
  },

  /* =========================
     CREATE
  ========================== */
  createCategory: async (data) => {
    try {
      await api.post("/categories/admin", data);
      toast.success("Category created");
      return true;
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create category");
      return false;
    }
  },

  /* =========================
     UPDATE
  ========================== */
  updateCategory: async (id, data) => {
    try {
      await api.patch(`/categories/admin/${id}`, data);
      toast.success("Category updated");
      return true;
    } catch {
      toast.error("Failed to update category");
      return false;
    }
  },

  /* =========================
     TOGGLE
  ========================== */
  toggleCategory: async (id, isActive) => {
    try {
      await api.patch(`/categories/admin/status/${id}`, { isActive });
      toast.success("Status updated");
      return true;
    } catch {
      toast.error("Failed to update status");
      return false;
    }
  },

  /* =========================
     DELETE
  ========================== */
  deleteCategory: async (id) => {
    try {
      await api.delete(`/categories/admin/${id}`);
      toast.success("Category deleted");
      return true;
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete");
      return false;
    }
  },
}));
