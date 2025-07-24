const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    moveToCart
} = require('../controllers/wishlist.controller');

// All wishlist routes require authentication
router.use(protect);

router.get('/', getWishlist);
router.post('/add', addToWishlist);
router.delete('/:productId', removeFromWishlist);
router.delete('/', clearWishlist);
router.post('/move-to-cart', moveToCart);

module.exports = router; 