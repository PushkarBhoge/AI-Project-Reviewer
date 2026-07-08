import { MenuIcon, XIcon, Github, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const [openMobileMenu, setOpenMobileMenu] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (openMobileMenu) {
      document.body.classList.add("max-md:overflow-hidden");
    } else {
      document.body.classList.remove("max-md:overflow-hidden");
    }
  }, [openMobileMenu]);

  const handleLogout = () => {
    logout();
    setOpenMobileMenu(false);
    navigate("/");
  };

  return (
    <nav
      className={`flex items-center justify-between fixed z-50 top-0 w-full px-6 md:px-16 lg:px-24 xl:px-32 py-4 ${
        openMobileMenu ? "" : "backdrop-blur bg-white/70 dark:bg-slate-950/70"
      } border-b border-slate-200/50 dark:border-slate-800/50`}
    >
      {/* Brand Logo */}
      <Link to="/" className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-600 text-white font-extrabold shadow shadow-purple-500/25">
          <Github className="h-4.5 w-4.5" />
        </div>
        <span className="font-extrabold text-sm tracking-tight text-slate-800 dark:text-white">
          AI Code Reviewer
        </span>
      </Link>

      {/* Nav Menu - Desktop */}
      <div className="hidden items-center md:gap-8 lg:gap-9 md:flex lg:pl-20">
        {user && (
          <>
            <Link
              to="/dashboard"
              className="text-sm font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              Dashboard
            </Link>
            <Link
              to="/history"
              className="text-sm font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              Audit History
            </Link>
          </>
        )}
      </div>

      {/* Control Buttons */}
      <div className="flex items-center gap-4">
        <ThemeToggle />

        {user ? (
          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/dashboard"
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 transition text-sm font-semibold text-white rounded-xl shadow-lg shadow-purple-500/20"
            >
              Go to Dashboard
            </Link>
            <button
              onClick={handleLogout}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-rose-500 dark:hover:bg-slate-800"
              title="Sign Out"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        ) : (
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-semibold border border-slate-200 dark:border-slate-800 rounded-xl dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 transition text-sm font-semibold text-white rounded-xl shadow-lg shadow-purple-500/20"
            >
              Get started
            </Link>
          </div>
        )}

        <button onClick={() => setOpenMobileMenu(!openMobileMenu)} className="md:hidden text-slate-600 dark:text-white">
          {openMobileMenu ? <XIcon size={24} /> : <MenuIcon size={24} />}
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      {openMobileMenu && (
        <div className="fixed inset-x-0 top-16 z-40 flex flex-col gap-6 p-6 border-b border-slate-200 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md md:hidden transition dark:border-slate-800">
          {user ? (
            <>
              <Link
                to="/dashboard"
                onClick={() => setOpenMobileMenu(false)}
                className="text-base font-semibold text-slate-700 dark:text-slate-300"
              >
                Dashboard
              </Link>
              <Link
                to="/history"
                onClick={() => setOpenMobileMenu(false)}
                className="text-base font-semibold text-slate-700 dark:text-slate-300"
              >
                Audit History
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-rose-50 text-rose-600 hover:bg-rose-100 transition font-semibold rounded-xl text-sm"
              >
                <LogOut className="h-4.5 w-4.5" />
                Sign Out
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-3 pt-2">
              <Link
                to="/login"
                onClick={() => setOpenMobileMenu(false)}
                className="flex items-center justify-center w-full px-4 py-2.5 text-sm font-semibold border border-slate-200 dark:border-slate-800 rounded-xl dark:text-white hover:bg-slate-50 dark:hover:bg-slate-900 transition"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                onClick={() => setOpenMobileMenu(false)}
                className="flex items-center justify-center w-full px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white transition font-semibold rounded-xl text-sm"
              >
                Get started
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}