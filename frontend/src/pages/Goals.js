import { useEffect, useState } from "react";
import DashboardShell from "../components/DashboardShell";
import GoalsPanel from "../components/GoalsPanel";
import LoadingSkeleton from "../components/LoadingSkeleton";
import { goalApi } from "../services/api";
import { useToast } from "../context/ToastContext";

const Goals = ({ user, onLogout }) => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const loadGoals = async () => {
    const { data } = await goalApi.getAll();
    setGoals(data);
  };

  useEffect(() => {
    loadGoals()
      .catch((error) => {
        addToast({
          title: "Failed to load goals",
          description: error.response?.data?.message || "Please try again.",
          tone: "error"
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const handleCreateGoal = async (payload) => {
    try {
      await goalApi.create(payload);
      addToast({
        title: "Goal created",
        description: "Your savings plan has been added.",
        tone: "success"
      });
      await loadGoals();
    } catch (error) {
      addToast({
        title: "Failed to create goal",
        description: error.response?.data?.message || "Please try again.",
        tone: "error"
      });
      throw error;
    }
  };

  const handleContributeToGoal = async (goalId, amount) => {
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
        description: "Goal progress has been updated.",
        tone: "success"
      });
      await loadGoals();
    } catch (error) {
      addToast({
        title: "Failed to update goal",
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
        description: "The goal has been deleted.",
        tone: "success"
      });
      await loadGoals();
    } catch (error) {
      addToast({
        title: "Failed to delete goal",
        description: error.response?.data?.message || "Please try again.",
        tone: "error"
      });
    }
  };

  return (
    <DashboardShell user={user} onLogout={onLogout}>
      {loading ? (
        <div className="space-y-4">
          <LoadingSkeleton className="h-20 w-full rounded-[28px]" />
          <LoadingSkeleton className="h-72 w-full rounded-[28px]" />
          <LoadingSkeleton className="h-56 w-full rounded-[28px]" />
        </div>
      ) : (
        <GoalsPanel
          goals={goals}
          onCreate={handleCreateGoal}
          onContribute={handleContributeToGoal}
          onDelete={handleDeleteGoal}
        />
      )}
    </DashboardShell>
  );
};

export default Goals;
