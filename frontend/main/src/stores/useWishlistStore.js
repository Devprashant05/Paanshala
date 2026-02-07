import { create } from "zustand";
import api from "@/lib/axios";
import toast from "react-hot-toast";

export const useWishlistStore = create((set, get) => ({
  /* =========================
     STATE
  ========================== */
  wishlist: [],
  loading: false,

  /* =========================
     HELPERS
  ========================== */
  setLoading: (value) => set({ loading: value }),

  /* =========================
     GET WISHLIST
  ========================== */
  getWishlist: async () => {
    try {
      set({ loading: true });

      const { data } = await api.get("/wishlist");

      set({
        wishlist: data.wishlist || [],
      });
    } catch (error) {
      console.error("getWishlist", error);
      toast.error("Failed to load wishlist");
    } finally {
      set({ loading: false });
    }
  },

  /* =========================
     ADD TO WISHLIST
  ========================== */
  addToWishlist: async (productId) => {
    try {
      set({ loading: true });

      const { data } = await api.post("/wishlist/add", {
        productId,
      });

      toast.success(data.message || "Added to wishlist");

      // refresh wishlist
      get().getWishlist();
    } catch (error) {
      console.error("addToWishlist", error);
      toast.error(
        error?.response?.data?.message || "Unable to add to wishlist",
      );
    } finally {
      set({ loading: false });
    }
  },

  /* =========================
     REMOVE FROM WISHLIST
  ========================== */
  removeFromWishlist: async (productId) => {
    try {
      set({ loading: true });

      const { data } = await api.delete(`/wishlist/remove/${productId}`);

      toast.success(data.message || "Removed from wishlist");

      set((state) => ({
        wishlist: state.wishlist.filter((item) => item._id !== productId),
      }));
    } catch (error) {
      console.error("removeFromWishlist", error);
      toast.error(error?.response?.data?.message || "Unable to remove product");
    } finally {
      set({ loading: false });
    }
  },

  /* =========================
     CHECK WISHLIST STATUS
  ========================== */
  checkWishlistStatus: async (productId) => {
    try {
      const { data } = await api.get(`/wishlist/check/${productId}`);

      return data.isWishlisted;
    } catch (error) {
      console.error("checkWishlistStatus", error);
      return false;
    }
  },
}));
