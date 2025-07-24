import React from 'react';
import { Box, Toolbar } from '@mui/material';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = ({ children }) => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: '100vh'
      }}
    >
      <Navbar />
      <Toolbar 
        sx={{ 
          mb: isHomePage ? 0 : { xs: 1, sm: 2, md: 3 },
          minHeight: { xs: '56px', sm: '64px' }
        }} 
      />
      <Box
        component="main"
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          px: { xs: 2, sm: 3, md: 4 },
          pb: { xs: 4, sm: 6, md: 8 }
        }}
      >
        {children}
      </Box>
      <Footer />
    </Box>
  );
};

export default Layout; 