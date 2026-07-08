import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useProject } from "@/hooks/useProjects";
import { useReviewsByProject } from "@/hooks/useReviews";
import { reviewService } from "@/services/review.service";
import ReviewProgress from "@/components/ReviewProgress";
import LanguageBadge from "@/components/ui/LanguageBadge";
import { Star, GitFork, BookOpen, Clock, Calendar, ArrowLeft, RefreshCw, AlertCircle, FileText, ChevronRight } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

const ProjectDetail = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();

  const { data: projectData, isLoading: projectLoading, refetch: refetchProject } = useProject(id);
  const { data: reviewsData, isLoading: reviewsLoading, refetch: refetchReviews } = useReviewsByProject(id);

  const [isAuditing, setIsAuditing] = useState(false);

  const project = projectData?.data?.project;
  const reviews = reviewsData?.data?.reviews || [];

  const handleStartAudit = async () => {
    setIsAuditing(true);
    try {
      // Trigger audit creation
      await reviewService.create(id);
      
      // Update local project status so the progress card renders
      if (project) {
        project.status = "reviewing";
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to trigger review");
      setIsAuditing(false);
    }
  };

  const handleAuditComplete = () => {
    setIsAuditing(false);
    toast.success("Audit completed successfully!");
    // Invalidate react-query cache
    queryClient.invalidateQueries(["projects", id]);
    queryClient.invalidateQueries(["reviews", "project", id]);
    refetchProject();
    refetchReviews();
  };

  const handleAuditFailure = (msg) => {
    setIsAuditing(false);
    toast.error(msg || "Audit pipeline failed");
    refetchProject();
  };

  if (projectLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <AlertCircle className="h-10 w-10 text-rose-500" />
        <h3 className="mt-4 text-lg font-bold text-slate-800 dark:text-white">Project not found</h3>
        <Link to="/dashboard" className="mt-4 text-sm font-semibold text-purple-600">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  // Check if actively auditing in DB or via state
  const showProgress = isAuditing || project.status === "reviewing";

  return (
    <div className="space-y-8">
      {/* Back button */}
      <div>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>

      {/* Project Header Card */}
      <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/30 md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="space-y-3">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {project.repoName}
            </h1>
            <p className="text-sm text-slate-400">
              by <span className="font-semibold text-slate-500 dark:text-slate-300">{project.repoOwner}</span>
            </p>
            <p className="max-w-2xl text-slate-600 dark:text-slate-300">
              {project.description || "No description provided."}
            </p>

            {/* Meta indicators */}
            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-semibold text-slate-500">
              {project.language && (
                <LanguageBadge language={project.language} />
              )}
              {project.stars > 0 && (
                <span className="flex items-center gap-1.5">
                  <Star className="h-4.5 w-4.5 fill-amber-400 stroke-amber-400" />
                  {project.stars} stars
                </span>
              )}
              {project.forks > 0 && (
                <span className="flex items-center gap-1.5">
                  <GitFork className="h-4.5 w-4.5 text-slate-400" />
                  {project.forks} forks
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <BookOpen className="h-4.5 w-4.5 text-slate-400" />
                Branch: {project.defaultBranch}
              </span>
            </div>
          </div>

          <div className="shrink-0">
            {!showProgress && (
              <button
                onClick={handleStartAudit}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 transition hover:bg-purple-700 md:w-auto"
              >
                <RefreshCw className="h-4 w-4" />
                Trigger AI Audit
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Progress or Reviews section */}
      {showProgress ? (
        <div className="rounded-2xl border border-slate-200/60 bg-white p-8 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/30">
          <ReviewProgress
            projectId={project._id}
            onComplete={handleAuditComplete}
            onFailure={handleAuditFailure}
          />
        </div>
      ) : (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Audit History</h2>

          {reviewsLoading ? (
            <div className="space-y-4">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-20 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800/40" />
              ))}
            </div>
          ) : reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => {
                const date = new Date(review.createdAt).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <Link
                    key={review._id}
                    to={`/reviews/${review._id}`}
                    className="flex items-center justify-between rounded-xl border border-slate-200/60 bg-white p-5 shadow-sm transition hover:border-purple-500/30 hover:shadow-md dark:border-slate-800/60 dark:bg-slate-900/30"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-800 dark:text-white">
                            AI Audit Report
                          </span>
                          <span
                            className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                              review.overallScore >= 80
                                ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30"
                                : review.overallScore >= 60
                                ? "bg-amber-50 text-amber-600 dark:bg-amber-950/30"
                                : "bg-rose-50 text-rose-600 dark:bg-rose-950/30"
                            }`}
                          >
                            Score: {review.overallScore}/100
                          </span>
                        </div>
                        <div className="mt-1 flex items-center gap-4 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {review.suggestions?.length || 0} issues flagged
                          </span>
                        </div>
                      </div>
                    </div>

                    <ChevronRight className="h-5 w-5 text-slate-400" />
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200/80 bg-white p-12 text-center dark:border-slate-800/80 dark:bg-slate-900/20">
              <FileText className="h-8 w-8 text-slate-300" />
              <h3 className="mt-4 text-sm font-semibold text-slate-700 dark:text-slate-300">No audits run yet</h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Get automated code quality, performance, and security feedback by triggering your first AI audit.
              </p>
              <button
                onClick={handleStartAudit}
                className="mt-4 rounded-xl bg-purple-600 px-4.5 py-2 text-xs font-semibold text-white transition hover:bg-purple-700"
              >
                Trigger AI Audit
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;
