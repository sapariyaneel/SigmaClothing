import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../utils/axios';

// Async thunks for checkout operations
export const createOrder = createAsyncThunk(
  'checkout/createOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/orders', orderData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const initializePayment = createAsyncThunk(
  'checkout/initializePayment',
  async (paymentData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/payment/create-payment', paymentData);

      if (!response.data?.data?.id) {
        throw new Error('Invalid payment initialization response');
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to initialize payment' });
    }
  }
);

export const verifyPayment = createAsyncThunk(
  'checkout/verifyPayment',
  async (paymentData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/payment/verify-payment', paymentData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const initialState = {
  currentStep: 1,
  shippingAddress: null,
  orderSummary: null,
  paymentInfo: null,
};

const checkoutSlice = createSlice({
  name: 'checkout',
  initialState,
  reducers: {
    setStep: (state, action) => {
      state.currentStep = action.payload;
    },
    setShippingAddress: (state, action) => {
      state.shippingAddress = action.payload;
    },
    setOrderSummary: (state, action) => {
      state.orderSummary = action.payload;
    },
    setPaymentInfo: (state, action) => {
      state.paymentInfo = action.payload;
    },
    resetCheckout: () => initialState,
  },
  extraReducers: (builder) => {
    // Create Order
    builder
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orderId = action.payload.data._id;
        state.orderSummary = action.payload.data;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to create order';
      });

    // Initialize Payment
    builder
      .addCase(initializePayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initializePayment.fulfilled, (state, action) => {
        state.loading = false;
        state.razorpayOrder = action.payload.data.order;
      })
      .addCase(initializePayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to initialize payment';
      });

    // Verify Payment
    builder
      .addCase(verifyPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentInfo = {
          ...state.paymentInfo,
          status: 'completed',
          details: action.payload.data
        };
        if (action.payload.success) {
          state.isPaymentComplete = true;
        }
      })
      .addCase(verifyPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to verify payment';
      });
  },
});

export const {
  setStep,
  setShippingAddress,
  setOrderSummary,
  setPaymentInfo,
  resetCheckout,
} = checkoutSlice.actions;

export default checkoutSlice.reducer; 