// Image optimization utilities

// Default image dimensions
const DEFAULT_DIMENSIONS = {
    thumbnail: { width: 150, height: 150 },
    small: { width: 300, height: 300 },
    medium: { width: 600, height: 600 },
    large: { width: 1200, height: 1200 },
    xlarge: { width: 1920, height: 1920 }
};

// Responsive breakpoints for different screen sizes
const RESPONSIVE_BREAKPOINTS = {
    mobile: { maxWidth: 768, imageWidth: 768 },
    tablet: { maxWidth: 1024, imageWidth: 1024 },
    desktop: { maxWidth: 1440, imageWidth: 1440 },
    large: { maxWidth: 1920, imageWidth: 1920 }
};

// Generate responsive image URL for specific breakpoint
export const generateResponsiveImageUrl = (imageUrl, breakpoint = 'desktop', quality = 'auto:good') => {
    if (!imageUrl) return '';

    // If the image is from Cloudinary, use their transformation API
    if (imageUrl.includes('cloudinary.com')) {
        const { imageWidth } = RESPONSIVE_BREAKPOINTS[breakpoint] || RESPONSIVE_BREAKPOINTS.desktop;

        // Extract the public ID from the Cloudinary URL
        const urlParts = imageUrl.split('/');
        const uploadIndex = urlParts.findIndex(part => part === 'upload');

        if (uploadIndex !== -1) {
            const publicId = urlParts.slice(uploadIndex + 1).join('/');
            const baseUrl = urlParts.slice(0, uploadIndex + 1).join('/');

            return `${baseUrl}/w_${imageWidth},c_fill,f_auto,q_${quality}/${publicId}`;
        }
    }

    return imageUrl;
};

// Generate srcSet for responsive images
export const generateSrcSet = (imageUrl, sizes = ['small', 'medium', 'large', 'xlarge']) => {
    if (!imageUrl) return '';

    // If the image is already from a CDN that supports dynamic resizing (like Cloudinary),
    // we can use their URL parameters
    if (imageUrl.includes('cloudinary.com')) {
        return sizes
            .map(size => {
                const { width } = DEFAULT_DIMENSIONS[size];
                const optimizedUrl = generateResponsiveImageUrl(imageUrl, size);
                return `${optimizedUrl} ${width}w`;
            })
            .join(', ');
    }

    // For regular images, we'll use the original size
    return imageUrl;
};

// Get appropriate size based on viewport
export const getSizes = (breakpoints = {}) => {
    const defaultSizes = '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, (max-width: 1440px) 33vw, 25vw';
    return breakpoints.sizes || defaultSizes;
};

// Get current breakpoint based on window width
export const getCurrentBreakpoint = () => {
    if (typeof window === 'undefined') return 'desktop';

    const width = window.innerWidth;
    if (width <= RESPONSIVE_BREAKPOINTS.mobile.maxWidth) return 'mobile';
    if (width <= RESPONSIVE_BREAKPOINTS.tablet.maxWidth) return 'tablet';
    if (width <= RESPONSIVE_BREAKPOINTS.desktop.maxWidth) return 'desktop';
    return 'large';
};

// Get optimized image URL for current viewport
export const getViewportOptimizedImageUrl = (imageUrl, quality = 'auto:good') => {
    const breakpoint = getCurrentBreakpoint();
    return generateResponsiveImageUrl(imageUrl, breakpoint, quality);
};

// Create optimized image props for use in components
export const createOptimizedImageProps = (src, options = {}) => {
    const {
        quality = 'auto:good',
        responsive = true,
        sizes,
        loading = 'lazy',
        ...otherProps
    } = options;

    return {
        src: responsive ? getViewportOptimizedImageUrl(src, quality) : src,
        srcSet: generateSrcSet(src),
        sizes: getSizes(sizes),
        loading,
        style: {
            backgroundColor: '#f0f0f0',
            objectFit: 'cover',
            ...otherProps.style
        },
        ...otherProps
    };
};

// Preload critical images
export const preloadImages = (images = []) => {
    images.forEach(src => {
        const img = new Image();
        img.src = src;
    });
};

// Convert image to WebP format if supported
export const getOptimizedImageUrl = (imageUrl) => {
    if (!imageUrl) return '';

    // If using Cloudinary or similar service
    if (imageUrl.includes('cloudinary.com')) {
        return imageUrl.replace('/upload/', '/upload/f_auto,q_auto/');
    }

    // For regular images, check WebP support and append format
    if (typeof window !== 'undefined') {
        const webpSupported = document.createElement('canvas')
            .toDataURL('image/webp')
            .indexOf('data:image/webp') === 0;

        if (webpSupported && !imageUrl.endsWith('.webp')) {
            // Assuming your server can handle WebP conversion
            return `${imageUrl}?format=webp`;
        }
    }

    return imageUrl;
}; 