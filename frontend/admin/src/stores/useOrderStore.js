import { create } from "zustand";
import api from "@/lib/axios";
import toast from "react-hot-toast";

export const useOrderStore = create((set, get) => ({
  // =========================
  // STATE
  // =========================
  orders: [],
  localOrders: [],
  loading: false,
  localOrdersLoading: false,

  // =========================
  // FETCH ALL ORDERS (ADMIN)
  // =========================
  fetchOrders: async (filters = {}) => {
    try {
      set({ loading: true });
      const params = new URLSearchParams();
      if (filters.fulfillmentType)
        params.append("fulfillmentType", filters.fulfillmentType);
      if (filters.localStatus)
        params.append("localStatus", filters.localStatus);

      const res = await api.get(`/orders/admin/all?${params.toString()}`);
      set({ orders: res.data.orders, loading: false });
    } catch {
      toast.error("Failed to fetch orders");
      set({ loading: false });
    }
  },

  // =========================
  // EXPORT ORDERS (ADMIN)
  // =========================
  exportOrders: async (filters = {}) => {
    try {
      set({ loading: true });

      const params = new URLSearchParams();
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);

      const res = await api.get(`/orders/admin/export?${params.toString()}`, {
        responseType: "blob",
      });

      const disposition = res.headers["content-disposition"];
      let fileName = "orders.csv";
      if (disposition) {
        const match = disposition.match(/filename="?([^"]+)"?/);
        if (match?.[1]) fileName = match[1];
      }

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Orders exported successfully");
      return true;
    } catch (error) {
      if (error.response?.status === 404) {
        toast("No orders found for the selected date range.");
        return false;
      }
      toast.error(error?.response?.data?.message || "Failed to export orders");
      return false;
    } finally {
      set({ loading: false }); // ✅ always reset, success or failure
    }
  },

  // =========================
  // FETCH LOCAL ORDERS ONLY
  // Convenience method for the local orders admin view
  // =========================
  fetchLocalOrders: async (localStatus = null) => {
    try {
      set({ localOrdersLoading: true });
      const params = new URLSearchParams();
      params.append("fulfillmentType", "LOCAL");
      // Also fetch MIXED orders that have local items
      // We handle MIXED separately below
      if (localStatus) params.append("localStatus", localStatus);

      // Fetch LOCAL orders
      const localRes = await api.get(
        `/orders/admin/all?fulfillmentType=LOCAL${localStatus ? `&localStatus=${localStatus}` : ""}`,
      );

      // Fetch MIXED orders too
      const mixedRes = await api.get(
        `/orders/admin/all?fulfillmentType=MIXED${localStatus ? `&localStatus=${localStatus}` : ""}`,
      );

      const combined = [
        ...(localRes.data.orders || []),
        ...(mixedRes.data.orders || []),
      ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      set({ localOrders: combined, localOrdersLoading: false });
    } catch {
      toast.error("Failed to fetch local orders");
      set({ localOrdersLoading: false });
    }
  },

  // =========================
  // UPDATE ORDER STATUS (SHIPPED orders)
  // =========================
  updateOrderStatus: async (orderId, payload) => {
    try {
      const res = await api.patch(`/orders/admin/status/${orderId}`, payload);
      const updatedOrder = res.data.order;

      // Update in both orders and localOrders arrays
      set((state) => ({
        orders: state.orders.map((o) => (o._id === orderId ? updatedOrder : o)),
        localOrders: state.localOrders.map((o) =>
          o._id === orderId ? updatedOrder : o,
        ),
      }));

      toast.success("Order status updated");
      return true;
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to update order status",
      );
      return false;
    }
  },

  // =========================
  // UPDATE LOCAL FULFILLMENT STATUS
  // For paan / paan thaal orders fulfilled manually
  // =========================
  updateLocalOrderStatus: async (orderId, localStatus) => {
    try {
      const res = await api.patch(`/orders/admin/local-status/${orderId}`, {
        localStatus,
      });
      const updatedOrder = res.data.order;

      // Update in both arrays
      set((state) => ({
        orders: state.orders.map((o) => (o._id === orderId ? updatedOrder : o)),
        localOrders: state.localOrders.map((o) =>
          o._id === orderId ? updatedOrder : o,
        ),
      }));

      toast.success(`Local status updated to ${localStatus}`);
      return true;
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to update local order status",
      );
      return false;
    }
  },

  // =========================
  // UPDATE ORDER ADDRESS
  // =========================
  updateOrderAddress: async (orderId, payload) => {
    try {
      const res = await api.put(`/orders/admin/${orderId}/address`, payload);
      const updatedOrder = res.data.order;
      const shiprocketResult = res.data.shiprocket;

      // Update state locally
      set((state) => ({
        orders: state.orders.map((o) => (o._id === orderId ? updatedOrder : o)),
        localOrders: state.localOrders.map((o) =>
          o._id === orderId ? updatedOrder : o,
        ),
      }));

      // Show appropriate toast based on Shiprocket sync result
      if (
        shiprocketResult?.synced === false &&
        shiprocketResult?.message?.includes("sync failed")
      ) {
        toast.success("Address updated in our system");
        toast.error(
          `Shiprocket sync failed — please update manually on Shiprocket`,
          {
            duration: 6000,
          },
        );
      } else if (shiprocketResult?.synced) {
        toast.success("Address updated and synced to Shiprocket");
      } else {
        toast.success("Address updated successfully");
      }

      return updatedOrder;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update address");
      return false;
    }
  },

  // =========================
  // HELPERS
  // =========================

  // Get a single order from current state by ID
  getOrderById: (orderId) => {
    const { orders, localOrders } = get();
    return (
      orders.find((o) => o._id === orderId) ||
      localOrders.find((o) => o._id === orderId) ||
      null
    );
  },

  // =========================
  // GENERATE SHIPPING LABEL
  // =========================
  generateShippingLabel: async (orderId, orderNumber) => {
    try {
      const res = await api.get(`/orders/admin/${orderId}/label`, {
        responseType: "blob",
      });

      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const win = window.open(url, "_blank");

      // Revoke after tab has loaded
      if (win) {
        win.addEventListener("load", () => URL.revokeObjectURL(url), {
          once: true,
        });
      } else {
        // Fallback: trigger download if popup was blocked
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `label-${orderNumber}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }

      return true;
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to generate shipping label",
      );
      return false;
    }
  },

  // Clear local orders (useful on unmount)
  clearLocalOrders: () => set({ localOrders: [] }),
}));
