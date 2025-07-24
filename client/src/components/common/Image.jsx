import React from 'react';
import { Box } from '@mui/material';
import { getViewportOptimizedImageUrl, generateSrcSet, getSizes } from '../../utils/imageOptimizer';

const Image = ({
  src,
  alt,
  width,
  height,
  sx = {},
  loading = 'lazy',
  responsive = true,
  quality = 'auto:good',
  ...props
}) => {
  const [error, setError] = React.useState(false);
  const placeholderSrc = '/placeholder.jpg';

  const handleError = () => {
    if (!error) {
      setError(true);
    }
  };

  // Use optimized image if available, otherwise fall back to regular img
  const optimizedSrc = responsive ? getViewportOptimizedImageUrl(src, quality) : src;
  const srcSet = src && src.includes('cloudinary.com') ? generateSrcSet(src) : '';
  const sizes = srcSet ? getSizes() : '';

  return (
    <Box
      component="img"
      src={error ? placeholderSrc : optimizedSrc}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      onError={handleError}
      loading={loading}
      sx={{
        width: width || '100%',
        height: height || 'auto',
        objectFit: 'cover',
        ...sx
      }}
      {...props}
    />
  );
};

export default Image; 