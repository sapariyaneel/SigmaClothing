import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Grid,
  Alert,
  Pagination,
  InputAdornment,
  Tooltip,
  CircularProgress,
  Snackbar,
  Stack,
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  LocalOffer as CouponIcon,
  Visibility as ViewIcon,
  ToggleOff as ToggleOffIcon,
  ToggleOn as ToggleOnIcon
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import axios from '../../utils/axios';
import { useResponsive, useResponsiveTable, useResponsiveForm } from '../../hooks/useResponsive';

const ManageCoupons = () => {
  const { user } = useSelector((state) => state.auth);

  // Responsive hooks
  const {
    isMobile,
    isTablet,
    isDesktop,
    getContainerPadding,
    getResponsiveSpacing,
    getButtonSize,
    getDialogMaxWidth
  } = useResponsive();
  const { shouldUseCards, shouldUseHorizontalScroll, getTableCellPadding } = useResponsiveTable();
  const { getFormSpacing, getFieldSize, getGridSpacing } = useResponsiveForm();

  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('create'); // 'create', 'edit', 'view'
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    minimumOrderAmount: '',
    maximumDiscountAmount: '',
    usageLimit: '',
    userUsageLimit: 1,
    validFrom: '',
    validUntil: '',
    isActive: true,
    applicableCategories: []
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const [toggleLoading, setToggleLoading] = useState(null); // Track which coupon is being toggled
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const categories = ['men', 'women', 'accessories'];

  useEffect(() => {
    fetchCoupons();
  }, [page, searchTerm, statusFilter]);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        _t: Date.now().toString() // Cache busting parameter
      });

      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const response = await axios.get(`/coupons?${params}`);
      setCoupons(response.data.data.coupons);
      setTotalPages(response.data.data.pagination.totalPages);
    } catch (error) {
      console.error('Error fetching coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (mode, coupon = null) => {
    setDialogMode(mode);
    setSelectedCoupon(coupon);
    
    if (mode === 'create') {
      setFormData({
        code: '',
        description: '',
        discountType: 'percentage',
        discountValue: '',
        minimumOrderAmount: '',
        maximumDiscountAmount: '',
        usageLimit: '',
        userUsageLimit: 1,
        validFrom: new Date().toISOString().split('T')[0],
        validUntil: '',
        isActive: true,
        applicableCategories: []
      });
    } else if (coupon) {
      setFormData({
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue.toString(),
        minimumOrderAmount: coupon.minimumOrderAmount?.toString() || '',
        maximumDiscountAmount: coupon.maximumDiscountAmount?.toString() || '',
        usageLimit: coupon.usageLimit?.toString() || '',
        userUsageLimit: coupon.userUsageLimit,
        validFrom: new Date(coupon.validFrom).toISOString().split('T')[0],
        validUntil: new Date(coupon.validUntil).toISOString().split('T')[0],
        isActive: coupon.isActive,
        applicableCategories: Array.isArray(coupon.applicableCategories) ? coupon.applicableCategories : []
      });
    }
    
    setFormErrors({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCoupon(null);
    setFormData({
      code: '',
      description: '',
      discountType: 'percentage',
      discountValue: '',
      minimumOrderAmount: '',
      maximumDiscountAmount: '',
      usageLimit: '',
      userUsageLimit: 1,
      validFrom: '',
      validUntil: '',
      isActive: true,
      applicableCategories: []
    });
    setFormErrors({});
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.code.trim()) errors.code = 'Coupon code is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (!formData.discountValue) errors.discountValue = 'Discount value is required';
    if (!formData.validUntil) errors.validUntil = 'Valid until date is required';
    
    if (formData.discountType === 'percentage' && formData.discountValue > 100) {
      errors.discountValue = 'Percentage cannot exceed 100%';
    }
    
    if (formData.validFrom && formData.validUntil && new Date(formData.validUntil) <= new Date(formData.validFrom)) {
      errors.validUntil = 'Valid until date must be after valid from date';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setSubmitLoading(true);
      
      const submitData = {
        ...formData,
        discountValue: parseFloat(formData.discountValue),
        minimumOrderAmount: formData.minimumOrderAmount ? parseFloat(formData.minimumOrderAmount) : 0,
        maximumDiscountAmount: formData.maximumDiscountAmount ? parseFloat(formData.maximumDiscountAmount) : null,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
        userUsageLimit: parseInt(formData.userUsageLimit)
      };

      if (dialogMode === 'create') {
        await axios.post('/coupons', submitData);
      } else if (dialogMode === 'edit') {
        await axios.put(`/coupons/${selectedCoupon._id}`, submitData);
      }

      handleCloseDialog();
      fetchCoupons();
    } catch (error) {
      console.error('Error saving coupon:', error);
      if (error.response?.data?.errors) {
        const backendErrors = {};
        error.response.data.errors.forEach(err => {
          const field = err.toLowerCase().includes('code') ? 'code' : 'general';
          backendErrors[field] = err;
        });
        setFormErrors(backendErrors);
      } else if (error.response?.data?.message) {
        setFormErrors({ general: error.response.data.message });
      } else if (error.code === 'ECONNABORTED') {
        setFormErrors({ general: 'Request timeout. Please check your connection and try again.' });
      } else {
        setFormErrors({ general: 'An error occurred while saving the coupon. Please try again.' });
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleToggleStatus = async (coupon) => {
    try {
      setToggleLoading(coupon._id);
      const response = await axios.patch(`/coupons/${coupon._id}/status`);

      // Refresh the coupon list to reflect changes
      await fetchCoupons();

      // Show success message
      const newStatus = response.data.data.isActive ? 'activated' : 'deactivated';
      setSnackbar({
        open: true,
        message: `Coupon ${newStatus} successfully!`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Error toggling coupon status:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error toggling coupon status',
        severity: 'error'
      });
    } finally {
      setToggleLoading(null);
    }
  };

  const handleDelete = async (coupon) => {
    if (window.confirm(`Are you sure you want to delete coupon "${coupon.code}"?`)) {
      try {
        await axios.delete(`/coupons/${coupon._id}`);
        fetchCoupons();
        setSnackbar({
          open: true,
          message: 'Coupon deleted successfully',
          severity: 'success'
        });
      } catch (error) {
        console.error('Error deleting coupon:', error);
        setSnackbar({
          open: true,
          message: error.response?.data?.message || 'Error deleting coupon',
          severity: 'error'
        });
      }
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  const getStatusChip = (coupon) => {
    const now = new Date();
    const validFrom = new Date(coupon.validFrom);
    const validUntil = new Date(coupon.validUntil);

    if (!coupon.isActive) {
      return <Chip label="Inactive" color="default" size="small" />;
    } else if (now < validFrom) {
      return <Chip label="Scheduled" color="info" size="small" />;
    } else if (now > validUntil) {
      return <Chip label="Expired" color="error" size="small" />;
    } else if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return <Chip label="Limit Reached" color="warning" size="small" />;
    } else {
      return <Chip label="Active" color="success" size="small" />;
    }
  };

  // Mobile Coupon Card Component
  const CouponCard = ({ coupon }) => (
    <Card sx={{
      mb: 2,
      boxShadow: 2,
      borderRadius: 2,
      border: '1px solid',
      borderColor: 'divider'
    }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        {/* Header with code and status */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h6" fontWeight="bold" color="primary.main">
              {coupon.code}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {coupon.description}
            </Typography>
          </Box>
          {getStatusChip(coupon)}
        </Box>

        {/* Coupon Details */}
        <Stack spacing={1.5} sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">Discount:</Typography>
            <Typography variant="body2" fontWeight="medium">
              {coupon.discountType === 'percentage'
                ? `${coupon.discountValue}%`
                : `₹${coupon.discountValue}`}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">Usage:</Typography>
            <Typography variant="body2" fontWeight="medium">
              {coupon.usedCount} / {coupon.usageLimit || '∞'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">Valid Period:</Typography>
            <Typography variant="body2" fontWeight="medium" sx={{ textAlign: 'right' }}>
              {formatDate(coupon.validFrom)} - {formatDate(coupon.validUntil)}
            </Typography>
          </Box>
        </Stack>

        <Divider sx={{ my: 2 }} />

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<ViewIcon />}
            onClick={() => handleOpenDialog('view', coupon)}
            sx={{ flex: 1, minWidth: 'fit-content' }}
          >
            View
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => handleOpenDialog('edit', coupon)}
            sx={{ flex: 1, minWidth: 'fit-content' }}
          >
            Edit
          </Button>
          <IconButton
            size="small"
            onClick={() => handleToggleStatus(coupon)}
            disabled={toggleLoading === coupon._id}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1
            }}
          >
            {toggleLoading === coupon._id ? (
              <CircularProgress size={16} />
            ) : coupon.isActive ? (
              <ToggleOnIcon color="success" />
            ) : (
              <ToggleOffIcon />
            )}
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleDelete(coupon)}
            disabled={coupon.usedCount > 0}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1
            }}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{
      p: getContainerPadding(),
      minHeight: '100vh',
      bgcolor: 'background.default'
    }}>
      {/* Header Section - Responsive */}
      <Box sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between',
        alignItems: { xs: 'flex-start', sm: 'center' },
        gap: { xs: 2, sm: 0 },
        mb: getResponsiveSpacing()
      }}>
        <Typography
          variant={isMobile ? "h5" : "h4"}
          component="h1"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: { xs: 1, sm: 1.5 },
            fontWeight: 600,
            color: 'text.primary'
          }}
        >
          <CouponIcon sx={{
            fontSize: { xs: 32, sm: 40 },
            color: 'primary.main'
          }} />
          Manage Coupons
        </Typography>
        <Button
          variant="contained"
          size={getButtonSize()}
          startIcon={!isMobile && <AddIcon />}
          onClick={() => handleOpenDialog('create')}
          sx={{
            minWidth: { xs: '100%', sm: 'auto' },
            py: { xs: 1.5, sm: 1 },
            px: { xs: 3, sm: 2 },
            fontWeight: 600
          }}
        >
          {isMobile ? 'Create Coupon' : 'Create Coupon'}
        </Button>
      </Box>

      {/* Filters Section - Responsive */}
      <Card sx={{
        mb: getResponsiveSpacing(),
        boxShadow: { xs: 1, sm: 2 },
        borderRadius: { xs: 2, sm: 3 }
      }}>
        <CardContent sx={{
          p: { xs: 2, sm: 3 },
          '&:last-child': { pb: { xs: 2, sm: 3 } }
        }}>
          <Grid container spacing={getGridSpacing()} alignItems="center">
            <Grid item xs={12} sm={8} md={6}>
              <TextField
                fullWidth
                size={getFieldSize()}
                placeholder="Search coupons by code or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: { xs: 2, sm: 1.5 }
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4} md={3}>
              <FormControl fullWidth size={getFieldSize()}>
                <InputLabel>Status Filter</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status Filter"
                  onChange={(e) => setStatusFilter(e.target.value)}
                  sx={{
                    borderRadius: { xs: 2, sm: 1.5 }
                  }}
                >
                  <MenuItem value="all">All Coupons</MenuItem>
                  <MenuItem value="true">Active Only</MenuItem>
                  <MenuItem value="false">Inactive Only</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {/* Add clear filters button on mobile */}
            {isMobile && (searchTerm || statusFilter !== 'all') && (
              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  size="small"
                  fullWidth
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                  }}
                  sx={{ mt: 1 }}
                >
                  Clear Filters
                </Button>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* Coupons Display - Responsive */}
      <Card sx={{
        boxShadow: { xs: 1, sm: 2 },
        borderRadius: { xs: 2, sm: 3 }
      }}>
        <CardContent sx={{
          p: { xs: 1, sm: 2, md: 3 },
          '&:last-child': { pb: { xs: 1, sm: 2, md: 3 } }
        }}>
          {loading ? (
            <Box sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: { xs: 200, sm: 300 },
              p: 3
            }}>
              <CircularProgress size={isMobile ? 40 : 50} />
            </Box>
          ) : coupons.length === 0 ? (
            <Box sx={{
              textAlign: 'center',
              py: { xs: 4, sm: 6 },
              px: 2
            }}>
              <CouponIcon sx={{
                fontSize: { xs: 48, sm: 64 },
                color: 'text.disabled',
                mb: 2
              }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No coupons found
              </Typography>
              <Typography variant="body2" color="text.disabled">
                {searchTerm || statusFilter !== 'all'
                  ? 'Try adjusting your filters or search terms'
                  : 'Create your first coupon to get started'
                }
              </Typography>
            </Box>
          ) : (
            <>
              {/* Mobile Card View */}
              {shouldUseCards && (
                <Box>
                  {coupons.map((coupon) => (
                    <CouponCard key={coupon._id} coupon={coupon} />
                  ))}
                </Box>
              )}

              {/* Tablet Horizontal Scroll View */}
              {shouldUseHorizontalScroll && !shouldUseCards && (
                <TableContainer
                  component={Paper}
                  sx={{
                    overflowX: 'auto',
                    '&::-webkit-scrollbar': {
                      height: 8,
                    },
                    '&::-webkit-scrollbar-track': {
                      backgroundColor: 'grey.100',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      backgroundColor: 'grey.400',
                      borderRadius: 4,
                    },
                  }}
                >
                  <Table sx={{ minWidth: 800 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, minWidth: 120 }}>Code</TableCell>
                        <TableCell sx={{ fontWeight: 600, minWidth: 200 }}>Description</TableCell>
                        <TableCell sx={{ fontWeight: 600, minWidth: 100 }}>Discount</TableCell>
                        <TableCell sx={{ fontWeight: 600, minWidth: 100 }}>Usage</TableCell>
                        <TableCell sx={{ fontWeight: 600, minWidth: 180 }}>Valid Period</TableCell>
                        <TableCell sx={{ fontWeight: 600, minWidth: 100 }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 600, minWidth: 150 }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {coupons.map((coupon) => (
                        <TableRow key={coupon._id} hover>
                          <TableCell sx={{ p: getTableCellPadding() }}>
                            <Typography variant="body2" fontWeight="bold">
                              {coupon.code}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ p: getTableCellPadding() }}>
                            <Typography variant="body2" noWrap sx={{ maxWidth: 180 }}>
                              {coupon.description}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ p: getTableCellPadding() }}>
                            <Typography variant="body2">
                              {coupon.discountType === 'percentage'
                                ? `${coupon.discountValue}%`
                                : `₹${coupon.discountValue}`}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ p: getTableCellPadding() }}>
                            <Typography variant="body2">
                              {coupon.usedCount} / {coupon.usageLimit || '∞'}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ p: getTableCellPadding() }}>
                            <Typography variant="body2">
                              {formatDate(coupon.validFrom)} - {formatDate(coupon.validUntil)}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ p: getTableCellPadding() }}>
                            {getStatusChip(coupon)}
                          </TableCell>
                          <TableCell sx={{ p: getTableCellPadding() }}>
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                              <Tooltip title="View Details">
                                <IconButton size="small" onClick={() => handleOpenDialog('view', coupon)}>
                                  <ViewIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Edit">
                                <IconButton size="small" onClick={() => handleOpenDialog('edit', coupon)}>
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title={coupon.isActive ? "Deactivate" : "Activate"}>
                                <IconButton
                                  size="small"
                                  onClick={() => handleToggleStatus(coupon)}
                                  disabled={toggleLoading === coupon._id}
                                >
                                  {toggleLoading === coupon._id ? (
                                    <CircularProgress size={16} />
                                  ) : coupon.isActive ? (
                                    <ToggleOnIcon color="success" />
                                  ) : (
                                    <ToggleOffIcon />
                                  )}
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete">
                                <IconButton
                                  size="small"
                                  onClick={() => handleDelete(coupon)}
                                  disabled={coupon.usedCount > 0}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {/* Desktop Full Table View */}
              {!shouldUseCards && !shouldUseHorizontalScroll && (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Code</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Discount</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Usage</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Valid Period</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {coupons.map((coupon) => (
                        <TableRow key={coupon._id} hover>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold">
                              {coupon.code}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" noWrap sx={{ maxWidth: 250 }}>
                              {coupon.description}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {coupon.discountType === 'percentage'
                                ? `${coupon.discountValue}%`
                                : `₹${coupon.discountValue}`}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {coupon.usedCount} / {coupon.usageLimit || '∞'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {formatDate(coupon.validFrom)} - {formatDate(coupon.validUntil)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {getStatusChip(coupon)}
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Tooltip title="View Details">
                                <IconButton size="small" onClick={() => handleOpenDialog('view', coupon)}>
                                  <ViewIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Edit">
                                <IconButton size="small" onClick={() => handleOpenDialog('edit', coupon)}>
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title={coupon.isActive ? "Deactivate" : "Activate"}>
                                <IconButton
                                  size="small"
                                  onClick={() => handleToggleStatus(coupon)}
                                  disabled={toggleLoading === coupon._id}
                                >
                                  {toggleLoading === coupon._id ? (
                                    <CircularProgress size={20} />
                                  ) : coupon.isActive ? (
                                    <ToggleOnIcon color="success" />
                                  ) : (
                                    <ToggleOffIcon />
                                  )}
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete">
                                <IconButton
                                  size="small"
                                  onClick={() => handleDelete(coupon)}
                                  disabled={coupon.usedCount > 0}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {/* Pagination - Responsive */}
              {totalPages > 1 && (
                <Box sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  mt: getResponsiveSpacing(),
                  px: { xs: 1, sm: 0 }
                }}>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(e, value) => setPage(value)}
                    color="primary"
                    size={isMobile ? 'small' : 'medium'}
                    showFirstButton={!isMobile}
                    showLastButton={!isMobile}
                    siblingCount={isMobile ? 0 : 1}
                    boundaryCount={isMobile ? 1 : 2}
                  />
                </Box>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog - Responsive */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth={getDialogMaxWidth()}
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: { xs: 0, sm: 2 },
            m: { xs: 0, sm: 2 },
            maxHeight: { xs: '100vh', sm: '90vh' }
          }
        }}
      >
        <DialogTitle sx={{
          p: { xs: 2, sm: 3 },
          borderBottom: '1px solid',
          borderColor: 'divider',
          fontSize: isMobile ? '1.25rem' : '1.5rem',
          fontWeight: 600
        }}>
          {dialogMode === 'create' ? 'Create New Coupon' :
           dialogMode === 'edit' ? 'Edit Coupon' : 'Coupon Details'}
        </DialogTitle>
        <DialogContent sx={{
          p: { xs: 2, sm: 3 },
          overflowY: 'auto'
        }}>
          <Grid container spacing={getFormSpacing()} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size={getFieldSize()}
                label="Coupon Code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                error={!!formErrors.code}
                helperText={formErrors.code}
                disabled={dialogMode === 'view'}
                inputProps={{ maxLength: 20 }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: { xs: 2, sm: 1.5 }
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size={getFieldSize()}>
                <InputLabel>Discount Type</InputLabel>
                <Select
                  value={formData.discountType}
                  label="Discount Type"
                  onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                  disabled={dialogMode === 'view'}
                  sx={{
                    borderRadius: { xs: 2, sm: 1.5 }
                  }}
                >
                  <MenuItem value="percentage">Percentage (%)</MenuItem>
                  <MenuItem value="fixed">Fixed Amount (₹)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                size={getFieldSize()}
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                error={!!formErrors.description}
                helperText={formErrors.description}
                disabled={dialogMode === 'view'}
                multiline
                rows={isMobile ? 3 : 2}
                inputProps={{ maxLength: 200 }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: { xs: 2, sm: 1.5 }
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size={getFieldSize()}
                label={`Discount Value ${formData.discountType === 'percentage' ? '(%)' : '(₹)'}`}
                type="number"
                value={formData.discountValue}
                onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                error={!!formErrors.discountValue}
                helperText={formErrors.discountValue}
                disabled={dialogMode === 'view'}
                inputProps={{ min: 0, max: formData.discountType === 'percentage' ? 100 : undefined }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: { xs: 2, sm: 1.5 }
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size={getFieldSize()}
                label="Minimum Order Amount (₹)"
                type="number"
                value={formData.minimumOrderAmount}
                onChange={(e) => setFormData({ ...formData, minimumOrderAmount: e.target.value })}
                disabled={dialogMode === 'view'}
                inputProps={{ min: 0 }}
                helperText="Optional: Minimum cart value required"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: { xs: 2, sm: 1.5 }
                  }
                }}
              />
            </Grid>
            {formData.discountType === 'percentage' && (
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size={getFieldSize()}
                  label="Maximum Discount Amount (₹)"
                  type="number"
                  value={formData.maximumDiscountAmount}
                  onChange={(e) => setFormData({ ...formData, maximumDiscountAmount: e.target.value })}
                  disabled={dialogMode === 'view'}
                  inputProps={{ min: 0 }}
                  helperText="Optional: Cap the maximum discount for percentage coupons"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: { xs: 2, sm: 1.5 }
                    }
                  }}
                />
              </Grid>
            )}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size={getFieldSize()}
                label="Usage Limit"
                type="number"
                value={formData.usageLimit}
                onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                disabled={dialogMode === 'view'}
                inputProps={{ min: 1 }}
                helperText="Leave empty for unlimited usage"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: { xs: 2, sm: 1.5 }
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size={getFieldSize()}
                label="User Usage Limit"
                type="number"
                value={formData.userUsageLimit}
                onChange={(e) => setFormData({ ...formData, userUsageLimit: e.target.value })}
                disabled={dialogMode === 'view'}
                inputProps={{ min: 1 }}
                helperText="How many times each user can use this coupon"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: { xs: 2, sm: 1.5 }
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size={getFieldSize()}
                label="Valid From"
                type="date"
                value={formData.validFrom}
                onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                disabled={dialogMode === 'view'}
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: { xs: 2, sm: 1.5 }
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size={getFieldSize()}
                label="Valid Until"
                type="date"
                value={formData.validUntil}
                onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                error={!!formErrors.validUntil}
                helperText={formErrors.validUntil}
                disabled={dialogMode === 'view'}
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: { xs: 2, sm: 1.5 }
                  }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth size={getFieldSize()}>
                <InputLabel>Applicable Categories</InputLabel>
                <Select
                  multiple
                  value={Array.isArray(formData.applicableCategories) ? formData.applicableCategories : []}
                  label="Applicable Categories"
                  onChange={(e) => setFormData({ ...formData, applicableCategories: e.target.value })}
                  disabled={dialogMode === 'view'}
                  renderValue={(selected) => Array.isArray(selected) ? selected.join(', ') : ''}
                  sx={{
                    borderRadius: { xs: 2, sm: 1.5 }
                  }}
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                Leave empty to apply to all categories
              </Typography>
            </Grid>
            {dialogMode !== 'view' && (
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      size={isMobile ? 'medium' : 'medium'}
                    />
                  }
                  label={
                    <Typography variant="body2" fontWeight={500}>
                      Active Coupon
                    </Typography>
                  }
                  sx={{ mt: 1 }}
                />
              </Grid>
            )}
            {formErrors.general && (
              <Grid item xs={12}>
                <Alert
                  severity="error"
                  sx={{
                    borderRadius: { xs: 2, sm: 1.5 },
                    fontSize: { xs: '0.875rem', sm: '1rem' }
                  }}
                >
                  {formErrors.general}
                </Alert>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{
          p: { xs: 2, sm: 3 },
          borderTop: '1px solid',
          borderColor: 'divider',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 1, sm: 2 }
        }}>
          <Button
            onClick={handleCloseDialog}
            size={getButtonSize()}
            sx={{
              order: { xs: 2, sm: 1 },
              minWidth: { xs: '100%', sm: 'auto' }
            }}
          >
            Cancel
          </Button>
          {dialogMode !== 'view' && (
            <Button
              onClick={handleSubmit}
              variant="contained"
              size={getButtonSize()}
              disabled={submitLoading}
              sx={{
                order: { xs: 1, sm: 2 },
                minWidth: { xs: '100%', sm: 'auto' },
                fontWeight: 600
              }}
            >
              {submitLoading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={16} color="inherit" />
                  {isMobile && 'Processing...'}
                </Box>
              ) : (
                dialogMode === 'create' ? 'Create Coupon' : 'Update Coupon'
              )}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications - Responsive */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: isMobile ? 'center' : 'right'
        }}
        sx={{
          '& .MuiSnackbarContent-root': {
            minWidth: { xs: '90vw', sm: 'auto' }
          }
        }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{
            width: '100%',
            borderRadius: { xs: 2, sm: 1.5 },
            fontSize: { xs: '0.875rem', sm: '1rem' }
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ManageCoupons;
