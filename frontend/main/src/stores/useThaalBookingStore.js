import { create } from "zustand";
import api from "@/lib/axios";
import toast from "react-hot-toast";

export const useThaalBookingStore = create((set) => ({
  // =========================
  // STATE
  // =========================
  thaalLoading: false,

  // =========================
  // SUBMIT PAAN THAAL REQUEST
  // =========================
  submitThaalBooking: async ({
    fullName,
    email,
    phone,
    thaalQuantity,
    preferredDate,
    preferredTime,
  }) => {
    try {
      set({ thaalLoading: true });

      await api.post("/contact/paan-thaal", {
        fullName,
        email,
        phone,
        thaalQuantity,
        preferredDate,
        preferredTime,
      });

      toast.success("Your Paan Thaal request has been sent successfully");

      set({ thaalLoading: false });
      return true;
    } catch (error) {
      set({ thaalLoading: false });

      toast.error(
        error?.response?.data?.message || "Failed to submit Paan Thaal request",
      );

      return false;
    }
  },
}));
