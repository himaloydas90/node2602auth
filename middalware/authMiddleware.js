const { verifyAccessToken } = require("../utils/tokenHelpers");
const userModel = require('../model/userModel')
const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Not authorized. Provide a Bearer access token.",
    });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = verifyAccessToken(token);

    const user = await userModel.findById(decoded.id)

    if(!user){
      return res.status(401).json({
        success: false,
        message: "User Not exist"
      })
    }

    req.user = user;
    next();
  } catch (error) {
    console.log(error)
    return res.status(401).json({
      success: false,
      message: "Invalid or expired access token.",
    });
  }
};
const isEmailVerified = (req, res, next) => {
  if(!req.user.isEmailVerified){
    return res.status(403).json({
      success: false,
      message: "Please Verify your email first."
    })
  }
  next()
}

module.exports = { protect, isEmailVerified };