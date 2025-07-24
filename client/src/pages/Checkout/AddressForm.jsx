import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Grid,
  TextField,
  Button,
  Typography,
  FormControlLabel,
  Checkbox,
  MenuItem,
  FormHelperText,
  Alert,
} from '@mui/material';
import { setShippingAddress } from '../../store/slices/checkoutSlice';
import { updateProfile } from '../../store/slices/authSlice';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
];

const AddressForm = ({ initialValues, onNext }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  
  const defaultValues = {
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    street: user?.address?.street || '',
    addressLine2: user?.address?.addressLine2 || '',
    landmark: user?.address?.landmark || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    zipCode: user?.address?.zipCode || '',
    country: 'India',
    saveAddress: false
  };

  const [formData, setFormData] = useState({
    ...defaultValues,
    ...(initialValues || {})
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    // Full Name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    // Street validation
    if (!formData.street.trim()) {
      newErrors.street = 'Street address is required';
    }

    // City validation
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    // State validation
    if (!formData.state) {
      newErrors.state = 'Please select a state';
    }

    // ZIP Code validation
    const zipRegex = /^[0-9]{6}$/;
    if (!zipRegex.test(formData.zipCode)) {
      newErrors.zipCode = 'Please enter a valid 6-digit ZIP code';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'saveAddress' ? checked : value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      dispatch(setShippingAddress(formData));
      
      // If user wants to save the address, update their profile
      if (formData.saveAddress) {
        const addressData = {
          address: {
            street: formData.street,
            addressLine2: formData.addressLine2,
            landmark: formData.landmark,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode,
            country: formData.country
          }
        };
        dispatch(updateProfile(addressData));
      }
      
      onNext();
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
        Shipping Address
      </Typography>

      <Grid container spacing={3}>
        {/* Personal Information */}
        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            label="Full Name"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            error={!!errors.fullName}
            helperText={errors.fullName}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={!!errors.email}
            helperText={errors.email}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            label="Phone Number"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            error={!!errors.phone}
            helperText={errors.phone}
          />
        </Grid>

        {/* Address Information */}
        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            label="Street Address"
            name="street"
            value={formData.street}
            onChange={handleChange}
            error={!!errors.street}
            helperText={errors.street}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Address Line 2"
            name="addressLine2"
            value={formData.addressLine2}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Landmark"
            name="landmark"
            value={formData.landmark}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            label="City"
            name="city"
            value={formData.city}
            onChange={handleChange}
            error={!!errors.city}
            helperText={errors.city}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            select
            label="State"
            name="state"
            value={formData.state}
            onChange={handleChange}
            error={!!errors.state}
            helperText={errors.state}
          >
            {INDIAN_STATES.map((state) => (
              <MenuItem key={state} value={state}>
                {state}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            label="ZIP Code"
            name="zipCode"
            value={formData.zipCode}
            onChange={handleChange}
            error={!!errors.zipCode}
            helperText={errors.zipCode}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Country"
            name="country"
            value={formData.country}
            disabled
          />
        </Grid>

        {/* Save Address Checkbox */}
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                name="saveAddress"
                color="primary"
                checked={formData.saveAddress}
                onChange={handleChange}
              />
            }
            label="Save this address for future orders"
          />
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
        <Button
          type="submit"
          variant="contained"
          sx={{
            minWidth: 200,
            py: 1.5,
            textTransform: 'none',
            fontSize: '1.1rem'
          }}
        >
          Continue to Payment
        </Button>
      </Box>
    </Box>
  );
};

export default AddressForm; 