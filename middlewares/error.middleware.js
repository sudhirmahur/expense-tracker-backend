const { errorResponse } = require("../utils/apiResponse");

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  let errors = null;

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.`;
    statusCode = 409;
  }

  if (err.name === "ValidationError") {
    errors = Object.values(err.errors).map((e) => e.message);
    message = "Validation failed";
    statusCode = 400;
  }

  if (err.name === "CastError") {
    message = `Invalid ${err.path}: ${err.value}`;
    statusCode = 400;
  }

  if (err.name === "JsonWebTokenError") {
    message = "Invalid token.";
    statusCode = 401;
  }

  if (err.name === "TokenExpiredError") {
    message = "Token expired. Please login again.";
    statusCode = 401;
  }

  if (process.env.NODE_ENV !== "production") {
    console.error("ERROR:", {
      message: err.message,
      stack: err.stack,
    });
  }

  return errorResponse(
    res,
    statusCode,
    message,
    errors,
    err.stack ? err.stack : null
  );
};

// ✅ FIXED (export hata diya)
const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

module.exports = { errorHandler, notFound };