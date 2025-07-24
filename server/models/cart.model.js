const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity cannot be less than 1']
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
});

const cartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    items: [cartItemSchema],
    totalAmount: {
        type: Number,
        default: 0
    },
    totalItems: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Calculate totals before saving
cartSchema.pre('save', function(next) {
    if (this.items.length > 0) {
        this.totalAmount = this.items.reduce((total, item) => total + item.totalPrice, 0);
        this.totalItems = this.items.reduce((total, item) => total + item.quantity, 0);
    } else {
        this.totalAmount = 0;
        this.totalItems = 0;
    }
    next();
});

// Method to check if item exists in cart
cartSchema.methods.itemExists = function(productId, size) {
    return this.items.findIndex(item => 
        item.productId.toString() === productId.toString() && 
        (!size || item.size === size)
    );
};

const Cart = mongoose.model('Cart', cartSchema);
module.exports = Cart; 