const express = require("express");
const router = express.Router();
const { requiedAdmin, protect } = require("../../middalware/authMiddleware");
const { getAllUserController,getSingleUserController,approveUserController,deleteUserController } = require("../../controller/dashboardController");

router.use(protect)
router.get("/allusers", requiedAdmin,getAllUserController);
router.get("/singleuser/:id", requiedAdmin,getSingleUserController)
router.patch("/approveuser/:id", requiedAdmin,approveUserController)
router.delete("/deleteuser/:id", requiedAdmin, deleteUserController)


module.exports = router;