import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Alert,
  IconButton,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  ArrowBack as BackIcon,
} from '@mui/icons-material';
import axios from '../../utils/axios';
import { useSelectFix } from '../../hooks/useFocusManagement';

const AddProduct = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [images, setImages] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    subCategory: '',
    price: '',
    discountPrice: '',
    sizes: [],
    stock: '',
    tags: []
  });

  // Apply select focus fix for dropdown components
  useSelectFix();

  const categories = ['men', 'women', 'accessories'];
  const subCategories = {
    men: ['shirts', 'pants', 't-shirts', 'jeans', 'jackets'],
    women: ['dresses', 'tops', 'pants', 'skirts', 'jackets'],
    accessories: ['bags', 'jewelry', 'watches', 'belts', 'sunglasses']
  };
  const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      // If changing category to accessories, clear sizes
      if (name === 'category' && value === 'accessories') {
        return {
          ...prev,
          [name]: value,
          sizes: []
        };
      }
      return {
        ...prev,
        [name]: value
      };
    });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 6) {
      setError('Maximum 6 images allowed');
      return;
    }

    const processImage = (file) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          // Calculate dimensions for 9:16 aspect ratio
          let targetWidth = img.width;
          let targetHeight = (img.width * 16) / 9;

          // If the resulting height is greater than the original image height,
          // calculate based on height instead
          if (targetHeight > img.height) {
            targetHeight = img.height;
            targetWidth = (img.height * 9) / 16;
          }

          // Set canvas size to desired dimensions
          canvas.width = targetWidth;
          canvas.height = targetHeight;

          // Calculate positioning to center the image
          const offsetX = (img.width - targetWidth) / 2;
          const offsetY = (img.height - targetHeight) / 2;

          // Draw image centered in the 9:16 canvas
          ctx.drawImage(img, 
            offsetX, offsetY, targetWidth, targetHeight, // Source rectangle
            0, 0, targetWidth, targetHeight // Destination rectangle
          );

          // Convert to blob
          canvas.toBlob((blob) => {
            resolve({
              file: new File([blob], file.name, { type: 'image/jpeg' }),
              preview: URL.createObjectURL(blob)
            });
          }, 'image/jpeg', 0.9);
        };
        img.src = URL.createObjectURL(file);
      });
    };

    // Process all images
    Promise.all(files.map(processImage))
      .then(newImages => {
        setImages(prev => {
          const updatedImages = [...prev, ...newImages];
          if (updatedImages.length > 6) {
            setError('Maximum 6 images allowed');
            return prev;
          }
          return updatedImages;
        });
      });
  };

  const handleRemoveImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validate sizes for non-accessories
    if (formData.category !== 'accessories' && formData.sizes.length === 0) {
      setError('Please select at least one size for non-accessory products');
      setLoading(false);
      return;
    }

    try {
      const productData = new FormData();
      Object.keys(formData).forEach(key => {
        if (Array.isArray(formData[key])) {
          formData[key].forEach(value => {
            productData.append(key + '[]', value);
          });
        } else {
          productData.append(key, formData[key]);
        }
      });

      // Append images
      images.forEach(image => {
        productData.append('images', image.file);
      });

      const response = await axios.post('/admin/products', productData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccess('Product added successfully');
      setTimeout(() => {
        navigate('/admin/products');
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={0} sx={{ p: 4, border: 1, borderColor: 'divider' }}>
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate('/admin/products')}>
            <BackIcon />
          </IconButton>
          <Typography variant="h4">Add New Product</Typography>
        </Box>

        {(error || success) && (
          <Alert 
            severity={error ? "error" : "success"} 
            sx={{ mb: 3 }}
            onClose={() => {
              setError('');
              setSuccess('');
            }}
          >
            {error || success}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Product Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel id="category-label">Category</InputLabel>
                <Select
                  labelId="category-label"
                  id="category-select"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  label="Category"
                  MenuProps={{
                    disableRestoreFocus: false,
                    disableEnforceFocus: false,
                    disableAutoFocus: true,
                  }}
                >
                  {categories.map(category => (
                    <MenuItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {formData.category && (
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel id="subcategory-label">Sub Category</InputLabel>
                  <Select
                    labelId="subcategory-label"
                    id="subcategory-select"
                    name="subCategory"
                    value={formData.subCategory}
                    onChange={handleChange}
                    label="Sub Category"
                    MenuProps={{
                      disableRestoreFocus: false,
                      disableEnforceFocus: false,
                      disableAutoFocus: true,
                    }}
                  >
                    {subCategories[formData.category].map(subCategory => (
                      <MenuItem key={subCategory} value={subCategory}>
                        {subCategory.charAt(0).toUpperCase() + subCategory.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: '₹'
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Discount Price"
                name="discountPrice"
                value={formData.discountPrice}
                onChange={handleChange}
                InputProps={{
                  startAdornment: '₹'
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Stock"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
              />
            </Grid>

            {formData.category && formData.category !== 'accessories' && (
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Sizes</InputLabel>
                  <Select
                    multiple
                    name="sizes"
                    value={formData.sizes}
                    onChange={handleChange}
                    label="Sizes"
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} />
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
            )}

            <Grid item xs={12}>
              <Box sx={{ mb: 2 }}>
                <input
                  accept="image/*"
                  type="file"
                  id="image-upload"
                  multiple
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
                <label htmlFor="image-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<UploadIcon />}
                  >
                    Upload Images (Max 6)
                  </Button>
                </label>
              </Box>

              <Grid container spacing={2}>
                {images.map((image, index) => (
                  <Grid item key={index}>
                    <Box sx={{ position: 'relative' }}>
                      <img
                        src={image.preview}
                        alt={`Preview ${index + 1}`}
                        style={{
                          width: 100,
                          height: 100,
                          objectFit: 'cover',
                          borderRadius: 4
                        }}
                      />
                      <IconButton
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: -8,
                          right: -8,
                          bgcolor: 'background.paper'
                        }}
                        onClick={() => handleRemoveImage(index)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/admin/products')}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading || images.length === 0}
                  startIcon={loading ? <CircularProgress size={20} /> : null}
                >
                  Add Product
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default AddProduct; 