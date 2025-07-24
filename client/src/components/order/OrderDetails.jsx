import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
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
    DialogActions
} from '@mui/material';
import {
    LocalShipping as ShippingIcon,
    Payment as PaymentIcon,
    Receipt as ReceiptIcon,
    Cancel as CancelIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { getOrder, cancelOrder, clearSuccess } from '../../features/order/orderSlice';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorState from '../common/ErrorState';
import { formatDate, formatCurrency } from '../../utils/format';

const OrderDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [cancelDialogOpen, setCancelDialogOpen] = React.useState(false);

    const { currentOrder: order, loading, error, success } = useSelector(
        (state) => state.order
    );

    useEffect(() => {
        dispatch(getOrder(id));
    }, [dispatch, id]);

    useEffect(() => {
        if (success) {
            dispatch(clearSuccess());
            navigate('/orders');
        }
    }, [success, dispatch, navigate]);

    const handleCancelOrder = () => {
        dispatch(cancelOrder(id));
        setCancelDialogOpen(false);
    };

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorState message={error} />;
    if (!order) return null;

    const getStatusColor = (status) => {
        const colors = {
            pending: 'warning',
            processing: 'info',
            shipped: 'primary',
            delivered: 'success',
            cancelled: 'error'
        };
        return colors[status] || 'default';
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Paper
                component={motion.div}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                sx={{ p: 3 }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h4" gutterBottom>
                        Order #{order.orderNumber}
                    </Typography>
                    <Chip
                        label={order.orderStatus.toUpperCase()}
                        color={getStatusColor(order.orderStatus)}
                        sx={{ fontSize: '1rem', py: 1 }}
                    />
                </Box>

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
                                {order.items.map((item) => (
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
                                                src={item.productId.images[0]}
                                                alt={item.productId.name}
                                                style={{
                                                    width: 60,
                                                    height: 60,
                                                    objectFit: 'cover',
                                                    marginRight: 16
                                                }}
                                            />
                                            <Box>
                                                <Typography variant="subtitle1">
                                                    {item.productId.name}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Size: {item.size} | Quantity: {item.quantity}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Typography variant="subtitle1">
                                            {formatCurrency(item.price)}
                                        </Typography>
                                    </Box>
                                ))}
                                <Divider sx={{ my: 2 }} />
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <Typography variant="h6">
                                        Total: {formatCurrency(order.totalAmount)}
                                    </Typography>
                                </Box>
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
                                    {order.shippingAddress.street}
                                </Typography>
                                <Typography variant="body1">
                                    {order.shippingAddress.city}, {order.shippingAddress.state}
                                </Typography>
                                <Typography variant="body1">
                                    {order.shippingAddress.pincode}
                                </Typography>
                                <Typography variant="body1">
                                    Phone: {order.shippingAddress.phone}
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
                                    Method: {order.paymentInfo.method}
                                </Typography>
                                <Typography variant="body1">
                                    Status: {order.paymentInfo.status}
                                </Typography>
                                {order.paymentInfo.razorpayPaymentId && (
                                    <Typography variant="body1">
                                        Transaction ID: {order.paymentInfo.razorpayPaymentId}
                                    </Typography>
                                )}
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
                                {order.statusHistory.map((status, index) => (
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
                                                {status.status.toUpperCase()}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {formatDate(status.timestamp)}
                                            </Typography>
                                        </Box>
                                    </Box>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Cancel Order Button */}
                        {order.canBeCancelled && (
                            <Button
                                variant="outlined"
                                color="error"
                                startIcon={<CancelIcon />}
                                fullWidth
                                onClick={() => setCancelDialogOpen(true)}
                                sx={{ mt: 2 }}
                            >
                                Cancel Order
                            </Button>
                        )}
                    </Grid>
                </Grid>
            </Paper>

            {/* Cancel Order Dialog */}
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

export default OrderDetails; 