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
    // Email service verification - handle silently
});

// Helper function to escape HTML to prevent injection
const escapeHtml = (text) => {
    if (typeof text !== 'string') return text;
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
};

// Professional email template base styles
const getEmailBaseStyles = () => `
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #1a1a1a;
            background-color: #f8f9fa;
        }

        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }

        .email-header {
            background: linear-gradient(135deg, #000000 0%, #2c2c2c 100%);
            padding: 40px 30px;
            text-align: center;
        }

        .logo {
            font-size: 32px;
            font-weight: 700;
            color: #ffffff;
            letter-spacing: 2px;
            margin-bottom: 8px;
        }

        .tagline {
            color: #cccccc;
            font-size: 14px;
            font-weight: 300;
        }

        .email-body {
            padding: 40px 30px;
        }

        .greeting {
            font-size: 24px;
            font-weight: 600;
            color: #1a1a1a;
            margin-bottom: 20px;
        }

        .content-text {
            font-size: 16px;
            color: #4a5568;
            margin-bottom: 16px;
            line-height: 1.7;
        }

        .order-details {
            background-color: #f8f9fa;
            border-radius: 12px;
            padding: 24px;
            margin: 24px 0;
            border-left: 4px solid #000000;
        }

        .detail-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
            border-bottom: 1px solid #e2e8f0;
        }

        .detail-row:last-child {
            border-bottom: none;
            font-weight: 600;
            font-size: 18px;
        }

        .detail-label {
            color: #718096;
            font-weight: 500;
        }

        .detail-value {
            color: #1a1a1a;
            font-weight: 600;
        }

        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #000000 0%, #2c2c2c 100%);
            color: #ffffff;
            padding: 16px 32px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
            transition: all 0.3s ease;
        }

        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }

        .email-footer {
            background-color: #1a1a1a;
            color: #ffffff;
            padding: 30px;
            text-align: center;
        }

        .footer-content {
            margin-bottom: 20px;
        }

        .footer-links {
            margin: 20px 0;
        }

        .footer-link {
            color: #cccccc;
            text-decoration: none;
            margin: 0 15px;
            font-size: 14px;
        }

        .footer-link:hover {
            color: #ffffff;
        }

        .social-links {
            margin: 20px 0;
        }

        .social-link {
            display: inline-block;
            margin: 0 10px;
            color: #cccccc;
            text-decoration: none;
        }

        .copyright {
            font-size: 12px;
            color: #718096;
            margin-top: 20px;
        }

        .status-badge {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .status-confirmed {
            background-color: #d4edda;
            color: #155724;
        }

        .status-processing {
            background-color: #fff3cd;
            color: #856404;
        }

        .status-shipped {
            background-color: #cce5ff;
            color: #004085;
        }

        .status-delivered {
            background-color: #d1ecf1;
            color: #0c5460;
        }

        @media only screen and (max-width: 600px) {
            .email-container {
                margin: 0;
                border-radius: 0;
            }

            .email-header,
            .email-body,
            .email-footer {
                padding: 20px;
            }

            .logo {
                font-size: 28px;
            }

            .greeting {
                font-size: 20px;
            }

            .order-details {
                padding: 16px;
            }

            .detail-row {
                flex-direction: column;
                align-items: flex-start;
                gap: 4px;
            }

            .cta-button {
                display: block;
                text-align: center;
                width: 100%;
            }
        }
    </style>
`;

// Email templates with professional design and premium styling
const templates = {
    orderConfirmation: (order) => ({
        subject: '✅ Order Confirmed - Thank You for Choosing Sigma Clothing',
        html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <meta http-equiv="X-UA-Compatible" content="IE=edge">
                ${getEmailBaseStyles()}
            </head>
            <body>
                <div class="email-container">
                    <!-- Header -->
                    <div class="email-header">
                        <div class="logo">SIGMA CLOTHING</div>
                        <div class="tagline">Premium Fashion & Lifestyle</div>
                    </div>

                    <!-- Body -->
                    <div class="email-body">
                        <div class="greeting">Thank You for Your Order! 🎉</div>

                        <p class="content-text">
                            We're thrilled to confirm that your order has been successfully placed.
                            Our team is already preparing your premium fashion items with the utmost care.
                        </p>

                        <div class="order-details">
                            <div class="detail-row">
                                <span class="detail-label">Order Number</span>
                                <span class="detail-value">#${escapeHtml(order._id?.toString().slice(-8).toUpperCase())}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Order Date</span>
                                <span class="detail-value">${new Date().toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Status</span>
                                <span class="status-badge status-confirmed">${escapeHtml(order.orderStatus)}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Total Amount</span>
                                <span class="detail-value">₹${escapeHtml(order.totalAmount?.toString())}</span>
                            </div>
                        </div>

                        <p class="content-text">
                            <strong>What's Next?</strong><br>
                            • You'll receive a shipping confirmation with tracking details once your order is dispatched<br>
                            • Expected delivery: 3-5 business days<br>
                            • Track your order anytime in your account dashboard
                        </p>

                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${process.env.CLIENT_URL}/orders" class="cta-button">
                                Track Your Order
                            </a>
                        </div>

                        <p class="content-text" style="font-size: 14px; color: #718096;">
                            Need help? Our customer support team is here for you 24/7.
                            Simply reply to this email or contact us at
                            <a href="mailto:support@sigmaclothing.com" style="color: #000000;">support@sigmaclothing.com</a>
                        </p>
                    </div>

                    <!-- Footer -->
                    <div class="email-footer">
                        <div class="footer-content">
                            <strong>SIGMA CLOTHING</strong><br>
                            Elevating everyday fashion with premium quality
                        </div>

                        <div class="footer-links">
                            <a href="${process.env.CLIENT_URL}" class="footer-link">Shop Now</a>
                            <a href="${process.env.CLIENT_URL}/contact" class="footer-link">Contact Us</a>
                            <a href="${process.env.CLIENT_URL}/returns" class="footer-link">Returns</a>
                        </div>

                        <div class="social-links">
                            <a href="#" class="social-link">Instagram</a>
                            <a href="#" class="social-link">Facebook</a>
                            <a href="#" class="social-link">Twitter</a>
                        </div>

                        <div class="copyright">
                            © ${new Date().getFullYear()} Sigma Clothing. All rights reserved.<br>
                            This email was sent to you because you placed an order with us.
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `
    }),

    orderStatusUpdate: (order) => {
        const getStatusInfo = (status) => {
            const statusMap = {
                'confirmed': { emoji: '✅', title: 'Order Confirmed', message: 'Your order has been confirmed and is being prepared.' },
                'processing': { emoji: '📦', title: 'Order Processing', message: 'Your order is being carefully prepared by our team.' },
                'shipped': { emoji: '🚚', title: 'Order Shipped', message: 'Great news! Your order is on its way to you.' },
                'delivered': { emoji: '🎉', title: 'Order Delivered', message: 'Your order has been successfully delivered!' },
                'cancelled': { emoji: '❌', title: 'Order Cancelled', message: 'Your order has been cancelled as requested.' }
            };
            return statusMap[status] || { emoji: '📋', title: 'Order Update', message: `Your order status has been updated to ${status}.` };
        };

        const statusInfo = getStatusInfo(order.orderStatus);

        return {
            subject: `${statusInfo.emoji} ${statusInfo.title} - Order #${order._id?.toString().slice(-8).toUpperCase()}`,
            html: `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <meta http-equiv="X-UA-Compatible" content="IE=edge">
                    ${getEmailBaseStyles()}
                </head>
                <body>
                    <div class="email-container">
                        <!-- Header -->
                        <div class="email-header">
                            <div class="logo">SIGMA CLOTHING</div>
                            <div class="tagline">Premium Fashion & Lifestyle</div>
                        </div>

                        <!-- Body -->
                        <div class="email-body">
                            <div class="greeting">${statusInfo.title} ${statusInfo.emoji}</div>

                            <p class="content-text">
                                Hello! We have an important update about your recent order.
                            </p>

                            <div class="order-details">
                                <div class="detail-row">
                                    <span class="detail-label">Order Number</span>
                                    <span class="detail-value">#${escapeHtml(order._id?.toString().slice(-8).toUpperCase())}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Current Status</span>
                                    <span class="status-badge status-${order.orderStatus}">${escapeHtml(order.orderStatus.toUpperCase())}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Last Updated</span>
                                    <span class="detail-value">${new Date().toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}</span>
                                </div>
                            </div>

                            <p class="content-text">
                                <strong>${statusInfo.message}</strong>
                            </p>

                            ${order.orderStatus === 'shipped' && order.deliveryInfo ? `
                                <div style="background-color: #e6f3ff; border-radius: 12px; padding: 24px; margin: 24px 0; border-left: 4px solid #0066cc;">
                                    <h3 style="color: #0066cc; margin-bottom: 16px; font-size: 18px;">📦 Shipping Details</h3>
                                    <div class="detail-row" style="border-bottom: 1px solid #cce5ff;">
                                        <span class="detail-label">Courier Partner</span>
                                        <span class="detail-value">${escapeHtml(order.deliveryInfo.courier || 'Standard Delivery')}</span>
                                    </div>
                                    <div class="detail-row" style="border-bottom: 1px solid #cce5ff;">
                                        <span class="detail-label">Tracking Number</span>
                                        <span class="detail-value" style="font-family: monospace; background: #f0f8ff; padding: 4px 8px; border-radius: 4px;">
                                            ${escapeHtml(order.deliveryInfo.trackingNumber || 'Will be updated soon')}
                                        </span>
                                    </div>
                                    <div class="detail-row">
                                        <span class="detail-label">Expected Delivery</span>
                                        <span class="detail-value">
                                            ${order.deliveryInfo.estimatedDelivery ?
                                                new Date(order.deliveryInfo.estimatedDelivery).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                }) : '2-3 business days'
                                            }
                                        </span>
                                    </div>
                                </div>
                            ` : ''}

                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${process.env.CLIENT_URL}/orders" class="cta-button">
                                    View Order Details
                                </a>
                            </div>

                            <p class="content-text" style="font-size: 14px; color: #718096;">
                                Questions about your order? We're here to help!
                                Contact us at <a href="mailto:support@sigmaclothing.com" style="color: #000000;">support@sigmaclothing.com</a>
                            </p>
                        </div>

                        <!-- Footer -->
                        <div class="email-footer">
                            <div class="footer-content">
                                <strong>SIGMA CLOTHING</strong><br>
                                Elevating everyday fashion with premium quality
                            </div>

                            <div class="footer-links">
                                <a href="${process.env.CLIENT_URL}" class="footer-link">Shop Now</a>
                                <a href="${process.env.CLIENT_URL}/contact" class="footer-link">Contact Us</a>
                                <a href="${process.env.CLIENT_URL}/returns" class="footer-link">Returns</a>
                            </div>

                            <div class="copyright">
                                © ${new Date().getFullYear()} Sigma Clothing. All rights reserved.
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `
        };
    },

    orderCancellation: (order) => ({
        subject: `❌ Order Cancelled - Refund Processing #${order._id?.toString().slice(-8).toUpperCase()}`,
        html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <meta http-equiv="X-UA-Compatible" content="IE=edge">
                ${getEmailBaseStyles()}
            </head>
            <body>
                <div class="email-container">
                    <!-- Header -->
                    <div class="email-header">
                        <div class="logo">SIGMA CLOTHING</div>
                        <div class="tagline">Premium Fashion & Lifestyle</div>
                    </div>

                    <!-- Body -->
                    <div class="email-body">
                        <div class="greeting">Order Cancellation Confirmed</div>

                        <p class="content-text">
                            We've successfully processed your cancellation request.
                            We're sorry to see you go, but we understand that plans can change.
                        </p>

                        <div class="order-details">
                            <div class="detail-row">
                                <span class="detail-label">Order Number</span>
                                <span class="detail-value">#${escapeHtml(order._id?.toString().slice(-8).toUpperCase())}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Cancellation Date</span>
                                <span class="detail-value">${new Date().toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Status</span>
                                <span class="status-badge" style="background-color: #f8d7da; color: #721c24;">CANCELLED</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Order Amount</span>
                                <span class="detail-value">₹${escapeHtml(order.totalAmount?.toString())}</span>
                            </div>
                        </div>

                        ${order.paymentInfo?.status === 'completed' ? `
                            <div style="background-color: #d4edda; border-radius: 12px; padding: 24px; margin: 24px 0; border-left: 4px solid #28a745;">
                                <h3 style="color: #155724; margin-bottom: 16px; font-size: 18px;">💰 Refund Information</h3>
                                <p style="color: #155724; margin-bottom: 12px;">
                                    <strong>Great news!</strong> Your refund of <strong>₹${escapeHtml(order.totalAmount?.toString())}</strong>
                                    has been initiated and will be processed within <strong>5-7 business days</strong>.
                                </p>
                                <p style="color: #155724; font-size: 14px;">
                                    The refund will be credited to your original payment method.
                                    You'll receive a separate confirmation email once the refund is processed.
                                </p>
                            </div>
                        ` : `
                            <div style="background-color: #fff3cd; border-radius: 12px; padding: 24px; margin: 24px 0; border-left: 4px solid #ffc107;">
                                <h3 style="color: #856404; margin-bottom: 16px; font-size: 18px;">💳 Payment Information</h3>
                                <p style="color: #856404;">
                                    Since no payment was processed for this order, no refund is required.
                                    Your order has been cancelled at no charge.
                                </p>
                            </div>
                        `}

                        <p class="content-text">
                            <strong>What happens next?</strong><br>
                            • Your order has been completely cancelled<br>
                            • No items will be shipped to you<br>
                            • You'll receive email updates about your refund status<br>
                            • Feel free to browse our latest collections anytime
                        </p>

                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${process.env.CLIENT_URL}" class="cta-button">
                                Continue Shopping
                            </a>
                        </div>

                        <p class="content-text" style="font-size: 14px; color: #718096;">
                            We'd love to have you back! If you cancelled due to any issues,
                            please let us know at <a href="mailto:support@sigmaclothing.com" style="color: #000000;">support@sigmaclothing.com</a>
                            so we can improve your experience.
                        </p>
                    </div>

                    <!-- Footer -->
                    <div class="email-footer">
                        <div class="footer-content">
                            <strong>SIGMA CLOTHING</strong><br>
                            Elevating everyday fashion with premium quality
                        </div>

                        <div class="footer-links">
                            <a href="${process.env.CLIENT_URL}" class="footer-link">Shop Now</a>
                            <a href="${process.env.CLIENT_URL}/contact" class="footer-link">Contact Us</a>
                            <a href="${process.env.CLIENT_URL}/returns" class="footer-link">Returns</a>
                        </div>

                        <div class="copyright">
                            © ${new Date().getFullYear()} Sigma Clothing. All rights reserved.
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `
    }),

    lowStockAlert: (product) => ({
        subject: `🚨 URGENT: Low Stock Alert - ${product.name}`,
        html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <meta http-equiv="X-UA-Compatible" content="IE=edge">
                ${getEmailBaseStyles()}
                <style>
                    .alert-container {
                        background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
                        color: white;
                        padding: 20px;
                        border-radius: 12px;
                        margin: 20px 0;
                        text-align: center;
                    }
                    .alert-icon {
                        font-size: 48px;
                        margin-bottom: 10px;
                    }
                    .product-info {
                        background-color: #fff5f5;
                        border-radius: 12px;
                        padding: 24px;
                        margin: 24px 0;
                        border-left: 4px solid #ff6b6b;
                    }
                    .stock-level {
                        font-size: 24px;
                        font-weight: 700;
                        color: #dc3545;
                        background-color: #f8d7da;
                        padding: 12px 20px;
                        border-radius: 8px;
                        display: inline-block;
                        margin: 10px 0;
                    }
                </style>
            </head>
            <body>
                <div class="email-container">
                    <!-- Header -->
                    <div class="email-header">
                        <div class="logo">SIGMA CLOTHING</div>
                        <div class="tagline">Admin Dashboard Alert</div>
                    </div>

                    <!-- Body -->
                    <div class="email-body">
                        <div class="alert-container">
                            <div class="alert-icon">🚨</div>
                            <h2 style="margin: 0; font-size: 24px;">URGENT: Low Stock Alert</h2>
                            <p style="margin: 10px 0 0 0; font-size: 16px;">Immediate attention required</p>
                        </div>

                        <p class="content-text">
                            <strong>Alert:</strong> One of your products is running critically low on stock and requires immediate attention to prevent stockouts.
                        </p>

                        <div class="product-info">
                            <h3 style="color: #dc3545; margin-bottom: 20px; font-size: 20px;">📦 Product Details</h3>
                            <div class="detail-row" style="border-bottom: 1px solid #ffebee;">
                                <span class="detail-label">Product Name</span>
                                <span class="detail-value">${escapeHtml(product.name)}</span>
                            </div>
                            <div class="detail-row" style="border-bottom: 1px solid #ffebee;">
                                <span class="detail-label">Category</span>
                                <span class="detail-value">${escapeHtml(product.category)}</span>
                            </div>
                            <div class="detail-row" style="border-bottom: 1px solid #ffebee;">
                                <span class="detail-label">SKU</span>
                                <span class="detail-value">${escapeHtml(product.sku || 'N/A')}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Current Stock Level</span>
                                <div class="stock-level">${escapeHtml(product.stock?.toString())} units</div>
                            </div>
                        </div>

                        <div style="background-color: #fff3cd; border-radius: 12px; padding: 24px; margin: 24px 0; border-left: 4px solid #ffc107;">
                            <h3 style="color: #856404; margin-bottom: 16px; font-size: 18px;">⚠️ Recommended Actions</h3>
                            <ul style="color: #856404; margin: 0; padding-left: 20px;">
                                <li style="margin-bottom: 8px;">Review and update inventory immediately</li>
                                <li style="margin-bottom: 8px;">Contact suppliers for urgent restocking</li>
                                <li style="margin-bottom: 8px;">Consider temporarily hiding the product if stock reaches zero</li>
                                <li style="margin-bottom: 8px;">Update product availability status on the website</li>
                                <li>Set up automated reorder points to prevent future stockouts</li>
                            </ul>
                        </div>

                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${process.env.CLIENT_URL}/admin/products" class="cta-button">
                                Manage Inventory
                            </a>
                        </div>

                        <p class="content-text" style="font-size: 14px; color: #718096;">
                            This alert was automatically generated by the Sigma Clothing inventory management system.
                            Please take immediate action to prevent customer disappointment and lost sales.
                        </p>
                    </div>

                    <!-- Footer -->
                    <div class="email-footer">
                        <div class="footer-content">
                            <strong>SIGMA CLOTHING</strong><br>
                            Admin Dashboard System
                        </div>

                        <div class="footer-links">
                            <a href="${process.env.CLIENT_URL}/admin" class="footer-link">Admin Dashboard</a>
                            <a href="${process.env.CLIENT_URL}/admin/products" class="footer-link">Manage Products</a>
                            <a href="${process.env.CLIENT_URL}/admin/inventory" class="footer-link">Inventory</a>
                        </div>

                        <div class="copyright">
                            © ${new Date().getFullYear()} Sigma Clothing. All rights reserved.<br>
                            This is an automated system alert.
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `
    }),

    welcomeEmail: (user) => ({
        subject: '🎉 Welcome to Sigma Clothing - Your Premium Fashion Journey Begins!',
        html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <meta http-equiv="X-UA-Compatible" content="IE=edge">
                ${getEmailBaseStyles()}
            </head>
            <body>
                <div class="email-container">
                    <!-- Header -->
                    <div class="email-header">
                        <div class="logo">SIGMA CLOTHING</div>
                        <div class="tagline">Premium Fashion & Lifestyle</div>
                    </div>

                    <!-- Body -->
                    <div class="email-body">
                        <div class="greeting">Welcome to Sigma Clothing! 🎉</div>

                        <p class="content-text">
                            Hello <strong>${escapeHtml(user.fullName)}</strong>!
                        </p>

                        <p class="content-text">
                            We're absolutely thrilled to welcome you to the Sigma Clothing family!
                            Thank you for choosing us as your destination for premium fashion and lifestyle products.
                        </p>

                        <div style="background-color: #f8f9fa; border-radius: 12px; padding: 24px; margin: 24px 0; border-left: 4px solid #000000;">
                            <h3 style="color: #1a1a1a; margin-bottom: 16px; font-size: 18px;">✨ Your Account Benefits</h3>
                            <ul style="color: #4a5568; margin: 0; padding-left: 20px; line-height: 1.8;">
                                <li style="margin-bottom: 8px;"><strong>Curated Collections:</strong> Browse our handpicked premium fashion items</li>
                                <li style="margin-bottom: 8px;"><strong>Personal Wishlist:</strong> Save favorites and get sale notifications</li>
                                <li style="margin-bottom: 8px;"><strong>Order Tracking:</strong> Real-time updates from purchase to delivery</li>
                                <li><strong>Exclusive Offers:</strong> Member-only discounts and early access</li>
                            </ul>
                        </div>

                        <div style="background: linear-gradient(135deg, #000000 0%, #2c2c2c 100%); color: white; padding: 32px 24px; border-radius: 12px; text-align: center; margin: 32px 0;">
                            <h3 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 700; color: white;">🎁 WELCOME GIFT</h3>
                            <p style="margin: 0 0 20px 0; font-size: 16px; color: white;">
                                Enjoy <strong style="font-size: 20px;">15% OFF</strong> on your first order!
                            </p>
                            <div style="background-color: #ffffff; color: #000000; padding: 12px 24px; border-radius: 8px; font-family: 'Courier New', monospace; font-size: 18px; font-weight: 700; letter-spacing: 2px; margin: 16px auto; display: inline-block; border: 2px dashed #cccccc;">
                                WELCOME15
                            </div>
                            <p style="margin: 16px 0 0 0; font-size: 12px; opacity: 0.8; color: white;">
                                Valid for 30 days • Minimum order ₹999
                            </p>
                        </div>

                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${process.env.CLIENT_URL}" class="cta-button">
                                Start Shopping Now
                            </a>
                        </div>

                        <p class="content-text">
                            <strong>What's next?</strong><br>
                            • Complete your profile for personalized recommendations<br>
                            • Follow us on social media for style inspiration<br>
                            • Subscribe to our newsletter for exclusive updates<br>
                            • Explore our size guide for the perfect fit
                        </p>

                        <p class="content-text" style="font-size: 14px; color: #718096;">
                            Need help getting started? Our customer support team is here to assist you 24/7.
                            Reach out to us at <a href="mailto:support@sigmaclothing.com" style="color: #000000;">support@sigmaclothing.com</a>
                        </p>
                    </div>

                    <!-- Footer -->
                    <div class="email-footer">
                        <div class="footer-content">
                            <strong>SIGMA CLOTHING</strong><br>
                            Elevating everyday fashion with premium quality
                        </div>

                        <div class="footer-links">
                            <a href="${process.env.CLIENT_URL}" class="footer-link">Shop Now</a>
                            <a href="${process.env.CLIENT_URL}/collections" class="footer-link">Collections</a>
                            <a href="${process.env.CLIENT_URL}/about" class="footer-link">About Us</a>
                            <a href="${process.env.CLIENT_URL}/contact" class="footer-link">Contact</a>
                        </div>

                        <div class="social-links">
                            <a href="#" class="social-link">Instagram</a>
                            <a href="#" class="social-link">Facebook</a>
                            <a href="#" class="social-link">Twitter</a>
                        </div>

                        <div class="copyright">
                            © ${new Date().getFullYear()} Sigma Clothing. All rights reserved.<br>
                            You're receiving this because you created an account with us.
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `
    }),

    passwordReset: (resetUrl) => ({
        subject: '🔐 Reset Your Sigma Clothing Password - Secure Link Inside',
        html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <meta http-equiv="X-UA-Compatible" content="IE=edge">
                ${getEmailBaseStyles()}
                <style>
                    .security-notice {
                        background-color: #fff3cd;
                        border-left: 4px solid #ffc107;
                        padding: 20px;
                        border-radius: 8px;
                        margin: 24px 0;
                    }
                    .security-icon {
                        font-size: 48px;
                        text-align: center;
                        margin-bottom: 20px;
                    }
                    .reset-button {
                        display: inline-block;
                        background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
                        color: #ffffff;
                        padding: 18px 36px;
                        text-decoration: none;
                        border-radius: 8px;
                        font-weight: 600;
                        font-size: 16px;
                        margin: 20px 0;
                        transition: all 0.3s ease;
                        box-shadow: 0 4px 15px rgba(220, 53, 69, 0.3);
                    }
                    .reset-button:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 8px 25px rgba(220, 53, 69, 0.4);
                    }
                    .expiry-notice {
                        background-color: #f8d7da;
                        color: #721c24;
                        padding: 16px;
                        border-radius: 8px;
                        margin: 20px 0;
                        text-align: center;
                        font-weight: 600;
                    }
                    .backup-link {
                        background-color: #f8f9fa;
                        border: 1px solid #dee2e6;
                        border-radius: 8px;
                        padding: 16px;
                        margin: 20px 0;
                        font-size: 12px;
                        color: #6c757d;
                        word-break: break-all;
                    }
                </style>
            </head>
            <body>
                <div class="email-container">
                    <!-- Header -->
                    <div class="email-header">
                        <div class="logo">SIGMA CLOTHING</div>
                        <div class="tagline">Premium Fashion & Lifestyle</div>
                    </div>

                    <!-- Body -->
                    <div class="email-body">
                        <div class="security-icon">🔐</div>

                        <div class="greeting">Password Reset Request</div>

                        <p class="content-text">
                            Hello! We received a request to reset the password for your Sigma Clothing account.
                            If you made this request, click the button below to create a new password.
                        </p>

                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${resetUrl}" class="reset-button">
                                Reset My Password
                            </a>
                        </div>

                        <div class="expiry-notice">
                            ⏰ This link will expire in 1 hour for your security
                        </div>

                        <div class="security-notice">
                            <h3 style="color: #856404; margin-bottom: 12px; font-size: 16px;">🛡️ Security Information</h3>
                            <ul style="color: #856404; margin: 0; padding-left: 20px; font-size: 14px;">
                                <li style="margin-bottom: 8px;">This link can only be used once</li>
                                <li style="margin-bottom: 8px;">It will expire automatically after 1 hour</li>
                                <li style="margin-bottom: 8px;">Only you should have access to this email</li>
                                <li>Never share this link with anyone</li>
                            </ul>
                        </div>

                        <p class="content-text">
                            <strong>Didn't request this?</strong><br>
                            If you didn't request a password reset, you can safely ignore this email.
                            Your password will remain unchanged, and no further action is required.
                        </p>

                        <p class="content-text">
                            However, if you're concerned about the security of your account,
                            please contact our support team immediately.
                        </p>

                        <div style="background-color: #d1ecf1; border-radius: 12px; padding: 20px; margin: 24px 0; border-left: 4px solid #17a2b8;">
                            <h3 style="color: #0c5460; margin-bottom: 12px; font-size: 16px;">💡 Password Security Tips</h3>
                            <ul style="color: #0c5460; margin: 0; padding-left: 20px; font-size: 14px;">
                                <li style="margin-bottom: 6px;">Use a unique password for your Sigma account</li>
                                <li style="margin-bottom: 6px;">Include uppercase, lowercase, numbers, and symbols</li>
                                <li style="margin-bottom: 6px;">Make it at least 8 characters long</li>
                                <li>Consider using a password manager</li>
                            </ul>
                        </div>

                        <div class="backup-link">
                            <strong>Having trouble with the button?</strong><br>
                            Copy and paste this URL into your web browser:<br>
                            ${resetUrl}
                        </div>

                        <p class="content-text" style="font-size: 14px; color: #718096;">
                            Need help? Our security team is available 24/7 at
                            <a href="mailto:security@sigmaclothing.com" style="color: #000000;">security@sigmaclothing.com</a>
                        </p>
                    </div>

                    <!-- Footer -->
                    <div class="email-footer">
                        <div class="footer-content">
                            <strong>SIGMA CLOTHING</strong><br>
                            Elevating everyday fashion with premium quality
                        </div>

                        <div class="footer-links">
                            <a href="${process.env.CLIENT_URL}" class="footer-link">Shop Now</a>
                            <a href="${process.env.CLIENT_URL}/contact" class="footer-link">Contact Us</a>
                            <a href="${process.env.CLIENT_URL}/security" class="footer-link">Security</a>
                        </div>

                        <div class="copyright">
                            © ${new Date().getFullYear()} Sigma Clothing. All rights reserved.<br>
                            This is a security-related email sent to protect your account.
                        </div>
                    </div>
                </div>
            </body>
            </html>
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

        const info = await transporter.sendMail(enhancedMailOptions);
        return { success: true, info };
    } catch (error) {
        throw error;
    }
};

const sendPasswordResetEmail = async (email, resetToken) => {
    try {
        // Validate email format to prevent injection
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new Error('Invalid email format');
        }

        // Validate reset token format
        if (!/^[a-f0-9]{64}$/.test(resetToken)) {
            throw new Error('Invalid reset token format');
        }



        const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
        const template = templates.passwordReset(resetUrl);

        const mailOptions = {
            from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
            to: email,
            subject: template.subject,
            html: template.html
        };

        const result = await sendEmail(mailOptions);
        return result;
    } catch (error) {
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
        throw new Error('Failed to send order confirmation email');
    }
};

// Specific email sending functions
exports.sendOrderStatusUpdate = async (order) => {
    try {
        // Ensure the order has user details populated
        let populatedOrder = order;
        if (!order.userId || !order.userId.email) {
            if (order.populate) {
                populatedOrder = await order.populate('userId', 'email fullName');
            } else {
                // If order is already a plain object, skip email sending
                return { success: false, error: 'Order not properly populated' };
            }
        }

        const template = templates.orderStatusUpdate(populatedOrder);

        const mailOptions = {
            to: populatedOrder.userId.email,
            subject: template.subject,
            html: template.html
        };

        const result = await sendEmail(mailOptions);

        return result;
    } catch (error) {
        // Don't throw error to prevent blocking the status update
        return { success: false, error: error.message };
    }
};

exports.sendOrderCancellation = async (order) => {
    try {
        // Ensure the order has user details populated
        let populatedOrder = order;
        if (!order.userId || !order.userId.email) {
            if (order.populate) {
                populatedOrder = await order.populate('userId', 'email fullName');
            } else {
                // If order is already a plain object, skip email sending
                return { success: false, error: 'Order not properly populated' };
            }
        }

        const template = templates.orderCancellation(populatedOrder);

        const mailOptions = {
            to: populatedOrder.userId.email || populatedOrder.email,
            subject: template.subject,
            html: template.html
        };

        return await sendEmail(mailOptions);
    } catch (error) {
        throw new Error('Failed to send order cancellation email');
    }
};

exports.sendLowStockAlert = async (product) => {
    try {
        const template = templates.lowStockAlert(product);

        // Send to admin email - use environment variable or default
        const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_FROM_ADDRESS;

        const mailOptions = {
            to: adminEmail,
            subject: template.subject,
            html: template.html
        };

        return await sendEmail(mailOptions);
    } catch (error) {
        throw new Error('Failed to send low stock alert email');
    }
};

exports.sendWelcomeEmail = async (user) => {
    try {
        const template = templates.welcomeEmail(user);

        const mailOptions = {
            to: user.email,
            subject: template.subject,
            html: template.html
        };

        return await sendEmail(mailOptions);
    } catch (error) {
        throw new Error('Failed to send welcome email');
    }
};

module.exports = {
    sendPasswordResetEmail,
    sendOrderConfirmation,
    sendEmail,
    sendOrderStatusUpdate: exports.sendOrderStatusUpdate,
    sendOrderCancellation: exports.sendOrderCancellation,
    sendLowStockAlert: exports.sendLowStockAlert,
    sendWelcomeEmail: exports.sendWelcomeEmail
};