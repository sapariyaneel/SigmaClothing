import React, { useEffect } from 'react';
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
  IconButton,
  Divider,
  TextField,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from '../../store/slices/cartSlice';

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items = [], totalItems = 0, totalAmount = 0, loading, error } = useSelector((state) => state.cart || {});
  const { isAuthenticated } = useSelector((state) => state.auth);



  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getCart());
    }
  }, [dispatch, isAuthenticated]);

  const handleQuantityChange = async (itemId, currentQuantity, newQuantity) => {
    if (newQuantity >= 1) {
      try {
        await dispatch(updateCartItem({ itemId, quantity: newQuantity })).unwrap();
      } catch (error) {
        console.error('Failed to update quantity:', error);
      }
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await dispatch(removeFromCart(itemId)).unwrap();
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };

  const handleClearCart = async () => {
    try {
      await dispatch(clearCart()).unwrap();
    } catch (error) {
      console.error('Failed to clear cart:', error);
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout');
    } else {
      navigate('/checkout');
    }
  };

  if (!isAuthenticated) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="info">
          Please <Button color="primary" onClick={() => navigate('/login')}>login</Button> to view your cart
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

  if (!Array.isArray(items) || items.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
          }}
        >
          <Typography variant="h5" gutterBottom>
            Your cart is empty
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
      <Typography variant="h4" gutterBottom>
        Shopping Cart ({totalItems} items)
      </Typography>

      <Grid container spacing={4}>
        {/* Cart Items */}
        <Grid item xs={12} md={8}>
          <AnimatePresence>
            {items.map((item) => (
              <motion.div
                key={item._id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card
                  sx={{
                    mb: 2,
                    position: 'relative',
                    overflow: 'visible',
                  }}
                >
                  <CardContent>
                    <Grid container spacing={2} alignItems="center">
                      {/* Product Image */}
                      <Grid item xs={4} sm={3}>
                        <Box
                          component="img"
                          src={item.productId?.images?.[0] || '/placeholder.jpg'}
                          alt={item.productId?.name}
                          sx={{
                            width: '100%',
                            height: 'auto',
                            borderRadius: 1,
                          }}
                        />
                      </Grid>

                      {/* Product Details */}
                      <Grid item xs={8} sm={9}>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                          }}
                        >
                          <Box>
                            <Typography variant="h6" gutterBottom>
                              {item.productId?.name}
                            </Typography>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              gutterBottom
                            >
                              Size: {item.size} | Color: {item.color}
                            </Typography>
                            <Typography variant="h6" color="primary">
                              ₹{item.price}
                            </Typography>
                          </Box>

                          <IconButton
                            onClick={() => handleRemoveItem(item._id)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>

                        {/* Quantity Controls */}
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            mt: 2,
                          }}
                        >
                          <IconButton
                            onClick={() =>
                              handleQuantityChange(
                                item._id,
                                item.quantity,
                                item.quantity - 1
                              )
                            }
                            disabled={item.quantity <= 1}
                          >
                            <RemoveIcon />
                          </IconButton>
                          <TextField
                            value={item.quantity}
                            onChange={(e) =>
                              handleQuantityChange(
                                item._id,
                                item.quantity,
                                parseInt(e.target.value) || 1
                              )
                            }
                            type="number"
                            inputProps={{ min: 1, max: item.productId?.stock }}
                            sx={{ width: 60, mx: 1 }}
                          />
                          <IconButton
                            onClick={() =>
                              handleQuantityChange(
                                item._id,
                                item.quantity,
                                item.quantity + 1
                              )
                            }
                            disabled={item.quantity >= (item.productId?.stock || 0)}
                          >
                            <AddIcon />
                          </IconButton>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          <Button
            variant="outlined"
            color="error"
            onClick={handleClearCart}
            sx={{ mt: 2 }}
          >
            Clear Cart
          </Button>
        </Grid>

        {/* Order Summary */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Order Summary
              </Typography>
              <Box sx={{ my: 2 }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    mb: 1,
                  }}
                >
                  <Typography>Subtotal</Typography>
                  <Typography>₹{totalAmount}</Typography>
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    mb: 1,
                  }}
                >
                  <Typography>Shipping</Typography>
                  <Typography>Free</Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    mb: 2,
                  }}
                >
                  <Typography variant="h6">Total</Typography>
                  <Typography variant="h6">₹{totalAmount}</Typography>
                </Box>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleCheckout}
                  disabled={items.length === 0}
                >
                  Proceed to Checkout
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Cart; 