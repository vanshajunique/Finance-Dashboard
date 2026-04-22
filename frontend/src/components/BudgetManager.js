import EmptyState from "./EmptyState";
import { formatCurrency } from "../utils/formatters";

const inputClassName =
  "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-cyan-400 dark:focus:ring-cyan-950/60";

const labelClassName = "text-sm font-medium text-slate-700 dark:text-slate-200";

const BudgetManager = ({ budgets, budgetForm, setBudgetForm, onSubmit, netWorth }) => {
  return (
    <>
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-950">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Set Monthly Budget</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Create simple category limits for the current month.
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500 dark:bg-slate-900 dark:text-slate-400">
            Net Worth
            <div className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
              {formatCurrency(netWorth)}
            </div>
          </div>
        </div>

        <form onSubmit={onSubmit} className="grid gap-5">
          <label className={labelClassName}>
            Category
            <input
              type="text"
              required
              placeholder="Example: Groceries"
              value={budgetForm.category}
              onChange={(event) => setBudgetForm({ ...budgetForm, category: event.target.value })}
              className={inputClassName}
            />
          </label>

          <label className={labelClassName}>
            Budget limit
            <input
              type="number"
              required
              min="0"
              step="0.01"
              placeholder="Enter monthly limit in rupees"
              value={budgetForm.limit}
              onChange={(event) => setBudgetForm({ ...budgetForm, limit: event.target.value })}
              className={inputClassName}
            />
          </label>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className={labelClassName}>
              Month
              <input
                type="number"
                required
                min="1"
                max="12"
                placeholder="Month number"
                value={budgetForm.month}
                onChange={(event) => setBudgetForm({ ...budgetForm, month: event.target.value })}
                className={inputClassName}
              />
            </label>
            <label className={labelClassName}>
              Year
              <input
                type="number"
                required
                placeholder="Year"
                value={budgetForm.year}
                onChange={(event) => setBudgetForm({ ...budgetForm, year: event.target.value })}
                className={inputClassName}
              />
            </label>
          </div>

          <button className="w-full rounded-2xl bg-sky-600 px-4 py-3.5 font-semibold text-white transition hover:bg-sky-700 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400">
            Save Budget
          </button>
        </form>
      </div>

      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-950">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Budget Usage</h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Check which categories are within limit this month.
        </p>
        <div className="mt-5 space-y-4">
          {budgets.length === 0 ? (
            <EmptyState
              title="No budgets yet"
              description="Create a budget to track how much you plan to spend in each category."
            />
          ) : (
            budgets.map((budget) => (
              <div key={budget.id}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-800 dark:text-slate-200">{budget.category}</span>
                  <span className={budget.exceeded ? "text-rose-600" : "text-slate-500 dark:text-slate-400"}>
                    {formatCurrency(budget.spent)} / {formatCurrency(budget.limit)}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className={`h-full rounded-full ${budget.exceeded ? "bg-rose-500" : "bg-sky-500"}`}
                    style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default BudgetManager;
