import { create } from "zustand";
import api from "@/lib/axios";
import toast from "react-hot-toast";

export const useContactStore = create((set) => ({
  // =========================
  // STATE
  // =========================
  loading: false,

  // =========================
  // SUBMIT CONTACT FORM
  // =========================
  submitContact: async ({ fullName, email, phone, message }) => {
    try {
      set({ loading: true });

      await api.post("/contact/submit", {
        fullName,
        email,
        phone,
        message,
      });

      toast.success("Your message has been sent successfully");
      set({ loading: false });

      return true;
    } catch (error) {
      set({ loading: false });
      return false;
    }
  },
}));
