import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import {
  Container,
  TextField,
  Grid,
  Typography,
  Box,
  InputAdornment,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { getProducts } from '../../store/slices/productSlice';
import ProductCard from '../../components/common/ProductCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const Search = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const { products, loading, error } = useSelector((state) => state.products);

  useEffect(() => {
    if (searchQuery) {
      dispatch(getProducts({ search: searchQuery }));
    }
  }, [dispatch, searchQuery]);

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setSearchParams(query ? { q: query } : {});
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search for products..."
          value={searchQuery}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {error ? (
        <Typography color="error">{error}</Typography>
      ) : searchQuery && products.length === 0 ? (
        <EmptyState
          title="No Products Found"
          message="Try searching with different keywords"
        />
      ) : products.length > 0 ? (
        <Grid container spacing={3}>
          {products.map((product) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
              <ProductCard product={product} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <EmptyState
          title="Start Searching"
          message="Enter keywords to search for products"
        />
      )}
    </Container>
  );
};

export default Search; 