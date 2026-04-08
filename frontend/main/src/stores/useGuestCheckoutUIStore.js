import { create } from "zustand";

export const useGuestCheckoutUIStore = create((set) => ({
  isOpen: false,
  openGuestCheckout: () => set({ isOpen: true }),
  closeGuestCheckout: () => set({ isOpen: false }),
}));
