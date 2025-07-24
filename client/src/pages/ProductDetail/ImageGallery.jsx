import React, { useState, useEffect } from 'react';
import { Box, IconButton, useTheme, useMediaQuery, Skeleton } from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const ImageGallery = ({ images = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Preload images
  useEffect(() => {
    if (!images || images.length === 0) return;

    const imagePromises = images.map(src => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          resolve();
        };
        img.onerror = () => {
          resolve();
        };
        img.src = src;
      });
    });

    Promise.all(imagePromises).then(() => {
      setImagesLoaded(true);
    });
  }, [images]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleThumbnailClick = (index) => {
    setCurrentIndex(index);
  };

  if (!images || images.length === 0) {
    return (
      <Box sx={{ 
        width: '100%',
        height: { xs: '350px', sm: '400px', md: '500px' },
        bgcolor: 'background.paper',
        borderRadius: 2,
      }}>
        <Skeleton variant="rectangular" width="100%" height="100%" />
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative' }}>
      {/* Main Image */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: { xs: '350px', sm: '400px', md: '500px' },
          bgcolor: 'background.paper',
          borderRadius: 2,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {!imagesLoaded && (
          <Skeleton 
            variant="rectangular" 
            width="100%" 
            height="100%" 
            sx={{ position: 'absolute', top: 0, left: 0 }}
          />
        )}
        
        <AnimatePresence mode="wait">
          <motion.img
            key={currentIndex}
            src={images[currentIndex]}
            alt={`Product view ${currentIndex + 1}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: imagesLoaded ? 1 : 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              width: isMobile ? 'auto' : '100%',
              height: '100%',
              maxWidth: '100%',
              objectFit: isMobile ? 'contain' : 'cover',
              padding: isMobile ? '16px' : '0'
            }}
            onLoad={() => {}}
            onError={() => {}}
          />
        </AnimatePresence>

        {/* Navigation Arrows */}
        {images.length > 1 && imagesLoaded && (
          <>
            <IconButton
              onClick={handlePrevious}
              sx={{
                position: 'absolute',
                left: { xs: 4, sm: 8 },
                top: '50%',
                transform: 'translateY(-50%)',
                bgcolor: 'background.paper',
                boxShadow: 2,
                '&:hover': { bgcolor: 'background.paper' },
                zIndex: 2,
              }}
            >
              <ArrowBackIcon />
            </IconButton>
            <IconButton
              onClick={handleNext}
              sx={{
                position: 'absolute',
                right: { xs: 4, sm: 8 },
                top: '50%',
                transform: 'translateY(-50%)',
                bgcolor: 'background.paper',
                boxShadow: 2,
                '&:hover': { bgcolor: 'background.paper' },
                zIndex: 2,
              }}
            >
              <ArrowForwardIcon />
            </IconButton>
          </>
        )}
      </Box>

      {/* Thumbnails */}
      {images.length > 1 && imagesLoaded && (
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            mt: 2,
            px: { xs: 2, sm: 0 },
            overflowX: 'auto',
            '&::-webkit-scrollbar': { display: 'none' },
            scrollbarWidth: 'none',
            justifyContent: { xs: 'flex-start', sm: 'center' },
          }}
        >
          {images.map((image, index) => (
            <Box
              key={index}
              component={motion.div}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleThumbnailClick(index)}
              sx={{
                width: { xs: 60, sm: 80 },
                height: { xs: 60, sm: 80 },
                flexShrink: 0,
                borderRadius: 1,
                overflow: 'hidden',
                cursor: 'pointer',
                border: theme => `2px solid ${index === currentIndex ? theme.palette.primary.main : 'transparent'}`,
                boxShadow: 1,
              }}
            >
              <img
                src={image}
                alt={`Thumbnail ${index + 1}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default ImageGallery; 