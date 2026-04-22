import { useEffect, useState } from "react";
import EmptyState from "./EmptyState";

const fieldClassName =
  "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-cyan-400 dark:focus:ring-cyan-950/60";

const labelClassName = "text-sm font-medium text-slate-700 dark:text-slate-200";

const ExpenseForm = ({ accounts, onSubmit, onImport }) => {
  const [form, setForm] = useState({
    accountId: "",
    type: "expense",
    amount: "",
    category: "",
    description: "",
    transactionDate: new Date().toISOString().slice(0, 10)
  });
  const [importHint, setImportHint] = useState("Upload a bank statement CSV file");
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    if (accounts.length > 0 && !form.accountId) {
      setForm((current) => ({ ...current, accountId: accounts[0]._id }));
    }
  }, [accounts, form.accountId]);

  const resetForm = () => {
    setForm({
      accountId: accounts[0]?._id || "",
      type: "expense",
      amount: "",
      category: "",
      description: "",
      transactionDate: new Date().toISOString().slice(0, 10)
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSubmit({
      ...form,
      amount: Number(form.amount)
    });
    resetForm();
  };

  const handleImportChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.name.toLowerCase().endsWith(".csv")) {
      setImportHint("Please choose a valid .csv file.");
      event.target.value = "";
      return;
    }

    setImportHint(`Selected file: ${file.name}`);
    setIsImporting(true);

    try {
      await onImport(file, form.accountId);
      setImportHint(`Imported: ${file.name}`);
    } catch (_error) {
      setImportHint("Import failed. Please check the CSV file and try again.");
    } finally {
      setIsImporting(false);
      event.target.value = "";
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-950">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Add Transaction</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Record everyday income and expenses in a simple, clear form.
          </p>
        </div>

        <div className="rounded-2xl border border-dashed border-sky-300 bg-sky-50 p-4 dark:border-cyan-800 dark:bg-cyan-950/30">
          <p className="text-sm font-medium text-sky-900 dark:text-cyan-100">Import transactions</p>
          <p className="mt-1 text-sm text-sky-700 dark:text-cyan-200">{importHint}</p>
          <p className="mt-1 text-xs text-sky-600 dark:text-cyan-300">
            Accepted columns: date, amount, description, category, type
          </p>
          <label className="mt-3 inline-flex cursor-pointer items-center justify-center rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700 dark:bg-cyan-500 dark:hover:bg-cyan-400">
            {isImporting ? "Importing..." : "Choose CSV File"}
            <input
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={handleImportChange}
              disabled={!accounts.length || isImporting}
            />
          </label>
        </div>
      </div>

      {!accounts.length ? (
        <EmptyState
          title="Create an account first"
          description="Transactions are linked to accounts. Add one account before logging money activity or importing statements."
        />
      ) : (
        <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
          <label className={labelClassName}>
            Account
            <select
              value={form.accountId}
              onChange={(event) => setForm({ ...form, accountId: event.target.value })}
              className={fieldClassName}
              required
              disabled={!accounts.length}
            >
              {accounts.map((account) => (
                <option key={account._id} value={account._id}>
                  {account.accountName} • {account.provider}
                </option>
              ))}
            </select>
          </label>

          <label className={labelClassName}>
            Type
            <select
              value={form.type}
              onChange={(event) => setForm({ ...form, type: event.target.value })}
              className={fieldClassName}
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </label>

          <label className={labelClassName}>
            Amount
            <input
              type="number"
              required
              min="0"
              step="0.01"
              placeholder="Enter amount in rupees"
              value={form.amount}
              onChange={(event) => setForm({ ...form, amount: event.target.value })}
              className={fieldClassName}
            />
          </label>

          <label className={labelClassName}>
            Category
            <input
              type="text"
              required
              placeholder="Examples: Groceries, Salary, Rent"
              value={form.category}
              onChange={(event) => setForm({ ...form, category: event.target.value })}
              className={fieldClassName}
            />
          </label>

          <label className={labelClassName}>
            Date
            <input
              type="date"
              value={form.transactionDate}
              onChange={(event) => setForm({ ...form, transactionDate: event.target.value })}
              className={fieldClassName}
            />
          </label>

          <label className={`${labelClassName} md:col-span-2`}>
            Description
            <input
              type="text"
              placeholder="Add a short note so you remember this transaction"
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              className={fieldClassName}
            />
          </label>

          <button
            type="submit"
            disabled={!accounts.length}
            className="rounded-2xl bg-sky-600 px-5 py-3.5 font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400 md:col-span-2"
          >
            Save Transaction
          </button>
        </form>
      )}
    </div>
  );
};

export default ExpenseForm;
