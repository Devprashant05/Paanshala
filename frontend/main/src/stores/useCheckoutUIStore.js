import { create } from "zustand";

export const useCheckoutUIStore = create((set) => ({
  isOpen: false,

  openCheckout: () => set({ isOpen: true }),
  closeCheckout: () => set({ isOpen: false }),
}));
