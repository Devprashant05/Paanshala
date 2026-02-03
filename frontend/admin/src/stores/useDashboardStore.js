import { create } from "zustand";
import api from "@/lib/axios";

export const useDashboardStore = create((set, get) => ({
  // ======================
  // STATE
  // ======================
  metrics: null,
  loading: false,
  error: null,

  // ======================
  // DERIVED (UI HELPERS)
  // ======================
  get hasData() {
    return !!get().metrics;
  },

  get kpis() {
    const m = get().metrics;
    if (!m) return null;

    return {
      totalUsers: m.users.total,
      totalProducts: m.products.total,
      totalOrders: m.orders.total,
      totalRevenue: m.orders.revenue,
      todayRevenue: m.orders.today.revenue,
    };
  },

  // ======================
  // ACTIONS
  // ======================
  fetchMetrics: async ({ silent = false } = {}) => {
    try {
      if (!silent) set({ loading: true, error: null });

      const res = await api.get("/dashboard/admin/metrics");

      set({
        metrics: res.data.metrics,
        loading: false,
      });
    } catch (error) {
      set({
        error:
          error?.response?.data?.message || "Failed to load dashboard metrics",
        loading: false,
      });
    }
  },

  resetDashboard: () => {
    set({
      metrics: null,
      loading: false,
      error: null,
    });
  },
}));
