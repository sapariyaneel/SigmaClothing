import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button, 
  IconButton,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  TextField,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Favorite as FavoriteIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { addToCart } from '../../store/slices/cartSlice';
import { addToWishlist, removeFromWishlist } from '../../store/slices/wishlistSlice';

const ProductInfo = ({ product }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { items: wishlistItems } = useSelector((state) => state.wishlist);
  
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');

  const isWishlisted = wishlistItems?.some(item => item._id === product._id);

  const handleSizeChange = (event, newSize) => {
    setSelectedSize(newSize);
    setError('');
  };

  const handleQuantityChange = (value) => {
    const newQuantity = Math.max(1, Math.min(value, product.stock));
    setQuantity(newQuantity);
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }

    if (!selectedSize) {
      setError('Please select a size');
      return;
    }

    dispatch(addToCart({
      productId: product._id,
      quantity,
      size: selectedSize,
    }));
  };

  const handleWishlistToggle = () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }
    
    if (isWishlisted) {
      dispatch(removeFromWishlist(product._id));
    } else {
      dispatch(addToWishlist(product._id));
    }
  };

  const discount = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  return (
    <Box>
      {/* Category */}
      <Typography
        variant="subtitle1"
        color="text.secondary"
        gutterBottom
        sx={{ textTransform: 'uppercase' }}
      >
        {product.category}
      </Typography>

      {/* Title and Wishlist */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
        <Typography variant="h4" component="h1" sx={{ flex: 1, fontWeight: 600 }}>
          {product.name}
        </Typography>
        <IconButton
          onClick={handleWishlistToggle}
          sx={{ ml: 1 }}
        >
          {isWishlisted ? (
            <FavoriteIcon color="error" />
          ) : (
            <FavoriteBorderIcon />
          )}
        </IconButton>
      </Box>

      {/* Price */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Typography variant="h4" color="primary" fontWeight="600">
          ₹{product.discountPrice || product.price}
        </Typography>
        {discount > 0 && (
          <>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ textDecoration: 'line-through' }}
            >
              ₹{product.price}
            </Typography>
            <Chip
              label={`${discount}% OFF`}
              color="primary"
              size="small"
            />
          </>
        )}
      </Box>

      {/* Description */}
      <Typography variant="body1" sx={{ mb: 4 }}>
        {product.description}
      </Typography>

      {/* Size Selection */}
      {product.sizes && product.sizes.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Size
          </Typography>
          <ToggleButtonGroup
            value={selectedSize}
            exclusive
            onChange={handleSizeChange}
            aria-label="size selection"
          >
            {product.sizes.map((size) => (
              <ToggleButton
                key={size}
                value={size}
                aria-label={size}
                sx={{
                  px: 3,
                  py: 1,
                }}
              >
                {size}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>
      )}

      {/* Quantity Selection */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Quantity
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton
            onClick={() => handleQuantityChange(quantity - 1)}
            disabled={quantity <= 1}
          >
            <RemoveIcon />
          </IconButton>
          <TextField
            value={quantity}
            onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
            inputProps={{ min: 1, max: product.stock, type: 'number' }}
            sx={{ width: 80 }}
          />
          <IconButton
            onClick={() => handleQuantityChange(quantity + 1)}
            disabled={quantity >= product.stock}
          >
            <AddIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Add to Cart Button */}
      <Button
        variant="contained"
        size="large"
        fullWidth
        onClick={handleAddToCart}
        disabled={product.stock === 0}
      >
        {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
      </Button>
    </Box>
  );
};

export default ProductInfo; 