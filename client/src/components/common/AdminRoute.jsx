import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Box, CircularProgress } from '@mui/material';

const AdminRoute = ({ children }) => {
  const { user, loading, isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  useEffect(() => {
    // Only set hasCheckedAuth to true after the initial auth check is complete
    if (!loading) {
      setHasCheckedAuth(true);
    }
  }, [loading]);

  useEffect(() => {
    // Only redirect if we've completed the initial auth check and user is not admin
    if (hasCheckedAuth && (!isAuthenticated || !user || user.role !== 'admin')) {
      navigate('/login', { state: { from: location } });
    }
  }, [user, hasCheckedAuth, isAuthenticated, navigate, location]);

  // Show loading while checking authentication or if we haven't checked auth yet
  if (loading || !hasCheckedAuth) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Only render children if user is authenticated and is admin
  return isAuthenticated && user && user.role === 'admin' ? children : null;
};

export default AdminRoute; 