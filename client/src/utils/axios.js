import axios from 'axios';
import store from '../store';
import { logout } from '../store/slices/authSlice';
import { cacheGet, cacheSet, CACHE_KEYS } from './cache';

// Get the API URL from environment variables with production fallback
const API_URL = import.meta.env.VITE_API_URL || 'https://sigmaclothing-api.onrender.com';

// Ensure the URL ends with /api
const baseURL = API_URL.endsWith('/api') ? API_URL : `${API_URL}/api`;



// Cache configuration for different endpoints
const cacheConfig = {
  '/products': { key: CACHE_KEYS.PRODUCTS, ttl: 5 * 60 * 1000 }, // 5 minutes
  '/products/:id': { key: (id) => CACHE_KEYS.PRODUCT_DETAILS(id), ttl: 5 * 60 * 1000 },
  '/categories': { key: CACHE_KEYS.CATEGORIES, ttl: 30 * 60 * 1000 }, // 30 minutes
  '/orders/my-orders': { key: CACHE_KEYS.USER_ORDERS, ttl: 2 * 60 * 1000 }, // 2 minutes
  '/orders/:id': { key: (id) => CACHE_KEYS.ORDER_DETAILS(id), ttl: 2 * 60 * 1000 },
};

// Helper to check if request should be cached
const shouldCache = (config) => {
  return config.method === 'get' && // Only cache GET requests
    !config.noCache && // Allow cache bypass
    Object.keys(cacheConfig).some(pattern => {
      const regex = new RegExp(pattern.replace(/:\w+/g, '[^/]+') + '$');
      return regex.test(config.url);
    });
};

// Helper to get cache key for a request
const getCacheKey = (url) => {
  for (const [pattern, config] of Object.entries(cacheConfig)) {
    const regex = new RegExp(pattern.replace(/:\w+/g, '([^/]+)') + '$');
    const match = url.match(regex);
    if (match) {
      return typeof config.key === 'function' 
        ? config.key(match[1])
        : config.key;
    }
  }
  return null;
};

// Helper to get cache TTL for a request
const getCacheTTL = (url) => {
  for (const [pattern, config] of Object.entries(cacheConfig)) {
    const regex = new RegExp(pattern.replace(/:\w+/g, '[^/]+') + '$');
    if (regex.test(url)) {
      return config.ttl;
    }
  }
  return null;
};

const axiosInstance = axios.create({
  baseURL,
  withCredentials: false, // Changed to false since we're using token-based auth
  timeout: 30000, // Increased timeout for file uploads
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request interceptor
axiosInstance.interceptors.request.use(
  async (config) => {
    // Don't set Content-Type for FormData (let browser set it with boundary)
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    // Get token from localStorage
    const token = localStorage.getItem('token');

    // Use the token for all authenticated requests
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    // Cache successful GET responses
    if (shouldCache(response.config) && !response.cached) {
      const cacheKey = getCacheKey(response.config.url);
      const ttl = getCacheTTL(response.config.url);
      if (cacheKey && ttl) {
        cacheSet(cacheKey, response.data, ttl);
      }
    }

    return response;
  },
  async (error) => {
    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401) {
      if (!error.config.url.includes('/auth/')) {
        localStorage.removeItem('token');
        localStorage.removeItem('adminData');
        store.dispatch(logout());
      }
    }

    return Promise.reject(error);
  }
);

// Export the configured axios instance
export default axiosInstance; 