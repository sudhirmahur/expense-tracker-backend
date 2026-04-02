const Transaction = require("../models/transaction.model");
const { successResponse, errorResponse } = require("../utils/apiResponse");

// ─────────────────────────────────────────────
// ✅ CREATE TRANSACTION
// ─────────────────────────────────────────────
const createTransaction = async (req, res, next) => {
  try {
    const { type, amount, category, note, date } = req.body;

    // ✅ Validation
    if (!type || !amount || !category) {
      return errorResponse(res, 400, "Type, amount and category are required.");
    }

    if (amount <= 0) {
      return errorResponse(res, 400, "Amount must be greater than 0.");
    }

    const transaction = await Transaction.create({
      user: req.user._id, // ✅ FIXED
      type,
      amount,
      category,
      note,
      date,
    });

    return successResponse(res, 201, "Transaction created successfully.", {
      transaction,
    });
  } catch (error) {
    next(error);
  }
};


// ─────────────────────────────────────────────
// ✅ GET TRANSACTIONS (FILTER + PAGINATION)
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

    // ✅ FIXED user field
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

    return successResponse(res, 200, "Transactions fetched successfully.", {
      transactions,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        hasNextPage: pageNum < Math.ceil(total / limitNum),
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error) {
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
      user: req.user._id, // ✅ FIXED
    });

    if (!transaction) {
      return errorResponse(res, 404, "Transaction not found or access denied.");
    }

    const allowedFields = ["type", "amount", "category", "note", "date"];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        transaction[field] = req.body[field];
      }
    });

    await transaction.save();

    return successResponse(res, 200, "Transaction updated successfully.", {
      transaction,
    });
  } catch (error) {
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
      user: req.user._id, // ✅ FIXED
    });

    if (!transaction) {
      return errorResponse(res, 404, "Transaction not found or access denied.");
    }

    return successResponse(res, 200, "Transaction deleted successfully.", {
      deletedId: transaction._id,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
};