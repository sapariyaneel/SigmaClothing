const validateEnvironment = () => {
    const requiredEnvVars = [
        'MONGODB_URI',
        'JWT_SECRET',
        'CLOUDINARY_CLOUD_NAME',
        'CLOUDINARY_API_KEY',
        'CLOUDINARY_API_SECRET'
    ];

    const optionalEnvVars = [
        'PORT',
        'NODE_ENV',
        'ALLOWED_ORIGINS',
        'EMAIL_USER',
        'EMAIL_PASSWORD',
        'EMAIL_SERVICE',
        'EMAIL_HOST',
        'EMAIL_PORT',
        'EMAIL_SECURE',
        'RAZORPAY_KEY_ID',
        'RAZORPAY_KEY_SECRET'
    ];

    const missingRequired = [];
    const warnings = [];

    // Check required environment variables
    requiredEnvVars.forEach(envVar => {
        if (!process.env[envVar]) {
            missingRequired.push(envVar);
        }
    });

    // Check optional but important environment variables
    optionalEnvVars.forEach(envVar => {
        if (!process.env[envVar]) {
            warnings.push(envVar);
        }
    });

    // Validate JWT_SECRET strength
    if (process.env.JWT_SECRET) {
        if (process.env.JWT_SECRET.length < 32) {
            missingRequired.push('JWT_SECRET must be at least 32 characters long');
        }

        // Check for common weak secrets
        const weakSecrets = ['secret', 'jwt_secret', 'your_jwt_secret', 'mysecret', '123456'];
        if (weakSecrets.includes(process.env.JWT_SECRET.toLowerCase())) {
            missingRequired.push('JWT_SECRET is too weak. Please use a strong, unique secret');
        }
    }

    // Validate NODE_ENV
    if (process.env.NODE_ENV && !['development', 'production', 'test'].includes(process.env.NODE_ENV)) {
        warnings.push('NODE_ENV should be one of: development, production, test');
    }

    // Validate PORT
    if (process.env.PORT && (isNaN(process.env.PORT) || process.env.PORT < 1 || process.env.PORT > 65535)) {
        warnings.push('PORT should be a valid port number (1-65535)');
    }

    // Report results
    if (missingRequired.length > 0) {
        console.error('❌ Missing required environment variables:');
        missingRequired.forEach(envVar => {
            console.error(`   - ${envVar}`);
        });
        console.error('\nPlease set these environment variables before starting the server.');
        process.exit(1);
    }

    if (warnings.length > 0) {
        console.warn('⚠️  Environment warnings:');
        warnings.forEach(warning => {
            console.warn(`   - ${warning}`);
        });
        console.warn('\nThese are optional but recommended for full functionality.\n');
    }

    console.log('✅ Environment validation passed');
    
    // Set defaults for optional variables
    if (!process.env.PORT) process.env.PORT = '5000';
    if (!process.env.NODE_ENV) process.env.NODE_ENV = 'development';
    if (!process.env.ALLOWED_ORIGINS) {
        process.env.ALLOWED_ORIGINS = 'https://sigmaclothing.vercel.app,http://localhost:5173,http://localhost:3000';
    }
};

module.exports = validateEnvironment;
