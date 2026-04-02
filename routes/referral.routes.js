const express = require("express");
const router = express.Router();

const {
  getMyReferralCode,
  getReferredUsers,
  getReferralStats,
} = require("../controllers/referral.controller");

const { protect } = require("../middlewares/auth.middleware");

// All routes protected
router.use(protect);

router.get("/code", getMyReferralCode);
router.get("/users", getReferredUsers);
router.get("/stats", getReferralStats); // 🔥 bonus

module.exports = router;