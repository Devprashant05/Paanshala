import { create } from "zustand";
import api from "@/lib/axios";
import toast from "react-hot-toast";

export const useCouponStore = create((set, get) => ({
  // =========================
  // STATE
  // =========================
  coupon: null,
  loading: false,
  error: null,

  // =========================
  // VALIDATE + APPLY COUPON
  // The CartPage calls this. cartTotal is required so the backend
  // can enforce minCartValue. Returns { success, coupon } or { error }.
  // =========================
  validateCoupon: async ({ code, cartTotal, categories = [] }) => {
    try {
      set({ loading: true, error: null });

      const res = await api.post("/coupons/validate", {
        code: code.toUpperCase(),
        cartTotal, // ← critical — was missing, caused minCartValue bypass
        categories,
      });

      const coupon = res.data.coupon;

      set({ coupon, loading: false, error: null });
      toast.success(`Coupon "${coupon.code}" applied! 🎉`);

      return { success: true, coupon };
    } catch (err) {
      const message = err?.response?.data?.message || "Invalid coupon";

      set({ coupon: null, loading: false, error: message });
      toast.error(message);

      // Return error so CartPage can show it inline (not just toast)
      return { error: message };
    }
  },

  // =========================
  // FETCH USER-FACING COUPONS
  // Used by Navbar for the rotating announcement banner
  // =========================
  fetchAllCouponsUser: async () => {
    try {
      const res = await api.get("/coupons/all");
      return res.data.coupons || [];
    } catch {
      toast.error("Failed to fetch coupons");
      return [];
    }
  },

  // =========================
  // CLEAR (called when coupon is removed from cart)
  // =========================
  clearCoupon: () => {
    set({ coupon: null, error: null });
  },
}));