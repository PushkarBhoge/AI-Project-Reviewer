import React from "react";

const ScoreGauge = ({ score = 0, size = 120, strokeWidth = 10 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  // Color gradient based on score
  const getColor = (val) => {
    if (val >= 80) return "text-emerald-500 dark:text-emerald-400";
    if (val >= 60) return "text-amber-500 dark:text-amber-400";
    return "text-rose-500 dark:text-rose-400";
  };

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="h-full w-full -rotate-90 transform" viewBox={`0 0 ${size} ${size}`}>
        {/* Track circle */}
        <circle
          className="text-slate-100 dark:text-slate-800"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress circle */}
        <circle
          className={`transition-all duration-1000 ease-out ${getColor(score)}`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      {/* Absolute center text */}
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          {score}
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Score
        </span>
      </div>
    </div>
  );
};

export default ScoreGauge;
