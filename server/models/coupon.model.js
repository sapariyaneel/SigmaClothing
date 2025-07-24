const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: [true, 'Coupon code is required'],
        unique: true,
        trim: true,
        uppercase: true,
        minlength: [3, 'Coupon code must be at least 3 characters'],
        maxlength: [20, 'Coupon code cannot exceed 20 characters'],
        match: [/^[A-Z0-9]+$/, 'Coupon code can only contain uppercase letters and numbers']
    },
    description: {
        type: String,
        required: [true, 'Coupon description is required'],
        trim: true,
        maxlength: [200, 'Description cannot exceed 200 characters']
    },
    discountType: {
        type: String,
        required: [true, 'Discount type is required'],
        enum: {
            values: ['percentage', 'fixed'],
            message: 'Discount type must be either percentage or fixed'
        }
    },
    discountValue: {
        type: Number,
        required: [true, 'Discount value is required'],
        min: [0, 'Discount value cannot be negative'],
        validate: {
            validator: function(value) {
                if (this.discountType === 'percentage') {
                    return value <= 100;
                }
                return true;
            },
            message: 'Percentage discount cannot exceed 100%'
        }
    },
    minimumOrderAmount: {
        type: Number,
        default: 0,
        min: [0, 'Minimum order amount cannot be negative']
    },
    maximumDiscountAmount: {
        type: Number,
        min: [0, 'Maximum discount amount cannot be negative'],
        validate: {
            validator: function(value) {
                // Only validate if discountType is percentage and value is provided
                if (this.discountType === 'percentage' && value !== undefined && value !== null) {
                    return value > 0;
                }
                return true;
            },
            message: 'Maximum discount amount must be greater than 0 for percentage discounts'
        }
    },
    usageLimit: {
        type: Number,
        default: null, // null means unlimited usage
        min: [1, 'Usage limit must be at least 1']
    },
    usedCount: {
        type: Number,
        default: 0,
        min: [0, 'Used count cannot be negative']
    },
    userUsageLimit: {
        type: Number,
        default: 1, // How many times a single user can use this coupon
        min: [1, 'User usage limit must be at least 1']
    },
    validFrom: {
        type: Date,
        required: [true, 'Valid from date is required'],
        default: Date.now
    },
    validUntil: {
        type: Date,
        required: [true, 'Valid until date is required'],
        validate: {
            validator: function(value) {
                const validFromDate = new Date(this.validFrom);
                const validUntilDate = new Date(value);
                return validUntilDate > validFromDate;
            },
            message: 'Valid until date must be after valid from date'
        }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    applicableCategories: [{
        type: String,
        enum: ['men', 'women', 'accessories'],
        message: 'Invalid category'
    }], // Empty array means applicable to all categories
    excludedProducts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    usageHistory: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        orderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order',
            required: true
        },
        discountAmount: {
            type: Number,
            required: true
        },
        usedAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

// Index for efficient queries (code index is already created by unique: true)
couponSchema.index({ isActive: 1, validFrom: 1, validUntil: 1 });
couponSchema.index({ createdBy: 1 });

// Virtual for checking if coupon is currently valid
couponSchema.virtual('isCurrentlyValid').get(function() {
    const now = new Date();
    return this.isActive && 
           this.validFrom <= now && 
           this.validUntil >= now &&
           (this.usageLimit === null || this.usedCount < this.usageLimit);
});

// Method to check if user can use this coupon
couponSchema.methods.canUserUseCoupon = function(userId) {
    const userUsages = this.usageHistory.filter(usage => 
        usage.userId.toString() === userId.toString()
    );
    return userUsages.length < this.userUsageLimit;
};

// Method to calculate discount amount for given order total
couponSchema.methods.calculateDiscount = function(orderTotal) {
    if (orderTotal < this.minimumOrderAmount) {
        return 0;
    }

    let discountAmount = 0;
    
    if (this.discountType === 'percentage') {
        discountAmount = (orderTotal * this.discountValue) / 100;
        
        // Apply maximum discount limit if specified
        if (this.maximumDiscountAmount && discountAmount > this.maximumDiscountAmount) {
            discountAmount = this.maximumDiscountAmount;
        }
    } else if (this.discountType === 'fixed') {
        discountAmount = Math.min(this.discountValue, orderTotal);
    }

    return Math.round(discountAmount * 100) / 100; // Round to 2 decimal places
};

// Method to validate coupon for a specific order
couponSchema.methods.validateForOrder = function(orderTotal, userId, cartItems = []) {
    const errors = [];

    // Check if coupon is active
    if (!this.isActive) {
        errors.push('Coupon is not active');
    }

    // Check date validity
    const now = new Date();
    if (this.validFrom > now) {
        errors.push('Coupon is not yet valid');
    }
    if (this.validUntil < now) {
        errors.push('Coupon has expired');
    }

    // Check usage limits
    if (this.usageLimit !== null && this.usedCount >= this.usageLimit) {
        errors.push('Coupon usage limit exceeded');
    }

    // Check user usage limit
    if (!this.canUserUseCoupon(userId)) {
        errors.push('You have already used this coupon the maximum number of times');
    }

    // Check minimum order amount
    if (orderTotal < this.minimumOrderAmount) {
        errors.push(`Minimum order amount of ₹${this.minimumOrderAmount} required`);
    }

    // Check category restrictions if specified
    if (this.applicableCategories.length > 0 && cartItems.length > 0) {
        const hasApplicableItems = cartItems.some(item => 
            this.applicableCategories.includes(item.productId.category)
        );
        if (!hasApplicableItems) {
            errors.push('Coupon not applicable to items in your cart');
        }
    }

    return {
        isValid: errors.length === 0,
        errors,
        discountAmount: errors.length === 0 ? this.calculateDiscount(orderTotal) : 0
    };
};

// Pre-save middleware to ensure code is uppercase
couponSchema.pre('save', function(next) {
    if (this.isModified('code')) {
        this.code = this.code.toUpperCase();
    }
    next();
});

// Ensure virtuals are included in JSON
couponSchema.set('toJSON', { virtuals: true });
couponSchema.set('toObject', { virtuals: true });

const Coupon = mongoose.model('Coupon', couponSchema);
module.exports = Coupon;
