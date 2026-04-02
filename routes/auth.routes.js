const express = require("express");
const router = express.Router();

const { register, login, getMe } = require("../controllers/auth.controller");
const { protect } = require("../middlewares/auth.middleware");
const { registerValidator, loginValidator } = require("../middlewares/validator.middleware");

// Public Routes
router.post("/register", registerValidator, register);
router.post("/login", loginValidator, login);

// Private Routes
router.get("/me", protect, getMe);

module.exports = router;