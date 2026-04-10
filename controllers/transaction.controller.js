const Transaction = require("../models/transaction.model");
const { successResponse, errorResponse } = require("../utils/apiResponse");

// Simple logger (can replace with Winston later)
const log = (message, data = null) => {
  console.log(`[Transaction LOG]: ${message}`, data || "");
};

// ─────────────────────────────────────────────
// ✅ CREATE TRANSACTION
// ─────────────────────────────────────────────
const createTransaction = async (req, res, next) => {
  try {
    const { type, amount, category, note, date } = req.body;

    if (!type || !amount || !category) {
      return errorResponse(res, 400, "Type, amount and category are required.");
    }

    if (!["income", "expense"].includes(type)) {
      return errorResponse(res, 400, "Invalid transaction type.");
    }

    if (amount <= 0) {
      return errorResponse(res, 400, "Amount must be greater than 0.");
    }

    const transaction = await Transaction.create({
      user: req.user._id,
      type,
      amount,
      category,
      note,
      date,
    });

    log("Transaction Created", transaction._id);

    return successResponse(res, 201, "Transaction created successfully.", {
      transaction,
    });
  } catch (error) {
    log("Error in createTransaction", error.message);
    next(error);
  }
};

// ─────────────────────────────────────────────
// ✅ GET ALL TRANSACTIONS (FILTER + PAGINATION)
// ─────────────────────────────────────────────
const getTransactions = async (req, res, next) => {
  try {
    const {
      type,
      category,
      startDate,
      endDate,
      search,
      sort = "latest",
      page = 1,
      limit = 10,
    } = req.query;

    const filter = { user: req.user._id };

    if (type && ["income", "expense"].includes(type)) {
      filter.type = type;
    }

    if (category) {
      filter.category = category;
    }

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);

      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.date.$lte = end;
      }
    }

    if (search) {
      filter.$or = [
        { note: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    const sortOptions = {
      latest: { date: -1 },
      oldest: { date: 1 },
      highest: { amount: -1 },
      lowest: { amount: 1 },
    };

    const sortQuery = sortOptions[sort] || sortOptions.latest;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [transactions, total] = await Promise.all([
      Transaction.find(filter).sort(sortQuery).skip(skip).limit(limitNum),
      Transaction.countDocuments(filter),
    ]);

    log("Fetched Transactions", { user: req.user._id });

    return successResponse(res, 200, "Transactions fetched successfully.", {
      transactions,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    log("Error in getTransactions", error.message);
    next(error);
  }
};

// ─────────────────────────────────────────────
// ✅ GET TRANSACTION BY ID
// ─────────────────────────────────────────────
const getTransactionById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const transaction = await Transaction.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!transaction) {
      return errorResponse(res, 404, "Transaction not found.");
    }

    return successResponse(res, 200, "Transaction fetched successfully.", {
      transaction,
    });
  } catch (error) {
    log("Error in getTransactionById", error.message);
    next(error);
  }
};

// ─────────────────────────────────────────────
// ✅ UPDATE TRANSACTION
// ─────────────────────────────────────────────
const updateTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;

    const transaction = await Transaction.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!transaction) {
      return errorResponse(res, 404, "Transaction not found.");
    }

    const allowedFields = ["type", "amount", "category", "note", "date"];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        transaction[field] = req.body[field];
      }
    });

    await transaction.save();

    log("Transaction Updated", id);

    return successResponse(res, 200, "Transaction updated successfully.", {
      transaction,
    });
  } catch (error) {
    log("Error in updateTransaction", error.message);
    next(error);
  }
};

// ─────────────────────────────────────────────
// ✅ DELETE TRANSACTION
// ─────────────────────────────────────────────
const deleteTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;

    const transaction = await Transaction.findOneAndDelete({
      _id: id,
      user: req.user._id,
    });

    if (!transaction) {
      return errorResponse(res, 404, "Transaction not found.");
    }

    log("Transaction Deleted", id);

    return successResponse(res, 200, "Transaction deleted successfully.", {
      deletedId: id,
    });
  } catch (error) {
    log("Error in deleteTransaction", error.message);
    next(error);
  }
};

// ─────────────────────────────────────────────
// ✅ GET SUMMARY (TOTAL INCOME / EXPENSE)
// ─────────────────────────────────────────────
const getTransactionSummary = async (req, res, next) => {
  try {
    const summary = await Transaction.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" },
        },
      },
    ]);

    return successResponse(res, 200, "Summary fetched successfully.", {
      summary,
    });
  } catch (error) {
    log("Error in getTransactionSummary", error.message);
    next(error);
  }
};

module.exports = {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getTransactionSummary,
};