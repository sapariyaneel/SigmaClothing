import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  message: '',
  severity: 'success', // 'success' | 'error' | 'warning' | 'info'
  open: false,
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    showNotification: (state, action) => {
      state.message = action.payload.message;
      state.severity = action.payload.severity || 'success';
      state.open = true;
    },
    clearNotification: (state) => {
      state.open = false;
    },
  },
});

export const { showNotification, clearNotification } = notificationSlice.actions;
export default notificationSlice.reducer; 