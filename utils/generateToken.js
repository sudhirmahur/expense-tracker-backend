const jwt = require("jsonwebtoken");

const generateToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  return jwt.sign(
    {
      id: user._id,
      email: user.email, // 🔥 useful
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
      issuer: "expense-tracker-app",
      audience: "users",
    }
  );
};

module.exports = generateToken;