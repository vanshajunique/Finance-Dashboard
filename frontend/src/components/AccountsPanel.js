import { useState } from "react";
import EmptyState from "./EmptyState";

const accountTypes = ["Savings Account", "Salary Account", "Digital Wallet", "Cash"];

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
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-950/70">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Linked Accounts</h3>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Track balances across bank accounts, wallets, and cash.</p>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <input
          type="text"
          required
          placeholder="Account name"
          value={form.accountName}
          onChange={(event) => setForm({ ...form, accountName: event.target.value })}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        />
        <select
          value={form.accountType}
          onChange={(event) => setForm({ ...form, accountType: event.target.value })}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        >
          {accountTypes.map((accountType) => (
            <option key={accountType} value={accountType}>
              {accountType}
            </option>
          ))}
        </select>
        <input
          type="text"
          required
          placeholder="Provider"
          value={form.provider}
          onChange={(event) => setForm({ ...form, provider: event.target.value })}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        />
        <input
          type="number"
          required
          placeholder="Opening balance"
          value={form.balance}
          onChange={(event) => setForm({ ...form, balance: event.target.value })}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        />
        <button className="w-full rounded-xl bg-slate-900 px-4 py-3 font-medium text-white hover:bg-slate-700 dark:bg-cyan-600 dark:hover:bg-cyan-500">
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
              className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/60"
            >
              <div>
                <p className="font-medium text-slate-900 dark:text-white">{account.accountName}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {account.accountType} • {account.provider}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-slate-900 dark:text-white">${account.balance.toFixed(2)}</span>
                <button
                  onClick={() => onDelete(account._id)}
                  className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300"
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
