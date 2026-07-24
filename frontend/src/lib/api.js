import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api/v1";

/**
 * Pre-configured Axios instance.
 * - Base URL from environment
 * - Auto-attaches Clerk JWT or localStorage fallback token
 * - Response interceptor for 401 handling
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// ─── Request Interceptor: Attach Clerk Token ──────────────
api.interceptors.request.use(
  async (config) => {
    try {
      let token = null;
      if (window.Clerk && window.Clerk.session) {
        token = await window.Clerk.session.getToken();
      }
      if (!token) {
        token = localStorage.getItem("token");
      }
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.warn("Failed to get Clerk token for API request", e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor: Handle 401 ─────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config?.url?.includes("/payments")) {
      localStorage.removeItem("token");
      if (window.location.pathname.startsWith("/dashboard") || window.location.pathname.startsWith("/reviews") || window.location.pathname.startsWith("/history")) {
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);

export default api;

