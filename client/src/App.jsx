import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AnimatePresence } from 'framer-motion';
import { theme } from './styles/theme';
import Layout from './components/layout/Layout';
import { Box, CircularProgress, Typography } from '@mui/material';
import PageTransition from './components/common/PageTransition';
import LoadingSpinner from './components/common/LoadingSpinner';
import { useDispatch, useSelector } from 'react-redux';
import { checkAuth } from './store/slices/authSlice';
import PrivateRoute from './components/common/PrivateRoute';
import AdminRoute from './components/common/AdminRoute';
import Notification from './components/common/Notification';
import { useAriaHiddenFix } from './hooks/useFocusManagement';
import { initializeAccessibilityFixes } from './utils/accessibilityUtils';

// Lazy load pages with error boundaries
const lazyLoad = (importFunc) => {
  return React.lazy(() =>
    importFunc.catch(error => {
      return new Promise((resolve) => {
        resolve({
          default: () => (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="error">
                Error loading page. Please try refreshing.
              </Typography>
            </Box>
          )
        });
      });
    })
  );
};

// Lazy load pages
const Home = lazyLoad(import('./pages/Home'));
const Shop = lazyLoad(import('./pages/Shop'));
const ProductDetail = lazyLoad(import('./pages/ProductDetail'));
const About = lazyLoad(import('./pages/About'));
const Login = lazyLoad(import('./pages/Auth/Login'));
const Register = lazyLoad(import('./pages/Auth/Register'));
const ForgotPassword = lazyLoad(import('./pages/Auth/ForgotPassword'));
const ResetPassword = lazyLoad(import('./pages/Auth/ResetPassword'));
const Wishlist = lazyLoad(import('./pages/Wishlist'));
const Cart = lazyLoad(import('./pages/Cart'));
const Checkout = lazyLoad(import('./pages/Checkout'));
const Orders = lazyLoad(import('./pages/Orders'));
const OrderDetails = lazyLoad(import('./components/order/OrderDetails'));
const OrderTracking = lazyLoad(import('./components/order/OrderTracking'));
const Profile = lazyLoad(import('./pages/Profile'));
const AdminDashboard = lazyLoad(import('./pages/Admin/Dashboard'));
const AddProduct = lazyLoad(import('./pages/Admin/AddProduct'));
const ManageProducts = lazyLoad(import('./pages/Admin/ManageProducts'));
const ManageFeatured = lazyLoad(import('./pages/Admin/ManageFeatured'));
const ManageOrders = lazyLoad(import('./pages/Admin/ManageOrders'));
const AdminOrderDetails = lazyLoad(import('./pages/Admin/AdminOrderDetails'));
const ManageCoupons = lazyLoad(import('./pages/Admin/ManageCoupons'));
// Temporarily import ManageUsers directly to debug
import ManageUsersComponent from './pages/Admin/ManageUsers';
const ManageUsers = ManageUsersComponent;

// Loading fallback component
const LoadingFallback = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
    <CircularProgress />
  </Box>
);

// AnimatedRoutes component to handle route transitions
const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<LoadingFallback />}>
        <Routes location={location} key={location.pathname}>
          {/* Auth Routes */}
          <Route
            path="/login"
            element={
              <PageTransition>
                <Login />
              </PageTransition>
            }
          />
          <Route
            path="/register"
            element={
              <PageTransition>
                <Register />
              </PageTransition>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <PageTransition>
                <ForgotPassword />
              </PageTransition>
            }
          />
          <Route
            path="/reset-password/:token"
            element={
              <PageTransition>
                <ResetPassword />
              </PageTransition>
            }
          />

          {/* Main Routes with Layout */}
          <Route
            path="/"
            element={
              <PageTransition>
                <Home />
              </PageTransition>
            }
          />
          <Route
            path="/shop"
            element={
              <PageTransition>
                <Shop />
              </PageTransition>
            }
          />
          <Route
            path="/shop/:id"
            element={
              <PageTransition>
                <ProductDetail />
              </PageTransition>
            }
          />
          <Route
            path="/product/:id"
            element={
              <PageTransition>
                <ProductDetail />
              </PageTransition>
            }
          />
          <Route
            path="/about"
            element={
              <PageTransition>
                <About />
              </PageTransition>
            }
          />
          <Route
            path="/wishlist"
            element={
              <PageTransition>
                <Wishlist />
              </PageTransition>
            }
          />
          <Route
            path="/cart"
            element={
              <PageTransition>
                <Cart />
              </PageTransition>
            }
          />
          <Route
            path="/checkout"
            element={
              <PageTransition>
                <Checkout />
              </PageTransition>
            }
          />
          <Route
            path="/orders"
            element={
              <PageTransition>
                <PrivateRoute>
                  <Orders />
                </PrivateRoute>
              </PageTransition>
            }
          />
          <Route
            path="/orders/:id"
            element={
              <PageTransition>
                <OrderDetails />
              </PageTransition>
            }
          />
          <Route
            path="/order/track/:id"
            element={
              <PageTransition>
                <PrivateRoute>
                  <OrderTracking />
                </PrivateRoute>
              </PageTransition>
            }
          />
          <Route
            path="/profile"
            element={
              <PageTransition>
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              </PageTransition>
            }
          />
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/products" element={<AdminRoute><ManageProducts /></AdminRoute>} />
          <Route path="/admin/products/add" element={<AdminRoute><AddProduct /></AdminRoute>} />
          <Route path="/admin/featured" element={<AdminRoute><ManageFeatured /></AdminRoute>} />
          <Route path="/admin/orders" element={<AdminRoute><ManageOrders /></AdminRoute>} />
          <Route path="/admin/orders/:id" element={<AdminRoute><AdminOrderDetails /></AdminRoute>} />
          <Route path="/admin/coupons" element={<AdminRoute><ManageCoupons /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><ManageUsers /></AdminRoute>} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
};

function App() {
  const dispatch = useDispatch();

  // Apply global aria-hidden fix for MUI components
  useAriaHiddenFix();

  useEffect(() => {
    dispatch(checkAuth());

    // Initialize global accessibility fixes
    const cleanup = initializeAccessibilityFixes();

    return cleanup;
  }, [dispatch]);

  return (
    <>
      <Notification />
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}
        >
          <Layout>
            <Box>
              <AnimatedRoutes />
            </Box>
          </Layout>
        </Router>
      </ThemeProvider>
    </>
  );
}

export default App;
