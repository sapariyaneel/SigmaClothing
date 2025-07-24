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
  IconButton,
  Divider,
  Stack,
  useTheme,
} from '@mui/material';
import {
  LocalShipping as ShippingIcon,
  CheckCircle as DeliveredIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon,
  Settings as ProcessingIcon,
  Visibility as ViewIcon,
  ArrowBack as BackIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import axios from '../../utils/axios';
import { useResponsive } from '../../hooks/useResponsive';

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
  const theme = useTheme();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

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
    <Container
      maxWidth="lg"
      sx={{
        py: getResponsiveSpacing(),
        px: getContainerPadding()
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
          alignItems: 'center',
          gap: {
            xs: 1,
            sm: 2
          },
          flexDirection: {
            xs: 'column',
            sm: 'row'
          },
          justifyContent: {
            xs: 'center',
            sm: 'flex-start'
          }
        }}
      >
        <Typography
          variant={isMobile ? "h5" : "h4"}
          sx={{
            fontSize: {
              xs: '1.5rem',
              sm: '1.75rem',
              md: '2rem'
            },
            fontWeight: 'bold',
            textAlign: {
              xs: 'center',
              sm: 'left'
            }
          }}
        >
          My Orders
        </Typography>
      </Box>

      {!orders || orders.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center',
            mt: {
              xs: 4,
              sm: 6,
              md: 8
            },
            px: {
              xs: 2,
              sm: 4
            }
          }}
        >
          <Typography
            variant={isMobile ? "h6" : "h5"}
            color="text.secondary"
            gutterBottom
            sx={{
              fontSize: {
                xs: '1.1rem',
                sm: '1.25rem',
                md: '1.5rem'
              }
            }}
          >
            You haven't placed any orders yet
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/shop')}
            size={getButtonSize()}
            sx={{
              mt: {
                xs: 2,
                sm: 3
              },
              px: {
                xs: 3,
                sm: 4
              }
            }}
          >
            Start Shopping
          </Button>
        </Box>
      ) : (
        <Grid
          container
          spacing={{
            xs: 2,
            sm: 3,
            md: 3
          }}
        >
          {orders.map((order) => {
            if (!order || !order._id) {
              return null;
            }

            return (
              <Grid item xs={12} key={order._id}>
                <Card
                  variant="outlined"
                  component={motion.div}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  sx={{
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: {
                      xs: 2,
                      sm: 3
                    },
                    '&:hover': {
                      boxShadow: {
                        xs: 1,
                        sm: 2,
                        md: 3
                      },
                      transform: 'translateY(-2px)',
                      transition: 'all 0.2s ease-in-out'
                    }
                  }}
                >
                  <CardContent
                    sx={{
                      p: {
                        xs: 2,
                        sm: 3,
                        md: 4
                      }
                    }}
                  >
                    {/* Order Header */}
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: {
                          xs: 'flex-start',
                          sm: 'center'
                        },
                        mb: {
                          xs: 2,
                          sm: 3
                        },
                        flexDirection: {
                          xs: 'column',
                          sm: 'row'
                        },
                        gap: {
                          xs: 1,
                          sm: 0
                        }
                      }}
                    >
                      <Typography
                        variant={isMobile ? "subtitle1" : "h6"}
                        sx={{
                          fontSize: {
                            xs: '1rem',
                            sm: '1.125rem',
                            md: '1.25rem'
                          },
                          fontWeight: 'bold',
                          wordBreak: 'break-word'
                        }}
                      >
                        Order #{order.orderNumber || order._id.slice(-8).toUpperCase()}
                      </Typography>
                      <Chip
                        label={order.orderStatus?.toUpperCase() || 'PENDING'}
                        color={statusColors[order.orderStatus] || 'default'}
                        variant="outlined"
                        size={isMobile ? "small" : "medium"}
                        sx={{
                          fontSize: {
                            xs: '0.75rem',
                            sm: '0.875rem'
                          },
                          alignSelf: {
                            xs: 'flex-start',
                            sm: 'center'
                          }
                        }}
                      />
                    </Box>

                    {/* Order Items */}
                    <Box sx={{ mb: { xs: 2, sm: 3 } }}>
                      {Array.isArray(order.items) && order.items.map((item, index) => (
                        <Box
                          key={item._id || index}
                          sx={{
                            mb: {
                              xs: 2,
                              sm: 2.5
                            },
                            display: 'flex',
                            gap: {
                              xs: 1.5,
                              sm: 2,
                              md: 2.5
                            },
                            alignItems: {
                              xs: 'flex-start',
                              sm: 'center'
                            },
                            flexDirection: {
                              xs: 'column',
                              sm: 'row'
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
                          <Box
                            sx={{
                              display: 'flex',
                              gap: {
                                xs: 1.5,
                                sm: 2
                              },
                              alignItems: 'center',
                              width: {
                                xs: '100%',
                                sm: 'auto'
                              }
                            }}
                          >
                            <Box
                              component="img"
                              src={
                                item.productId?.images?.[0] ||
                                (typeof item.productId === 'string' ? '/placeholder.jpg' : item.productId?.image) ||
                                '/placeholder.jpg'
                              }
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
                                {item.productId?.name || 'Product Name Unavailable'}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                  fontSize: {
                                    xs: '0.75rem',
                                    sm: '0.875rem'
                                  },
                                  mb: 0.5
                                }}
                              >
                                Quantity: {item.quantity || 0}
                                {item.size && ` | Size: ${item.size}`}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="primary"
                                sx={{
                                  fontSize: {
                                    xs: '0.875rem',
                                    sm: '1rem'
                                  },
                                  fontWeight: 'bold'
                                }}
                              >
                                ₹{item.price || 0}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      ))}
                    </Box>

                    {/* Order Footer */}
                    <Divider sx={{ mb: { xs: 2, sm: 3 } }} />
                    <Box
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
                          xs: 2,
                          sm: 0
                        }
                      }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant={isMobile ? "subtitle1" : "h6"}
                          sx={{
                            fontSize: {
                              xs: '1rem',
                              sm: '1.125rem',
                              md: '1.25rem'
                            },
                            fontWeight: 'bold',
                            color: 'primary.main',
                            mb: 0.5
                          }}
                        >
                          Total: ₹{order.totalAmount || 0}
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
                          Ordered on: {new Date(order.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>

                      {/* Action Buttons */}
                      <Box
                        sx={{
                          display: 'flex',
                          gap: {
                            xs: 1,
                            sm: 1.5
                          },
                          flexDirection: {
                            xs: 'column',
                            sm: 'row'
                          },
                          width: {
                            xs: '100%',
                            sm: 'auto'
                          }
                        }}
                      >
                        {order.orderStatus && ['pending', 'processing'].includes(order.orderStatus.toLowerCase()) && (
                          <Button
                            variant="outlined"
                            color="error"
                            size={isMobile ? "medium" : getButtonSize()}
                            fullWidth={isMobile}
                            onClick={() => {
                              setSelectedOrder(order);
                              setCancelDialogOpen(true);
                            }}
                            sx={{
                              fontSize: {
                                xs: '0.875rem',
                                sm: '1rem'
                              },
                              px: {
                                xs: 2,
                                sm: 3
                              }
                            }}
                          >
                            Cancel Order
                          </Button>
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

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
              lineHeight: 1.6
            }}
          >
            Are you sure you want to cancel this order? This action cannot be undone.
          </Typography>
          {selectedOrder && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Order Details:
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                Order #{selectedOrder.orderNumber || selectedOrder._id.slice(-8).toUpperCase()}
              </Typography>
              <Typography variant="body2">
                Total: ₹{selectedOrder.totalAmount || 0}
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

export default Orders; 