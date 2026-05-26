// stores/useRewardStore.js

import { create } from "zustand";
import api from "@/lib/axios";

export const useRewardStore = create((set, get) => ({
  // =====================================
  // STATE
  // =====================================

  rewards: [],

  summary: {
    totalEarned: 0,
    totalRedeemed: 0,
    currentBalance: 0,
  },

  pagination: {
    total: 0,
    page: 1,
    pages: 1,
    limit: 10,
  },

  loading: false,
  error: null,

  // =====================================
  // GET REWARD HISTORY
  // =====================================

  getRewardHistory: async (page = 1, limit = 10) => {
    try {
      set({
        loading: true,
        error: null,
      });

      const response = await api.get(
        `/rewards/my-history?page=${page}&limit=${limit}`,
      );

      const data = response.data;

      set({
        rewards: data.rewards || [],

        summary: data.summary || {
          totalEarned: 0,
          totalRedeemed: 0,
          currentBalance: 0,
        },

        pagination: data.pagination || {
          total: 0,
          page: 1,
          pages: 1,
          limit: 10,
        },

        loading: false,
      });

      return {
        success: true,
      };
    } catch (error) {
      console.error("getRewardHistory", error);

      set({
        loading: false,
        error:
          error?.response?.data?.message || "Failed to fetch reward history",
      });

      return {
        success: false,
        message:
          error?.response?.data?.message || "Failed to fetch reward history",
      };
    }
  },

  // =====================================
  // CLEAR REWARD STORE
  // =====================================

  clearRewards: () => {
    set({
      rewards: [],

      summary: {
        totalEarned: 0,
        totalRedeemed: 0,
        currentBalance: 0,
      },

      pagination: {
        total: 0,
        page: 1,
        pages: 1,
        limit: 10,
      },

      loading: false,
      error: null,
    });
  },
}));
