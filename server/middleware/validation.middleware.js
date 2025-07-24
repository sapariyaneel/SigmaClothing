const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
        });
    }
    next();
};

// Sanitize input to prevent NoSQL injection
const sanitizeInput = (req, res, next) => {
    // Recursively sanitize object
    const sanitize = (obj) => {
        if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    if (typeof obj[key] === 'object' && obj[key] !== null) {
                        sanitize(obj[key]);
                    } else if (typeof obj[key] === 'string') {
                        // Remove potential NoSQL injection operators and dangerous patterns
                        obj[key] = obj[key]
                            .replace(/^\$/, '')
                            .replace(/\$where/gi, '')
                            .replace(/\$regex/gi, '')
                            .replace(/javascript:/gi, '');
                    }
                }
            }
        }
        return obj;
    };

    // Sanitize request body, query, and params
    if (req.body) {
        req.body = sanitize(req.body);
    }
    if (req.query) {
        req.query = sanitize(req.query);
    }
    if (req.params) {
        req.params = sanitize(req.params);
    }

    next();
};

// Validate MongoDB ObjectId
const validateObjectId = (paramName) => {
    return (req, res, next) => {
        const id = req.params[paramName];
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: `Invalid ${paramName} format`
            });
        }
        next();
    };
};

// Validate JSON parsing
const validateJSON = (req, res, next) => {
    if (req.body && typeof req.body === 'string') {
        try {
            req.body = JSON.parse(req.body);
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: 'Invalid JSON format'
            });
        }
    }
    next();
};

// Rate limiting for specific operations
const createRateLimit = (windowMs, max, message) => {
    const rateLimit = require('express-rate-limit');
    return rateLimit({
        windowMs,
        max,
        message: {
            success: false,
            message
        },
        standardHeaders: true,
        legacyHeaders: false,
    });
};

module.exports = {
    handleValidationErrors,
    sanitizeInput,
    validateObjectId,
    validateJSON,
    createRateLimit
};
