const express = require("express");
const router = express.Router();

const { protect } = require("../middlewares/auth.middleware");

const {
  createWorkspace,
  getMyWorkspaces,
  getWorkspaceMembers,
  removeUser,
  switchWorkspace,
} = require("../controllers/workspace.controller");

router.post("/create", protect, createWorkspace);
router.get("/get", protect, getMyWorkspaces);
router.get("/members", protect, getWorkspaceMembers);
router.delete("/remove/:userId", protect, removeUser);
router.post("/switch", protect, switchWorkspace);

module.exports = router;