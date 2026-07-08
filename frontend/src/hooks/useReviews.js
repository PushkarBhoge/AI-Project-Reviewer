import { useQuery } from "@tanstack/react-query";
import { reviewService } from "@/services/review.service";

export const reviewKeys = {
  all: ["reviews"],
  public: ["reviews", "public"],
  byProject: (projectId) => ["reviews", "project", projectId],
  detail: (id) => ["reviews", id],
};

export const useReviews = () => {
  return useQuery({
    queryKey: reviewKeys.all,
    queryFn: () => reviewService.getAll().then((res) => res.data),
  });
};

export const usePublicReviews = () => {
  return useQuery({
    queryKey: reviewKeys.public,
    queryFn: () => reviewService.getPublic().then((res) => res.data),
  });
};

export const useReviewsByProject = (projectId) => {
  return useQuery({
    queryKey: reviewKeys.byProject(projectId),
    queryFn: () => reviewService.getByProject(projectId).then((res) => res.data),
    enabled: !!projectId,
  });
};

export const useReview = (id) => {
  return useQuery({
    queryKey: reviewKeys.detail(id),
    queryFn: () => reviewService.getById(id).then((res) => res.data),
    enabled: !!id,
  });
};
