const Goal = require("../models/Goal");
const asyncHandler = require("../middleware/asyncHandler");

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

const createGoal = asyncHandler(async (req, res) => {
  const goal = await Goal.create({
    goalName: req.body.goalName.trim(),
    targetAmount: Number(req.body.targetAmount),
    savedAmount: Number(req.body.savedAmount || 0),
    deadline: req.body.deadline,
    userId: req.user._id
  });

  return res.status(201).json(calculateGoalMetrics(goal));
});

const getGoals = asyncHandler(async (req, res) => {
  const goals = await Goal.find({ userId: req.user._id }).sort({ deadline: 1, createdAt: -1 });
  return res.json(goals.map(calculateGoalMetrics));
});

const contributeToGoal = asyncHandler(async (req, res) => {
  const goal = await Goal.findOne({ _id: req.params.id, userId: req.user._id });

  if (!goal) {
    const error = new Error("Goal not found");
    error.statusCode = 404;
    throw error;
  }

  goal.savedAmount += Number(req.body.amount);
  await goal.save();

  return res.json(calculateGoalMetrics(goal));
});

const deleteGoal = asyncHandler(async (req, res) => {
  const goal = await Goal.findOneAndDelete({ _id: req.params.id, userId: req.user._id });

  if (!goal) {
    const error = new Error("Goal not found");
    error.statusCode = 404;
    throw error;
  }

  return res.json({ message: "Goal deleted successfully" });
});

module.exports = {
  createGoal,
  getGoals,
  contributeToGoal,
  deleteGoal
};

