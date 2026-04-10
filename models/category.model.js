const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      lowercase: true,
    },
    type: {
      type: String,
      enum: ["income", "expense"],
      required: [true, "Category type is required"],
    },
    // user: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "User",
    //   required: true,
    // },
  },
  { timestamps: true }
);

// ❗ same user duplicate category na bana sake
// categorySchema.index({ user: 1, name: 1, type: 1 }, { unique: true });
categorySchema.index({ name: 1, type: 1 }, { unique: true });

module.exports = mongoose.model("Category", categorySchema);