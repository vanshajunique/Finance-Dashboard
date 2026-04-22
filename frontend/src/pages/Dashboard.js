import { useEffect, useMemo, useState } from "react";
import Charts from "../components/Charts";
import DashboardShell from "../components/DashboardShell";
import EmptyState from "../components/EmptyState";
import LoadingSkeleton from "../components/LoadingSkeleton";
import StatCard from "../components/StatCard";
import TransactionList from "../components/TransactionList";
import { useToast } from "../context/ToastContext";
import { dashboardApi, transactionApi } from "../services/api";
import { formatCurrency, formatPercent } from "../utils/formatters";

const Dashboard = ({ user, onLogout }) => {
  const [dashboard, setDashboard] = useState({
    totals: { balance: 0, netWorth: 0, monthlyIncome: 0, monthlyExpenses: 0 },
    categoryBreakdown: [],
    monthlyTrend: [],
    recentTransactions: [],
    budgets: [],
    insights: {}
  });
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const loadDashboard = async () => {
    const { data } = await dashboardApi.getOverview();
    setDashboard({
      totals: data.totals,
      categoryBreakdown: data.categoryBreakdown,
      monthlyTrend: data.monthlyTrend,
      recentTransactions: data.recentTransactions,
      budgets: data.budgets,
      insights: data.insights
    });
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
          <LoadingSkeleton className="h-72 w-full rounded-[28px]" />
          <LoadingSkeleton className="h-80 w-full rounded-[28px]" />
        </div>
      ) : (
        <div className="space-y-6">
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
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

          <Charts categoryBreakdown={dashboard.categoryBreakdown} monthlyTrend={dashboard.monthlyTrend} />

          <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <TransactionList transactions={dashboard.recentTransactions} onDelete={handleDeleteTransaction} />

            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-950">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Spending Insights</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Plain-language observations about your current spending pattern.
              </p>
              <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                {Object.values(dashboard.insights || {}).length > 0 ? (
                  Object.values(dashboard.insights || {}).map((insight) => (
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
          </section>

          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-950">
            <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Budget Snapshot</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  A quick view of how your current category budgets are tracking.
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                Net Worth
                <div className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
                  {formatCurrency(dashboard.totals.netWorth)}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {dashboard.budgets.length === 0 ? (
                <EmptyState
                  title="No budgets yet"
                  description="Create a budget on the Budgets page to start tracking planned spending."
                />
              ) : (
                dashboard.budgets.map((budget) => (
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
        </div>
      )}
    </DashboardShell>
  );
};

export default Dashboard;
