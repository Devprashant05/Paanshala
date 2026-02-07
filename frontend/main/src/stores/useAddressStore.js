import { create } from "zustand";
import api from "@/lib/axios";
import toast from "react-hot-toast";

export const useAddressStore = create((set, get) => ({
  // =========================
  // STATE
  // =========================
  addresses: [],
  loading: false,

  // =========================
  // GET ALL ADDRESSES
  // =========================
  fetchAddresses: async () => {
    try {
      set({ loading: true });

      const res = await api.get("/addresses");

      set({
        addresses: res.data.addresses,
        loading: false,
      });
    } catch (error) {
      set({ loading: false });
      toast.error("Failed to fetch addresses");
    }
  },

  // =========================
  // ADD ADDRESS
  // =========================
  addAddress: async (data) => {
    try {
      set({ loading: true });

      const res = await api.post("/addresses/add", data);

      set({
        addresses: [res.data.address, ...get().addresses],
        loading: false,
      });

      toast.success(res.data.message);
      return true;
    } catch (error) {
      set({ loading: false });
      toast.error(error?.response?.data?.message || "Failed to add address");
      return false;
    }
  },

  // =========================
  // UPDATE ADDRESS
  // =========================
  updateAddress: async (addressId, data) => {
    try {
      set({ loading: true });

      const res = await api.put(`/addresses/update/${addressId}`, data);

      set({
        addresses: get().addresses.map((addr) =>
          addr._id === addressId ? res.data.address : addr,
        ),
        loading: false,
      });

      toast.success(res.data.message);
      return true;
    } catch (error) {
      set({ loading: false });
      toast.error(error?.response?.data?.message || "Failed to update address");
      return false;
    }
  },

  // =========================
  // DELETE ADDRESS
  // =========================
  deleteAddress: async (addressId) => {
    try {
      set({ loading: true });

      await api.delete(`/addresses/delete/${addressId}`);

      set({
        addresses: get().addresses.filter((addr) => addr._id !== addressId),
        loading: false,
      });

      toast.success("Address deleted successfully");
      return true;
    } catch (error) {
      set({ loading: false });
      toast.error("Failed to delete address");
      return false;
    }
  },
}));
