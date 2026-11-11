const express = require("express");
const router = express.Router();
const { requiedAdmin, protect } = require("../../middalware/authMiddleware");
const { taskController} = require('../../controller/taskController')

router.use(protect)
router.get("/taskCreat", requiedAdmin,taskController);


module.exports = router;