import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Box,
  Button,
  Container,
  useScrollTrigger,
  Stack,
  Menu,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  FavoriteBorder as FavoriteBorderIcon,
  ShoppingCart as ShoppingCartIcon,
  Person as PersonIcon,
  Search as SearchIcon,
  Dashboard as DashboardIcon,
  KeyboardArrowDown as ArrowDownIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { useMuiMenuFix } from '../../hooks/useFocusManagement';

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { items: cartItems } = useSelector((state) => state.cart);
  const { items: wishlistItems } = useSelector((state) => state.wishlist);
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 0,
  });

  // Apply MUI menu focus fix
  useMuiMenuFix(Boolean(anchorEl), anchorEl);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    handleMenuClose();
  };

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleSearchClick = () => {
    navigate('/shop?focus=search');
  };

  const mobileMenu = (
    <Drawer
      anchor="right"
      open={mobileMenuOpen}
      onClose={() => setMobileMenuOpen(false)}
      PaperProps={{
        sx: {
          width: '250px',
          padding: '20px 0',
        },
      }}
    >
      <List>
        <ListItem component={RouterLink} to="/" onClick={() => setMobileMenuOpen(false)}>
          <ListItemText primary="Home" />
        </ListItem>
        <ListItem component={RouterLink} to="/shop" onClick={() => setMobileMenuOpen(false)}>
          <ListItemText primary="Shop" />
        </ListItem>
        <ListItem component={RouterLink} to="/about" onClick={() => setMobileMenuOpen(false)}>
          <ListItemText primary="About Us" />
        </ListItem>
        {isAuthenticated && user?.role === 'admin' && (
          <ListItem component={RouterLink} to="/admin" onClick={() => setMobileMenuOpen(false)}>
            <ListItemIcon>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary="Admin Dashboard" />
          </ListItem>
        )}
        {isAuthenticated ? (
          <>
            <ListItem component={RouterLink} to="/profile" onClick={() => setMobileMenuOpen(false)}>
              <ListItemIcon>
                <PersonIcon />
              </ListItemIcon>
              <ListItemText primary="Profile" />
            </ListItem>
            <ListItem onClick={() => { handleLogout(); setMobileMenuOpen(false); }}>
              <ListItemText primary="Logout" />
            </ListItem>
          </>
        ) : (
          <>
            <ListItem component={RouterLink} to="/login" onClick={() => setMobileMenuOpen(false)}>
              <ListItemText primary="Login" />
            </ListItem>
            <ListItem component={RouterLink} to="/register" onClick={() => setMobileMenuOpen(false)}>
              <ListItemText primary="Register" />
            </ListItem>
          </>
        )}
      </List>
    </Drawer>
  );

  return (
    <AppBar 
      position="fixed" 
      elevation={0}
      sx={{
        transform: trigger ? 'translateY(-100%)' : 'translateY(0)',
        transition: 'transform 0.3s ease'
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
          {/* Logo/Brand */}
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{
              textDecoration: 'none',
              color: 'primary.main',
              fontWeight: 700,
              letterSpacing: 1,
              flexGrow: { xs: 1, md: 0 },
            }}
          >
            SIGMA CLOTHING
          </Typography>

          {/* Navigation Links - Desktop */}
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 2, ml: 4, flexGrow: 1 }}>
              <Button
                component={RouterLink}
                to="/"
                color="primary"
                sx={{ fontWeight: 500 }}
              >
                Home
              </Button>
              <Button
                component={RouterLink}
                to="/shop"
                color="primary"
                sx={{ fontWeight: 500 }}
              >
                Shop
              </Button>
              <Button
                component={RouterLink}
                to="/about"
                color="primary"
                sx={{ fontWeight: 500 }}
              >
                About Us
              </Button>
              
              {isAuthenticated && user?.role === 'admin' && (
                <Button
                  component={RouterLink}
                  to="/admin"
                  color="primary"
                  startIcon={<DashboardIcon />}
                  sx={{ fontWeight: 500 }}
                >
                  Admin Dashboard
                </Button>
              )}
            </Box>
          )}

          {/* Icons and Actions */}
          <Stack direction="row" spacing={{ xs: 1, sm: 2 }} alignItems="center">
            <IconButton color="primary" onClick={handleSearchClick}>
              <SearchIcon />
            </IconButton>
            
            <IconButton color="primary" component={RouterLink} to="/wishlist">
              <Badge badgeContent={wishlistItems?.length || 0} color="primary">
                <FavoriteBorderIcon />
              </Badge>
            </IconButton>
            
            <IconButton color="primary" component={RouterLink} to="/cart">
              <Badge badgeContent={cartItems?.length || 0} color="primary">
                <ShoppingCartIcon />
              </Badge>
            </IconButton>

            {!isMobile && isAuthenticated ? (
              <>
                <Button
                  id="user-menu-button"
                  color="primary"
                  onClick={handleMenuOpen}
                  endIcon={<ArrowDownIcon />}
                  startIcon={<PersonIcon />}
                  aria-controls={Boolean(anchorEl) ? 'user-menu' : undefined}
                  aria-haspopup="true"
                  aria-expanded={Boolean(anchorEl) ? 'true' : undefined}
                >
                  {user?.fullName}
                </Button>
                <Menu
                  id="user-menu"
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  MenuListProps={{
                    'aria-labelledby': 'user-menu-button',
                    role: 'menu',
                  }}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                  <MenuItem
                    component={RouterLink}
                    to="/profile"
                    onClick={handleMenuClose}
                  >
                    Profile
                  </MenuItem>
                  {user?.role === 'admin' && (
                    <MenuItem
                      component={RouterLink}
                      to="/admin"
                      onClick={handleMenuClose}
                    >
                      Admin Dashboard
                    </MenuItem>
                  )}
                  <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </Menu>
              </>
            ) : !isMobile && (
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  color="primary"
                  component={RouterLink}
                  to="/login"
                >
                  Login
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  component={RouterLink}
                  to="/register"
                >
                  Register
                </Button>
              </Stack>
            )}

            {/* Mobile Menu Toggle */}
            {isMobile && (
              <IconButton
                color="primary"
                edge="end"
                onClick={handleMobileMenuToggle}
              >
                <MenuIcon />
              </IconButton>
            )}
          </Stack>
        </Toolbar>
      </Container>
      {mobileMenu}
    </AppBar>
  );
};

export default Navbar; 