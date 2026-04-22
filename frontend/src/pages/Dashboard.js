import { useEffect, useMemo, useState } from "react";
import AccountsPanel from "../components/AccountsPanel";
import Charts from "../components/Charts";
import DashboardShell from "../components/DashboardShell";
import EmptyState from "../components/EmptyState";
import ExpenseForm from "../components/ExpenseForm";
import GoalsPanel from "../components/GoalsPanel";
import LoadingSkeleton from "../components/LoadingSkeleton";
import StatCard from "../components/StatCard";
import TransactionList from "../components/TransactionList";
import { useToast } from "../context/ToastContext";
import { accountApi, dashboardApi, goalApi, transactionApi } from "../services/api";
import { formatCurrency, formatPercent } from "../utils/formatters";

const inputClassName =
  "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-cyan-400 dark:focus:ring-cyan-950/60";

const labelClassName = "text-sm font-medium text-slate-700 dark:text-slate-200";

const getCsvErrorDescription = (error) => {
  const serverMessage = error.response?.data?.message;
  const serverErrors = error.response?.data?.errors;

  if (Array.isArray(serverErrors) && serverErrors.length > 0) {
    const firstIssue = serverErrors[0];
    if (typeof firstIssue === "string") {
      return `${serverMessage || "CSV import failed"}: ${firstIssue}`;
    }

    if (firstIssue.row && firstIssue.message) {
      return `${serverMessage || "CSV import failed"}: Row ${firstIssue.row} - ${firstIssue.message}`;
    }

    if (firstIssue.message) {
      return `${serverMessage || "CSV import failed"}: ${firstIssue.message}`;
    }
  }

  return serverMessage || "Please check the CSV file and try again.";
};

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
      throw error;
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
        description: `${data.message}. ${data.count} transactions added.`,
        tone: "success"
      });
      await loadDashboard();
    } catch (error) {
      addToast({
        title: "CSV import failed",
        description: getCsvErrorDescription(error),
        tone: "error"
      });
      throw error;
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
      throw error;
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
      throw error;
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

  const statCards = useMemo(() => {
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
        value: formatCurrency(dashboard.totals.balance),
        helperText: "Money currently available",
        iconKey: "balance",
        accentClass: "bg-slate-950 text-white dark:bg-slate-800 dark:text-cyan-200"
      },
      {
        label: "Income This Month",
        value: formatCurrency(dashboard.totals.monthlyIncome),
        helperText: "Money received this month",
        iconKey: "income",
        accentClass: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
      },
      {
        label: "Expenses This Month",
        value: formatCurrency(dashboard.totals.monthlyExpenses),
        helperText: "Money spent this month",
        iconKey: "expense",
        accentClass: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
      },
      {
        label: "Savings Rate",
        value: formatPercent(savingsRate),
        helperText: "How much you saved from income",
        iconKey: "savings",
        accentClass: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
      },
      {
        label: "Financial Health Score",
        value: `${financialHealthScore}/100`,
        helperText: "Overall money health",
        iconKey: "health",
        accentClass: "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300"
      }
    ];
  }, [dashboard.budgets, dashboard.totals]);

  return (
    <DashboardShell user={user} onLogout={onLogout}>
      {loading ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {Array.from({ length: 5 }).map((_, index) => (
              <LoadingSkeleton key={index} className="h-36 w-full rounded-[28px]" />
            ))}
          </div>
          <LoadingSkeleton className="h-56 w-full rounded-[28px]" />
          <LoadingSkeleton className="h-80 w-full rounded-[28px]" />
        </div>
      ) : (
        <>
          <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {statCards.map((card) => (
              <StatCard
                key={card.label}
                title={card.label}
                value={card.value}
                helperText={card.helperText}
                iconKey={card.iconKey}
                accentClass={card.accentClass}
              />
            ))}
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
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
                      {formatCurrency(dashboard.totals.netWorth)}
                    </div>
                  </div>
                </div>

                <form onSubmit={handleBudgetSubmit} className="grid gap-5">
                  <label className={labelClassName}>
                    Category
                    <input
                      type="text"
                      required
                      placeholder="Example: Groceries"
                      value={budgetForm.category}
                      onChange={(event) =>
                        setBudgetForm({ ...budgetForm, category: event.target.value })
                      }
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
                        onChange={(event) =>
                          setBudgetForm({ ...budgetForm, month: event.target.value })
                        }
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
                        onChange={(event) =>
                          setBudgetForm({ ...budgetForm, year: event.target.value })
                        }
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
                  {dashboard.budgets.length === 0 ? (
                    <EmptyState
                      title="No budgets yet"
                      description="Create a budget to track how much you plan to spend in each category."
                    />
                  ) : (
                    dashboard.budgets.map((budget) => (
                      <div key={budget.id}>
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <span className="font-medium text-slate-800 dark:text-slate-200">
                            {budget.category}
                          </span>
                          <span
                            className={
                              budget.exceeded ? "text-rose-600" : "text-slate-500 dark:text-slate-400"
                            }
                          >
                            {formatCurrency(budget.spent)} / {formatCurrency(budget.limit)}
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

              <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-950">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Spending Insights</h3>
                <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                  {Object.values(dashboard.insights || {}).slice(0, 3).length > 0 ? (
                    Object.values(dashboard.insights || {})
                      .slice(0, 3)
                      .map((insight) => (
                        <div key={insight.title} className="rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-900">
                          <p className="font-medium text-slate-900 dark:text-white">{insight.title}</p>
                          {(Array.isArray(insight.message) ? insight.message : [insight.message]).map((item) => (
                            <p key={item} className="mt-1">
                              {item}
                            </p>
                          ))}
                        </div>
                      ))
                  ) : (
                    <EmptyState
                      title="No insights yet"
                      description="Add more transactions and budgets to unlock clearer spending guidance."
                    />
                  )}
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
