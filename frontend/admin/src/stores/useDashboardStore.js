import { create } from "zustand";
import api from "@/lib/axios";

export const useDashboardStore = create((set, get) => ({
  // ======================
  // STATE
  // ======================
  metrics: null,
  year: new Date().getFullYear(), // selected year for charts
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
      todayOrders: m.orders.today.orders,
      todayRevenue: m.orders.today.revenue,
      avgRating: m.reviews.averageRating,
      unreadContacts: m.contacts.unread,
    };
  },

  get charts() {
    const m = get().metrics;
    if (!m?.charts) return null;
    return m.charts; // { monthly, daily, topProducts, paymentMethods, fulfillmentTypes }
  },

  get orderStatusBreakdown() {
    return get().metrics?.orders?.statusBreakdown ?? null;
  },

  // ======================
  // ACTIONS
  // ======================
  setYear: (year) => {
    set({ year });
    // Re-fetch automatically when year changes
    get().fetchMetrics();
  },

  fetchMetrics: async ({ silent = false } = {}) => {
    try {
      if (!silent) set({ loading: true, error: null });

      const year = get().year;
      const res = await api.get(`/dashboard/admin/metrics?year=${year}`);

      set({
        metrics: res.data.metrics,
        year: res.data.year, // sync back what the server used
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
      year: new Date().getFullYear(),
      loading: false,
      error: null,
    });
  },
}));
