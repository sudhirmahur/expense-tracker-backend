const { validationResult, body } = require("express-validator");
const { errorResponse } = require("../utils/apiResponse");
const Category = require("../models/category.model");

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
    .isLength({ min: 2, max: 50 }),

  body("email")
    .isEmail().withMessage("Valid email required")
    .normalizeEmail(),

  body("password")
    .isLength({ min: 6 }).withMessage("Password min 6 char"),

  handleValidationErrors,
];

const loginValidator = [
  body("email").isEmail().normalizeEmail(),
  body("password").notEmpty(),

  handleValidationErrors,
];

// ─────────────────────────────────────────────
// ✅ TRANSACTION CREATE VALIDATOR (DYNAMIC 🔥)
// ─────────────────────────────────────────────
const transactionValidator = [
  body("type")
    .isIn(["income", "expense"])
    .withMessage("Type must be income or expense"),

  body("amount")
    .isFloat({ min: 0.01 })
    .withMessage("Amount must be positive")
    .toFloat(),

  // 🔥 Dynamic category validation
  body("category").custom(async (value, { req }) => {
    const category = await Category.findById(value);

    if (!category) {
      throw new Error("Category not found");
    }

    if (category.type !== req.body.type) {
      throw new Error("Category type mismatch");
    }

    return true;
  }),

  body("note")
    .optional()
    .isString()
    .isLength({ max: 300 })
    .withMessage("Note too long")
    .trim(),

  body("date")
    .optional()
    .isISO8601()
    .withMessage("Invalid date")
    .toDate(),

  handleValidationErrors,
];

// ─────────────────────────────────────────────
// 🔥 UPDATE VALIDATOR
// ─────────────────────────────────────────────
const updateTransactionValidator = [
  body("type")
    .optional()
    .isIn(["income", "expense"]),

  body("amount")
    .optional()
    .isFloat({ min: 0.01 })
    .toFloat(),

  body("category")
    .optional()
    .custom(async (value) => {
      const category = await Category.findById(value);
      if (!category) throw new Error("Invalid category");
      return true;
    }),

  body("note")
    .optional()
    .isLength({ max: 300 })
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
  updateTransactionValidator,
};