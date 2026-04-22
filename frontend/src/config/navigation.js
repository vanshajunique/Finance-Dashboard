export const navigationItems = [
  {
    label: "Dashboard",
    path: "/dashboard",
    eyebrow: "Overview",
    title: "Financial Command Center",
    description: "Monitor your balances, spending, budgets, and overall money health from one overview."
  },
  {
    label: "Accounts",
    path: "/accounts",
    eyebrow: "Accounts",
    title: "Account Management",
    description: "Add, review, and maintain the accounts you use to track your money."
  },
  {
    label: "Transactions",
    path: "/transactions",
    eyebrow: "Transactions",
    title: "Transaction Management",
    description: "Record, search, and review your income and expenses in one place."
  },
  {
    label: "Budgets",
    path: "/budgets",
    eyebrow: "Budgets",
    title: "Budget Planning",
    description: "Create category limits and watch how much of each budget you have used."
  },
  {
    label: "Analytics",
    path: "/analytics",
    eyebrow: "Analytics",
    title: "Money Insights",
    description: "Explore category trends, cashflow patterns, and account distribution charts."
  },
  {
    label: "Goals",
    path: "/goals",
    eyebrow: "Goals",
    title: "Financial Goals",
    description: "Plan savings goals and track progress toward your major financial milestones."
  },
  {
    label: "Settings",
    path: "/settings",
    eyebrow: "Settings",
    title: "Personal Preferences",
    description: "Adjust theme preferences and review your profile and app settings."
  }
];

export const getCurrentPageMeta = (pathname) =>
  navigationItems.find((item) => pathname === item.path || pathname.startsWith(`${item.path}/`)) ||
  navigationItems[0];
