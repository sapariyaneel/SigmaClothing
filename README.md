# Sigma Clothing

A full-stack e-commerce platform for clothing and accessories.

## Features

- User authentication and authorization
- Product catalog with categories and filters
- Shopping cart and wishlist functionality
- Secure payment integration with Razorpay
- Admin dashboard for product and order management
- Responsive design for all devices
- Image optimization with Cloudinary
- Email notifications for orders and updates

## Tech Stack

### Frontend
- React.js
- Redux Toolkit for state management
- Tailwind CSS for styling
- Axios for API calls
- React Router for navigation

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- Cloudinary for image management
- Nodemailer for email services

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- Cloudinary account
- Gmail account (for email notifications)

### Installation

1. Clone the repository
```bash
git clone https://github.com/sapariyaneel/sigmaclothing.git
cd sigmaclothing
```

2. Install server dependencies
```bash
cd server
npm install
```

3. Install client dependencies
```bash
cd ../client
npm install
```

4. Set up environment variables:

Create `.env` file in server directory with:
```
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=your_mongodb_uri

# Authentication (Required - Use a strong secret of at least 32 characters)
JWT_SECRET=your_very_long_and_secure_jwt_secret_key_here

# Cloudinary (Required for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# CORS Configuration (Optional - defaults provided)
ALLOWED_ORIGINS=https://yourdomain.com,http://localhost:5173,http://localhost:3000

# Email Configuration (Optional - for notifications)
EMAIL_SERVICE=gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email
EMAIL_PASSWORD=your_email_password

# Payment Gateway (Optional - for Razorpay integration)
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Admin User Creation (Required for admin script)
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=your_secure_admin_password
ADMIN_FULL_NAME=Admin User
ADMIN_PHONE=your_admin_phone

# Logging (Optional)
LOG_LEVEL=DEBUG
```

Create `.env` file in client directory with:
```
VITE_API_URL=http://localhost:5000
VITE_RAZORPAY_KEY_ID=your_razorpay_key
```

5. Start the development servers:

For backend:
```bash
cd server
npm run dev
```

For frontend:
```bash
cd client
npm run dev
```

## Security Features

This application implements several security measures:

- **Authentication**: JWT-based authentication with secure token generation
- **Input Validation**: Comprehensive input sanitization and validation
- **File Upload Security**: Secure file upload with type and size validation
- **Rate Limiting**: Protection against brute force and DDoS attacks
- **CORS Protection**: Configurable CORS policy for cross-origin requests
- **Environment Validation**: Startup validation of required environment variables
- **Error Handling**: Secure error responses that don't leak sensitive information
- **NoSQL Injection Protection**: Input sanitization to prevent NoSQL injection attacks

### Security Best Practices

1. **Use Strong JWT Secret**: Ensure `JWT_SECRET` is at least 32 characters long
2. **Environment Variables**: Never commit `.env` files to version control
3. **HTTPS in Production**: Always use HTTPS in production environments
4. **Regular Updates**: Keep dependencies updated to patch security vulnerabilities
5. **Input Validation**: All user inputs are validated and sanitized
6. **File Upload Limits**: File uploads are limited in size and type

## Deployment

The application is deployed using:
- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas
- Image Storage: Cloudinary

Live demo: [https://sigmaclothing.vercel.app](https://sigmaclothing.vercel.app)

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](https://choosealicense.com/licenses/mit/)