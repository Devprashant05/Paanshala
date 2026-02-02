"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/useUserStore";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, loading } = useUserStore();

  useEffect(() => {
    if (loading) return;

    if (isAuthenticated) {
      router.replace("/admin");
    } else {
      router.replace("/login");
    }
  }, [isAuthenticated, loading, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      Redirecting...
    </div>
  );
}
