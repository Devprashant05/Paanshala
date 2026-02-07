import { create } from "zustand";
import api from "@/lib/axios";
import toast from "react-hot-toast";

export const useVideoBannerStore = create((set, get) => ({
  /* =========================
     STATE
  ========================== */
  banners: [], // public active banners
  adminBanners: [], // all banners for admin
  loading: false,
  error: null,

  /* =========================
     HELPERS
  ========================== */
  setLoading: (value) => set({ loading: value }),

  /* =========================
     PUBLIC: GET ACTIVE BANNERS
     GET /api/video-banners
  ========================== */
  fetchActiveBanners: async () => {
    try {
      set({ loading: true, error: null });

      const res = await api.get("/video-banners");

      set({
        banners: res.data.banners,
        loading: false,
      });
    } catch (error) {
      set({
        loading: false,
        error:
          error?.response?.data?.message || "Failed to fetch video banners",
      });
    }
  },

  /* =========================
     ADMIN: GET ALL BANNERS
     GET /api/video-banners/admin
  ========================== */
  fetchAllBannersAdmin: async () => {
    try {
      set({ loading: true, error: null });

      const res = await api.get("/video-banners/admin");

      set({
        adminBanners: res.data.banners,
        loading: false,
      });
    } catch (error) {
      set({
        loading: false,
        error:
          error?.response?.data?.message ||
          "Failed to fetch admin video banners",
      });
    }
  },

  /* =========================
     ADMIN: CREATE BANNER
     POST /api/video-banners/admin
     (multipart/form-data)
  ========================== */
  createVideoBanner: async (formData) => {
    try {
      set({ loading: true, error: null });

      const res = await api.post("/video-banners/admin", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(res.data.message || "Video banner created");

      // Optimistic update
      set((state) => ({
        adminBanners: [...state.adminBanners, res.data.banner],
        loading: false,
      }));

      return true;
    } catch (error) {
      const message =
        error?.response?.data?.message || "Failed to create video banner";

      toast.error(message);
      set({ loading: false, error: message });
      return false;
    }
  },

  /* =========================
     ADMIN: UPDATE BANNER
     PATCH /api/video-banners/admin/:id
  ========================== */
  updateVideoBanner: async (id, data) => {
    try {
      set({ loading: true, error: null });

      const res = await api.patch(`/video-banners/admin/${id}`, data);

      toast.success(res.data.message || "Video banner updated");

      set((state) => ({
        adminBanners: state.adminBanners.map((b) =>
          b._id === id ? res.data.banner : b,
        ),
        loading: false,
      }));

      return true;
    } catch (error) {
      const message =
        error?.response?.data?.message || "Failed to update video banner";

      toast.error(message);
      set({ loading: false, error: message });
      return false;
    }
  },

  /* =========================
     ADMIN: DELETE BANNER
     DELETE /api/video-banners/admin/:id
  ========================== */
  deleteVideoBanner: async (id) => {
    try {
      set({ loading: true, error: null });

      const res = await api.delete(`/video-banners/admin/${id}`);

      toast.success(res.data.message || "Video banner deleted");

      set((state) => ({
        adminBanners: state.adminBanners.filter((b) => b._id !== id),
        loading: false,
      }));

      return true;
    } catch (error) {
      const message =
        error?.response?.data?.message || "Failed to delete video banner";

      toast.error(message);
      set({ loading: false, error: message });
      return false;
    }
  },

  /* =========================
     RESET STORE
  ========================== */
  resetVideoBanners: () => {
    set({
      banners: [],
      adminBanners: [],
      loading: false,
      error: null,
    });
  },
}));
