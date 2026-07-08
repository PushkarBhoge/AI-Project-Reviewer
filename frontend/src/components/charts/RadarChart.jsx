import React from "react";
import {
  Radar,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useThemeContext } from "@/context/ThemeContext";

const RadarChart = ({ data = {} }) => {
  const themeContext = useThemeContext();
  const theme = themeContext?.theme || "dark";
  const isDark = theme === "dark";

  // Map category data to recharts expected format
  const chartData = [
    { subject: "Code Quality", score: data.codeQuality?.score || 0, fullMark: 20 },
    { subject: "Security", score: data.security?.score || 0, fullMark: 20 },
    { subject: "Performance", score: data.performance?.score || 0, fullMark: 20 },
    { subject: "Documentation", score: data.documentation?.score || 0, fullMark: 20 },
    { subject: "Architecture", score: data.bestPractices?.score || 0, fullMark: 20 },
    { subject: "Testing", score: data.testing?.score || 0, fullMark: 20 },
    { subject: "UI/UX", score: data.uiux?.score || 0, fullMark: 20 },
  ];

  // Dynamic colors for light and dark modes
  const gridStroke = isDark ? "#334155" : "#e2e8f0";
  const angleAxisColor = isDark ? "#cbd5e1" : "#334155";
  const radarStroke = "#a855f7"; // purple-500
  const radarFill = "#a855f7";

  return (
    <div className="h-80 w-full flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadarChart cx="50%" cy="50%" radius="58%" data={chartData}>
          <PolarGrid stroke={gridStroke} />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: angleAxisColor, fontSize: 11, fontWeight: 600 }}
          />
          <Radar
            name="Score"
            dataKey="score"
            stroke={radarStroke}
            fill={radarFill}
            fillOpacity={isDark ? 0.35 : 0.2}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? "#0f172a" : "#ffffff",
              borderColor: isDark ? "#334155" : "#e2e8f0",
              color: isDark ? "#f8fafc" : "#0f172a",
              borderRadius: "0.75rem",
              fontSize: "12px",
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            }}
          />
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RadarChart;
