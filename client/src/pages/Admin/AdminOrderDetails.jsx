import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container,
    Paper,
    Typography,
    Grid,
    Box,
    Button,
    Chip,
    Divider,
    Card,
    CardContent,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    IconButton,
    Alert,
    CircularProgress
} from '@mui/material';
import {
    ArrowBack as BackIcon,
    LocalShipping as ShippingIcon,
    Payment as PaymentIcon,
    Receipt as ReceiptIcon,
    Edit as EditIcon,
    Person as PersonIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import axios from '../../utils/axios';
import { formatDate, formatCurrency } from '../../utils/format';
import eventBus, { EVENTS } from '../../utils/eventBus';

const AdminOrderDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [statusDialog, setStatusDialog] = useState(false);
    const [newStatus, setNewStatus] = useState('');
    const [updating, setUpdating] = useState(false);

    const orderStatuses = [
        { value: 'pending', label: 'Pending', color: 'warning' },
        { value: 'processing', label: 'Processing', color: 'info' },
        { value: 'shipped', label: 'Shipped', color: 'primary' },
        { value: 'delivered', label: 'Delivered', color: 'success' },
        { value: 'cancelled', label: 'Cancelled', color: 'error' }
    ];

    const fetchOrder = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/orders/${id}`);
            setOrder(response.data.data);
        } catch (error) {
            setError(error.response?.data?.message || 'Error fetching order details');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrder();
    }, [id]);

    const getStatusColor = (status) => {
        const statusObj = orderStatuses.find(s => s.value === status);
        return statusObj ? statusObj.color : 'default';
    };

    const handleStatusUpdate = async () => {
        try {
            setUpdating(true);
            const response = await axios.patch(`/orders/${id}/status`, { orderStatus: newStatus });

            // Update local state immediately for instant UI feedback
            if (response.data.success) {
                setOrder(prevOrder => ({
                    ...prevOrder,
                    orderStatus: newStatus
                }));

                // Emit event to notify other components (like dashboard) to refresh
                eventBus.emit(EVENTS.ORDER_STATUS_UPDATED, {
                    orderId: id,
                    newStatus: newStatus,
                    order: response.data.data
                });
            }

            setStatusDialog(false);
            setNewStatus('');

            // Refresh order data in background to get any additional updates
            fetchOrder();
        } catch (error) {
            setError(error.response?.data?.message || 'Error updating order status');
        } finally {
            setUpdating(false);
        }
    };

    const openStatusDialog = () => {
        setNewStatus(order.orderStatus);
        setStatusDialog(true);
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error && !order) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

    if (!order) return null;

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Paper
                component={motion.div}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                elevation={0}
                sx={{ p: 4, border: 1, borderColor: 'divider' }}
            >
                {/* Header */}
                <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <IconButton onClick={() => navigate('/admin/orders', { state: { refresh: true } })}>
                            <BackIcon />
                        </IconButton>
                        <Typography variant="h4">
                            Order #{order._id}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Chip
                            label={order.orderStatus?.toUpperCase() || 'PENDING'}
                            color={getStatusColor(order.orderStatus || 'pending')}
                            sx={{ fontSize: '1rem', py: 1 }}
                        />
                        <Button
                            variant="outlined"
                            startIcon={<EditIcon />}
                            onClick={openStatusDialog}
                        >
                            Update Status
                        </Button>
                    </Box>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
                        {error}
                    </Alert>
                )}

                <Grid container spacing={4}>
                    {/* Order Summary */}
                    <Grid item xs={12} md={8}>
                        <Card sx={{ mb: 3 }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    <ReceiptIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                    Order Summary
                                </Typography>
                                <Divider sx={{ my: 2 }} />
                                {order.items?.map((item) => (
                                    <Box
                                        key={item._id}
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            mb: 2
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <img
                                                src={item.productId?.images?.[0] || '/placeholder.jpg'}
                                                alt={item.productId?.name || 'Product'}
                                                style={{
                                                    width: 60,
                                                    height: 60,
                                                    objectFit: 'cover',
                                                    marginRight: 16
                                                }}
                                            />
                                            <Box>
                                                <Typography variant="subtitle1">
                                                    {item.productId?.name || 'Product Name'}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Size: {item.size} | Quantity: {item.quantity}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Typography variant="subtitle1">
                                            ₹{item.price}
                                        </Typography>
                                    </Box>
                                ))}
                                <Divider sx={{ my: 2 }} />
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <Typography variant="h6">
                                        Total: ₹{order.totalAmount}
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>

                        {/* Customer Information */}
                        <Card sx={{ mb: 3 }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                    Customer Information
                                </Typography>
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="body1">
                                    <strong>Name:</strong> {order.shippingAddress?.fullName || order.userId?.fullName || 'N/A'}
                                </Typography>
                                <Typography variant="body1">
                                    <strong>Email:</strong> {order.shippingAddress?.email || order.userId?.email || 'N/A'}
                                </Typography>
                                <Typography variant="body1">
                                    <strong>Phone:</strong> {order.shippingAddress?.phone || order.userId?.phone || 'N/A'}
                                </Typography>
                            </CardContent>
                        </Card>

                        {/* Shipping Information */}
                        <Card sx={{ mb: 3 }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    <ShippingIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                    Shipping Information
                                </Typography>
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="body1">
                                    <strong>Address:</strong> {order.shippingAddress?.street || 'N/A'}
                                </Typography>
                                <Typography variant="body1">
                                    <strong>City:</strong> {order.shippingAddress?.city || 'N/A'}
                                </Typography>
                                <Typography variant="body1">
                                    <strong>State:</strong> {order.shippingAddress?.state || 'N/A'}
                                </Typography>
                                <Typography variant="body1">
                                    <strong>ZIP Code:</strong> {order.shippingAddress?.zipCode || 'N/A'}
                                </Typography>
                                <Typography variant="body1">
                                    <strong>Country:</strong> {order.shippingAddress?.country || 'N/A'}
                                </Typography>
                            </CardContent>
                        </Card>

                        {/* Payment Information */}
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    <PaymentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                    Payment Information
                                </Typography>
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="body1">
                                    <strong>Method:</strong> {order.paymentInfo?.method || 'N/A'}
                                </Typography>
                                <Typography variant="body1">
                                    <strong>Status:</strong> {order.paymentInfo?.status || 'N/A'}
                                </Typography>
                                {order.paymentInfo?.razorpayPaymentId && (
                                    <Typography variant="body1">
                                        <strong>Transaction ID:</strong> {order.paymentInfo.razorpayPaymentId}
                                    </Typography>
                                )}
                                <Typography variant="body1">
                                    <strong>Order Date:</strong> {formatDate(order.createdAt)}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Order Timeline */}
                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Order Timeline
                                </Typography>
                                <Divider sx={{ my: 2 }} />
                                {order.statusHistory?.length > 0 ? (
                                    order.statusHistory.map((status, index) => (
                                        <Box
                                            key={index}
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'flex-start',
                                                mb: 2,
                                                position: 'relative'
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    width: 2,
                                                    height: '100%',
                                                    bgcolor: 'divider',
                                                    position: 'absolute',
                                                    left: 10,
                                                    top: 20,
                                                    bottom: 0,
                                                    display: index === order.statusHistory.length - 1 ? 'none' : 'block'
                                                }}
                                            />
                                            <Box
                                                sx={{
                                                    width: 20,
                                                    height: 20,
                                                    borderRadius: '50%',
                                                    bgcolor: getStatusColor(status.status) + '.main',
                                                    mr: 2
                                                }}
                                            />
                                            <Box>
                                                <Typography variant="subtitle2">
                                                    {status.status?.toUpperCase() || 'UNKNOWN'}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {formatDate(status.timestamp)}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    ))
                                ) : (
                                    <Typography variant="body2" color="text.secondary">
                                        No status history available
                                    </Typography>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Paper>

            {/* Status Update Dialog */}
            <Dialog open={statusDialog} onClose={() => setStatusDialog(false)}>
                <DialogTitle>Update Order Status</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel>Status</InputLabel>
                        <Select
                            value={newStatus}
                            label="Status"
                            onChange={(e) => setNewStatus(e.target.value)}
                        >
                            {orderStatuses.map((status) => (
                                <MenuItem key={status.value} value={status.value}>
                                    {status.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setStatusDialog(false)}>Cancel</Button>
                    <Button 
                        onClick={handleStatusUpdate} 
                        variant="contained"
                        disabled={updating || !newStatus || newStatus === order.orderStatus}
                    >
                        {updating ? <CircularProgress size={20} /> : 'Update Status'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default AdminOrderDetails;
