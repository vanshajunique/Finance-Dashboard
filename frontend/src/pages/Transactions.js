import { useEffect, useMemo, useState } from "react";
import DashboardShell from "../components/DashboardShell";
import ExpenseForm from "../components/ExpenseForm";
import LoadingSkeleton from "../components/LoadingSkeleton";
import TransactionList from "../components/TransactionList";
import { useToast } from "../context/ToastContext";
import { accountApi, transactionApi } from "../services/api";

const Transactions = ({ user, onLogout }) => {
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    type: "all"
  });
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const loadTransactionsPage = async () => {
    const [{ data: accountsData }, { data: transactionsData }] = await Promise.all([
      accountApi.getAll(),
      transactionApi.getAll({ limit: 100 })
    ]);

    setAccounts(accountsData);
    setTransactions(transactionsData.transactions || []);
  };

  useEffect(() => {
    loadTransactionsPage()
      .catch((error) => {
        addToast({
          title: "Failed to load transactions",
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
      await loadTransactionsPage();
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
      await loadTransactionsPage();
    } catch (error) {
      addToast({
        title: "Failed to delete transaction",
        description: error.response?.data?.message || "Please try again.",
        tone: "error"
      });
    }
  };

  const handleImport = async (file, accountId) => {
    if (!file || !accountId) {
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
      await loadTransactionsPage();
    } catch (error) {
      const firstIssue = error.response?.data?.errors?.[0];
      addToast({
        title: "CSV import failed",
        description:
          firstIssue?.message || error.response?.data?.message || "Please check the CSV file and try again.",
        tone: "error"
      });
      throw error;
    }
  };

  const filteredTransactions = useMemo(() => {
    const searchTerm = filters.search.trim().toLowerCase();

    return transactions.filter((transaction) => {
      const matchesType = filters.type === "all" || transaction.type === filters.type;
      const searchableText = [
        transaction.description,
        transaction.category,
        transaction.accountId?.accountName
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const matchesSearch = !searchTerm || searchableText.includes(searchTerm);
      return matchesType && matchesSearch;
    });
  }, [filters, transactions]);

  return (
    <DashboardShell user={user} onLogout={onLogout}>
      {loading ? (
        <div className="space-y-6">
          <LoadingSkeleton className="h-72 w-full rounded-[28px]" />
          <LoadingSkeleton className="h-80 w-full rounded-[28px]" />
        </div>
      ) : (
        <div className="space-y-6">
          <ExpenseForm accounts={accounts} onSubmit={handleTransactionSubmit} onImport={handleImport} />

          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-950">
            <div className="grid gap-4 md:grid-cols-[1fr_220px]">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Search
                <input
                  type="text"
                  value={filters.search}
                  onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
                  placeholder="Search by description, category, or account"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-cyan-400 dark:focus:ring-cyan-950/60"
                />
              </label>

              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Filter by type
                <select
                  value={filters.type}
                  onChange={(event) => setFilters((current) => ({ ...current, type: event.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-cyan-400 dark:focus:ring-cyan-950/60"
                >
                  <option value="all">All transactions</option>
                  <option value="income">Income only</option>
                  <option value="expense">Expenses only</option>
                </select>
              </label>
            </div>
          </div>

          <TransactionList transactions={filteredTransactions} onDelete={handleDeleteTransaction} />
        </div>
      )}
    </DashboardShell>
  );
};

export default Transactions;
