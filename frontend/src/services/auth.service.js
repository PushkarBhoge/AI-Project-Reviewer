import api from "@/lib/api";

// TODO: Implement auth API calls
// - registerUser(userData): POST /auth/register
// - loginUser(credentials): POST /auth/login
// - getProfile(): GET /auth/me

export const authService = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  getProfile: () => api.get("/auth/me"),
};
