const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const emailService = require('../services/email.service');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
// const {
//     trackFailedLogin,
//     resetFailedAttempts,
//     logSecurityEvent,
//     SECURITY_EVENTS
// } = require('../middleware/security.middleware');
const logger = require('../utils/logger');

// Register user
exports.register = async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: errors.array()[0].msg
            });
        }

        const { email, password, fullName, phone } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'An account with this email already exists. Please login instead.'
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const user = await User.create({
            email,
            password: hashedPassword,
            fullName,
            phone,
            isVerified: false // Set initial verification status
        });

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Set token in cookie with enhanced security
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            path: '/'
        });

        // Send welcome email (don't block registration if email fails)
        try {
            await emailService.sendWelcomeEmail(user);
            console.log(`Welcome email sent successfully to ${user.email}`);
        } catch (emailError) {
            console.error('Failed to send welcome email:', emailError.message);
            // Don't fail registration if email fails
        }

        // Remove sensitive information
        user.password = undefined;

        res.status(201).json({
            success: true,
            message: 'Registration successful! Welcome to Sigma Clothing.',
            data: {
                user: {
                    _id: user._id,
                    email: user.email,
                    fullName: user.fullName,
                    role: user.role,
                    isVerified: user.isVerified
                },
                token
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Registration failed. Please try again.'
        });
    }
};

// Login user
exports.login = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const { email, password } = req.body;
        
        // Find user with password
        const user = await User.findOne({ email })
            .select('+password')
            .populate('wishlist', 'name images price');
        
        // Generic error message for security
        if (!user || !(await user.comparePassword(password))) {
            // Track failed login attempt
            // trackFailedLogin(req, email);

            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Reset failed attempts on successful login
        // resetFailedAttempts(req, email);

        // Update last login
        user.lastLogin = Date.now();
        await user.save();

        // Generate token
        const token = user.generateAuthToken();

        // Set cookie with enhanced security
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: '/'
        });

        // Remove sensitive data
        user.password = undefined;

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    _id: user._id,
                    email: user.email,
                    fullName: user.fullName,
                    phone: user.phone,
                    gender: user.gender,
                    address: user.address || {},
                    role: user.role,
                    isVerified: user.isVerified,
                    lastLogin: user.lastLogin,
                    profilePicture: user.profilePicture
                },
                token
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Invalid email or password'
        });
    }
};

// Verify email
exports.verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;

        const user = await User.findOne({
            verificationToken: token,
            verificationTokenExpiry: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired verification token'
            });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpiry = undefined;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Email verified successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Forgot password
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(200).json({
                success: true,
                message: "If an account exists with this email, you will receive a password reset link"
            });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        
        // Set token and expiry
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpiry = Date.now() + 3600000; // 1 hour
        await user.save();

        try {
            // Send reset email
            await emailService.sendPasswordResetEmail(email, resetToken);
            
            res.status(200).json({
                success: true,
                message: "If an account exists with this email, you will receive a password reset link"
            });
        } catch (emailError) {
            // Clean up the token if email fails
            user.resetPasswordToken = undefined;
            user.resetPasswordExpiry = undefined;
            await user.save();

            // Still return success to prevent user enumeration
            return res.status(200).json({
                success: true,
                message: "If an account exists with this email, you will receive a password reset link"
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to process password reset request"
        });
    }
};

// Reset password
exports.resetPassword = async (req, res) => {
    try {
        const { password } = req.body;
        const { token } = req.params;

        // Validate password complexity
        if (!password || password.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters long'
            });
        }

        // Check password complexity
        const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                success: false,
                message: 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character'
            });
        }

        // Find user with valid reset token
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpiry: { $gt: Date.now() }
        });

        if (!user) {
            // Log suspicious password reset attempt
            // logSecurityEvent(SECURITY_EVENTS.SUSPICIOUS_REQUEST, {
            //     action: 'Invalid password reset token used',
            //     token: token.substring(0, 8) + '...', // Log partial token for investigation
            //     severity: 'MEDIUM'
            // }, req);

            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token'
            });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        
        // Clear reset token fields
        user.resetPasswordToken = undefined;
        user.resetPasswordExpiry = undefined;
        
        await user.save();

        // Generate a new auth token for immediate login
        const authToken = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(200).json({
            success: true,
            message: 'Password reset successful',
            data: {
                token: authToken,
                user: {
                    _id: user._id,
                    email: user.email,
                    fullName: user.fullName,
                    role: user.role,
                    isVerified: user.isVerified
                }
            }
        });
    } catch (error) {
        console.error('Password reset error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to reset password'
        });
    }
};

// Logout
exports.logout = (req, res) => {
    // Clear the cookie with proper security settings
    res.cookie('token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
        expires: new Date(0),
        path: '/'
    });

    res.status(200).json({
        success: true,
        message: 'Logged out successfully'
    });
};

// Helper function to send token response
const sendTokenResponse = (user, statusCode, res) => {
    const token = user.generateAuthToken();

    const options = {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        httpOnly: true
    };

    if (process.env.NODE_ENV === 'production') {
        options.secure = true;
    }

    res.status(statusCode)
        .cookie('token', token, options)
        .json({
            success: true,
            token,
            user: {
                id: user._id,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
                isVerified: user.isVerified
            }
        });
};

// Get current user
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate('wishlist', 'name images price'); // Populate wishlist with product details
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                user: {
                    _id: user._id,
                    email: user.email,
                    fullName: user.fullName,
                    phone: user.phone || '',
                    gender: user.gender || '',
                    address: user.address || {},
                    role: user.role,
                    isVerified: user.isVerified,
                    lastLogin: user.lastLogin,
                    profilePicture: user.profilePicture || '',
                    wishlist: user.wishlist || []
                },
                token: req.cookies.token || req.headers.authorization?.split(' ')[1]
            }
        });
    } catch (error) {
        console.error('Get me error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user data'
        });
    }
}; 