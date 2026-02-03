import { create } from "zustand";
import api from "@/lib/axios";
import toast from "react-hot-toast";

export const useCouponStore = create((set) => ({
  // =========================
  // STATE
  // =========================
  coupons: [],
  loading: false,

  // =========================
  // FETCH COUPONS (ADMIN)
  // =========================
  fetchCoupons: async () => {
    try {
      set({ loading: true });
      const res = await api.get("/coupons/admin/all");
      set({ coupons: res.data.coupons, loading: false });
    } catch {
      toast.error("Failed to fetch coupons");
      set({ loading: false });
    }
  },

  // =========================
  // CREATE COUPON
  // =========================
  createCoupon: async (data) => {
    try {
      set({ loading: true });
      await api.post("/coupons/admin/create", data);
      toast.success("Coupon created successfully");
      set({ loading: false });
      return true;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to create coupon");
      set({ loading: false });
      return false;
    }
  },

  // =========================
  // TOGGLE COUPON
  // =========================
  toggleCoupon: async (couponId, isActive) => {
    try {
      await api.patch(`/coupons/admin/toggle/${couponId}`, { isActive });
      toast.success("Coupon status updated");
      return true;
    } catch {
      toast.error("Failed to toggle coupon");
      return false;
    }
  },

  // =========================
  // UPDATE COUPON (FUTURE)
  // =========================
  updateCoupon: async (couponId, data) => {
    try {
      await api.put(`/coupons/admin/update/${couponId}`, data);
      toast.success("Coupon updated");
      return true;
    } catch {
      toast.error("Failed to update coupon");
      return false;
    }
  },
}));
