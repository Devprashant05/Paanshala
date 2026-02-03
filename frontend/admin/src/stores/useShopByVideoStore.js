import { create } from "zustand";
import api from "@/lib/axios";
import toast from "react-hot-toast";

export const useShopByVideoStore = create((set) => ({
  // =========================
  // STATE
  // =========================
  videos: [],
  loading: false,

  // =========================
  // FETCH VIDEOS (ADMIN)
  // =========================
  fetchVideos: async () => {
    try {
      set({ loading: true });
      const res = await api.get("/shop-by-video/admin/all");
      set({ videos: res.data.videos, loading: false });
    } catch {
      toast.error("Failed to fetch videos");
      set({ loading: false });
    }
  },

  // =========================
  // CREATE VIDEO
  // =========================
  createVideo: async (formData) => {
    try {
      set({ loading: true });
      await api.post("/shop-by-video/admin/create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Video uploaded successfully");
      set({ loading: false });
      return true;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to upload video");
      set({ loading: false });
      return false;
    }
  },

  // =========================
  // TOGGLE VIDEO
  // =========================
  toggleVideo: async (videoId, isActive) => {
    try {
      await api.patch(`/shop-by-video/admin/toggle/${videoId}`, { isActive });
      toast.success("Video status updated");
      return true;
    } catch {
      toast.error("Failed to update video status");
      return false;
    }
  },

  // =========================
  // UPDATE VIDEO (FUTURE)
  // =========================
  updateVideo: async (videoId, formData) => {
    try {
      await api.put(`/shop-by-video/admin/update/${videoId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Video updated successfully");
      return true;
    } catch {
      toast.error("Failed to update video");
      return false;
    }
  },
}));
