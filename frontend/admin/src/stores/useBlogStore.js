import { create } from "zustand";
import api from "@/lib/axios";
import toast from "react-hot-toast";

export const useBlogStore = create((set) => ({
  // =========================
  // STATE
  // =========================
  blogs: [],
  loading: false,

  // =========================
  // FETCH BLOGS (ADMIN)
  // =========================
  fetchBlogs: async () => {
    try {
      set({ loading: true });
      const res = await api.get("/blogs/admin/all");
      set({ blogs: res.data.blogs, loading: false });
    } catch {
      toast.error("Failed to fetch blogs");
      set({ loading: false });
    }
  },

  // =========================
  // CREATE BLOG
  // =========================
  createBlog: async (formData) => {
    try {
      set({ loading: true });
      await api.post("/blogs/admin/create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Blog created successfully");
      set({ loading: false });
      return true;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to create blog");
      set({ loading: false });
      return false;
    }
  },

  // =========================
  // UPDATE BLOG
  // =========================
  updateBlog: async (blogId, formData) => {
    try {
      set({ loading: true });
      await api.put(`blogs/admin/update/${blogId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Blog updated successfully");
      set({ loading: false });
      return true;
    } catch {
      toast.error("Failed to update blog");
      set({ loading: false });
      return false;
    }
  },

  // =========================
  // TOGGLE BLOG STATUS
  // =========================
  toggleBlogStatus: async (blogId, data) => {
    try {
      await api.patch(`blogs/admin/toggle/${blogId}`, data);
      toast.success("Blog status updated");
      return true;
    } catch {
      toast.error("Failed to update blog status");
      return false;
    }
  },

  // =========================
  // DELETE BLOG
  // =========================
  deleteBlog: async (blogId) => {
    try {
      await api.delete(`/blogs/admin/delete/${blogId}`);
      toast.success("Blog deleted successfully");
      return true;
    } catch {
      toast.error("Failed to delete blog");
      return false;
    }
  },
}));
