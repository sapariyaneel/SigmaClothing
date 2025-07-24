import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../utils/axios';

// Create order
export const createOrder = createAsyncThunk(
    'order/createOrder',
    async (orderData, { rejectWithValue }) => {
        try {
            const response = await axios.post('/orders', orderData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

// Verify payment
export const verifyPayment = createAsyncThunk(
    'order/verifyPayment',
    async (paymentData, { rejectWithValue }) => {
        try {
            const response = await axios.post('/orders/verify-payment', paymentData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

// Get user orders
export const getUserOrders = createAsyncThunk(
    'order/getUserOrders',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get('/orders/my-orders');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

// Get single order
export const getOrder = createAsyncThunk(
    'order/getOrder',
    async (orderId, { rejectWithValue }) => {
        try {
            const response = await axios.get(`/orders/${orderId}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

// Cancel order
export const cancelOrder = createAsyncThunk(
    'order/cancelOrder',
    async (orderId, { rejectWithValue }) => {
        try {
            const response = await axios.post(`/orders/${orderId}/cancel`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

const initialState = {
    orders: [],
    currentOrder: null,
    loading: false,
    error: null,
    success: false
};

const orderSlice = createSlice({
    name: 'order',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearSuccess: (state) => {
            state.success = false;
        },
        resetCurrentOrder: (state) => {
            state.currentOrder = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Create order
            .addCase(createOrder.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createOrder.fulfilled, (state, action) => {
                state.loading = false;
                state.currentOrder = action.payload.data;
                state.success = true;
            })
            .addCase(createOrder.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload.message;
            })

            // Verify payment
            .addCase(verifyPayment.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(verifyPayment.fulfilled, (state, action) => {
                state.loading = false;
                state.currentOrder = action.payload.data;
                state.success = true;
            })
            .addCase(verifyPayment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload.message;
            })

            // Get user orders
            .addCase(getUserOrders.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getUserOrders.fulfilled, (state, action) => {
                state.loading = false;
                state.orders = action.payload.data;
            })
            .addCase(getUserOrders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload.message;
            })

            // Get single order
            .addCase(getOrder.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getOrder.fulfilled, (state, action) => {
                state.loading = false;
                state.currentOrder = action.payload.data;
            })
            .addCase(getOrder.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload.message;
            })

            // Cancel order
            .addCase(cancelOrder.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(cancelOrder.fulfilled, (state, action) => {
                state.loading = false;
                state.currentOrder = action.payload.data;
                state.orders = state.orders.map(order =>
                    order._id === action.payload.data._id ? action.payload.data : order
                );
                state.success = true;
            })
            .addCase(cancelOrder.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload.message;
            });
    }
});

export const { clearError, clearSuccess, resetCurrentOrder } = orderSlice.actions;

export default orderSlice.reducer; 