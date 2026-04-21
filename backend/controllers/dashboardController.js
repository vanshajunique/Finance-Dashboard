const Budget = require("../models/Budget");
const asyncHandler = require("../middleware/asyncHandler");
const { getDashboardAnalytics } = require("../services/analyticsService");

const getDashboardData = asyncHandler(async (req, res) => {
  const analytics = await getDashboardAnalytics(req.user._id);
  return res.json(analytics);
});

const setBudget = asyncHandler(async (req, res) => {
  const budget = await Budget.findOneAndUpdate(
    {
      user: req.user._id,
      category: req.body.category.trim(),
      month: Number(req.body.month),
      year: Number(req.body.year)
    },
    {
      user: req.user._id,
      category: req.body.category.trim(),
      month: Number(req.body.month),
      year: Number(req.body.year),
      limit: Number(req.body.limit)
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
      runValidators: true
    }
  );

  return res.status(201).json(budget);
});

module.exports = {
  getDashboardData,
  setBudget
};
