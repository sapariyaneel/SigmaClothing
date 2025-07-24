import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../utils/axios';

// Validate coupon
export const validateCoupon = createAsyncThunk(
  'coupon/validateCoupon',
  async (couponCode, { rejectWithValue }) => {
    try {
      const response = await axios.post('/coupons/validate', {
        code: couponCode
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Invalid coupon code');
    }
  }
);

const couponSlice = createSlice({
  name: 'coupon',
  initialState: {
    appliedCoupon: null,
    discountAmount: 0,
    loading: false,
    error: null
  },
  reducers: {
    clearCoupon: (state) => {
      state.appliedCoupon = null;
      state.discountAmount = 0;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(validateCoupon.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(validateCoupon.fulfilled, (state, action) => {
        state.loading = false;
        state.appliedCoupon = action.payload.data.coupon;
        state.discountAmount = action.payload.data.discountAmount;
        state.error = null;
      })
      .addCase(validateCoupon.rejected, (state, action) => {
        state.loading = false;
        state.appliedCoupon = null;
        state.discountAmount = 0;
        state.error = action.payload;
      });
  }
});

export const { clearCoupon, clearError } = couponSlice.actions;
export default couponSlice.reducer;
