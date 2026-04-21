const express = require("express");
const { body } = require("express-validator");
const authMiddleware = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const {
  createGoal,
  getGoals,
  contributeToGoal,
  deleteGoal
} = require("../controllers/goalController");

const router = express.Router();

router.use(authMiddleware);

router
  .route("/")
  .post(
    [
      body("goalName").trim().notEmpty().withMessage("Goal name is required"),
      body("targetAmount").isFloat({ gt: 0 }).withMessage("Target amount must be greater than 0"),
      body("savedAmount")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("Saved amount must be 0 or greater"),
      body("deadline").isISO8601().withMessage("Deadline must be a valid date")
    ],
    validateRequest,
    createGoal
  )
  .get(getGoals);

router.post(
  "/:id/contribute",
  [body("amount").isFloat({ gt: 0 }).withMessage("Contribution amount must be greater than 0")],
  validateRequest,
  contributeToGoal
);
router.delete("/:id", deleteGoal);

module.exports = router;

