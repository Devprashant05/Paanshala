import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Guest cart — persisted in localStorage.
 * Each item: { productId, name, image, price, originalPrice, quantity,
 *              variantSetSize, isPaan, totalPrice }
 *
 * We store enough display data so the cart page renders without an API call.
 */
export const useGuestCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      /* ── add ── */
      addItem: (item) => {
        const { items } = get();
        const key = `${item.productId}-${item.variantSetSize ?? "default"}`;

        const existing = items.find(
          (i) =>
            i.productId === item.productId &&
            (i.variantSetSize ?? "default") ===
              (item.variantSetSize ?? "default"),
        );

        if (existing) {
          set({
            items: items.map((i) =>
              i._key === existing._key
                ? {
                    ...i,
                    quantity: i.quantity + (item.quantity || 1),
                    totalPrice: i.price * (i.quantity + (item.quantity || 1)),
                  }
                : i,
            ),
          });
        } else {
          set({
            items: [
              ...items,
              {
                ...item,
                _key: key,
                quantity: item.quantity || 1,
                totalPrice: item.price * (item.quantity || 1),
              },
            ],
          });
        }
      },

      /* ── update quantity ── */
      updateItem: ({ productId, quantity, variantSetSize }) => {
        if (quantity < 1)
          return get().removeItem({ productId, variantSetSize });

        set({
          items: get().items.map((i) =>
            i.productId === productId &&
            (i.variantSetSize ?? "default") === (variantSetSize ?? "default")
              ? { ...i, quantity, totalPrice: i.price * quantity }
              : i,
          ),
        });
      },

      /* ── remove ── */
      removeItem: ({ productId, variantSetSize }) => {
        set({
          items: get().items.filter(
            (i) =>
              !(
                i.productId === productId &&
                (i.variantSetSize ?? "default") ===
                  (variantSetSize ?? "default")
              ),
          ),
        });
      },

      /* ── clear (called after guest converts to user) ── */
      clearCart: () => set({ items: [] }),

      /* ── derived ── */
      get subtotal() {
        return get().items.reduce((s, i) => s + i.totalPrice, 0);
      },

      get count() {
        return get().items.reduce((s, i) => s + i.quantity, 0);
      },
    }),
    {
      name: "paanshala-guest-cart",
    },
  ),
);
