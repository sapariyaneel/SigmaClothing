import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Container, Grid, Typography, useMediaQuery, Drawer, IconButton } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { FilterList as FilterListIcon } from '@mui/icons-material';
import { useSearchParams } from 'react-router-dom';
import FilterSection from './FilterSection';
import SearchSort from './SearchSort';
import ProductCard from '../../components/common/ProductCard';
import { getProducts } from '../../store/slices/productSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useSearchFocus } from '../../hooks/useSearchFocus';

// Debounce helper function
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

const Shop = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [searchParams, setSearchParams] = useSearchParams();
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Use the search focus hook
  useSearchFocus();

  // Redux state
  const { products, loading, error } = useSelector((state) => state.products);

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    price: [0, 100000],
    sizes: searchParams.get('sizes')?.split(',').filter(Boolean) || [],
  });

  // Separate state for applied filters (the ones that trigger API calls)
  const [appliedFilters, setAppliedFilters] = useState(filters);

  // Debounced function to update URL params
  const debouncedUpdateURL = useCallback(
    debounce((newFilters) => {
      const params = new URLSearchParams();
      if (newFilters.category) params.set('category', newFilters.category);
      if (newFilters.sizes.length > 0) params.set('sizes', newFilters.sizes.join(','));
      setSearchParams(params, { replace: true }); // Use replace to avoid adding to browser history
    }, 500),
    [setSearchParams]
  );

  // Handle filter changes
  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
    setAppliedFilters(newFilters);
    debouncedUpdateURL(newFilters);
    // Close mobile filter menu after applying filters
    if (isMobile) {
      setMobileFilterOpen(false);
    }
  }, [debouncedUpdateURL, isMobile]);

  // Load products based on applied filters
  useEffect(() => {
    const queryParams = {
      category: appliedFilters.category,
      minPrice: appliedFilters.price[0],
      maxPrice: appliedFilters.price[1],
      size: appliedFilters.sizes.length > 0 ? appliedFilters.sizes : undefined,
      sort: sortBy,
      search: searchQuery,
      limit: 100
    };
    
    // Remove undefined values
    Object.keys(queryParams).forEach(key => 
      queryParams[key] === undefined && delete queryParams[key]
    );
    
    console.log('Fetching products with filters:', queryParams);
    dispatch(getProducts(queryParams));
  }, [dispatch, appliedFilters, sortBy, searchQuery]);

  // Filter products client-side for immediate feedback
  const filteredProducts = React.useMemo(() => {
    if (!Array.isArray(products)) return [];
    
    return products.filter(product => {
      // Size filter
      if (appliedFilters.sizes.length > 0) {
        if (!product.sizes || !product.sizes.some(size => appliedFilters.sizes.includes(size))) {
          return false;
        }
      }
      return true;
    });
  }, [products, appliedFilters.sizes]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Mobile Filter Toggle */}
      {isMobile && (
        <Box sx={{ mb: 2 }}>
          <IconButton
            onClick={() => setMobileFilterOpen(true)}
            sx={{ border: 1, borderColor: 'divider' }}
          >
            <FilterListIcon />
          </IconButton>
        </Box>
      )}

      {/* Search and Sort */}
      <SearchSort
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

      <Grid container spacing={4}>
        {/* Filter Section */}
        {!isMobile ? (
          <Grid item xs={12} md={3}>
            <FilterSection
              filters={filters}
              setFilters={handleFilterChange}
              priceRange={[0, 100000]}
            />
          </Grid>
        ) : (
          <Drawer
            anchor="left"
            open={mobileFilterOpen}
            onClose={() => setMobileFilterOpen(false)}
          >
            <Box sx={{ p: 2, width: 280 }}>
              <FilterSection
                filters={filters}
                setFilters={handleFilterChange}
                priceRange={[0, 100000]}
                onMobileClose={() => setMobileFilterOpen(false)}
              />
            </Box>
          </Drawer>
        )}

        {/* Products Grid */}
        <Grid item xs={12} md={9}>
          {filteredProducts.length === 0 ? (
            <Typography variant="h6" textAlign="center" sx={{ py: 8 }}>
              No products found
            </Typography>
          ) : (
            <Grid container spacing={3}>
              {filteredProducts.map((product) => (
                <Grid item xs={12} sm={6} md={4} key={product._id}>
                  <ProductCard product={product} />
                </Grid>
              ))}
            </Grid>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default Shop; 