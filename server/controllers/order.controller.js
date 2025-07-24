const Order = require('../models/order.model');
const Cart = require('../models/cart.model');
const Product = require('../models/product.model');
const Coupon = require('../models/coupon.model');
const Razorpay = require('razorpay');
const { sendOrderConfirmation } = require('../services/email.service');
const emailService = require('../services/email.service');
const crypto = require('crypto');

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create payment
exports.createPayment = async (req, res) => {
    try {
        const { amount, cartItems } = req.body;

        if (!amount || !cartItems) {
            return res.status(400).json({
                success: false,
                message: 'Amount and cart items are required'
            });
        }

        // Validate amount against cart items
        let calculatedTotal = 0;
        for (const item of cartItems) {
            const product = await Product.findById(item.productId);
            if (!product) {
                return res.status(400).json({
                    success: false,
                    message: `Product not found: ${item.productId}`
                });
            }

            const actualPrice = product.discountPrice || product.price;
            calculatedTotal += actualPrice * item.quantity;
        }

        // Validate the amount matches calculated total
        if (Math.abs(amount - calculatedTotal) > 0.01) {
            return res.status(400).json({
                success: false,
                message: 'Amount validation failed'
            });
        }

        // Create Razorpay order
        const razorpayOrder = await razorpay.orders.create({
            amount: amount * 100, // Convert to paise
            currency: 'INR',
            receipt: `order_${Date.now()}`
        });

        res.status(200).json({
            success: true,
            data: {
                id: razorpayOrder.id,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to create payment'
        });
    }
};

// Create a new order
exports.createOrder = async (req, res) => {
    try {
        const orderData = {
            ...req.body,
            userId: req.user._id
        };

        // Validate order items and prices against database with atomic stock check
        let calculatedTotal = 0;
        const stockUpdates = [];

        for (const item of orderData.items) {
            const product = await Product.findById(item.productId);
            if (!product) {
                return res.status(400).json({
                    success: false,
                    message: `Product not found: ${item.productId}`
                });
            }

            // Check stock availability
            if (product.stock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for product: ${product.name}`
                });
            }

            // Validate price (use current product price, not client-provided price)
            const actualPrice = product.discountPrice || product.price;
            if (Math.abs(item.price - actualPrice) > 0.01) { // Allow for minor floating point differences
                return res.status(400).json({
                    success: false,
                    message: `Price mismatch for product: ${product.name}`
                });
            }

            // Calculate actual total
            calculatedTotal += actualPrice * item.quantity;

            // Update item with validated price
            item.price = actualPrice;
            item.totalPrice = actualPrice * item.quantity;

            // Prepare atomic stock update
            stockUpdates.push({
                productId: item.productId,
                quantity: item.quantity
            });
        }

        // Handle coupon validation and application
        let finalTotal = calculatedTotal;
        let discountAmount = 0;
        let appliedCouponData = null;

        if (orderData.appliedCoupon && orderData.appliedCoupon.code) {
            const coupon = await Coupon.findOne({
                code: orderData.appliedCoupon.code.toUpperCase(),
                isActive: true
            });

            if (!coupon) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid coupon code'
                });
            }

            // Prepare items with populated product data for coupon validation
            const itemsForValidation = [];
            for (const item of orderData.items) {
                const product = await Product.findById(item.productId);
                if (product) {
                    itemsForValidation.push({
                        ...item,
                        productId: {
                            _id: product._id,
                            category: product.category
                        }
                    });
                }
            }

            // Validate coupon for this order
            const validation = coupon.validateForOrder(calculatedTotal, req.user._id, itemsForValidation);

            if (!validation.isValid) {
                return res.status(400).json({
                    success: false,
                    message: validation.errors[0]
                });
            }

            discountAmount = validation.discountAmount;
            finalTotal = calculatedTotal - discountAmount;

            // Store coupon information for the order
            appliedCouponData = {
                couponId: coupon._id,
                code: coupon.code,
                discountType: coupon.discountType,
                discountValue: coupon.discountValue,
                discountAmount: discountAmount
            };

            // Update coupon usage count only (we'll add usage history after order creation)
            coupon.usedCount += 1;
            await coupon.save();
        }

        // Update order data with coupon information
        orderData.subtotalAmount = calculatedTotal;
        orderData.discountAmount = discountAmount;
        orderData.totalAmount = finalTotal;
        if (appliedCouponData) {
            orderData.appliedCoupon = appliedCouponData;
        }

        // Validate final total amount
        if (Math.abs(orderData.totalAmount - finalTotal) > 0.01) {
            return res.status(400).json({
                success: false,
                message: 'Total amount mismatch after coupon application'
            });
        }

        // Add estimated delivery date (5-7 business days from now)
        const estimatedDelivery = new Date();
        estimatedDelivery.setDate(estimatedDelivery.getDate() + 7); // 7 days for delivery

        // Add delivery info to order data
        orderData.deliveryInfo = {
            ...orderData.deliveryInfo,
            estimatedDelivery: estimatedDelivery
        };

        // Create order with validated data
        const order = await Order.create(orderData);

        // Add coupon usage history with order ID if coupon was applied
        if (appliedCouponData) {
            await Coupon.findByIdAndUpdate(
                appliedCouponData.couponId,
                {
                    $push: {
                        usageHistory: {
                            userId: req.user._id,
                            orderId: order._id,
                            discountAmount: discountAmount,
                            usedAt: new Date()
                        }
                    }
                }
            );
        }

        // Populate necessary fields for email
        await order.populate([
            {
                path: 'items.productId',
                select: 'name images price'
            },
            {
                path: 'userId',
                select: 'email fullName'
            }
        ]);



        // Create user object with shipping address details for email
        const userForEmail = {
            email: orderData.shippingAddress.email,
            fullName: orderData.shippingAddress.fullName
        };

        // Send confirmation email
        try {
            await sendOrderConfirmation({
                email: userForEmail.email,
                _id: order._id,
                totalAmount: order.totalAmount,
                orderStatus: order.orderStatus
            });
        } catch (emailError) {
            // Email sending failed - continue without blocking order creation
        }

        // Atomically reduce stock for ordered items to prevent race conditions
        for (const update of stockUpdates) {
            const result = await Product.findOneAndUpdate(
                {
                    _id: update.productId,
                    stock: { $gte: update.quantity } // Ensure stock is still available
                },
                { $inc: { stock: -update.quantity } },
                { new: true }
            );

            // If stock update failed, it means another order consumed the stock
            if (!result) {
                // Rollback any previous stock reductions
                for (let i = 0; i < stockUpdates.indexOf(update); i++) {
                    const rollbackUpdate = stockUpdates[i];
                    await Product.findByIdAndUpdate(
                        rollbackUpdate.productId,
                        { $inc: { stock: rollbackUpdate.quantity } }
                    );
                }

                return res.status(400).json({
                    success: false,
                    message: 'Product stock was updated by another order. Please try again.'
                });
            }

            // Check if stock has fallen below threshold and send low stock alert
            if (result.stock <= 10) {
                try {
                    await emailService.sendLowStockAlert(result);
                    console.log(`Low stock alert sent for product: ${result.name} (Stock: ${result.stock})`);
                } catch (emailError) {
                    console.error('Failed to send low stock alert:', emailError.message);
                    // Don't fail order creation if email fails
                }
            }
        }

        // Clear cart after successful order
        await Cart.findOneAndUpdate(
            { userId: req.user._id },
            { $set: { items: [] } }
        );

        res.status(201).json({
            success: true,
            data: order
        });
    } catch (error) {
        console.error('Order creation error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Verify payment and update order status
exports.verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;



        // Find order and verify ownership
        const order = await Order.findOne({
            'paymentInfo.razorpayOrderId': razorpay_order_id,
            userId: req.user._id  // Ensure order belongs to authenticated user
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Verify signature
        const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
        hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
        const generatedSignature = hmac.digest('hex');

        if (generatedSignature !== razorpay_signature) {
            order.paymentInfo.status = 'failed';
            await order.save();

            return res.status(400).json({
                success: false,
                message: 'Payment verification failed'
            });
        }

        if (process.env.NODE_ENV === 'development') {
            console.log('Payment signature verified successfully');
        }

        // Update order
        order.paymentInfo.status = 'completed';
        order.paymentInfo.razorpayPaymentId = razorpay_payment_id;
        order.orderStatus = 'processing';
        await order.save();

        // Populate order for email
        await order.populate([
            {
                path: 'items.productId',
                select: 'name images price'
            },
            {
                path: 'userId',
                select: 'email fullName'
            }
        ]);

        // Create user object with shipping address details for email
        const userForEmail = {
            email: order.shippingAddress.email,
            fullName: order.shippingAddress.fullName
        };

        // Send confirmation email
        try {
            await sendOrderConfirmation({
                email: userForEmail.email,
                _id: order._id,
                totalAmount: order.totalAmount,
                orderStatus: order.orderStatus
            });
        } catch (emailError) {
            // Email sending failed - continue without blocking order processing
        }

        res.status(200).json({
            success: true,
            data: order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get user's orders
exports.getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user._id })
            .populate('items.productId', 'name images')
            .sort('-createdAt');

        res.status(200).json({
            success: true,
            data: orders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get single order
exports.getOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('userId', 'fullName email phone')
            .populate('items.productId', 'name images');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check if order belongs to user or user is admin
        if (order.userId._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to access this order'
            });
        }

        res.status(200).json({
            success: true,
            data: order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Cancel order
exports.cancelOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check if order belongs to user
        if (order.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to cancel this order'
            });
        }

        // Check if order can be cancelled
        if (!order.canBeCancelled()) {
            return res.status(400).json({
                success: false,
                message: 'Order cannot be cancelled'
            });
        }

        // Update order status
        order.orderStatus = 'cancelled';
        
        // If payment was completed, mark for refund
        if (order.paymentInfo.status === 'completed') {
            order.paymentInfo.status = 'refunded';
        }

        await order.save();

        // Restore product stock
        for (const item of order.items) {
            await Product.findByIdAndUpdate(item.productId, {
                $inc: { stock: item.quantity }
            });
        }

        // Send cancellation email (don't block cancellation if email fails)
        try {
            await emailService.sendOrderCancellation(order);
            console.log(`Order cancellation email sent successfully for order ${order._id}`);
        } catch (emailError) {
            console.error('Failed to send order cancellation email:', emailError.message);
            // Don't fail cancellation if email fails
        }

        res.status(200).json({
            success: true,
            data: order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get all orders (admin only)
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('userId', 'fullName email')
            .populate('items.productId', 'name images')
            .sort('-createdAt')
            .lean(); // Convert to plain JavaScript objects

        res.status(200).json({
            success: true,
            data: orders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update order status (admin only)
exports.updateOrderStatus = async (req, res) => {
    try {
        const { orderStatus } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Validate status - admins can change to any valid status except some restrictions
        const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

        if (!validStatuses.includes(orderStatus)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid order status'
            });
        }

        // Prevent changing from delivered/cancelled back to earlier states (optional business rule)
        // Comment out these lines if you want full admin flexibility
        /*
        if ((order.orderStatus === 'delivered' || order.orderStatus === 'cancelled') &&
            (orderStatus === 'pending' || orderStatus === 'processing' || orderStatus === 'shipped')) {
            return res.status(400).json({
                success: false,
                message: 'Cannot change status from delivered/cancelled to earlier states'
            });
        }
        */

        order.orderStatus = orderStatus;

        // Set estimated delivery date when order is shipped (if not already set)
        if (orderStatus === 'shipped' && !order.deliveryInfo?.estimatedDelivery) {
            const estimatedDelivery = new Date();
            estimatedDelivery.setDate(estimatedDelivery.getDate() + 3); // 3 days from shipping

            if (!order.deliveryInfo) {
                order.deliveryInfo = {};
            }
            order.deliveryInfo.estimatedDelivery = estimatedDelivery;
        }

        await order.save();

        // Send response immediately
        res.status(200).json({
            success: true,
            data: order
        });

        // Send status update email asynchronously (truly non-blocking)
        setImmediate(async () => {
            try {
                // Populate order with user details for email
                const populatedOrder = await order.populate('userId', 'email fullName');
                await emailService.sendOrderStatusUpdate(populatedOrder);
            } catch (emailError) {
                // Email sending failed - log but don't affect the response
                console.log('Email sending failed:', emailError.message);
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};