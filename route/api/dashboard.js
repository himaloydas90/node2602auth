const express = require("express");
const router = express.Router();
const { requiedAdmin, protect } = require("../../middalware/authMiddleware");
const { getAllUserController } = require("../../controller/dashboardController");

router.use(protect)
router.get("/allusers", requiedAdmin,getAllUserController);




module.exports = router;