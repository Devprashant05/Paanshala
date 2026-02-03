import { create } from "zustand";
import api from "@/lib/axios";
import toast from "react-hot-toast";

export const useUserStore = create((set) => ({
  // =========================
  // STATE
  // =========================
  user: null,
  isAuthenticated: false,
  loading: true,

  // =========================
  // CHECK AUTH (ADMIN)
  // =========================
  checkAuth: async () => {
    try {
      set({ loading: true });

      const res = await api.get("/admin/me");
      const user = res.data.user;

      if (user.role !== "admin") throw new Error("Unauthorized");

      set({
        user,
        isAuthenticated: true,
        loading: false,
      });
    } catch {
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

      const res = await api.post("/admin/login", { email, password });
      const user = res.data.user;

      if (user.role !== "admin") throw new Error();

      set({
        user,
        isAuthenticated: true,
        loading: false,
      });

      toast.success(`Welcome back, ${user.full_name}`);
      return true;
    } catch {
      set({
        user: null,
        isAuthenticated: false,
        loading: false,
      });
      return false;
    }
  },

  // =========================
  // LOGOUT (COMMON)
  // =========================
  logout: async () => {
    try {
      await api.post("/admin/logout");
    } finally {
      set({ user: null, isAuthenticated: false });
      toast.success("Logged out successfully");
    }
  },

  // =========================
  // PROFILE ACTIONS (ADMIN)
  // =========================
  refreshProfile: async () => {
    try {
      const res = await api.get("/admin/me");
      set({ user: res.data.user });
    } catch {
      set({ user: null, isAuthenticated: false });
    }
  },

  updateProfile: async (formData) => {
    try {
      await api.put("/admin/update-profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Profile updated successfully");
      return true;
    } catch {
      toast.error("Failed to update profile");
      return false;
    }
  },

  updatePassword: async ({ currentPassword, newPassword }) => {
    try {
      await api.put("/admin/update-password", {
        currentPassword,
        newPassword,
      });
      toast.success("Password updated successfully");
      return true;
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to update password",
      );
      return false;
    }
  },

  deleteAccount: async () => {
    try {
      await api.delete("/user/delete-account");
      toast.success("Account deleted");
      return true;
    } catch {
      toast.error("Failed to delete account");
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
    } catch {
      return [];
    }
  },

  createAdmin: async ({ full_name, email }) => {
    try {
      await api.post("/admin/create-admin", { full_name, email });
      toast.success("Admin created successfully");
      return true;
    } catch {
      return false;
    }
  },

  deleteUser: async (userId) => {
    try {
      await api.delete("/admin/delete-user", { data: { userId } });
      toast.success("User deleted");
      return true;
    } catch {
      return false;
    }
  },

  // =========================
  // USERS PAGE HELPERS
  // =========================
  fetchAllUsers: async () => {
    try {
      const res = await api.get("/admin/users");
      return res.data.users || [];
    } catch {
      toast.error("Failed to fetch users");
      return [];
    }
  },
}));
