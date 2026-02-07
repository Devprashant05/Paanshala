import { create } from "zustand";
import api from "@/lib/axios";
import toast from "react-hot-toast";

export const useCartStore = create((set, get) => ({
  // =========================
  // STATE
  // =========================
  cart: {
    items: [],
    subtotal: 0,
    discount: 0,
    totalAmount: 0,
    coupon: null,
  },
  loading: false,

  // =========================
  // HELPERS
  // =========================
  setLoading: (value) => set({ loading: value }),

  // =========================
  // GET CART
  // =========================
  fetchCart: async () => {
    try {
      set({ loading: true });

      const res = await api.get("/cart");

      set({
        cart: res.data.cart,
        loading: false,
      });
    } catch (error) {
      set({ loading: false });
      toast.error(error?.response?.data?.message || "Failed to fetch cart");
    }
  },

  // =========================
  // ADD TO CART
  // =========================
  addToCart: async ({ productId, quantity = 1, variantSetSize }) => {
    try {
      set({ loading: true });

      const res = await api.post("/cart/add", {
        productId,
        quantity,
        variantSetSize,
      });

      set({
        cart: res.data.cart,
        loading: false,
      });

      toast.success("Item added to cart");
      return true;
    } catch (error) {
      set({ loading: false });

      toast.error(error?.response?.data?.message || "Failed to add item");
      return false;
    }
  },

  // =========================
  // UPDATE CART ITEM
  // =========================
  updateCartItem: async ({ productId, quantity }) => {
    try {
      set({ loading: true });

      const res = await api.put("/cart/update", {
        productId,
        quantity,
      });

      set({
        cart: res.data.cart,
        loading: false,
      });

      return true;
    } catch (error) {
      set({ loading: false });

      toast.error(error?.response?.data?.message || "Failed to update cart");
      return false;
    }
  },

  // =========================
  // REMOVE FROM CART
  // =========================
  removeFromCart: async ({ productId, variantSetSize }) => {
    try {
      set({ loading: true });

      const res = await api.delete("/cart/remove", {
        data: { productId, variantSetSize },
      });

      set({
        cart: res.data.cart,
        loading: false,
      });

      toast.success("Item removed from cart");
      return true;
    } catch (error) {
      set({ loading: false });

      toast.error(error?.response?.data?.message || "Failed to remove item");
      return false;
    }
  },

  // =========================
  // APPLY COUPON
  // =========================
  applyCoupon: async (code) => {
    try {
      set({ loading: true });

      const res = await api.post("/cart/apply-coupon", { code });

      set({
        cart: res.data.cart,
        loading: false,
      });

      toast.success("Coupon applied successfully");
      return true;
    } catch (error) {
      set({ loading: false });

      toast.error(error?.response?.data?.message || "Invalid coupon");
      return false;
    }
  },

  // =========================
  // CLEAR CART
  // =========================
  clearCart: async () => {
    try {
      set({ loading: true });

      await api.delete("/cart/clear");

      set({
        cart: {
          items: [],
          subtotal: 0,
          discount: 0,
          totalAmount: 0,
          coupon: null,
        },
        loading: false,
      });

      toast.success("Cart cleared");
    } catch (error) {
      set({ loading: false });

      toast.error(error?.response?.data?.message || "Failed to clear cart");
    }
  },
}));
