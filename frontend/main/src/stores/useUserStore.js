import { create } from "zustand";
import api from "@/lib/axios";
import toast from "react-hot-toast";

export const useUserStore = create((set, get) => ({
  // =========================
  // STATE
  // =========================
  user: null,
  loading: false,
  error: null,
  isAuthenticated: false,

  // =========================
  // REGISTER
  // =========================
  register: async (data) => {
    try {
      set({ loading: true, error: null });

      const res = await api.post("/user/register", data);

      toast.success(res.data.message);
      set({ loading: false });

      return true;
    } catch (error) {
      const message = error?.response?.data?.message || "Registration failed";

      set({ loading: false, error: message });
      toast.error(message);
      return false;
    }
  },

  // =========================
  // VERIFY OTP (AUTO LOGIN)
  // =========================
  verifyOtp: async ({ email, otp }) => {
    try {
      set({ loading: true, error: null });

      const res = await api.post("/user/verify-otp", { email, otp });

      set({
        user: res.data.user,
        isAuthenticated: true,
        loading: false,
      });

      toast.success(res.data.message);
      return true;
    } catch (error) {
      const message =
        error?.response?.data?.message || "OTP verification failed";

      set({ loading: false, error: message });
      toast.error(message);
      return false;
    }
  },

  // =========================
  // LOGIN
  // =========================
  login: async ({ email, password }) => {
    try {
      set({ loading: true, error: null });

      const res = await api.post("/user/login", { email, password });

      set({
        user: res.data.user,
        isAuthenticated: true,
        loading: false,
      });

      toast.success(res.data.message);
      return true;
    } catch (error) {
      const message = error?.response?.data?.message || "Login failed";

      set({ loading: false, error: message });
      toast.error(message);
      return false;
    }
  },

  // =========================
  // LOGOUT
  // =========================
  logout: async () => {
    try {
      await api.post("/user/logout");

      set({
        user: null,
        isAuthenticated: false,
      });

      toast.success("Logged out successfully");
    } catch {
      toast.error("Logout failed");
    }
  },

  // =========================
  // FETCH PROFILE (SESSION RESTORE)
  // =========================
  fetchProfile: async () => {
    try {
      set({ loading: true });

      const res = await api.get("/user/me");

      set({
        user: res.data.user,
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
  // UPDATE PROFILE
  // =========================
  updateProfile: async (formData) => {
    try {
      set({ loading: true });

      const res = await api.put("/user/update-profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      set({
        user: res.data.user,
        loading: false,
      });

      toast.success(res.data.message);
      return true;
    } catch (error) {
      const message = error?.response?.data?.message || "Profile update failed";

      set({ loading: false });
      toast.error(message);
      return false;
    }
  },

  // =========================
  // UPDATE PASSWORD (LOGGED IN)
  // =========================
  updatePassword: async (data) => {
    try {
      set({ loading: true });

      const res = await api.put("/user/update-password", data);

      set({ loading: false });
      toast.success(res.data.message);
      return true;
    } catch (error) {
      const message =
        error?.response?.data?.message || "Password update failed";

      set({ loading: false });
      toast.error(message);
      return false;
    }
  },

  // =========================
  // FORGOT PASSWORD
  // =========================
  forgotPassword: async (email) => {
    try {
      set({ loading: true });

      const res = await api.post("/user/forgot-password", { email });

      set({ loading: false });
      toast.success(res.data.message);
      return true;
    } catch (error) {
      const message = error?.response?.data?.message || "Failed to send OTP";

      set({ loading: false });
      toast.error(message);
      return false;
    }
  },

  // =========================
  // RESET PASSWORD (OTP)
  // =========================
  resetPassword: async (data) => {
    try {
      set({ loading: true });

      const res = await api.post("/user/reset-password", data);

      set({ loading: false });
      toast.success(res.data.message);
      return true;
    } catch (error) {
      const message = error?.response?.data?.message || "Password reset failed";

      set({ loading: false });
      toast.error(message);
      return false;
    }
  },

  // =========================
  // RESEND OTP
  // =========================
  resendOtp: async (email) => {
    try {
      set({ loading: true });

      const res = await api.post("/user/resend-otp", { email });

      set({ loading: false });
      toast.success(res.data.message);
      return true;
    } catch (error) {
      const message = error?.response?.data?.message || "Failed to resend OTP";

      set({ loading: false });
      toast.error(message);
      return false;
    }
  },

  // =========================
  // DELETE ACCOUNT
  // =========================
  deleteAccount: async () => {
    try {
      set({ loading: true });

      const res = await api.delete("/user/delete-account");

      set({
        user: null,
        isAuthenticated: false,
        loading: false,
      });

      toast.success(res.data.message);
      return true;
    } catch (error) {
      const message =
        error?.response?.data?.message || "Account deletion failed";

      set({ loading: false });
      toast.error(message);
      return false;
    }
  },

  // =========================
  // RESET STORE (CLIENT)
  // =========================
  resetUser: () => {
    set({
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null,
    });
  },
}));
