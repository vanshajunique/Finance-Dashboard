import { useEffect, useMemo, useState } from "react";
import AccountsPanel from "../components/AccountsPanel";
import DashboardShell from "../components/DashboardShell";
import ExpenseForm from "../components/ExpenseForm";
import GoalsPanel from "../components/GoalsPanel";
import LoadingSkeleton from "../components/LoadingSkeleton";
import TransactionList from "../components/TransactionList";
import Charts from "../components/Charts";
import StatCard from "../components/StatCard";
import { accountApi, dashboardApi, goalApi, transactionApi } from "../services/api";
import { useToast } from "../context/ToastContext";

const Dashboard = ({ user, onLogout }) => {
  const [dashboard, setDashboard] = useState({
    totals: { balance: 0, netWorth: 0, monthlyIncome: 0, monthlyExpenses: 0 },
    accounts: [],
    goals: [],
    categoryBreakdown: [],
    monthlyTrend: [],
    recentTransactions: [],
    budgets: [],
    insights: {}
  });
  const [loading, setLoading] = useState(true);
  const [budgetForm, setBudgetForm] = useState({
    category: "",
    limit: "",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });
  const { addToast } = useToast();

  const loadDashboard = async () => {
    const { data } = await dashboardApi.getOverview();
    setDashboard(data);
  };

  useEffect(() => {
    loadDashboard()
      .catch((error) => {
        addToast({
          title: "Failed to load dashboard",
          description: error.response?.data?.message || "Please try again.",
          tone: "error"
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const handleTransactionSubmit = async (payload) => {
    try {
      const { data } = await transactionApi.create(payload);
      addToast({
        title: "Transaction saved",
        description: data.budgetAlert?.exceeded
          ? `${data.budgetAlert.category} is over budget.`
          : "Transaction saved successfully.",
        tone: data.budgetAlert?.exceeded ? "error" : "success"
      });
      await loadDashboard();
    } catch (error) {
      addToast({
        title: "Failed to save transaction",
        description: error.response?.data?.message || "Please try again.",
        tone: "error"
      });
    }
  };

  const handleDeleteTransaction = async (id) => {
    try {
      await transactionApi.remove(id);
      addToast({
        title: "Transaction deleted",
        description: "Transaction deleted successfully.",
        tone: "success"
      });
      await loadDashboard();
    } catch (error) {
      addToast({
        title: "Failed to delete transaction",
        description: error.response?.data?.message || "Please try again.",
        tone: "error"
      });
    }
  };

  const handleImport = async (file, accountId) => {
    if (!file) {
      return;
    }

    if (!dashboard.accounts.length || !accountId) {
      addToast({
        title: "No linked account",
        description: "Create an account before importing transactions.",
        tone: "error"
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("accountId", accountId);

    try {
      const { data } = await transactionApi.importCsv(formData);
      addToast({
        title: "CSV imported",
        description: `${data.message} (${data.count} rows)`,
        tone: "success"
      });
      await loadDashboard();
    } catch (error) {
      addToast({
        title: "CSV import failed",
        description: error.response?.data?.message || "Please try again.",
        tone: "error"
      });
    }
  };

  const handleBudgetSubmit = async (event) => {
    event.preventDefault();

    try {
      await dashboardApi.setBudget({
        ...budgetForm,
        limit: Number(budgetForm.limit)
      });
      addToast({
        title: "Budget saved",
        description: "Budget saved successfully.",
        tone: "success"
      });
      setBudgetForm({
        category: "",
        limit: "",
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
      });
      await loadDashboard();
    } catch (error) {
      addToast({
        title: "Failed to save budget",
        description: error.response?.data?.message || "Please try again.",
        tone: "error"
      });
    }
  };

  const handleCreateAccount = async (payload) => {
    try {
      await accountApi.create(payload);
      addToast({
        title: "Account linked",
        description: "Account linked successfully.",
        tone: "success"
      });
      await loadDashboard();
    } catch (error) {
      addToast({
        title: "Failed to create account",
        description: error.response?.data?.message || "Please try again.",
        tone: "error"
      });
    }
  };

  const handleDeleteAccount = async (id) => {
    try {
      await accountApi.remove(id);
      addToast({
        title: "Account removed",
        description: "Account removed successfully.",
        tone: "success"
      });
      await loadDashboard();
    } catch (error) {
      addToast({
        title: "Failed to delete account",
        description: error.response?.data?.message || "Please try again.",
        tone: "error"
      });
    }
  };

  const handleCreateGoal = async (payload) => {
    try {
      await goalApi.create(payload);
      addToast({
        title: "Goal created",
        description: "Your savings goal has been added.",
        tone: "success"
      });
      await loadDashboard();
    } catch (error) {
      addToast({
        title: "Failed to create goal",
        description: error.response?.data?.message || "Please try again.",
        tone: "error"
      });
    }
  };

  const handleContributeGoal = async (goalId, amount) => {
    if (!amount || amount <= 0) {
      addToast({
        title: "Invalid contribution",
        description: "Enter a contribution amount greater than zero.",
        tone: "error"
      });
      return;
    }

    try {
      await goalApi.contribute(goalId, { amount });
      addToast({
        title: "Contribution added",
        description: "Goal progress updated successfully.",
        tone: "success"
      });
      await loadDashboard();
    } catch (error) {
      addToast({
        title: "Failed to contribute",
        description: error.response?.data?.message || "Please try again.",
        tone: "error"
      });
    }
  };

  const handleDeleteGoal = async (goalId) => {
    try {
      await goalApi.remove(goalId);
      addToast({
        title: "Goal removed",
        description: "Goal deleted successfully.",
        tone: "success"
      });
      await loadDashboard();
    } catch (error) {
      addToast({
        title: "Failed to delete goal",
        description: error.response?.data?.message || "Please try again.",
        tone: "error"
      });
    }
  };

  const statCards = useMemo(
    () => {
      const savingsRate =
        dashboard.totals.monthlyIncome > 0
          ? ((dashboard.totals.monthlyIncome - dashboard.totals.monthlyExpenses) /
              dashboard.totals.monthlyIncome) *
            100
          : 0;
      const financialHealthScore = Math.max(
        0,
        Math.min(
          100,
          Math.round(
            (dashboard.totals.netWorth > 0 ? 35 : 10) +
              Math.max(0, savingsRate) * 0.45 +
              (dashboard.budgets.filter((budget) => !budget.exceeded).length > 0 ? 20 : 5)
          )
        )
      );

      return [
      {
        label: "Total Balance",
        value: `$${dashboard.totals.balance.toFixed(2)}`,
        iconKey: "balance",
        accentClass: "bg-slate-950 text-white",
        trendLabel: dashboard.totals.balance >= 0 ? "Stable cash position" : "Negative cash flow",
        trendTone: dashboard.totals.balance >= 0 ? "positive" : "negative"
      },
      {
        label: "Monthly Income",
        value: `$${dashboard.totals.monthlyIncome.toFixed(2)}`,
        iconKey: "income",
        accentClass: "bg-emerald-50 text-emerald-700",
        trendLabel: dashboard.totals.monthlyIncome > 0 ? "Income flowing in" : "No income logged",
        trendTone: dashboard.totals.monthlyIncome > 0 ? "positive" : "neutral"
      },
      {
        label: "Monthly Expenses",
        value: `$${dashboard.totals.monthlyExpenses.toFixed(2)}`,
        iconKey: "expense",
        accentClass: "bg-rose-50 text-rose-700",
        trendLabel:
          dashboard.totals.monthlyExpenses <= dashboard.totals.monthlyIncome
            ? "Within income range"
            : "Spending above income",
        trendTone:
          dashboard.totals.monthlyExpenses <= dashboard.totals.monthlyIncome ? "positive" : "negative"
      },
      {
        label: "Savings Rate",
        value: `${savingsRate.toFixed(1)}%`,
        iconKey: "savings",
        accentClass: "bg-amber-50 text-amber-700",
        trendLabel: savingsRate >= 20 ? "Strong savings pace" : "Needs attention",
        trendTone: savingsRate >= 20 ? "positive" : savingsRate >= 0 ? "neutral" : "negative"
      },
      {
        label: "Financial Health Score",
        value: `${financialHealthScore}/100`,
        iconKey: "health",
        accentClass: "bg-cyan-50 text-cyan-700",
        trendLabel:
          financialHealthScore >= 75
            ? "Healthy trajectory"
            : financialHealthScore >= 50
              ? "Moderate resilience"
              : "Improve fundamentals",
        trendTone:
          financialHealthScore >= 75
            ? "positive"
            : financialHealthScore >= 50
              ? "neutral"
              : "negative"
      }
    ];
    },
    [dashboard.budgets, dashboard.totals]
  );

  return (
    <DashboardShell user={user} onLogout={onLogout}>
        {loading ? (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              {Array.from({ length: 5 }).map((_, index) => (
                <LoadingSkeleton key={index} className="h-40 w-full rounded-[28px]" />
              ))}
            </div>
            <LoadingSkeleton className="h-64 w-full rounded-[28px]" />
            <LoadingSkeleton className="h-96 w-full rounded-[28px]" />
          </div>
        ) : (
          <>
        <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {statCards.map((card) => (
            <StatCard key={card.label} title={card.label} value={card.value} trendLabel={card.trendLabel} trendTone={card.trendTone} iconKey={card.iconKey} accentClass={card.accentClass} />
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
          <div className="space-y-6">
            <ExpenseForm
              accounts={dashboard.accounts}
              onSubmit={handleTransactionSubmit}
              onImport={handleImport}
            />
            <Charts
              categoryBreakdown={dashboard.categoryBreakdown}
              monthlyTrend={dashboard.monthlyTrend}
            />
            <TransactionList
              transactions={dashboard.recentTransactions}
              onDelete={handleDeleteTransaction}
            />
            <GoalsPanel
              goals={dashboard.goals}
              onCreate={handleCreateGoal}
              onContribute={handleContributeGoal}
              onDelete={handleDeleteGoal}
            />
          </div>

          <div className="space-y-6">
            <AccountsPanel
              accounts={dashboard.accounts}
              onCreate={handleCreateAccount}
              onDelete={handleDeleteAccount}
            />

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-950/70">
              <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
                <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Set Monthly Budget</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Create category budgets and monitor usage.</p>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                  Net Worth
                  <div className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
                    ${dashboard.totals.netWorth.toFixed(2)}
                  </div>
                </div>
              </div>

              <form onSubmit={handleBudgetSubmit} className="mt-5 space-y-4">
                <input
                  type="text"
                  required
                  placeholder="Category"
                  value={budgetForm.category}
                  onChange={(event) =>
                    setBudgetForm({ ...budgetForm, category: event.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
                <input
                  type="number"
                  required
                  placeholder="Budget limit"
                  value={budgetForm.limit}
                  onChange={(event) => setBudgetForm({ ...budgetForm, limit: event.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    required
                    min="1"
                    max="12"
                    placeholder="Month"
                    value={budgetForm.month}
                    onChange={(event) => setBudgetForm({ ...budgetForm, month: event.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                  <input
                    type="number"
                    required
                    placeholder="Year"
                    value={budgetForm.year}
                    onChange={(event) => setBudgetForm({ ...budgetForm, year: event.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>
                <button className="w-full rounded-xl bg-slate-900 px-4 py-3 font-medium text-white hover:bg-slate-700 dark:bg-cyan-600 dark:hover:bg-cyan-500">
                  Save Budget
                </button>
              </form>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-950/70">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Budget Usage</h3>
              <div className="mt-5 space-y-4">
                {dashboard.budgets.length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400">No budgets set yet for this month.</p>
                ) : (
                  dashboard.budgets.map((budget) => (
                    <div key={budget.id}>
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="font-medium text-slate-800 dark:text-slate-200">{budget.category}</span>
                        <span className={budget.exceeded ? "text-rose-600" : "text-slate-500 dark:text-slate-400"}>
                          ${budget.spent.toFixed(2)} / ${budget.limit.toFixed(2)}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <div
                          className={`h-full rounded-full ${
                            budget.exceeded ? "bg-rose-500" : "bg-sky-500"
                          }`}
                          style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-950/70">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">AI Spending Insights</h3>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                {Object.values(dashboard.insights || {}).slice(0, 3).map((insight) => (
                  <div key={insight.title}>
                    <p className="font-medium text-slate-900 dark:text-white">{insight.title}</p>
                    {(Array.isArray(insight.message) ? insight.message : [insight.message]).map((item) => (
                      <p key={item} className="mt-1 text-slate-600 dark:text-slate-300">{item}</p>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
          </>
        )}
    </DashboardShell>
  );
};

export default Dashboard;
