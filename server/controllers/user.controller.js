const User = require('../models/user.model');
const Order = require('../models/order.model');
const PaymentMethod = require('../models/payment.model');
const { validationResult } = require('express-validator');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

// Helper function to encrypt card details
const encryptCardNumber = (cardNumber) => {
    const algorithm = 'aes-256-cbc';
    const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(cardNumber, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return {
        iv: iv.toString('hex'),
        encryptedData: encrypted
    };
};

// Helper function to decrypt card details
const decryptCardNumber = (encrypted, iv) => {
    const algorithm = 'aes-256-cbc';
    const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
    const decipher = crypto.createDecipheriv(algorithm, key, Buffer.from(iv, 'hex'));
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
};

// Update user profile
exports.updateProfile = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Filter out empty values to allow partial updates
        const filterEmptyValues = (obj) => {
            const filtered = {};
            for (const [key, value] of Object.entries(obj)) {
                if (value !== null && value !== undefined && value !== '') {
                    if (typeof value === 'object' && !Array.isArray(value)) {
                        const nestedFiltered = filterEmptyValues(value);
                        if (Object.keys(nestedFiltered).length > 0) {
                            filtered[key] = nestedFiltered;
                        }
                    } else {
                        filtered[key] = value;
                    }
                }
            }
            return filtered;
        };

        const updateData = filterEmptyValues(req.body);

        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { $set: updateData },
            { new: true }
        ).select('-password');

        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Upload profile picture
exports.uploadProfilePicture = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Delete old profile picture if it exists
        if (user.profilePicture) {
            const oldPicturePath = path.join(__dirname, '..', user.profilePicture);
            try {
                await fs.unlink(oldPicturePath);
            } catch (error) {
                console.error('Error deleting old profile picture:', error);
            }
        }

        // Update user profile picture path
        const profilePicturePath = '/uploads/profiles/' + req.file.filename;
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { $set: { profilePicture: profilePicturePath } },
            { new: true }
        ).select('-password');

        res.json(updatedUser);
    } catch (error) {
        console.error('Profile picture upload error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Add/Update payment method
exports.updatePaymentMethod = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { cardNumber, cardHolderName, expiryDate } = req.body;
        
        // Encrypt card number
        const { iv, encryptedData } = encryptCardNumber(cardNumber);
        
        const paymentMethod = await PaymentMethod.create({
            userId: req.user._id,
            cardHolderName,
            lastFourDigits: cardNumber.slice(-4),
            encryptedCardNumber: encryptedData,
            cardNumberIV: iv,
            expiryDate
        });

        // Only return safe data
        const safePaymentMethod = {
            id: paymentMethod._id,
            cardHolderName: paymentMethod.cardHolderName,
            lastFourDigits: paymentMethod.lastFourDigits,
            expiryDate: paymentMethod.expiryDate
        };

        res.json(safePaymentMethod);
    } catch (error) {
        console.error('Payment method update error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get payment methods
exports.getPaymentMethods = async (req, res) => {
    try {
        const paymentMethods = await PaymentMethod.find({ userId: req.user._id })
            .select('cardHolderName lastFourDigits expiryDate');

        res.status(200).json({
            success: true,
            data: paymentMethods
        });
    } catch (error) {
        console.error('Get payment methods error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Delete payment method
exports.deletePaymentMethod = async (req, res) => {
    try {
        // Validate ObjectId format
        if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid payment method ID format'
            });
        }

        const paymentMethod = await PaymentMethod.findOne({
            _id: req.params.id,
            userId: req.user.id
        });

        if (!paymentMethod) {
            return res.status(404).json({
                success: false,
                message: 'Payment method not found or access denied'
            });
        }

        await paymentMethod.remove();

        res.status(200).json({
            success: true,
            message: 'Payment method deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Get order history
exports.getOrderHistory = async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .populate('items.productId', 'name images price')
            .lean(); // Convert to plain JavaScript objects

        // Transform the data to match frontend expectations
        const transformedOrders = orders.map(order => {
            // Generate estimated delivery date for orders that don't have one
            let estimatedDelivery = order.deliveryInfo?.estimatedDelivery;
            if (!estimatedDelivery && order.createdAt) {
                const deliveryDate = new Date(order.createdAt);
                deliveryDate.setDate(deliveryDate.getDate() + 7); // 7 days from order date
                estimatedDelivery = deliveryDate;
            }

            return {
                ...order,
                orderNumber: order.orderNumber || `ORD${order._id.toString().slice(-6).toUpperCase()}`,
                status: order.orderStatus || 'pending',
                expectedDeliveryDate: estimatedDelivery,
                trackingNumber: order.deliveryInfo?.trackingNumber || null
            };
        });

        res.status(200).json({
            success: true,
            data: transformedOrders
        });
    } catch (error) {
        console.error('Get order history error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Change password
exports.changePassword = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user.id).select('+password');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if current password matches
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete account
exports.deleteAccount = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Delete profile picture if exists
        if (user.profilePicture) {
            try {
                const picturePath = path.join(__dirname, '..', user.profilePicture);
                await fs.unlink(picturePath);
            } catch (error) {
                console.error('Error deleting profile picture:', error);
            }
        }

        // Delete all payment methods
        await PaymentMethod.deleteMany({ userId: user._id });

        // Update orders to mark user as deleted but keep order history
        await Order.updateMany(
            { userId: user._id },
            { 
                $set: { 
                    userId: null,
                    userDeleted: true,
                    userEmail: user.email // Keep email for reference
                }
            }
        );

        // Delete user's wishlist and cart references
        await Promise.all([
            User.updateMany(
                { 'wishlist.userId': user._id },
                { $pull: { wishlist: { userId: user._id } } }
            ),
            User.updateMany(
                { 'cart.userId': user._id },
                { $pull: { cart: { userId: user._id } } }
            )
        ]);

        // Finally, delete the user
        await user.remove();

        res.json({ message: 'Account deleted successfully' });
    } catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({ message: 'Server error' });
    }
}; 