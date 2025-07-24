import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  IconButton,
  Box,
  Chip,
  Button,
} from '@mui/material';
import {
  FavoriteBorder as FavoriteBorderIcon,
  Favorite as FavoriteIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { addToWishlist, removeFromWishlist } from '../../store/slices/wishlistSlice';
import { addToCart } from '../../store/slices/cartSlice';
import { showNotification } from '../../store/slices/notificationSlice';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { items: wishlistItems } = useSelector((state) => state.wishlist);
  


  if (!product || (!product._id && !product.id)) {
    return null;
  }

  const {
    _id = product.id, // Use _id if available, otherwise use id
    name,
    price,
    discountPrice,
    images = [],
    category,
    imagePosition,
    imageScale,
    imageFit
  } = product;

  // Ensure we have valid data
  if (!name || typeof price === 'undefined') {
    return null;
  }

  const isWishlisted = wishlistItems?.some(item => item._id === _id || item.id === _id);

  const discount = discountPrice && price
    ? Math.round(((price - discountPrice) / price) * 100)
    : 0;

  const handleWishlistToggle = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }
    
    try {
      if (isWishlisted) {
        await dispatch(removeFromWishlist(_id)).unwrap();
        dispatch(showNotification({
          message: 'Removed from wishlist',
          severity: 'success'
        }));
      } else {
        const result = await dispatch(addToWishlist(_id)).unwrap();
        dispatch(showNotification({
          message: result.message || 'Added to wishlist',
          severity: 'success'
        }));
      }
    } catch (error) {
      dispatch(showNotification({
        message: error.message || 'Failed to update wishlist',
        severity: 'error'
      }));
    }
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }
    try {
      await dispatch(addToCart({ productId: _id, quantity: 1 })).unwrap();
      dispatch(showNotification({
        message: 'Added to cart successfully',
        severity: 'success'
      }));
    } catch (error) {
      dispatch(showNotification({
        message: error.message || 'Failed to add to cart',
        severity: 'error'
      }));
    }
  };

  const handleProductClick = (e) => {
    e.preventDefault();
    navigate(`/product/${_id}`, { state: { product } });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        sx={{
          position: 'relative',
          cursor: 'pointer',
          '&:hover .product-actions': {
            opacity: 1,
          },
        }}
        onClick={handleProductClick}
      >
        {/* Product Image */}
        <Box sx={{ 
          position: 'relative', 
          height: '280px',
          overflow: 'hidden',
          borderRadius: '4px 4px 0 0'
        }}>
          <CardMedia
            component="img"
            image={images[0] || '/images/product-placeholder.jpg'}
            alt={name}
            sx={{
              height: '100%',
              width: '100%',
              objectFit: imageFit || 'cover',
              objectPosition: imagePosition || 'center',
              transform: `scale(${imageScale || 1})`,
              transition: 'all 0.3s ease',
              transformOrigin: 'center'
            }}
          />
          
          {/* Wishlist Button */}
          <IconButton
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              bgcolor: 'rgba(255, 255, 255, 0.9)',
              zIndex: 1,
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 1)',
              },
            }}
            onClick={handleWishlistToggle}
          >
            {isWishlisted ? (
              <FavoriteIcon color="error" />
            ) : (
              <FavoriteBorderIcon />
            )}
          </IconButton>

          {/* Discount Badge */}
          {discount > 0 && (
            <Chip
              label={`${discount}% OFF`}
              color="primary"
              size="small"
              sx={{
                position: 'absolute',
                top: 8,
                left: 8,
                zIndex: 1,
              }}
            />
          )}
        </Box>

        {/* Product Info */}
        <CardContent>
          <Typography
            variant="subtitle2"
            color="text.secondary"
            gutterBottom
            sx={{ textTransform: 'uppercase' }}
          >
            {category}
          </Typography>
          <Typography
            variant="h6"
            component="div"
            sx={{
              mb: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {name}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Typography variant="h6" color="primary" fontWeight="600">
              ₹{discountPrice || price}
            </Typography>
            {discountPrice && (
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ textDecoration: 'line-through' }}
              >
                ₹{price}
              </Typography>
            )}
          </Box>

          {/* View Product Button */}
          <Button
            variant="contained"
            fullWidth
            startIcon={<VisibilityIcon />}
            onClick={handleProductClick}
            sx={{ 
              mt: 2,
              bgcolor: 'primary.main',
              '&:hover': {
                bgcolor: 'primary.dark',
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.2s ease-in-out',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              textTransform: 'none',
              fontSize: '1rem',
              py: 1
            }}
          >
            View Product
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default React.memo(ProductCard); 