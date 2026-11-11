const express = require("express");
const router = express.Router();
const authRoute = require('./authRoute');
const dashboardRoute = require('./dashboard');
const taskRoute =require('./taskRoute')
router.use('/auth', authRoute);
router.use('/dashboard', dashboardRoute);
router.use('/task', taskRoute);

module.exports = router;