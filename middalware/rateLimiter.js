const { rateLimit } = require("express-rate-limit");


const loginlimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  message: { error: "Too many requests, please try again later." },
});

module.exports = {
    loginlimiter
}