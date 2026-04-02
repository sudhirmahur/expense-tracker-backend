const express = require("express");
const router = express.Router();

const {
  getSummary,
  getCategoryStats,
  getMonthlyStats,
} = require("../controllers/stats.controller");

const { protect } = require("../middlewares/auth.middleware");

// All routes protected
router.use(protect);

// Dashboard routes
router.get("/summary", getSummary);
router.get("/category", getCategoryStats);
router.get("/monthly", getMonthlyStats);

module.exports = router;