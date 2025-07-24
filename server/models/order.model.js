const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        size: {
            type: String,
            enum: {
                values: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'Free Size'],
                message: 'Please select valid size'
            }
        },
        price: {
            type: Number,
            required: true
        },
        totalPrice: {
            type: Number,
            required: true
        }
    }],
    totalAmount: {
        type: Number,
        required: true
    },
    subtotalAmount: {
        type: Number,
        required: true
    },
    discountAmount: {
        type: Number,
        default: 0
    },
    appliedCoupon: {
        couponId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Coupon'
        },
        code: {
            type: String,
            uppercase: true
        },
        discountType: {
            type: String,
            enum: ['percentage', 'fixed']
        },
        discountValue: {
            type: Number
        },
        discountAmount: {
            type: Number
        }
    },
    shippingAddress: {
        fullName: {
            type: String,
            required: false  // Made optional for backward compatibility
        },
        email: {
            type: String,
            required: false  // Made optional for backward compatibility
        },
        phone: {
            type: String,
            required: false  // Made optional for backward compatibility
        },
        street: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        zipCode: {
            type: String,
            required: true
        },
        country: {
            type: String,
            required: true
        }
    },
    paymentInfo: {
        razorpayOrderId: {
            type: String,
            required: true
        },
        razorpayPaymentId: {
            type: String
        },
        status: {
            type: String,
            enum: ['pending', 'completed', 'failed', 'refunded'],
            default: 'pending'
        },
        method: {
            type: String,
            required: true
        },
        amountPaid: {
            type: Number,
            required: true
        }
    },
    orderStatus: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    deliveryInfo: {
        trackingNumber: String,
        courier: String,
        estimatedDelivery: Date
    },
    statusHistory: [{
        status: {
            type: String,
            required: true
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        note: String
    }]
}, {
    timestamps: true
});

// Pre-save middleware to update status history
orderSchema.pre('save', function(next) {
    if (this.isModified('orderStatus')) {
        this.statusHistory.push({
            status: this.orderStatus,
            timestamp: new Date()
        });
    }
    next();
});

// Method to check if order can be cancelled
orderSchema.methods.canBeCancelled = function() {
    const nonCancellableStatuses = ['shipped', 'delivered', 'cancelled'];
    return !nonCancellableStatuses.includes(this.orderStatus);
};

// Method to calculate refund amount
orderSchema.methods.calculateRefundAmount = function() {
    // Add custom refund calculation logic here
    return this.totalAmount;
};

// Virtual for order number
orderSchema.virtual('orderNumber').get(function() {
    return `ORD${this._id.toString().slice(-6).toUpperCase()}`;
});

// Ensure virtuals are included in JSON
orderSchema.set('toJSON', { virtuals: true });
orderSchema.set('toObject', { virtuals: true });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order; 