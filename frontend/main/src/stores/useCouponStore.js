import { create } from "zustand";
import api from "@/lib/axios";
import toast from "react-hot-toast";

export const useCouponStore = create((set, get) => ({
  // =========================
  // STATE
  // =========================
  coupon: null, // validated coupon
  loading: false,
  error: null,

  // =========================
  // VALIDATE COUPON (PRE-CHECK)
  // =========================
  validateCoupon: async ({ code, cartTotal, categories }) => {
    try {
      set({ loading: true, error: null });

      const res = await api.post("/coupons/validate", {
        code,
        cartTotal,
        categories,
      });

      set({
        coupon: res.data.coupon,
        loading: false,
      });

      toast.success("Coupon is valid 🎉");
      return res.data.coupon;
    } catch (error) {
      const message = error?.response?.data?.message || "Invalid coupon";

      set({
        coupon: null,
        loading: false,
        error: message,
      });

      toast.error(message);
      return null;
    }
  },

  // =========================
  // APPLY COUPON TO CART
  // =========================
  applyCouponToCart: async (code) => {
    try {
      set({ loading: true, error: null });

      const res = await api.post("/cart/apply-coupon", {
        code,
      });

      set({
        coupon: res.data.cart?.coupon || null,
        loading: false,
      });

      toast.success("Coupon applied successfully");
      return res.data.cart;
    } catch (error) {
      const message =
        error?.response?.data?.message || "Failed to apply coupon";

      set({
        loading: false,
        error: message,
      });

      toast.error(message);
      return null;
    }
  },

  // =========================
  // User
  // =========================
  fetchAllCouponsUser: async () => {
    try {
      const res = await api.get("/coupons/all");
      return res.data.coupons;
    } catch {
      toast.error("Failed to fetch coupons");
      return [];
    }
  },

  // =========================
  // RESET COUPON (UI RESET)
  // =========================
  clearCoupon: () => {
    set({
      coupon: null,
      error: null,
    });
  },
}));
