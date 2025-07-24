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
    DialogActions,
    IconButton,
    useTheme,
    Stack
} from '@mui/material';
import {
    LocalShipping as ShippingIcon,
    Payment as PaymentIcon,
    Receipt as ReceiptIcon,
    Cancel as CancelIcon,
    ArrowBack as BackIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { getOrder, cancelOrder, clearSuccess } from '../../features/order/orderSlice';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorState from '../common/ErrorState';
import { formatDate, formatCurrency } from '../../utils/format';
import { useResponsive } from '../../hooks/useResponsive';

const OrderDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const theme = useTheme();
    const [cancelDialogOpen, setCancelDialogOpen] = React.useState(false);

    const { currentOrder: order, loading, error, success } = useSelector(
        (state) => state.order
    );

    // Responsive hooks
    const {
        isMobile,
        isTablet,
        isDesktop,
        getResponsiveSpacing,
        getContainerPadding,
        getButtonSize,
        getDialogMaxWidth,
    } = useResponsive();

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
        <Container
            maxWidth="lg"
            sx={{
                py: getResponsiveSpacing(),
                px: getContainerPadding()
            }}
        >
            <Paper
                component={motion.div}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                elevation={0}
                sx={{
                    p: {
                        xs: 2,
                        sm: 3,
                        md: 4
                    },
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: {
                        xs: 2,
                        sm: 3
                    }
                }}
            >
                {/* Responsive Header */}
                <Box
                    sx={{
                        mb: {
                            xs: 3,
                            sm: 4
                        },
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: {
                            xs: 'flex-start',
                            sm: 'center'
                        },
                        flexDirection: {
                            xs: 'column',
                            sm: 'row'
                        },
                        gap: {
                            xs: 2,
                            sm: 0
                        }
                    }}
                >
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: {
                            xs: 1,
                            sm: 2
                        },
                        width: {
                            xs: '100%',
                            sm: 'auto'
                        }
                    }}>
                        <IconButton
                            onClick={() => navigate('/orders')}
                            size={isMobile ? 'small' : 'medium'}
                            sx={{
                                display: {
                                    xs: 'flex',
                                    sm: 'none'
                                }
                            }}
                        >
                            <BackIcon />
                        </IconButton>
                        <Typography
                            variant={isMobile ? "h5" : "h4"}
                            sx={{
                                fontSize: {
                                    xs: '1.25rem',
                                    sm: '1.5rem',
                                    md: '1.75rem'
                                },
                                fontWeight: 'bold',
                                wordBreak: 'break-word'
                            }}
                        >
                            Order #{order.orderNumber || order._id?.slice(-8).toUpperCase()}
                        </Typography>
                    </Box>
                    <Chip
                        label={order.orderStatus?.toUpperCase() || 'PENDING'}
                        color={getStatusColor(order.orderStatus)}
                        size={isMobile ? "medium" : "large"}
                        sx={{
                            fontSize: {
                                xs: '0.875rem',
                                sm: '1rem'
                            },
                            py: {
                                xs: 0.5,
                                sm: 1
                            },
                            alignSelf: {
                                xs: 'flex-start',
                                sm: 'center'
                            }
                        }}
                    />
                </Box>

                <Grid
                    container
                    spacing={{
                        xs: 2,
                        sm: 3,
                        md: 4
                    }}
                >
                    {/* Order Summary */}
                    <Grid item xs={12} md={8}>
                        <Card
                            sx={{
                                mb: {
                                    xs: 2,
                                    sm: 3
                                },
                                borderRadius: {
                                    xs: 2,
                                    sm: 3
                                }
                            }}
                        >
                            <CardContent
                                sx={{
                                    p: {
                                        xs: 2,
                                        sm: 3,
                                        md: 3
                                    }
                                }}
                            >
                                <Typography
                                    variant={isMobile ? "subtitle1" : "h6"}
                                    gutterBottom
                                    sx={{
                                        fontSize: {
                                            xs: '1rem',
                                            sm: '1.125rem',
                                            md: '1.25rem'
                                        },
                                        fontWeight: 'bold',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1
                                    }}
                                >
                                    <ReceiptIcon sx={{
                                        fontSize: {
                                            xs: '1.25rem',
                                            sm: '1.5rem'
                                        }
                                    }} />
                                    Order Summary
                                </Typography>
                                <Divider sx={{ my: { xs: 1.5, sm: 2 } }} />

                                {/* Order Items */}
                                <Stack spacing={{ xs: 2, sm: 2.5 }}>
                                    {order.items?.map((item) => (
                                        <Box
                                            key={item._id}
                                            sx={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: {
                                                    xs: 'flex-start',
                                                    sm: 'center'
                                                },
                                                flexDirection: {
                                                    xs: 'column',
                                                    sm: 'row'
                                                },
                                                gap: {
                                                    xs: 1.5,
                                                    sm: 0
                                                },
                                                p: {
                                                    xs: 1.5,
                                                    sm: 2
                                                },
                                                bgcolor: 'grey.50',
                                                borderRadius: {
                                                    xs: 1,
                                                    sm: 2
                                                },
                                                border: '1px solid',
                                                borderColor: 'grey.200'
                                            }}
                                        >
                                            <Box sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: {
                                                    xs: 1.5,
                                                    sm: 2
                                                },
                                                width: {
                                                    xs: '100%',
                                                    sm: 'auto'
                                                }
                                            }}>
                                                <Box
                                                    component="img"
                                                    src={item.productId?.images?.[0] || '/placeholder.jpg'}
                                                    alt={item.productId?.name || 'Product'}
                                                    sx={{
                                                        width: {
                                                            xs: 60,
                                                            sm: 70,
                                                            md: 80
                                                        },
                                                        height: {
                                                            xs: 60,
                                                            sm: 70,
                                                            md: 80
                                                        },
                                                        objectFit: 'cover',
                                                        borderRadius: {
                                                            xs: 1,
                                                            sm: 1.5
                                                        },
                                                        flexShrink: 0
                                                    }}
                                                />
                                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                                    <Typography
                                                        variant={isMobile ? "body1" : "subtitle1"}
                                                        sx={{
                                                            fontSize: {
                                                                xs: '0.875rem',
                                                                sm: '1rem',
                                                                md: '1.125rem'
                                                            },
                                                            fontWeight: 'medium',
                                                            mb: 0.5,
                                                            wordBreak: 'break-word'
                                                        }}
                                                    >
                                                        {item.productId?.name || 'Product Name'}
                                                    </Typography>
                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                        sx={{
                                                            fontSize: {
                                                                xs: '0.75rem',
                                                                sm: '0.875rem'
                                                            }
                                                        }}
                                                    >
                                                        Size: {item.size} | Quantity: {item.quantity}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            <Typography
                                                variant={isMobile ? "body1" : "subtitle1"}
                                                sx={{
                                                    fontSize: {
                                                        xs: '0.875rem',
                                                        sm: '1rem',
                                                        md: '1.125rem'
                                                    },
                                                    fontWeight: 'bold',
                                                    color: 'primary.main',
                                                    alignSelf: {
                                                        xs: 'flex-end',
                                                        sm: 'center'
                                                    }
                                                }}
                                            >
                                                {formatCurrency(item.price)}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Stack>

                                <Divider sx={{ my: { xs: 2, sm: 2.5 } }} />
                                <Box sx={{
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                    alignItems: 'center'
                                }}>
                                    <Typography
                                        variant={isMobile ? "subtitle1" : "h6"}
                                        sx={{
                                            fontSize: {
                                                xs: '1rem',
                                                sm: '1.125rem',
                                                md: '1.25rem'
                                            },
                                            fontWeight: 'bold',
                                            color: 'primary.main'
                                        }}
                                    >
                                        Total: {formatCurrency(order.totalAmount)}
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>

                        {/* Shipping Information */}
                        <Card
                            sx={{
                                mb: {
                                    xs: 2,
                                    sm: 3
                                },
                                borderRadius: {
                                    xs: 2,
                                    sm: 3
                                }
                            }}
                        >
                            <CardContent
                                sx={{
                                    p: {
                                        xs: 2,
                                        sm: 3,
                                        md: 3
                                    }
                                }}
                            >
                                <Typography
                                    variant={isMobile ? "subtitle1" : "h6"}
                                    gutterBottom
                                    sx={{
                                        fontSize: {
                                            xs: '1rem',
                                            sm: '1.125rem',
                                            md: '1.25rem'
                                        },
                                        fontWeight: 'bold',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1
                                    }}
                                >
                                    <ShippingIcon sx={{
                                        fontSize: {
                                            xs: '1.25rem',
                                            sm: '1.5rem'
                                        }
                                    }} />
                                    Shipping Information
                                </Typography>
                                <Divider sx={{ my: { xs: 1.5, sm: 2 } }} />
                                <Stack spacing={{ xs: 1, sm: 1.5 }}>
                                    <Typography
                                        variant="body1"
                                        sx={{
                                            fontSize: {
                                                xs: '0.875rem',
                                                sm: '1rem'
                                            },
                                            wordBreak: 'break-word'
                                        }}
                                    >
                                        <strong>Address:</strong> {order.shippingAddress?.street || 'N/A'}
                                    </Typography>
                                    <Typography
                                        variant="body1"
                                        sx={{
                                            fontSize: {
                                                xs: '0.875rem',
                                                sm: '1rem'
                                            }
                                        }}
                                    >
                                        <strong>City:</strong> {order.shippingAddress?.city || 'N/A'}, {order.shippingAddress?.state || 'N/A'}
                                    </Typography>
                                    <Typography
                                        variant="body1"
                                        sx={{
                                            fontSize: {
                                                xs: '0.875rem',
                                                sm: '1rem'
                                            }
                                        }}
                                    >
                                        <strong>Pincode:</strong> {order.shippingAddress?.pincode || 'N/A'}
                                    </Typography>
                                    <Typography
                                        variant="body1"
                                        sx={{
                                            fontSize: {
                                                xs: '0.875rem',
                                                sm: '1rem'
                                            }
                                        }}
                                    >
                                        <strong>Phone:</strong> {order.shippingAddress?.phone || 'N/A'}
                                    </Typography>
                                </Stack>
                            </CardContent>
                        </Card>

                        {/* Payment Information */}
                        <Card
                            sx={{
                                borderRadius: {
                                    xs: 2,
                                    sm: 3
                                }
                            }}
                        >
                            <CardContent
                                sx={{
                                    p: {
                                        xs: 2,
                                        sm: 3,
                                        md: 3
                                    }
                                }}
                            >
                                <Typography
                                    variant={isMobile ? "subtitle1" : "h6"}
                                    gutterBottom
                                    sx={{
                                        fontSize: {
                                            xs: '1rem',
                                            sm: '1.125rem',
                                            md: '1.25rem'
                                        },
                                        fontWeight: 'bold',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1
                                    }}
                                >
                                    <PaymentIcon sx={{
                                        fontSize: {
                                            xs: '1.25rem',
                                            sm: '1.5rem'
                                        }
                                    }} />
                                    Payment Information
                                </Typography>
                                <Divider sx={{ my: { xs: 1.5, sm: 2 } }} />
                                <Stack spacing={{ xs: 1, sm: 1.5 }}>
                                    <Typography
                                        variant="body1"
                                        sx={{
                                            fontSize: {
                                                xs: '0.875rem',
                                                sm: '1rem'
                                            }
                                        }}
                                    >
                                        <strong>Method:</strong> {order.paymentInfo?.method || 'N/A'}
                                    </Typography>
                                    <Typography
                                        variant="body1"
                                        sx={{
                                            fontSize: {
                                                xs: '0.875rem',
                                                sm: '1rem'
                                            }
                                        }}
                                    >
                                        <strong>Status:</strong> {order.paymentInfo?.status || 'N/A'}
                                    </Typography>
                                    {order.paymentInfo?.razorpayPaymentId && (
                                        <Typography
                                            variant="body1"
                                            sx={{
                                                fontSize: {
                                                    xs: '0.875rem',
                                                    sm: '1rem'
                                                },
                                                wordBreak: 'break-all'
                                            }}
                                        >
                                            <strong>Transaction ID:</strong> {order.paymentInfo.razorpayPaymentId}
                                        </Typography>
                                    )}
                                    <Typography
                                        variant="body1"
                                        sx={{
                                            fontSize: {
                                                xs: '0.875rem',
                                                sm: '1rem'
                                            }
                                        }}
                                    >
                                        <strong>Order Date:</strong> {formatDate(order.createdAt)}
                                    </Typography>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Order Timeline & Actions */}
                    <Grid item xs={12} md={4}>
                        <Card
                            sx={{
                                borderRadius: {
                                    xs: 2,
                                    sm: 3
                                }
                            }}
                        >
                            <CardContent
                                sx={{
                                    p: {
                                        xs: 2,
                                        sm: 3,
                                        md: 3
                                    }
                                }}
                            >
                                <Typography
                                    variant={isMobile ? "subtitle1" : "h6"}
                                    gutterBottom
                                    sx={{
                                        fontSize: {
                                            xs: '1rem',
                                            sm: '1.125rem',
                                            md: '1.25rem'
                                        },
                                        fontWeight: 'bold'
                                    }}
                                >
                                    Order Timeline
                                </Typography>
                                <Divider sx={{ my: { xs: 1.5, sm: 2 } }} />

                                {order.statusHistory?.length > 0 ? (
                                    <Stack spacing={{ xs: 2, sm: 2.5 }}>
                                        {order.statusHistory.map((status, index) => (
                                            <Box
                                                key={index}
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'flex-start',
                                                    position: 'relative'
                                                }}
                                            >
                                                {/* Timeline Line */}
                                                <Box
                                                    sx={{
                                                        width: 2,
                                                        height: '100%',
                                                        bgcolor: 'divider',
                                                        position: 'absolute',
                                                        left: {
                                                            xs: 8,
                                                            sm: 10
                                                        },
                                                        top: {
                                                            xs: 16,
                                                            sm: 20
                                                        },
                                                        bottom: 0,
                                                        display: index === order.statusHistory.length - 1 ? 'none' : 'block'
                                                    }}
                                                />
                                                {/* Status Dot */}
                                                <Box
                                                    sx={{
                                                        width: {
                                                            xs: 16,
                                                            sm: 20
                                                        },
                                                        height: {
                                                            xs: 16,
                                                            sm: 20
                                                        },
                                                        borderRadius: '50%',
                                                        bgcolor: getStatusColor(status.status) + '.main',
                                                        mr: {
                                                            xs: 1.5,
                                                            sm: 2
                                                        },
                                                        flexShrink: 0
                                                    }}
                                                />
                                                {/* Status Content */}
                                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                                    <Typography
                                                        variant="subtitle2"
                                                        sx={{
                                                            fontSize: {
                                                                xs: '0.875rem',
                                                                sm: '1rem'
                                                            },
                                                            fontWeight: 'medium',
                                                            mb: 0.5
                                                        }}
                                                    >
                                                        {status.status?.toUpperCase() || 'UNKNOWN'}
                                                    </Typography>
                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                        sx={{
                                                            fontSize: {
                                                                xs: '0.75rem',
                                                                sm: '0.875rem'
                                                            }
                                                        }}
                                                    >
                                                        {formatDate(status.timestamp)}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        ))}
                                    </Stack>
                                ) : (
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{
                                            fontSize: {
                                                xs: '0.875rem',
                                                sm: '1rem'
                                            },
                                            textAlign: 'center',
                                            py: 2
                                        }}
                                    >
                                        No status history available
                                    </Typography>
                                )}
                            </CardContent>
                        </Card>

                        {/* Cancel Order Button */}
                        {order.canBeCancelled && (
                            <Button
                                variant="outlined"
                                color="error"
                                startIcon={<CancelIcon />}
                                fullWidth
                                size={getButtonSize()}
                                onClick={() => setCancelDialogOpen(true)}
                                sx={{
                                    mt: {
                                        xs: 2,
                                        sm: 3
                                    },
                                    fontSize: {
                                        xs: '0.875rem',
                                        sm: '1rem'
                                    },
                                    py: {
                                        xs: 1,
                                        sm: 1.5
                                    }
                                }}
                            >
                                Cancel Order
                            </Button>
                        )}
                    </Grid>
                </Grid>
            </Paper>

            {/* Responsive Cancel Order Dialog */}
            <Dialog
                open={cancelDialogOpen}
                onClose={() => setCancelDialogOpen(false)}
                maxWidth={getDialogMaxWidth()}
                fullWidth
                fullScreen={isMobile}
                PaperProps={{
                    sx: {
                        ...(isMobile && {
                            m: 0,
                            borderRadius: 0,
                            height: '100%',
                            maxHeight: '100%'
                        }),
                        ...(!isMobile && {
                            borderRadius: 2,
                            minWidth: {
                                sm: 400,
                                md: 500
                            }
                        })
                    }
                }}
            >
                <DialogTitle
                    sx={{
                        pb: 1,
                        fontSize: {
                            xs: '1.1rem',
                            sm: '1.25rem'
                        },
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}
                >
                    Cancel Order
                    {isMobile && (
                        <IconButton
                            aria-label="close"
                            onClick={() => setCancelDialogOpen(false)}
                            sx={{
                                color: (theme) => theme.palette.grey[500],
                            }}
                        >
                            <BackIcon />
                        </IconButton>
                    )}
                </DialogTitle>
                <DialogContent
                    sx={{
                        pb: isMobile ? 2 : 1,
                        px: {
                            xs: 2,
                            sm: 3
                        }
                    }}
                >
                    <Typography
                        sx={{
                            fontSize: {
                                xs: '0.875rem',
                                sm: '1rem'
                            },
                            lineHeight: 1.6,
                            mb: 2
                        }}
                    >
                        Are you sure you want to cancel this order? This action cannot be undone.
                    </Typography>
                    {order && (
                        <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                Order Details:
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                Order #{order.orderNumber || order._id?.slice(-8).toUpperCase()}
                            </Typography>
                            <Typography variant="body2">
                                Total: {formatCurrency(order.totalAmount)}
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions
                    sx={{
                        p: {
                            xs: 2,
                            sm: 3
                        },
                        gap: 1,
                        flexDirection: {
                            xs: 'column',
                            sm: 'row'
                        }
                    }}
                >
                    <Button
                        onClick={() => setCancelDialogOpen(false)}
                        fullWidth={isMobile}
                        size={isMobile ? "large" : "medium"}
                        sx={{
                            order: {
                                xs: 2,
                                sm: 1
                            }
                        }}
                    >
                        No, Keep Order
                    </Button>
                    <Button
                        onClick={handleCancelOrder}
                        color="error"
                        variant="contained"
                        fullWidth={isMobile}
                        size={isMobile ? "large" : "medium"}
                        sx={{
                            order: {
                                xs: 1,
                                sm: 2
                            }
                        }}
                    >
                        Yes, Cancel Order
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default OrderDetails; 