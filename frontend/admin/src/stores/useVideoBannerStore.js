import { create } from "zustand";
import api from "@/lib/axios";
import toast from "react-hot-toast";

export const useVideoBannerStore = create((set) => ({
  /* =========================
     STATE
  ========================== */
  banners: [],
  loading: false,

  /* =========================
     HELPERS
  ========================== */
  setLoading: (value) => set({ loading: value }),

  /* =========================
     (ADMIN) FETCH ALL BANNERS
     GET /api/video-banners/admin
  ========================== */
  fetchBanners: async () => {
    try {
      set({ loading: true });
      const res = await api.get("/video-banners/admin");
      set({
        banners: res.data.banners || [],
        loading: false,
      });
    } catch (error) {
      toast.error("Failed to fetch video banners");
      set({ loading: false });
    }
  },

  /* =========================
     (PUBLIC) FETCH ACTIVE BANNERS
     GET /api/video-banners
  ========================== */
  fetchActiveBanners: async () => {
    try {
      const res = await api.get("/video-banners");
      set({
        banners: res.data.banners || [],
      });
    } catch {
      toast.error("Failed to fetch active banners");
    }
  },

  /* =========================
     (ADMIN) CREATE VIDEO BANNER
     POST /api/video-banners/admin
  ========================== */
  createBanner: async (formData) => {
    try {
      set({ loading: true });

      await api.post("/video-banners/admin", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Video banner uploaded successfully");
      set({ loading: false });
      return true;
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to upload video banner",
      );
      set({ loading: false });
      return false;
    }
  },

  /* =========================
     (ADMIN) UPDATE BANNER
     PATCH /api/video-banners/admin/:id
  ========================== */
  updateBanner: async (id, payload) => {
    try {
      await api.patch(`/video-banners/admin/${id}`, payload);
      toast.success("Video banner updated");
      return true;
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to update video banner",
      );
      return false;
    }
  },

  /* =========================
     (ADMIN) TOGGLE ACTIVE STATUS
  ========================== */
  toggleBanner: async (id, isActive) => {
    try {
      await api.patch(`/video-banners/admin/${id}`, { isActive });
      toast.success("Banner status updated");
      return true;
    } catch {
      toast.error("Failed to update banner status");
      return false;
    }
  },

  /* =========================
     (ADMIN) DELETE BANNER
     DELETE /api/video-banners/admin/:id
  ========================== */
  deleteBanner: async (id) => {
    try {
      await api.delete(`/video-banners/admin/${id}`);
      toast.success("Video banner deleted");
      return true;
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to delete video banner",
      );
      return false;
    }
  },
}));
