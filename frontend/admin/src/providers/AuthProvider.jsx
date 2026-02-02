"use client";

import { useEffect } from "react";
import { useUserStore } from "@/store/useUserStore";

export default function AuthProvider({ children }) {
  const checkAuth = useUserStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return children;
}
