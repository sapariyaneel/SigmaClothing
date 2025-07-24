import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Container, Grid, Typography, useMediaQuery, Drawer, IconButton } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { FilterList as FilterListIcon } from '@mui/icons-material';
import { useSearchParams } from 'react-router-dom';
import { debounce } from 'lodash';
import FilterSection from './FilterSection';
import SearchSort from './SearchSort';
import ProductCard from '../../components/common/ProductCard';
import { getProducts } from '../../store/slices/productSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useSearchFocus } from '../../hooks/useSearchFocus';

// Global state to prevent duplicate fetches across component instances
let globalFetchState = {
  lastParams: null,
  isLoading: false,
  timestamp: 0
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
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);
  const fetchTimeoutRef = useRef(null);
  const lastFetchParamsRef = useRef(null);
  const isMountedRef = useRef(true);

  // Debounced function to update URL params
  const debouncedUpdateURL = useCallback(
    debounce((newFilters) => {
      const params = new URLSearchParams(window.location.search);
      if (newFilters.category) {
        params.set('category', newFilters.category);
      } else {
        params.delete('category');
      }
      if (newFilters.sizes.length > 0) {
        params.set('sizes', newFilters.sizes.join(','));
      } else {
        params.delete('sizes');
      }
      // Use history.replaceState to update URL without refresh
      window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`);
    }, 500),
    []
  );

  // Handle filter changes
  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
    debouncedUpdateURL(newFilters);
    // Close mobile filter menu after applying filters
    if (isMobile) {
      setMobileFilterOpen(false);
    }
  }, [debouncedUpdateURL, isMobile]);

  // Load products based on filters
  useEffect(() => {
    // Clear any existing timeout
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }

    const queryParams = {
      category: filters.category,
      minPrice: filters.price[0],
      maxPrice: filters.price[1],
      size: filters.sizes.length > 0 ? filters.sizes : undefined,
      sort: sortBy,
      search: searchQuery,
      limit: 100
    };

    // Remove undefined values
    Object.keys(queryParams).forEach(key =>
      queryParams[key] === undefined && delete queryParams[key]
    );

    // Create a string representation of params to compare
    const paramsString = JSON.stringify(queryParams);
    const now = Date.now();

    // Check if we've already fetched with these exact parameters recently (within 1 second)
    if (lastFetchParamsRef.current === paramsString ||
        (globalFetchState.lastParams === paramsString &&
         globalFetchState.isLoading) ||
        (globalFetchState.lastParams === paramsString &&
         now - globalFetchState.timestamp < 1000)) {
      return;
    }

    // Mark that we've attempted to fetch
    setHasAttemptedFetch(true);

    // Use a timeout to debounce and store the timeout ID in ref
    fetchTimeoutRef.current = setTimeout(() => {
      // Double-check that component is still mounted and params haven't changed
      if (isMountedRef.current &&
          lastFetchParamsRef.current !== paramsString &&
          globalFetchState.lastParams !== paramsString &&
          !globalFetchState.isLoading) {

        // Update both local and global state
        lastFetchParamsRef.current = paramsString;
        globalFetchState.lastParams = paramsString;
        globalFetchState.isLoading = true;
        globalFetchState.timestamp = Date.now();

        dispatch(getProducts(queryParams)).finally(() => {
          globalFetchState.isLoading = false;
        });
      }
      fetchTimeoutRef.current = null;
    }, 300);

    // Cleanup timeout on dependency change or unmount
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
        fetchTimeoutRef.current = null;
      }
    };
  }, [dispatch, filters, sortBy, searchQuery]);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
        fetchTimeoutRef.current = null;
      }
      // Reset fetch tracking on unmount
      lastFetchParamsRef.current = null;
    };
  }, []);

  // Filter products client-side for immediate feedback
  const filteredProducts = React.useMemo(() => {
    if (!Array.isArray(products)) return [];

    return products.filter(product => {
      // Size filter
      if (filters.sizes.length > 0) {
        if (!product.sizes || !product.sizes.some(size => filters.sizes.includes(size))) {
          return false;
        }
      }
      return true;
    });
  }, [products, filters.sizes]);

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

        {/* Products Grid with Loading State */}
        <Grid item xs={12} md={9}>
          {loading || !hasAttemptedFetch ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
              <LoadingSpinner />
            </Box>
          ) : filteredProducts.length === 0 ? (
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