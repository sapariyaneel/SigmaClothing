import React, { useState, useEffect, useRef } from 'react';
import { getViewportOptimizedImageUrl } from '../../utils/imageOptimizer';

const OptimizedBackgroundImage = ({
    src,
    children,
    className,
    style,
    quality = 'auto:good',
    responsive = true,
    ...props
}) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [currentSrc, setCurrentSrc] = useState(
        responsive ? getViewportOptimizedImageUrl(src, quality) : src
    );
    const imageRef = useRef(null);

    // Update image source on resize for responsive images
    useEffect(() => {
        if (!responsive) return;
        
        const handleResize = () => {
            setCurrentSrc(getViewportOptimizedImageUrl(src, quality));
        };
        
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [src, quality, responsive]);

    useEffect(() => {
        if (!currentSrc) return;

        const img = new Image();
        img.src = currentSrc;
        img.onload = () => setIsLoaded(true);
        img.onerror = () => setIsLoaded(false);
    }, [currentSrc]);

    return (
        <div
            ref={imageRef}
            className={className}
            style={{
                ...style,
                backgroundColor: '#f0f0f0', // Placeholder color
                backgroundImage: isLoaded ? `url(${currentSrc})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                transition: 'background-image 0.3s ease-in-out',
            }}
            {...props}
        >
            {children}
        </div>
    );
};

export default OptimizedBackgroundImage;
