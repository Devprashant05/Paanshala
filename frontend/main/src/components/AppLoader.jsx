"use client";

import { useEffect, useState } from "react";
import LoadingScreen from "@/components/LoadingScreen";

// ── Import all stores that need to hydrate before first paint ──
import { useProductStore } from "@/stores/useProductStore";
import { useVideoBannerStore } from "@/stores/useVideoBannerStore";
import { useCategoryStore } from "@/stores/useCategoryStore";
import { usePageSettingsStore } from "@/stores/usePageSettingsStore";
import { useCartStore } from "@/stores/useCartStore";
import { useUserStore } from "@/stores/useUserStore";

// How many data tasks we track (one per fetch call below)
const TOTAL_TASKS = 5;

export default function AppLoader({ children }) {
  const { fetchActiveBanners } = useVideoBannerStore();
  const { fetchFeaturedProducts } = useProductStore();
  const { fetchActiveCategories } = useCategoryStore();
  const { fetchPageSettings } = usePageSettingsStore();
  const { fetchCart } = useCartStore();
  const { isAuthenticated } = useUserStore();

  const [completed, setCompleted] = useState(0);
  const [ready, setReady] = useState(false);

  const tick = () => setCompleted((n) => n + 1);

  useEffect(() => {
    // Fire all critical fetches in parallel, tick progress as each resolves
    const tasks = [
      fetchActiveBanners().finally(tick),
      fetchFeaturedProducts().finally(tick),
      fetchActiveCategories().finally(tick),
      fetchPageSettings().finally(tick),
      // Cart fetch only if logged in — still counts as one task
      (isAuthenticated ? fetchCart() : Promise.resolve()).finally(tick),
    ];

    Promise.all(tasks).then(() => setReady(true));
  }, []);

  // Progress 0 → 100 as tasks complete
  const progress = Math.round((completed / TOTAL_TASKS) * 100);

  return (
    <>
      <LoadingScreen progress={progress} done={ready} />
      {/*
        Render children immediately so Next.js can hydrate the DOM,
        but keep them invisible until ready — avoids a flash of
        unstyled/empty content while still painting at the right moment.
      */}
      <div
        style={{
          opacity: ready ? 1 : 0,
          transition: "opacity 0.35s ease",
          // Prevent interaction while loading
          pointerEvents: ready ? "auto" : "none",
        }}
      >
        {children}
      </div>
    </>
  );
}
