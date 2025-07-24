const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const { sanitizeInput, validateJSON, validateObjectId } = require('../middleware/validation.middleware');
const {
    getAllCoupons,
    getCouponById,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    toggleCouponStatus,
    validateCoupon,
    getCouponStats
} = require('../controllers/coupon.controller');

// Public routes (require authentication but not admin role)
router.use(protect);
router.use(sanitizeInput);

// Validate coupon for checkout
router.post('/validate', validateJSON, validateCoupon);

// Admin routes (require admin role)
router.use(authorize('admin'));

// Get all coupons with pagination and filtering
router.get('/', getAllCoupons);

// Get coupon statistics
router.get('/stats', getCouponStats);

// Create new coupon
router.post('/', validateJSON, createCoupon);

// Toggle coupon status (activate/deactivate) - must come before /:id routes
router.patch('/:id/toggle-status', validateObjectId('id'), toggleCouponStatus);
router.patch('/:id/status', validateObjectId('id'), toggleCouponStatus);

// Update coupon
router.put('/:id', validateObjectId('id'), validateJSON, updateCoupon);

// Delete coupon
router.delete('/:id', validateObjectId('id'), deleteCoupon);

// Get single coupon by ID - must come after specific routes
router.get('/:id', validateObjectId('id'), getCouponById);

module.exports = router;
