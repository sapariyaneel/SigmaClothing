import axios from 'axios';
import store from '../store';
import { logout } from '../store/slices/authSlice';
import { cacheGet, cacheSet, CACHE_KEYS } from './cache';

// Get the API URL from environment variables with production fallback
const API_URL = import.meta.env.VITE_API_URL || 'https://sigmaclothing-api.onrender.com';

// Log environment configuration
console.log('Environment Configuration:', {
    VITE_API_URL: import.meta.env.VITE_API_URL,
    MODE: import.meta.env.MODE,
    DEV: import.meta.env.DEV,
    PROD: import.meta.env.PROD
});

// Ensure the URL ends with /api
const baseURL = API_URL.endsWith('/api') ? API_URL : `${API_URL}/api`;

console.log('API Configuration:', {
    API_URL,
    baseURL,
    NODE_ENV: import.meta.env.MODE,
    DEV: import.meta.env.DEV
});

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
    // Log the request URL and method
    console.log(`🚀 [${config.method.toUpperCase()}] ${config.url}`, {
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      params: config.params,
      data: config.data
    });

    // Don't set Content-Type for FormData (let browser set it with boundary)
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    // Add timestamp to GET requests to prevent caching issues in development
    if (config.method === 'get' && import.meta.env.DEV) {
      config.params = {
        ...config.params,
        _t: Date.now()
      };
    }

    // Get token from localStorage
    const token = localStorage.getItem('token');
    const adminData = localStorage.getItem('adminData');

    // If it's an admin route and we have admin data
    if (config.url.startsWith('/admin') && adminData) {
      const parsedAdminData = JSON.parse(adminData);
      if (parsedAdminData && parsedAdminData.token) {
        config.headers.Authorization = `Bearer ${parsedAdminData.token}`;
      }
    }
    // For regular routes
    else if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    // Log successful response
    console.log(`✅ [${response.config.method.toUpperCase()}] ${response.config.url}`, {
      status: response.status,
      data: response.data
    });

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
    // Detailed error logging
    console.error('❌ Response Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.response?.data?.message || error.message,
      fullURL: error.config ? `${error.config.baseURL}${error.config.url}` : null
    });

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