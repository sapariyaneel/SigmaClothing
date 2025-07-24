import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../utils/axios';

// Async thunks
export const getProducts = createAsyncThunk(
  'products/getProducts',
  async (params, { rejectWithValue }) => {
    try {
      // If sizes is already a string, don't split it again
      const queryParams = {
        ...params,
        limit: 100 // Set a high limit to get all products
      };

      const response = await axios.get('/products', { params: queryParams });
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch products');
    }
  }
);

export const getProduct = createAsyncThunk(
  'products/getProduct',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch product');
    }
  }
);

// Initial state
const initialState = {
  products: [],
  product: null,
  loading: false,
  error: null,
  totalProducts: 0,
  currentPage: 1,
  totalPages: 1,
};

// Slice
const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearProduct: (state) => {
      state.product = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Products
      .addCase(getProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.data || [];
        state.totalProducts = action.payload.total || 0;
        state.currentPage = action.payload.page || 1;
        state.totalPages = action.payload.pages || 1;
      })
      .addCase(getProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Single Product
      .addCase(getProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.product = action.payload.data;
      })
      .addCase(getProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearProduct } = productSlice.actions;

export default productSlice.reducer; 