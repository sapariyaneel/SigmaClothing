import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Box,
  Alert,
  CircularProgress,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Card,
  CardContent,
  Divider,
  TextField,
  InputAdornment,
  useTheme,
  useMediaQuery,
  Stack,
  Collapse
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import axios from '../../utils/axios';
import { useSelectFix } from '../../hooks/useFocusManagement';
import { useResponsive, useResponsiveTable } from '../../hooks/useResponsive';
import eventBus, { EVENTS } from '../../utils/eventBus';

const ManageOrders = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusDialog, setStatusDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  // Responsive hooks
  const {
    isMobile,
    isTablet,
    isDesktop,
    getResponsiveSpacing,
    getContainerPadding
  } = useResponsive();

  const {
    shouldUseCards,
    shouldUseHorizontalScroll,
    shouldUseFullTable
  } = useResponsiveTable();

  // Apply select focus fix for dropdown components
  useSelectFix();

  const orderStatuses = [
    { value: 'pending', label: 'Pending', color: 'warning' },
    { value: 'processing', label: 'Processing', color: 'info' },
    { value: 'shipped', label: 'Shipped', color: 'primary' },
    { value: 'delivered', label: 'Delivered', color: 'success' },
    { value: 'cancelled', label: 'Cancelled', color: 'error' }
  ];

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/orders');
      setOrders(response.data.data || []);
    } catch (error) {
      setError(error.response?.data?.message || 'Error fetching orders');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Refresh orders if coming back from order details with refresh flag
  useEffect(() => {
    if (location.state?.refresh) {
      fetchOrders();
      // Clear the state to prevent unnecessary refreshes
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, fetchOrders, navigate, location.pathname]);

  // Listen for order status updates to refresh orders list immediately
  useEffect(() => {
    const handleOrderStatusUpdate = (data) => {
      // Update the specific order in the list immediately
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order._id === data.orderId
            ? { ...order, orderStatus: data.newStatus }
            : order
        )
      );
    };

    // Subscribe to order status update events
    const unsubscribe = eventBus.on(EVENTS.ORDER_STATUS_UPDATED, handleOrderStatusUpdate);

    // Cleanup subscription on component unmount
    return unsubscribe;
  }, []);

  const handleStatusUpdate = async () => {
    try {
      const response = await axios.patch(`/orders/${selectedOrder._id}/status`, {
        orderStatus: newStatus
      });

      if (response.data.success) {
        // Update local state immediately
        setOrders(prevOrders =>
          prevOrders.map(order =>
            order._id === selectedOrder._id
              ? { ...order, orderStatus: newStatus }
              : order
          )
        );

        // Emit event to notify other components (like dashboard) to refresh
        eventBus.emit(EVENTS.ORDER_STATUS_UPDATED, {
          orderId: selectedOrder._id,
          newStatus: newStatus,
          order: response.data.data
        });

        setStatusDialog(false);
        setSelectedOrder(null);
        setNewStatus('');
        // Clear any previous errors
        setError('');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Error updating order status');
    }
  };

  const openStatusDialog = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.orderStatus || 'pending');
    setStatusDialog(true);
  };

  const getStatusColor = (status) => {
    const statusObj = orderStatuses.find(s => s.value === status);
    return statusObj ? statusObj.color : 'default';
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = (order._id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (order.userId?.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (order.userId?.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.orderStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
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
      <Paper
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
            alignItems: 'center',
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
            },
            justifyContent: {
              xs: 'flex-start',
              sm: 'flex-start'
            }
          }}>
            <IconButton
              onClick={() => navigate('/admin')}
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
                }
              }}
            >
              Manage Orders
            </Typography>
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

        {/* Responsive Filters Section */}
        <Box sx={{ mb: { xs: 2, sm: 3 } }}>
          {/* Mobile: Collapsible Filters */}
          {isMobile && (
            <Box>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterIcon />}
                endIcon={filtersExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                onClick={() => setFiltersExpanded(!filtersExpanded)}
                sx={{
                  mb: 2,
                  justifyContent: 'space-between',
                  textTransform: 'none'
                }}
              >
                Filters & Search
              </Button>
              <Collapse in={filtersExpanded}>
                <Stack spacing={2}>
                  <TextField
                    fullWidth
                    placeholder="Search orders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    size="small"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <FormControl fullWidth size="small">
                    <InputLabel id="mobile-status-filter-label">Status Filter</InputLabel>
                    <Select
                      labelId="mobile-status-filter-label"
                      value={statusFilter}
                      label="Status Filter"
                      onChange={(e) => setStatusFilter(e.target.value)}
                      MenuProps={{
                        disableRestoreFocus: false,
                        disableEnforceFocus: false,
                        disableAutoFocus: true,
                      }}
                    >
                      <MenuItem value="all">All Orders</MenuItem>
                      {orderStatuses.map((status) => (
                        <MenuItem key={status.value} value={status.value}>
                          {status.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>
              </Collapse>
            </Box>
          )}

          {/* Tablet & Desktop: Horizontal Filters */}
          {!isMobile && (
            <Grid container spacing={{ xs: 2, sm: 2, md: 3 }}>
              <Grid item xs={12} sm={8} md={6} lg={7}>
                <TextField
                  fullWidth
                  placeholder="Search by Order ID, Customer Name, or Email"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  size={isTablet ? "small" : "medium"}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4} md={3} lg={3}>
                <FormControl fullWidth size={isTablet ? "small" : "medium"}>
                  <InputLabel id="status-filter-label">Status Filter</InputLabel>
                  <Select
                    labelId="status-filter-label"
                    id="status-filter-select"
                    value={statusFilter}
                    label="Status Filter"
                    onChange={(e) => setStatusFilter(e.target.value)}
                    MenuProps={{
                      disableRestoreFocus: false,
                      disableEnforceFocus: false,
                      disableAutoFocus: true,
                    }}
                  >
                    <MenuItem value="all">All Orders</MenuItem>
                    {orderStatuses.map((status) => (
                      <MenuItem key={status.value} value={status.value}>
                        {status.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          )}
        </Box>

        {/* Responsive Orders Summary Cards */}
        <Grid
          container
          spacing={{
            xs: 2,
            sm: 2,
            md: 3
          }}
          sx={{
            mb: {
              xs: 3,
              sm: 4
            }
          }}
        >
          <Grid item xs={6} sm={6} md={3}>
            <Card
              sx={{
                height: '100%',
                transition: 'transform 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 2
                }
              }}
            >
              <CardContent
                sx={{
                  p: {
                    xs: 2,
                    sm: 2,
                    md: 3
                  },
                  textAlign: 'center'
                }}
              >
                <Typography
                  color="textSecondary"
                  gutterBottom
                  variant={isMobile ? "body2" : "body1"}
                  sx={{
                    fontSize: {
                      xs: '0.75rem',
                      sm: '0.875rem',
                      md: '1rem'
                    }
                  }}
                >
                  Total Orders
                </Typography>
                <Typography
                  variant={isMobile ? "h5" : "h4"}
                  sx={{
                    fontSize: {
                      xs: '1.5rem',
                      sm: '1.75rem',
                      md: '2rem'
                    },
                    fontWeight: 'bold',
                    color: 'primary.main'
                  }}
                >
                  {orders.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={6} sm={6} md={3}>
            <Card
              sx={{
                height: '100%',
                transition: 'transform 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 2
                }
              }}
            >
              <CardContent
                sx={{
                  p: {
                    xs: 2,
                    sm: 2,
                    md: 3
                  },
                  textAlign: 'center'
                }}
              >
                <Typography
                  color="textSecondary"
                  gutterBottom
                  variant={isMobile ? "body2" : "body1"}
                  sx={{
                    fontSize: {
                      xs: '0.75rem',
                      sm: '0.875rem',
                      md: '1rem'
                    }
                  }}
                >
                  Pending Orders
                </Typography>
                <Typography
                  variant={isMobile ? "h5" : "h4"}
                  sx={{
                    fontSize: {
                      xs: '1.5rem',
                      sm: '1.75rem',
                      md: '2rem'
                    },
                    fontWeight: 'bold',
                    color: 'warning.main'
                  }}
                >
                  {orders.filter(o => o.orderStatus === 'pending').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={6} sm={6} md={3}>
            <Card
              sx={{
                height: '100%',
                transition: 'transform 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 2
                }
              }}
            >
              <CardContent
                sx={{
                  p: {
                    xs: 2,
                    sm: 2,
                    md: 3
                  },
                  textAlign: 'center'
                }}
              >
                <Typography
                  color="textSecondary"
                  gutterBottom
                  variant={isMobile ? "body2" : "body1"}
                  sx={{
                    fontSize: {
                      xs: '0.75rem',
                      sm: '0.875rem',
                      md: '1rem'
                    }
                  }}
                >
                  Processing Orders
                </Typography>
                <Typography
                  variant={isMobile ? "h5" : "h4"}
                  sx={{
                    fontSize: {
                      xs: '1.5rem',
                      sm: '1.75rem',
                      md: '2rem'
                    },
                    fontWeight: 'bold',
                    color: 'info.main'
                  }}
                >
                  {orders.filter(o => o.orderStatus === 'processing').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={6} sm={6} md={3}>
            <Card
              sx={{
                height: '100%',
                transition: 'transform 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 2
                }
              }}
            >
              <CardContent
                sx={{
                  p: {
                    xs: 2,
                    sm: 2,
                    md: 3
                  },
                  textAlign: 'center'
                }}
              >
                <Typography
                  color="textSecondary"
                  gutterBottom
                  variant={isMobile ? "body2" : "body1"}
                  sx={{
                    fontSize: {
                      xs: '0.75rem',
                      sm: '0.875rem',
                      md: '1rem'
                    }
                  }}
                >
                  Delivered Orders
                </Typography>
                <Typography
                  variant={isMobile ? "h5" : "h4"}
                  sx={{
                    fontSize: {
                      xs: '1.5rem',
                      sm: '1.75rem',
                      md: '2rem'
                    },
                    fontWeight: 'bold',
                    color: 'success.main'
                  }}
                >
                  {orders.filter(o => o.orderStatus === 'delivered').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Divider sx={{ mb: { xs: 2, sm: 3 } }} />

        {/* Responsive Orders Display */}
        {shouldUseCards ? (
          // Mobile: Card Layout
          <Stack spacing={2}>
            {filteredOrders.map((order) => (
              <Card
                key={order._id}
                sx={{
                  border: 1,
                  borderColor: 'divider',
                  '&:hover': {
                    boxShadow: 2
                  }
                }}
              >
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.75rem' }}>
                        Order ID
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: 'monospace',
                          fontSize: '0.8rem',
                          wordBreak: 'break-all'
                        }}
                      >
                        {order._id}
                      </Typography>
                    </Box>
                    <Chip
                      label={order.orderStatus || 'pending'}
                      color={getStatusColor(order.orderStatus || 'pending')}
                      size="small"
                      sx={{ fontSize: '0.75rem' }}
                    />
                  </Box>

                  <Grid container spacing={1} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.75rem' }}>
                        Customer
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                        {order.userId?.fullName || 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.75rem' }}>
                        Amount
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: '0.875rem', fontWeight: 'bold' }}>
                        ₹{order.totalAmount}
                      </Typography>
                    </Grid>
                  </Grid>

                  <Grid container spacing={1} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.75rem' }}>
                        Email
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: '0.875rem',
                          wordBreak: 'break-word'
                        }}
                      >
                        {order.userId?.email || 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.75rem' }}>
                        Date
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </Typography>
                    </Grid>
                  </Grid>

                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<ViewIcon />}
                      onClick={() => navigate(`/admin/orders/${order._id}`)}
                      sx={{ fontSize: '0.75rem' }}
                    >
                      View
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<EditIcon />}
                      onClick={() => openStatusDialog(order)}
                      sx={{ fontSize: '0.75rem' }}
                    >
                      Edit
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Stack>
        ) : shouldUseHorizontalScroll ? (
          // Tablet: Horizontal Scroll Table
          <Box sx={{ overflowX: 'auto', pb: 1 }}>
            <Table sx={{ minWidth: 800 }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontSize: '0.875rem', fontWeight: 'bold' }}>Order ID</TableCell>
                  <TableCell sx={{ fontSize: '0.875rem', fontWeight: 'bold' }}>Customer</TableCell>
                  <TableCell sx={{ fontSize: '0.875rem', fontWeight: 'bold' }}>Email</TableCell>
                  <TableCell sx={{ fontSize: '0.875rem', fontWeight: 'bold' }}>Amount</TableCell>
                  <TableCell sx={{ fontSize: '0.875rem', fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ fontSize: '0.875rem', fontWeight: 'bold' }}>Date</TableCell>
                  <TableCell sx={{ fontSize: '0.875rem', fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order._id}>
                    <TableCell sx={{ p: 1 }}>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                        {order._id.substring(0, 8)}...
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ p: 1, fontSize: '0.875rem' }}>
                      {order.userId?.fullName || 'N/A'}
                    </TableCell>
                    <TableCell sx={{ p: 1, fontSize: '0.875rem' }}>
                      {order.userId?.email || 'N/A'}
                    </TableCell>
                    <TableCell sx={{ p: 1, fontSize: '0.875rem', fontWeight: 'bold' }}>
                      ₹{order.totalAmount}
                    </TableCell>
                    <TableCell sx={{ p: 1 }}>
                      <Chip
                        label={order.orderStatus || 'pending'}
                        color={getStatusColor(order.orderStatus || 'pending')}
                        size="small"
                        sx={{ fontSize: '0.75rem' }}
                      />
                    </TableCell>
                    <TableCell sx={{ p: 1, fontSize: '0.875rem' }}>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell sx={{ p: 1 }}>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/admin/orders/${order._id}`)}
                          title="View order details"
                        >
                          <ViewIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => openStatusDialog(order)}
                          title="Update order status"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        ) : (
          // Desktop: Full Table
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Order ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Customer</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Amount</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order._id} sx={{ '&:hover': { backgroundColor: 'action.hover' } }}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {order._id}
                      </Typography>
                    </TableCell>
                    <TableCell>{order.userId?.fullName || 'N/A'}</TableCell>
                    <TableCell>{order.userId?.email || 'N/A'}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>₹{order.totalAmount}</TableCell>
                    <TableCell>
                      <Chip
                        label={order.orderStatus || 'pending'}
                        color={getStatusColor(order.orderStatus || 'pending')}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/admin/orders/${order._id}`)}
                          title="View order details"
                        >
                          <ViewIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => openStatusDialog(order)}
                          title="Update order status"
                        >
                          <EditIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {filteredOrders.length === 0 && (
          <Box
            sx={{
              textAlign: 'center',
              py: {
                xs: 6,
                sm: 8
              },
              px: 2
            }}
          >
            <Typography
              variant={isMobile ? "h6" : "h5"}
              color="textSecondary"
              sx={{
                fontSize: {
                  xs: '1.1rem',
                  sm: '1.25rem',
                  md: '1.5rem'
                }
              }}
            >
              No orders found
            </Typography>
            <Typography
              variant="body2"
              color="textSecondary"
              sx={{
                mt: 1,
                fontSize: {
                  xs: '0.875rem',
                  sm: '1rem'
                }
              }}
            >
              Try adjusting your search or filter criteria
            </Typography>
          </Box>
        )}

        {/* Responsive Status Update Dialog */}
        <Dialog
          open={statusDialog}
          onClose={() => setStatusDialog(false)}
          maxWidth="sm"
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
                borderRadius: 2
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
              }
            }}
          >
            Update Order Status
            {isMobile && (
              <IconButton
                aria-label="close"
                onClick={() => setStatusDialog(false)}
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: 8,
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
                Order ID: {selectedOrder?._id}
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
            >
              Cancel
            </Button>
            <Button
              onClick={handleStatusUpdate}
              variant="contained"
              fullWidth={isMobile}
              size={isMobile ? "large" : "medium"}
            >
              Update Status
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
  );
};

export default React.memo(ManageOrders);
