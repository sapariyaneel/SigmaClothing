const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    },
    tls: {
        rejectUnauthorized: false
    },
    // Add DKIM configuration if you have it
    dkim: {
        domainName: 'sigmaclothing.com',
        keySelector: 'default',
        privateKey: process.env.DKIM_PRIVATE_KEY
    }
});

// Verify transporter
transporter.verify((error, success) => {
    if (error) {
        console.error('Email service error:', error);
    } else {
        console.log('Email service is ready to send messages');
    }
});

// Email templates with improved headers and structure
const templates = {
    orderConfirmation: (order) => ({
        subject: 'Order Confirmation - Sigma Clothing',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Order Confirmation</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h1 style="color: #333; text-align: center;">Order Confirmation</h1>
                    <p>Thank you for your order!</p>
                    <p>Order ID: ${order._id}</p>
                    <p>Total Amount: ₹${order.totalAmount}</p>
                    <p>Status: ${order.orderStatus}</p>
                    <div style="margin-top: 20px; text-align: center; color: #666; font-size: 12px;">
                        <p>This email was sent from Sigma Clothing</p>
                        <p>If you did not make this order, please contact our support team immediately.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    }),

    orderStatusUpdate: (order) => ({
        subject: `Order Status Update - #${order._id}`,
        html: `
            <h1>Order Status Update</h1>
            <p>Your order #${order._id} has been ${order.orderStatus}.</p>
            ${order.orderStatus === 'shipped' ? `
                <h2>Tracking Information:</h2>
                <p>
                    Courier: ${order.deliveryInfo.courier}<br>
                    Tracking Number: ${order.deliveryInfo.trackingNumber}<br>
                    Estimated Delivery: ${new Date(order.deliveryInfo.estimatedDelivery).toLocaleDateString()}
                </p>
            ` : ''}
            <p>You can track your order status in your account dashboard.</p>
        `
    }),

    orderCancellation: (order) => ({
        subject: `Order Cancelled - #${order._id}`,
        html: `
            <h1>Order Cancellation Confirmation</h1>
            <p>Your order #${order._id} has been cancelled successfully.</p>
            ${order.paymentInfo.status === 'completed' ? `
                <p>Your refund of ₹${order.totalAmount} has been initiated and will be processed within 5-7 business days.</p>
            ` : ''}
        `
    }),

    lowStockAlert: (product) => ({
        subject: `Low Stock Alert - ${product.name}`,
        html: `
            <h1>Low Stock Alert</h1>
            <p>The following product is running low on stock:</p>
            <div>
                <strong>Product:</strong> ${product.name}<br>
                <strong>Current Stock:</strong> ${product.stock} units<br>
                <strong>Category:</strong> ${product.category}
            </div>
            <p>Please replenish the stock soon to avoid stockout.</p>
        `
    }),

    welcomeEmail: (user) => ({
        subject: 'Welcome to Sigma Clothing!',
        html: `
            <h1>Welcome to Sigma Clothing!</h1>
            <p>Dear ${user.fullName},</p>
            <p>Thank you for creating an account with us. We're excited to have you as part of our community!</p>
            <p>You can now:</p>
            <ul>
                <li>Browse our latest collections</li>
                <li>Create your wishlist</li>
                <li>Track your orders</li>
                <li>Get exclusive offers</li>
            </ul>
            <p>Start shopping now!</p>
        `
    }),

    passwordReset: (resetUrl) => ({
        subject: 'Reset Your Sigma Clothing Password',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #333; text-align: center;">Password Reset Request</h1>
                <p>Hello,</p>
                <p>You recently requested to reset your password for your Sigma Clothing account. Click the button below to proceed:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetUrl}" 
                       style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
                        Reset Password
                    </a>
                </div>
                <p>If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
                <p>This password reset link will expire in 1 hour.</p>
                <hr style="border: 1px solid #eee; margin: 20px 0;">
                <p style="color: #666; font-size: 12px;">
                    If you're having trouble clicking the button, copy and paste this URL into your web browser:<br>
                    ${resetUrl}
                </p>
            </div>
        `
    })
};

const sendEmail = async (mailOptions) => {
    try {
        // Add common headers and settings
        const enhancedMailOptions = {
            ...mailOptions,
            from: {
                name: process.env.EMAIL_FROM_NAME,
                address: process.env.EMAIL_FROM_ADDRESS
            },
            headers: {
                'X-Priority': '3',
                'X-MSMail-Priority': 'Normal',
                'Importance': 'Normal',
                'X-Mailer': 'Sigma Clothing Mailer',
                'List-Unsubscribe': `<mailto:unsubscribe@${process.env.EMAIL_DOMAIN}>`
            }
        };

        console.log('Sending email with options:', {
            to: enhancedMailOptions.to,
            subject: enhancedMailOptions.subject
        });

        const info = await transporter.sendMail(enhancedMailOptions);
        console.log('Email sent successfully:', info.messageId);
        return { success: true, info };
    } catch (error) {
        console.error('Failed to send email:', error);
        throw error;
    }
};

const sendPasswordResetEmail = async (email, resetToken) => {
    try {
        console.log('Preparing password reset email for:', email);
        
        const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
        const template = templates.passwordReset(resetUrl);
        
        const mailOptions = {
            from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
            to: email,
            subject: template.subject,
            html: template.html
        };

        const result = await sendEmail(mailOptions);
        console.log('Password reset email sent successfully to:', email);
        return result;
    } catch (error) {
        console.error('Error sending password reset email:', error);
        throw new Error('Failed to send password reset email. Please try again later.');
    }
};

const sendOrderConfirmation = async (order) => {
    try {
        const template = templates.orderConfirmation(order);
        
        const mailOptions = {
            from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
            to: order.email,
            subject: template.subject,
            html: template.html
        };

        return await sendEmail(mailOptions);
    } catch (error) {
        console.error('Error sending order confirmation:', error);
        throw new Error('Failed to send order confirmation email');
    }
};

// Specific email sending functions
exports.sendOrderStatusUpdate = async (order) => {
    const user = await order.populate('userId', 'email');
    return sendEmail(templates.orderStatusUpdate(order));
};

exports.sendOrderCancellation = async (order) => {
    const user = await order.populate('userId', 'email');
    return sendEmail(templates.orderCancellation(order));
};

exports.sendLowStockAlert = async (product) => {
    // Send to admin email
    return sendEmail(templates.lowStockAlert(product));
};

exports.sendWelcomeEmail = async (user) => {
    return sendEmail(templates.welcomeEmail(user));
};

module.exports = {
    sendPasswordResetEmail,
    sendOrderConfirmation,
    sendEmail
}; 