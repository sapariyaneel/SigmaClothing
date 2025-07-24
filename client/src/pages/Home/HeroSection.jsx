import React, { useState, useEffect, useMemo } from 'react';
import { Box, Typography, Button, Container, Skeleton } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getOptimizedImageUrl } from '../../utils/imageOptimizer';

const HeroSection = () => {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState('');

  // Generate optimized image URLs with better compression and WebP support
  const imageUrls = useMemo(() => {
    const baseUrl = 'https://res.cloudinary.com/dibb74win/image/upload';
    const publicId = 'sigma-clothing/banner/hero-banner';

    return {
      mobile: `${baseUrl}/w_768,h_600,c_fill,f_webp,q_auto:eco,dpr_auto/${publicId}`,
      tablet: `${baseUrl}/w_1024,h_700,c_fill,f_webp,q_auto:good,dpr_auto/${publicId}`,
      desktop: `${baseUrl}/w_1920,h_900,c_fill,f_webp,q_auto:good,dpr_auto/${publicId}`,
      // Fallback JPEG versions for browsers that don't support WebP
      mobileFallback: `${baseUrl}/w_768,h_600,c_fill,f_auto,q_auto:eco,dpr_auto/${publicId}`,
      tabletFallback: `${baseUrl}/w_1024,h_700,c_fill,f_auto,q_auto:good,dpr_auto/${publicId}`,
      desktopFallback: `${baseUrl}/w_1920,h_900,c_fill,f_auto,q_auto:good,dpr_auto/${publicId}`,
      // Ultra-low quality placeholder for instant loading
      placeholder: `${baseUrl}/w_50,h_30,c_fill,f_auto,q_auto:low,e_blur:1000/${publicId}`
    };
  }, []);

  // Get appropriate image URL based on screen size with WebP support detection
  const getResponsiveImageUrl = useMemo(() => {
    return () => {
      if (typeof window === 'undefined') {
        return imageUrls.desktopFallback;
      }

      const width = window.innerWidth;
      const supportsWebP = document.createElement('canvas')
        .toDataURL('image/webp')
        .indexOf('data:image/webp') === 0;

      if (width <= 768) {
        return supportsWebP ? imageUrls.mobile : imageUrls.mobileFallback;
      }
      if (width <= 1024) {
        return supportsWebP ? imageUrls.tablet : imageUrls.tabletFallback;
      }
      return supportsWebP ? imageUrls.desktop : imageUrls.desktopFallback;
    };
  }, [imageUrls]);

  // Preload the hero image immediately
  useEffect(() => {
    const imageUrl = getResponsiveImageUrl();
    setCurrentImageUrl(imageUrl);

    // Create a new image element for preloading
    const img = new Image();

    const handleLoad = () => {
      setImageLoaded(true);
      setImageError(false);
    };

    const handleError = () => {
      setImageError(true);
      setImageLoaded(false);
    };

    img.addEventListener('load', handleLoad);
    img.addEventListener('error', handleError);

    // Start loading the image
    img.src = imageUrl;

    return () => {
      img.removeEventListener('load', handleLoad);
      img.removeEventListener('error', handleError);
    };
  }, [getResponsiveImageUrl]);

  // Handle responsive image updates on resize with debouncing
  useEffect(() => {
    let timeoutId;

    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const newUrl = getResponsiveImageUrl();
        if (newUrl !== currentImageUrl) {
          setCurrentImageUrl(newUrl);
          setImageLoaded(false); // Reset loading state for new image

          // Preload the new image
          const img = new Image();
          img.onload = () => setImageLoaded(true);
          img.onerror = () => setImageError(true);
          img.src = newUrl;
        }
      }, 300); // Increased debounce time to reduce unnecessary requests
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, [currentImageUrl, getResponsiveImageUrl]);

  return (
    <Box
      sx={{
        height: '90vh',
        width: '100vw',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        marginLeft: 'calc(-50vw + 50%)',
        marginRight: 'calc(-50vw + 50%)',
        backgroundColor: '#f5f5f5', // Neutral background while loading
      }}
    >
      {/* Ultra-low quality placeholder image for instant loading */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url(${imageUrls.placeholder})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(5px) brightness(0.8)',
          transform: 'scale(1.1)', // Slightly scale to hide blur edges
          opacity: imageLoaded ? 0 : 1,
          transition: 'opacity 0.3s ease-out',
          zIndex: 0,
        }}
      />

      {/* Main hero image */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: imageLoaded && !imageError ? `url(${currentImageUrl})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          filter: 'brightness(0.85)',
          opacity: imageLoaded ? 1 : 0,
          transition: 'opacity 0.6s ease-in-out',
          zIndex: 1,
        }}
      />

      {/* Gradient overlay for better text readability */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(
            135deg,
            rgba(0, 0, 0, 0.4) 0%,
            rgba(0, 0, 0, 0.2) 50%,
            rgba(0, 0, 0, 0.3) 100%
          )`,
          zIndex: 2,
        }}
      />

      {/* Fallback gradient if image fails to load */}
      {imageError && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            zIndex: 1,
          }}
        />
      )}

      {/* Loading indicator for better UX */}
      {!imageLoaded && !imageError && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 3,
          }}
        >
          <Skeleton
            variant="rectangular"
            width={200}
            height={100}
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: 2,
            }}
          />
        </Box>
      )}

      <Container
        maxWidth={false}
        disableGutters
        sx={{
          position: 'relative',
          zIndex: 4, // Above all background layers
          color: 'white',
          px: { xs: 2, sm: 3, md: 4 }
        }}
      >
        <Box
          sx={{
            maxWidth: '600px',
            background: 'rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)', // Safari support
            p: 4,
            borderRadius: 3,
            ml: { xs: 1, md: 6, lg: 10 },
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          }}
        >
          {/* Animate content only after image starts loading */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.1, // Slight delay to ensure smooth appearance
              ease: [0.25, 0.46, 0.45, 0.94]
            }}
          >
            <Typography
              variant="h1"
              sx={{
                fontWeight: 700,
                mb: 2,
                textShadow: '3px 3px 6px rgba(0, 0, 0, 0.5)',
                fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem' },
                lineHeight: 1.1,
              }}
            >
              Elevate Your Style
            </Typography>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.3,
              ease: [0.25, 0.46, 0.45, 0.94]
            }}
          >
            <Typography
              variant="h4"
              sx={{
                fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem' },
                fontWeight: 400,
                mb: 4,
                opacity: 0.95,
                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
                lineHeight: 1.4,
              }}
            >
              Discover our curated collection of modern fashion essentials
            </Typography>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.5,
              ease: [0.25, 0.46, 0.45, 0.94]
            }}
          >
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/shop')}
              sx={{
                bgcolor: 'white',
                color: 'black',
                fontSize: '1.1rem',
                fontWeight: 600,
                py: 1.8,
                px: 5,
                borderRadius: 2,
                boxShadow: '0 6px 24px rgba(0, 0, 0, 0.3)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                textTransform: 'none',
                '&:hover': {
                  transform: 'translateY(-3px) scale(1.02)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                  bgcolor: 'rgba(255, 255, 255, 0.95)'
                },
                '&:active': {
                  transform: 'translateY(-1px) scale(0.98)',
                }
              }}
            >
              Shop Now
            </Button>
          </motion.div>
        </Box>
      </Container>
    </Box>
  );
};

export default HeroSection; 