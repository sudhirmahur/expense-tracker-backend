const User = require("../models/user.model");
const { successResponse, errorResponse } = require("../utils/apiResponse");


// ─────────────────────────────────────────────
// ✅ GET MY REFERRAL CODE
// ─────────────────────────────────────────────
const getMyReferralCode = async (req, res, next) => {
  try {
    // 🔥 Always fetch fresh user (safe approach)
    const user = await User.findById(req.user._id).select("referralCode");

    if (!user) {
      return errorResponse(res, 404, "User not found.");
    }

    const baseUrl = process.env.APP_URL || "http://localhost:3000";

    const inviteLink = `${baseUrl}/register?ref=${user.referralCode}`;

    return successResponse(res, 200, "Referral code fetched successfully.", {
      referralCode: user.referralCode,
      inviteLink,
    });
  } catch (error) {
    next(error);
  }
};


// ─────────────────────────────────────────────
// ✅ GET REFERRED USERS (WITH PAGINATION 🔥)
// ─────────────────────────────────────────────
const getReferredUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const user = await User.findById(req.user._id).select("referralCode");

    if (!user) {
      return errorResponse(res, 404, "User not found.");
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [referredUsers, total] = await Promise.all([
      User.find({ referredBy: user.referralCode })
        .select("name email createdAt")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),

      User.countDocuments({ referredBy: user.referralCode }),
    ]);

    return successResponse(res, 200, "Referred users fetched successfully.", {
      totalReferrals: total,
      referredUsers,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        hasNextPage: pageNum < Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};


// ─────────────────────────────────────────────
// 🔥 BONUS: REFERRAL STATS (INTERVIEW KILLER)
// ─────────────────────────────────────────────
const getReferralStats = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("referralCode");

    if (!user) {
      return errorResponse(res, 404, "User not found.");
    }

    const totalReferrals = await User.countDocuments({
      referredBy: user.referralCode,
    });

    // Last 7 days referrals
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    const recentReferrals = await User.countDocuments({
      referredBy: user.referralCode,
      createdAt: { $gte: last7Days },
    });

    return successResponse(res, 200, "Referral stats fetched.", {
      totalReferrals,
      recentReferrals,
    });
  } catch (error) {
    next(error);
  }
};


module.exports = {
  getMyReferralCode,
  getReferredUsers,
  getReferralStats, // 🔥 extra feature
};