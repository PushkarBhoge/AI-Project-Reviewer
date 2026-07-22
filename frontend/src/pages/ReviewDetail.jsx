import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useReview } from "@/hooks/useReviews";
import ScoreGauge from "@/components/charts/ScoreGauge";
import RadarChart from "@/components/charts/RadarChart";
import CategoryCard from "@/components/review/CategoryCard";
import { ArrowLeft, Download, AlertCircle, FileText, CheckCircle2, ChevronRight, RefreshCw, Lightbulb, Code2, Copy, Check, GitPullRequest, ExternalLink, Columns, Loader2 } from "lucide-react";
import { reviewService } from "@/services/review.service";
import { toast } from "react-hot-toast";

const ReviewDetail = () => {
  const { id } = useParams();
  const { data, isLoading } = useReview(id);
  const [copiedIdx, setCopiedIdx] = useState(null);
  const [prLoadingIdx, setPrLoadingIdx] = useState(null);
  const [diffViewMap, setDiffViewMap] = useState({});

  const handleCopySnippet = (code, idx) => {
    navigator.clipboard.writeText(code);
    setCopiedIdx(idx);
    toast.success("Code snippet copied!");
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const toggleDiffView = (idx) => {
    setDiffViewMap((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const handleCreatePR = async (suggestionIdx) => {
    setPrLoadingIdx(suggestionIdx);
    try {
      toast.loading("Creating GitHub Pull Request...", { id: "pr-toast" });
      const res = await reviewService.createPullRequest(id, suggestionIdx);
      const prUrl = res?.data?.data?.prUrl;
      if (review && review.suggestions[suggestionIdx]) {
        review.suggestions[suggestionIdx].prUrl = prUrl;
      }
      toast.success("GitHub Pull Request created successfully!", { id: "pr-toast" });
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to create GitHub Pull Request", { id: "pr-toast" });
    } finally {
      setPrLoadingIdx(null);
    }
  };

  const [severityFilter, setSeverityFilter] = useState("all");

  const review = data?.data?.review;
  const project = review?.project;
  const navigate = useNavigate();

  const suggestions = review?.suggestions || [];
  const criticalCount = suggestions.filter((s) => s.severity === "critical").length;
  const warningCount = suggestions.filter((s) => s.severity === "warning").length;
  const infoCount = suggestions.filter((s) => s.severity === "info" || (s.severity !== "critical" && s.severity !== "warning")).length;

  const filteredSuggestions = suggestions.filter((s) => {
    if (severityFilter === "all") return true;
    if (severityFilter === "critical") return s.severity === "critical";
    if (severityFilter === "warning") return s.severity === "warning";
    if (severityFilter === "info") return s.severity === "info" || (s.severity !== "critical" && s.severity !== "warning");
    return true;
  });

  const handleReaudit = async () => {
    if (!project) return;
    try {
      toast.success("Starting AI re-audit...");
      await reviewService.create(project._id);
      navigate(`/projects/${project._id}`);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to trigger re-audit");
    }
  };

  const handleDownloadPdf = () => {
    const token = localStorage.getItem("token");
    const baseUrl = import.meta.env.VITE_API_URL || "/api/v1";
    
    // We navigate the browser directly to the PDF endpoint passing JWT token
    const pdfUrl = `${baseUrl}/reviews/${id}/pdf?token=${token}`;
    
    toast.success("Generating PDF report...");
    window.open(pdfUrl, "_blank");
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent" />
      </div>
    );
  }

  if (!review) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <AlertCircle className="h-10 w-10 text-rose-500" />
        <h3 className="mt-4 text-lg font-bold text-slate-800 dark:text-white">Review report not found</h3>
        <Link to="/dashboard" className="mt-4 text-sm font-semibold text-purple-600">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  // Categories list keys
  const categoryKeys = ["codeQuality", "security", "performance", "documentation", "bestPractices", "testing", "uiux"];

  return (
    <div className="space-y-8">
      {/* Navigation Headers */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <Link
          to={`/projects/${project?._id}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Project History
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={handleReaudit}
            className="flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-purple-500/20 transition hover:bg-purple-700 cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" />
            Re-audit Project
          </button>
          
          <button
            onClick={handleDownloadPdf}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 cursor-pointer"
          >
            <Download className="h-4 w-4" />
            Download PDF Report
          </button>
        </div>
      </div>

      {/* Main Score Overview Block */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Overall Score Gauge Card */}
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200/60 bg-white p-8 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/30">
          <h2 className="mb-6 text-lg font-bold text-slate-800 dark:text-white">Overall Score</h2>
          <ScoreGauge score={review.overallScore} size={150} strokeWidth={12} />
          
          <div className="mt-6 text-center text-xs text-slate-400 font-medium">
            Based on a composite score of 7 dimensions evaluated by AI.
          </div>
        </div>

        {/* Radar Chart Card */}
        <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/30 lg:col-span-2">
          <h2 className="mb-4 text-lg font-bold text-slate-800 dark:text-white">Audit Vector Dimensions</h2>
          <RadarChart data={review.categories} />
        </div>
      </div>

      {/* Summary Box */}
      <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/30">
        <h2 className="mb-3 text-lg font-bold text-slate-900 dark:text-white">Executive Summary</h2>
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          {review.summary}
        </p>
      </div>

      {/* Recommendations & Suggestions split */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Category breakdown accordions */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Audit Breakdown</h2>
          {categoryKeys.map((key) => {
            const cat = review.categories[key];
            if (!cat) return null;
            return <CategoryCard key={key} categoryKey={key} details={cat} />;
          })}
        </div>

        {/* Recommendations Checklist */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/30">
            <h2 className="mb-4 text-base font-bold text-slate-900 dark:text-white">Action Roadmap</h2>
            {review.recommendations && review.recommendations.length > 0 ? (
              <ul className="space-y-4">
                {review.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-5 w-5 text-purple-500 shrink-0 mt-0.5" />
                    <span className="text-xs text-slate-600 dark:text-slate-300">{rec}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs italic text-slate-400">No action items suggested.</p>
            )}
          </div>
        </div>
      </div>

      {/* File specific issues/suggestions list */}
      {suggestions && suggestions.length > 0 && (
        <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/30">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Line-Level Issues & Solution Recommendations</h2>
              <p className="text-xs text-slate-400 mt-0.5">Filter flagged issues by severity rating</p>
            </div>

            {/* Severity Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setSeverityFilter("all")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
                  severityFilter === "all"
                    ? "bg-purple-600 text-white shadow-sm shadow-purple-500/20"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                }`}
              >
                All ({suggestions.length})
              </button>
              {criticalCount > 0 && (
                <button
                  onClick={() => setSeverityFilter("critical")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer flex items-center gap-1 ${
                    severityFilter === "critical"
                      ? "bg-rose-600 text-white shadow-sm shadow-rose-500/20"
                      : "bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-400"
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-400 animate-pulse" />
                  Critical ({criticalCount})
                </button>
              )}
              {warningCount > 0 && (
                <button
                  onClick={() => setSeverityFilter("warning")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer flex items-center gap-1 ${
                    severityFilter === "warning"
                      ? "bg-amber-600 text-white shadow-sm shadow-amber-500/20"
                      : "bg-amber-50 text-amber-600 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-400"
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                  Warning ({warningCount})
                </button>
              )}
              {infoCount > 0 && (
                <button
                  onClick={() => setSeverityFilter("info")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer flex items-center gap-1 ${
                    severityFilter === "info"
                      ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                      : "bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-400"
                  }`}
                >
                  Info ({infoCount})
                </button>
              )}
            </div>
          </div>

          <div className="space-y-6 divide-y divide-slate-100 dark:divide-slate-800">
            {filteredSuggestions.map((sug, idx) => {
              const getSeverityColor = (sev) => {
                if (sev === "critical") return "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/50";
                if (sev === "warning") return "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50";
                return "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/50";
              };

              return (
                <div key={idx} className="pt-6 first:pt-0 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getSeverityColor(sug.severity)}`}>
                      {sug.severity}
                    </span>
                    <span className="text-xs font-mono text-slate-600 dark:text-slate-300 font-semibold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                      {sug.file}:{sug.line}
                    </span>
                  </div>

                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    {sug.message}
                  </p>

                  {/* Solution section */}
                  {sug.solution && (
                    <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs text-slate-700 dark:text-slate-300">
                      <div className="flex items-center gap-1.5 font-bold text-amber-600 dark:text-amber-400 mb-1.5">
                        <Lightbulb className="h-4 w-4 shrink-0" />
                        <span>Recommended Solution</span>
                      </div>
                      <p className="leading-relaxed pl-5 text-slate-600 dark:text-slate-300">
                        {sug.solution}
                      </p>
                    </div>
                  )}

                  {/* Code snippet & Side-by-Side Diff section */}
                  {sug.codeSnippet && (
                    <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-sm">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 bg-slate-900/80 px-4 py-2.5 text-xs text-slate-400">
                        <div className="flex items-center gap-2 font-mono text-[11px]">
                          <Code2 className="h-4 w-4 text-purple-400" />
                          <span className="text-slate-200 font-semibold">
                            {diffViewMap[idx] ? "Side-by-Side Diff View" : "Suggested Fix Snippet"}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          {/* Toggle Diff View Button */}
                          <button
                            onClick={() => toggleDiffView(idx)}
                            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition cursor-pointer ${
                              diffViewMap[idx]
                                ? "bg-purple-600/30 text-purple-300 border border-purple-500/40"
                                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                            }`}
                          >
                            <Columns className="h-3.5 w-3.5" />
                            <span>{diffViewMap[idx] ? "Single View" : "Split Diff"}</span>
                          </button>

                          {/* GitHub Pull Request Button */}
                          {sug.prUrl ? (
                            <a
                              href={sug.prUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-1 text-[11px] font-semibold text-emerald-300 hover:bg-emerald-500/30 transition cursor-pointer"
                            >
                              <GitPullRequest className="h-3.5 w-3.5 text-emerald-400" />
                              <span>View PR</span>
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : (
                            <button
                              onClick={() => handleCreatePR(idx)}
                              disabled={prLoadingIdx === idx}
                              className="flex items-center gap-1.5 rounded-lg bg-purple-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-purple-700 transition disabled:opacity-50 cursor-pointer shadow-sm shadow-purple-500/20"
                            >
                              {prLoadingIdx === idx ? (
                                <>
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  <span>Creating PR...</span>
                                </>
                              ) : (
                                <>
                                  <GitPullRequest className="h-3.5 w-3.5" />
                                  <span>Create GitHub PR</span>
                                </>
                              )}
                            </button>
                          )}

                          {/* Copy Code Button */}
                          <button
                            onClick={() => handleCopySnippet(sug.codeSnippet, idx)}
                            className="flex items-center gap-1.5 rounded-lg bg-slate-800 px-2.5 py-1 text-[11px] font-medium text-slate-400 hover:bg-slate-700 hover:text-white transition cursor-pointer"
                          >
                            {copiedIdx === idx ? (
                              <>
                                <Check className="h-3.5 w-3.5 text-emerald-400" />
                                <span className="text-emerald-400">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3.5 w-3.5" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Content view */}
                      {diffViewMap[idx] ? (
                        /* Side-by-Side Dual-Column Diff View */
                        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800">
                          {/* Left Column: Original Code */}
                          <div className="p-4 bg-rose-950/20">
                            <div className="flex items-center justify-between pb-2 mb-2 border-b border-rose-900/40 text-[10px] font-mono text-rose-400 font-bold uppercase tracking-wider">
                              <span>- Original Code</span>
                              <span>Before</span>
                            </div>
                            <pre className="overflow-x-auto font-mono text-xs text-rose-300/90 leading-relaxed whitespace-pre-wrap">
                              <code>{sug.originalCode || "// Original code snippet around line " + sug.line}</code>
                            </pre>
                          </div>

                          {/* Right Column: Suggested Fix */}
                          <div className="p-4 bg-emerald-950/20">
                            <div className="flex items-center justify-between pb-2 mb-2 border-b border-emerald-900/40 text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
                              <span>+ Suggested Fix</span>
                              <span>After</span>
                            </div>
                            <pre className="overflow-x-auto font-mono text-xs text-emerald-400/90 leading-relaxed whitespace-pre-wrap">
                              <code>{sug.codeSnippet}</code>
                            </pre>
                          </div>
                        </div>
                      ) : (
                        /* Single View */
                        <pre className="overflow-x-auto p-4 font-mono text-xs text-emerald-400/90 leading-relaxed">
                          <code>{sug.codeSnippet}</code>
                        </pre>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewDetail;
