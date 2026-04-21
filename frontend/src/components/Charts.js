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

const Charts = ({ categoryBreakdown, monthlyTrend }) => {
  const pieData = {
    labels: categoryBreakdown.map((item) => item._id),
    datasets: [
      {
        data: categoryBreakdown.map((item) => item.total),
        backgroundColor: ["#0ea5e9", "#8b5cf6", "#f97316", "#10b981", "#ef4444", "#facc15"],
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
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-950/70">
        <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Category Breakdown</h3>
        {categoryBreakdown.length ? (
          <Doughnut data={pieData} />
        ) : (
          <EmptyState
            title="No category chart yet"
            description="Add expense transactions to visualize category spending."
          />
        )}
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-950/70">
        <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Monthly Spending Trend</h3>
        {monthlyTrend.length ? (
          <Line data={lineData} />
        ) : (
          <EmptyState
            title="No trend data yet"
            description="Monthly spending trends will appear once you log transactions over time."
          />
        )}
      </div>
    </div>
  );
};

export default Charts;
