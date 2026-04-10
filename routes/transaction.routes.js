const express = require("express");
const router = express.Router();

const {
  createTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
  getTransactionSummary,
  getTransactionById,

} = require("../controllers/transaction.controller");

const { protect } = require("../middlewares/auth.middleware");
const {
  transactionValidator,
  updateTransactionValidator,
} = require("../middlewares/validator.middleware");

// All routes protected
router.use(protect);

// Routes
router.post("/create", transactionValidator, createTransaction);
router.get("/list", getTransactions);
router.get("/summary", getTransactionSummary);
router.get("/:id", getTransactionById);
router.put("/update/:id", updateTransactionValidator, updateTransaction);
router.delete("/delete/:id", deleteTransaction);


module.exports = router;