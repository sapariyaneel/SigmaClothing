require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/user.model');

const createAdminUser = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        
        console.log('Connected to MongoDB');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: 'admin@sigmaclothing.com' });
        
        if (existingAdmin) {
            console.log('Admin user already exists!');
            console.log('Email:', existingAdmin.email);
            console.log('You can reset the password if needed.');
            process.exit(0);
        }

        // Validate required environment variables
        if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
            console.error('❌ Missing required environment variables:');
            console.error('   - ADMIN_EMAIL: Admin email address');
            console.error('   - ADMIN_PASSWORD: Admin password (minimum 8 characters)');
            console.error('\nPlease set these environment variables before creating admin user.');
            process.exit(1);
        }

        // Validate password strength
        if (process.env.ADMIN_PASSWORD.length < 8) {
            console.error('❌ Admin password must be at least 8 characters long');
            process.exit(1);
        }

        // Create admin user
        const adminData = {
            email: process.env.ADMIN_EMAIL,
            password: process.env.ADMIN_PASSWORD,
            fullName: process.env.ADMIN_FULL_NAME || 'Admin User',
            role: 'admin',
            isVerified: true,
            phone: process.env.ADMIN_PHONE || null
        };

        // Hash password
        const salt = await bcrypt.genSalt(10);
        adminData.password = await bcrypt.hash(adminData.password, salt);

        // Create admin user
        const admin = await User.create(adminData);
        
        console.log('✅ Admin user created successfully!');
        console.log('📧 Email:', adminData.email);
        console.log('🎯 Role: admin');
        console.log('');
        console.log('You can now login to the admin dashboard using these credentials.');
        console.log('Please change the password after first login for security.');

    } catch (error) {
        console.error('❌ Error creating admin user:', error.message);
    } finally {
        // Close database connection
        await mongoose.connection.close();
        console.log('Database connection closed');
        process.exit(0);
    }
};

// Run the script
createAdminUser();
