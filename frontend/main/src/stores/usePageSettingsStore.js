import { create } from "zustand";
import api from "@/lib/axios";
import toast from "react-hot-toast";

export const usePageSettingsStore = create((set) => ({
  // =========================
  // STATE
  // =========================
  settings: null,
  loading: false,

  // =========================
  // FETCH SETTINGS
  // =========================
  fetchPageSettings: async () => {
    try {
      set({ loading: true });

      const res = await api.get("/page-settings");
      set({
        settings: res.data.settings,
        loading: false,
      });
    } catch {
      toast.error("Failed to fetch page settings");
      set({ loading: false });
    }
  },

  // =========================
  // UPDATE SETTINGS (UPSERT)
  // =========================
  updatePageSettings: async (data) => {
    try {
      set({ loading: true });

      const res = await api.post("/page-settings/admin/update", data);

      set({
        settings: res.data.settings,
        loading: false,
      });

      toast.success("Page settings updated successfully");
      return true;
    } catch {
      toast.error("Failed to update page settings");
      set({ loading: false });
      return false;
    }
  },
}));
