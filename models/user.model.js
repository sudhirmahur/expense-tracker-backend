const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const generateReferralCode = require("../utils/generateReferralCode");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // 🔐 hide by default
    },

    referralCode: {
      type: String,
      unique: true,
      index: true, // 🔥 fast search
    },

    referredBy: {
      type: String, // store referralCode
      default: null,
    },
  },
  {
    timestamps: true,
  }
);


// 🔥 PRE-SAVE HOOK
userSchema.pre("save", async function () {
  if (this.isNew && !this.referralCode) {
    let code;
    let exists = true;

    const UserModel = mongoose.models.User || mongoose.model("User");

    while (exists) {
      code = generateReferralCode();
      const user = await UserModel.findOne({ referralCode: code });
      if (!user) exists = false;
    }

    this.referralCode = code;
  }

  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// 🔑 PASSWORD COMPARE
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};


// 🔒 SAFE OBJECT (remove sensitive data)
userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};


// 🚀 EXPORT
const User = mongoose.model("User", userSchema);
module.exports = User;