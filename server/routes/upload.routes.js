const express = require('express');
const router = express.Router();
const { upload } = require('../middleware/upload.middleware');
const { protect } = require('../middleware/auth.middleware');

// Upload single image
router.post('/single', protect, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No image file provided'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                url: req.file.path
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Upload multiple images
router.post('/multiple', protect, upload.array('images', 5), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No image files provided'
            });
        }

        const urls = req.files.map(file => file.path);

        res.status(200).json({
            success: true,
            data: {
                urls
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router; 