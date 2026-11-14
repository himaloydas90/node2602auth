const express = require("express");
const router = express.Router();
const { requiedAdmin, protect, isEmailVerified } = require("../../middalware/authMiddleware");
const { taskController, updateTaskStatus} = require('../../controller/taskController')

router.use(protect)
router.post("/taskCreate", requiedAdmin,taskController);
router.patch("/updateTaskStatus/:taskId",isEmailVerified,updateTaskStatus);

module.exports = router;