import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Divider,
  Alert,
} from '@mui/material';
import { CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { setStep } from '../../store/slices/checkoutSlice';

const OrderConfirmation = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { orderSummary, shippingAddress, paymentInfo } = useSelector((state) => state.checkout);

  // Ensure we stay on confirmation step
  useEffect(() => {
    if (paymentInfo?.status === 'completed') {
      dispatch(setStep(3));
    } else {
      navigate('/checkout');
    }
  }, [paymentInfo, navigate, dispatch]);

  if (!orderSummary || !shippingAddress || !paymentInfo) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          Order information not found. Please try again.
        </Alert>
        <Button variant="contained" onClick={() => navigate('/cart')}>
          Return to Cart
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ textAlign: 'center', py: 4 }}>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <CheckCircleIcon
          color="success"
          sx={{ fontSize: 64, mb: 2 }}
        />
      </motion.div>

      <Typography variant="h4" gutterBottom>
        Thank You for Your Order!
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Your order has been successfully placed and will be processed soon.
      </Typography>

      <Card variant="outlined" sx={{ mb: 4, mx: 'auto', maxWidth: 600 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Order Details
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Order ID
            </Typography>
            <Typography variant="body1">
              {orderSummary._id}
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Items Ordered
            </Typography>
            {orderSummary.items.map((item) => (
              <Box key={item.productId._id} sx={{ mt: 1 }}>
                <Typography variant="body1">
                  {item.productId.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Qty: {item.quantity}
                </Typography>
                <Typography variant="body2">
                  ₹{item.price}
                </Typography>
              </Box>
            ))}
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Shipping Address
            </Typography>
            <Typography variant="body1">
              {shippingAddress.fullName}<br />
              {shippingAddress.street}
              {shippingAddress.landmark && (
                <>
                  <br />
                  Near {shippingAddress.landmark}
                </>
              )}
              <br />
              {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}<br />
              Phone: {shippingAddress.phone}
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Payment Status
            </Typography>
            <Typography variant="body1" color="success.main">
              {paymentInfo.status}
            </Typography>
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary">
              Total Amount
            </Typography>
            <Typography variant="h6">
              ₹{orderSummary.totalAmount}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Button
          variant="outlined"
          onClick={() => navigate('/orders')}
        >
          View Orders
        </Button>
        <Button
          variant="contained"
          onClick={() => navigate('/shop')}
        >
          Continue Shopping
        </Button>
      </Box>
    </Box>
  );
};

export default OrderConfirmation; 