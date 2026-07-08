export default function LanguageBadge({ language, className = "" }) {
  if (!language) return null;

  const lang = language.toLowerCase().trim();

  let styles = "bg-purple-500/10 text-purple-650 dark:text-purple-400 border-purple-500/20"; // default

  if (lang === "javascript" || lang === "js") {
    styles = "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20";
  } else if (lang === "typescript" || lang === "ts") {
    styles = "bg-blue-500/10 text-blue-700 dark:text-blue-405 border-blue-500/20";
  } else if (lang === "python" || lang === "py") {
    styles = "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20";
  } else if (lang === "html" || lang === "html5") {
    styles = "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20";
  } else if (lang === "css" || lang === "css3") {
    styles = "bg-pink-500/10 text-pink-700 dark:text-pink-400 border-pink-500/20";
  } else if (lang === "java") {
    styles = "bg-red-500/10 text-red-750 dark:text-red-400 border-red-500/20";
  } else if (lang === "go" || lang === "golang") {
    styles = "bg-cyan-500/10 text-cyan-700 dark:text-cyan-405 border-cyan-500/20";
  } else if (lang === "rust") {
    styles = "bg-orange-600/10 text-orange-800 dark:text-orange-400 border-orange-600/20";
  } else if (lang === "c++" || lang === "cpp") {
    styles = "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20";
  } else if (lang === "c#" || lang === "csharp") {
    styles = "bg-violet-500/10 text-violet-750 dark:text-violet-400 border-violet-500/20";
  }

  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-wide ${styles} ${className}`}>
      {language}
    </span>
  );
}
