import { useState } from "react";
import EmptyState from "./EmptyState";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0
});

const GoalsPanel = ({ goals, onCreate, onContribute, onDelete }) => {
  const [form, setForm] = useState({
    goalName: "",
    targetAmount: "",
    savedAmount: "",
    deadline: ""
  });
  const [contributions, setContributions] = useState({});

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onCreate({
      ...form,
      targetAmount: Number(form.targetAmount),
      savedAmount: Number(form.savedAmount || 0)
    });
    setForm({
      goalName: "",
      targetAmount: "",
      savedAmount: "",
      deadline: ""
    });
  };

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-950/70">
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-slate-950 dark:text-white">Goal-Based Financial Planning</h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Plan for emergency savings, travel, and large purchases with clear monthly targets.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
        <input
          type="text"
          required
          placeholder="Goal name"
          value={form.goalName}
          onChange={(event) => setForm({ ...form, goalName: event.target.value })}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        />
        <input
          type="number"
          required
          placeholder="Target amount"
          value={form.targetAmount}
          onChange={(event) => setForm({ ...form, targetAmount: event.target.value })}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        />
        <input
          type="number"
          placeholder="Already saved"
          value={form.savedAmount}
          onChange={(event) => setForm({ ...form, savedAmount: event.target.value })}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        />
        <input
          type="date"
          required
          value={form.deadline}
          onChange={(event) => setForm({ ...form, deadline: event.target.value })}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        />
        <button className="rounded-2xl bg-slate-950 px-4 py-3 font-medium text-white transition hover:bg-slate-800 dark:bg-cyan-600 dark:hover:bg-cyan-500 md:col-span-2">
          Create Goal
        </button>
      </form>

      <div className="mt-6 space-y-4">
        {goals.length === 0 ? (
          <EmptyState
            title="No goals yet"
            description="Create your first financial goal to start tracking monthly savings targets and progress."
          />
        ) : (
          goals.map((goal) => (
            <div
              key={goal._id}
              className="rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/60"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h4 className="text-lg font-semibold text-slate-950 dark:text-white">{goal.goalName}</h4>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Target {currencyFormatter.format(goal.targetAmount)} by{" "}
                    {new Date(goal.deadline).toLocaleDateString("en-IN")}
                  </p>
                  <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                    Saved {currencyFormatter.format(goal.savedAmount)} of{" "}
                    {currencyFormatter.format(goal.targetAmount)}
                  </p>
                  <p className="mt-2 text-sm font-medium text-cyan-700 dark:text-cyan-300">
                    You need to save {currencyFormatter.format(goal.monthlySavingsNeeded)} per month to
                    reach this goal by the deadline.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onDelete(goal._id)}
                  className="rounded-xl bg-rose-50 px-3 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300"
                >
                  Delete
                </button>
              </div>

              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Progress</span>
                  <span className="font-medium text-slate-900 dark:text-white">{goal.progress.toFixed(1)}%</span>
                </div>
                <div className="h-3 rounded-full bg-slate-200 dark:bg-slate-800">
                  <div
                    className={`h-full rounded-full ${
                      goal.isCompleted ? "bg-emerald-500" : goal.isOverdue ? "bg-rose-500" : "bg-cyan-500"
                    }`}
                    style={{ width: `${Math.min(goal.progress, 100)}%` }}
                  />
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-3 md:flex-row">
                <input
                  type="number"
                  placeholder="Add contribution"
                  value={contributions[goal._id] || ""}
                  onChange={(event) =>
                    setContributions((current) => ({
                      ...current,
                      [goal._id]: event.target.value
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => onContribute(goal._id, Number(contributions[goal._id] || 0))}
                  className="rounded-2xl bg-cyan-600 px-4 py-3 font-medium text-white transition hover:bg-cyan-500"
                >
                  Contribute
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default GoalsPanel;

