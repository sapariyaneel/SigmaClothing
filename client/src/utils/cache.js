// Cache configuration
const CACHE_PREFIX = 'sigma_clothing_';
const DEFAULT_CACHE_TIME = 5 * 60 * 1000; // 5 minutes

// Cache keys for different resources
export const CACHE_KEYS = {
    PRODUCTS: `${CACHE_PREFIX}products`,
    PRODUCT_DETAILS: (id) => `${CACHE_PREFIX}product_${id}`,
    CATEGORIES: `${CACHE_PREFIX}categories`,
    USER_ORDERS: `${CACHE_PREFIX}user_orders`,
    ORDER_DETAILS: (id) => `${CACHE_PREFIX}order_${id}`,
    CART: `${CACHE_PREFIX}cart`,
    WISHLIST: `${CACHE_PREFIX}wishlist`,
};

// Cache helper functions
export const cacheGet = (key) => {
    try {
        const item = localStorage.getItem(key);
        if (!item) return null;

        const { value, timestamp, expiresIn } = JSON.parse(item);
        
        // Check if cache has expired
        if (Date.now() - timestamp > expiresIn) {
            localStorage.removeItem(key);
            return null;
        }

        return value;
    } catch (error) {
        console.error('Cache get error:', error);
        return null;
    }
};

export const cacheSet = (key, value, expiresIn = DEFAULT_CACHE_TIME) => {
    try {
        const item = {
            value,
            timestamp: Date.now(),
            expiresIn,
        };
        localStorage.setItem(key, JSON.stringify(item));
    } catch (error) {
        console.error('Cache set error:', error);
    }
};

export const cacheRemove = (key) => {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error('Cache remove error:', error);
    }
};

export const cacheClear = (prefix = CACHE_PREFIX) => {
    try {
        Object.keys(localStorage)
            .filter(key => key.startsWith(prefix))
            .forEach(key => localStorage.removeItem(key));
    } catch (error) {
        console.error('Cache clear error:', error);
    }
};

// Cache invalidation helper
export const invalidateCache = (patterns) => {
    if (!Array.isArray(patterns)) {
        patterns = [patterns];
    }

    patterns.forEach(pattern => {
        if (typeof pattern === 'function') {
            // If pattern is a function (like CACHE_KEYS.PRODUCT_DETAILS),
            // we can't invalidate it directly, so we search for matching keys
            Object.keys(localStorage)
                .filter(key => key.startsWith(CACHE_PREFIX))
                .forEach(key => {
                    if (key.match(pattern.toString())) {
                        localStorage.removeItem(key);
                    }
                });
        } else {
            localStorage.removeItem(pattern);
        }
    });
}; 