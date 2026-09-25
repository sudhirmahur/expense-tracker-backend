const Transaction = require("../models/transaction.model");
const { successResponse } = require("../utils/apiResponse");
const mongoose = require("mongoose");

// ─────────────────────────────────────────────
// Helper: Get current workspace ID
// ─────────────────────────────────────────────
const getWorkspaceId = (req) => {
  const currentWorkspace = req.user?.currentWorkspace;

  if (!currentWorkspace) {
    return null;
  }

  // If currentWorkspace is already an ObjectId/string
  if (
    typeof currentWorkspace === "string" ||
    currentWorkspace instanceof mongoose.Types.ObjectId
  ) {
    return new mongoose.Types.ObjectId(currentWorkspace);
  }

  // If currentWorkspace is populated object
  if (currentWorkspace._id) {
    return new mongoose.Types.ObjectId(currentWorkspace._id);
  }

  return null;
};

// ─────────────────────────────────────────────
// ✅ SUMMARY
// ─────────────────────────────────────────────
const getSummary = async (req, res, next) => {
  try {
    const workspace = getWorkspaceId(req);

    if (!workspace) {
      return res.status(400).json({
        success: false,
        message: "No workspace selected.",
      });
    }

    const result = await Transaction.aggregate([
      {
        $match: {
          workspace,
        },
      },
      {
        $group: {
          _id: "$type",
          total: {
            $sum: "$amount",
          },
          count: {
            $sum: 1,
          },
        },
      },
    ]);

    let totalIncome = 0;
    let totalExpense = 0;
    let incomeCount = 0;
    let expenseCount = 0;

    result.forEach((item) => {
      if (item._id === "income") {
        totalIncome = item.total;
        incomeCount = item.count;
      }

      if (item._id === "expense") {
        totalExpense = item.total;
        expenseCount = item.count;
      }
    });

    return successResponse(
      res,
      200,
      "Summary fetched successfully.",
      {
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
        totalTransactions:
          incomeCount + expenseCount,
        incomeCount,
        expenseCount,
      }
    );
  } catch (error) {
    console.error("🔥 getSummary error:", error);
    next(error);
  }
};

// ─────────────────────────────────────────────
// ✅ CATEGORY STATS
// ─────────────────────────────────────────────
const getCategoryStats = async (req, res, next) => {
  try {
    const workspace = getWorkspaceId(req);

    if (!workspace) {
      return res.status(400).json({
        success: false,
        message: "No workspace selected.",
      });
    }

    const { type } = req.query;

    const matchStage = {
      workspace,
    };

    if (
      type &&
      ["income", "expense"].includes(type)
    ) {
      matchStage.type = type;
    }

    const result = await Transaction.aggregate([
      {
        $match: matchStage,
      },
      {
        $group: {
          _id: {
            category: "$category",
            type: "$type",
          },
          total: {
            $sum: "$amount",
          },
          count: {
            $sum: 1,
          },
        },
      },
      {
        $project: {
          _id: 0,
          category: "$_id.category",
          type: "$_id.type",
          total: 1,
          count: 1,
        },
      },
      {
        $sort: {
          total: -1,
        },
      },
    ]);

    const totalAmount = result.reduce(
      (sum, item) => sum + item.total,
      0
    );

    const categories = result.map((item) => ({
      ...item,
      percentage:
        totalAmount > 0
          ? parseFloat(
              (
                (item.total / totalAmount) *
                100
              ).toFixed(2)
            )
          : 0,
    }));

    return successResponse(
      res,
      200,
      "Category stats fetched successfully.",
      {
        categories,
      }
    );
  } catch (error) {
    console.error(
      "🔥 getCategoryStats error:",
      error
    );
    next(error);
  }
};

// ─────────────────────────────────────────────
// ✅ MONTHLY STATS
// ─────────────────────────────────────────────
const getMonthlyStats = async (req, res, next) => {
  try {
    const workspace = getWorkspaceId(req);

    if (!workspace) {
      return res.status(400).json({
        success: false,
        message: "No workspace selected.",
      });
    }

    const months = Math.min(
      24,
      Math.max(
        1,
        parseInt(req.query.months) || 6
      )
    );

    const startDate = new Date();

    startDate.setMonth(
      startDate.getMonth() - months + 1
    );

    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    const result = await Transaction.aggregate([
      {
        $match: {
          workspace,
          date: {
            $gte: startDate,
          },
        },
      },
      {
        $group: {
          _id: {
            year: {
              $year: "$date",
            },
            month: {
              $month: "$date",
            },
            type: "$type",
          },
          total: {
            $sum: "$amount",
          },
        },
      },
    ]);

    // ─────────────────────────────────────────
    // Fill missing months
    // ─────────────────────────────────────────

    const monthlyMap = {};

    for (let i = 0; i < months; i++) {
      const d = new Date();

      d.setMonth(
        d.getMonth() - i
      );

      const key = `${d.getFullYear()}-${String(
        d.getMonth() + 1
      ).padStart(2, "0")}`;

      monthlyMap[key] = {
        month: key,
        income: 0,
        expense: 0,
      };
    }

    // ─────────────────────────────────────────
    // Add actual transaction totals
    // ─────────────────────────────────────────

    result.forEach(
      ({ _id, total }) => {
        const key = `${_id.year}-${String(
          _id.month
        ).padStart(2, "0")}`;

        if (!monthlyMap[key]) {
          monthlyMap[key] = {
            month: key,
            income: 0,
            expense: 0,
          };
        }

        if (_id.type === "income") {
          monthlyMap[key].income = total;
        }

        if (_id.type === "expense") {
          monthlyMap[key].expense = total;
        }
      }
    );

    // ─────────────────────────────────────────
    // Calculate monthly balance
    // ─────────────────────────────────────────

    const monthly = Object.values(
      monthlyMap
    ).map((m) => ({
      ...m,
      balance:
        m.income - m.expense,
    }));

    return successResponse(
      res,
      200,
      "Monthly stats fetched successfully.",
      {
        months: monthly.sort(
          (a, b) =>
            a.month.localeCompare(
              b.month
            )
        ),
      }
    );
  } catch (error) {
    console.error(
      "🔥 getMonthlyStats error:",
      error
    );
    next(error);
  }
};

// ─────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────
module.exports = {
  getSummary,
  getCategoryStats,
  getMonthlyStats,
};