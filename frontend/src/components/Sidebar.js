import { NavLink } from "react-router-dom";

const navigationItems = [
  { label: "Dashboard", path: "/" },
  { label: "Accounts", path: null },
  { label: "Transactions", path: null },
  { label: "Budgets", path: null },
  { label: "Analytics", path: "/analytics" },
  { label: "Financial Goals", path: "/goals" },
  { label: "Settings", path: null }
];

const Sidebar = () => {
  return (
    <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-slate-950 text-slate-100 dark:border-slate-800 lg:flex lg:flex-col">
      <div className="border-b border-slate-800 px-6 py-6">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-400">Fintech OS</p>
        <h1 className="mt-3 text-2xl font-semibold">Personal Finance Dashboard</h1>
        <p className="mt-2 text-sm text-slate-400">
          One place to track cash flow, accounts, budgets, and long-term financial health.
        </p>
      </div>

      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-2">
          {navigationItems.map((item, index) => (
            <li key={item.label}>
              {item.path ? (
                <NavLink
                  to={item.path}
                  end={item.path === "/"}
                  className={({ isActive }) =>
                    `flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${
                      isActive
                        ? "bg-cyan-500/15 text-cyan-300"
                        : "text-slate-300 hover:bg-slate-900 hover:text-white"
                    }`
                  }
                >
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-slate-200">
                    {index + 1}
                  </span>
                  {item.label}
                </NavLink>
              ) : (
                <button
                  className="flex w-full cursor-default items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium text-slate-500"
                  type="button"
                >
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-slate-500">
                    {index + 1}
                  </span>
                  {item.label}
                </button>
              )}
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-slate-800 px-6 py-5">
        <div className="rounded-3xl bg-gradient-to-br from-cyan-500/15 to-blue-500/10 p-4">
          <p className="text-sm font-medium text-slate-200">Daily Focus</p>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Review linked account balances and compare this month&apos;s savings rate against your
            income trend.
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
