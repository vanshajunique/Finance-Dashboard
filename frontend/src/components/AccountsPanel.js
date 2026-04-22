import { useState } from "react";
import EmptyState from "./EmptyState";
import { formatCurrency } from "../utils/formatters";

const accountTypes = ["Savings Account", "Salary Account", "Digital Wallet", "Cash"];

const fieldClassName =
  "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-cyan-400 dark:focus:ring-cyan-950/60";

const labelClassName = "text-sm font-medium text-slate-700 dark:text-slate-200";

const AccountsPanel = ({ accounts, onCreate, onDelete }) => {
  const [form, setForm] = useState({
    accountName: "",
    accountType: accountTypes[0],
    provider: "",
    balance: ""
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onCreate({
      ...form,
      balance: Number(form.balance)
    });
    setForm({
      accountName: "",
      accountType: accountTypes[0],
      provider: "",
      balance: ""
    });
  };

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-950">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Linked Accounts</h3>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Keep your bank balances, wallet money, and cash in one place.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 grid gap-5">
        <label className={labelClassName}>
          Account name
          <input
            type="text"
            required
            placeholder="Example: HDFC Savings"
            value={form.accountName}
            onChange={(event) => setForm({ ...form, accountName: event.target.value })}
            className={fieldClassName}
          />
        </label>

        <label className={labelClassName}>
          Account type
          <select
            value={form.accountType}
            onChange={(event) => setForm({ ...form, accountType: event.target.value })}
            className={fieldClassName}
          >
            {accountTypes.map((accountType) => (
              <option key={accountType} value={accountType}>
                {accountType}
              </option>
            ))}
          </select>
        </label>

        <label className={labelClassName}>
          Provider
          <input
            type="text"
            required
            placeholder="Example: HDFC Bank or Paytm"
            value={form.provider}
            onChange={(event) => setForm({ ...form, provider: event.target.value })}
            className={fieldClassName}
          />
        </label>

        <label className={labelClassName}>
          Opening balance
          <input
            type="number"
            required
            min="0"
            step="0.01"
            placeholder="Enter current balance in rupees"
            value={form.balance}
            onChange={(event) => setForm({ ...form, balance: event.target.value })}
            className={fieldClassName}
          />
        </label>

        <button className="w-full rounded-2xl bg-sky-600 px-4 py-3.5 font-semibold text-white transition hover:bg-sky-700 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400">
          Add Account
        </button>
      </form>

      <div className="mt-6 space-y-3">
        {accounts.length === 0 ? (
          <EmptyState
            title="No linked accounts"
            description="Create a savings, salary, wallet, or cash account to start organizing your money."
          />
        ) : (
          accounts.map((account) => (
            <div
              key={account._id}
              className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/80"
            >
              <div>
                <p className="font-medium text-slate-900 dark:text-white">{account.accountName}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {account.accountType} • {account.provider}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-slate-900 dark:text-white">
                  {formatCurrency(account.balance)}
                </span>
                <button
                  onClick={() => onDelete(account._id)}
                  className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AccountsPanel;
