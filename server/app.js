const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const path = require('path');
const connectDatabase = require('./config/database');
require('dotenv').config();
const validateEnvironment = require('./utils/validateEnv');
const multer = require('multer');
// const { detectSuspiciousActivity, createSecurityRateLimit } = require('./middleware/security.middleware');
const logger = require('./utils/logger');

// Validate environment variables before starting
validateEnvironment();

// Import routes
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const cartRoutes = require('./routes/cart.routes');
const wishlistRoutes = require('./routes/wishlist.routes');
const orderRoutes = require('./routes/order.routes');
const adminRoutes = require('./routes/admin.routes');
const userRoutes = require('./routes/user.routes');
const paymentRoutes = require('./routes/payment.routes');
const uploadRoutes = require('./routes/upload.routes');
const bannerRoutes = require('./routes/banner.routes');
const couponRoutes = require('./routes/coupon.routes');

// Initialize express app
const app = express();

// Trust proxy - required for rate limiting behind reverse proxies
app.set('trust proxy', 1);

// Security Middleware with enhanced configuration
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
            scriptSrc: ["'self'"],
            connectSrc: ["'self'", "https://api.razorpay.com"],
            formAction: ["'self'"], // Prevent form submissions to external sites
            frameAncestors: ["'none'"], // Prevent clickjacking
        },
    },
    crossOriginEmbedderPolicy: false, // Disable for Cloudinary compatibility
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true
    }
}));

// Enhanced rate limiting with security monitoring
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'development' ? 100 : 5, // More lenient in development
    message: 'Too many authentication attempts, please try again later',
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'development' ? 1000 : 300, // More lenient in development
    message: 'Too many requests, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
});

// Password reset rate limiter (stricter)
const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: process.env.NODE_ENV === 'development' ? 10 : 3, // Very strict for password reset
    message: 'Too many password reset attempts, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
});

// Apply rate limiters based on environment
if (process.env.NODE_ENV === 'production') {
    app.use('/api/auth/login', authLimiter);
    app.use('/api/auth/register', authLimiter);
    app.use('/api/auth/forgot-password', passwordResetLimiter);
    app.use('/api/auth/reset-password', passwordResetLimiter);
    app.use('/api/', apiLimiter);
} else {
    // In development, only apply a very lenient global rate limit
    app.use('/api/', rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 1000,
        message: 'Too many requests, please try again later',
        standardHeaders: true,
        legacyHeaders: false,
    }));
}

// Add cache control middleware
const cacheControl = (req, res, next) => {
  // Cache static assets for 1 day
  if (req.path.startsWith('/uploads/')) {
    res.set('Cache-Control', 'public, max-age=86400');
  }
  // Cache API responses for 5 minutes except for dynamic routes
  else if (req.method === 'GET' && req.path.startsWith('/api/')) {
    const noCacheRoutes = ['/api/auth/me', '/api/cart', '/api/orders'];
    if (!noCacheRoutes.some(route => req.path.startsWith(route))) {
      res.set('Cache-Control', 'public, max-age=300');
    } else {
      res.set('Cache-Control', 'no-cache');
    }
  }
  // No cache for mutations
  else {
    res.set('Cache-Control', 'no-store');
  }
  next();
};

// Compression options
const compressionOptions = {
  level: 6,
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
};

// Apply middleware
app.use(compression(compressionOptions));
app.use(cacheControl);
// app.use(detectSuspiciousActivity); // Add security monitoring
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Get allowed origins from environment variable
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['https://sigmaclothing.vercel.app', 'http://localhost:5173', 'http://localhost:3000'];

// CORS configuration with secure options
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests without origin (server-to-server, health checks, etc.)
        if (!origin) {
            return callback(null, true);
        }

        // Check if origin is in allowed origins list
        if (allowedOrigins.indexOf(origin) !== -1) {
            return callback(null, true);
        }

        // Allow Vercel preview deployments (they have specific patterns)
        if (origin.includes('vercel.app') ||
            origin.includes('neel-sapariyas-projects.vercel.app') ||
            (origin.includes('sigmaclothing') && origin.includes('vercel.app'))) {
            return callback(null, true);
        }

        // If origin doesn't match any allowed patterns, reject it
        const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
        return callback(new Error(msg), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept', 'X-Requested-With'],
    exposedHeaders: ['Cross-Origin-Resource-Policy', 'Content-Range', 'Content-Length'],
    maxAge: 600 // Cache preflight requests for 10 minutes
}));

// Additional headers for CORS
app.use((req, res, next) => {
    const origin = req.headers.origin;

    // Set CORS headers for valid origins or when no origin is present (server-to-server requests)
    if (!origin ||
        allowedOrigins.includes(origin) ||
        (origin && (
            origin.includes('vercel.app') ||
            origin.includes('neel-sapariyas-projects.vercel.app') ||
            (origin.includes('sigmaclothing') && origin.includes('vercel.app'))
        ))) {

        // Only set Access-Control-Allow-Origin if there's an origin
        if (origin) {
            res.header('Access-Control-Allow-Origin', origin);
        }
    }

    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Range');
    res.header('Access-Control-Expose-Headers', 'Content-Range, Content-Length');
    res.header('Access-Control-Allow-Credentials', 'true');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    next();
});

// Configure Cross-Origin-Resource-Policy for static files
app.use((req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
});

// Configure static file serving with cache
app.use('/uploads', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Cache-Control', 'public, max-age=86400'); // 24 hours
  next();
}, express.static(path.join(__dirname, 'uploads'), {
  maxAge: '1d',
  etag: true,
  lastModified: true
}));

// Logging middleware - disabled to reduce console noise
// if (process.env.NODE_ENV === 'development') {
//     app.use(morgan('dev'));
// }

// Response sanitization middleware
const sanitize = (obj) => {
    if (Array.isArray(obj)) {
        return obj.map(item => sanitize(item));
    }
    if (obj && typeof obj === 'object') {
        const sanitized = { ...obj };
        // Keep _id and remove sensitive fields
        delete sanitized.password;
        delete sanitized.__v;
        return sanitized;
    }
    return obj;
};

app.use((req, res, next) => {
    const oldJson = res.json;
    res.json = function(data) {
        if (data && typeof data === 'object') {
            // If data has a data property that's an array, sanitize it
            if (data.data && Array.isArray(data.data)) {
                data.data = sanitize(data.data);
            } else {
                // If data itself is the response, sanitize it
                data = sanitize(data);
            }
        }
        return oldJson.call(this, data);
    };
    next();
});

// Create uploads directory if it doesn't exist
const fs = require('fs');
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const productsUploadsDir = path.join(__dirname, 'uploads/products');
if (!fs.existsSync(productsUploadsDir)) {
    fs.mkdirSync(productsUploadsDir, { recursive: true });
}

const profilesUploadsDir = path.join(__dirname, 'uploads/profiles');
if (!fs.existsSync(profilesUploadsDir)) {
    fs.mkdirSync(profilesUploadsDir, { recursive: true });
}

// Configure multer for handling file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'uploads/products'));  // Using absolute path
  },
  filename: function (req, file, cb) {
    // Generate secure filename with crypto random bytes
    const crypto = require('crypto');
    const randomName = crypto.randomBytes(16).toString('hex');
    const fileExtension = path.extname(file.originalname).toLowerCase();
    const secureFilename = `${file.fieldname}-${Date.now()}-${randomName}${fileExtension}`;
    cb(null, secureFilename);
  }
});

const fileFilter = (req, file, cb) => {
  // Check MIME type
  if (!file.mimetype.startsWith('image/')) {
    return cb(new Error('Not an image! Please upload only images.'), false);
  }

  // Check file extension
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const fileExtension = path.extname(file.originalname).toLowerCase();

  if (!allowedExtensions.includes(fileExtension)) {
    return cb(new Error('Invalid file extension. Only JPG, JPEG, PNG, GIF, and WEBP files are allowed.'), false);
  }

  // Sanitize filename
  const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
  file.originalname = sanitizedName;

  cb(null, true);
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
    files: 6 // Maximum 6 files
  }
});

// Connect to database
connectDatabase();

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/banner', bannerRoutes);
app.use('/api/coupons', couponRoutes);

// Redirect non-prefixed routes to /api routes
app.use('/products', (req, res) => res.redirect(`/api${req.originalUrl}`));
app.use('/auth', (req, res) => res.redirect(`/api${req.originalUrl}`));
app.use('/cart', (req, res) => res.redirect(`/api${req.originalUrl}`));
app.use('/wishlist', (req, res) => res.redirect(`/api${req.originalUrl}`));
app.use('/orders', (req, res) => res.redirect(`/api${req.originalUrl}`));
app.use('/admin', (req, res) => res.redirect(`/api${req.originalUrl}`));
app.use('/users', (req, res) => res.redirect(`/api${req.originalUrl}`));
app.use('/payment', (req, res) => res.redirect(`/api${req.originalUrl}`));
app.use('/uploads', (req, res) => res.redirect(`/api${req.originalUrl}`));

// Base route
app.get('/', (req, res) => {
    res.send('Sigma Clothing API is running');
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Error:', {
        message: error.message,
        stack: error.stack,
        path: req.path,
        method: req.method,
        origin: req.headers.origin
    });

    // CORS error handling
    if (error.name === 'CORSError' || error.message.includes('CORS')) {
        return res.status(403).json({
            success: false,
            message: 'CORS error - Origin not allowed',
            error: process.env.NODE_ENV === 'development' ? error.message : 'CORS error'
        });
    }

    // MongoDB duplicate key error
    if (error.code === 11000) {
        return res.status(400).json({
            success: false,
            message: 'Duplicate field value entered'
        });
    }

    // Mongoose validation error
    if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(val => val.message);
        return res.status(400).json({
            success: false,
            message: messages.join(', ')
        });
    }

    // Multer error
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                message: 'File too large. Max size is 5MB'
            });
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                message: 'Maximum 6 files allowed'
            });
        }
        if (error.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                message: 'Unexpected field name for files'
            });
        }
    }

    // Send minimal error information in production
    const errorResponse = {
        success: false,
        message: process.env.NODE_ENV === 'production' 
            ? 'Internal Server Error'
            : error.message || 'Internal Server Error'
    };

    // Include stack trace in development
    if (process.env.NODE_ENV === 'development') {
        errorResponse.stack = error.stack;
    }

    res.status(error.status || 500).json(errorResponse);
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

 module.exports = app; 
