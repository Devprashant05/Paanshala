import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useScheduleStore = create(
  persist(
    (set) => ({
      scheduledDate: null,
      scheduledTime: null,
      _hasHydrated: false,

      setSchedule: (date, time) =>
        set({ scheduledDate: date, scheduledTime: time }),
      clearSchedule: () => set({ scheduledDate: null, scheduledTime: null }),
      setHasHydrated: (val) => set({ _hasHydrated: val }),
    }),
    {
      name: "paanshala-schedule",
      // Only persist date/time, not the hydration flag
      partialize: (state) => ({
        scheduledDate: state.scheduledDate,
        scheduledTime: state.scheduledTime,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);