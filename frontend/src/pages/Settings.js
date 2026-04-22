import { useState } from "react";
import DashboardShell from "../components/DashboardShell";
import { useTheme } from "../context/ThemeContext";

const Settings = ({ user, onLogout }) => {
  const { theme, toggleTheme } = useTheme();
  const [preferences, setPreferences] = useState({
    monthlySummary: true,
    budgetAlerts: true,
    compactCharts: false
  });

  const handlePreferenceToggle = (key) => {
    setPreferences((current) => ({
      ...current,
      [key]: !current[key]
    }));
  };

  return (
    <DashboardShell user={user} onLogout={onLogout}>
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-950">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Profile Summary</h2>
          <div className="mt-5 space-y-4 text-sm">
            <div>
              <p className="text-slate-500 dark:text-slate-400">Name</p>
              <p className="mt-1 font-medium text-slate-900 dark:text-white">{user?.name || "Guest user"}</p>
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400">Email</p>
              <p className="mt-1 font-medium text-slate-900 dark:text-white">{user?.email || "Not available"}</p>
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400">Workspace</p>
              <p className="mt-1 font-medium text-slate-900 dark:text-white">Personal Finance Dashboard</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-950">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Theme</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Choose the display mode that feels easiest on your eyes.
            </p>
            <div className="mt-5 flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-4 dark:bg-slate-900">
              <div>
                <p className="font-medium text-slate-900 dark:text-white">
                  {theme === "dark" ? "Dark mode enabled" : "Light mode enabled"}
                </p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Switch instantly between bright and dark dashboard styles.
                </p>
              </div>
              <button
                type="button"
                onClick={toggleTheme}
                className="rounded-2xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400"
              >
                {theme === "dark" ? "Use Light Mode" : "Use Dark Mode"}
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-950">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">App Preferences</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              These controls are frontend-only for now and help shape your workspace experience.
            </p>
            <div className="mt-5 space-y-3">
              {[
                ["monthlySummary", "Show monthly summary prompts"],
                ["budgetAlerts", "Keep budget alert reminders enabled"],
                ["compactCharts", "Prefer compact charts where possible"]
              ].map(([key, label]) => (
                <label
                  key={key}
                  className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-4 text-sm dark:bg-slate-900"
                >
                  <span className="font-medium text-slate-900 dark:text-white">{label}</span>
                  <input
                    type="checkbox"
                    checked={preferences[key]}
                    onChange={() => handlePreferenceToggle(key)}
                    className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                  />
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
};

export default Settings;
