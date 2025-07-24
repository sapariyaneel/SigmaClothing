import React from 'react';
import { Snackbar, Alert } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { clearNotification } from '../../store/slices/notificationSlice';

const Notification = () => {
  const dispatch = useDispatch();
  const { message, severity, open } = useSelector((state) => state.notification);

  const handleClose = () => {
    dispatch(clearNotification());
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={3000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      sx={{
        marginTop: '70px', // Add margin to position below navbar
      }}
    >
      <Alert
        onClose={handleClose}
        severity={severity}
        variant="filled"
        sx={{ width: '100%' }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default Notification; 