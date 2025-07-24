const Product = require('../models/product.model');
const emailService = require('../services/email.service');
const cloudinary = require('../config/cloudinary');

// Create new product
exports.createProduct = async (req, res) => {
    try {
        // If images are provided in the request
        if (req.files) {
            const imageUrls = await Promise.all(
                req.files.map(async (file) => {
                    // The file.path will now be a Cloudinary URL since we're using CloudinaryStorage
                    return file.path;
                })
            );
            req.body.images = imageUrls;
        }
        
        const product = await Product.create(req.body);
        res.status(201).json({
            success: true,
            data: product
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Get all products with filtering, sorting, and pagination
exports.getProducts = async (req, res) => {
    try {
        // Build query without isActive filter
        let query = {};

        // Filtering
        if (req.query.category) {
            query.category = req.query.category;
        }
        if (req.query.subCategory) {
            query.subCategory = req.query.subCategory;
        }
        if (req.query.minPrice || req.query.maxPrice) {
            query.price = {};
            if (req.query.minPrice) query.price.$gte = Number(req.query.minPrice);
            if (req.query.maxPrice) query.price.$lte = Number(req.query.maxPrice);
        }
        
        // Handle size filtering
        if (req.query.size) {
            // Convert size parameter to array if it's not already
            const sizes = Array.isArray(req.query.size) ? req.query.size : [req.query.size];
            // Use $in operator to match any of the sizes
            query.sizes = { $in: sizes };

        }

        // Search
        if (req.query.search) {
            query.$text = { $search: req.query.search };
        }



        // Execute query with pagination
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const startIndex = (page - 1) * limit;

        const total = await Product.countDocuments(query);

        let sortQuery = {};
        if (req.query.sort === 'newest') {
            sortQuery = { createdAt: -1 };
        } else if (req.query.sort === 'price-low-high') {
            sortQuery = { price: 1 };
        } else if (req.query.sort === 'price-high-low') {
            sortQuery = { price: -1 };
        }

        let products = await Product.find(query)
            .sort(sortQuery)
            .skip(startIndex)
            .limit(limit)
            .lean();

        // Format products to ensure proper structure
        products = products.map(product => {
            // Default image if none exists
            const defaultImage = 'https://res.cloudinary.com/dibb74win/image/upload/v1707665378/sigma-clothing/product-placeholder.png';
            
            // Ensure images have full URLs
            let images = [];
            if (Array.isArray(product.images) && product.images.length > 0) {
                images = product.images
                    .filter(image => image && typeof image === 'string')
                    .map(image => {
                        // If it's already a Cloudinary URL, return as is
                        if (image.includes('cloudinary.com')) {
                            return image;
                        }
                        // If it's a full URL, return as is
                        if (image.startsWith('http')) {
                            return image;
                        }
                        // If it's a local path, it should have been uploaded to Cloudinary
                        // Return the default image as fallback
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
                images
            };
        });

        res.status(200).json({
            success: true,
            count: products.length,
            total,
            page,
            pages: Math.ceil(total / limit),
            data: products
        });
    } catch (error) {
        console.error('Get products error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Get single product
exports.getProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).lean();
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Format product images
        const defaultImage = 'https://res.cloudinary.com/dibb74win/image/upload/v1707665378/sigma-clothing/product-placeholder.png';
        let images = [];
        if (Array.isArray(product.images) && product.images.length > 0) {
            images = product.images
                .filter(image => image && typeof image === 'string')
                .map(image => {
                    if (image.includes('cloudinary.com')) {
                        return image;
                    }
                    if (image.startsWith('http')) {
                        return image;
                    }
                    return defaultImage;
                });
        }

        if (images.length === 0) {
            images = [defaultImage];
        }

        res.status(200).json({
            success: true,
            data: {
                ...product,
                images
            }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Update product
exports.updateProduct = async (req, res) => {
    try {
        const oldProduct = await Product.findById(req.params.id);
        if (!oldProduct) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

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
            {
                new: true,
                runValidators: true
            }
        );

        // Check if stock has fallen below threshold
        if (product.stock <= 10 && oldProduct.stock > 10) {
            try {
                await emailService.sendLowStockAlert(product);
                console.log(`Low stock alert sent for product: ${product.name} (Stock: ${product.stock})`);
            } catch (emailError) {
                console.error('Failed to send low stock alert:', emailError.message);
                // Don't fail product update if email fails
            }
        }

        res.status(200).json({
            success: true,
            data: product
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Delete product
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        await product.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Add product rating
exports.addRating = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Check if user has already rated
        const existingRating = product.ratings.find(
            rating => rating.userId.toString() === req.user._id.toString()
        );

        if (existingRating) {
            // Update existing rating
            existingRating.rating = req.body.rating;
            existingRating.review = req.body.review;
            existingRating.date = Date.now();
        } else {
            // Add new rating
            product.ratings.push({
                userId: req.user._id,
                rating: req.body.rating,
                review: req.body.review
            });
        }

        // Update average rating
        product.averageRating = product.ratings.length > 0
            ? product.ratings.reduce((acc, item) => acc + item.rating, 0) / product.ratings.length
            : 0;

        await product.save();

        res.status(200).json({
            success: true,
            data: product
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Get product ratings
exports.getProductRatings = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('ratings.userId', 'fullName profilePhoto');

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.status(200).json({
            success: true,
            data: product.ratings
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
}; 