const User = require("../models/user.model");
const Workspace = require("../models/workspace.model");
const WorkspaceMember = require("../models/workspaceMember.model");

const generateToken = require("../utils/generateToken");
const { successResponse, errorResponse } = require("../utils/apiResponse");


// ─────────────────────────────────────────────
// ✅ REGISTER (UPDATED WITH WORKSPACE LOGIC 🔥)
// ─────────────────────────────────────────────
const register = async (req, res, next) => {
  try {
    let { name, email, password, referralCode } = req.body;

    // ✅ Basic validation
    if (!name || !email || !password) {
      return errorResponse(res, 400, "All fields are required.");
    }

    email = email.toLowerCase().trim();

    // ✅ Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse(res, 409, "Email already registered.");
    }

    // ✅ Create user first
    const user = await User.create({
      name: name.trim(),
      email,
      password,
      referredBy: referralCode || null,
    });

    let workspaceId;

    // ─────────────────────────────
    // 🔥 CASE 1: NO REFERRAL (A)
    // ─────────────────────────────
    if (!referralCode) {
      const workspace = await Workspace.create({
        name: `${user.name}'s Workspace`,
        owner: user._id,
      });

      await WorkspaceMember.create({
        user: user._id,
        workspace: workspace._id,
        role: "owner",
      });

      workspaceId = workspace._id;
    }

    // ─────────────────────────────
    // 🔥 CASE 2: WITH REFERRAL
    // ─────────────────────────────
    if (referralCode) {
      const refUser = await User.findOne({ referralCode });

      if (!refUser) {
        return errorResponse(res, 400, "Invalid referral code.");
      }

      // check: kya refUser already kisi workspace ka owner hai
      const ownerWorkspace = await WorkspaceMember.findOne({
        user: refUser._id,
        role: "owner",
      });

      if (ownerWorkspace) {
        // ✅ join same workspace (A ka group)
        await WorkspaceMember.create({
          user: user._id,
          workspace: ownerWorkspace.workspace,
          role: "member",
        });

        workspaceId = ownerWorkspace.workspace;
      } else {
        // 🔥 NEW WORKSPACE (B apna group banayega)
        const newWorkspace = await Workspace.create({
          name: `${refUser.name}'s Team`,
          owner: refUser._id,
        });

        // B ko owner banao
        await WorkspaceMember.create({
          user: refUser._id,
          workspace: newWorkspace._id,
          role: "owner",
        });

        // new user add
        await WorkspaceMember.create({
          user: user._id,
          workspace: newWorkspace._id,
          role: "member",
        });

        workspaceId = newWorkspace._id;
      }
    }

    // ✅ Set current workspace
    user.currentWorkspace = workspaceId;
    await user.save();

    // ✅ Token
    const token = generateToken(user._id);

    return successResponse(res, 201, "Registration successful.", {
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        referralCode: user.referralCode,
        referredBy: user.referredBy,
        currentWorkspace: user.currentWorkspace,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};


// ─────────────────────────────────────────────
// ✅ LOGIN (UPDATED)
// ─────────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 400, "Email and password are required.");
    }

    email = email.toLowerCase().trim();

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return errorResponse(res, 401, "Invalid email or password.");
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return errorResponse(res, 401, "Invalid email or password.");
    }

    const token = generateToken(user._id);

    return successResponse(res, 200, "Login successful.", {
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        referralCode: user.referralCode,
        referredBy: user.referredBy,
        currentWorkspace: user.currentWorkspace,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};


// ─────────────────────────────────────────────
// ✅ GET ME
// ─────────────────────────────────────────────
const getMe = async (req, res, next) => {
  try {
    return successResponse(res, 200, "User fetched successfully.", {
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe };