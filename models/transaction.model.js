const mongoose = require("mongoose");

// ✅ Categories
const CATEGORIES = [
  "food",
  "travel",
  "shopping",
  "entertainment",
  "healthcare",
  "education",
  "utilities",
  "rent",
  "salary",
  "freelance",
  "investment",
  "gift",
  "other",
];

const INCOME_CATEGORIES = ["salary", "freelance", "investment", "gift"];

const EXPENSE_CATEGORIES = [
  "food",
  "travel",
  "shopping",
  "entertainment",
  "healthcare",
  "education",
  "utilities",
  "rent",
  "other",
];

// ✅ Schema
const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },

    type: {
      type: String,
      enum: {
        values: ["income", "expense"],
        message: "Type must be either 'income' or 'expense'",
      },
      required: [true, "Transaction type is required"],
    },

    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0.01, "Amount must be greater than 0"],
      validate: {
        validator: Number.isFinite,
        message: "Amount must be a valid number",
      },
    },

    category: {
      type: String,
      enum: {
        values: CATEGORIES,
        message: `Category must be one of: ${CATEGORIES.join(", ")}`,
      },
      required: [true, "Category is required"],
      index: true,
    },

    note: {
      type: String,
      trim: true,
      maxlength: [300, "Note cannot exceed 300 characters"],
      default: "",
    },

    date: {
      type: Date,
      required: [true, "Date is required"],
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);


// ✅ Indexes (Performance Optimization)
transactionSchema.index({ user: 1, date: -1 });
transactionSchema.index({ user: 1, type: 1 });
transactionSchema.index({ user: 1, category: 1 });


// ✅ Pre-save Validation (Smart Logic 🔥)
transactionSchema.pre("save", function (next) {
  if (this.type === "income" && !INCOME_CATEGORIES.includes(this.category)) {
    return next(new Error("Invalid category for income"));
  }

  if (this.type === "expense" && !EXPENSE_CATEGORIES.includes(this.category)) {
    return next(new Error("Invalid category for expense"));
  }

  next();
});


// ✅ Virtual Field
transactionSchema.virtual("isExpense").get(function () {
  return this.type === "expense";
});


// ✅ Instance Method
transactionSchema.methods.isIncome = function () {
  return this.type === "income";
};


// ✅ Static Export (for reuse in controllers)
transactionSchema.statics.CATEGORIES = CATEGORIES;
transactionSchema.statics.INCOME_CATEGORIES = INCOME_CATEGORIES;
transactionSchema.statics.EXPENSE_CATEGORIES = EXPENSE_CATEGORIES;


// ✅ Model Export
const Transaction = mongoose.model("Transaction", transactionSchema);
module.exports = Transaction;