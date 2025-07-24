const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { check } = require('express-validator');
const { validateObjectId } = require('../middleware/validation.middleware');
const multer = require('multer');
const path = require('path');
const { 
    updateProfile, 
    uploadProfilePicture,
    updatePaymentMethod,
    deletePaymentMethod,
    getPaymentMethods,
    getOrderHistory,
    changePassword,
    deleteAccount
} = require('../controllers/user.controller');

// Configure multer for profile picture uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '..', 'uploads/profiles'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
    }
});

// Validation middleware
const updateProfileValidation = [
    check('fullName')
        .optional({ checkFalsy: true })
        .isLength({ min: 2, max: 50 })
        .withMessage('Full name must be between 2 and 50 characters')
        .trim(),
    check('phone')
        .optional({ checkFalsy: true })
        .matches(/^[0-9]{10}$/)
        .withMessage('Please enter a valid 10-digit phone number'),
    check('gender')
        .optional({ checkFalsy: true })
        .isIn(['male', 'female', 'other'])
        .withMessage('Gender must be either male, female, or other'),
    check('address.street')
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ max: 100 })
        .withMessage('Street address must not exceed 100 characters'),
    check('address.landmark')
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ max: 100 })
        .withMessage('Landmark must not exceed 100 characters'),
    check('address.city')
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ max: 50 })
        .withMessage('City must not exceed 50 characters'),
    check('address.state')
        .optional({ checkFalsy: true })
        .trim()
        .isIn([
            'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
            'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
            'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
            'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
            'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
            'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
            'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
            'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
        ])
        .withMessage('Please select a valid Indian state'),
    check('address.zipCode')
        .optional({ checkFalsy: true })
        .trim()
        .matches(/^[0-9]{6}$/)
        .withMessage('Please enter a valid 6-digit ZIP code'),
    check('email').not().exists().withMessage('Email cannot be updated'),
    check('password').not().exists().withMessage('Password cannot be updated through this route'),
    check('role').not().exists().withMessage('Role cannot be updated through this route')
];

// Payment method validation
const paymentMethodValidation = [
    check('cardNumber')
        .isLength({ min: 16, max: 16 })
        .withMessage('Card number must be 16 digits')
        .matches(/^[0-9]{16}$/)
        .withMessage('Invalid card number format'),
    check('cardHolderName')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Card holder name must be between 2 and 50 characters'),
    check('expiryDate')
        .matches(/^(0[1-9]|1[0-2])\/([0-9]{2})$/)
        .withMessage('Expiry date must be in MM/YY format'),
];

// Password change validation
const changePasswordValidation = [
    check('currentPassword')
        .notEmpty()
        .withMessage('Current password is required'),
    check('newPassword')
        .isLength({ min: 8 })
        .withMessage('New password must be at least 8 characters long')
        .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number and one special character'),
    check('confirmPassword')
        .custom((value, { req }) => {
            if (value !== req.body.newPassword) {
                throw new Error('Password confirmation does not match password');
            }
            return true;
        })
];

// Routes
router.put('/profile', protect, updateProfileValidation, updateProfile);
router.post('/profile/picture', protect, upload.single('profilePicture'), uploadProfilePicture);

// Payment method routes
router.post('/payment-methods', protect, paymentMethodValidation, updatePaymentMethod);
router.get('/payment-methods', protect, getPaymentMethods);
router.delete('/payment-methods/:id', protect, validateObjectId('id'), deletePaymentMethod);

// Order history route
router.get('/orders', protect, getOrderHistory);

// Password change route
router.post('/change-password', protect, changePasswordValidation, changePassword);

// Account deletion route
router.delete('/account', protect, deleteAccount);

module.exports = router; 