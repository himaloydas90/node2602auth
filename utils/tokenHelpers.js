const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const hashToken = (token) => 
  crypto.createHash("sha256").update(token).digest("hex");

const generateSecureToken = () => crypto.randomBytes(32).toString("hex");

const generateAccessToken = (user) => {
  const payload = {
    id: user._id,
    username: user.username,
    email: user.email,
  };
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRE || "15m",
  });
};
module.exports = {generateSecureToken,generateAccessToken,hashToken}