import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Alert,
  CircularProgress,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Input,
  Card,
  CardContent,
  CardActions,
  CardMedia,
  Stack,
  useTheme,
  useMediaQuery,
  Fab
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  ArrowBack as BackIcon,
  CloudUpload as UploadIcon,
  DeleteOutline as RemoveImageIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';
import axios from '../../utils/axios';
import { useResponsive, useResponsiveTable, useResponsiveForm } from '../../hooks/useResponsive';

const ManageProducts = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    isMobile,
    isTablet,
    isDesktop,
    getContainerPadding,
    getResponsiveSpacing
  } = useResponsive();
  const { shouldUseCards, getImageSize } = useResponsiveTable();
  const { getFormSpacing, getFieldSize, getImageGridColumns } = useResponsiveForm();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editDialog, setEditDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    price: '',
    discountPrice: '',
    stock: '',
    category: '',
    subCategory: '',
    sizes: [],
    images: [],
    newImages: [],
    imagePosition: 'center',
    imageScale: 1,
    imageFit: 'cover'
  });
  const [searchTerm, setSearchTerm] = useState('');

  const categories = ['men', 'women', 'accessories'];
  const subCategories = {
    men: ['shirts', 'pants', 't-shirts', 'jeans', 'jackets'],
    women: ['dresses', 'tops', 'pants', 'skirts', 'jackets'],
    accessories: ['bags', 'jewelry', 'watches', 'belts', 'sunglasses']
  };
  const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  const positions = [
    'center', 'top', 'bottom', 'left', 'right',
    'top left', 'top center', 'top right',
    'center left', 'center center', 'center right',
    'bottom left', 'bottom center', 'bottom right'
  ];

  const defaultImage = useMemo(() => 'https://res.cloudinary.com/dibb74win/image/upload/v1707665378/sigma-clothing/product-placeholder.png', []);

  // Filter products based on search term
  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return products;

    return products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.subCategory && product.subCategory.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [products, searchTerm]);

  const fetchProducts = useCallback(async () => {
    try {
      const response = await axios.get('/admin/products');
      const productsData = Array.isArray(response.data.data) ? response.data.data : [];
      
      // Process products once to ensure all required fields
      const processedProducts = productsData.map(product => ({
        ...product,
        _id: product._id || `temp-${Math.random()}`,
        name: product.name || 'Unnamed Product',
        category: product.category || 'Uncategorized',
        price: product.price || 0,
        stock: product.stock || 0,
        images: Array.isArray(product.images) && product.images.length > 0 
          ? product.images.filter(img => img && typeof img === 'string' && (img.includes('cloudinary.com') || img.startsWith('http')))
          : [defaultImage]
      }));
      
      setProducts(processedProducts);
    } catch (error) {
      setError(error.response?.data?.message || 'Error fetching products');
    } finally {
      setLoading(false);
    }
  }, [defaultImage]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Handle direct edit from Dashboard
  useEffect(() => {
    if (location.state?.editProduct && products.length > 0) {
      const productToEdit = location.state.editProduct;
      // Find the full product data from the products list
      const fullProduct = products.find(p => p._id === productToEdit._id) || productToEdit;

      // Set up the edit form directly
      setSelectedProduct(fullProduct);
      setEditForm({
        name: fullProduct.name || '',
        description: fullProduct.description || '',
        price: fullProduct.price || '',
        discountPrice: fullProduct.discountPrice || '',
        stock: fullProduct.stock || '',
        category: fullProduct.category || '',
        subCategory: fullProduct.subCategory || '',
        sizes: fullProduct.sizes || [],
        images: fullProduct.images || [],
        newImages: [],
        imagePosition: fullProduct.imagePosition || 'center',
        imageScale: fullProduct.imageScale || 1,
        imageFit: fullProduct.imageFit || 'cover'
      });
      setEditDialog(true);

      // Clear the state to prevent reopening on subsequent renders
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, products, navigate, location.pathname]);

  const handleEdit = useCallback((product) => {
    setSelectedProduct(product);
    setEditForm({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      discountPrice: product.discountPrice || '',
      stock: product.stock || '',
      category: product.category || '',
      subCategory: product.subCategory || '',
      sizes: product.sizes || [],
      images: product.images || [],
      newImages: [],
      imagePosition: product.imagePosition || 'center',
      imageScale: product.imageScale || 1,
      imageFit: product.imageFit || 'cover'
    });
    setEditDialog(true);
  }, []);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + editForm.images.length + editForm.newImages.length > 6) {
      setError('Maximum 6 images allowed');
      return;
    }

    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));

    setEditForm(prev => ({
      ...prev,
      newImages: [...prev.newImages, ...newImages]
    }));
  };

  const handleRemoveExistingImage = (index) => {
    setEditForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleRemoveNewImage = (index) => {
    setEditForm(prev => ({
      ...prev,
      newImages: prev.newImages.filter((_, i) => i !== index)
    }));
  };

  const handleImagePositionChange = (position) => {
    setEditForm(prev => ({
      ...prev,
      imagePosition: position
    }));
  };

  const handleEditSubmit = async () => {
    try {
      const formData = new FormData();
      
      // Append all text fields
      Object.keys(editForm).forEach(key => {
        if (key !== 'images' && key !== 'newImages') {
          if (Array.isArray(editForm[key])) {
            formData.append(key, JSON.stringify(editForm[key]));
          } else {
            formData.append(key, editForm[key]);
          }
        }
      });

      // Append existing images
      formData.append('existingImages', JSON.stringify(editForm.images));

      // Append new images
      editForm.newImages.forEach(image => {
        formData.append('images', image.file);
      });

      await axios.put(`/admin/products/${selectedProduct._id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setEditDialog(false);
      fetchProducts();
    } catch (error) {
      setError(error.response?.data?.message || 'Error updating product');
    }
  };

  const handleDelete = useCallback(async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`/admin/products/${productId}`);
        fetchProducts();
      } catch (error) {
        setError(error.response?.data?.message || 'Error deleting product');
      }
    }
  }, [fetchProducts]);

  // Mobile Product Card Component
  const ProductCard = ({ product }) => (
    <Card
      sx={{
        mb: 2,
        borderRadius: 2,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          transform: 'translateY(-2px)',
          transition: 'all 0.2s ease-in-out'
        }
      }}
    >
      <Box sx={{ display: 'flex', p: 2 }}>
        <CardMedia
          component="img"
          sx={{
            width: { xs: 80, sm: 100 },
            height: { xs: 80, sm: 100 },
            objectFit: 'cover',
            objectPosition: 'top center',
            borderRadius: 1,
            border: '1px solid #eee',
            flexShrink: 0
          }}
          image={product.images[0]}
          alt={product.name}
          onError={(e) => {
            if (e.target.src !== defaultImage) {
              e.target.src = defaultImage;
            }
          }}
        />

        <Box sx={{ ml: 2, flex: 1, minWidth: 0 }}>
          <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                fontSize: '1rem',
                mb: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {product.name}
            </Typography>

            <Stack spacing={1}>
              <Typography variant="body2" color="text.secondary">
                {`${product.category}${product.subCategory ? ` / ${product.subCategory}` : ''}`}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body1" fontWeight={600} color="primary">
                  ₹{product.price}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Stock: {product.stock}
                </Typography>
              </Box>

              <Chip
                label={product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                color={product.stock > 0 ? 'success' : 'error'}
                size="small"
                sx={{ alignSelf: 'flex-start' }}
              />
            </Stack>
          </CardContent>

          <CardActions sx={{ p: 0, pt: 2, justifyContent: 'flex-end' }}>
            <IconButton
              onClick={() => handleEdit(product)}
              color="primary"
              size="small"
              title="Edit product"
            >
              <EditIcon />
            </IconButton>
            <IconButton
              onClick={() => handleDelete(product._id)}
              color="error"
              size="small"
              title="Delete product"
            >
              <DeleteIcon />
            </IconButton>
          </CardActions>
        </Box>
      </Box>
    </Card>
  );

  if (loading) {
    return (
      <Container
        maxWidth="lg"
        sx={{
          py: getResponsiveSpacing(),
          px: getContainerPadding()
        }}
      >
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: { xs: '50vh', md: '60vh' },
          gap: 2
        }}>
          <CircularProgress size={isMobile ? 40 : 50} />
          <Typography
            variant={isMobile ? "body1" : "h6"}
            color="text.secondary"
            textAlign="center"
          >
            Loading products...
          </Typography>
        </Box>
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
      <Paper
        elevation={0}
        sx={{
          p: getResponsiveSpacing(),
          border: 1,
          borderColor: 'divider',
          borderRadius: { xs: 2, md: 3 },
          overflow: 'hidden'
        }}
      >
        {/* Responsive Header Section */}
        <Box sx={{
          mb: { xs: 3, md: 4 },
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          gap: { xs: 2, sm: 1 }
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
            <IconButton
              onClick={() => navigate('/admin')}
              size={isMobile ? 'small' : 'medium'}
            >
              <BackIcon />
            </IconButton>
            <Typography
              variant={isMobile ? "h5" : "h4"}
              sx={{
                fontWeight: 600,
                fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' }
              }}
            >
              Manage Products
            </Typography>
          </Box>

          {/* Responsive Add Button */}
          {isMobile ? (
            <Fab
              color="primary"
              onClick={() => navigate('/admin/products/add')}
              sx={{
                position: 'fixed',
                bottom: 16,
                right: 16,
                zIndex: 1000
              }}
            >
              <AddIcon />
            </Fab>
          ) : (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/admin/products/add')}
              size={isTablet ? 'medium' : 'large'}
              sx={{
                minWidth: { sm: 'auto', md: '180px' },
                fontSize: { sm: '0.875rem', md: '1rem' }
              }}
            >
              {isTablet ? 'Add Product' : 'Add New Product'}
            </Button>
          )}
        </Box>

        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 3,
              borderRadius: 2,
              fontSize: { xs: '0.875rem', md: '1rem' }
            }}
            onClose={() => setError('')}
          >
            {error}
          </Alert>
        )}

        {/* Search Bar */}
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Search products by name or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size={isMobile ? "medium" : "medium"}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              }
            }}
          />
        </Box>

        {/* Responsive Products Display */}
        {shouldUseCards ? (
          // Mobile Card Layout
          <Box>
            {filteredProducts && filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))
            ) : (
              <Card sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
                <Typography variant="body1" color="text.secondary">
                  {searchTerm ? `No products found matching "${searchTerm}"` : 'No products found'}
                </Typography>
                {searchTerm && (
                  <Button
                    variant="text"
                    onClick={() => setSearchTerm('')}
                    sx={{ mt: 1 }}
                  >
                    Clear search
                  </Button>
                )}
              </Card>
            )}
          </Box>
        ) : (
          // Tablet and Desktop Table Layout
          <TableContainer
            sx={{
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              overflowX: 'auto',
              '&::-webkit-scrollbar': {
                height: 8,
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: 'grey.100',
                borderRadius: 4,
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: 'grey.400',
                borderRadius: 4,
                '&:hover': {
                  backgroundColor: 'grey.500',
                },
              },
            }}
          >
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, minWidth: 80 }}>Image</TableCell>
                  <TableCell sx={{ fontWeight: 600, minWidth: 200 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 600, minWidth: 150 }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 600, minWidth: 100 }}>Price</TableCell>
                  <TableCell sx={{ fontWeight: 600, minWidth: 80 }}>Stock</TableCell>
                  <TableCell sx={{ fontWeight: 600, minWidth: 120 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600, minWidth: 120 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredProducts && filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <TableRow
                      key={product._id}
                      sx={{
                        '&:hover': {
                          backgroundColor: 'action.hover',
                        },
                      }}
                    >
                      <TableCell>
                        <Box
                          component="img"
                          src={product.images[0]}
                          alt={product.name}
                          sx={{
                            ...getImageSize(),
                            objectFit: 'cover',
                            objectPosition: 'top center',
                            borderRadius: 1,
                            border: '1px solid #eee'
                          }}
                          onError={(e) => {
                            if (e.target.src !== defaultImage) {
                              e.target.src = defaultImage;
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 500,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: 200
                          }}
                        >
                          {product.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {`${product.category}${product.subCategory ? ` / ${product.subCategory}` : ''}`}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600} color="primary">
                          ₹{product.price}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {product.stock}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                          color={product.stock > 0 ? 'success' : 'error'}
                          size="small"
                          sx={{ fontSize: '0.75rem' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <IconButton
                            onClick={() => handleEdit(product)}
                            color="primary"
                            size="small"
                            title="Edit product"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            onClick={() => handleDelete(product._id)}
                            color="error"
                            size="small"
                            title="Delete product"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                        {searchTerm ? `No products found matching "${searchTerm}"` : 'No products found'}
                      </Typography>
                      {searchTerm && (
                        <Button
                          variant="text"
                          onClick={() => setSearchTerm('')}
                          size="small"
                        >
                          Clear search
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Enhanced Responsive Edit Dialog */}
        <Dialog
          open={editDialog}
          onClose={() => setEditDialog(false)}
          maxWidth={isMobile ? false : "md"}
          fullWidth
          fullScreen={isMobile}
          sx={{
            '& .MuiDialog-paper': {
              borderRadius: isMobile ? 0 : 2,
              margin: isMobile ? 0 : 2,
              maxHeight: isMobile ? '100vh' : '90vh',
            }
          }}
        >
          <DialogTitle sx={{
            pb: 1,
            borderBottom: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <Typography variant={isMobile ? "h6" : "h5"} component="span" fontWeight={600}>
              Edit Product
            </Typography>
            {isMobile && (
              <IconButton onClick={() => setEditDialog(false)} size="small">
                <BackIcon />
              </IconButton>
            )}
          </DialogTitle>
          <DialogContent sx={{
            px: { xs: 2, sm: 3 },
            py: { xs: 2, sm: 3 }
          }}>
            <Box sx={{
              pt: { xs: 1, sm: 2 },
              display: 'flex',
              flexDirection: 'column',
              gap: { xs: 2, sm: 3 }
            }}>
              <Grid container spacing={{ xs: 2, sm: 3 }}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Product Name"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    size={isMobile ? "medium" : "medium"}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={isMobile ? 3 : 4}
                    label="Description"
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    size={isMobile ? "medium" : "medium"}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size={isMobile ? "medium" : "medium"}>
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={editForm.category}
                      label="Category"
                      onChange={(e) => setEditForm({
                        ...editForm,
                        category: e.target.value,
                        subCategory: '' // Reset subcategory when category changes
                      })}
                    >
                      {categories.map(category => (
                        <MenuItem key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth disabled={!editForm.category} size={isMobile ? "medium" : "medium"}>
                    <InputLabel>Sub Category</InputLabel>
                    <Select
                      value={editForm.subCategory}
                      label="Sub Category"
                      onChange={(e) => setEditForm({ ...editForm, subCategory: e.target.value })}
                    >
                      {editForm.category && subCategories[editForm.category].map(subCategory => (
                        <MenuItem key={subCategory} value={subCategory}>
                          {subCategory.charAt(0).toUpperCase() + subCategory.slice(1)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Price"
                    value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                    InputProps={{
                      startAdornment: '₹'
                    }}
                    size={isMobile ? "medium" : "medium"}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Discount Price"
                    value={editForm.discountPrice}
                    onChange={(e) => setEditForm({ ...editForm, discountPrice: e.target.value })}
                    InputProps={{
                      startAdornment: '₹'
                    }}
                    size={isMobile ? "medium" : "medium"}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Stock"
                    value={editForm.stock}
                    onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })}
                    size={isMobile ? "medium" : "medium"}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size={isMobile ? "medium" : "medium"}>
                    <InputLabel>Sizes</InputLabel>
                    <Select
                      multiple
                      value={editForm.sizes}
                      label="Sizes"
                      onChange={(e) => setEditForm({ ...editForm, sizes: e.target.value })}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => (
                            <Chip
                              key={value}
                              label={value}
                              size={isMobile ? "small" : "medium"}
                            />
                          ))}
                        </Box>
                      )}
                    >
                      {availableSizes.map(size => (
                        <MenuItem key={size} value={size}>
                          {size}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <Typography
                    variant={isMobile ? "body1" : "subtitle1"}
                    fontWeight={600}
                    gutterBottom
                  >
                    Current Images
                  </Typography>
                  <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: 'repeat(auto-fill, minmax(80px, 1fr))',
                      sm: 'repeat(auto-fill, minmax(100px, 1fr))',
                      md: 'repeat(auto-fill, minmax(120px, 1fr))'
                    },
                    gap: { xs: 1, sm: 1.5 },
                    mb: 2,
                    maxWidth: '100%'
                  }}>
                    {editForm.images.map((image, index) => (
                      <Box key={index} sx={{ position: 'relative' }}>
                        <Box
                          sx={{
                            position: 'relative',
                            width: '100%',
                            aspectRatio: '1',
                            borderRadius: 1,
                            overflow: 'hidden',
                            border: '1px solid',
                            borderColor: 'divider'
                          }}
                        >
                          <img
                            src={image}
                            alt={`Product ${index + 1}`}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: editForm.imageFit,
                              objectPosition: editForm.imagePosition,
                              transform: `scale(${editForm.imageScale})`,
                              transition: 'all 0.3s ease'
                            }}
                          />
                        </Box>
                        <IconButton
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: -8,
                            right: -8,
                            bgcolor: 'background.paper',
                            boxShadow: 1,
                            '&:hover': {
                              bgcolor: 'error.light',
                              color: 'white'
                            }
                          }}
                          onClick={() => handleRemoveExistingImage(index)}
                        >
                          <RemoveImageIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>

                  {/* Image Position Adjustment */}
                  <FormControl fullWidth sx={{ mb: 2 }} size={isMobile ? "medium" : "medium"}>
                    <InputLabel>Image Position</InputLabel>
                    <Select
                      value={editForm.imagePosition}
                      label="Image Position"
                      onChange={(e) => handleImagePositionChange(e.target.value)}
                    >
                      {positions.map(position => (
                        <MenuItem key={position} value={position}>
                          {position.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: 2 }}>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth size={isMobile ? "medium" : "medium"}>
                        <InputLabel>Image Fit</InputLabel>
                        <Select
                          value={editForm.imageFit}
                          label="Image Fit"
                          onChange={(e) => setEditForm(prev => ({
                            ...prev,
                            imageFit: e.target.value
                          }))}
                        >
                          <MenuItem value="cover">Cover</MenuItem>
                          <MenuItem value="contain">Contain</MenuItem>
                          <MenuItem value="fill">Fill</MenuItem>
                          <MenuItem value="scale-down">Scale Down</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography
                        gutterBottom
                        variant={isMobile ? "body2" : "body1"}
                        fontWeight={500}
                      >
                        Image Scale: {editForm.imageScale.toFixed(1)}x
                      </Typography>
                      <Box sx={{ px: { xs: 0, sm: 1 } }}>
                        <input
                          type="range"
                          min="0.1"
                          max="2"
                          step="0.1"
                          value={editForm.imageScale}
                          onChange={(e) => setEditForm(prev => ({
                            ...prev,
                            imageScale: parseFloat(e.target.value)
                          }))}
                          style={{
                            width: '100%',
                            height: isMobile ? '32px' : '24px',
                            cursor: 'pointer'
                          }}
                        />
                      </Box>
                    </Grid>
                  </Grid>

                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      mb: 2,
                      color: 'text.secondary',
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      lineHeight: 1.4
                    }}
                  >
                    Adjust image position, fit, and scale to control how products appear in the shop.
                    Use these controls to ensure your products are displayed optimally.
                  </Typography>

                  <Typography
                    variant={isMobile ? "body1" : "subtitle1"}
                    fontWeight={600}
                    gutterBottom
                  >
                    New Images
                  </Typography>
                  <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: 'repeat(auto-fill, minmax(80px, 1fr))',
                      sm: 'repeat(auto-fill, minmax(100px, 1fr))',
                      md: 'repeat(auto-fill, minmax(120px, 1fr))'
                    },
                    gap: { xs: 1, sm: 1.5 },
                    mb: 2,
                    maxWidth: '100%'
                  }}>
                    {editForm.newImages.map((image, index) => (
                      <Box key={index} sx={{ position: 'relative' }}>
                        <img
                          src={image.preview}
                          alt={`New ${index + 1}`}
                          style={{
                            width: '100%',
                            aspectRatio: '1',
                            objectFit: 'cover',
                            borderRadius: 4,
                            border: '1px solid #eee'
                          }}
                        />
                        <IconButton
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: -8,
                            right: -8,
                            bgcolor: 'background.paper',
                            boxShadow: 1,
                            '&:hover': {
                              bgcolor: 'error.light',
                              color: 'white'
                            }
                          }}
                          onClick={() => handleRemoveNewImage(index)}
                        >
                          <RemoveImageIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>

                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<UploadIcon />}
                    disabled={editForm.images.length + editForm.newImages.length >= 6}
                    fullWidth={isMobile}
                    size={isMobile ? "large" : "medium"}
                    sx={{
                      mb: 1,
                      py: { xs: 1.5, sm: 1 }
                    }}
                  >
                    {isMobile ? 'Upload New Images' : 'Upload Images'}
                    <input
                      type="file"
                      hidden
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </Button>
                  <Typography
                    variant="caption"
                    display="block"
                    sx={{
                      mt: 1,
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      color: 'text.secondary'
                    }}
                  >
                    Maximum 6 images allowed. {6 - (editForm.images.length + editForm.newImages.length)} slots remaining.
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions sx={{
            px: { xs: 2, sm: 3 },
            py: { xs: 2, sm: 2 },
            borderTop: '1px solid',
            borderColor: 'divider',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 1, sm: 1 }
          }}>
            {!isMobile && (
              <Button
                onClick={() => setEditDialog(false)}
                size={isMobile ? "large" : "medium"}
                sx={{
                  minWidth: { xs: '100%', sm: 'auto' },
                  order: { xs: 2, sm: 1 }
                }}
              >
                Cancel
              </Button>
            )}
            <Button
              onClick={handleEditSubmit}
              variant="contained"
              size={isMobile ? "large" : "medium"}
              fullWidth={isMobile}
              sx={{
                minWidth: { xs: '100%', sm: '120px' },
                order: { xs: 1, sm: 2 },
                py: { xs: 1.5, sm: 1 }
              }}
            >
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
  );
};

export default React.memo(ManageProducts); 