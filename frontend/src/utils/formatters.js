export const inrCurrencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0
});

export const compactInrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  notation: "compact",
  maximumFractionDigits: 1
});

export const formatCurrency = (value) => inrCurrencyFormatter.format(Number(value) || 0);

export const formatCompactCurrency = (value) => compactInrFormatter.format(Number(value) || 0);

export const formatSignedCurrency = (value) => {
  const numericValue = Number(value) || 0;
  const prefix = numericValue > 0 ? "+" : numericValue < 0 ? "-" : "";
  return `${prefix}${formatCurrency(Math.abs(numericValue))}`;
};

export const formatPercent = (value, digits = 1) => `${(Number(value) || 0).toFixed(digits)}%`;

export const formatDate = (value) => new Date(value).toLocaleDateString("en-IN");
