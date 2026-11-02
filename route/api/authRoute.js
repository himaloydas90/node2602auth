const express = require("express");
const router = express.Router();
const upload = require('../../middalware/fileUploads');
const {
    registrationController,
    imageUpload,
    verifyEmailController,
    loginController,
    getMeController,
    reVerificationController,
    updateProfileController
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
router.patch("/profile", protect,upload.single('picture'), updateProfileController);

router.post('/image', upload.single('picture'), imageUpload);

module.exports = router;