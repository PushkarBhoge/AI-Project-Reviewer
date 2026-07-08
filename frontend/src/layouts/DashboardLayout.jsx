import { useState } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useReviews } from "@/hooks/useReviews";
import ThemeToggle from "@/components/ThemeToggle";
import { LayoutDashboard, History, LogOut, Menu, X, Github, User } from "lucide-react";
import LanguageBadge from "@/components/ui/LanguageBadge";

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const { data: reviewsData } = useReviews();
  
  // Filter for unique projects to avoid duplicates if a project was reviewed multiple times
  const uniqueRecentProjects = [];
  const seenProjects = new Set();
  
  (reviewsData?.data?.reviews || []).forEach((rev) => {
    if (!rev.project || seenProjects.has(rev.project._id)) return;
    seenProjects.add(rev.project._id);
    uniqueRecentProjects.push(rev);
  });
  
  const recentReviews = uniqueRecentProjects.slice(0, 4);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navLinks = [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "Audit History", path: "/history", icon: History },
  ];

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Sidebar - Desktop */}
      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`fixed left-0 top-0 h-screen z-30 hidden border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 lg:flex flex-col justify-between transition-all duration-300 ease-in-out shrink-0 overflow-x-hidden ${
          isHovered ? "w-64 shadow-xl" : "w-20"
        }`}
      >
        <div className="flex flex-col">
          {/* Logo Brand */}
          <div className={`flex h-16 items-center border-b border-slate-100 dark:border-slate-800 transition-all duration-300 gap-3 ${
            isHovered ? "px-6" : "justify-center px-0"
          }`}>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-600 text-white shadow-md shadow-purple-500/20">
              <Github className="h-5 w-5" />
            </div>
            {isHovered && (
              <span className="font-extrabold text-sm tracking-tight text-slate-800 dark:text-white whitespace-nowrap transition-all duration-300">
                AI Code Reviewer
              </span>
            )}
          </div>

          {/* Navigation links */}
          <nav className="space-y-2.5 p-4">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;

              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center rounded-xl py-3 transition-all duration-200 ${
                    isHovered ? "px-4 gap-3.5 justify-start w-full" : "justify-center px-0 w-12 mx-auto"
                  } ${
                    isActive
                      ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {isHovered && (
                    <span className="text-sm font-semibold whitespace-nowrap transition-all duration-300">
                      {link.label}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Recent Audits list */}
          {isHovered && (
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800/60 mt-2 transition-all duration-300">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                Recent Audits
              </span>
              {recentReviews.length > 0 ? (
                <div className="mt-3 space-y-2.5 max-h-[240px] overflow-y-auto">
                  {recentReviews.map((rev) => (
                    <Link
                      key={rev._id}
                      to={`/reviews/${rev._id}`}
                      className="group flex items-start gap-2.5 rounded-xl p-2 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition min-w-0"
                    >
                      <div className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${
                        rev.overallScore >= 80
                          ? "bg-emerald-500"
                          : rev.overallScore >= 60
                          ? "bg-amber-500"
                          : "bg-rose-500"
                      }`} />
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-xs text-slate-700 dark:text-slate-200 group-hover:text-purple-600 transition truncate">
                          {rev.project?.repoName || "Unnamed repository"}
                        </span>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[10px] text-slate-400 font-semibold">
                          {rev.project?.language && (
                            <LanguageBadge language={rev.project.language} className="scale-90 origin-left" />
                          )}
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-md ${
                            rev.overallScore >= 80
                              ? "bg-emerald-50/70 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400"
                              : rev.overallScore >= 60
                              ? "bg-amber-50/70 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400"
                              : "bg-rose-50/70 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400"
                          }`}>
                            Score: {rev.overallScore}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-2 italic">
                  No audits completed yet.
                </span>
              )}
            </div>
          )}
        </div>

        {/* Footer controls & Profile */}
        <div className={`border-t border-slate-100 p-4 dark:border-slate-800 transition-all duration-300 ${
          isHovered ? "space-y-4" : "space-y-2"
        }`}>
          {/* Theme toggler row */}
          <div className={`flex items-center transition-all ${
            isHovered ? "justify-between px-2" : "justify-center px-0"
          }`}>
            {isHovered && (
              <span className="text-xs font-semibold text-slate-400 whitespace-nowrap">Theme mode</span>
            )}
            <ThemeToggle />
          </div>

          {/* User profile row */}
          <div className={`flex items-center rounded-xl bg-slate-50 dark:bg-slate-950/40 transition-all ${
            isHovered ? "p-3 justify-between" : "p-1.5 justify-center w-12 mx-auto"
          }`}>
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-purple-100 font-bold text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
                {getInitials(user?.name)}
              </div>
              {isHovered && (
                <div className="overflow-hidden">
                  <span className="block truncate text-xs font-bold text-slate-800 dark:text-white">
                    {user?.name || "Guest"}
                  </span>
                  <span className="block truncate text-[10px] text-slate-400">
                    {user?.email || ""}
                  </span>
                </div>
              )}
            </div>

            {/* Logout button */}
            {isHovered && (
              <button
                onClick={handleLogout}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-950/20"
                title="Sign Out"
              >
                <LogOut className="h-4.5 w-4.5" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main content body & Mobile Header */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
        isHovered ? "lg:pl-64" : "lg:pl-20"
      }`}>
        {/* Mobile Header Nav */}
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-900/60 lg:hidden">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-600 text-white">
              <Github className="h-4.5 w-4.5" />
            </div>
            <span className="font-extrabold text-sm tracking-tight text-slate-800 dark:text-white">
              AI Code Reviewer
            </span>
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </header>

        {/* Mobile menu drawer */}
        {isMobileMenuOpen && (
          <div className="absolute inset-x-0 top-16 z-40 border-b border-slate-200 bg-white p-4 shadow-xl dark:border-slate-800 dark:bg-slate-900 lg:hidden space-y-4">
            <nav className="space-y-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;

                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                      isActive
                        ? "bg-purple-600 text-white"
                        : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <div className="border-t border-slate-100 pt-4 dark:border-slate-800 flex items-center justify-between px-2">
              <span className="text-xs font-semibold text-slate-400">Theme</span>
              <ThemeToggle />
            </div>

            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 dark:bg-slate-950/40">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-100 font-bold text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
                  {getInitials(user?.name)}
                </div>
                <div>
                  <span className="block text-xs font-bold text-slate-800 dark:text-white">
                    {user?.name}
                  </span>
                  <span className="block text-[10px] text-slate-400">{user?.email}</span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:border-slate-800 dark:hover:bg-rose-950/20"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        )}

        {/* Content body container */}
        <main className="flex-1 overflow-y-auto px-4 py-8 sm:px-6 lg:px-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
