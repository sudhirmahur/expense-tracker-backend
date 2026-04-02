const express = require("express");
const router = express.Router();

const {
  createTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
} = require("../controllers/transaction.controller");

const { protect } = require("../middlewares/auth.middleware");
const {
  transactionValidator,
  updateTransactionValidator,
} = require("../middlewares/validator.middleware");

// All routes protected
router.use(protect);

// Routes
router.post("/", transactionValidator, createTransaction);
router.get("/", getTransactions);
router.put("/:id", updateTransactionValidator, updateTransaction);
router.delete("/:id", deleteTransaction);

module.exports = router;