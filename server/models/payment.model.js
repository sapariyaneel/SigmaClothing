const mongoose = require('mongoose');

const paymentMethodSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    cardHolderName: {
        type: String,
        required: true,
        trim: true
    },
    lastFourDigits: {
        type: String,
        required: true,
        length: 4
    },
    encryptedCardNumber: {
        type: String,
        required: true
    },
    cardNumberIV: {
        type: String,
        required: true
    },
    expiryDate: {
        type: String,
        required: true,
        match: /^(0[1-9]|1[0-2])\/([0-9]{2})$/
    },
    isDefault: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Index for faster queries
paymentMethodSchema.index({ userId: 1 });

// Ensure user can't see sensitive data
paymentMethodSchema.methods.toJSON = function() {
    const obj = this.toObject();
    delete obj.encryptedCardNumber;
    delete obj.cardNumberIV;
    return obj;
};

module.exports = mongoose.model('PaymentMethod', paymentMethodSchema); 