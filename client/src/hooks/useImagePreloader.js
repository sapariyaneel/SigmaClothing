import { useState, useEffect, useCallback } from 'react';
import { trackImageLoad } from '../utils/performanceMonitor';

/**
 * Custom hook for preloading images with loading states and error handling
 * @param {string|string[]} images - Single image URL or array of image URLs
 * @param {Object} options - Configuration options
 * @returns {Object} - Loading state, error state, and preload function
 */
export const useImagePreloader = (images = [], options = {}) => {
  const {
    priority = false, // Whether to preload immediately
    timeout = 10000, // Timeout for image loading
    retryCount = 2, // Number of retry attempts
  } = options;

  const [loadingStates, setLoadingStates] = useState({});
  const [errorStates, setErrorStates] = useState({});
  const [allLoaded, setAllLoaded] = useState(false);

  const imageArray = Array.isArray(images) ? images : [images];
  const imageArrayString = JSON.stringify(imageArray); // Stable reference for dependencies

  const preloadImage = useCallback((src, retries = retryCount) => {
    return new Promise((resolve, reject) => {
      if (!src) {
        reject(new Error('No image source provided'));
        return;
      }

      const img = new Image();
      const startTime = performance.now();
      let timeoutId;

      const cleanup = () => {
        if (timeoutId) clearTimeout(timeoutId);
        img.onload = null;
        img.onerror = null;
      };

      const handleLoad = () => {
        const endTime = performance.now();
        trackImageLoad(src, startTime, endTime, true);
        cleanup();
        setLoadingStates(prev => ({ ...prev, [src]: false }));
        setErrorStates(prev => ({ ...prev, [src]: false }));
        resolve(img);
      };

      const handleError = () => {
        const endTime = performance.now();
        trackImageLoad(src, startTime, endTime, false);
        cleanup();
        if (retries > 0) {
          // Retry loading
          setTimeout(() => {
            preloadImage(src, retries - 1).then(resolve).catch(reject);
          }, 1000);
        } else {
          setLoadingStates(prev => ({ ...prev, [src]: false }));
          setErrorStates(prev => ({ ...prev, [src]: true }));
          reject(new Error(`Failed to load image: ${src}`));
        }
      };

      // Set timeout
      if (timeout > 0) {
        timeoutId = setTimeout(() => {
          cleanup();
          handleError();
        }, timeout);
      }

      // Set loading state
      setLoadingStates(prev => ({ ...prev, [src]: true }));
      setErrorStates(prev => ({ ...prev, [src]: false }));

      img.onload = handleLoad;
      img.onerror = handleError;
      img.src = src;
    });
  }, [retryCount, timeout]);

  const preloadImages = useCallback(async (imagesToLoad = imageArray) => {
    if (!imagesToLoad.length) return;

    try {
      const promises = imagesToLoad.map(src =>
        preloadImage(src).catch(() => {
          // Silently handle preload failures in production
          return null;
        })
      );

      const results = await Promise.allSettled(promises);

      // Check if all images loaded successfully based on promise results
      const allSuccessful = results.every(result => result.status === 'fulfilled' && result.value !== null);
      setAllLoaded(allSuccessful);
    } catch (error) {
      // Silently handle batch preload errors in production
      setAllLoaded(false);
    }
  }, [imageArrayString, preloadImage]);

  // Auto-preload if priority is set
  useEffect(() => {
    if (priority && imageArray.length > 0) {
      preloadImages();
    }
  }, [priority, imageArrayString, preloadImages]);

  // Calculate overall loading state
  const isLoading = Object.values(loadingStates).some(loading => loading);
  const hasErrors = Object.values(errorStates).some(error => error);

  return {
    preloadImages,
    preloadImage,
    isLoading,
    hasErrors,
    allLoaded,
    loadingStates,
    errorStates,
  };
};

/**
 * Hook specifically for critical images that should be preloaded immediately
 * @param {string|string[]} images - Critical images to preload
 * @returns {Object} - Loading and error states
 */
export const useCriticalImagePreloader = (images) => {
  return useImagePreloader(images, { 
    priority: true, 
    timeout: 8000,
    retryCount: 3 
  });
};

/**
 * Hook for lazy image preloading with intersection observer
 * @param {string|string[]} images - Images to preload lazily
 * @param {Object} observerOptions - Intersection observer options
 * @returns {Object} - Loading states and trigger function
 */
export const useLazyImagePreloader = (images, observerOptions = {}) => {
  const [shouldLoad, setShouldLoad] = useState(false);
  const preloader = useImagePreloader(images, { priority: shouldLoad });

  const triggerLoad = useCallback(() => {
    setShouldLoad(true);
  }, []);

  return {
    ...preloader,
    triggerLoad,
    shouldLoad,
  };
};

export default useImagePreloader;
