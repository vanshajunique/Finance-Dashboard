import { useEffect, useState } from "react";
import BudgetManager from "../components/BudgetManager";
import DashboardShell from "../components/DashboardShell";
import LoadingSkeleton from "../components/LoadingSkeleton";
import { useToast } from "../context/ToastContext";
import { dashboardApi } from "../services/api";

const createInitialBudgetForm = () => ({
  category: "",
  limit: "",
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear()
});

const Budgets = ({ user, onLogout }) => {
  const [overview, setOverview] = useState({
    budgets: [],
    totals: { netWorth: 0 }
  });
  const [budgetForm, setBudgetForm] = useState(createInitialBudgetForm());
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const loadBudgets = async () => {
    const { data } = await dashboardApi.getOverview();
    setOverview({
      budgets: data.budgets || [],
      totals: data.totals || { netWorth: 0 }
    });
  };

  useEffect(() => {
    loadBudgets()
      .catch((error) => {
        addToast({
          title: "Failed to load budgets",
          description: error.response?.data?.message || "Please try again.",
          tone: "error"
        });
      })
      .finally(() => setLoading(false));
  }, []);

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
      setBudgetForm(createInitialBudgetForm());
      await loadBudgets();
    } catch (error) {
      addToast({
        title: "Failed to save budget",
        description: error.response?.data?.message || "Please try again.",
        tone: "error"
      });
    }
  };

  return (
    <DashboardShell user={user} onLogout={onLogout}>
      {loading ? (
        <div className="space-y-6">
          <LoadingSkeleton className="h-80 w-full rounded-[28px]" />
          <LoadingSkeleton className="h-72 w-full rounded-[28px]" />
        </div>
      ) : (
        <div className="space-y-6">
          <BudgetManager
            budgets={overview.budgets}
            budgetForm={budgetForm}
            setBudgetForm={setBudgetForm}
            onSubmit={handleBudgetSubmit}
            netWorth={overview.totals.netWorth}
          />
        </div>
      )}
    </DashboardShell>
  );
};

export default Budgets;
