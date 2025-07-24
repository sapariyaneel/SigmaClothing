const express = require('express');
const router = express.Router();

// Get banner image URL
router.get('/', async (req, res) => {
    try {
        // Return the Cloudinary URL for the banner image
        // Using the v2 URL format for better performance and features
        const bannerUrl = 'https://res.cloudinary.com/sigma-clothing/image/upload/f_auto,q_auto/v1/sigma-clothing/banner/hero-banner.jpg';
        res.json({ success: true, data: bannerUrl });
    } catch (error) {
        console.error('Error fetching banner:', error);
        res.status(500).json({ success: false, message: 'Error fetching banner image' });
    }
});

module.exports = router; 