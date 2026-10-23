const express = require("express");
const router = express.Router();
const authRoute = require('./authRoute');
const dashboardRoute = require('./dashboard');
router.use('/auth', authRoute);
router.use('/dashboard', dashboardRoute);

module.exports = router;