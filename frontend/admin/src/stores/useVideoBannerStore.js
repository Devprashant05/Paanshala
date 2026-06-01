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
      toast.error("Failed to fetch banners");
      set({ loading: false });
    }
  },

  /* =========================
     (PUBLIC) FETCH ACTIVE BANNERS
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
     (ADMIN) CREATE BANNER
  ========================== */
  createBanner: async (formData) => {
    try {
      set({ loading: true });

      await api.post("/video-banners/admin", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Banner created successfully");

      set({ loading: false });

      return true;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to create banner");

      set({ loading: false });

      return false;
    }
  },

  /* =========================
     (ADMIN) UPDATE BANNER
  ========================== */
  updateBanner: async (id, payload) => {
    try {
      const isFormData = payload instanceof FormData;

      await api.patch(
        `/video-banners/admin/${id}`,
        payload,
        isFormData
          ? {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          : undefined,
      );

      toast.success("Banner updated");

      return true;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update banner");

      return false;
    }
  },

  /* =========================
     (ADMIN) TOGGLE STATUS
  ========================== */
  toggleBanner: async (id, isActive) => {
    try {
      await api.patch(`/video-banners/admin/${id}`, {
        isActive,
      });

      toast.success("Banner status updated");

      return true;
    } catch {
      toast.error("Failed to update banner status");

      return false;
    }
  },

  /* =========================
     (ADMIN) DELETE BANNER
  ========================== */
  deleteBanner: async (id) => {
    try {
      await api.delete(`/video-banners/admin/${id}`);

      toast.success("Banner deleted");

      return true;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete banner");

      return false;
    }
  },
}));