import { useEffect, useState } from "react";
import { Loader2, CheckCircle2, XCircle, ArrowRight, Github } from "lucide-react";

// List of logical progress steps to display
const pipelineSteps = [
  { key: "github_download", label: "Downloading Repository ZIP" },
  { key: "scanning", label: "Scanning File Tree & Directories" },
  { key: "parsing", label: "Parsing Code & Static Analysis" },
  { key: "ai_analysis", label: "Generating AI Review Reports" },
  { key: "saving", label: "Saving Review Data" },
];

const ReviewProgress = ({ projectId, onComplete, onFailure }) => {
  const [progress, setProgress] = useState({ stage: "starting", message: "Connecting to progress stream...", percent: 0 });
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const baseUrl = import.meta.env.VITE_API_URL || "/api/v1";
    // We construct absolute or relative path for EventSource
    const sseUrl = `${window.location.origin}${baseUrl}/sse/${projectId}/progress?token=${token}`;

    logger_info("Connecting to SSE Progress stream: " + sseUrl);
    const eventSource = new EventSource(sseUrl);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setProgress(data);

        if (data.stage === "complete") {
          eventSource.close();
          if (onComplete) onComplete();
        } else if (data.stage === "failed") {
          eventSource.close();
          setError(data.message || "Review pipeline failed");
          if (onFailure) onFailure(data.message);
        }
      } catch (err) {
        console.error("SSE parse error", err);
      }
    };

    eventSource.onerror = (err) => {
      console.error("SSE connection error", err);
      setError("Lost connection to progress stream. Reconnecting...");
      // Don't close immediately as browser will automatically retry connection
    };

    return () => {
      eventSource.close();
    };
  }, [projectId, onComplete, onFailure]);

  // Helper logging utility
  function logger_info(msg) {
    console.log("[ReviewProgress]", msg);
  }

  const getStepStatus = (stepKey) => {
    const order = ["starting", "github_download", "scanning", "parsing", "ai_context", "ai_analysis", "saving", "complete"];
    const currentIdx = order.indexOf(progress.stage);
    const stepIdx = order.indexOf(stepKey);

    if (progress.stage === "failed") {
      return "failed";
    }
    if (currentIdx > stepIdx || progress.stage === "complete") {
      return "completed";
    }
    if (progress.stage === stepKey || (stepKey === "ai_analysis" && progress.stage === "ai_context")) {
      return "active";
    }
    return "pending";
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 text-center">
      {/* Header Loading Gauge */}
      <div className="relative mb-8 flex items-center justify-center">
        <div className="h-24 w-24 rounded-full border-4 border-slate-100 dark:border-slate-800" />
        <div className="absolute inset-0 flex items-center justify-center">
          {progress.stage === "failed" ? (
            <XCircle className="h-12 w-12 text-rose-500" />
          ) : progress.stage === "complete" ? (
            <CheckCircle2 className="h-12 w-12 text-emerald-500" />
          ) : (
            <Loader2 className="h-10 w-10 animate-spin text-purple-600" />
          )}
        </div>
      </div>

      <h3 className="text-xl font-bold text-slate-800 dark:text-white">
        {progress.stage === "complete"
          ? "Analysis Complete!"
          : progress.stage === "failed"
          ? "Analysis Failed"
          : "Analyzing Repository..."}
      </h3>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-sm">
        {progress.message}
      </p>
      {error && (
        <p className="mt-2 text-xs text-rose-500 font-semibold max-w-sm">
          {error}
        </p>
      )}

      {/* Progress Bar */}
      <div className="mt-6 h-2 w-full max-w-md rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${
            progress.stage === "failed" ? "bg-rose-500" : "bg-purple-600"
          }`}
          style={{ width: `${progress.percent}%` }}
        />
      </div>
      <span className="mt-2 text-xs font-semibold text-slate-400">
        {progress.percent}% Completed
      </span>

      {/* Step Breakdown */}
      <div className="mt-8 w-full max-w-md space-y-4 rounded-xl border border-slate-200/60 bg-white/50 p-6 text-left dark:border-slate-800/60 dark:bg-slate-900/30">
        {pipelineSteps.map((step) => {
          const status = getStepStatus(step.key);

          return (
            <div key={step.key} className="flex items-center justify-between">
              <span
                className={`text-sm font-medium ${
                  status === "completed"
                    ? "text-slate-700 dark:text-slate-300"
                    : status === "active"
                    ? "text-purple-600 dark:text-purple-400 font-semibold"
                    : status === "failed"
                    ? "text-rose-500"
                    : "text-slate-400 dark:text-slate-600"
                }`}
              >
                {step.label}
              </span>

              <div>
                {status === "completed" && (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                )}
                {status === "active" && (
                  <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
                )}
                {status === "failed" && (
                  <XCircle className="h-5 w-5 text-rose-500" />
                )}
                {status === "pending" && (
                  <div className="h-4.5 w-4.5 rounded-full border border-slate-200 dark:border-slate-800" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReviewProgress;
