import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Chip,
  Stack,
  LinearProgress,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Add as AddIcon,
  ShoppingBag as OrderIcon,
  Inventory as ProductIcon,
  People as UsersIcon,
  Star as StarIcon,
  MonetizationOn as MoneyIcon,
  Person as PersonIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  Refresh as RefreshIcon,
  LocalOffer as CouponIcon,
} from '@mui/icons-material';
import axios from '../../utils/axios';
import eventBus, { EVENTS } from '../../utils/eventBus';
import { useResponsive, useResponsiveTable } from '../../hooks/useResponsive';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { user, loading: authLoading } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Use responsive hooks for consistent breakpoint handling
  const {
    isMobile,
    isTablet,
    isSmallDesktop,
    isLargeDesktop,
    isDesktop,
    getContainerPadding,
    getResponsiveSpacing,
    getButtonSize
  } = useResponsive();

  const { shouldUseCards, getTableCellPadding } = useResponsiveTable();
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSales: 0,
    totalProducts: 0,
    totalUsers: 0,
    recentOrders: [],
    lowStockProducts: [],
    salesTrend: [],
    newUsers: 0,
    activeUsers: 0,
  });

  const fetchDashboardStats = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) {
        setRefreshing(true);
      }
      const response = await axios.get('/admin/dashboard');
      setStats(response.data.data);
    } catch (error) {
      // Handle error silently
    } finally {
      setLoading(false);
      if (isManualRefresh) {
        setRefreshing(false);
      }
    }
  };

  const handleManualRefresh = () => {
    fetchDashboardStats(true);
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchDashboardStats();

      // Set up auto-refresh every 30 seconds for real-time data
      const interval = setInterval(() => fetchDashboardStats(false), 30000);

      // Cleanup interval on component unmount
      return () => clearInterval(interval);
    }
  }, [user]);

  // Listen for focus events to refresh data when user returns to tab
  useEffect(() => {
    const handleFocus = () => {
      if (user && user.role === 'admin') {
        fetchDashboardStats(false);
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user]);

  // Listen for order status updates to refresh dashboard immediately
  useEffect(() => {
    const handleOrderStatusUpdate = (data) => {
      // Refresh dashboard stats to get updated recent orders
      fetchDashboardStats(false);
    };

    // Subscribe to order status update events
    const unsubscribe = eventBus.on(EVENTS.ORDER_STATUS_UPDATED, handleOrderStatusUpdate);

    // Cleanup subscription on component unmount
    return unsubscribe;
  }, []);

  const statsCards = [
    {
      title: 'Total Sales',
      value: `₹${stats.totalSales?.toLocaleString() || 0}`,
      icon: <MoneyIcon sx={{ fontSize: 40, color: '#2e7d32' }} />,
      color: '#2e7d32'
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders || 0,
      icon: <OrderIcon sx={{ fontSize: 40, color: '#1976d2' }} />,
      color: '#1976d2'
    },
    {
      title: 'Total Products',
      value: stats.totalProducts || 0,
      icon: <ProductIcon sx={{ fontSize: 40, color: '#9c27b0' }} />,
      color: '#9c27b0'
    },
    {
      title: 'Total Users',
      value: stats.totalUsers || 0,
      icon: <PersonIcon sx={{ fontSize: 40, color: '#ed6c02' }} />,
      color: '#ed6c02'
    }
  ];

  const dashboardItems = [
    {
      title: 'Add Product',
      icon: <AddIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      description: 'Add new products to your store',
      link: '/admin/products/add'
    },
    {
      title: 'Manage Products',
      icon: <ProductIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      description: 'Edit or remove existing products',
      link: '/admin/products'
    },
    {
      title: 'Featured Products',
      icon: <StarIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      description: 'Manage featured products for each category on the home page',
      link: '/admin/featured'
    },
    {
      title: 'Manage Orders',
      icon: <OrderIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      description: 'View and manage customer orders',
      link: '/admin/orders'
    },
    {
      title: 'Manage Coupons',
      icon: <CouponIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      description: 'Create and manage discount coupons',
      link: '/admin/coupons'
    },
    {
      title: 'Manage Users',
      icon: <UsersIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      description: 'View and manage user accounts',
      link: '/admin/users'
    }
  ];

  if (authLoading || loading) {
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        px: { xs: 2, sm: 3 }
      }}>
        <CircularProgress size={isMobile ? 40 : 50} />
      </Box>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <Container
        maxWidth="lg"
        sx={{
          mt: { xs: 2, sm: 4 },
          px: { xs: 2, sm: 3 }
        }}
      >
        <Alert
          severity="error"
          sx={{
            fontSize: { xs: '0.875rem', sm: '1rem' },
            '& .MuiAlert-message': {
              padding: { xs: '6px 0', sm: '8px 0' }
            }
          }}
        >
          You don't have permission to access this page.
        </Alert>
      </Container>
    );
  }

  const getOrderStatusColor = (status) => {
    if (!status) return 'default';
    
    switch (status.toLowerCase()) {
      case 'processing':
        return 'info';
      case 'shipped':
        return 'primary';
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Container
      maxWidth={false}
      sx={{
        py: getResponsiveSpacing(),
        px: getContainerPadding(),
        maxWidth: { xs: '100%', sm: '100%', md: '1200px', lg: '1400px', xl: '1600px' },
        mx: 'auto',
        minHeight: '100vh',
        width: '100%',
        overflow: 'hidden' // Prevent horizontal scroll
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: getContainerPadding(),
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: { xs: 1, sm: 1.5, md: 2 },
          width: '100%',
          overflow: 'hidden' // Prevent content overflow
        }}
      >
        {/* Responsive Header Section */}
        <Box sx={{
          mb: { xs: 2, sm: 3, md: 4 },
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          gap: { xs: 1, sm: 2 }
        }}>
          <Typography
            variant={isMobile ? "h5" : isTablet ? "h4" : "h3"}
            component="h1"
            sx={{
              fontWeight: 600,
              fontSize: {
                xs: '1.375rem',
                sm: '1.75rem',
                md: '2rem',
                lg: '2.25rem',
                xl: '2.5rem'
              },
              lineHeight: 1.2,
              color: 'text.primary',
              flexGrow: 1
            }}
          >
            Admin Dashboard
          </Typography>

          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: { xs: 1, sm: 1.5, md: 2 },
            flexShrink: 0
          }}>
            {!isMobile && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  fontSize: { sm: '0.8rem', md: '0.875rem' },
                  whiteSpace: 'nowrap',
                  display: { xs: 'none', sm: 'block' }
                }}
              >
                Auto-refreshes every 30s
              </Typography>
            )}
            <IconButton
              onClick={handleManualRefresh}
              disabled={refreshing}
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': { bgcolor: 'primary.dark' },
                '&:disabled': { bgcolor: 'grey.300' },
                width: { xs: 40, sm: 42, md: 44 },
                height: { xs: 40, sm: 42, md: 44 },
                flexShrink: 0
              }}
            >
              <RefreshIcon sx={{
                animation: refreshing ? 'spin 1s linear infinite' : 'none',
                '@keyframes spin': {
                  '0%': { transform: 'rotate(0deg)' },
                  '100%': { transform: 'rotate(360deg)' }
                },
                fontSize: { xs: '1.1rem', sm: '1.2rem', md: '1.25rem' }
              }} />
            </IconButton>
          </Box>
        </Box>

        {/* Responsive Stats Cards */}
        <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }} sx={{ mb: { xs: 2.5, sm: 3, md: 4 } }}>
          {statsCards.map((stat, index) => (
            <Grid item xs={12} sm={6} md={6} lg={3} xl={3} key={index}>
              <Card sx={{
                height: '100%',
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 3
                },
                borderRadius: { xs: 1, sm: 1.5, md: 2 },
                overflow: 'hidden'
              }}>
                <CardContent sx={{
                  p: { xs: 1.5, sm: 2, md: 2.5, lg: 3 },
                  '&:last-child': { pb: { xs: 1.5, sm: 2, md: 2.5, lg: 3 } }
                }}>
                  <Box sx={{
                    display: 'flex',
                    flexDirection: { xs: 'row', sm: 'row' },
                    alignItems: 'center',
                    mb: { xs: 1, sm: 1.5, md: 2 },
                    gap: { xs: 1, sm: 1.5, md: 2 }
                  }}>
                    {React.cloneElement(stat.icon, {
                      sx: {
                        fontSize: {
                          xs: 28,
                          sm: 32,
                          md: 36,
                          lg: 40,
                          xl: 44
                        },
                        color: stat.color,
                        flexShrink: 0
                      }
                    })}
                    <Typography
                      variant="h6"
                      sx={{
                        fontSize: {
                          xs: '0.9rem',
                          sm: '1rem',
                          md: '1.1rem',
                          lg: '1.2rem',
                          xl: '1.25rem'
                        },
                        fontWeight: 500,
                        lineHeight: 1.2,
                        color: 'text.primary'
                      }}
                    >
                      {stat.title}
                    </Typography>
                  </Box>
                  <Typography
                    variant="h4"
                    sx={{
                      color: stat.color,
                      fontSize: {
                        xs: '1.5rem',
                        sm: '1.75rem',
                        md: '2rem',
                        lg: '2.25rem',
                        xl: '2.5rem'
                      },
                      fontWeight: 700,
                      lineHeight: 1.1,
                      textAlign: 'left',
                      wordBreak: 'break-word'
                    }}
                  >
                    {stat.value}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Sales Chart */}
        <Card sx={{
          mb: { xs: 2.5, sm: 3, md: 4 },
          borderRadius: { xs: 1, sm: 1.5, md: 2 },
          overflow: 'hidden'
        }}>
          <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 2.5, lg: 3 } }}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                fontSize: {
                  xs: '1rem',
                  sm: '1.125rem',
                  md: '1.2rem',
                  lg: '1.25rem'
                },
                fontWeight: 600,
                color: 'text.primary',
                mb: { xs: 1.5, sm: 2 }
              }}
            >
              Sales Trend
            </Typography>
            <Box sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'flex-start', sm: 'center' },
              gap: { xs: 1, sm: 1.5, md: 2 },
              p: { xs: 1, sm: 1.5, md: 2 },
              bgcolor: 'rgba(0, 0, 0, 0.02)',
              borderRadius: { xs: 1, sm: 1.5 }
            }}>
              <TrendingUpIcon
                color="primary"
                sx={{
                  fontSize: { xs: 20, sm: 22, md: 24, lg: 26 },
                  flexShrink: 0
                }}
              />
              <Typography
                variant="body1"
                sx={{
                  fontSize: {
                    xs: '0.8rem',
                    sm: '0.875rem',
                    md: '0.9rem',
                    lg: '1rem'
                  },
                  lineHeight: 1.5,
                  color: 'text.secondary'
                }}
              >
                {stats.salesTrend?.length > 0
                  ? `Last 7 days sales trend shows ${stats.salesTrend[stats.salesTrend.length - 1].amount > stats.salesTrend[0].amount ? 'an increase' : 'a decrease'} in sales`
                  : 'No sales data available for the last 7 days'}
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Recent Orders - Mobile Responsive Table */}
        <Card sx={{
          mb: { xs: 2.5, sm: 3, md: 4 },
          borderRadius: { xs: 1, sm: 1.5, md: 2 },
          overflow: 'hidden'
        }}>
          <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 2.5, lg: 3 } }}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                fontSize: {
                  xs: '1rem',
                  sm: '1.125rem',
                  md: '1.2rem',
                  lg: '1.25rem'
                },
                fontWeight: 600,
                color: 'text.primary',
                mb: { xs: 1.5, sm: 2, md: 2.5 }
              }}
            >
              Recent Orders
            </Typography>
            <TableContainer
              sx={{
                overflowX: 'auto',
                borderRadius: { xs: 1, sm: 1.5 },
                border: '1px solid',
                borderColor: 'divider',
                '&::-webkit-scrollbar': {
                  height: { xs: 6, sm: 8 },
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: '#f5f5f5',
                  borderRadius: 4,
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: '#c1c1c1',
                  borderRadius: 4,
                  '&:hover': {
                    backgroundColor: '#a8a8a8',
                  },
                },
                // Ensure table doesn't break layout on small screens
                maxWidth: '100%',
                width: '100%'
              }}
            >
              <Table sx={{
                minWidth: { xs: 650, sm: 700, md: 'auto' },
                '& .MuiTableCell-root': {
                  borderBottom: '1px solid',
                  borderColor: 'divider'
                }
              }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'rgba(0, 0, 0, 0.02)' }}>
                    <TableCell sx={{
                      fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem', lg: '0.875rem' },
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      color: 'text.primary',
                      py: { xs: 1, sm: 1.5 },
                      px: { xs: 1, sm: 1.5, md: 2 }
                    }}>
                      Order ID
                    </TableCell>
                    <TableCell sx={{
                      fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem', lg: '0.875rem' },
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      color: 'text.primary',
                      py: { xs: 1, sm: 1.5 },
                      px: { xs: 1, sm: 1.5, md: 2 }
                    }}>
                      Customer
                    </TableCell>
                    <TableCell sx={{
                      fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem', lg: '0.875rem' },
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      color: 'text.primary',
                      py: { xs: 1, sm: 1.5 },
                      px: { xs: 1, sm: 1.5, md: 2 }
                    }}>
                      Amount
                    </TableCell>
                    <TableCell sx={{
                      fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem', lg: '0.875rem' },
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      color: 'text.primary',
                      py: { xs: 1, sm: 1.5 },
                      px: { xs: 1, sm: 1.5, md: 2 }
                    }}>
                      Status
                    </TableCell>
                    <TableCell sx={{
                      fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem', lg: '0.875rem' },
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      color: 'text.primary',
                      py: { xs: 1, sm: 1.5 },
                      px: { xs: 1, sm: 1.5, md: 2 }
                    }}>
                      Date
                    </TableCell>
                    <TableCell sx={{
                      fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem', lg: '0.875rem' },
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      color: 'text.primary',
                      py: { xs: 1, sm: 1.5 },
                      px: { xs: 1, sm: 1.5, md: 2 }
                    }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stats.recentOrders?.length > 0 ? stats.recentOrders.map((order) => (
                    <TableRow
                      key={order._id}
                      sx={{
                        '&:hover': {
                          bgcolor: 'rgba(0, 0, 0, 0.02)'
                        }
                      }}
                    >
                      <TableCell sx={{
                        fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem', lg: '0.875rem' },
                        whiteSpace: 'nowrap',
                        maxWidth: { xs: 100, sm: 120, md: 'none' },
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        py: { xs: 1, sm: 1.5 },
                        px: { xs: 1, sm: 1.5, md: 2 }
                      }}>
                        {isMobile ? `...${order._id.slice(-6)}` : isTablet ? `...${order._id.slice(-8)}` : order._id}
                      </TableCell>
                      <TableCell sx={{
                        fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem', lg: '0.875rem' },
                        whiteSpace: 'nowrap',
                        maxWidth: { xs: 80, sm: 100, md: 150 },
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        py: { xs: 1, sm: 1.5 },
                        px: { xs: 1, sm: 1.5, md: 2 }
                      }}>
                        {order.userId?.fullName || 'N/A'}
                      </TableCell>
                      <TableCell sx={{
                        fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem', lg: '0.875rem' },
                        whiteSpace: 'nowrap',
                        fontWeight: 500,
                        color: 'text.primary',
                        py: { xs: 1, sm: 1.5 },
                        px: { xs: 1, sm: 1.5, md: 2 }
                      }}>
                        ₹{order.totalAmount?.toLocaleString() || 0}
                      </TableCell>
                      <TableCell sx={{
                        py: { xs: 1, sm: 1.5 },
                        px: { xs: 1, sm: 1.5, md: 2 }
                      }}>
                        <Chip
                          label={order.orderStatus || 'pending'}
                          color={getOrderStatusColor(order.orderStatus || 'pending')}
                          size="small"
                          sx={{
                            fontSize: { xs: '0.6rem', sm: '0.65rem', md: '0.7rem', lg: '0.75rem' },
                            height: { xs: 18, sm: 20, md: 22, lg: 24 },
                            '& .MuiChip-label': {
                              px: { xs: 0.5, sm: 1 }
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{
                        fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem', lg: '0.875rem' },
                        whiteSpace: 'nowrap',
                        py: { xs: 1, sm: 1.5 },
                        px: { xs: 1, sm: 1.5, md: 2 }
                      }}>
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: isMobile ? '2-digit' : 'numeric'
                        })}
                      </TableCell>
                      <TableCell sx={{
                        py: { xs: 1, sm: 1.5 },
                        px: { xs: 1, sm: 1.5, md: 2 }
                      }}>
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/admin/orders/${order._id}`)}
                          sx={{
                            width: { xs: 28, sm: 32, md: 36, lg: 40 },
                            height: { xs: 28, sm: 32, md: 36, lg: 40 },
                            bgcolor: 'rgba(0, 0, 0, 0.04)',
                            '&:hover': {
                              bgcolor: 'rgba(0, 0, 0, 0.08)'
                            }
                          }}
                        >
                          <ViewIcon sx={{
                            fontSize: { xs: 14, sm: 16, md: 18, lg: 20 }
                          }} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        sx={{
                          textAlign: 'center',
                          py: { xs: 2, sm: 2.5, md: 3 },
                          fontSize: { xs: '0.8rem', sm: '0.875rem', md: '0.9rem', lg: '1rem' },
                          color: 'text.secondary'
                        }}
                      >
                        No recent orders found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Low Stock Products - Mobile Responsive Table */}
        <Card sx={{
          mb: { xs: 2.5, sm: 3, md: 4 },
          borderRadius: { xs: 1, sm: 1.5, md: 2 },
          overflow: 'hidden'
        }}>
          <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 2.5, lg: 3 } }}>
            <Box sx={{
              display: 'flex',
              flexDirection: { xs: 'row', sm: 'row' },
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: { xs: 1.5, sm: 2, md: 2.5 },
              gap: { xs: 1, sm: 1.5 }
            }}>
              <Typography
                variant="h6"
                sx={{
                  fontSize: {
                    xs: '1rem',
                    sm: '1.125rem',
                    md: '1.2rem',
                    lg: '1.25rem'
                  },
                  fontWeight: 600,
                  color: 'text.primary'
                }}
              >
                Low Stock Products
              </Typography>
              <WarningIcon
                color="warning"
                sx={{
                  fontSize: { xs: 20, sm: 22, md: 24, lg: 26 },
                  flexShrink: 0
                }}
              />
            </Box>
            <TableContainer
              sx={{
                overflowX: 'auto',
                borderRadius: { xs: 1, sm: 1.5 },
                border: '1px solid',
                borderColor: 'divider',
                '&::-webkit-scrollbar': {
                  height: { xs: 6, sm: 8 },
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: '#f5f5f5',
                  borderRadius: 4,
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: '#c1c1c1',
                  borderRadius: 4,
                  '&:hover': {
                    backgroundColor: '#a8a8a8',
                  },
                },
                maxWidth: '100%',
                width: '100%'
              }}
            >
              <Table sx={{
                minWidth: { xs: 550, sm: 600, md: 'auto' },
                '& .MuiTableCell-root': {
                  borderBottom: '1px solid',
                  borderColor: 'divider'
                }
              }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'rgba(255, 152, 0, 0.05)' }}>
                    <TableCell sx={{
                      fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem', lg: '0.875rem' },
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      color: 'text.primary',
                      py: { xs: 1, sm: 1.5 },
                      px: { xs: 1, sm: 1.5, md: 2 }
                    }}>
                      Product
                    </TableCell>
                    <TableCell sx={{
                      fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem', lg: '0.875rem' },
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      color: 'text.primary',
                      py: { xs: 1, sm: 1.5 },
                      px: { xs: 1, sm: 1.5, md: 2 }
                    }}>
                      Current Stock
                    </TableCell>
                    <TableCell sx={{
                      fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem', lg: '0.875rem' },
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      color: 'text.primary',
                      py: { xs: 1, sm: 1.5 },
                      px: { xs: 1, sm: 1.5, md: 2 }
                    }}>
                      Price
                    </TableCell>
                    <TableCell sx={{
                      fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem', lg: '0.875rem' },
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      color: 'text.primary',
                      py: { xs: 1, sm: 1.5 },
                      px: { xs: 1, sm: 1.5, md: 2 }
                    }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stats.lowStockProducts?.length > 0 ? stats.lowStockProducts.map((product) => (
                    <TableRow
                      key={product._id}
                      sx={{
                        '&:hover': {
                          bgcolor: 'rgba(255, 152, 0, 0.02)'
                        }
                      }}
                    >
                      <TableCell sx={{
                        fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem', lg: '0.875rem' },
                        maxWidth: { xs: 100, sm: 120, md: 180, lg: 200 },
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        py: { xs: 1, sm: 1.5 },
                        px: { xs: 1, sm: 1.5, md: 2 }
                      }}>
                        {product.name}
                      </TableCell>
                      <TableCell sx={{
                        py: { xs: 1, sm: 1.5 },
                        px: { xs: 1, sm: 1.5, md: 2 }
                      }}>
                        <Box sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: { xs: 0.5, sm: 1, md: 1.5 },
                          minWidth: { xs: 70, sm: 90, md: 120 }
                        }}>
                          <Typography sx={{
                            fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem', lg: '0.875rem' },
                            minWidth: { xs: 14, sm: 16, md: 18, lg: 20 },
                            fontWeight: 500,
                            color: product.stock < 5 ? 'error.main' : 'warning.main'
                          }}>
                            {product.stock}
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={(product.stock / 10) * 100}
                            sx={{
                              width: { xs: 50, sm: 70, md: 90, lg: 100 },
                              height: { xs: 4, sm: 5, md: 6 },
                              borderRadius: 2
                            }}
                            color={product.stock < 5 ? "error" : "warning"}
                          />
                        </Box>
                      </TableCell>
                      <TableCell sx={{
                        fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem', lg: '0.875rem' },
                        whiteSpace: 'nowrap',
                        fontWeight: 500,
                        color: 'text.primary',
                        py: { xs: 1, sm: 1.5 },
                        px: { xs: 1, sm: 1.5, md: 2 }
                      }}>
                        ₹{product.price?.toLocaleString() || 0}
                      </TableCell>
                      <TableCell sx={{
                        py: { xs: 1, sm: 1.5 },
                        px: { xs: 1, sm: 1.5, md: 2 }
                      }}>
                        <IconButton
                          size="small"
                          onClick={() => navigate('/admin/products', {
                            state: { editProduct: product }
                          })}
                          sx={{
                            width: { xs: 28, sm: 32, md: 36, lg: 40 },
                            height: { xs: 28, sm: 32, md: 36, lg: 40 },
                            bgcolor: 'rgba(0, 0, 0, 0.04)',
                            '&:hover': {
                              bgcolor: 'rgba(0, 0, 0, 0.08)'
                            }
                          }}
                        >
                          <EditIcon sx={{
                            fontSize: { xs: 14, sm: 16, md: 18, lg: 20 }
                          }} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        sx={{
                          textAlign: 'center',
                          py: { xs: 2, sm: 2.5, md: 3 },
                          fontSize: { xs: '0.8rem', sm: '0.875rem', md: '0.9rem', lg: '1rem' },
                          color: 'text.secondary'
                        }}
                      >
                        No low stock products found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* User Activity - Responsive */}
        <Card sx={{
          mb: { xs: 2.5, sm: 3, md: 4 },
          borderRadius: { xs: 1, sm: 1.5, md: 2 },
          overflow: 'hidden'
        }}>
          <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 2.5, lg: 3 } }}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                color: 'text.primary',
                fontSize: {
                  xs: '1rem',
                  sm: '1.125rem',
                  md: '1.2rem',
                  lg: '1.25rem'
                },
                fontWeight: 600,
                mb: { xs: 1.5, sm: 2, md: 2.5 }
              }}
            >
              User Activity
            </Typography>
            <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
              <Grid item xs={12} sm={6}>
                <Box sx={{
                  textAlign: 'center',
                  p: { xs: 1.5, sm: 2, md: 2.5, lg: 3 },
                  bgcolor: 'rgba(25, 118, 210, 0.05)',
                  borderRadius: { xs: 1, sm: 1.5, md: 2 },
                  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                  border: '1px solid rgba(25, 118, 210, 0.1)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 2,
                    bgcolor: 'rgba(25, 118, 210, 0.08)'
                  }
                }}>
                  <Typography
                    variant="h4"
                    sx={{
                      color: '#1976d2',
                      fontWeight: 700,
                      fontSize: {
                        xs: '1.5rem',
                        sm: '1.75rem',
                        md: '2rem',
                        lg: '2.25rem',
                        xl: '2.5rem'
                      },
                      lineHeight: 1.1
                    }}
                  >
                    {stats.newUsers || 0}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: 'text.primary',
                      mt: { xs: 0.5, sm: 1 },
                      fontSize: {
                        xs: '0.8rem',
                        sm: '0.875rem',
                        md: '0.9rem',
                        lg: '1rem'
                      },
                      fontWeight: 500
                    }}
                  >
                    New Users (Last 30 Days)
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{
                  textAlign: 'center',
                  p: { xs: 1.5, sm: 2, md: 2.5, lg: 3 },
                  bgcolor: 'rgba(156, 39, 176, 0.05)',
                  borderRadius: { xs: 1, sm: 1.5, md: 2 },
                  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                  border: '1px solid rgba(156, 39, 176, 0.1)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 2,
                    bgcolor: 'rgba(156, 39, 176, 0.08)'
                  }
                }}>
                  <Typography
                    variant="h4"
                    sx={{
                      color: '#9c27b0',
                      fontWeight: 700,
                      fontSize: {
                        xs: '1.5rem',
                        sm: '1.75rem',
                        md: '2rem',
                        lg: '2.25rem',
                        xl: '2.5rem'
                      },
                      lineHeight: 1.1
                    }}
                  >
                    {stats.activeUsers || 0}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: 'text.primary',
                      mt: { xs: 0.5, sm: 1 },
                      fontSize: {
                        xs: '0.8rem',
                        sm: '0.875rem',
                        md: '0.9rem',
                        lg: '1rem'
                      },
                      fontWeight: 500
                    }}
                  >
                    Active Users
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Divider sx={{
          my: { xs: 2.5, sm: 3, md: 4 },
          borderColor: 'divider'
        }} />

        {/* Responsive Management Cards */}
        <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
          {dashboardItems.map((item, index) => (
            <Grid item xs={12} sm={6} md={4} lg={4} xl={3} key={index}>
              <Card
                onClick={() => navigate(item.link)}
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: { xs: 1, sm: 1.5, md: 2 },
                  border: '1px solid',
                  borderColor: 'divider',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                    borderColor: 'primary.main'
                  },
                  '&:active': {
                    transform: 'translateY(-2px)',
                  },
                  // Better touch targets for mobile
                  minHeight: { xs: 110, sm: 130, md: 140, lg: 150 },
                  overflow: 'hidden'
                }}
              >
                <CardContent sx={{
                  flexGrow: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  p: { xs: 1.5, sm: 2, md: 2.5, lg: 3 },
                  '&:last-child': { pb: { xs: 1.5, sm: 2, md: 2.5, lg: 3 } }
                }}>
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mb: { xs: 1, sm: 1.5, md: 2 },
                    gap: { xs: 1, sm: 1.5, md: 2 }
                  }}>
                    {React.cloneElement(item.icon, {
                      sx: {
                        fontSize: {
                          xs: 28,
                          sm: 32,
                          md: 36,
                          lg: 40,
                          xl: 44
                        },
                        color: 'primary.main',
                        flexShrink: 0
                      }
                    })}
                    <Typography
                      variant="h6"
                      sx={{
                        fontSize: {
                          xs: '0.9rem',
                          sm: '1rem',
                          md: '1.1rem',
                          lg: '1.2rem',
                          xl: '1.25rem'
                        },
                        fontWeight: 600,
                        lineHeight: 1.2,
                        color: 'text.primary'
                      }}
                    >
                      {item.title}
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      flexGrow: 1,
                      fontSize: {
                        xs: '0.75rem',
                        sm: '0.8rem',
                        md: '0.825rem',
                        lg: '0.875rem'
                      },
                      lineHeight: 1.4,
                      display: '-webkit-box',
                      WebkitLineClamp: { xs: 2, sm: 3 },
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {item.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Container>
  );
};

export default AdminDashboard; 