const { customAlphabet } = require("nanoid");

// 🔥 Custom alphabet
const nanoid = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 8);

// ✅ ONLY generate code (no DB)
const generateReferralCode = () => {
  return nanoid();
};

module.exports = generateReferralCode;