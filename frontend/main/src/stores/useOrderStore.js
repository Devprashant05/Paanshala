import { create } from "zustand";
import api from "@/lib/axios";
import toast from "react-hot-toast";

export const useOrderStore = create((set) => ({
  loading: false,
  razorpayOrder: null,
  order: null,
  orders: [],
  currentOrder: null,

  /* =========================
     CREATE RAZORPAY ORDER
  ========================= */
  createPaymentOrder: async () => {
    try {
      set({ loading: true });

      const res = await api.post("/orders/create-payment");

      set({
        razorpayOrder: res.data.razorpayOrder,
        loading: false,
      });

      return res.data.razorpayOrder;
    } catch (error) {
      set({ loading: false });
      toast.error(
        error?.response?.data?.message || "Failed to initiate payment",
      );
      return null;
    }
  },

  /* =========================
     VERIFY PAYMENT & CREATE ORDER
  ========================= */
  verifyPaymentAndCreateOrder: async (payload) => {
    try {
      set({ loading: true });

      const res = await api.post("/orders/verify", payload);

      set({
        order: res.data.order,
        loading: false,
      });

      toast.success("Order placed successfully 🎉");
      return res.data.order;
    } catch (error) {
      set({ loading: false });
      toast.error(
        error?.response?.data?.message || "Payment verification failed",
      );
      return null;
    }
  },

  /* =========================
     GET MY ORDERS
  ========================= */
  fetchMyOrders: async () => {
    try {
      set({ loading: true });

      const res = await api.get("/orders/my");

      set({
        orders: res.data.orders,
        loading: false,
      });

      return res.data.orders;
    } catch (error) {
      set({ loading: false });
      toast.error("Failed to fetch orders");
      return null;
    }
  },

  /* =========================
     GET ORDER DETAILS
  ========================= */
  fetchOrderDetails: async (orderId) => {
    try {
      set({ loading: true });

      const res = await api.get(`/orders/${orderId}`);

      set({
        currentOrder: res.data.order,
        loading: false,
      });

      return res.data.order;
    } catch (error) {
      set({ loading: false });
      toast.error("Failed to fetch order details");
      return null;
    }
  },

  /* =========================
     RESET
  ========================= */
  resetOrder: () =>
    set({
      razorpayOrder: null,
      order: null,
      loading: false,
    }),

  resetCurrentOrder: () =>
    set({
      currentOrder: null,
    }),
}));
