import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useScheduleStore = create(
  persist(
    (set) => ({
      scheduledDate: null,
      scheduledTime: null,

      setSchedule: (date, time) =>
        set({ scheduledDate: date, scheduledTime: time }),
      clearSchedule: () => set({ scheduledDate: null, scheduledTime: null }),
    }),
    {
      name: "paanshala-schedule",
    },
  ),
);
