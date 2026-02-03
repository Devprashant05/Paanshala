import { create } from "zustand";
import api from "@/lib/axios";
import toast from "react-hot-toast";

export const useOrderStore = create((set) => ({
  // =========================
  // STATE
  // =========================
  orders: [],
  loading: false,

  // =========================
  // FETCH ALL ORDERS (ADMIN)
  // =========================
  fetchOrders: async () => {
    try {
      set({ loading: true });
      const res = await api.get("/orders/admin/all");
      set({ orders: res.data.orders, loading: false });
    } catch {
      toast.error("Failed to fetch orders");
      set({ loading: false });
    }
  },

  // =========================
  // UPDATE ORDER STATUS
  // =========================
  updateOrderStatus: async (orderId, status) => {
    try {
      await api.patch(`/orders/admin/status/${orderId}`, { status });
      toast.success("Order status updated");
      return true;
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to update order status",
      );
      return false;
    }
  },
}));
