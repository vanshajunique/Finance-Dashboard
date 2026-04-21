const crypto = require("crypto");

const normalizeDescription = (value = "") => value.trim().toLowerCase();

const normalizeDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString().slice(0, 10);
};

const createTransactionFingerprint = ({ transactionDate, amount, description = "" }) => {
  const normalizedDate = normalizeDate(transactionDate);

  if (!normalizedDate || Number.isNaN(Number(amount))) {
    return null;
  }

  return crypto
    .createHash("sha256")
    .update(`${normalizedDate}|${Number(amount).toFixed(2)}|${normalizeDescription(description)}`)
    .digest("hex");
};

module.exports = {
  createTransactionFingerprint
};

