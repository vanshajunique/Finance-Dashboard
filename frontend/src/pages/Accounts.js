import { useEffect, useState } from "react";
import AccountsPanel from "../components/AccountsPanel";
import DashboardShell from "../components/DashboardShell";
import LoadingSkeleton from "../components/LoadingSkeleton";
import { useToast } from "../context/ToastContext";
import { accountApi } from "../services/api";

const Accounts = ({ user, onLogout }) => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const loadAccounts = async () => {
    const { data } = await accountApi.getAll();
    setAccounts(data);
  };

  useEffect(() => {
    loadAccounts()
      .catch((error) => {
        addToast({
          title: "Failed to load accounts",
          description: error.response?.data?.message || "Please try again.",
          tone: "error"
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const handleCreateAccount = async (payload) => {
    try {
      await accountApi.create(payload);
      addToast({
        title: "Account linked",
        description: "Account linked successfully.",
        tone: "success"
      });
      await loadAccounts();
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
      await loadAccounts();
    } catch (error) {
      addToast({
        title: "Failed to delete account",
        description: error.response?.data?.message || "Please try again.",
        tone: "error"
      });
    }
  };

  return (
    <DashboardShell user={user} onLogout={onLogout}>
      {loading ? (
        <LoadingSkeleton className="h-[32rem] w-full rounded-[28px]" />
      ) : (
        <AccountsPanel accounts={accounts} onCreate={handleCreateAccount} onDelete={handleDeleteAccount} />
      )}
    </DashboardShell>
  );
};

export default Accounts;
