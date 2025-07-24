import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    Container,
    Paper,
    Typography,
    Box,
    Stepper,
    Step,
    StepLabel,
    StepContent,
    Button,
    Card,
    CardContent,
    Grid,
    Chip,
    Divider,
    Alert
} from '@mui/material';
import {
    LocalShipping as ShippingIcon,
    CheckCircle as CheckCircleIcon,
    Schedule as ScheduleIcon,
    Cancel as CancelIcon,
    Assignment as AssignmentIcon,
    Inventory as InventoryIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { getOrder } from '../../features/order/orderSlice';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorState from '../common/ErrorState';
import { formatDate, formatCurrency } from '../../utils/format';

const OrderTracking = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { currentOrder: order, loading, error } = useSelector(
        (state) => state.order
    );

    useEffect(() => {
        dispatch(getOrder(id));
    }, [dispatch, id]);

    const getOrderSteps = () => {
        const baseSteps = [
            {
                label: 'Order Placed',
                description: 'Your order has been placed successfully',
                icon: <AssignmentIcon />,
                status: 'completed'
            },
            {
                label: 'Order Confirmed',
                description: 'Your order has been confirmed and is being prepared',
                icon: <CheckCircleIcon />,
                status: order?.orderStatus === 'pending' ? 'pending' : 'completed'
            },
            {
                label: 'Processing',
                description: 'Your order is being processed and packed',
                icon: <InventoryIcon />,
                status: ['pending', 'confirmed'].includes(order?.orderStatus) ? 
                    (order?.orderStatus === 'confirmed' ? 'active' : 'pending') : 'completed'
            },
            {
                label: 'Shipped',
                description: 'Your order has been shipped and is on the way',
                icon: <ShippingIcon />,
                status: order?.orderStatus === 'shipped' ? 'active' : 
                    ['delivered'].includes(order?.orderStatus) ? 'completed' : 'pending'
            },
            {
                label: 'Delivered',
                description: 'Your order has been delivered successfully',
                icon: <CheckCircleIcon />,
                status: order?.orderStatus === 'delivered' ? 'completed' : 'pending'
            }
        ];

        // Handle cancelled orders
        if (order?.orderStatus === 'cancelled') {
            return baseSteps.map((step, index) => ({
                ...step,
                status: index === 0 ? 'completed' : 'cancelled'
            }));
        }

        return baseSteps;
    };

    const getActiveStep = () => {
        if (!order) return 0;
        
        switch (order.orderStatus) {
            case 'pending':
                return 1;
            case 'confirmed':
                return 2;
            case 'processing':
                return 2;
            case 'shipped':
                return 3;
            case 'delivered':
                return 4;
            case 'cancelled':
                return 1;
            default:
                return 0;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'delivered':
                return 'success';
            case 'shipped':
                return 'info';
            case 'processing':
                return 'warning';
            case 'cancelled':
                return 'error';
            default:
                return 'default';
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return <ErrorState message={error} />;
    }

    if (!order) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert severity="error">
                    Order not found. Please check the order ID and try again.
                </Alert>
                <Button 
                    variant="contained" 
                    onClick={() => navigate('/orders')}
                    sx={{ mt: 2 }}
                >
                    Back to Orders
                </Button>
            </Container>
        );
    }

    const steps = getOrderSteps();
    const activeStep = getActiveStep();

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Paper
                component={motion.div}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                sx={{ p: 3 }}
            >
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Box>
                        <Typography variant="h4" gutterBottom>
                            Track Your Order
                        </Typography>
                        <Typography variant="h6" color="text.secondary">
                            Order #{order.orderNumber || order._id?.slice(-8).toUpperCase()}
                        </Typography>
                    </Box>
                    <Chip
                        label={order.orderStatus?.toUpperCase() || 'PENDING'}
                        color={getStatusColor(order.orderStatus)}
                        sx={{ fontSize: '1rem', py: 1 }}
                    />
                </Box>

                <Grid container spacing={4}>
                    {/* Order Tracking Steps */}
                    <Grid item xs={12} md={8}>
                        <Card sx={{ mb: 3 }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Order Status
                                </Typography>
                                <Stepper activeStep={activeStep} orientation="vertical">
                                    {steps.map((step, index) => (
                                        <Step key={step.label}>
                                            <StepLabel
                                                icon={step.icon}
                                                sx={{
                                                    '& .MuiStepIcon-root': {
                                                        color: step.status === 'completed' ? 'success.main' :
                                                               step.status === 'active' ? 'primary.main' :
                                                               step.status === 'cancelled' ? 'error.main' :
                                                               'grey.400'
                                                    }
                                                }}
                                            >
                                                {step.label}
                                            </StepLabel>
                                            <StepContent>
                                                <Typography variant="body2" color="text.secondary">
                                                    {step.description}
                                                </Typography>
                                                {index === activeStep && order.orderStatus !== 'cancelled' && (
                                                    <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
                                                        Current Status
                                                    </Typography>
                                                )}
                                            </StepContent>
                                        </Step>
                                    ))}
                                </Stepper>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Order Summary */}
                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Order Summary
                                </Typography>
                                <Divider sx={{ mb: 2 }} />
                                
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Order Date
                                    </Typography>
                                    <Typography variant="body1">
                                        {formatDate(order.createdAt)}
                                    </Typography>
                                </Box>

                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Total Amount
                                    </Typography>
                                    <Typography variant="h6" color="primary">
                                        {formatCurrency(order.totalAmount)}
                                    </Typography>
                                </Box>

                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Items
                                    </Typography>
                                    <Typography variant="body1">
                                        {order.items?.length || 0} item(s)
                                    </Typography>
                                </Box>

                                {order.expectedDeliveryDate && (
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            Expected Delivery
                                        </Typography>
                                        <Typography variant="body1">
                                            {formatDate(order.expectedDeliveryDate)}
                                        </Typography>
                                    </Box>
                                )}

                                <Divider sx={{ my: 2 }} />

                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    <Button
                                        variant="outlined"
                                        onClick={() => navigate(`/orders/${order._id}`)}
                                        fullWidth
                                    >
                                        View Order Details
                                    </Button>
                                    <Button
                                        variant="text"
                                        onClick={() => navigate('/orders')}
                                        fullWidth
                                    >
                                        Back to Orders
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Paper>
        </Container>
    );
};

export default OrderTracking;
