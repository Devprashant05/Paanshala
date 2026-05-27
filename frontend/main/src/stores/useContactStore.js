import { create } from "zustand";
import api from "@/lib/axios";
import toast from "react-hot-toast";

export const useContactStore = create((set) => ({
  // =========================
  // STATE
  // =========================
  contactLoading: false,
  eventLoading: false,
  horecaLoading: false,

  // =========================
  // SUBMIT CONTACT FORM
  // =========================
  submitContact: async ({ fullName, email, phone, message }) => {
    try {
      set({ contactLoading: true });

      await api.post("/contact/submit", {
        fullName,
        email,
        phone,
        message,
      });

      toast.success("Your message has been sent successfully");

      set({ contactLoading: false });
      return true;
    } catch (error) {
      set({ contactLoading: false });

      toast.error(error?.response?.data?.message || "Failed to send message");

      return false;
    }
  },

  // =========================
  // SUBMIT EVENT BOOKING
  // =========================
  submitEventBooking: async ({
    fullName,
    phone,
    eventDate,
    eventLocation,
    gathering,
  }) => {
    try {
      set({ eventLoading: true });

      await api.post("/contact/event", {
        fullName,
        phone,
        eventDate,
        eventLocation,
        gathering,
      });

      toast.success("Event booking request submitted successfully");

      set({ eventLoading: false });
      return true;
    } catch (error) {
      set({ eventLoading: false });

      toast.error(
        error?.response?.data?.message || "Failed to submit event booking",
      );

      return false;
    }
  },

  // =========================
  // SUBMIT HORECA INQUIRY
  // =========================
  submitHorecaInquiry: async ({
    fullName,
    email,
    phone,
    businessName,
    businessType,
    city,
    requirement,
  }) => {
    try {
      set({ horecaLoading: true });

      await api.post("/contact/horeca", {
        fullName,
        email,
        phone,
        businessName,
        businessType,
        city,
        requirement,
      });

      toast.success("HoReCa inquiry submitted successfully");

      set({ horecaLoading: false });

      return true;
    } catch (error) {
      set({ horecaLoading: false });

      toast.error(
        error?.response?.data?.message || "Failed to submit HoReCa inquiry",
      );

      return false;
    }
  },
}));