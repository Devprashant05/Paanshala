import { create } from "zustand";
import api from "@/lib/axios";

export const useBlogStore = create((set) => ({
  // =========================
  // STATE
  // =========================
  blogs: [],
  featuredBlogs: [],
  currentBlog: null,
  loading: false,

  // =========================
  // FETCH ALL BLOGS
  // =========================
  fetchBlogs: async () => {
    try {
      set({ loading: true });
      const res = await api.get("/blogs");
      set({
        blogs: res.data.blogs,
        loading: false,
      });
    } catch {
      set({ loading: false });
    }
  },

  // =========================
  // FETCH FEATURED BLOGS
  // =========================
  fetchFeaturedBlogs: async () => {
    try {
      const res = await api.get("/blogs/featured");
      set({ featuredBlogs: res.data.blogs });
    } catch {
      // silent fail
    }
  },

  // =========================
  // FETCH BLOG BY SLUG
  // =========================
  fetchBlogBySlug: async (slug) => {
    try {
      set({ loading: true, currentBlog: null });
      const res = await api.get(`/blogs/${slug}`);
      set({
        currentBlog: res.data.blog,
        loading: false,
      });
    } catch {
      set({ loading: false });
    }
  },

  // =========================
  // RESET
  // =========================
  resetCurrentBlog: () => set({ currentBlog: null }),
}));
