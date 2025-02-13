import React, { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  TextField,
  Button,
  IconButton,
  Link,
  Divider,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Email as EmailIcon,
  GitHub as GitHubIcon,
  Twitter as TwitterIcon,
  LinkedIn as LinkedInIcon,
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleSubscribe = (e) => {
    e.preventDefault();
    // This will be replaced with actual newsletter subscription logic
    setSnackbar({
      open: true,
      message: 'Thank you for subscribing to our newsletter!',
      severity: 'success',
    });
    setEmail('');
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'primary.main',
        color: 'primary.contrastText',
        borderTop: 1,
        borderColor: 'divider',
        py: { xs: 4, md: 6 },
        mt: 0
      }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={{ xs: 4, md: 8 }}>
          {/* Brand Section */}
          <Grid item xs={12} md={4}>
            <Typography
              variant="h6"
              component={RouterLink}
              to="/"
              sx={{
                textDecoration: 'none',
                color: 'primary.contrastText',
                fontWeight: 700,
                letterSpacing: 1,
                display: 'block',
                mb: { xs: 2, md: 3 },
              }}
            >
              SIGMA CLOTHING
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                mb: { xs: 2, md: 3 }, 
                color: 'rgba(255, 255, 255, 0.7)',
                maxWidth: { sm: '80%', md: '100%' }
              }}
            >
              Elevating everyday fashion with premium quality and timeless designs.
              Join us in our journey towards sustainable and stylish clothing.
            </Typography>
            <Box sx={{ display: 'flex', gap: { xs: 1, sm: 2 } }}>
              <IconButton
                href="mailto:sigmaclothingog@gmail.com"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ 
                  color: 'primary.contrastText',
                  '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' }
                }}
              >
                <EmailIcon />
              </IconButton>
              <IconButton
                href="https://github.com/sapariyaneel"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ 
                  color: 'primary.contrastText',
                  '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' }
                }}
              >
                <GitHubIcon />
              </IconButton>
              <IconButton
                href="https://x.com/sapariyaneel_"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ 
                  color: 'primary.contrastText',
                  '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' }
                }}
              >
                <TwitterIcon />
              </IconButton>
              <IconButton
                href="https://www.linkedin.com/in/neelsapariya/"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ 
                  color: 'primary.contrastText',
                  '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' }
                }}
              >
                <LinkedInIcon />
              </IconButton>
            </Box>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={6} sm={6} md={2}>
            <Typography 
              variant="h6" 
              gutterBottom 
              color="primary.contrastText"
              sx={{ mb: { xs: 2, md: 3 } }}
            >
              Quick Links
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1, md: 1.5 } }}>
              {[
                { text: 'Home', path: '/' },
                { text: 'Shop', path: '/shop' },
                { text: 'About Us', path: '/about' },
                { text: 'Contact', path: '/contact' },
              ].map((link) => (
                <Link
                  key={link.text}
                  component={RouterLink}
                  to={link.path}
                  sx={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    textDecoration: 'none',
                    '&:hover': { color: 'primary.contrastText' },
                    fontSize: { xs: '0.875rem', md: '1rem' }
                  }}
                >
                  {link.text}
                </Link>
              ))}
            </Box>
          </Grid>

          {/* Categories */}
          <Grid item xs={6} sm={6} md={2}>
            <Typography 
              variant="h6" 
              gutterBottom 
              color="primary.contrastText"
              sx={{ mb: { xs: 2, md: 3 } }}
            >
              Categories
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1, md: 1.5 } }}>
              {[
                { text: 'Men', path: '/shop?category=men' },
                { text: 'Women', path: '/shop?category=women' },
                { text: 'Accessories', path: '/shop?category=accessories' },
              ].map((link) => (
                <Link
                  key={link.text}
                  component={RouterLink}
                  to={link.path}
                  sx={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    textDecoration: 'none',
                    '&:hover': { color: 'primary.contrastText' },
                    fontSize: { xs: '0.875rem', md: '1rem' }
                  }}
                >
                  {link.text}
                </Link>
              ))}
            </Box>
          </Grid>

          {/* Newsletter */}
          <Grid item xs={12} md={4}>
            <Typography 
              variant="h6" 
              gutterBottom 
              color="primary.contrastText"
              sx={{ mb: { xs: 2, md: 3 } }}
            >
              Subscribe to Our Newsletter
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                mb: { xs: 2, md: 3 }, 
                color: 'rgba(255, 255, 255, 0.7)',
                maxWidth: { sm: '80%', md: '100%' }
              }}
            >
              Stay updated with our latest collections and exclusive offers.
            </Typography>
            <Box
              component="form"
              onSubmit={handleSubscribe}
              sx={{ 
                display: 'flex', 
                gap: 1,
                flexDirection: { xs: 'column', sm: 'row' }
              }}
            >
              <TextField
                size="small"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
                fullWidth
                sx={{ 
                  flex: { sm: 1 },
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'rgba(255, 255, 255, 0.05)',
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'primary.contrastText',
                    },
                  },
                  '& input': {
                    color: 'primary.contrastText',
                  },
                  '& input::placeholder': {
                    color: 'rgba(255, 255, 255, 0.5)',
                  },
                }}
              />
              <Button
                type="submit"
                variant="outlined"
                sx={{ 
                  whiteSpace: 'nowrap',
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                  color: 'primary.contrastText',
                  '&:hover': {
                    borderColor: 'primary.contrastText',
                    bgcolor: 'rgba(255, 255, 255, 0.05)',
                  },
                  minWidth: { xs: '100%', sm: 'auto' }
                }}
              >
                Subscribe
              </Button>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: { xs: 3, md: 4 }, borderColor: 'rgba(255, 255, 255, 0.1)' }} />

        {/* Bottom Section */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: { xs: 2, sm: 0 }
          }}
        >
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'rgba(255, 255, 255, 0.7)',
              textAlign: { xs: 'center', sm: 'left' }
            }}
          >
            © {new Date().getFullYear()} Sigma Clothing. All rights reserved.
          </Typography>
          <Box 
            sx={{ 
              display: 'flex', 
              gap: { xs: 2, sm: 3 },
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: 'center'
            }}
          >
            {[
              { text: 'Privacy Policy', path: '/privacy' },
              { text: 'Terms of Service', path: '/terms' },
              { text: 'Shipping Info', path: '/shipping' },
            ].map((link) => (
              <Link
                key={link.text}
                component={RouterLink}
                to={link.path}
                variant="body2"
                sx={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  textDecoration: 'none',
                  '&:hover': { color: 'primary.contrastText' },
                  fontSize: { xs: '0.875rem', md: '0.875rem' }
                }}
              >
                {link.text}
              </Link>
            ))}
          </Box>
        </Box>
      </Container>

      {/* Newsletter Subscription Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Footer; 