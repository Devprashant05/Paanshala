import axios from "axios";
import toast from "react-hot-toast";

const api = axios.create({
  baseURL:
    process.env.NODE_ENV === "development"
      ? "http://localhost:5500/api"
      : `${process.env.NEXT_PUBLIC_API_URL}/api`,
  withCredentials: true,
});

// ================================
// Response Interceptor
// ================================
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error?.response?.data?.message || error.message || "Something went wrong";

    if (error.response?.status !== 401) {
      toast.error(message);
    }

    return Promise.reject(error);
  },
);

export default api;
