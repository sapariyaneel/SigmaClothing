const compression = require('compression');

// Custom compression filter
const shouldCompress = (req, res) => {
    // Don't compress responses with this request header
    if (req.headers['x-no-compression']) {
        return false;
    }

    // Skip compressing responses smaller than 2KB
    if (res.getHeader('Content-Length') < 2048) {
        return false;
    }

    // Use compression filter of the compression middleware
    return compression.filter(req, res);
};

// Configure compression middleware
const compressionMiddleware = compression({
    // Filter function to determine which responses to compress
    filter: shouldCompress,
    
    // Only compress responses above 1KB
    threshold: 1024,
    
    // Compression level (1-9, where 9 is maximum compression)
    level: 6,
    
    // Use maximum compression for text-based responses
    strategy: compression.Z_DEFAULT_STRATEGY,
    
    // Minimum size reduction to store compressed version
    minRatio: 0.8,
    
    // Compress the following MIME types
    mimeTypes: [
        'text/plain',
        'text/html',
        'text/css',
        'text/javascript',
        'application/javascript',
        'application/json',
        'application/x-javascript',
        'application/xml',
        'application/xml+rss',
        'application/vnd.ms-fontobject',
        'application/x-font-ttf',
        'application/x-font-opentype',
        'application/x-font-truetype',
        'image/svg+xml',
        'image/x-icon',
        'image/vnd.microsoft.icon'
    ]
});

module.exports = compressionMiddleware; 