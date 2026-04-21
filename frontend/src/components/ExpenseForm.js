import { useEffect, useState } from "react";
import EmptyState from "./EmptyState";

const ExpenseForm = ({ accounts, onSubmit, onImport }) => {
  const [form, setForm] = useState({
    accountId: "",
    type: "expense",
    amount: "",
    category: "",
    description: "",
    transactionDate: new Date().toISOString().slice(0, 10)
  });

  useEffect(() => {
    if (accounts.length > 0 && !form.accountId) {
      setForm((current) => ({ ...current, accountId: accounts[0]._id }));
    }
  }, [accounts, form.accountId]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSubmit({
      ...form,
      amount: Number(form.amount)
    });
    setForm({
      accountId: accounts[0]?._id || "",
      type: "expense",
      amount: "",
      category: "",
      description: "",
      transactionDate: new Date().toISOString().slice(0, 10)
    });
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-950/70">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Add Transaction</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Track income, expenses, and imports in one place.</p>
        </div>
        <label className="cursor-pointer rounded-xl bg-sky-100 px-4 py-2 text-sm font-medium text-sky-700 dark:bg-cyan-950/40 dark:text-cyan-300">
          Import CSV
          <input
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(event) => onImport(event.target.files?.[0], form.accountId)}
          />
        </label>
      </div>

      {!accounts.length ? (
        <EmptyState
          title="Create an account first"
          description="Transactions are linked to accounts now. Add an account before logging income or expenses."
        />
      ) : (
      <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
        <select
          value={form.accountId}
          onChange={(event) => setForm({ ...form, accountId: event.target.value })}
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          required
          disabled={!accounts.length}
        >
          {accounts.length === 0 ? (
            <option value="">Create an account first</option>
          ) : (
            accounts.map((account) => (
              <option key={account._id} value={account._id}>
                {account.accountName} • {account.provider}
              </option>
            ))
          )}
        </select>

        <select
          value={form.type}
          onChange={(event) => setForm({ ...form, type: event.target.value })}
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        >
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>

        <input
          type="number"
          required
          placeholder="Amount"
          value={form.amount}
          onChange={(event) => setForm({ ...form, amount: event.target.value })}
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        />

        <input
          type="text"
          required
          placeholder="Category"
          value={form.category}
          onChange={(event) => setForm({ ...form, category: event.target.value })}
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        />

        <input
          type="date"
          value={form.transactionDate}
          onChange={(event) => setForm({ ...form, transactionDate: event.target.value })}
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        />

        <input
          type="text"
          placeholder="Description"
          value={form.description}
          onChange={(event) => setForm({ ...form, description: event.target.value })}
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900 dark:text-white md:col-span-2"
        />

        <button
          type="submit"
          disabled={!accounts.length}
          className="rounded-xl bg-slate-900 px-4 py-3 font-medium text-white transition hover:bg-slate-700 dark:bg-cyan-600 dark:hover:bg-cyan-500 md:col-span-2"
        >
          Save Transaction
        </button>
      </form>
      )}
    </div>
  );
};

export default ExpenseForm;
