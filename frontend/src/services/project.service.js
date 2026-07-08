import api from "@/lib/api";

// TODO: Implement project API calls

export const projectService = {
  getAll: () => api.get("/projects"),
  getById: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post("/projects", data),
  delete: (id) => api.delete(`/projects/${id}`),
};
