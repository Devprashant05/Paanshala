import { create } from "zustand";

export const useCartUIStore = create((set) => ({
  isOpen: false,

  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),
}));
