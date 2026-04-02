const User = require("../models/user.model");
const generateToken = require("../utils/generateToken");
const { successResponse, errorResponse } = require("../utils/apiResponse");

// ─────────────────────────────────────────────
// ✅ REGISTER
// ─────────────────────────────────────────────
const register = async (req, res, next) => {
  try {
    let { name, email, password, referralCode } = req.body;

    // ✅ Basic validation
    if (!name || !email || !password) {
      return errorResponse(res, 400, "All fields are required.");
    }

    // ✅ Normalize email
    email = email.toLowerCase().trim();

    // ✅ Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse(res, 409, "Email already registered.");
    }

    // ✅ Referral handling
    let referredBy = null;
    let referredUserId = null;

    if (referralCode) {
      const referrer = await User.findOne({ referralCode });

      if (!referrer) {
        return errorResponse(res, 400, "Invalid referral code.");
      }

      referredBy = referralCode;
      referredUserId = referrer._id; // 🔥 useful for analytics
    }

    // ✅ Create user
    const user = await User.create({
      name: name.trim(),
      email,
      password,
      referredBy,
      referredUserId, // optional field (add in model if needed)
    });

    const token = generateToken(user._id);

    return successResponse(res, 201, "Registration successful.", {
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        referralCode: user.referralCode,
        referredBy: user.referredBy,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};


// ─────────────────────────────────────────────
// ✅ LOGIN
// ─────────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 400, "Email and password are required.");
    }

    email = email.toLowerCase().trim();

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return errorResponse(res, 401, "Invalid email or password.");
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return errorResponse(res, 401, "Invalid email or password.");
    }

    const token = generateToken(user._id);

    return successResponse(res, 200, "Login successful.", {
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        referralCode: user.referralCode,
        referredBy: user.referredBy,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};


// ─────────────────────────────────────────────
// ✅ GET ME
// ─────────────────────────────────────────────
const getMe = async (req, res, next) => {
  try {
    return successResponse(res, 200, "User fetched successfully.", {
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe };