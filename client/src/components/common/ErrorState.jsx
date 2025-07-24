import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { motion } from 'framer-motion';
import { Error as ErrorIcon } from '@mui/icons-material';

const ErrorState = ({
  message = 'Something went wrong',
  onRetry,
  showRetry = true,
}) => {
  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '200px',
        textAlign: 'center',
        p: 3,
      }}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          type: 'spring',
          stiffness: 260,
          damping: 20,
        }}
      >
        <ErrorIcon
          color="error"
          sx={{ fontSize: 64, mb: 2 }}
        />
      </motion.div>

      <Typography
        variant="h6"
        color="error"
        component={motion.p}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        gutterBottom
      >
        Oops!
      </Typography>

      <Typography
        variant="body1"
        color="text.secondary"
        component={motion.p}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        sx={{ mb: 3 }}
      >
        {message}
      </Typography>

      {showRetry && onRetry && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            variant="contained"
            onClick={onRetry}
            sx={{ minWidth: 120 }}
          >
            Try Again
          </Button>
        </motion.div>
      )}
    </Box>
  );
};

export default ErrorState; 