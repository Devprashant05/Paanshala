import { create } from "zustand";
import api from "@/lib/axios";
import toast from "react-hot-toast";

export const useCartStore = create((set) => ({
  // =========================
  // STATE
  // =========================
  cart: null,
  cartLoading: false,

  adminCartData: [],
  adminCartLoading: false,

  // =========================
  // GET USER CART
  // =========================
  fetchCart: async () => {
    try {
      set({ cartLoading: true });

      const res = await api.get("/cart");

      set({ cart: res.data.cart });
    } catch (error) {
      console.error("fetchCart", error);
    } finally {
      set({ cartLoading: false });
    }
  },

  // =========================
  // ADD TO CART
  // =========================
  addToCart: async (payload) => {
    try {
      const res = await api.post("/cart/add", payload);

      set({ cart: res.data.cart });
      toast.success("Added to cart");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Error adding to cart");
    }
  },

  // =========================
  // UPDATE CART ITEM
  // =========================
  updateCartItem: async (payload) => {
    try {
      const res = await api.put("/cart/update", payload);

      set({ cart: res.data.cart });
    } catch (error) {
      toast.error("Error updating cart");
    }
  },

  // =========================
  // REMOVE FROM CART
  // =========================
  removeFromCart: async (payload) => {
    try {
      const res = await api.delete("/cart/remove", { data: payload });

      set({ cart: res.data.cart });
      toast.success("Item removed");
    } catch (error) {
      toast.error("Error removing item");
    }
  },

  // =========================
  // APPLY COUPON
  // =========================
  applyCoupon: async (code) => {
    try {
      const res = await api.post("/cart/apply-coupon", { code });

      set({ cart: res.data.cart });
      toast.success("Coupon applied");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Invalid coupon");
    }
  },

  // =========================
  // REMOVE COUPON
  // =========================
  removeCoupon: async () => {
    try {
      const res = await api.post("/cart/remove-coupon");

      set({ cart: res.data.cart });
      toast.success("Coupon removed");
    } catch (error) {
      toast.error("Error removing coupon");
    }
  },

  // =========================
  // CLEAR CART
  // =========================
  clearCart: async () => {
    try {
      await api.delete("/cart/clear");

      set({ cart: null });
      toast.success("Cart cleared");
    } catch (error) {
      toast.error("Error clearing cart");
    }
  },

  // =========================
  // ADMIN: GET USERS CART DATA
  // =========================
  fetchAdminCartData: async () => {
    try {
      set({ adminCartLoading: true });

      const res = await api.get("/cart/admin");

      set({ adminCartData: res.data.data });
    } catch (error) {
      console.error("fetchAdminCartData", error);
      toast.error("Failed to load cart data");
    } finally {
      set({ adminCartLoading: false });
    }
  },
}));
