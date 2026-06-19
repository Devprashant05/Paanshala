import { create } from "zustand";
import api from "@/lib/axios";

export const useHorecaPageStore = create((set) => ({
  page: null,
  products: [],
  loading: false,

  fetchHorecaPage: async () => {
    try {
      set({ loading: true });
      const res = await api.get("/horeca-page");
      set({
        page: res.data.page,
        products: res.data.products || [],
        loading: false,
      });
    } catch (error) {
      console.error("fetchHorecaPage", error);
      set({ loading: false });
    }
  },
}));
