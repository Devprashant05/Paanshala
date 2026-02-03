"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/stores/useUserStore";

export function useAdminGuard() {
  const router = useRouter();
  const { user, loading } = useUserStore();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (user.role !== "admin") {
      router.replace("/unauthorized");
    }
  }, [user, loading, router]);
}
