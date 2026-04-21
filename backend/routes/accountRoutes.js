const express = require("express");
const { body } = require("express-validator");
const authMiddleware = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const {
  createAccount,
  getAccounts,
  deleteAccount
} = require("../controllers/accountController");

const router = express.Router();

router.use(authMiddleware);

router
  .route("/")
  .post(
    [
      body("accountName").trim().notEmpty().withMessage("Account name is required"),
      body("accountType")
        .isIn(["Savings Account", "Salary Account", "Digital Wallet", "Cash"])
        .withMessage("Account type is invalid"),
      body("provider").trim().notEmpty().withMessage("Provider is required"),
      body("balance").isFloat().withMessage("Balance must be a valid number")
    ],
    validateRequest,
    createAccount
  )
  .get(getAccounts);

router.delete("/:id", deleteAccount);

module.exports = router;
