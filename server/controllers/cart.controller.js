const Cart = require('../models/cart.model');
const Product = require('../models/product.model');

// Get user's cart
exports.getCart = async (req, res) => {
    try {
        let cart = await Cart.findOne({ userId: req.user._id })
            .populate('items.productId', 'name images price discountPrice stock');

        if (!cart) {
            cart = await Cart.create({ userId: req.user._id });
        }

        res.status(200).json({
            success: true,
            data: cart
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Add item to cart
exports.addToCart = async (req, res) => {
    try {
        const { productId, quantity, size } = req.body;

        // Validate product
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Check if product is in stock
        if (product.stock < quantity) {
            return res.status(400).json({
                success: false,
                message: 'Product is out of stock'
            });
        }

        // Check if size is available (only if size is provided and product has sizes)
        if (size && product.sizes && product.sizes.length > 0 && !product.sizes.includes(size)) {
            return res.status(400).json({
                success: false,
                message: 'Selected size is not available'
            });
        }

        // Get or create cart
        let cart = await Cart.findOne({ userId: req.user._id });
        if (!cart) {
            cart = await Cart.create({
                userId: req.user._id,
                items: []
            });
        }

        // Calculate price
        const price = product.discountPrice || product.price;

        // Check if item already exists in cart
        const itemIndex = cart.items.findIndex(item =>
            item.productId.toString() === productId.toString() &&
            (!size || item.size === size)
        );

        if (itemIndex > -1) {
            // Update existing item - recheck stock for total quantity
            const totalQuantity = quantity;
            if (product.stock < totalQuantity) {
                return res.status(400).json({
                    success: false,
                    message: 'Insufficient stock for requested quantity'
                });
            }
            cart.items[itemIndex].quantity = quantity;
            cart.items[itemIndex].totalPrice = price * quantity;
        } else {
            // Add new item
            const cartItem = {
                productId,
                quantity,
                price,
                totalPrice: price * quantity
            };

            // Only add size if it's provided
            if (size) {
                cartItem.size = size;
            }

            cart.items.push(cartItem);
        }

        // Save cart
        await cart.save();

        // Populate product details
        await cart.populate('items.productId', 'name images price discountPrice stock');

        res.status(200).json({
            success: true,
            data: cart
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update cart item
exports.updateCartItem = async (req, res) => {
    try {
        const { itemId } = req.params;
        const { quantity } = req.body;

        const cart = await Cart.findOne({ userId: req.user._id });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }

        const item = cart.items.id(itemId);
        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Item not found in cart'
            });
        }

        // Validate product stock
        const product = await Product.findById(item.productId);
        if (product.stock < quantity) {
            return res.status(400).json({
                success: false,
                message: 'Product is out of stock'
            });
        }

        // Update quantity and total price
        item.quantity = quantity;
        item.totalPrice = quantity * item.price;

        await cart.save();
        await cart.populate('items.productId', 'name images price discountPrice stock');

        res.status(200).json({
            success: true,
            data: cart
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
    try {
        const { itemId } = req.params;

        const cart = await Cart.findOne({ userId: req.user._id });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }

        cart.items = cart.items.filter(item => item._id.toString() !== itemId);
        await cart.save();
        await cart.populate('items.productId', 'name images price discountPrice stock');

        res.status(200).json({
            success: true,
            data: cart
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Clear cart
exports.clearCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.user._id });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }

        cart.items = [];
        await cart.save();

        res.status(200).json({
            success: true,
            data: cart
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}; 