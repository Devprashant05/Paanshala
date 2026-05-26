// stores/useContactStore.js

import { create } from "zustand";
import axios from "@/lib/axios";

export const useContactStore = create((set) => ({
  loading: false,
  contacts: [],
  totalContacts: 0,
  success: false,
  error: null,

  // =============================
  // SUBMIT CONTACT FORM
  // =============================
  submitContactForm: async (formData) => {
    try {
      set({
        loading: true,
        success: false,
        error: null,
      });

      const res = await axios.post("/contact/submit", formData);

      set({
        loading: false,
        success: true,
      });

      return res.data;
    } catch (error) {
      set({
        loading: false,
        success: false,
        error: error.response?.data?.message || "Failed to submit contact form",
      });

      throw error;
    }
  },

  // =============================
  // ADMIN — GET ALL CONTACTS
  // =============================
  fetchAllContactsAdmin: async () => {
    try {
      set({
        loading: true,
        error: null,
      });

      const res = await axios.get("/contact/admin/all");

      set({
        loading: false,
        contacts: res.data.contacts || [],
        totalContacts: res.data.count || 0,
      });

      return res.data.contacts;
    } catch (error) {
      set({
        loading: false,
        error: error.response?.data?.message || "Failed to fetch contacts",
      });

      throw error;
    }
  },

  // =============================
  // ADMIN — MARK AS READ
  // =============================
  markContactAsRead: async (id) => {
    try {
      set({
        loading: true,
        error: null,
      });

      const res = await axios.patch(`/contact/admin/read/${id}`);

      set((state) => ({
        loading: false,
        contacts: state.contacts.map((contact) =>
          contact._id === id ? { ...contact, isRead: true } : contact,
        ),
      }));

      return res.data;
    } catch (error) {
      set({
        loading: false,
        error: error.response?.data?.message || "Failed to update contact",
      });

      throw error;
    }
  },

  // =============================
  // RESET STATUS
  // =============================
  resetContactState: () => {
    set({
      loading: false,
      success: false,
      error: null,
    });
  },
}));
