import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import { useEffect, useMemo, useState } from "react";
import DashboardShell from "../components/DashboardShell";
import EmptyState from "../components/EmptyState";
import InsightCard from "../components/InsightCard";
import LoadingSkeleton from "../components/LoadingSkeleton";
import { useToast } from "../context/ToastContext";
import { dashboardApi } from "../services/api";
import { formatCompactCurrency, formatCurrency, formatPercent } from "../utils/formatters";

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Legend,
  Tooltip,
  Filler
);

const chartOptions = {
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top",
      labels: {
        color: "#64748b"
      }
    },
    tooltip: {
      callbacks: {
        label: (context) => `${context.dataset.label || context.label}: ${formatCurrency(context.parsed.y ?? context.parsed.x ?? context.parsed)}`
      }
    }
  },
  scales: {
    y: {
      ticks: {
        callback: (value) => formatCompactCurrency(value)
      },
      grid: {
        color: "rgba(148, 163, 184, 0.16)"
      }
    },
    x: {
      grid: {
        display: false
      }
    }
  }
};

const horizontalBarOptions = {
  ...chartOptions,
  indexAxis: "y",
  plugins: {
    ...chartOptions.plugins,
    legend: { display: false }
  }
};

const Analytics = ({ user, onLogout }) => {
  const [analytics, setAnalytics] = useState({
    totals: { balance: 0, netWorth: 0, monthlyIncome: 0, monthlyExpenses: 0 },
    categoryBreakdown: [],
    monthlyTrend: [],
    incomeExpenseComparison: [],
    weekdayHeatmap: [],
    accountBalanceDistribution: [],
    financialHealth: { score: 0, savingsRate: 0, expenseRatio: 0, budgetUsage: 0 },
    insights: {}
  });
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    dashboardApi
      .getOverview()
      .then(({ data }) => setAnalytics(data))
      .catch((requestError) => {
        addToast({
          title: "Failed to load analytics",
          description: requestError.response?.data?.message || "Please try again.",
          tone: "error"
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const insightCards = useMemo(() => Object.values(analytics.insights || {}), [analytics.insights]);

  const categoryChartData = {
    labels: analytics.categoryBreakdown.map((item) => item._id),
    datasets: [
      {
        data: analytics.categoryBreakdown.map((item) => item.total),
        backgroundColor: ["#0284c7", "#0f766e", "#f97316", "#8b5cf6", "#ef4444", "#facc15"],
        borderWidth: 0
      }
    ]
  };

  const incomeExpenseChartData = {
    labels: analytics.incomeExpenseComparison.map((item) => item.label),
    datasets: [
      {
        label: "Income",
        data: analytics.incomeExpenseComparison.map((item) => item.income),
        backgroundColor: "#10b981",
        borderRadius: 10
      },
      {
        label: "Expenses",
        data: analytics.incomeExpenseComparison.map((item) => item.expense),
        backgroundColor: "#f97316",
        borderRadius: 10
      }
    ]
  };

  const monthlyTrendData = {
    labels: analytics.monthlyTrend.map((item) => item.label),
    datasets: [
      {
        label: "Monthly Spending",
        data: analytics.monthlyTrend.map((item) => item.total),
        borderColor: "#0891b2",
        backgroundColor: "rgba(8, 145, 178, 0.12)",
        fill: true,
        tension: 0.35
      }
    ]
  };

  const accountDistributionData = {
    labels: analytics.accountBalanceDistribution.map((item) => item.label),
    datasets: [
      {
        label: "Balance",
        data: analytics.accountBalanceDistribution.map((item) => item.value),
        backgroundColor: ["#0f172a", "#0284c7", "#14b8a6", "#7c3aed", "#f97316"],
        borderRadius: 10
      }
    ]
  };

  const maxHeatmapValue = Math.max(...analytics.weekdayHeatmap.map((item) => item.total), 0);

  return (
    <DashboardShell user={user} onLogout={onLogout}>
      {loading ? (
        <div className="space-y-6">
          <LoadingSkeleton className="h-24 w-full rounded-[28px]" />
          <div className="grid gap-6 xl:grid-cols-2">
            <LoadingSkeleton className="h-80 w-full rounded-[28px]" />
            <LoadingSkeleton className="h-80 w-full rounded-[28px]" />
            <LoadingSkeleton className="h-80 w-full rounded-[28px]" />
            <LoadingSkeleton className="h-80 w-full rounded-[28px]" />
          </div>
        </div>
      ) : (
        <>
          <section className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-600">Analytics</p>
              <h1 className="mt-2 text-4xl font-semibold text-slate-950 dark:text-white">
                Money insights at a glance
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                Review income, expenses, account balances, and spending patterns with cleaner charts and easier explanations.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-slate-200/80 bg-white px-5 py-4 shadow-soft dark:border-slate-800 dark:bg-slate-950">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Health Score</p>
                <p className="mt-2 text-3xl font-semibold text-slate-950 dark:text-white">
                  {analytics.financialHealth.score}/100
                </p>
              </div>
              <div className="rounded-3xl border border-slate-200/80 bg-white px-5 py-4 shadow-soft dark:border-slate-800 dark:bg-slate-950">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Savings Rate</p>
                <p className="mt-2 text-3xl font-semibold text-emerald-600">
                  {formatPercent(analytics.financialHealth.savingsRate)}
                </p>
              </div>
              <div className="rounded-3xl border border-slate-200/80 bg-white px-5 py-4 shadow-soft dark:border-slate-800 dark:bg-slate-950">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Expense Ratio</p>
                <p className="mt-2 text-3xl font-semibold text-amber-600">
                  {formatPercent(analytics.financialHealth.expenseRatio)}
                </p>
              </div>
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <div className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-950">
              <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Category Spending</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Which categories take the biggest share of your expenses.</p>
              <div className="mt-5">
                {analytics.categoryBreakdown.length ? (
                  <div className="h-72">
                    <Doughnut
                      data={categoryChartData}
                      options={{
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: "bottom",
                            labels: { color: "#64748b" }
                          },
                          tooltip: {
                            callbacks: {
                              label: (context) => `${context.label}: ${formatCurrency(context.parsed)}`
                            }
                          }
                        }
                      }}
                    />
                  </div>
                ) : (
                  <EmptyState
                    title="No category data yet"
                    description="No category data yet. Expense data will appear here."
                  />
                )}
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-950">
              <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Income vs Expense</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Compare money coming in and going out by month.</p>
              <div className="mt-5">
                {analytics.incomeExpenseComparison.length ? (
                  <div className="h-72">
                    <Bar data={incomeExpenseChartData} options={chartOptions} />
                  </div>
                ) : (
                  <EmptyState
                    title="No cashflow comparison yet"
                    description="Add income and expense transactions to compare them here."
                  />
                )}
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-950">
              <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Monthly Spending Trend</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">See whether your spending is rising, stable, or falling.</p>
              <div className="mt-5">
                {analytics.monthlyTrend.length ? (
                  <div className="h-72">
                    <Line data={monthlyTrendData} options={chartOptions} />
                  </div>
                ) : (
                  <EmptyState
                    title="No trend data yet"
                    description="No spending trend yet. Add transactions over time to see this chart."
                  />
                )}
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-950">
              <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Spending by Weekday</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Find the days when your expenses tend to be highest.</p>
              <div className="mt-5">
                {analytics.weekdayHeatmap.length ? (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-7">
                    {analytics.weekdayHeatmap.map((item) => {
                      const intensity = maxHeatmapValue > 0 ? item.total / maxHeatmapValue : 0;

                      return (
                        <div
                          key={item.day}
                          className="rounded-3xl border border-slate-200 p-4 text-center dark:border-slate-700"
                          style={{
                            backgroundColor: `rgba(8, 145, 178, ${0.08 + intensity * 0.45})`
                          }}
                        >
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.day}</p>
                          <p className="mt-3 text-xl font-semibold text-slate-950 dark:text-white">
                            {formatCompactCurrency(item.total)}
                          </p>
                          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                            {item.count} txn
                          </p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <EmptyState
                    title="No weekday data yet"
                    description="Add expense transactions to see which days usually cost you more."
                  />
                )}
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-950 xl:col-span-2">
              <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Account Balance Distribution</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">How your current balances are split across linked accounts.</p>
              <div className="mt-5">
                {analytics.accountBalanceDistribution.length ? (
                  <div className="h-80">
                    <Bar data={accountDistributionData} options={horizontalBarOptions} />
                  </div>
                ) : (
                  <EmptyState
                    title="No accounts linked"
                    description="Link accounts to visualize where your money is currently sitting."
                  />
                )}
              </div>
            </div>
          </section>

          <section className="mt-8 grid gap-6 xl:grid-cols-[0.78fr_1.22fr]">
            <div className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-950">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-600">Financial Health</p>
              <h2 className="mt-3 text-5xl font-semibold text-slate-950 dark:text-white">
                {analytics.financialHealth.score}
                <span className="text-xl text-slate-400 dark:text-slate-500">/100</span>
              </h2>
              <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
                This score blends savings rate, expense ratio, and budget usage into one simple view of your money health.
              </p>

              <div className="mt-6 space-y-5">
                <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Savings Rate</span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {formatPercent(analytics.financialHealth.savingsRate)}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{ width: `${Math.min(Math.max(analytics.financialHealth.savingsRate, 0), 100)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Expense Ratio</span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {formatPercent(analytics.financialHealth.expenseRatio)}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-full rounded-full bg-amber-500"
                      style={{ width: `${Math.min(Math.max(analytics.financialHealth.expenseRatio, 0), 100)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Budget Usage</span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {formatPercent(analytics.financialHealth.budgetUsage)}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-full rounded-full bg-cyan-500"
                      style={{ width: `${Math.min(Math.max(analytics.financialHealth.budgetUsage, 0), 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="mb-4">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-600">Insights</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
                  Recommendations and signals
                </h2>
              </div>
              {insightCards.length ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {insightCards.map((insight) => (
                    <InsightCard key={insight.title} insight={insight} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No insights yet"
                  description="Add more transactions and budgets to unlock tailored recommendations here."
                />
              )}
            </div>
          </section>
        </>
      )}
    </DashboardShell>
  );
};

export default Analytics;
