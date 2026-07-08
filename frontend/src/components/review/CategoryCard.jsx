import { useState } from "react";
import { ChevronDown, ChevronUp, CheckCircle2, AlertTriangle, Shield, Cpu, FileText, Code2, Layers, FlaskConical, Palette } from "lucide-react";
import ReactMarkdown from "react-markdown";

const iconMap = {
  codeQuality: Code2,
  security: Shield,
  performance: Cpu,
  documentation: FileText,
  bestPractices: Layers, // maps to architecture
  testing: FlaskConical,
  uiux: Palette,
};

const categoryNameMap = {
  codeQuality: "Code Quality",
  security: "Security & Vulnerabilities",
  performance: "Performance Optimization",
  documentation: "Documentation & Readme",
  bestPractices: "Architecture & Best Practices",
  testing: "Testing & Coverage",
  uiux: "UI/UX & Accessibility",
};

const CategoryCard = ({ categoryKey, details }) => {
  const [isOpen, setIsOpen] = useState(false);
  const Icon = iconMap[categoryKey] || Code2;
  const title = categoryNameMap[categoryKey] || categoryKey;

  const score = details?.score || 0;
  const maxScore = details?.maxScore || 20;
  const percent = (score / maxScore) * 100;

  // Determine progress color
  const getProgressColor = (pct) => {
    if (pct >= 80) return "bg-emerald-500";
    if (pct >= 60) return "bg-amber-500";
    return "bg-rose-500";
  };

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-5 text-left transition hover:bg-slate-50 dark:hover:bg-slate-900/80"
      >
        <div className="flex flex-1 items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400">
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h4 className="text-base font-semibold text-slate-800 dark:text-white">
              {title}
            </h4>
            {/* Score progress bar */}
            <div className="mt-1.5 flex items-center gap-3">
              <div className="h-1.5 w-full max-w-[160px] rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${getProgressColor(percent)}`}
                  style={{ width: `${percent}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {score}/{maxScore}
              </span>
            </div>
          </div>
        </div>

        <div className="ml-4 flex items-center gap-2">
          {isOpen ? (
            <ChevronUp className="h-5 w-5 text-slate-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-slate-400" />
          )}
        </div>
      </button>

      {/* Content */}
      {isOpen && (
        <div className="border-t border-slate-100 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-950/20">
          {/* Detailed Feedback Paragraph */}
          {details.feedback && (
            <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300">
              <ReactMarkdown>{details.feedback}</ReactMarkdown>
            </div>
          )}

          {/* Strengths & Weaknesses Grid */}
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {/* Strengths */}
            <div>
              <h5 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Strengths
              </h5>
              {details.strengths && details.strengths.length > 0 ? (
                <ul className="mt-3 space-y-2">
                  {details.strengths.map((str, idx) => (
                    <li key={idx} className="text-sm text-slate-700 dark:text-slate-300">
                      {str}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm italic text-slate-400">No major strengths highlighted.</p>
              )}
            </div>

            {/* Weaknesses */}
            <div>
              <h5 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                <AlertTriangle className="h-4 w-4 text-rose-500" />
                Areas to Improve
              </h5>
              {details.weaknesses && details.weaknesses.length > 0 ? (
                <ul className="mt-3 space-y-2">
                  {details.weaknesses.map((weak, idx) => (
                    <li key={idx} className="text-sm text-slate-700 dark:text-slate-300">
                      {weak}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm italic text-slate-400">No major issues identified.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryCard;
