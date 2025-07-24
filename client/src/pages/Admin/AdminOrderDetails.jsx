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
    CircularProgress,
    Stack,
    useTheme
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
import { useResponsive } from '../../hooks/useResponsive';

const AdminOrderDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const theme = useTheme();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [statusDialog, setStatusDialog] = useState(false);
    const [newStatus, setNewStatus] = useState('');
    const [updating, setUpdating] = useState(false);

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
                        alignItems: {
                            xs: 'flex-start',
                            sm: 'center'
                        },
                        justifyContent: 'space-between',
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
                            onClick={() => navigate('/admin/orders', { state: { refresh: true } })}
                            size={isMobile ? 'small' : 'medium'}
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
                            Order #{order._id?.slice(-8).toUpperCase() || 'N/A'}
                        </Typography>
                    </Box>
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: {
                            xs: 1,
                            sm: 2
                        },
                        flexDirection: {
                            xs: 'column',
                            sm: 'row'
                        },
                        width: {
                            xs: '100%',
                            sm: 'auto'
                        },
                        alignSelf: {
                            xs: 'flex-start',
                            sm: 'center'
                        }
                    }}>
                        <Chip
                            label={order.orderStatus?.toUpperCase() || 'PENDING'}
                            color={getStatusColor(order.orderStatus || 'pending')}
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
                        <Button
                            variant="outlined"
                            startIcon={<EditIcon />}
                            onClick={openStatusDialog}
                            size={getButtonSize()}
                            fullWidth={isMobile}
                            sx={{
                                fontSize: {
                                    xs: '0.875rem',
                                    sm: '1rem'
                                }
                            }}
                        >
                            {isMobile ? 'Update' : 'Update Status'}
                        </Button>
                    </Box>
                </Box>

                {error && (
                    <Alert
                        severity="error"
                        sx={{
                            mb: {
                                xs: 2,
                                sm: 3
                            },
                            fontSize: {
                                xs: '0.875rem',
                                sm: '1rem'
                            }
                        }}
                        onClose={() => setError('')}
                    >
                        {error}
                    </Alert>
                )}

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
                                                ₹{item.price}
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
                                        Total: ₹{order.totalAmount}
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>

                        {/* Customer Information */}
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
                                    <PersonIcon sx={{
                                        fontSize: {
                                            xs: '1.25rem',
                                            sm: '1.5rem'
                                        }
                                    }} />
                                    Customer Information
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
                                        <strong>Name:</strong> {order.shippingAddress?.fullName || order.userId?.fullName || 'N/A'}
                                    </Typography>
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
                                        <strong>Email:</strong> {order.shippingAddress?.email || order.userId?.email || 'N/A'}
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
                                        <strong>Phone:</strong> {order.shippingAddress?.phone || order.userId?.phone || 'N/A'}
                                    </Typography>
                                </Stack>
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
                                        <strong>City:</strong> {order.shippingAddress?.city || 'N/A'}
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
                                        <strong>State:</strong> {order.shippingAddress?.state || 'N/A'}
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
                                        <strong>ZIP Code:</strong> {order.shippingAddress?.zipCode || 'N/A'}
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
                                        <strong>Country:</strong> {order.shippingAddress?.country || 'N/A'}
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

                    {/* Order Timeline */}
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
                    </Grid>
                </Grid>
            </Paper>

            {/* Responsive Status Update Dialog */}
            <Dialog
                open={statusDialog}
                onClose={() => setStatusDialog(false)}
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
                    Update Order Status
                    {isMobile && (
                        <IconButton
                            aria-label="close"
                            onClick={() => setStatusDialog(false)}
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
                    <Box sx={{ pt: { xs: 1, sm: 2 } }}>
                        <Typography
                            variant="body2"
                            sx={{
                                mb: 2,
                                fontSize: {
                                    xs: '0.875rem',
                                    sm: '1rem'
                                }
                            }}
                        >
                            Order ID: {order?._id?.slice(-8).toUpperCase() || 'N/A'}
                        </Typography>
                        <FormControl
                            fullWidth
                            size={isMobile ? "medium" : "medium"}
                        >
                            <InputLabel>Order Status</InputLabel>
                            <Select
                                value={newStatus}
                                label="Order Status"
                                onChange={(e) => setNewStatus(e.target.value)}
                                MenuProps={{
                                    disableRestoreFocus: false,
                                    disableEnforceFocus: false,
                                    disableAutoFocus: true,
                                }}
                            >
                                {orderStatuses.map((status) => (
                                    <MenuItem key={status.value} value={status.value}>
                                        {status.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
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
                        onClick={() => setStatusDialog(false)}
                        fullWidth={isMobile}
                        size={isMobile ? "large" : "medium"}
                        sx={{
                            order: {
                                xs: 2,
                                sm: 1
                            }
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleStatusUpdate}
                        variant="contained"
                        fullWidth={isMobile}
                        size={isMobile ? "large" : "medium"}
                        disabled={updating || !newStatus || newStatus === order?.orderStatus}
                        sx={{
                            order: {
                                xs: 1,
                                sm: 2
                            }
                        }}
                    >
                        {updating ? <CircularProgress size={20} /> : 'Update Status'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default AdminOrderDetails;
