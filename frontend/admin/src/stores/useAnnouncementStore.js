import { create } from "zustand";
import api from "@/lib/axios";
import toast from "react-hot-toast";

export const useAnnouncementStore = create((set, get) => ({
  // ─────────────────────────────────
  // STATE
  // ─────────────────────────────────
  announcements: [], // admin: all
  activeAnnouncements: [], // public: active only
  loading: false,

  // ─────────────────────────────────
  // PUBLIC — fetch active slides
  // ─────────────────────────────────
  fetchActiveAnnouncements: async () => {
    try {
      const res = await api.get("/announcements");
      set({ activeAnnouncements: res.data.announcements || [] });
    } catch {
      // silent — bar just won't show
    }
  },

  // ─────────────────────────────────
  // ADMIN — fetch all
  // ─────────────────────────────────
  fetchAllAnnouncements: async () => {
    try {
      set({ loading: true });
      const res = await api.get("/announcements/admin/all");
      set({ announcements: res.data.announcements || [], loading: false });
    } catch {
      toast.error("Failed to fetch announcements");
      set({ loading: false });
    }
  },

  // ─────────────────────────────────
  // ADMIN — create
  // ─────────────────────────────────
  createAnnouncement: async (data) => {
    try {
      const res = await api.post("/announcements/admin", data);
      set((state) => ({
        announcements: [res.data.announcement, ...state.announcements],
      }));
      toast.success("Announcement created");
      return res.data.announcement;
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create");
      return null;
    }
  },

  // ─────────────────────────────────
  // ADMIN — update
  // ─────────────────────────────────
  updateAnnouncement: async (id, data) => {
    try {
      const res = await api.patch(`/announcements/admin/${id}`, data);
      set((state) => ({
        announcements: state.announcements.map((a) =>
          a._id === id ? res.data.announcement : a,
        ),
      }));
      toast.success("Announcement updated");
      return res.data.announcement;
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update");
      return null;
    }
  },

  // ─────────────────────────────────
  // ADMIN — toggle active
  // ─────────────────────────────────
  toggleAnnouncement: async (id) => {
    try {
      const res = await api.patch(`/announcements/admin/${id}/toggle`);
      set((state) => ({
        announcements: state.announcements.map((a) =>
          a._id === id ? res.data.announcement : a,
        ),
      }));
      return true;
    } catch {
      toast.error("Failed to toggle");
      return false;
    }
  },

  // ─────────────────────────────────
  // ADMIN — reorder
  // items = [{ id, order }, ...]
  // ─────────────────────────────────
  reorderAnnouncements: async (items) => {
    try {
      const res = await api.patch("/announcements/admin/reorder", {
        items,
      });
      set({ announcements: res.data.announcements || [] });
      return true;
    } catch {
      toast.error("Failed to reorder");
      return false;
    }
  },

  // ─────────────────────────────────
  // ADMIN — delete
  // ─────────────────────────────────
  deleteAnnouncement: async (id) => {
    try {
      await api.delete(`/announcements/admin/${id}`);
      set((state) => ({
        announcements: state.announcements.filter((a) => a._id !== id),
      }));
      toast.success("Announcement deleted");
      return true;
    } catch {
      toast.error("Failed to delete");
      return false;
    }
  },
}));
