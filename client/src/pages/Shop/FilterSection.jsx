import React, { useCallback, useState } from 'react';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
  FormControlLabel,
  Slider,
  Radio,
  RadioGroup,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { motion, AnimatePresence } from 'framer-motion';
import { debounce } from 'lodash';

const FilterSection = ({
  filters,
  setFilters,
  categories = ['men', 'women', 'accessories'],
  sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  priceRange = [0, 100000],
  onMobileClose
}) => {
  // Local state for price to handle immediate UI updates
  const [localPrice, setLocalPrice] = useState(filters.price);

  // Debounced function to update actual filters
  const debouncedPriceChange = useCallback(
    debounce((newValue) => {
      setFilters(prev => ({ ...prev, price: newValue }));
      if (onMobileClose) {
        onMobileClose();
      }
    }, 500),
    [setFilters, onMobileClose]
  );

  const handlePriceChange = (event, newValue) => {
    // Update local state immediately for UI responsiveness
    setLocalPrice(newValue);
    // Debounce the actual filter update
    debouncedPriceChange(newValue);
  };

  const handleCategoryChange = useCallback((event) => {
    setFilters(prev => ({ 
      ...prev, 
      category: event.target.value,
      // Clear sizes when switching to accessories
      sizes: event.target.value === 'accessories' ? [] : prev.sizes
    }));
    if (onMobileClose) {
      onMobileClose();
    }
  }, [setFilters, onMobileClose]);

  const handleSizeChange = useCallback((size) => {
    setFilters(prev => {
      const newSizes = prev.sizes.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size];
      return {
        ...prev,
        sizes: newSizes
      };
    });
    if (onMobileClose) {
      onMobileClose();
    }
  }, [setFilters, onMobileClose]);

  return (
    <Box sx={{ width: '100%', maxWidth: 280 }}>
      {/* Category Filter */}
      <motion.div
        key="category-filter"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.2 }}
        style={{ marginBottom: '16px' }}
      >
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Category</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <RadioGroup
              value={filters.category}
              onChange={handleCategoryChange}
            >
              <FormControlLabel
                value=""
                control={<Radio />}
                label="All"
              />
              <AnimatePresence>
                {categories.map((category) => (
                  <motion.div
                    key={`category-${category}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <FormControlLabel
                      value={category}
                      control={<Radio />}
                      label={category.charAt(0).toUpperCase() + category.slice(1)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </RadioGroup>
          </AccordionDetails>
        </Accordion>
      </motion.div>

      {/* Price Filter */}
      <motion.div
        key="price-filter"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.2, delay: 0.1 }}
        style={{ marginBottom: '16px' }}
      >
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Price Range</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ px: 2 }}>
              <Slider
                value={localPrice}
                onChange={handlePriceChange}
                valueLabelDisplay="auto"
                min={priceRange[0]}
                max={priceRange[1]}
                step={1000}
                valueLabelFormat={(value) => `₹${value.toLocaleString()}`}
                sx={{
                  '& .MuiSlider-thumb': {
                    height: 24,
                    width: 24,
                    '&:hover, &.Mui-focusVisible': {
                      boxShadow: '0 0 0 8px rgba(0, 0, 0, 0.16)'
                    }
                  }
                }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  ₹{localPrice[0].toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ₹{localPrice[1].toLocaleString()}
                </Typography>
              </Box>
            </Box>
          </AccordionDetails>
        </Accordion>
      </motion.div>

      {/* Size Filter */}
      <AnimatePresence>
        {(!filters.category || filters.category !== 'accessories') && (
          <motion.div
            key="size-filter"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2, delay: 0.2 }}
            style={{ marginBottom: '16px' }}
          >
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">Size</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <AnimatePresence>
                    {sizes.map((size) => (
                      <motion.div
                        key={`size-${size}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={filters.sizes.includes(size)}
                              onChange={() => handleSizeChange(size)}
                            />
                          }
                          label={size}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </Box>
              </AccordionDetails>
            </Accordion>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default React.memo(FilterSection); 