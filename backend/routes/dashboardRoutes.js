const express = require("express");
const { body } = require("express-validator");
const authMiddleware = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const { getDashboardData, setBudget } = require("../controllers/dashboardController");

const router = express.Router();

router.use(authMiddleware);
router.get("/", getDashboardData);
router.post(
  "/budget",
  [
    body("category").trim().notEmpty().withMessage("Category is required"),
    body("month").isInt({ min: 1, max: 12 }).withMessage("Month must be between 1 and 12"),
    body("year").isInt({ min: 2000, max: 3000 }).withMessage("Year must be valid"),
    body("limit").isFloat({ gt: 0 }).withMessage("Budget limit must be greater than 0")
  ],
  validateRequest,
  setBudget
);

module.exports = router;
