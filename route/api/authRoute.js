const express = require("express");
const router = express.Router();
const upload = require('../../middalware/fileUploads');
const {
    registrationController,
    imageUpload,
    verifyEmailController,
    loginController,
    getMeController
} = require('../../controller/authController');
const { protect } = require("../../middalware/authMiddleware");
router.get('/login', (req, res) => {
    res.send('Login route');
});
router.post('/register', registrationController);
router.get('/verify-email/:token', verifyEmailController);
router.post('/login', loginController);
router.get("/me", protect, getMeController);

router.post('/image', upload.single('avatar'), imageUpload);

module.exports = router;