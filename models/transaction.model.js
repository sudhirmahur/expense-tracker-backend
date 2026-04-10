const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: ["income", "expense"],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    note: {
      type: String,
      trim: true,
      maxlength: 300,
    },

    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// 🔥 Dynamic validation
transactionSchema.pre("save", async function () {
  const Category = mongoose.model("Category");

  const category = await Category.findById(this.category);

  if (!category) throw new Error("Category not found");

  if (category.type !== this.type) {
    throw new Error("Category type mismatch");
  }
});

module.exports = mongoose.model("Transaction", transactionSchema);