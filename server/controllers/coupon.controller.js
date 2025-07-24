const Coupon = require('../models/coupon.model');
const Cart = require('../models/cart.model');

// Get all coupons (Admin only)
exports.getAllCoupons = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        const filter = {};
        
        // Add search filter if provided
        if (req.query.search) {
            filter.$or = [
                { code: { $regex: req.query.search, $options: 'i' } },
                { description: { $regex: req.query.search, $options: 'i' } }
            ];
        }
        
        // Add status filter if provided
        if (req.query.status !== undefined) {
            filter.isActive = req.query.status === 'true';
        }

        const [coupons, totalCoupons] = await Promise.all([
            Coupon.find(filter)
                .populate('createdBy', 'fullName email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Coupon.countDocuments(filter)
        ]);

        res.status(200).json({
            success: true,
            data: {
                coupons,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(totalCoupons / limit),
                    totalCoupons,
                    hasNext: page < Math.ceil(totalCoupons / limit),
                    hasPrev: page > 1
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching coupons',
            error: error.message
        });
    }
};

// Get single coupon by ID (Admin only)
exports.getCouponById = async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id)
            .populate('createdBy', 'fullName email')
            .populate('excludedProducts', 'name');

        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: 'Coupon not found'
            });
        }

        res.status(200).json({
            success: true,
            data: coupon
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching coupon',
            error: error.message
        });
    }
};

// Create new coupon (Admin only)
exports.createCoupon = async (req, res) => {
    try {
        const couponData = {
            ...req.body,
            createdBy: req.user._id
        };

        // Ensure code is uppercase
        if (couponData.code) {
            couponData.code = couponData.code.toUpperCase();
        }

        // Check if coupon code already exists
        const existingCoupon = await Coupon.findOne({ code: couponData.code });
        if (existingCoupon) {
            return res.status(400).json({
                success: false,
                message: 'Coupon code already exists'
            });
        }

        const coupon = new Coupon(couponData);
        await coupon.save();

        await coupon.populate('createdBy', 'fullName email');

        res.status(201).json({
            success: true,
            message: 'Coupon created successfully',
            data: coupon
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error creating coupon',
            error: error.message
        });
    }
};

// Update coupon (Admin only)
exports.updateCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);

        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: 'Coupon not found'
            });
        }

        // Check if code is being changed and if new code already exists
        if (req.body.code && req.body.code.toUpperCase() !== coupon.code) {
            const existingCoupon = await Coupon.findOne({
                code: req.body.code.toUpperCase(),
                _id: { $ne: coupon._id }
            });
            if (existingCoupon) {
                return res.status(400).json({
                    success: false,
                    message: 'Coupon code already exists'
                });
            }
        }

        // Ensure code is uppercase if provided
        if (req.body.code) {
            req.body.code = req.body.code.toUpperCase();
        }

        Object.assign(coupon, req.body);
        await coupon.save();

        await coupon.populate('createdBy', 'fullName email');

        res.status(200).json({
            success: true,
            message: 'Coupon updated successfully',
            data: coupon
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error updating coupon',
            error: error.message
        });
    }
};

// Delete coupon (Admin only)
exports.deleteCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);

        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: 'Coupon not found'
            });
        }

        // Check if coupon has been used
        if (coupon.usedCount > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete coupon that has been used. Consider deactivating it instead.'
            });
        }

        await Coupon.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Coupon deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting coupon',
            error: error.message
        });
    }
};

// Toggle coupon status (Admin only)
exports.toggleCouponStatus = async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);

        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: 'Coupon not found'
            });
        }

        coupon.isActive = !coupon.isActive;
        await coupon.save();

        res.status(200).json({
            success: true,
            message: `Coupon ${coupon.isActive ? 'activated' : 'deactivated'} successfully`,
            data: coupon
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating coupon status',
            error: error.message
        });
    }
};

// Validate coupon (Public - for checkout)
exports.validateCoupon = async (req, res) => {
    try {
        const { code } = req.body;
        const userId = req.user._id;

        if (!code) {
            return res.status(400).json({
                success: false,
                message: 'Coupon code is required'
            });
        }

        // Find coupon by code
        const coupon = await Coupon.findOne({ code: code.toUpperCase() });

        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: 'Invalid coupon code'
            });
        }

        // Get user's cart to calculate total and check items
        const cart = await Cart.findOne({ userId }).populate('items.productId', 'category');
        
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Cart is empty'
            });
        }

        // Validate coupon for this order
        const validation = coupon.validateForOrder(cart.totalAmount, userId, cart.items);

        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                message: validation.errors[0] // Return first error
            });
        }

        res.status(200).json({
            success: true,
            message: 'Coupon is valid',
            data: {
                coupon: {
                    code: coupon.code,
                    description: coupon.description,
                    discountType: coupon.discountType,
                    discountValue: coupon.discountValue
                },
                discountAmount: validation.discountAmount,
                finalAmount: cart.totalAmount - validation.discountAmount
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error validating coupon',
            error: error.message
        });
    }
};

// Get coupon usage statistics (Admin only)
exports.getCouponStats = async (req, res) => {
    try {
        const stats = await Coupon.aggregate([
            {
                $group: {
                    _id: null,
                    totalCoupons: { $sum: 1 },
                    activeCoupons: {
                        $sum: {
                            $cond: [{ $eq: ['$isActive', true] }, 1, 0]
                        }
                    },
                    totalUsage: { $sum: '$usedCount' },
                    totalDiscountGiven: {
                        $sum: {
                            $reduce: {
                                input: '$usageHistory',
                                initialValue: 0,
                                in: { $add: ['$$value', '$$this.discountAmount'] }
                            }
                        }
                    }
                }
            }
        ]);

        const result = stats[0] || {
            totalCoupons: 0,
            activeCoupons: 0,
            totalUsage: 0,
            totalDiscountGiven: 0
        };

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching coupon statistics',
            error: error.message
        });
    }
};
