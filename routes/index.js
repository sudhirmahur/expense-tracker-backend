const express = require("express");
const router = express.Router();

// Import all route files
const authRoutes = require("./auth.routes");
const transactionRoutes = require("./transaction.routes");
const referralRoutes = require("./referral.routes");
const statsRoutes = require("./stats.routes");
const categoryRoutes = require("./category.routes");

// Mount routes
router.use("/auth", authRoutes);
router.use("/transactions", transactionRoutes);
router.use("/referral", referralRoutes);
router.use("/stats", statsRoutes);
router.use("/categories", categoryRoutes);

module.exports = router;