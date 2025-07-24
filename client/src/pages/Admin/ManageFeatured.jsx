import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  IconButton,
  Button,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardMedia,
  CardContent,
  Chip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import axios from '../../utils/axios';
import { useResponsive } from '../../hooks/useResponsive';

const ManageFeatured = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const {
    isMobile,
    isTablet,
    getResponsiveSpacing,
    getContainerPadding,
    getButtonSize
  } = useResponsive();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [products, setProducts] = useState([]);
  const [featured, setFeatured] = useState({
    men: [],
    women: [],
    accessories: []
  });
  const [selectedCategory, setSelectedCategory] = useState('men');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, featuredRes] = await Promise.all([
        axios.get('/admin/products'),
        axios.get('/admin/featured')
      ]);

      setProducts(productsRes.data.data || []);
      
      // Organize featured products by category
      const featuredByCategory = {
        men: [],
        women: [],
        accessories: []
      };
      
      featuredRes.data.data.forEach(item => {
        featuredByCategory[item.category] = item.products || [];
      });
      
      setFeatured(featuredByCategory);
      setLoading(false);
    } catch (error) {
      setError(error.response?.data?.message || 'Error fetching data');
      setLoading(false);
    }
  };

  const handleAddToFeatured = async (product) => {
    try {
      const currentFeatured = featured[selectedCategory];
      if (currentFeatured.some(p => p._id === product._id)) {
        setError('Product is already featured in this category');
        return;
      }

      const updatedProducts = [...currentFeatured, product];
      const productIds = updatedProducts.map(p => p._id);

      await axios.put(`/admin/featured/${selectedCategory}`, {
        productIds
      });

      setFeatured(prev => ({
        ...prev,
        [selectedCategory]: updatedProducts
      }));

      setSuccess('Featured products updated successfully');
    } catch (error) {
      setError(error.response?.data?.message || 'Error updating featured products');
    }
  };

  const handleRemoveFromFeatured = async (productId) => {
    try {
      const currentFeatured = featured[selectedCategory];
      const updatedProducts = currentFeatured.filter(p => p._id !== productId);
      const productIds = updatedProducts.map(p => p._id);

      await axios.put(`/admin/featured/${selectedCategory}`, {
        productIds
      });

      setFeatured(prev => ({
        ...prev,
        [selectedCategory]: updatedProducts
      }));

      setSuccess('Product removed from featured successfully');
    } catch (error) {
      setError(error.response?.data?.message || 'Error removing product from featured');
    }
  };

  if (loading) {
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: { xs: '50vh', sm: '60vh' },
        px: getContainerPadding()
      }}>
        <CircularProgress size={isMobile ? 40 : 50} />
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
          p: { xs: 2, sm: 3, md: 4 },
          border: 1,
          borderColor: 'divider',
          borderRadius: { xs: 2, sm: 3 }
        }}
      >
        {/* Responsive Header Section */}
        <Box sx={{
          mb: { xs: 3, sm: 4 },
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: { xs: 2, sm: 2 }
        }}>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: { xs: 1, sm: 2 },
            width: { xs: '100%', sm: 'auto' }
          }}>
            <IconButton
              onClick={() => navigate('/admin')}
              size={isMobile ? 'medium' : 'large'}
              sx={{
                p: { xs: 1, sm: 1.5 },
                '&:hover': {
                  backgroundColor: 'action.hover'
                }
              }}
            >
              <BackIcon fontSize={isMobile ? 'medium' : 'large'} />
            </IconButton>
            <Typography
              variant={isMobile ? "h5" : isTablet ? "h4" : "h4"}
              component="h1"
              sx={{
                fontWeight: 600,
                fontSize: {
                  xs: '1.5rem',
                  sm: '1.75rem',
                  md: '2rem',
                  lg: '2.125rem'
                },
                lineHeight: 1.2,
                flex: 1
              }}
            >
              Manage Featured Products
            </Typography>
          </Box>
        </Box>

        {/* Responsive Alert Messages */}
        {(error || success) && (
          <Alert
            severity={error ? "error" : "success"}
            sx={{
              mb: { xs: 2, sm: 3 },
              fontSize: { xs: '0.875rem', sm: '1rem' },
              '& .MuiAlert-message': {
                padding: { xs: '6px 0', sm: '8px 0' }
              }
            }}
            onClose={() => {
              setError('');
              setSuccess('');
            }}
          >
            {error || success}
          </Alert>
        )}

        {/* Responsive Category Selector */}
        <FormControl
          fullWidth
          sx={{
            mb: { xs: 3, sm: 4 },
            '& .MuiInputLabel-root': {
              fontSize: { xs: '1rem', sm: '1.125rem' }
            },
            '& .MuiSelect-select': {
              fontSize: { xs: '1rem', sm: '1.125rem' },
              padding: { xs: '12px 14px', sm: '16px 14px' }
            }
          }}
        >
          <InputLabel>Category</InputLabel>
          <Select
            value={selectedCategory}
            label="Category"
            onChange={(e) => setSelectedCategory(e.target.value)}
            size={isMobile ? 'medium' : 'medium'}
            MenuProps={{
              PaperProps: {
                sx: {
                  maxHeight: { xs: 200, sm: 300 },
                  '& .MuiMenuItem-root': {
                    fontSize: { xs: '1rem', sm: '1.125rem' },
                    padding: { xs: '10px 16px', sm: '12px 16px' },
                    minHeight: { xs: 40, sm: 48 }
                  }
                }
              }
            }}
          >
            <MenuItem value="men">Men</MenuItem>
            <MenuItem value="women">Women</MenuItem>
            <MenuItem value="accessories">Accessories</MenuItem>
          </Select>
        </FormControl>

        {/* Featured Products Section */}
        <Typography
          variant="h6"
          gutterBottom
          sx={{
            fontSize: { xs: '1.125rem', sm: '1.25rem', md: '1.375rem' },
            fontWeight: 600,
            mb: { xs: 2, sm: 3 }
          }}
        >
          Current Featured Products ({featured[selectedCategory].length})
        </Typography>

        {featured[selectedCategory].length === 0 ? (
          <Box sx={{
            textAlign: 'center',
            py: { xs: 4, sm: 6 },
            mb: { xs: 3, sm: 4 }
          }}>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
            >
              No featured products in this category yet.
            </Typography>
          </Box>
        ) : (
          <Grid
            container
            spacing={{ xs: 2, sm: 2, md: 3 }}
            sx={{ mb: { xs: 3, sm: 4 } }}
          >
            {featured[selectedCategory].map((product) => (
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                lg={3}
                key={product._id}
              >
                <Card sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: { xs: 'none', sm: 'translateY(-2px)' },
                    boxShadow: { xs: 1, sm: 3 }
                  },
                  borderRadius: { xs: 2, sm: 3 }
                }}>
                  <CardMedia
                    component="img"
                    height={isMobile ? "160" : isTablet ? "180" : "200"}
                    image={product.images[0]}
                    alt={product.name}
                    sx={{
                      objectFit: 'cover',
                      objectPosition: 'top center',
                      borderRadius: { xs: '8px 8px 0 0', sm: '12px 12px 0 0' }
                    }}
                  />
                  <CardContent sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    p: { xs: 1.5, sm: 2 },
                    '&:last-child': {
                      pb: { xs: 1.5, sm: 2 }
                    }
                  }}>
                    <Typography
                      variant="subtitle1"
                      noWrap
                      sx={{
                        fontSize: { xs: '0.875rem', sm: '1rem' },
                        fontWeight: 500,
                        mb: 1,
                        lineHeight: 1.3
                      }}
                    >
                      {product.name}
                    </Typography>
                    <Box sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mt: 'auto'
                    }}>
                      <Typography
                        variant="body1"
                        color="primary"
                        sx={{
                          fontSize: { xs: '0.875rem', sm: '1rem' },
                          fontWeight: 600
                        }}
                      >
                        ₹{product.discountPrice || product.price}
                      </Typography>
                      <IconButton
                        color="error"
                        onClick={() => handleRemoveFromFeatured(product._id)}
                        size={isMobile ? 'small' : 'medium'}
                        sx={{
                          p: { xs: 0.5, sm: 1 },
                          '&:hover': {
                            backgroundColor: 'error.light',
                            color: 'white'
                          }
                        }}
                      >
                        <DeleteIcon fontSize={isMobile ? 'small' : 'medium'} />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Available Products Section */}
        <Typography
          variant="h6"
          gutterBottom
          sx={{
            fontSize: { xs: '1.125rem', sm: '1.25rem', md: '1.375rem' },
            fontWeight: 600,
            mb: { xs: 2, sm: 3 },
            mt: { xs: 2, sm: 3 }
          }}
        >
          Available Products
        </Typography>

        {products
          .filter(product =>
            product.category === selectedCategory &&
            !featured[selectedCategory].some(p => p._id === product._id)
          ).length === 0 ? (
          <Box sx={{
            textAlign: 'center',
            py: { xs: 4, sm: 6 }
          }}>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
            >
              No available products in this category or all products are already featured.
            </Typography>
          </Box>
        ) : (
          <Grid
            container
            spacing={{ xs: 2, sm: 2, md: 3 }}
          >
            {products
              .filter(product =>
                product.category === selectedCategory &&
                !featured[selectedCategory].some(p => p._id === product._id)
              )
              .map((product) => (
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  lg={3}
                  key={product._id}
                >
                  <Card sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      transform: { xs: 'none', sm: 'translateY(-2px)' },
                      boxShadow: { xs: 1, sm: 3 }
                    },
                    borderRadius: { xs: 2, sm: 3 }
                  }}>
                    <CardMedia
                      component="img"
                      height={isMobile ? "160" : isTablet ? "180" : "200"}
                      image={product.images[0]}
                      alt={product.name}
                      sx={{
                        objectFit: 'cover',
                        objectPosition: 'top center',
                        borderRadius: { xs: '8px 8px 0 0', sm: '12px 12px 0 0' }
                      }}
                    />
                    <CardContent sx={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      p: { xs: 1.5, sm: 2 },
                      '&:last-child': {
                        pb: { xs: 1.5, sm: 2 }
                      }
                    }}>
                      <Typography
                        variant="subtitle1"
                        noWrap
                        sx={{
                          fontSize: { xs: '0.875rem', sm: '1rem' },
                          fontWeight: 500,
                          mb: 1,
                          lineHeight: 1.3
                        }}
                      >
                        {product.name}
                      </Typography>
                      <Box sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        justifyContent: 'space-between',
                        alignItems: { xs: 'stretch', sm: 'center' },
                        gap: { xs: 1, sm: 0 },
                        mt: 'auto'
                      }}>
                        <Typography
                          variant="body1"
                          color="primary"
                          sx={{
                            fontSize: { xs: '0.875rem', sm: '1rem' },
                            fontWeight: 600,
                            mb: { xs: 1, sm: 0 }
                          }}
                        >
                          ₹{product.discountPrice || product.price}
                        </Typography>
                        <Button
                          variant="contained"
                          size={getButtonSize()}
                          onClick={() => handleAddToFeatured(product)}
                          sx={{
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                            padding: { xs: '6px 12px', sm: '8px 16px' },
                            minWidth: { xs: 'auto', sm: 'auto' },
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {isMobile ? 'Add' : 'Add to Featured'}
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
      </Paper>
    </Container>
  );
};

export default ManageFeatured; 