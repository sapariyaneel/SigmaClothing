const mongoose = require('mongoose');

const featuredSchema = new mongoose.Schema({
    category: {
        type: String,
        required: true,
        enum: ['men', 'women', 'accessories']
    },
    products: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    }],
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

// Pre-save middleware to ensure products array is not reset
featuredSchema.pre('save', async function(next) {
    if (this.isNew && !this.products) {
        this.products = [];
    }
    next();
});

// Initialize featured collections for all categories if they don't exist
featuredSchema.statics.initializeCategories = async function() {
    try {
        const categories = ['men', 'women', 'accessories'];
        const operations = categories.map(category => {
            return this.findOneAndUpdate(
                { category },
                { category },
                { 
                    upsert: true, 
                    new: true,
                    setDefaultsOnInsert: true,
                    runValidators: true
                }
            );
        });
        
        await Promise.all(operations);
    } catch (error) {
        console.error('Error initializing featured categories:', error);
    }
};

const Featured = mongoose.model('Featured', featuredSchema);

// Initialize categories when the model is first loaded
Featured.initializeCategories().catch(console.error);

module.exports = Featured; 