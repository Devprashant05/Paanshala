import { create } from "zustand";
import api from "@/lib/axios";
import toast from "react-hot-toast";

export const useReviewStore = create((set, get) => ({
  /* =========================
     STATE
  ========================== */
  reviews: [], // all reviews for product
  myReview: null, // logged-in user's review
  loading: false,

  /* =========================
     HELPERS
  ========================== */
  setLoading: (value) => set({ loading: value }),

  clearReviews: () =>
    set({
      reviews: [],
      myReview: null,
    }),

  /* =========================
     ADD / UPDATE REVIEW
     POST /review/add
  ========================== */
  submitReview: async ({ productId, rating, review }) => {
    try {
      set({ loading: true });

      const res = await api.post("/reviews/add", {
        productId,
        rating,
        review,
      });

      toast.success(res.data.message || "Review submitted");

      // Update myReview locally
      set({ myReview: res.data.review });

      // Refresh product reviews
      await get().fetchProductReviews(productId);

      return true;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to submit review");
      return false;
    } finally {
      set({ loading: false });
    }
  },

  /* =========================
     GET PRODUCT REVIEWS
     GET /review/product/:productId
  ========================== */
  fetchProductReviews: async (productId) => {
    try {
      set({ loading: true });

      const res = await api.get(`/reviews/product/${productId}`);

      set({
        reviews: res.data.reviews || [],
      });
    } catch (error) {
      toast.error("Failed to fetch reviews");
    } finally {
      set({ loading: false });
    }
  },

  /* =========================
     GET MY REVIEW
     GET /review/my/:productId
  ========================== */
  fetchMyReview: async (productId) => {
    try {
      set({ loading: true });

      const res = await api.get(`/reviews/my/${productId}`);

      set({
        myReview: res.data.review || null,
      });
    } catch {
      // Silent fail (user may not be logged in)
      set({ myReview: null });
    } finally {
      set({ loading: false });
    }
  },
}));
