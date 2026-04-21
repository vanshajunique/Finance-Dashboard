const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const multer = require("multer");
const Transaction = require("../models/Transaction");
const Budget = require("../models/Budget");
const Account = require("../models/Account");
const asyncHandler = require("../middleware/asyncHandler");
const { createTransactionFingerprint } = require("../utils/transactionFingerprint");

const uploadsPath = path.join(__dirname, "..", "uploads");

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsPath),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

const upload = multer({ storage });

const calculateBudgetUsage = async (userId, category, date) => {
  const currentDate = new Date(date);
  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();

  const [budget, transactionSummary] = await Promise.all([
    Budget.findOne({ user: userId, category, month, year }),
    Transaction.aggregate([
      {
        $match: {
          user: userId,
          category,
          type: "expense",
          transactionDate: {
            $gte: new Date(year, month - 1, 1),
            $lt: new Date(year, month, 1)
          }
        }
      },
      {
        $group: {
          _id: null,
          totalSpent: { $sum: "$amount" }
        }
      }
    ])
  ]);

  if (!budget) {
    return null;
  }

  const spent = transactionSummary[0]?.totalSpent || 0;
  const percentage = budget.limit > 0 ? Math.round((spent / budget.limit) * 100) : 0;

  return {
    category: budget.category,
    limit: budget.limit,
    spent,
    percentage,
    exceeded: spent > budget.limit
  };
};

const getSignedAmount = (type, amount) => (type === "income" ? Number(amount) : -Number(amount));

const updateAccountBalance = async (userId, accountId, delta) => {
  const account = await Account.findOneAndUpdate(
    { _id: accountId, userId },
    { $inc: { balance: delta } },
    { new: true }
  );

  if (!account) {
    const error = new Error("Linked account not found");
    error.statusCode = 404;
    throw error;
  }

  return account;
};

const getTransactions = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
  const skip = (page - 1) * limit;

  const [transactions, total] = await Promise.all([
    Transaction.find({ user: req.user._id })
      .populate("accountId", "accountName accountType provider balance")
      .sort({ transactionDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Transaction.countDocuments({ user: req.user._id })
  ]);

  return res.json({
    transactions,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1
    }
  });
});

const addTransaction = asyncHandler(async (req, res) => {
  const transactionDate = req.body.transactionDate || new Date();
  const description = req.body.description?.trim() || "";
  const signedAmount = getSignedAmount(req.body.type, req.body.amount);

  await updateAccountBalance(req.user._id, req.body.accountId, signedAmount);

  let transaction;

  try {
    transaction = await Transaction.create({
      user: req.user._id,
      accountId: req.body.accountId,
      type: req.body.type,
      amount: Number(req.body.amount),
      category: req.body.category.trim(),
      description,
      transactionDate,
      fingerprint: createTransactionFingerprint({
        transactionDate,
        amount: req.body.amount,
        description
      }),
      source: "manual"
    });
  } catch (error) {
    await updateAccountBalance(req.user._id, req.body.accountId, -signedAmount);
    throw error;
  }

  const budgetAlert =
    transaction.type === "expense"
      ? await calculateBudgetUsage(req.user._id, transaction.category, transaction.transactionDate)
      : null;

  const populatedTransaction = await Transaction.findById(transaction._id).populate(
    "accountId",
    "accountName accountType provider balance"
  );

  return res.status(201).json({
    transaction: populatedTransaction,
    budgetAlert
  });
});

const deleteTransaction = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id
  });

  if (!transaction) {
    const error = new Error("Transaction not found");
    error.statusCode = 404;
    throw error;
  }

  await updateAccountBalance(
    req.user._id,
    transaction.accountId,
    getSignedAmount(transaction.type, transaction.amount) * -1
  );

  return res.json({ message: "Transaction deleted successfully" });
});

const importCsvTransactions = asyncHandler(async (req, res) => {
  const parsedRows = [];
  const rowErrors = [];

  await new Promise((resolve, reject) => {
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on("data", (row) => {
        parsedRows.push(row);
      })
      .on("end", resolve)
      .on("error", reject);
  });

  const preparedTransactions = parsedRows.map((row, index) => {
    const rawDate = row.date || row.Date;
    const transactionDate = rawDate ? new Date(rawDate) : new Date();
    const amount = Number(row.amount || row.Amount);
    const description = (row.description || row.Description || "Imported transaction").trim();
    const category = (row.category || row.Category || "Uncategorized").trim();
    const normalizedType = String(row.type || row.Type || "expense").toLowerCase();

    if (rawDate && Number.isNaN(transactionDate.getTime())) {
      rowErrors.push({ row: index + 2, message: "Invalid transaction date" });
    }

    if (!Number.isFinite(amount) || amount < 0) {
      rowErrors.push({ row: index + 2, message: "Invalid transaction amount" });
    }

    if (!["income", "expense"].includes(normalizedType)) {
      rowErrors.push({ row: index + 2, message: "Transaction type must be income or expense" });
    }

    if (!category) {
      rowErrors.push({ row: index + 2, message: "Category is required" });
    }

    return {
      user: req.user._id,
      accountId: req.body.accountId,
      type: normalizedType === "income" ? "income" : "expense",
      amount,
      category,
      description,
      transactionDate,
      fingerprint: createTransactionFingerprint({
        transactionDate,
        amount,
        description
      }),
      source: "csv"
    };
  });

  if (parsedRows.length === 0) {
    const error = new Error("CSV file is empty");
    error.statusCode = 400;
    throw error;
  }

  if (rowErrors.length > 0) {
    const error = new Error("CSV validation failed");
    error.statusCode = 400;
    error.errors = rowErrors;
    throw error;
  }

  const fingerprints = preparedTransactions.map((transaction) => transaction.fingerprint);
  const duplicateFingerprintSet = new Set();
  const seenFingerprints = new Set();

  for (const fingerprint of fingerprints) {
    if (seenFingerprints.has(fingerprint)) {
      duplicateFingerprintSet.add(fingerprint);
    }
    seenFingerprints.add(fingerprint);
  }

  if (duplicateFingerprintSet.size > 0) {
    const error = new Error("CSV contains duplicate transactions");
    error.statusCode = 400;
    error.errors = Array.from(duplicateFingerprintSet).map((fingerprint) => ({
      fingerprint,
      message: "Duplicate transaction detected inside CSV"
    }));
    throw error;
  }

  const existingTransactions = await Transaction.find({
    user: req.user._id,
    fingerprint: { $in: fingerprints }
  }).select("fingerprint");

  const existingFingerprintSet = new Set(
    existingTransactions.map((transaction) => transaction.fingerprint)
  );

  const uniqueTransactions = preparedTransactions.filter(
    (transaction) => !existingFingerprintSet.has(transaction.fingerprint)
  );

  if (uniqueTransactions.length === 0) {
    const error = new Error("All CSV transactions already exist");
    error.statusCode = 409;
    throw error;
  }

  const balanceAdjustments = uniqueTransactions.reduce((acc, transaction) => {
    const key = String(transaction.accountId);
    acc[key] = (acc[key] || 0) + getSignedAmount(transaction.type, transaction.amount);
    return acc;
  }, {});

  await Promise.all(
    Object.entries(balanceAdjustments).map(([accountId, delta]) =>
      updateAccountBalance(req.user._id, accountId, delta)
    )
  );

  try {
    await Transaction.insertMany(uniqueTransactions, { ordered: true });
  } catch (error) {
    await Promise.all(
      Object.entries(balanceAdjustments).map(([accountId, delta]) =>
        updateAccountBalance(req.user._id, accountId, -delta)
      )
    );
    throw error;
  }

  return res.status(201).json({
    message: "CSV imported successfully",
    count: uniqueTransactions.length,
    skippedDuplicates: preparedTransactions.length - uniqueTransactions.length
  });
});

const cleanupUploadedFile = (req, res, next) => {
  if (!req.file?.path) {
    return next();
  }

  res.on("finish", () => {
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
  });

  return next();
};

const paginationValidation = (req, _res, next) => {
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 20);

  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 100) {
    const error = new Error("Pagination values must be integers. limit must be between 1 and 100");
    error.statusCode = 400;
    return next(error);
  }

  return next();
};

module.exports = {
  upload,
  cleanupUploadedFile,
  paginationValidation,
  getTransactions,
  addTransaction,
  deleteTransaction,
  importCsvTransactions
};
