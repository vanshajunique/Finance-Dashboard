const express = require("express");
const { body } = require("express-validator");
const authMiddleware = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const {
  upload,
  cleanupUploadedFile,
  paginationValidation,
  getTransactions,
  addTransaction,
  deleteTransaction,
  importCsvTransactions
} = require("../controllers/transactionController");

const router = express.Router();

router.use(authMiddleware);
router.get("/", paginationValidation, getTransactions);
router.post(
  "/",
  [
    body("accountId").isMongoId().withMessage("A valid account is required"),
    body("type").isIn(["income", "expense"]).withMessage("Transaction type must be income or expense"),
    body("amount").isFloat({ min: 0 }).withMessage("Amount must be a non-negative number"),
    body("category").trim().notEmpty().withMessage("Category is required"),
    body("description").optional().isString().withMessage("Description must be a string"),
    body("transactionDate")
      .optional()
      .isISO8601()
      .withMessage("Transaction date must be a valid ISO date")
  ],
  validateRequest,
  addTransaction
);
router.delete("/:id", deleteTransaction);
router.post(
  "/import/csv",
  upload.single("file"),
  cleanupUploadedFile,
  [
    body("accountId").isMongoId().withMessage("A valid account is required"),
    body("_csvUpload").custom((_value, { req }) => {
      if (!req.file) {
        throw new Error("CSV file is required");
      }

      const isCsvMimeType =
        req.file.mimetype === "text/csv" ||
        req.file.mimetype === "application/vnd.ms-excel" ||
        req.file.originalname.toLowerCase().endsWith(".csv");

      if (!isCsvMimeType) {
        throw new Error("Only CSV files are allowed");
      }

      return true;
    })
  ],
  validateRequest,
  importCsvTransactions
);

module.exports = router;
