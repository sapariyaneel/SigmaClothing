import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  LocalShipping as ShippingIcon,
  CheckCircle as DeliveredIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon,
  Settings as ProcessingIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import axios from '../../utils/axios';

const statusIcons = {
  pending: <PendingIcon />,
  processing: <ProcessingIcon />,
  shipped: <ShippingIcon />,
  delivered: <DeliveredIcon color="success" />,
  cancelled: <CancelIcon color="error" />,
};

const statusColors = {
  pending: 'warning',
  processing: 'info',
  shipped: 'primary',
  delivered: 'success',
  cancelled: 'error',
};

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/orders/my-orders');
      console.log('Orders response:', response.data);
      
      if (!response.data || !response.data.data) {
        throw new Error('Invalid response format');
      }

      const ordersData = response.data.data;
      if (!Array.isArray(ordersData)) {
        throw new Error('Orders data is not an array');
      }

      // Extract the actual data from Mongoose documents
      const processedOrders = ordersData.map(order => {
        // If it's a Mongoose document, get the data from _doc
        const orderData = order._doc || order;
        return {
          ...orderData,
          items: Array.isArray(orderData.items) ? orderData.items.map(item => ({
            ...item._doc || item,
            productId: item.productId?._doc || item.productId
          })) : []
        };
      });

      console.log('Processed orders:', processedOrders);
      setOrders(processedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError(error.response?.data?.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    try {
      if (!selectedOrder?._id) {
        throw new Error('Invalid order selected');
      }
      await axios.post(`/orders/${selectedOrder._id}/cancel`);
      setCancelDialogOpen(false);
      setSelectedOrder(null);
      fetchOrders();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to cancel order');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={fetchOrders}>
          Try Again
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        My Orders
      </Typography>

      {!orders || orders.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            You haven't placed any orders yet
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/shop')}
            sx={{ mt: 2 }}
          >
            Start Shopping
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {orders.map((order) => {
            if (!order || !order._id) {
              return null;
            }

            return (
              <Grid item xs={12} key={order._id}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6">
                        Order #{order.orderNumber || order._id.slice(-8).toUpperCase()}
                      </Typography>
                      <Chip
                        label={order.orderStatus?.toUpperCase() || 'PENDING'}
                        color={
                          order.orderStatus === 'delivered' ? 'success' :
                          order.orderStatus === 'cancelled' ? 'error' :
                          order.orderStatus === 'shipped' ? 'info' :
                          'default'
                        }
                        variant="outlined"
                      />
                    </Box>

                    {Array.isArray(order.items) && order.items.map((item) => (
                      <Box key={item._id} sx={{ mb: 2, display: 'flex', gap: 2 }}>
                        <Box
                          component="img"
                          src={
                            item.productId?.images?.[0] || 
                            (typeof item.productId === 'string' ? '/placeholder.jpg' : item.productId?.image) || 
                            '/placeholder.jpg'
                          }
                          alt={item.productId?.name || 'Product'}
                          sx={{
                            width: 80,
                            height: 80,
                            objectFit: 'cover',
                            borderRadius: 1
                          }}
                        />
                        <Box>
                          <Typography variant="subtitle1">
                            {item.productId?.name || 'Product Name Unavailable'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Quantity: {item.quantity || 0}
                            {item.size && ` | Size: ${item.size}`}
                          </Typography>
                          <Typography variant="body2" color="primary">
                            ₹{item.price || 0}
                          </Typography>
                        </Box>
                      </Box>
                    ))}

                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="h6">
                          Total: ₹{order.totalAmount || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Ordered on: {new Date(order.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                      {order.orderStatus && ['pending', 'processing'].includes(order.orderStatus.toLowerCase()) && (
                        <Button
                          variant="outlined"
                          color="error"
                          onClick={() => {
                            setSelectedOrder(order);
                            setCancelDialogOpen(true);
                          }}
                        >
                          Cancel Order
                        </Button>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)}>
        <DialogTitle>Cancel Order</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to cancel this order? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>No, Keep Order</Button>
          <Button onClick={handleCancelOrder} color="error" variant="contained">
            Yes, Cancel Order
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Orders; 