import { create } from "zustand";
import api from "@/lib/axios";
import toast from "react-hot-toast";

export const useShopByVideoStore = create((set) => ({
  /* =========================
     STATE
  ========================== */
  videos: [], // public active videos
  adminVideos: [], // all videos for admin
  loading: false,
  error: null,

  /* =========================
     HELPERS
  ========================== */
  setLoading: (value) => set({ loading: value }),

  /* =========================
     USER: GET ACTIVE VIDEOS
     GET /api/shop-by-video
  ========================== */
  fetchShopByVideos: async () => {
    try {
      set({ loading: true, error: null });

      const res = await api.get("/shop-by-video");

      set({
        videos: res.data.videos,
        loading: false,
      });
    } catch (error) {
      set({
        loading: false,
        error:
          error?.response?.data?.message || "Failed to fetch shop by video",
      });
    }
  },

  /* =========================
     ADMIN: GET ALL VIDEOS
     GET /api/shop-by-video/admin/all
  ========================== */
  fetchShopByVideosAdmin: async () => {
    try {
      set({ loading: true, error: null });

      const res = await api.get("/shop-by-video/admin/all");

      set({
        adminVideos: res.data.videos,
        loading: false,
      });
    } catch (error) {
      set({
        loading: false,
        error: error?.response?.data?.message || "Failed to fetch admin videos",
      });
    }
  },

  /* =========================
     ADMIN: CREATE VIDEO
     POST /api/shop-by-video/admin/create
     (multipart/form-data)
  ========================== */
  createShopByVideo: async (formData) => {
    try {
      set({ loading: true, error: null });

      const res = await api.post("/shop-by-video/admin/create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(res.data.message || "Video created");

      set((state) => ({
        adminVideos: [res.data.video, ...state.adminVideos],
        loading: false,
      }));

      return true;
    } catch (error) {
      const message =
        error?.response?.data?.message || "Failed to create video";

      toast.error(message);
      set({ loading: false, error: message });
      return false;
    }
  },

  /* =========================
     ADMIN: UPDATE VIDEO
     PUT /api/shop-by-video/admin/update/:videoId
  ========================== */
  updateShopByVideo: async (videoId, data, isMultipart = false) => {
    try {
      set({ loading: true, error: null });

      const res = await api.put(
        `/shop-by-video/admin/update/${videoId}`,
        data,
        isMultipart
          ? { headers: { "Content-Type": "multipart/form-data" } }
          : {},
      );

      toast.success(res.data.message || "Video updated");

      set((state) => ({
        adminVideos: state.adminVideos.map((v) =>
          v._id === videoId ? res.data.video : v,
        ),
        loading: false,
      }));

      return true;
    } catch (error) {
      const message =
        error?.response?.data?.message || "Failed to update video";

      toast.error(message);
      set({ loading: false, error: message });
      return false;
    }
  },

  /* =========================
     ADMIN: TOGGLE VIDEO
     PATCH /api/shop-by-video/admin/toggle/:videoId
  ========================== */
  toggleShopByVideo: async (videoId, isActive) => {
    try {
      set({ loading: true, error: null });

      const res = await api.patch(`/shop-by-video/admin/toggle/${videoId}`, {
        isActive,
      });

      set((state) => ({
        adminVideos: state.adminVideos.map((v) =>
          v._id === videoId ? res.data.video : v,
        ),
        loading: false,
      }));

      return true;
    } catch (error) {
      const message =
        error?.response?.data?.message || "Failed to update video status";

      toast.error(message);
      set({ loading: false, error: message });
      return false;
    }
  },

  /* =========================
     RESET STORE
  ========================== */
  resetShopByVideo: () => {
    set({
      videos: [],
      adminVideos: [],
      loading: false,
      error: null,
    });
  },
}));
