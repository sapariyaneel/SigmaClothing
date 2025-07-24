import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../utils/axios';

// Create async thunks for authentication actions
export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        return rejectWithValue('No token found');
      }

      // Use server-side authentication check for all users
      const response = await axios.get('/auth/me');

      // If it's an admin user, also store admin data for compatibility
      if (response.data.success && response.data.data.user.role === 'admin') {
        const adminData = {
          user: response.data.data.user,
          token: response.data.data.token || token
        };
        localStorage.setItem('adminData', JSON.stringify(adminData));
      }

      return response.data;
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('adminData');
      return rejectWithValue(error.response?.data || { message: 'Authentication failed' });
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      // Use server-side authentication for all users including admin
      const response = await axios.post('/auth/login', credentials);

      // Store token in localStorage
      if (response.data.success) {
        localStorage.setItem('token', response.data.data.token);

        // If it's an admin user, also store admin data for compatibility
        if (response.data.data.user.role === 'admin') {
          const adminData = {
            user: response.data.data.user,
            token: response.data.data.token
          };
          localStorage.setItem('adminData', JSON.stringify(adminData));
        }
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Invalid email or password' });
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Registration failed' });
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('adminData');
      
      // Call the logout endpoint
      await axios.post('/auth/logout');
      
      // Clear other related states if needed
      // For example, clear cart, wishlist, etc.
      
      return null;
    } catch (error) {
      // Even if the API call fails, we should still clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('adminData');
      return rejectWithValue(error.response?.data || { message: 'Logout failed' });
    }
  }
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email, { rejectWithValue }) => {
    try {
      const response = await axios.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Password reset request failed' });
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ token, password }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/auth/reset-password/${token}`, { password });
      
      // Store token in localStorage if reset was successful
      if (response.data.success && response.data.data?.token) {
        localStorage.setItem('token', response.data.data.token);
      }
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Password reset failed' });
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (userData, { rejectWithValue }) => {
    try {
      // Remove email from userData as it cannot be updated
      const { email, ...updateData } = userData;
      const response = await axios.put('/users/profile', updateData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Profile update failed' });
    }
  }
);

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  loading: !!localStorage.getItem('token'), // Set loading to true if token exists
  error: null,
  isAuthenticated: false
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      state.user = {
        ...user,
        address: user.address || {} // Ensure address is always an object
      };
      state.token = token;
      state.isAuthenticated = true;
      state.error = null;
      localStorage.setItem('token', token);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('token');
      localStorage.removeItem('adminData');
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        // Extract user and token from the correct response structure
        const { user, token } = action.payload.data;
        state.user = {
          ...user,
          address: user.address || {} // Ensure address is always an object
        };
        state.token = token;
        state.isAuthenticated = true;
        state.loading = false;
        state.error = null;
        localStorage.setItem('token', token);
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Invalid email or password';
        state.isAuthenticated = false;
      })
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data.user;
        state.token = action.payload.data.token;
        state.isAuthenticated = true;
        localStorage.setItem('token', action.payload.data.token);
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      // Logout
      .addCase(logout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message;
        // Still clear the state even if the API call fails
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })
      // Forgot Password
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'An error occurred';
      })
      // Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.data?.user && action.payload.data?.token) {
          state.user = action.payload.data.user;
          state.token = action.payload.data.token;
          state.isAuthenticated = true;
        }
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Password reset failed';
      })
      // Check Auth
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false;
        // Ensure we're getting the user data from the correct path in the response
        const userData = action.payload.data.user;
        state.user = {
          ...userData,
          address: userData.address || {},
          phone: userData.phone || '',
          gender: userData.gender || '',
          profilePicture: userData.profilePicture || '',
          wishlist: userData.wishlist || []
        };
        state.token = action.payload.data.token;
        state.isAuthenticated = true;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        localStorage.removeItem('token');
        localStorage.removeItem('adminData');
      })
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        // Handle both direct user data and nested data structures
        const userData = action.payload._doc || action.payload;
        if (userData) {
          state.user = {
            ...state.user,
            ...userData,
            address: userData.address || state.user?.address || {},
            phone: userData.phone || state.user?.phone || '',
            gender: userData.gender || state.user?.gender || '',
            profilePicture: userData.profilePicture || state.user?.profilePicture || '',
            wishlist: userData.wishlist || state.user?.wishlist || []
          };
        }
        state.loading = false;
        state.error = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update profile';
      });
  }
});

export const { clearError, setCredentials } = authSlice.actions;
export default authSlice.reducer; 