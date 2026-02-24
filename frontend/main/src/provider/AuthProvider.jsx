"use client";

import { useEffect } from "react";
import { useUserStore } from "@/stores/useUserStore";

export default function AuthProvider({ children }) {
  const { fetchProfile, authChecked } = useUserStore();

  useEffect(() => {
    fetchProfile();
  }, []);

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#2d5016] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600">Checking session…</p>
        </div>
      </div>
    );
  }

  return children;
}
