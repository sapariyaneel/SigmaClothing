import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Grid,
  Typography,
  Button,
  Box, 
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  CircularProgress,
  Alert,
  Snackbar,
  Zoom,
  useTheme,
  useMediaQuery,
  Fab
} from '@mui/material';
import {
  FavoriteBorder as FavoriteBorderIcon,
  Favorite as FavoriteIcon,
  ShoppingCart as ShoppingCartIcon,
  ArrowBack as ArrowBackIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { getProduct } from '../../store/slices/productSlice';
import { addToCart } from '../../store/slices/cartSlice';
import { addToWishlist, removeFromWishlist } from '../../store/slices/wishlistSlice';
import { useSwipeable } from 'react-swipeable';
import { setStep } from '../../store/slices/checkoutSlice';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { items: wishlistItems } = useSelector((state) => state.wishlist);
  const { product, loading, error } = useSelector((state) => state.products);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [selectedSize, setSelectedSize] = useState('');
  const [mainImage, setMainImage] = useState('');
  const [thumbnails, setThumbnails] = useState([]);
  const [activeThumbIndex, setActiveThumbIndex] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [isZoomed, setIsZoomed] = useState(false);

  const isInWishlist = wishlistItems?.some((item) => item._id === id);

  useEffect(() => {
    dispatch(getProduct(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (product?.images?.length > 0) {
      setMainImage(product.images[0]);
      setThumbnails(product.images.slice(1));
      setActiveThumbIndex(0);
    } else {
      setMainImage('/placeholder.jpg');
      setThumbnails([]);
      setActiveThumbIndex(-1);
    }
  }, [product]);

  // Add scroll to top functionality
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.pageYOffset > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleImageZoom = (event) => {
    if (isMobile) return;
    
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;

    setZoomPosition({ x, y });
  };

  // Handle thumbnail click
  const handleThumbnailClick = (image, index) => {
    const oldMainImage = mainImage;
    setMainImage(image);
    
    setThumbnails(prevThumbnails => {
      const newThumbnails = [...prevThumbnails];
      newThumbnails[index] = oldMainImage;
      return newThumbnails;
    });
    setActiveThumbIndex(index);
  };

  // Handle swipe gestures for mobile
  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (thumbnails.length > 0) {
        const nextIndex = (activeThumbIndex + 1) % thumbnails.length;
        handleThumbnailClick(thumbnails[nextIndex], nextIndex);
      }
    },
    onSwipedRight: () => {
      if (thumbnails.length > 0) {
        const nextIndex = (activeThumbIndex - 1 + thumbnails.length) % thumbnails.length;
        handleThumbnailClick(thumbnails[nextIndex], nextIndex);
      }
    },
    preventDefaultTouchmoveEvent: true,
    trackMouse: true
  });

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!selectedSize && product.sizes?.length > 0) {
      setSnackbar({
        open: true,
        message: 'Please select a size',
        severity: 'error',
      });
      return;
    }

    try {
      await dispatch(addToCart({
        productId: id,
        quantity: 1,
        size: selectedSize
      })).unwrap();

      setSnackbar({
        open: true,
        message: 'Added to cart successfully',
        severity: 'success',
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to add to cart',
        severity: 'error',
      });
    }
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (isInWishlist) {
      try {
        await dispatch(removeFromWishlist(id)).unwrap();
        setSnackbar({
          open: true,
          message: 'Removed from wishlist',
          severity: 'success',
        });
      } catch (error) {
        console.error('Failed to remove from wishlist:', error);
        setSnackbar({
          open: true,
          message: error.message || 'Failed to remove from wishlist',
          severity: 'error',
        });
      }
      return;
    }

    try {
      const result = await dispatch(addToWishlist(id)).unwrap();
      if (result.message?.includes('already in')) {
        setSnackbar({
          open: true,
          message: 'Product is already in your wishlist',
          severity: 'info',
        });
      } else {
        setSnackbar({
          open: true,
          message: 'Added to wishlist',
          severity: 'success',
        });
      }
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message === 'Product already in wishlist') {
        setSnackbar({
          open: true,
          message: 'Product is already in your wishlist',
          severity: 'info',
        });
      } else {
        console.error('Failed to add to wishlist:', error);
        setSnackbar({
          open: true,
          message: error.message || 'Failed to add to wishlist',
          severity: 'error',
        });
      }
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!selectedSize && product.sizes?.length > 0) {
      setSnackbar({
        open: true,
        message: 'Please select a size',
        severity: 'error',
      });
      return;
    }

    try {
      // Add the current product to cart
      await dispatch(addToCart({
        productId: id,
        quantity: 1,
        size: selectedSize
      })).unwrap();

      // Reset checkout state to step 1
      dispatch(setStep(1));

      // Navigate to checkout with buyNow parameter
      navigate(`/checkout?buyNow=${id}`);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to process buy now',
        severity: 'error',
      });
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
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">Product not found</Alert>
      </Container>
    );
  }

  return (
    <>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper 
          elevation={0} 
          sx={{ 
            p: { xs: 0, md: 1 },
            background: 'linear-gradient(to bottom, #ffffff, #fafafa)',
            borderRadius: '16px',
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)'
          }}
        >
          <Grid container spacing={{ xs: 0, md: 2 }} alignItems="flex-start">
            {/* Product Images */}
            <Grid item xs={12} md={6} sx={{ 
              pt: { xs: 0, md: 0 }, 
              px: { xs: 0, md: 1 },
              display: 'flex',
              flexDirection: 'column',
              height: 'auto'
            }}>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', md: 'row' }, 
                gap: 2,
                height: 'auto',
                width: '100%'
              }}>
                {/* Main Image Container */}
                <Box 
                  {...handlers}
                  onMouseMove={!isMobile ? handleImageZoom : undefined}
                  onMouseEnter={!isMobile ? () => setIsZoomed(true) : undefined}
                  onMouseLeave={!isMobile ? () => setIsZoomed(false) : undefined}
                  onClick={() => setIsZoomed(false)}
                  sx={{ 
                    position: 'relative',
                    background: '#fff',
                    borderRadius: { xs: 0, md: '12px' },
                    overflow: 'hidden',
                    cursor: isMobile ? 'default' : 'grab',
                    '&:active': {
                      cursor: isMobile ? 'default' : 'grabbing'
                    },
                    width: '100%',
                    height: { xs: '300px', sm: '400px', md: '500px' },
                    order: { xs: 1, md: 2 },
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid',
                    borderColor: 'divider',
                    backdropFilter: 'blur(8px)',
                    boxShadow: 'none',
                    mx: 'auto',
                    mt: 0,
                    mb: { xs: 2, md: 0 },
                    p: 0
                  }}
                >
                  <AnimatePresence mode="sync">
                    <motion.div
                      key={`image-container-${mainImage}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{
                        position: 'relative',
                        width: '100%',
                        height: '100%',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'transparent',
                        margin: 0,
                        padding: 0
                      }}
                    >
                      <motion.img
                        key={`image-${mainImage}`}
                        src={mainImage}
                        alt={product?.name || 'Product Image'}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                          objectPosition: 'center',
                          background: 'transparent',
                          margin: 0,
                          padding: 0,
                          display: 'block',
                          transform: isZoomed ? `scale(2) translate(${(0.5 - zoomPosition.x) * 100}%, ${(0.5 - zoomPosition.y) * 100}%)` : 'scale(1)',
                          transition: isZoomed ? 'none' : 'transform 0.3s ease-out'
                        }}
                      />
                    </motion.div>
                  </AnimatePresence>
                </Box>

                {/* Thumbnails */}
                {thumbnails.length > 0 && (
                  <Box
                    sx={{
                      display: { xs: 'flex', md: 'block' },
                      flexDirection: { xs: 'row', md: 'column' },
                      gap: 2,
                      overflowX: { xs: 'auto', md: 'visible' },
                      overflowY: { xs: 'visible', md: 'auto' },
                      maxHeight: { xs: 'auto', md: '500px' },
                      order: { xs: 2, md: 1 },
                      width: { xs: '100%', md: '100px' },
                      pb: { xs: 2, md: 0 },
                      scrollbarWidth: 'none',
                      '&::-webkit-scrollbar': {
                        display: 'none'
                      },
                      msOverflowStyle: 'none'
                    }}
                  >
                    {thumbnails.map((image, index) => (
                      <Box
                        key={index}
                        onClick={() => handleThumbnailClick(image, index)}
                        sx={{
                          width: { xs: '80px', md: '100px' },
                          height: { xs: '80px', md: '100px' },
                          position: 'relative',
                          cursor: 'pointer',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          border: activeThumbIndex === index ? '2px solid' : '2px solid transparent',
                          borderColor: activeThumbIndex === index ? 'primary.main' : 'transparent',
                          boxShadow: activeThumbIndex === index 
                            ? '0 0 0 2px rgba(25, 118, 210, 0.2)' 
                            : '0 2px 8px rgba(0, 0, 0, 0.1)',
                          opacity: activeThumbIndex === index ? 1 : 0.7,
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            opacity: 1,
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                          },
                          p: 0,
                          m: 0,
                          flexShrink: 0,
                          background: '#fff'
                        }}
                      >
                        <img
                          src={image}
                          alt={`${product?.name || 'Product'} ${index + 1}`}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            objectPosition: 'center',
                            margin: 0,
                            padding: 0,
                            display: 'block'
                          }}
                        />
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            </Grid>

            {/* Product Info */}
            <Grid item xs={12} md={6} sx={{ 
              pt: { xs: 1, md: 0 }, 
              px: { xs: 2, md: 1 },
              height: 'auto',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <Box sx={{ p: { xs: 0, md: 1 } }}>
                <Typography 
                  variant="h4" 
                  gutterBottom
                  sx={{
                    fontWeight: 600,
                    color: '#1a1a1a',
                    fontSize: { xs: '1.75rem', md: '2.25rem' },
                    lineHeight: 1.2,
                    mb: 2
                  }}
                >
                  {product.name}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 3 }}>
                  <Typography 
                    variant="h5" 
                    sx={{
                      fontWeight: 600,
                      color: 'primary.main',
                      fontSize: { xs: '1.5rem', md: '1.75rem' }
                    }}
                  >
                    ₹{product.discountPrice || product.price}
                  </Typography>
                  {product.discountPrice && (
                    <Typography
                      component="span"
                      sx={{
                        textDecoration: 'line-through',
                        color: 'text.secondary',
                        ml: 2,
                        fontSize: '1.1rem'
                      }}
                    >
                      ₹{product.price}
                    </Typography>
                  )}
                </Box>

                <Typography 
                  variant="body1" 
                  sx={{
                    color: 'text.secondary',
                    lineHeight: 1.6,
                    mb: 4,
                    fontSize: '1rem'
                  }}
                >
                  {product.description}
                </Typography>

                {/* Size Selection */}
                {product.sizes?.length > 0 && (
                  <FormControl 
                    fullWidth 
                    sx={{ 
                      mb: 3,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px'
                      }
                    }}
                  >
                    <InputLabel>Select Size</InputLabel>
                    <Select
                      value={selectedSize}
                      onChange={(e) => setSelectedSize(e.target.value)}
                      label="Select Size"
                    >
                      {product.sizes.map((size) => (
                        <MenuItem key={size} value={size}>
                          {size}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}

                {/* Stock Status */}
                <Typography
                  variant="body2"
                  sx={{
                    mb: 3,
                    color: product.stock > 0 ? 'success.main' : 'error.main',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  <Box
                    component="span"
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: product.stock > 0 ? 'success.main' : 'error.main',
                      display: 'inline-block'
                    }}
                  />
                  {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                </Typography>

                {/* Action Buttons */}
                <Box 
                  sx={{ 
                    display: 'flex', 
                    gap: 2,
                    flexDirection: { xs: 'column', sm: 'row' }
                  }}
                >
                  <Button
                    variant="contained"
                    startIcon={<ShoppingCartIcon />}
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    fullWidth
                    sx={{
                      py: 1.5,
                      borderRadius: '8px',
                      textTransform: 'none',
                      fontSize: '1rem',
                      fontWeight: 500,
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 16px rgba(0, 0, 0, 0.15)'
                      },
                      transition: 'all 0.2s ease-in-out'
                    }}
                  >
                    Add to Cart
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleBuyNow}
                    disabled={product.stock === 0}
                    fullWidth
                    sx={{
                      py: 1.5,
                      borderRadius: '8px',
                      textTransform: 'none',
                      fontSize: '1rem',
                      fontWeight: 500,
                      background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                      boxShadow: '0 4px 12px rgba(33, 150, 243, 0.2)',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 16px rgba(33, 150, 243, 0.3)'
                      },
                      transition: 'all 0.2s ease-in-out'
                    }}
                  >
                    Buy Now
                  </Button>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ 
              width: '100%',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>

      {/* Scroll to Top FAB */}
      <Zoom in={showScrollTop}>
        <Fab
          color="primary"
          size="medium"
          aria-label="scroll back to top"
          onClick={handleScrollTop}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)'
            },
            transition: 'all 0.2s ease-in-out'
          }}
        >
          <KeyboardArrowUpIcon />
        </Fab>
      </Zoom>
    </>
  );
};

export default ProductDetail; 