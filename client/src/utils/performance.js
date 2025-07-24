// Debounce function to limit the rate at which a function fires
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle function to ensure a function is called at most once in a specified time period
export const throttle = (func, limit) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Memoize function results
export const memoize = (fn) => {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};

// Image preloader
export const preloadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

// Batch DOM updates
export const batchUpdate = (updates) => {
  return new Promise(resolve => {
    requestAnimationFrame(() => {
      updates();
      resolve();
    });
  });
};

// Check if intersection observer is supported
export const supportsIntersectionObserver = () => {
  return 'IntersectionObserver' in window;
};

// Create a simple intersection observer
export const createObserver = (callback, options = {}) => {
  if (!supportsIntersectionObserver()) return null;
  return new IntersectionObserver(callback, {
    root: null,
    rootMargin: '0px',
    threshold: 0.1,
    ...options
  });
}; 