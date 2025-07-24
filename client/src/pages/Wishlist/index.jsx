import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Delete as DeleteIcon,
  ShoppingCart as ShoppingCartIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import {
  getWishlist,
  removeFromWishlist,
  clearWishlist,
  moveToCart,
} from '../../store/slices/wishlistSlice';
import { showNotification } from '../../store/slices/notificationSlice';
import { useSelectFix, useFocusManagement } from '../../hooks/useFocusManagement';

const Wishlist = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items = [], loading, error } = useSelector((state) => state.wishlist);
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [selectedItem, setSelectedItem] = useState(null);
  const [moveToCartDialog, setMoveToCartDialog] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');

  // Apply select focus fix for dropdown components
  useSelectFix();

  // Apply focus management for the move to cart dialog
  const dialogRef = useFocusManagement(moveToCartDialog);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getWishlist());
    }
  }, [dispatch, isAuthenticated]);

  const handleRemoveItem = async (productId) => {
    try {
      await dispatch(removeFromWishlist(productId)).unwrap();
      dispatch(showNotification({
        message: 'Item removed from wishlist',
        severity: 'success'
      }));
    } catch (error) {
      dispatch(showNotification({
        message: error.message || 'Failed to remove item from wishlist',
        severity: 'error'
      }));
    }
  };

  const handleClearWishlist = async () => {
    try {
      await dispatch(clearWishlist()).unwrap();
      dispatch(showNotification({
        message: 'Wishlist cleared successfully',
        severity: 'success'
      }));
    } catch (error) {
      dispatch(showNotification({
        message: error.message || 'Failed to clear wishlist',
        severity: 'error'
      }));
    }
  };

  const handleMoveToCart = async () => {
    if (!selectedItem) return;

    try {
      await dispatch(
        moveToCart({
          productId: selectedItem._id,
          quantity,
          size,
          color,
        })
      ).unwrap();
      
      dispatch(showNotification({
        message: 'Item moved to cart successfully',
        severity: 'success'
      }));
      setMoveToCartDialog(false);
      setSelectedItem(null);
      resetForm();
    } catch (error) {
      dispatch(showNotification({
        message: error.message || 'Failed to move item to cart',
        severity: 'error'
      }));
    }
  };

  const resetForm = () => {
    setQuantity(1);
    setSize('');
    setColor('');
  };

  if (!isAuthenticated) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="info">
          Please <Button color="primary" onClick={() => navigate('/login')}>login</Button> to view your wishlist
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  const validItems = Array.isArray(items) ? items.filter(item => item && item._id && item.name) : [];

  if (validItems.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h5" gutterBottom>
            Your wishlist is empty
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/shop')}
            sx={{ mt: 2 }}
          >
            Continue Shopping
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">My Wishlist ({validItems.length})</Typography>
        <Button
          variant="outlined"
          color="error"
          onClick={handleClearWishlist}
          startIcon={<DeleteIcon />}
        >
          Clear Wishlist
        </Button>
      </Box>

      <Grid container spacing={3}>
        {validItems.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item._id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardMedia
                component="img"
                height="200"
                image={item.images?.[0] || '/placeholder.jpg'}
                alt={item.name}
                sx={{ objectFit: 'cover', cursor: 'pointer' }}
                onClick={() => navigate(`/product/${item._id}`)}
              />
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" gutterBottom>
                  {item.name}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mb: 2,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {item.description || 'No description available'}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Typography variant="h6" color="primary">
                    ₹{item.discountPrice || item.price || 0}
                  </Typography>
                  {item.discountPrice && item.price && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ textDecoration: 'line-through' }}
                    >
                      ₹{item.price}
                    </Typography>
                  )}
                </Box>
                <Box sx={{ display: 'flex', gap: 2, mt: 'auto' }}>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => navigate(`/product/${item._id}`)}
                    sx={{ bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}
                  >
                    View Product
                  </Button>
                  <IconButton
                    color="error"
                    onClick={() => handleRemoveItem(item._id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Move to Cart Dialog */}
      <Dialog
        open={moveToCartDialog}
        onClose={() => setMoveToCartDialog(false)}
        ref={dialogRef}
      >
        <DialogTitle>Move to Cart</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              type="number"
              label="Quantity"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              InputProps={{ inputProps: { min: 1 } }}
            />
            {selectedItem?.sizes?.length > 0 && (
              <FormControl fullWidth>
                <InputLabel id="size-label">Size</InputLabel>
                <Select
                  labelId="size-label"
                  id="size-select"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  label="Size"
                  MenuProps={{
                    disableRestoreFocus: false,
                    disableEnforceFocus: false,
                    disableAutoFocus: true,
                  }}
                >
                  {selectedItem.sizes.map((s) => (
                    <MenuItem key={s} value={s}>
                      {s}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            {selectedItem?.colors?.length > 0 && (
              <FormControl fullWidth>
                <InputLabel id="color-label">Color</InputLabel>
                <Select
                  labelId="color-label"
                  id="color-select"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  label="Color"
                  MenuProps={{
                    disableRestoreFocus: false,
                    disableEnforceFocus: false,
                    disableAutoFocus: true,
                  }}
                >
                  {selectedItem.colors.map((c) => (
                    <MenuItem key={c} value={c}>
                      {c}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMoveToCartDialog(false)}>Cancel</Button>
          <Button onClick={handleMoveToCart} variant="contained">
            Move to Cart
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Wishlist; 