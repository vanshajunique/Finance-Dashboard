const Account = require("../models/Account");
const Budget = require("../models/Budget");
const Goal = require("../models/Goal");
const Transaction = require("../models/Transaction");

const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0
});

const formatCurrency = (value) => currencyFormatter.format(Number(value) || 0);

const getMonthBounds = (date = new Date()) => {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 1);

  return {
    start,
    end,
    month: date.getMonth() + 1,
    year: date.getFullYear()
  };
};

const buildInsights = ({ categoryBreakdown, monthlyExpenses, budgets, totals }) => {
  const topCategory = categoryBreakdown[0];
  const currentMonthExpenses = monthlyExpenses[0]?.total || 0;
  const previousMonthExpenses = monthlyExpenses[1]?.total || 0;
  const expenseDelta = currentMonthExpenses - previousMonthExpenses;
  const overBudget = budgets.filter((item) => item.exceeded);
  const savingsAmount = (totals.monthlyIncome || 0) - (totals.monthlyExpenses || 0);
  const forecast = (totals.balance || 0) + savingsAmount;

  return {
    topSpendingCategory: {
      title: "Top Spending Category",
      icon: "wallet",
      message: topCategory
        ? `${topCategory._id} is your highest spend category at ${formatCurrency(topCategory.total)} this month.`
        : "No expense data available yet."
    },
    spendingChange: {
      title: "Monthly Spending Change",
      icon: expenseDelta >= 0 ? "trend-up" : "trend-down",
      message:
        monthlyExpenses.length < 2
          ? "Not enough monthly history yet to compare spending trends."
          : expenseDelta >= 0
            ? `Spending is up by ${formatCurrency(expenseDelta)} compared to last month.`
            : `Spending is down by ${formatCurrency(Math.abs(expenseDelta))} compared to last month.`
    },
    budgetWarnings: {
      title: "Budget Warnings",
      icon: overBudget.length > 0 ? "alert" : "shield",
      message:
        overBudget.length > 0
          ? overBudget.map((item) => `${item.category} exceeded budget by ${formatCurrency(item.spent - item.limit)}.`)
          : ["All tracked categories are currently within budget."]
    },
    savingsSuggestions: {
      title: "Savings Suggestions",
      icon: "spark",
      message:
        topCategory && savingsAmount < totals.monthlyIncome * 0.2
          ? [
              `Trim recurring costs in ${topCategory._id} to improve savings rate.`,
              "Move part of each income deposit directly into savings to protect monthly surplus."
            ]
          : ["Your savings behavior looks steady. Keep directing surplus toward your priority accounts."]
    },
    cashflowForecast: {
      title: "Cashflow Forecast",
      icon: forecast >= 0 ? "forecast-up" : "forecast-down",
      message: `If current income and expense patterns continue, projected next-month balance is ${formatCurrency(forecast)}.`
    }
  };
};

const calculateFinancialHealthScore = ({ totals, budgets }) => {
  const savingsRate =
    totals.monthlyIncome > 0
      ? ((totals.monthlyIncome - totals.monthlyExpenses) / totals.monthlyIncome) * 100
      : 0;
  const expenseRatio =
    totals.monthlyIncome > 0 ? (totals.monthlyExpenses / totals.monthlyIncome) * 100 : 100;
  const avgBudgetUsage =
    budgets.length > 0
      ? budgets.reduce((sum, budget) => sum + Math.min(budget.percentage, 100), 0) / budgets.length
      : 0;

  const score = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        Math.max(0, savingsRate) * 0.45 +
          Math.max(0, 100 - expenseRatio) * 0.35 +
          Math.max(0, 100 - avgBudgetUsage) * 0.2
      )
    )
  );

  return {
    score,
    savingsRate,
    expenseRatio,
    budgetUsage: avgBudgetUsage
  };
};

const calculateGoalMetrics = (goal) => {
  const deadline = new Date(goal.deadline);
  const today = new Date();
  const remainingAmount = Math.max(goal.targetAmount - goal.savedAmount, 0);
  const progress = goal.targetAmount > 0 ? Math.min((goal.savedAmount / goal.targetAmount) * 100, 100) : 0;
  const monthsRemaining = Math.max(
    1,
    Math.ceil(
      (deadline.getFullYear() - today.getFullYear()) * 12 +
        (deadline.getMonth() - today.getMonth()) +
        (deadline.getDate() >= today.getDate() ? 0 : -1)
    )
  );

  return {
    ...goal.toObject(),
    progress,
    remainingAmount,
    monthlySavingsNeeded: remainingAmount > 0 ? remainingAmount / monthsRemaining : 0,
    isCompleted: remainingAmount <= 0,
    isOverdue: remainingAmount > 0 && deadline < today
  };
};

const getDashboardAnalytics = async (userId, date = new Date()) => {
  const { start, end, month, year } = getMonthBounds(date);

  const [
    totalsResult,
    accounts,
    categoryBreakdown,
    monthlyTrend,
    incomeExpenseComparison,
    weekdayHeatmap,
    recentTransactions,
    budgetUsage,
    goals
  ] =
    await Promise.all([
      Transaction.aggregate([
        { $match: { user: userId } },
        {
          $group: {
            _id: null,
            balance: {
              $sum: {
                $cond: [{ $eq: ["$type", "income"] }, "$amount", { $multiply: ["$amount", -1] }]
              }
            },
            monthlyIncome: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $eq: ["$type", "income"] },
                      { $gte: ["$transactionDate", start] },
                      { $lt: ["$transactionDate", end] }
                    ]
                  },
                  "$amount",
                  0
                ]
              }
            },
            monthlyExpenses: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $eq: ["$type", "expense"] },
                      { $gte: ["$transactionDate", start] },
                      { $lt: ["$transactionDate", end] }
                    ]
                  },
                  "$amount",
                  0
                ]
              }
            }
          }
        }
      ]),
      Account.aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: null,
            netWorth: { $sum: "$balance" },
            accounts: {
              $push: {
                _id: "$_id",
                accountName: "$accountName",
                accountType: "$accountType",
                provider: "$provider",
                balance: "$balance",
                createdAt: "$createdAt"
              }
            }
          }
        }
      ]),
      Transaction.aggregate([
        {
          $match: {
            user: userId,
            type: "expense",
            transactionDate: { $gte: start, $lt: end }
          }
        },
        {
          $group: {
            _id: "$category",
            total: { $sum: "$amount" }
          }
        },
        { $sort: { total: -1 } }
      ]),
      Transaction.aggregate([
        {
          $match: {
            user: userId,
            type: "expense"
          }
        },
        {
          $group: {
            _id: {
              year: { $year: "$transactionDate" },
              month: { $month: "$transactionDate" }
            },
            total: { $sum: "$amount" }
          }
        },
        { $sort: { "_id.year": -1, "_id.month": -1 } },
        { $limit: 6 }
      ]),
      Transaction.aggregate([
        {
          $match: {
            user: userId
          }
        },
        {
          $group: {
            _id: {
              year: { $year: "$transactionDate" },
              month: { $month: "$transactionDate" }
            },
            income: {
              $sum: {
                $cond: [{ $eq: ["$type", "income"] }, "$amount", 0]
              }
            },
            expense: {
              $sum: {
                $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0]
              }
            }
          }
        },
        { $sort: { "_id.year": -1, "_id.month": -1 } },
        { $limit: 6 }
      ]),
      Transaction.aggregate([
        {
          $match: {
            user: userId,
            type: "expense"
          }
        },
        {
          $group: {
            _id: { $dayOfWeek: "$transactionDate" },
            total: { $sum: "$amount" },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      Transaction.find({ user: userId })
        .populate("accountId", "accountName accountType provider balance")
        .sort({ transactionDate: -1, createdAt: -1 })
        .limit(5),
      Budget.aggregate([
        {
          $match: {
            user: userId,
            month,
            year
          }
        },
        {
          $lookup: {
            from: "transactions",
            let: {
              budgetUser: "$user",
              budgetCategory: "$category",
              monthStart: start,
              monthEnd: end
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$user", "$$budgetUser"] },
                      { $eq: ["$category", "$$budgetCategory"] },
                      { $eq: ["$type", "expense"] },
                      { $gte: ["$transactionDate", "$$monthStart"] },
                      { $lt: ["$transactionDate", "$$monthEnd"] }
                    ]
                  }
                }
              },
              {
                $group: {
                  _id: null,
                  spent: { $sum: "$amount" }
                }
              }
            ],
            as: "usage"
          }
        },
        {
          $project: {
            id: "$_id",
            category: 1,
            limit: 1,
            spent: { $ifNull: [{ $arrayElemAt: ["$usage.spent", 0] }, 0] }
          }
        },
        {
          $addFields: {
            percentage: {
              $cond: [
                { $gt: ["$limit", 0] },
                { $round: [{ $multiply: [{ $divide: ["$spent", "$limit"] }, 100] }, 0] },
                0
              ]
            },
            exceeded: { $gt: ["$spent", "$limit"] }
          }
        },
        { $sort: { category: 1 } }
      ]),
      Goal.find({ userId }).sort({ deadline: 1, createdAt: -1 })
    ]);

  const accountSummary = accounts[0] || { netWorth: 0, accounts: [] };

  const normalizedTrend = monthlyTrend
    .map((item) => ({
      label: `${String(item._id.month).padStart(2, "0")}/${item._id.year}`,
      total: item.total
    }))
    .reverse();
  const normalizedIncomeExpense = incomeExpenseComparison
    .map((item) => ({
      label: `${String(item._id.month).padStart(2, "0")}/${item._id.year}`,
      income: item.income,
      expense: item.expense
    }))
    .reverse();
  const normalizedWeekdayHeatmap = weekdayLabels.map((label, index) => {
    const match = weekdayHeatmap.find((item) => item._id === index + 1);
    return {
      day: label,
      total: match?.total || 0,
      count: match?.count || 0
    };
  });
  const totals = {
    balance: totalsResult[0]?.balance || 0,
    netWorth: accountSummary.netWorth || 0,
    monthlyIncome: totalsResult[0]?.monthlyIncome || 0,
    monthlyExpenses: totalsResult[0]?.monthlyExpenses || 0
  };
  const financialHealth = calculateFinancialHealthScore({
    totals,
    budgets: budgetUsage
  });
  const insights = buildInsights({
    categoryBreakdown,
    monthlyExpenses: monthlyTrend,
    budgets: budgetUsage,
    totals
  });

  return {
    totals,
    accounts: accountSummary.accounts.sort(
      (first, second) => new Date(second.createdAt) - new Date(first.createdAt)
    ),
    categoryBreakdown,
    monthlyTrend: normalizedTrend,
    incomeExpenseComparison: normalizedIncomeExpense,
    weekdayHeatmap: normalizedWeekdayHeatmap,
    accountBalanceDistribution: accountSummary.accounts
      .map((account) => ({
        label: account.accountName,
        value: account.balance
      }))
      .sort((first, second) => second.value - first.value),
    financialHealth,
    goals: goals.map(calculateGoalMetrics),
    recentTransactions,
    budgets: budgetUsage,
    insights
  };
};

module.exports = {
  getDashboardAnalytics,
  getMonthBounds
};
