const { validationResult, body } = require("express-validator");
const { errorResponse } = require("../utils/apiResponse");
const Transaction = require("../models/transaction.model");


const CATEGORIES = Transaction.CATEGORIES;


// ─────────────────────────────────────────────
// ✅ HANDLE VALIDATION ERRORS
// ─────────────────────────────────────────────
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));

    return errorResponse(res, 400, "Validation failed", formattedErrors);
  }

  next();
};


// ─────────────────────────────────────────────
// ✅ AUTH VALIDATORS
// ─────────────────────────────────────────────
const registerValidator = [
  body("name")
    .trim()
    .notEmpty().withMessage("Name is required")
    .isLength({ min: 2, max: 50 }).withMessage("Name must be 2–50 characters"),

  body("email")
    .isEmail().withMessage("Please provide a valid email")
    .normalizeEmail(),

  body("password")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),

  body("referralCode")
    .optional()
    .isString().withMessage("Referral code must be a string")
    .trim(),

  handleValidationErrors,
];


const loginValidator = [
  body("email")
    .isEmail().withMessage("Please provide a valid email")
    .normalizeEmail(),

  body("password")
    .notEmpty().withMessage("Password is required"),

  handleValidationErrors,
];


// ─────────────────────────────────────────────
// ✅ TRANSACTION CREATE VALIDATOR
// ─────────────────────────────────────────────
const transactionValidator = [
  body("type")
    .isIn(["income", "expense"])
    .withMessage("Type must be 'income' or 'expense'"),

  body("amount")
    .isFloat({ min: 0.01 })
    .withMessage("Amount must be a positive number")
    .toFloat(),

  body("category")
    .isIn(CATEGORIES)
    .withMessage(`Category must be one of: ${CATEGORIES.join(", ")}`),

  body("note")
    .optional()
    .isString()
    .isLength({ max: 300 }).withMessage("Note cannot exceed 300 characters")
    .trim(),

  body("date")
    .optional()
    .isISO8601().withMessage("Date must be a valid ISO date")
    .toDate(),

  handleValidationErrors,
];


// ─────────────────────────────────────────────
// 🔥 UPDATE VALIDATOR (PARTIAL UPDATE)
// ─────────────────────────────────────────────
const updateTransactionValidator = [
  body("type")
    .optional()
    .isIn(["income", "expense"])
    .withMessage("Invalid type"),

  body("amount")
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage("Amount must be positive")
    .toFloat(),

  body("category")
    .optional()
    .isIn(CATEGORIES)
    .withMessage("Invalid category"),

  body("note")
    .optional()
    .isString()
    .isLength({ max: 300 })
    .withMessage("Note too long")
    .trim(),

  body("date")
    .optional()
    .isISO8601()
    .toDate(),

  handleValidationErrors,
];


module.exports = {
  registerValidator,
  loginValidator,
  transactionValidator,
  updateTransactionValidator, // 🔥 important
};