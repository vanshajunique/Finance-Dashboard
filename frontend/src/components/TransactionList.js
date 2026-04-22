import EmptyState from "./EmptyState";
import { formatDate, formatSignedCurrency } from "../utils/formatters";

const TransactionList = ({ transactions, onDelete }) => {
  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-950">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Transactions</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">Your latest money activity appears here.</p>
      </div>

      <div className="space-y-3">
        {transactions.length === 0 ? (
          <EmptyState
            title="No transactions yet"
            description="No transactions yet. Add your first transaction to begin tracking."
          />
        ) : (
          transactions.map((transaction) => (
            <div
              key={transaction._id}
              className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 md:flex-row md:items-center md:justify-between dark:border-slate-800 dark:bg-slate-900/80"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-slate-900 dark:text-white">
                  {transaction.description || transaction.category}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {transaction.category}
                  {transaction.accountId?.accountName ? ` • ${transaction.accountId.accountName}` : ""}
                  {" • "}
                  {formatDate(transaction.transactionDate)}
                </p>
              </div>

              <div className="flex items-center justify-between gap-4 md:justify-end">
                <span
                  className={`font-semibold ${
                    transaction.type === "income" ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {formatSignedCurrency(
                    transaction.type === "income" ? transaction.amount : -transaction.amount
                  )}
                </span>
                <button
                  onClick={() => onDelete(transaction._id)}
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

export default TransactionList;
