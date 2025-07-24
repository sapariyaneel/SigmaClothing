/**
 * Performance monitoring utilities for tracking image loading and overall performance
 */

// Performance metrics storage
const performanceMetrics = {
  imageLoads: [],
  pageLoads: [],
  userInteractions: [],
  lcp: null,
  fid: null,
  cls: null
};

/**
 * Track image loading performance
 * @param {string} imageUrl - The URL of the image being loaded
 * @param {number} startTime - When the image loading started
 * @param {number} endTime - When the image loading completed
 * @param {boolean} success - Whether the image loaded successfully
 */
export const trackImageLoad = (imageUrl, startTime, endTime, success = true) => {
  if (process.env.NODE_ENV === 'development') {
    const loadTime = endTime - startTime;
    performanceMetrics.imageLoads.push({
      url: imageUrl,
      loadTime,
      success,
      timestamp: Date.now()
    });

    // Only log extremely slow image loads to reduce console noise
    if (loadTime > 5000) {
      console.warn(`Very slow image load detected: ${imageUrl} took ${loadTime}ms`);
    }
  }
};

/**
 * Track page load performance
 * @param {string} pageName - Name of the page
 */
export const trackPageLoad = (pageName) => {
  if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
    const navigation = performance.getEntriesByType('navigation')[0];
    if (navigation) {
      performanceMetrics.pageLoads.push({
        page: pageName,
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        timestamp: Date.now()
      });
    }
  }
};

/**
 * Track user interactions (clicks, scrolls, etc.)
 * @param {string} action - The action performed
 * @param {string} element - The element interacted with
 */
export const trackUserInteraction = (action, element) => {
  if (process.env.NODE_ENV === 'development') {
    performanceMetrics.userInteractions.push({
      action,
      element,
      timestamp: Date.now()
    });
  }
};

/**
 * Get performance metrics summary
 * @returns {Object} Performance metrics summary
 */
export const getPerformanceMetrics = () => {
  if (process.env.NODE_ENV === 'development') {
    const imageMetrics = performanceMetrics.imageLoads;
    const avgImageLoadTime = imageMetrics.length > 0 
      ? imageMetrics.reduce((sum, metric) => sum + metric.loadTime, 0) / imageMetrics.length 
      : 0;
    
    const slowImages = imageMetrics.filter(metric => metric.loadTime > 2000);
    const failedImages = imageMetrics.filter(metric => !metric.success);
    
    return {
      images: {
        total: imageMetrics.length,
        averageLoadTime: Math.round(avgImageLoadTime),
        slowLoads: slowImages.length,
        failures: failedImages.length,
        slowImageUrls: slowImages.map(img => img.url)
      },
      pages: performanceMetrics.pageLoads,
      interactions: performanceMetrics.userInteractions.length
    };
  }
  
  return null;
};

/**
 * Clear performance metrics
 */
export const clearPerformanceMetrics = () => {
  if (process.env.NODE_ENV === 'development') {
    performanceMetrics.imageLoads = [];
    performanceMetrics.pageLoads = [];
    performanceMetrics.userInteractions = [];
  }
};

/**
 * Log performance summary to console
 */
export const logPerformanceSummary = () => {
  if (process.env.NODE_ENV === 'development') {
    const metrics = getPerformanceMetrics();
    if (metrics) {
      console.group('🚀 Performance Summary');
      console.log('📸 Images:', metrics.images);
      console.log('📄 Pages:', metrics.pages);
      console.log('👆 Interactions:', metrics.interactions);
      console.groupEnd();
    }
  }
};

/**
 * Monitor Core Web Vitals
 */
export const monitorCoreWebVitals = () => {
  if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
    // Monitor Largest Contentful Paint (LCP) - silent tracking
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      // Store LCP value without logging
      performanceMetrics.lcp = Math.round(lastEntry.startTime);
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // Monitor First Input Delay (FID) - silent tracking
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry) => {
        // Store FID value without logging
        performanceMetrics.fid = Math.round(entry.processingStart - entry.startTime);
      });
    }).observe({ entryTypes: ['first-input'] });

    // Monitor Cumulative Layout Shift (CLS) - silent tracking
    let clsValue = 0;
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      // Store CLS value without logging
      performanceMetrics.cls = clsValue.toFixed(4);
    }).observe({ entryTypes: ['layout-shift'] });
  }
};

/**
 * Enhanced image preloader with performance tracking
 * @param {string} src - Image source URL
 * @returns {Promise} Promise that resolves when image is loaded
 */
export const preloadImageWithTracking = (src) => {
  return new Promise((resolve, reject) => {
    const startTime = performance.now();
    const img = new Image();
    
    img.onload = () => {
      const endTime = performance.now();
      trackImageLoad(src, startTime, endTime, true);
      resolve(img);
    };
    
    img.onerror = () => {
      const endTime = performance.now();
      trackImageLoad(src, startTime, endTime, false);
      reject(new Error(`Failed to load image: ${src}`));
    };
    
    img.src = src;
  });
};

// Initialize performance monitoring on page load
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  window.addEventListener('load', () => {
    monitorCoreWebVitals();

    // Performance summary is available via window.performanceUtils.logSummary()
    // Removed automatic logging to reduce console noise
  });

  // Make performance utilities available globally in development
  window.performanceUtils = {
    getMetrics: getPerformanceMetrics,
    clearMetrics: clearPerformanceMetrics,
    logSummary: logPerformanceSummary
  };
}

export default {
  trackImageLoad,
  trackPageLoad,
  trackUserInteraction,
  getPerformanceMetrics,
  clearPerformanceMetrics,
  logPerformanceSummary,
  monitorCoreWebVitals,
  preloadImageWithTracking
};
