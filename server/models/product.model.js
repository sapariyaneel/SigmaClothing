const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true,
        maxlength: [100, 'Product name cannot exceed 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Product description is required'],
        maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    price: {
        type: Number,
        required: [true, 'Product price is required'],
        min: [0, 'Price cannot be negative']
    },
    discountPrice: {
        type: Number,
        min: [0, 'Discount price cannot be negative']
    },
    category: {
        type: String,
        required: [true, 'Product category is required'],
        enum: {
            values: ['men', 'women', 'accessories'],
            message: 'Please select correct category'
        }
    },
    subCategory: {
        type: String,
        required: [true, 'Product subcategory is required']
    },
    sizes: [{
        type: String,
        required: [true, 'Size is required'],
        enum: {
            values: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'Free Size'],
            message: 'Please select valid size'
        }
    }],
    images: [{
        type: String,
        validate: {
            validator: function(v) {
                // Allow empty string or valid URL
                return !v || v.startsWith('http') || v.startsWith('/');
            },
            message: props => `${props.value} is not a valid image URL`
        }
    }],
    stock: {
        type: Number,
        required: [true, 'Product stock is required'],
        min: [0, 'Stock cannot be negative']
    },
    ratings: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },
        review: String,
        date: {
            type: Date,
            default: Date.now
        }
    }],
    averageRating: {
        type: Number,
        default: 0,
        min: [0, 'Rating cannot be below 0'],
        max: [5, 'Rating cannot exceed 5']
    },
    tags: [{
        type: String,
        trim: true
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    imagePosition: {
        type: String,
        default: 'center',
        enum: ['center', 'top', 'bottom', 'left', 'right', 'top left', 'top center', 'top right', 
               'center left', 'center center', 'center right', 
               'bottom left', 'bottom center', 'bottom right']
    },
    imageScale: {
        type: Number,
        default: 1,
        min: [0.1, 'Image scale cannot be less than 0.1'],
        max: [2, 'Image scale cannot exceed 2']
    },
    imageFit: {
        type: String,
        default: 'cover',
        enum: ['cover', 'contain', 'fill', 'scale-down']
    }
}, {
    timestamps: true
});

// Add text index for search functionality
productSchema.index({ 
    name: 'text', 
    description: 'text', 
    tags: 'text' 
});

// Calculate average rating before saving
productSchema.pre('save', function(next) {
    if (this.ratings && this.ratings.length > 0) {
        const avg = this.ratings.reduce((acc, item) => acc + item.rating, 0) / this.ratings.length;
        this.averageRating = Math.round(avg * 10) / 10; // Round to 1 decimal place
    } else {
        this.averageRating = 0;
    }
    next();
});

// Method to check if product is in stock
productSchema.methods.isInStock = function() {
    return this.stock > 0;
};

// Method to calculate discount percentage
productSchema.methods.getDiscountPercentage = function() {
    if (!this.discountPrice) return 0;
    return Math.round(((this.price - this.discountPrice) / this.price) * 100);
};

const Product = mongoose.model('Product', productSchema);
module.exports = Product; 