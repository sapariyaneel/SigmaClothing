const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { createPayment, verifyPayment } = require('../controllers/payment.controller');

// Create payment order
router.post('/create-payment', protect, createPayment);

// Verify payment
router.post('/verify-payment', protect, verifyPayment);

module.exports = router; 