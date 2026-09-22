const express = require("express");
const router = express.Router();

const {
  createCategory,
  getCategories,
  deleteCategory,
    updateCategory,
    getCategoryById,

} = require("../controllers/category.controller");

// agar auth middleware hai toh use lagao
// const { protect } = require("../middlewares/auth.middleware");

router.post("/create", createCategory);
router.get("/list", getCategories);
router.get("/:id", getCategoryById);
router.put("/update/:id", updateCategory);
router.delete("/delete/:id", deleteCategory);

module.exports = router;