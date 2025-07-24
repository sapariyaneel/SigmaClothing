const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { check } = require('express-validator');
const { handleValidationErrors, sanitizeInput } = require('../middleware/validation.middleware');
const {
    register,
    login,
    logout,
    verifyEmail,
    forgotPassword,
    resetPassword,
    getMe
} = require('../controllers/auth.controller');
const { sendEmail } = require('../services/email.service');
const User = require('../models/user.model');

// Validation middleware
const registerValidation = [
    check('email')
        .isEmail()
        .withMessage('Please enter a valid email address'),
    check('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number and one special character'),
    check('fullName')
        .notEmpty()
        .withMessage('Full name is required')
        .isLength({ min: 2, max: 50 })
        .withMessage('Full name must be between 2 and 50 characters'),
    check('phone')
        .optional()
        .matches(/^[0-9]{10}$/)
        .withMessage('Please enter a valid 10-digit phone number')
];

const loginValidation = [
    check('email')
        .isEmail()
        .withMessage('Please enter a valid email address'),
    check('password')
        .notEmpty()
        .withMessage('Password is required')
];

const forgotPasswordValidation = [
    check('email')
        .isEmail()
        .withMessage('Please enter a valid email address')
];

// Public routes with input sanitization
router.post('/register', sanitizeInput, registerValidation, handleValidationErrors, register);
router.post('/login', sanitizeInput, loginValidation, handleValidationErrors, login);
router.post('/logout', logout);
router.get('/verify-email/:token', sanitizeInput, verifyEmail);
router.post('/forgot-password', sanitizeInput, forgotPasswordValidation, handleValidationErrors, forgotPassword);
router.put('/reset-password/:token', sanitizeInput, [
    check('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number and one special character')
], handleValidationErrors, resetPassword);

// Protected routes
router.use(protect);
router.use(sanitizeInput);
router.get('/me', getMe);

// Test email route (development only)
if (process.env.NODE_ENV === 'development') {
    router.post('/test-email', async (req, res) => {
        try {
            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const testEmail = req.body.email;

            if (!testEmail || !emailRegex.test(testEmail)) {
                return res.status(400).json({
                    success: false,
                    message: 'Valid email address required'
                });
            }

            const mailOptions = {
                to: testEmail,
                subject: "✅ Test Email from Sigma Clothing - Configuration Successful",
                html: `
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="utf-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Test Email - Sigma Clothing</title>
                        <style>
                            body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; margin: 0; padding: 20px; background-color: #f8f9fa; }
                            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                            .header { background: linear-gradient(135deg, #000000 0%, #2c2c2c 100%); color: white; padding: 30px; text-align: center; }
                            .logo { font-size: 28px; font-weight: 700; letter-spacing: 2px; margin-bottom: 8px; }
                            .tagline { font-size: 14px; opacity: 0.8; }
                            .body { padding: 30px; }
                            .success-icon { font-size: 48px; text-align: center; margin-bottom: 20px; }
                            .title { font-size: 24px; font-weight: 600; color: #1a1a1a; margin-bottom: 16px; text-align: center; }
                            .message { font-size: 16px; color: #4a5568; line-height: 1.6; margin-bottom: 20px; }
                            .info-box { background: #e6f3ff; border-left: 4px solid #0066cc; padding: 20px; border-radius: 8px; margin: 20px 0; }
                            .footer { background: #1a1a1a; color: white; padding: 20px; text-align: center; font-size: 12px; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="header">
                                <div class="logo">SIGMA</div>
                                <div class="tagline">Premium Fashion & Lifestyle</div>
                            </div>
                            <div class="body">
                                <div class="success-icon">✅</div>
                                <div class="title">Email Configuration Test Successful!</div>
                                <p class="message">
                                    Congratulations! This test email confirms that your Sigma Clothing email system is properly configured and working correctly.
                                </p>
                                <div class="info-box">
                                    <strong>Test Details:</strong><br>
                                    • Email service: Active and functional<br>
                                    • SMTP configuration: Verified<br>
                                    • Template rendering: Working<br>
                                    • Time sent: ${new Date().toLocaleString()}<br>
                                    • Environment: ${process.env.NODE_ENV || 'development'}
                                </div>
                                <p class="message">
                                    Your customers will now receive professional, beautifully formatted emails for order confirmations,
                                    password resets, and other important notifications.
                                </p>
                            </div>
                            <div class="footer">
                                © ${new Date().getFullYear()} Sigma Clothing. All rights reserved.<br>
                                This is a test email sent from the development environment.
                            </div>
                        </div>
                    </body>
                    </html>
                `
            };

            const result = await sendEmail(mailOptions);
            const info = result.info;

            res.json({
                success: true,
                messageId: info.messageId
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to send test email'
            });
        }
    });
}



module.exports = router; 