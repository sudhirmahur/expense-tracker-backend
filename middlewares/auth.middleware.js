const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const { errorResponse } = require("../utils/apiResponse");

const protect = async (req, res, next) => {
  try {
    if (!process.env.JWT_SECRET) {
      return errorResponse(res, 500, "JWT secret not configured.");
    }

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return errorResponse(res, 401, "Access denied. No token provided.");
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ❌ lean hata diya
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return errorResponse(res, 401, "User not found. Please login again.");
    }

    req.user = user;

    next();
  } catch (error) {
    console.error("Auth Error:", error.message);

    if (error.name === "JsonWebTokenError") {
      return errorResponse(res, 401, "Invalid token.");
    }

    if (error.name === "TokenExpiredError") {
      return errorResponse(res, 401, "Token expired. Please login again.");
    }

    return errorResponse(res, 500, "Authentication failed.");
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return errorResponse(res, 403, "Access forbidden.");
    }
    next();
  };
};

module.exports = { protect, authorize };