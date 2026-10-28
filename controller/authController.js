const userModel = require('../model/userModel');
const User = require('../model/userModel');
const { sendVerificationEmail } = require('../utils/sendEmail');
const {hashToken, generateSecureToken} = require('../utils/tokenHelpers');
// const bcrypt = require('bcrypt');
const emailRegex = /^[a-zA-Z0-9.\_%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const VERIFICATION_EXPIRE_MS = Number(process.env.VERIFICATION_EXPIRE_MS) || 24 * 60 * 60 * 1000;

const registrationController = async (req, res) => {
    try {
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
            return res.status(400).json({
                success: false,
                message: 'Password is required'
            });
        }

        if (gender && !['male', 'female', 'other'].includes(gender)) {
            return res.status(400).json({
                success: false,
                message: "Gender must be 'male', 'female', or 'other'"
            });
        }

        // Check if email already exists
        const existingUser = await User.findOne({
            email: email.toLowerCase().trim()
        });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email already registered!"
            });
        }
        const verificationToken = generateSecureToken();

        // Create and save new user 
        const user = await User.create({
            username: username.trim(),
            email: email.toLowerCase().trim(),
            password: password,
            profileImage: profileImage || null,
            address: address || null,
            phone: phone || null,
            gender: gender || null,
            dateOfBirth: dateOfBirth || null,
            emailVerificationToken: hashToken(verificationToken),
            emailVerificationTokenExpires: new Date(Date.now() + VERIFICATION_EXPIRE_MS),
        });
        try {
            await sendVerificationEmail(user.email, user.username, verificationToken);
        } catch (mailError) {
            await User.findByIdAndDelete(user._id);
            console.error("Verification email failed:", mailError);
            return res.status(500).json({
                success: false,
                message: "Registration failed: could not send verification email",
            });
        }

        // Send success response
        return res.status(201).json({
            success: true,
            message: "User registered successfully!",
            data: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        console.error("Registration Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

const verifyEmailController = async (req, res) => {
  try {
    const { token } = req.params;
    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Verification token is required",
      });
    }

    const hashed = hashToken(token);
    const user = await User
      .findOne({
        emailVerificationToken: hashed,
        emailVerificationTokenExpires: { $gt: Date.now() },
      })
      .select("+emailVerificationToken +emailVerificationTokenExpires");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification token",
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationTokenExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json({
      success: true,
      message: "Email verified successfully. You can log in now.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Email verification failed",
    });
  }
};




const imageUpload = async (req, res) => {
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
};

module.exports = {
    registrationController,
    imageUpload,
    verifyEmailController
};