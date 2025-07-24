const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const { upload } = require('../middleware/upload.middleware');
const { validateObjectId } = require('../middleware/validation.middleware');
const {
    createProduct,
    getProducts,
    getProduct,
    updateProduct,
    deleteProduct,
    addRating,
    getProductRatings
} = require('../controllers/product.controller');
const Product = require('../models/product.model');
const Featured = require('../models/featured.model');

// Public routes
router.get('/featured', async (req, res) => {
    try {
        // First, ensure we have a featured document for each category
        await Featured.initializeCategories();

        // Fetch featured products with populated product data
        const featured = await Featured.find()
            .populate({
                path: 'products',
                select: 'name description images price discountPrice stock category subCategory sizes _id imagePosition imageScale imageFit',
                model: 'Product',
                match: { stock: { $gt: 0 } } // Only include in-stock products
            })
            .lean(); // Convert to plain JavaScript object

        // Default image if none exists
        const defaultImage = 'https://res.cloudinary.com/dibb74win/image/upload/v1707665378/sigma-clothing/product-placeholder.png';

        // Filter out any null products and format image URLs
        const cleanedFeatured = featured.map(category => ({
            ...category,
            products: category.products.filter(product => 
                product && product._id && product.name && product.images && product.images.length > 0
            ).map(product => {
                // Format images
                let images = product.images
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

                // If no valid images, use default
                if (images.length === 0) {
                    images = [defaultImage];
                }

                return {
                    ...product,
                    images,
                    imagePosition: product.imagePosition || 'center',
                    imageScale: product.imageScale || 1,
                    imageFit: product.imageFit || 'cover'
                };
            })
        }));



        res.status(200).json({
            success: true,
            data: cleanedFeatured
        });
    } catch (error) {
        console.error('Error fetching featured products:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error fetching featured products'
        });
    }
});

router.get('/', getProducts);
router.get('/:id', validateObjectId('id'), getProduct);
router.get('/:id/ratings', validateObjectId('id'), getProductRatings);

// Protected routes (requires authentication)
router.post('/:id/ratings', protect, validateObjectId('id'), addRating);

// Admin only routes
router.post('/', protect, authorize('admin'), upload.array('images', 6), createProduct);
router.put('/:id', protect, authorize('admin'), validateObjectId('id'), upload.array('images', 6), updateProduct);
router.delete('/:id', protect, authorize('admin'), validateObjectId('id'), deleteProduct);

module.exports = router; 