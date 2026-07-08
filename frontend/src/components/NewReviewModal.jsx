import { useState } from "react";
import { X, Github, ArrowRight, AlertCircle } from "lucide-react";
import { projectService } from "@/services/project.service";
import { reviewService } from "@/services/review.service";
import ReviewProgress from "./ReviewProgress";
import { useNavigate } from "react-router-dom";

const NewReviewModal = ({ isOpen, onClose, onRefresh }) => {
  const [repoUrl, setRepoUrl] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projectCreated, setProjectCreated] = useState(null); // { id, name }

  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = repoUrl.trim();
    if (!url) return;

    setError("");

    // Frontend Validation
    try {
      const parsedUrl = new URL(url);
      if (parsedUrl.hostname !== "github.com" && parsedUrl.hostname !== "www.github.com") {
        setError("Only GitHub repository URLs are supported.");
        return;
      }
      const paths = parsedUrl.pathname.split("/").filter(Boolean);
      if (paths.length < 2) {
        setError("Invalid GitHub URL. Must be in the format github.com/owner/repo");
        return;
      }
    } catch (err) {
      setError("Please enter a valid URL (e.g., https://github.com/owner/repo)");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Submit GitHub URL to create project (or get existing project)
      const projectRes = await projectService.create({ repoUrl });
      const project = projectRes.data.data.project;

      // 2. Trigger review pipeline in background
      await reviewService.create(project._id);

      setProjectCreated(project);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || "Failed to process repository. Please check the URL."
      );
      setIsSubmitting(false);
    }
  };

  const handleComplete = () => {
    if (onRefresh) onRefresh();
    // Redirect to project detail after short delay
    setTimeout(() => {
      onClose();
      navigate(`/projects/${projectCreated._id}`);
    }, 1500);
  };

  const handleFailure = (msg) => {
    setError(msg || "AI review failed. Please try again.");
    setProjectCreated(null);
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-5 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {projectCreated ? "Running Audit" : "Audit New Repository"}
          </h3>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {!projectCreated ? (
            <form onSubmit={handleSubmit} noValidate className="space-y-6">
              {error && (
                <div className="flex gap-2.5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-400">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  GitHub Repository URL
                </label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Github className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="url"
                    required
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    placeholder="https://github.com/owner/repository"
                    disabled={isSubmitting}
                    className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-slate-900 outline-none transition duration-200 focus:border-purple-500 focus:bg-white focus:ring-2 focus:ring-purple-500/20 dark:border-slate-800 dark:bg-slate-950/50 dark:text-white dark:focus:border-purple-500 dark:focus:bg-slate-950"
                  />
                </div>
                <span className="text-xs text-slate-400 dark:text-slate-500 block">
                  Supports public GitHub repositories.
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !repoUrl.trim()}
                className="group relative flex w-full justify-center rounded-xl bg-purple-600 py-3 px-4 text-sm font-semibold text-white transition-all hover:bg-purple-700 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">Connecting to GitHub...</span>
                ) : (
                  <span className="flex items-center gap-2">
                    Analyze Project <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                )}
              </button>
            </form>
          ) : (
            <ReviewProgress
              projectId={projectCreated._id}
              onComplete={handleComplete}
              onFailure={handleFailure}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default NewReviewModal;
