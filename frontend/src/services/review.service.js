import api from "@/lib/api";

// TODO: Implement review API calls

export const reviewService = {
  create: (projectId) => api.post(`/reviews/${projectId}`),
  getByProject: (projectId) => api.get(`/reviews/project/${projectId}`),
  getById: (id) => api.get(`/reviews/${id}`),
  getAll: () => api.get("/reviews"),
  getPublic: () => api.get("/reviews/public"),
  createPullRequest: (reviewId, index) => api.post(`/reviews/${reviewId}/suggestions/${index}/pr`),
};
