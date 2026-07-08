import { useParams, Link, useNavigate } from "react-router-dom";
import { useReview } from "@/hooks/useReviews";
import ScoreGauge from "@/components/charts/ScoreGauge";
import RadarChart from "@/components/charts/RadarChart";
import CategoryCard from "@/components/review/CategoryCard";
import { ArrowLeft, Download, AlertCircle, FileText, CheckCircle2, ChevronRight, RefreshCw } from "lucide-react";
import { reviewService } from "@/services/review.service";
import { toast } from "react-hot-toast";

const ReviewDetail = () => {
  const { id } = useParams();
  const { data, isLoading } = useReview(id);

  const review = data?.data?.review;
  const project = review?.project;
  const navigate = useNavigate();

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
      {review.suggestions && review.suggestions.length > 0 && (
        <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/30">
          <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">Line-Level Issues flagged</h2>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {review.suggestions.map((sug, idx) => {
              const getSeverityColor = (sev) => {
                if (sev === "critical") return "bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400";
                if (sev === "warning") return "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400";
                return "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-950/20 dark:text-blue-400";
              };

              return (
                <div key={idx} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded border px-2 py-0.5 text-[10px] font-bold uppercase ${getSeverityColor(sug.severity)}`}>
                      {sug.severity}
                    </span>
                    <span className="text-xs font-mono text-slate-500 dark:text-slate-400 font-semibold">
                      {sug.file}:{sug.line}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
                    {sug.message}
                  </p>
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
