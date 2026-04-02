const isDev = process.env.NODE_ENV !== "production";

/**
 * ✅ Standard Success Response
 */
const successResponse = (
  res,
  statusCode = 200,
  message = "Success",
  data = {}
) => {
  return res.status(statusCode).json({
    success: true,
    statusCode,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
};


/**
 * ❌ Standard Error Response
 */
const errorResponse = (
  res,
  statusCode = 500,
  message = "Server Error",
  errors = null,
  stack = null
) => {
  const response = {
    success: false,
    statusCode,
    message,
    timestamp: new Date().toISOString(),
  };

  if (errors) response.errors = errors;

  // 🔥 Show stack only in development
  if (isDev && stack) {
    response.stack = stack;
  }

  return res.status(statusCode).json(response);
};

module.exports = { successResponse, errorResponse }