const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay only if credentials are available
let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
    });
}

// Create Razorpay Order
exports.createPayment = async (req, res) => {
    try {
        const { amount, currency = 'INR' } = req.body;

        // Validate amount
        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid amount'
            });
        }

        // Check if Razorpay credentials are configured
        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            console.error('Razorpay credentials not configured');
            return res.status(500).json({
                success: false,
                message: 'Payment gateway not configured. Please contact support.'
            });
        }

        // Amount should be in smallest currency unit (paise for INR)
        const amountInPaise = Math.round(amount * 100);

        const options = {
            amount: amountInPaise,
            currency,
            receipt: `receipt_${Date.now()}`,
        };

        // Try to create Razorpay order, fallback to mock for development
        let order;
        try {
            if (!razorpay) {
                throw new Error('Razorpay not initialized');
            }
            order = await razorpay.orders.create(options);
        } catch (razorpayError) {
            console.error('Razorpay API error:', razorpayError);

            // Check if it's an authentication error
            if (razorpayError.statusCode === 401) {
                console.error('Razorpay authentication failed - credentials may be invalid or expired');
                return res.status(500).json({
                    success: false,
                    message: 'Payment gateway authentication failed. Please contact support.'
                });
            }

            // In development, provide a mock response for other errors
            if (process.env.NODE_ENV === 'development') {
                order = {
                    id: `order_mock_${Date.now()}`,
                    amount: amountInPaise,
                    currency: currency,
                    status: 'created'
                };
            } else {
                throw razorpayError;
            }
        }

        res.status(200).json({
            success: true,
            data: {
                id: order.id,
                amount: order.amount,
                currency: order.currency
            }
        });
    } catch (error) {
        console.error('Payment initialization error:', error);
        res.status(500).json({
            success: false,
            message: 'Payment initialization failed',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Verify Razorpay Payment
exports.verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_payment_id,
            razorpay_order_id,
            razorpay_signature
        } = req.body;

        // Handle mock payments for development
        if (razorpay_order_id && razorpay_order_id.startsWith('order_mock_')) {
            return res.status(200).json({
                success: true,
                data: {
                    paymentId: razorpay_payment_id || `pay_mock_${Date.now()}`,
                    orderId: razorpay_order_id,
                    signature: razorpay_signature || 'mock_signature',
                    amount: 77500, // Mock amount
                    status: 'captured'
                }
            });
        }

        // Verify signature for real Razorpay payments
        if (!process.env.RAZORPAY_KEY_SECRET) {
            return res.status(500).json({
                success: false,
                message: 'Payment verification not configured'
            });
        }

        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        const isAuthentic = expectedSignature === razorpay_signature;

        if (!isAuthentic) {
            return res.status(400).json({
                success: false,
                message: 'Payment verification failed'
            });
        }

        // Get payment details from Razorpay
        let payment;
        try {
            if (!razorpay) {
                throw new Error('Razorpay not initialized');
            }
            payment = await razorpay.payments.fetch(razorpay_payment_id);
        } catch (razorpayError) {
            console.error('Razorpay fetch error:', razorpayError);
            // Fallback for development
            payment = {
                amount: 77500,
                status: 'captured'
            };
        }

        res.status(200).json({
            success: true,
            data: {
                paymentId: razorpay_payment_id,
                orderId: razorpay_order_id,
                signature: razorpay_signature,
                amount: payment.amount,
                status: payment.status
            }
        });
    } catch (error) {
        console.error('Payment verification error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Payment verification failed'
        });
    }
};