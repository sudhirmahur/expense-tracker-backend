const Workspace = require("../models/workspace.model");
const WorkspaceMember = require("../models/workspaceMember.model");
const User = require("../models/user.model");
const { successResponse, errorResponse } = require("../utils/apiResponse");

// ✅ CREATE WORKSPACE
const createWorkspace = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return errorResponse(res, 400, "Workspace name required");
    }

    // create workspace
    const workspace = await Workspace.create({
      name,
      owner: req.user._id,
    });

    // create owner member
    await WorkspaceMember.create({
      workspace: workspace._id,
      user: req.user._id,
      role: "owner",
    });

    // set current workspace
    await User.findByIdAndUpdate(req.user._id, {
      currentWorkspace: workspace._id,
    });

    return successResponse(res, 201, "Workspace created", { workspace });
  } catch (err) {
    console.log(err);
    return errorResponse(res, 500, "Server Error");
  }
};

// ✅ GET MY WORKSPACES
const getMyWorkspaces = async (req, res) => {
  try {
    const workspaces = await WorkspaceMember.find({
      user: req.user._id,
    }).populate("workspace");

    return successResponse(res, 200, "Workspaces fetched", { workspaces });
  } catch (err) {
    return errorResponse(res, 500, "Server Error");
  }
};

// ✅ GET MEMBERS
const getWorkspaceMembers = async (req, res) => {
  try {
    if (!req.user.currentWorkspace) {
      return errorResponse(res, 400, "No workspace selected");
    }

    const members = await WorkspaceMember.find({
      workspace: req.user.currentWorkspace,
    }).populate("user", "name email");

    return successResponse(res, 200, "Members fetched", { members });
  } catch (err) {
    return errorResponse(res, 500, "Server Error");
  }
};

// ✅ REMOVE USER (OWNER ONLY)
const removeUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const ownerCheck = await WorkspaceMember.findOne({
      user: req.user._id,
      workspace: req.user.currentWorkspace,
      role: "owner",
    });

    if (!ownerCheck) {
      return errorResponse(res, 403, "Only owner allowed");
    }

    await WorkspaceMember.deleteOne({
      user: userId,
      workspace: req.user.currentWorkspace,
    });

    return successResponse(res, 200, "User removed successfully");
  } catch (err) {
    return errorResponse(res, 500, "Server Error");
  }
};

// ✅ SWITCH WORKSPACE
const switchWorkspace = async (req, res) => {
  try {
    const { workspaceId } = req.body;

    const exists = await WorkspaceMember.findOne({
      workspace: workspaceId,
      user: req.user._id,
    });

    if (!exists) {
      return errorResponse(res, 403, "Not part of this workspace");
    }

    await User.findByIdAndUpdate(req.user._id, {
      currentWorkspace: workspaceId,
    });

    return successResponse(res, 200, "Workspace switched");
  } catch (err) {
    return errorResponse(res, 500, "Server Error");
  }
};

module.exports = {
  createWorkspace,
  getMyWorkspaces,
  getWorkspaceMembers,
  removeUser,
  switchWorkspace,
};