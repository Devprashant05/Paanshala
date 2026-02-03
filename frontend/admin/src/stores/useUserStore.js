import { create } from "zustand";
import api from "@/lib/axios";
import toast from "react-hot-toast";

export const useUserStore = create((set, get) => ({
  // =========================
  // STATE
  // =========================
  user: null,
  isAuthenticated: false,
  loading: true,

  // =========================
  // CHECK AUTH (ON APP LOAD)
  // =========================
  checkAuth: async () => {
    try {
      set({ loading: true });

      /**
       * IMPORTANT:
       * Admin panel should always verify using /user/me
       * because admin routes are protected AFTER auth
       */
      const res = await api.get("/admin/me");

      const user = res.data.user;

      // Allow ONLY admin
      if (user.role !== "admin") {
        throw new Error("Unauthorized");
      }

      set({
        user,
        isAuthenticated: true,
        loading: false,
      });
    } catch (error) {
      set({
        user: null,
        isAuthenticated: false,
        loading: false,
      });
    }
  },

  // =========================
  // ADMIN LOGIN
  // =========================
  login: async ({ email, password }) => {
    try {
      set({ loading: true });

      const res = await api.post("/admin/login", {
        email,
        password,
      });

      const user = res.data.user;

      if (user.role !== "admin") {
        throw new Error("Not an admin");
      }

      set({
        user,
        isAuthenticated: true,
        loading: false,
      });

      toast.success("Welcome back, Admin");
      return true;
    } catch (error) {
      set({
        user: null,
        isAuthenticated: false,
        loading: false,
      });
      return false;
    }
  },

  // =========================
  // LOGOUT
  // =========================
  logout: async () => {
    try {
      await api.post("/user/logout");
    } catch (error) {
      // ignore
    } finally {
      set({
        user: null,
        isAuthenticated: false,
      });
      toast.success("Logged out successfully");
    }
  },

  // =========================
  // FORGOT PASSWORD (ADMIN)
  // =========================
  forgotPassword: async (email) => {
    try {
      await api.post("/admin/forgot-password", { email });
      toast.success("OTP sent to email");
      return true;
    } catch (error) {
      return false;
    }
  },

  // =========================
  // RESET PASSWORD (ADMIN)
  // =========================
  resetPassword: async ({ email, otp, newPassword }) => {
    try {
      await api.post("/admin/reset-password", {
        email,
        otp,
        newPassword,
      });
      toast.success("Password reset successfully");
      return true;
    } catch (error) {
      return false;
    }
  },

  // =========================
  // ADMIN ACTIONS
  // =========================
  fetchUsers: async () => {
    try {
      const res = await api.get("/admin/users");
      return res.data.users;
    } catch (error) {
      return [];
    }
  },

  createAdmin: async ({ full_name, email }) => {
    try {
      await api.post("/admin/create-admin", {
        full_name,
        email,
      });
      toast.success("Admin created successfully");
      return true;
    } catch (error) {
      return false;
    }
  },

  deleteUser: async (userId) => {
    try {
      await api.delete("/admin/delete-user", {
        data: { userId },
      });
      toast.success("User deleted");
      return true;
    } catch (error) {
      return false;
    }
  },
}));
