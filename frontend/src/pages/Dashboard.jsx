import { useState } from "react";
import { useProjects } from "@/hooks/useProjects";
import NewReviewModal from "@/components/NewReviewModal";
import ConfirmModal from "@/components/ui/ConfirmModal";
import LanguageBadge from "@/components/ui/LanguageBadge";
import Select from "@/components/ui/Select";
import { Plus, Search, GitBranch, Star, Trash2, ShieldAlert, Award, FileText, CheckCircle, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { projectService } from "@/services/project.service";
import { reviewService } from "@/services/review.service";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

const Dashboard = () => {
  const { data, isLoading, refetch } = useProjects();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [languageFilter, setLanguageFilter] = useState("all");

  // Confirm delete modal states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const queryClient = useQueryClient();

  const projects = data?.data?.projects || [];

  // Re-audit project handler
  const handleReauditProject = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      toast.success("Starting AI re-audit...");
      await reviewService.create(id);
      queryClient.invalidateQueries(["projects"]);
      refetch();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to trigger re-audit");
    }
  };

  // Delete project trigger handler
  const handleDeleteProject = (id, e) => {
    e.preventDefault(); // Prevent navigating to project detail
    e.stopPropagation();
    setProjectToDelete(id);
    setDeleteModalOpen(true);
  };

  // Confirm delete execution handler
  const handleConfirmDelete = async () => {
    if (!projectToDelete) return;
    setIsDeleting(true);
    try {
      await projectService.delete(projectToDelete);
      toast.success("Project deleted successfully");
      queryClient.invalidateQueries(["projects"]);
      refetch();
      setDeleteModalOpen(false);
      setProjectToDelete(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete project");
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter projects
  const filteredProjects = projects.filter((p) => {
    const matchesSearch = p.repoName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.repoOwner.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLang = languageFilter === "all" || p.language?.toLowerCase() === languageFilter.toLowerCase();
    return matchesSearch && matchesLang;
  });

  // Calculate statistics
  const completedProjects = projects.filter((p) => p.status === "completed");
  const failedProjects = projects.filter((p) => p.status === "failed");
  
  const getAverageScore = () => {
    if (completedProjects.length === 0) return 0;
    const scores = completedProjects.map((p) => {
      // Last review score
      const lastReview = p.reviews?.[0];
      return lastReview ? lastReview.overallScore : 0;
    });
    const validScores = scores.filter((s) => s > 0);
    if (validScores.length === 0) return 0;
    return Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length);
  };

  const avgScore = getAverageScore();

  // Get distinct languages
  const languages = Array.from(new Set(projects.map((p) => p.language).filter(Boolean)));

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Workspace Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Submit repositories for deep AI auditing and static metrics overview
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 transition hover:bg-purple-700"
        >
          <Plus className="h-5 w-5" />
          Audit Repository
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Audits */}
        <div className="rounded-xl border border-slate-200/60 bg-white p-6 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-purple-500/20 animate-scale-up">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Total Repositories
              </p>
              <h3 className="text-2xl font-bold text-slate-950 dark:text-white">{projects.length}</h3>
            </div>
          </div>
        </div>

        {/* Avg Score */}
        <div className="rounded-xl border border-slate-200/60 bg-white p-6 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-purple-500/20 animate-scale-up delay-100">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-emerald-50 p-2.5 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Average AI Score
              </p>
              <h3 className="text-2xl font-bold text-slate-950 dark:text-white">{avgScore}/100</h3>
            </div>
          </div>
        </div>

        {/* Completed Audits */}
        <div className="rounded-xl border border-slate-200/60 bg-white p-6 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-purple-500/20 animate-scale-up delay-200">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-purple-50 p-2.5 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Completed Audits
              </p>
              <h3 className="text-2xl font-bold text-slate-950 dark:text-white">{completedProjects.length}</h3>
            </div>
          </div>
        </div>

        {/* Failed Audits */}
        <div className="rounded-xl border border-slate-200/60 bg-white p-6 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-purple-500/20 animate-scale-up delay-300">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-rose-50 p-2.5 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Failed Audits
              </p>
              <h3 className="text-2xl font-bold text-slate-950 dark:text-white">{failedProjects.length}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1 max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-slate-900 outline-none transition dark:border-slate-800 dark:bg-slate-950/50 dark:text-white focus:border-purple-500"
          />
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 shrink-0">
            Language:
          </label>
          <Select
            value={languageFilter}
            onChange={setLanguageFilter}
            options={[
              { value: "all", label: "All Languages" },
              ...languages.map((lang) => ({ value: lang, label: lang })),
            ]}
          />
        </div>
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-56 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800/40" />
          ))}
        </div>
      ) : filteredProjects.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => {
            const lastReview = project.reviews?.[0];
            const score = lastReview?.overallScore;

            return (
              <Link
                key={project._id}
                to={`/projects/${project._id}`}
                className="group relative flex flex-col justify-between rounded-xl border border-slate-200/60 bg-white p-6 shadow-sm transition-all duration-300 hover:border-purple-500/30 hover:shadow-lg hover:-translate-y-1.5 hover:scale-[1.01] dark:border-slate-800/60 dark:bg-slate-900/30 animate-scale-up"
              >
                <div>
                  {/* Repo owner/name */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <GitBranch className="h-5 w-5 text-slate-400 group-hover:text-purple-600 transition" />
                      <h3 className="font-bold text-slate-800 dark:text-white group-hover:text-purple-600 transition line-clamp-1">
                        {project.repoName}
                      </h3>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={(e) => handleReauditProject(project._id, e)}
                        title="Re-audit Repository"
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-purple-50 hover:text-purple-600 dark:hover:bg-purple-950/20 transition cursor-pointer"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteProject(project._id, e)}
                        title="Delete Repository"
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-950/20 transition cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <span className="mt-0.5 block text-xs text-slate-400 dark:text-slate-500">
                    by {project.repoOwner}
                  </span>

                  <p className="mt-4 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 min-h-[32px]">
                    {project.description || "No description provided."}
                  </p>
                </div>

                <div className="mt-6 border-t border-slate-100 pt-4 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
                    {project.language && (
                      <LanguageBadge language={project.language} />
                    )}
                    {project.stars > 0 && (
                      <span className="flex items-center gap-1.5 text-slate-400">
                        <Star className="h-4 w-4 fill-amber-400 stroke-amber-400" />
                        {project.stars}
                      </span>
                    )}
                  </div>

                  {/* Status Indicator or Last Score */}
                  <div>
                    {project.status === "completed" ? (
                      (() => {
                        const scores = project.reviews?.map((r) => r.overallScore || 0).filter(Boolean) || [];
                        const bestScore = scores.length > 0 ? Math.max(...scores) : 0;
                        return (
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] uppercase font-bold text-slate-400">Best Score:</span>
                            <span
                              className={`text-sm font-bold ${
                                bestScore >= 80
                                  ? "text-emerald-500"
                                  : bestScore >= 60
                                  ? "text-amber-500"
                                  : "text-rose-500"
                              }`}
                            >
                              {bestScore || "--"}
                            </span>
                          </div>
                        );
                      })()
                    ) : project.status === "reviewing" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-600 dark:bg-purple-950/30">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-purple-500" />
                        Auditing
                      </span>
                    ) : project.status === "failed" ? (
                      <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-500 dark:bg-rose-950/30">
                        Failed
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-50 px-2 py-0.5 text-[10px] font-bold text-slate-500 dark:bg-slate-800">
                        Pending
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200/80 bg-white/50 p-12 text-center dark:border-slate-800/80 dark:bg-slate-900/20">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400">
            <GitBranch className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-base font-bold text-slate-800 dark:text-white">No repositories audited yet</h3>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-sm">
            Auditing tracks code complexity, smells, security exposures, and returns modular recommendations.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-6 rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-700"
          >
            Audit Your First Repo
          </button>
        </div>
      )}

      {/* New Review Modal */}
      <NewReviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRefresh={refetch}
      />

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setProjectToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Repository"
        message="Are you sure you want to delete this project and all its AI review history? This action is permanent and cannot be undone."
        confirmText="Delete Project"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default Dashboard;
