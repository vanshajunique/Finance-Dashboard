const Account = require("../models/Account");
const Transaction = require("../models/Transaction");
const asyncHandler = require("../middleware/asyncHandler");

const createAccount = asyncHandler(async (req, res) => {
  const account = await Account.create({
    accountName: req.body.accountName.trim(),
    accountType: req.body.accountType,
    provider: req.body.provider.trim(),
    balance: Number(req.body.balance),
    userId: req.user._id
  });

  return res.status(201).json(account);
});

const getAccounts = asyncHandler(async (req, res) => {
  const accounts = await Account.find({ userId: req.user._id }).sort({ createdAt: -1 });
  return res.json(accounts);
});

const deleteAccount = asyncHandler(async (req, res) => {
  const account = await Account.findOne({ _id: req.params.id, userId: req.user._id });

  if (!account) {
    const error = new Error("Account not found");
    error.statusCode = 404;
    throw error;
  }

  const linkedTransactions = await Transaction.countDocuments({
    user: req.user._id,
    accountId: account._id
  });

  if (linkedTransactions > 0) {
    const error = new Error("Cannot delete an account with linked transactions");
    error.statusCode = 400;
    throw error;
  }

  await account.deleteOne();

  return res.json({ message: "Account deleted successfully" });
});

module.exports = {
  createAccount,
  getAccounts,
  deleteAccount
};

