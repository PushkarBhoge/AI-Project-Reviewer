import { useState } from "react";
import { useReviews } from "@/hooks/useReviews";
import { Link } from "react-router-dom";
import { FileText, Calendar, Clock, Star, AlertCircle, ChevronRight, Award, Search } from "lucide-react";
import LanguageBadge from "@/components/ui/LanguageBadge";
import Select from "@/components/ui/Select";

const History = () => {
  const { data, isLoading } = useReviews();
  const [searchQuery, setSearchQuery] = useState("");
  const [scoreFilter, setScoreFilter] = useState("all");

  const reviews = data?.data?.reviews || [];

  // Filter reviews
  const filteredReviews = reviews.filter((r) => {
    const project = r.project || {};
    const matchesSearch = 
      project.repoName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.repoOwner?.toLowerCase().includes(searchQuery.toLowerCase());

    const score = r.overallScore || 0;
    let matchesScore = true;
    if (scoreFilter === "high") matchesScore = score >= 80;
    else if (scoreFilter === "mid") matchesScore = score >= 60 && score < 80;
    else if (scoreFilter === "low") matchesScore = score < 60;

    return matchesSearch && matchesScore;
  });

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Audit History
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Chronological record of all repositories evaluated by AI
        </p>
      </div>

      {/* Filters Row */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1 max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search by repo or owner..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-slate-900 outline-none transition dark:border-slate-800 dark:bg-slate-950/50 dark:text-white focus:border-purple-500"
          />
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 shrink-0">
            Rating:
          </label>
          <Select
            value={scoreFilter}
            onChange={setScoreFilter}
            options={[
              { value: "all", label: "All Ratings" },
              { value: "high", label: "Excellent (80+)" },
              { value: "mid", label: "Satisfactory (60-79)" },
              { value: "low", label: "Needs Improvement (<60)" },
            ]}
          />
        </div>
      </div>

      {/* History List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800/40" />
          ))}
        </div>
      ) : filteredReviews.length > 0 ? (
        <div className="space-y-4">
          {filteredReviews.map((review) => {
            const project = review.project || {};
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
                className="group flex flex-col justify-between gap-4 rounded-xl border border-slate-200/60 bg-white p-5 shadow-sm transition hover:border-purple-500/30 hover:shadow-md dark:border-slate-800/60 dark:bg-slate-900/30 md:flex-row md:items-center"
              >
                {/* Details */}
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-white group-hover:text-purple-600 transition">
                      {project.repoName || "Deleted Repository"}
                    </h3>
                    <span className="text-xs text-slate-400 dark:text-slate-500 block">
                      by {project.repoOwner || "unknown"}
                    </span>

                    {/* Metadata tags */}
                    <div className="mt-2.5 flex flex-wrap items-center gap-4 text-[11px] font-semibold text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {review.suggestions?.length || 0} alerts
                      </span>
                      {project.language && (
                        <LanguageBadge language={project.language} />
                      )}
                    </div>
                  </div>
                </div>

                {/* Score Indicators and CTA */}
                <div className="flex items-center justify-between border-t border-slate-100 pt-3 md:border-t-0 md:pt-0 gap-6">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Overall Score
                    </span>
                    <span
                      className={`text-lg font-extrabold ${
                        review.overallScore >= 80
                          ? "text-emerald-500"
                          : review.overallScore >= 60
                          ? "text-amber-500"
                          : "text-rose-500"
                      }`}
                    >
                      {review.overallScore}/100
                    </span>
                  </div>

                  <ChevronRight className="hidden md:block h-5 w-5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200/80 bg-white/50 p-12 text-center dark:border-slate-800/80 dark:bg-slate-900/20">
          <Award className="h-10 w-10 text-slate-300" />
          <h3 className="mt-4 text-base font-bold text-slate-800 dark:text-white">No audit records found</h3>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-sm">
            Make sure to audit a repository on the dashboard first to build up your code audit timeline.
          </p>
          <Link
            to="/dashboard"
            className="mt-6 rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-700"
          >
            Go to Dashboard
          </Link>
        </div>
      )}
    </div>
  );
};

export default History;
