import React from 'react';
import { Box, Typography, Grid, Card, CardMedia, IconButton, Button } from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { removeFromWishlist } from '../../store/slices/wishlistSlice';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const WishlistPreview = ({ wishlistItems = [] }) => {
  const dispatch = useDispatch();
  
  console.log('Wishlist Items:', wishlistItems);

  const handleRemove = (productId) => {
    dispatch(removeFromWishlist(productId));
  };

  const getImageUrl = (item) => {
    if (import.meta.env.DEV) {
      console.log('Processing image for item:', item);
    }

    if (!item.images || !Array.isArray(item.images) || item.images.length === 0) {
      if (import.meta.env.DEV) {
        console.log('No images found, using placeholder');
      }
      return '/placeholder-image.jpg';
    }

    const imageUrl = item.images[0];
    if (import.meta.env.DEV) {
      console.log('Raw image URL:', imageUrl);
    }

    if (!imageUrl) {
      return '/placeholder-image.jpg';
    }

    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }

    const baseUrl = import.meta.env.VITE_API_URL || 'https://sigmaclothing-api.onrender.com';
    const fullUrl = `${baseUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
    if (import.meta.env.DEV) {
      console.log('Constructed full URL:', fullUrl);
    }
    return fullUrl;
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Wishlist ({wishlistItems.length} items)
      </Typography>
      <Grid container spacing={2}>
        {wishlistItems.slice(0, 4).map((item) => (
          <Grid item xs={12} sm={6} md={3} key={item._id}>
            <Card
              component={motion.div}
              whileHover={{ scale: 1.02 }}
              sx={{ position: 'relative' }}
            >
              <CardMedia
                component="img"
                height="140"
                image={getImageUrl(item)}
                alt={item.name}
                sx={{ objectFit: 'cover' }}
              />
              <IconButton
                size="small"
                onClick={() => handleRemove(item._id)}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  bgcolor: 'background.paper',
                  '&:hover': { bgcolor: 'error.light', color: 'white' }
                }}
              >
                <DeleteIcon />
              </IconButton>
              <Box sx={{ p: 1 }}>
                <Typography variant="subtitle2" noWrap>
                  {item.name}
                </Typography>
                <Typography variant="body2" color="primary" fontWeight="bold">
                  ₹{item.discountPrice || item.price}
                </Typography>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
      {wishlistItems.length > 4 && (
        <Button
          component={Link}
          to="/wishlist"
          variant="outlined"
          sx={{ mt: 2 }}
        >
          View All ({wishlistItems.length})
        </Button>
      )}
    </Box>
  );
};

export default WishlistPreview; 