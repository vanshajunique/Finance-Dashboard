import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { getCurrentPageMeta } from "../config/navigation";

const Navbar = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const currentPage = getCurrentPageMeta(location.pathname);

  const handleLogout = () => {
    onLogout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/85 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
      <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-600">{currentPage.eyebrow}</p>
          <Link to="/dashboard" className="mt-1 block text-2xl font-semibold text-slate-950 dark:text-white">
            {currentPage.title}
          </Link>
          <p className="text-sm text-slate-500 dark:text-slate-400">{currentPage.description}</p>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </button>
          <div className="hidden rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 md:block">
            <p className="font-medium text-slate-900 dark:text-white">{user?.name || "Guest"}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email || "Secure session active"}</p>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-cyan-600 dark:hover:bg-cyan-500"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
