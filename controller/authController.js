const User = require('../model/userModel');
// const bcrypt = require('bcrypt');
const {
    generateAccessToken,
    generateRefreshToken,
    generateTemporaryToken,
    hashToken
} = require('../helper/tokenHelper');
const asyncHandler = require('../utils/asyncHandler');
const { sendVerificationEmail } = require('../utils/sendEmail');

const emailRegex = /^[a-zA-Z0-9.\_%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/**
 * Validate password strength based on multiple criteria
 */
const validatePassword = (password) => {
    const checks = [
        {
            test: (p) => p.length >= 8,
            msg: 'Password must be at least 8 characters long',
        },
        {
            test: (p) => /[A-Z]/.test(p),
            msg: 'Password must include an uppercase letter',
        },
        {
            test: (p) => /[a-z]/.test(p),
            msg: 'Password must include a lowercase letter',
        },
        {
            test: (p) => /\d/.test(p),
            msg: 'Password must include a number',
        },
        {
            test: (p) => /[@$!%*?&]/.test(p),
            msg: 'Password must include a special character (@$!%*?&)',
        },
    ];

    const failed = checks.find((c) => !c.test(password));
    return failed ? failed.msg : null;
};

/**
 * Issue auth tokens (Access & Refresh tokens) and manage active sessions
 */
const issueAuthTokens = async (user) => {
    const payload = { userId: user._id.toString(), email: user.email };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    if (!user.refreshTokens) {
        user.refreshTokens = [];
    }

    user.refreshTokens.push({ token: hashToken(refreshToken) });

    // Keep only the latest 5 refresh tokens (multi-device support with a sane limit)
    if (user.refreshTokens.length > 5) {
        user.refreshTokens = user.refreshTokens.slice(-5);
    }

    await user.save();

    return { accessToken, refreshToken };
};

/**
 * POST /auth/register
 * Register a new user and send an email verification link
 */
const registrationController = asyncHandler(async (req, res) => {
    const {
        username,
        email,
        password,
        profileImage,
        address,
        phone,
        gender,
        dateOfBirth
    } = req.body;

    // Validate username existence and length
    if (!username) {
        return res.status(400).json({
            success: false,
            message: "Username is required"
        });
    }
    if (username.length < 4 || username.length > 20) {
        return res.status(400).json({
            success: false,
            message: "Username must be between 4 and 20 characters long"
        });
    }

    // Validate email existence and format
    if (!email) {
        return res.status(400).json({
            success: false,
            message: "Email is required"
        });
    }
    if (!emailRegex.test(email.trim())) {
        return res.status(400).json({
            success: false,
            message: "Invalid email format!"
        });
    }

    // Validate password existence and strength
    if (!password) {
        return res.status(400).json({ success: false, message: 'Password is required' });
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
        return res.status(400).json({ success: false, message: passwordError });
    }

    // Validate gender if provided
    if (gender && !['male', 'female', 'other'].includes(gender)) {
        return res.status(400).json({
            success: false,
            message: "Gender must be 'male', 'female', or 'other'"
        });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
        return res.status(409).json({
            success: false,
            message: "Email already registered!"
        });
    }

    // Create and save new user (Password hashing is handled in User Model pre-save hook)
    const user = new User({
        username: username.trim(),
        email: email.toLowerCase().trim(),
        password: password,
        profileImage: profileImage || null,
        address: address || null,
        phone: phone || null,
        gender: gender || null,
        dateOfBirth: dateOfBirth || null,
    });
    
    await user.save();

    // Generate email verification temporary token
    const verificationToken = generateTemporaryToken(
        { userId: user._id.toString(), email: user.email },
        'email_verification'
    );

    // Send verification email
    try {
        await sendVerificationEmail(user.email, verificationToken, user.username);
    } catch (emailError) {
        console.error('Verification email failed:', emailError.message);
    }

    // Issue access and refresh tokens for immediate login
    const tokens = await issueAuthTokens(user);

    return res.status(201).json({
        success: true,
        message: "User registered successfully. Please check your email (including the spam folder) to verify your account.",
        ...tokens,
        user: user.toSafeObject ? user.toSafeObject() : user
    });
});


const verifyEmail = asyncHandler(async (req, res) => {
  const token = req.body?.token || req.query.token;

  if (!token) {
    return res.status(400).json({
      success: false,
      message: 'Verification token is required',
    });
  }

  let decoded;
  try {
    decoded = verifyTemporaryToken(token, 'email_verification');
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired verification token',
    });
  }

  const user = await User.findById(decoded.user._Id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  if (user.isEmailVerified) {
    return res.status(200).json({
      success: true,
      message: 'Email is already verified',
    });
  }

  user.isEmailVerified = true;
  await user.save();

  return res.status(200).json({
    success: true,
    message: 'Email verified successfully. You can now log in.',
  });
});


/**
 * POST /auth/image
 * Handle profile image upload
 */
const imageUpload = asyncHandler(async (req, res) => {
    console.log(req.file);

    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: "No image was uploaded!"
        });
    }
    
    const imageUrl = req.file.path;
    return res.status(200).json({
        success: true,
        message: "Image uploaded successfully",
        url: imageUrl
    });
});

module.exports = {
    registrationController,
    imageUpload,
    verifyEmail
};