import EmptyState from "./EmptyState";

const TransactionList = ({ transactions, onDelete }) => {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-950/70">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Transactions</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">Your latest income and expense activity.</p>
      </div>

      <div className="space-y-4">
        {transactions.length === 0 ? (
          <EmptyState
            title="No transactions yet"
            description="Your latest income and expenses will appear here once you start tracking them."
          />
        ) : (
          transactions.map((transaction) => (
            <div
              key={transaction._id}
              className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/60"
            >
              <div>
                <p className="font-medium text-slate-900 dark:text-white">
                  {transaction.description || transaction.category}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {transaction.category}
                  {transaction.accountId?.accountName ? ` • ${transaction.accountId.accountName}` : ""}
                  {" • "}
                  {new Date(transaction.transactionDate).toLocaleDateString()}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <span
                  className={`font-semibold ${
                    transaction.type === "income" ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {transaction.type === "income" ? "+" : "-"}${transaction.amount.toFixed(2)}
                </span>
                <button
                  onClick={() => onDelete(transaction._id)}
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

export default TransactionList;
