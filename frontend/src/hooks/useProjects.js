import { useQuery } from "@tanstack/react-query";
import { projectService } from "@/services/project.service";

/**
 * React Query hooks for project data.
 * Centralized cache keys + fetcher functions.
 */

export const projectKeys = {
  all: ["projects"],
  detail: (id) => ["projects", id],
};

export const useProjects = () => {
  return useQuery({
    queryKey: projectKeys.all,
    queryFn: () => projectService.getAll().then((res) => res.data),
  });
};

export const useProject = (id) => {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: () => projectService.getById(id).then((res) => res.data),
    enabled: !!id,
  });
};
