import {
  ArcElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip
} from "chart.js";
import { Doughnut, Line } from "react-chartjs-2";
import EmptyState from "./EmptyState";
import { formatCurrency } from "../utils/formatters";

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Legend,
  Tooltip,
  Filler
);

const buildCurrencyOptions = (label = "Amount") => ({
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: "#64748b"
      }
    },
    tooltip: {
      callbacks: {
        label: (context) => `${label}: ${formatCurrency(context.parsed.y ?? context.parsed)}`
      }
    }
  },
  scales: {
    y: {
      ticks: {
        callback: (value) => formatCurrency(value)
      },
      grid: {
        color: "rgba(148, 163, 184, 0.18)"
      }
    },
    x: {
      grid: {
        display: false
      }
    }
  }
});

const Charts = ({ categoryBreakdown, monthlyTrend }) => {
  const pieData = {
    labels: categoryBreakdown.map((item) => item._id),
    datasets: [
      {
        data: categoryBreakdown.map((item) => item.total),
        backgroundColor: ["#0284c7", "#0f766e", "#f97316", "#10b981", "#ef4444", "#facc15"],
        borderWidth: 0
      }
    ]
  };

  const lineData = {
    labels: monthlyTrend.map((item) => item.label),
    datasets: [
      {
        label: "Monthly Spending",
        data: monthlyTrend.map((item) => item.total),
        borderColor: "#0284c7",
        backgroundColor: "rgba(2, 132, 199, 0.12)",
        fill: true,
        tension: 0.35
      }
    ]
  };

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-950">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Category Breakdown</h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          See where your expense money is going.
        </p>
        <div className="mt-5">
          {categoryBreakdown.length ? (
            <div className="h-72">
              <Doughnut
                data={pieData}
                options={{
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: "bottom",
                      labels: {
                        color: "#64748b"
                      }
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

      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-950">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Monthly Spending Trend</h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Follow spending over time month by month.
        </p>
        <div className="mt-5">
          {monthlyTrend.length ? (
            <div className="h-72">
              <Line data={lineData} options={buildCurrencyOptions("Spent")} />
            </div>
          ) : (
            <EmptyState
              title="No trend data yet"
              description="No spending trend yet. Add transactions over time to see this chart."
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Charts;
