import React, { useCallback } from 'react';
import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  InputAdornment,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { debounce } from 'lodash';

const SearchSort = ({ searchQuery, setSearchQuery, sortBy, setSortBy }) => {
  // Debounced search handler
  const debouncedSearch = useCallback(
    debounce((value) => {
      setSearchQuery(value);
    }, 500),
    [setSearchQuery]
  );

  const handleSearchChange = (event) => {
    const { value } = event.target;
    // Update the input value immediately for UI responsiveness
    event.target.value = value;
    // Debounce the actual search
    debouncedSearch(value);
  };

  const handleSortChange = (event) => {
    setSortBy(event.target.value);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        mb: 4,
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { sm: 'center' },
      }}
    >
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search products..."
        onChange={handleSearchChange}
        defaultValue={searchQuery}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        sx={{ flex: 1 }}
      />

      <FormControl sx={{ minWidth: 200 }}>
        <InputLabel>Sort By</InputLabel>
        <Select
          value={sortBy}
          label="Sort By"
          onChange={handleSortChange}
        >
          <MenuItem value="newest">Newest First</MenuItem>
          <MenuItem value="price_low">Price: Low to High</MenuItem>
          <MenuItem value="price_high">Price: High to Low</MenuItem>
          <MenuItem value="popularity">Popularity</MenuItem>
          <MenuItem value="discount">Biggest Discount</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
};

export default SearchSort; 