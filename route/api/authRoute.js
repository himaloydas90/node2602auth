const express = require("express");
const router = express.Router();
const upload = require('../../middalware/fileUploads');
const {
    registrationController,
    imageUpload,
    verifyEmailController,
    loginController,
    getMeController,
    reVerificationController
} = require('../../controller/authController');
const { protect } = require("../../middalware/authMiddleware");
const {  loginlimiter } = require("../../middalware/rateLimiter");
router.get('/login', (req, res) => {
    res.send('Login route');
});
router.post('/register', registrationController);
router.get('/verify-email/:token', verifyEmailController);
router.post('/resend-verification', reVerificationController);
router.post('/login',loginlimiter, loginController);
router.get("/me", protect, getMeController);

router.post('/image', upload.single('avatar'), imageUpload);

module.exports = router;