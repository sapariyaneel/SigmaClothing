const Order = require('../models/order.model');
const Product = require('../models/product.model');
const User = require('../models/user.model');
const Payment = require('../models/payment.model');

// Get Dashboard Statistics
exports.getDashboardStats = async (req, res) => {
    try {
        // Get basic stats
        const [totalProducts, totalOrders, totalUsers] = await Promise.all([
            Product.countDocuments(),
            Order.countDocuments(),
            User.countDocuments()
        ]);

        // Calculate total sales (from delivered orders and orders with completed payments)
        const totalSales = await Order.aggregate([
            {
                $match: {
                    $or: [
                        { orderStatus: 'delivered' },
                        { 'paymentInfo.status': 'completed' }
                    ]
                }
            },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);

        // Get recent orders
        const recentOrders = await Order.find()
            .populate('userId', 'fullName')
            .sort({ createdAt: -1 })
            .limit(10)
            .select('_id userId totalAmount orderStatus createdAt');

        // Get low stock products
        const lowStockProducts = await Product.find({ stock: { $lt: 10 } })
            .select('name stock price')
            .limit(10);

        // Calculate sales trend (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const salesTrend = await Order.aggregate([
            {
                $match: {
                    $or: [
                        { orderStatus: 'delivered' },
                        { 'paymentInfo.status': 'completed' }
                    ],
                    createdAt: { $gte: sevenDaysAgo }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    amount: { $sum: '$totalAmount' }
                }
            },
            {
                $sort: { _id: 1 }
            },
            {
                $project: {
                    date: '$_id',
                    amount: 1,
                    _id: 0
                }
            }
        ]);

        // Get new users count (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const newUsers = await User.countDocuments({
            createdAt: { $gte: thirtyDaysAgo }
        });

        // Get active users (users who placed orders in last 30 days)
        const activeUsers = await Order.distinct('userId', {
            createdAt: { $gte: thirtyDaysAgo }
        }).then(users => users.length);

        res.status(200).json({
            success: true,
            data: {
                totalProducts,
                totalOrders,
                totalUsers,
                totalSales: totalSales[0]?.total || 0,
                recentOrders,
                lowStockProducts,
                salesTrend,
                newUsers,
                activeUsers
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard stats'
        });
    }
};

// Get Sales Report
exports.getSalesReport = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const query = {};

        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const orders = await Order.find(query)
            .populate('userId', 'fullName email')
            .sort({ createdAt: -1 });

        const totalSales = orders.reduce((acc, order) => acc + order.totalAmount, 0);
        const totalOrders = orders.length;

        res.status(200).json({
            success: true,
            data: {
                orders,
                totalSales,
                totalOrders
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error generating sales report'
        });
    }
};

// Get Inventory Report
exports.getInventoryReport = async (req, res) => {
    try {
        const products = await Product.find()
            .select('name stock price category subCategory')
            .sort({ stock: 1 });

        const lowStock = products.filter(product => product.stock < 10);
        const outOfStock = products.filter(product => product.stock === 0);

        res.status(200).json({
            success: true,
            data: {
                products,
                lowStock,
                outOfStock,
                totalProducts: products.length,
                lowStockCount: lowStock.length,
                outOfStockCount: outOfStock.length
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error generating inventory report'
        });
    }
};

// Get User Analytics
exports.getUserAnalytics = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const newUsers = await User.countDocuments({
            createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        });

        const usersByRole = await User.aggregate([
            { $group: { _id: '$role', count: { $sum: 1 } } }
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                newUsers,
                usersByRole
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching user analytics'
        });
    }
};

// Get All Users
exports.getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const search = req.query.search || '';
        const role = req.query.role || '';

        // Build search query
        let query = {};
        if (search) {
            query.$or = [
                { fullName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }
        if (role) {
            query.role = role;
        }

        const users = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalUsers = await User.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                users,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(totalUsers / limit),
                    totalUsers,
                    hasNext: page < Math.ceil(totalUsers / limit),
                    hasPrev: page > 1
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching users'
        });
    }
};

// Update User Role
exports.updateUserRole = async (req, res) => {
    try {
        const { userId } = req.params;
        const { role } = req.body;

        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role. Must be either "user" or "admin"'
            });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { role },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: user,
            message: 'User role updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating user role'
        });
    }
};

// Delete User
exports.deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;

        // Prevent admin from deleting themselves
        if (userId === req.user.id) {
            return res.status(400).json({
                success: false,
                message: 'You cannot delete your own account'
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update orders to mark user as deleted but keep order history
        await Order.updateMany(
            { userId: userId },
            {
                $set: {
                    userId: null,
                    userDeleted: true,
                    userEmail: user.email
                }
            }
        );

        // Delete user's payment methods
        await Payment.deleteMany({ userId: userId });

        // Delete the user
        await User.findByIdAndDelete(userId);

        res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting user'
        });
    }
};

// Manage Products
exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find().lean();
        const defaultImage = 'https://res.cloudinary.com/dibb74win/image/upload/v1707665378/sigma-clothing/product-placeholder.png';

        // Format products to ensure proper structure
        const formattedProducts = products.map(product => {
            // Ensure images have full URLs
            let images = [];
            if (Array.isArray(product.images) && product.images.length > 0) {
                images = product.images
                    .filter(image => image && typeof image === 'string')
                    .map(image => {
                        // If it's already a Cloudinary URL or full URL, return as is
                        if (image.includes('cloudinary.com') || image.startsWith('http')) {
                            return image;
                        }
                        // For any other case, use default image
                        return defaultImage;
                    });
            }

            // If no valid images, use default
            if (images.length === 0) {
                images = [defaultImage];
            }

            return {
                ...product,
                _id: product._id.toString(),
                images,
                name: product.name || 'Unnamed Product',
                category: product.category || 'Uncategorized',
                price: product.price || 0,
                stock: product.stock || 0
            };
        });

        res.status(200).json({
            success: true,
            data: formattedProducts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        // Handle new images if provided
        if (req.files && req.files.length > 0) {
            const newImageUrls = await Promise.all(
                req.files.map(async (file) => {
                    // The file.path will now be a Cloudinary URL
                    return file.path;
                })
            );

            // Combine existing and new images
            const existingImages = req.body.existingImages ? JSON.parse(req.body.existingImages) : [];
            req.body.images = [...existingImages, ...newImageUrls];
        }

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.status(200).json({
            success: true,
            data: product
        });
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating product'
        });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting product'
        });
    }
}; 