const User = require('../models/user.model');
const Product = require('../models/product.model');

// Get user's wishlist
exports.getWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate({
                path: 'wishlist',
                select: 'name description images price discountPrice stock',
                transform: doc => {
                    if (doc.images) {
                        // Ensure image URLs are properly formatted
                        doc.images = doc.images.map(image => {
                            if (!image) return null;
                            if (image.startsWith('http')) return image;
                            return `${process.env.SERVER_URL}${image.startsWith('/') ? '' : '/'}${image}`;
                        }).filter(Boolean);
                    }
                    return doc;
                }
            });

        res.status(200).json({
            success: true,
            data: user.wishlist
        });
    } catch (error) {
        console.error('Get wishlist error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Add product to wishlist
exports.addToWishlist = async (req, res) => {
    try {
        const { productId } = req.body;

        // Check if product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Get user and check if product is already in wishlist
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Initialize wishlist array if it doesn't exist
        if (!user.wishlist) {
            user.wishlist = [];
        }

        // Check if product is already in wishlist
        if (user.wishlist.includes(productId)) {
            return res.status(400).json({
                success: false,
                message: 'Product already in wishlist'
            });
        }

        // Add to wishlist
        user.wishlist.push(productId);
        await user.save();

        // Get updated wishlist with product details
        const updatedUser = await User.findById(req.user._id)
            .populate('wishlist', 'name description images price discountPrice stock');

        res.status(200).json({
            success: true,
            data: updatedUser.wishlist
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Remove product from wishlist
exports.removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.params;

        const user = await User.findById(req.user._id);
        
        // Check if product is in wishlist
        if (!user.wishlist.includes(productId)) {
            return res.status(404).json({
                success: false,
                message: 'Product not found in wishlist'
            });
        }

        // Remove from wishlist
        user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
        await user.save();

        // Get updated wishlist with product details
        const updatedUser = await User.findById(req.user._id)
            .populate('wishlist', 'name description images price discountPrice stock');

        res.status(200).json({
            success: true,
            data: updatedUser.wishlist
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Clear wishlist
exports.clearWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        user.wishlist = [];
        await user.save();

        res.status(200).json({
            success: true,
            data: []
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Move item from wishlist to cart
exports.moveToCart = async (req, res) => {
    try {
        const { productId, quantity = 1, size, color } = req.body;

        // Check if product exists and is in wishlist
        const user = await User.findById(req.user._id);
        if (!user.wishlist.includes(productId)) {
            return res.status(404).json({
                success: false,
                message: 'Product not found in wishlist'
            });
        }

        // Validate product
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Check stock
        if (product.stock < quantity) {
            return res.status(400).json({
                success: false,
                message: 'Product is out of stock'
            });
        }

        // Validate size and color
        if (!product.sizes.includes(size)) {
            return res.status(400).json({
                success: false,
                message: 'Selected size is not available'
            });
        }

        if (!product.colors.includes(color)) {
            return res.status(400).json({
                success: false,
                message: 'Selected color is not available'
            });
        }

        // Add to cart (reuse cart controller logic)
        const Cart = require('../models/cart.model');
        let cart = await Cart.findOne({ userId: req.user._id });
        if (!cart) {
            cart = await Cart.create({ userId: req.user._id });
        }

        const itemIndex = cart.itemExists(productId, size, color);
        if (itemIndex > -1) {
            cart.items[itemIndex].quantity += quantity;
            cart.items[itemIndex].totalPrice = cart.items[itemIndex].quantity * 
                (product.discountPrice || product.price);
        } else {
            cart.items.push({
                productId,
                quantity,
                size,
                color,
                price: product.discountPrice || product.price,
                totalPrice: quantity * (product.discountPrice || product.price)
            });
        }

        await cart.save();

        // Remove from wishlist
        user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
        await user.save();

        // Get updated data
        await cart.populate('items.productId', 'name images price discountPrice stock');
        const updatedUser = await User.findById(req.user._id)
            .populate('wishlist', 'name description images price discountPrice stock');

        res.status(200).json({
            success: true,
            data: {
                cart,
                wishlist: updatedUser.wishlist
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}; 