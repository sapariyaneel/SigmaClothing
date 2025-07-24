import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Typography,
  Box,
  Grid,
  LinearProgress,
  useTheme,
} from '@mui/material';
import AddressForm from './AddressForm';
import PaymentForm from './PaymentForm';
import OrderConfirmation from './OrderConfirmation';
import OrderSummary from './OrderSummary';
import { setOrderSummary, setStep, resetCheckout } from '../../store/slices/checkoutSlice';
import {
  LocalShipping as ShippingIcon,
  Payment as PaymentIcon,
  CheckCircle as ConfirmationIcon,
} from '@mui/icons-material';

const steps = [
  {
    label: 'Shipping Address',
    icon: ShippingIcon,
  },
  {
    label: 'Payment',
    icon: PaymentIcon,
  },
  {
    label: 'Confirmation',
    icon: ConfirmationIcon,
  },
];

const Checkout = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentStep, shippingAddress, orderSummary } = useSelector((state) => state.checkout);
  const { items, totalAmount } = useSelector((state) => state.cart);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const buyNowProductId = searchParams.get('buyNow');

  // Store filtered items in state
  const [filteredItems, setFilteredItems] = React.useState([]);
  const [filteredTotal, setFilteredTotal] = React.useState(0);

  // Calculate progress percentage
  const progress = ((currentStep - 1) / (steps.length - 1)) * 100;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout');
      return;
    }

    // Filter items if buyNow parameter is present
    let currentItems = items;
    let currentTotal = totalAmount;

    if (buyNowProductId) {
      currentItems = items.filter(item => item.productId._id === buyNowProductId);
      currentTotal = currentItems.reduce((total, item) => total + item.totalPrice, 0);
    }

    setFilteredItems(currentItems);
    setFilteredTotal(currentTotal);

    if (currentItems.length === 0) {
      navigate('/cart');
      return;
    }

    // Set order summary
    dispatch(setOrderSummary({ items: currentItems, totalAmount: currentTotal }));

    // Only set step to 1 if we're just starting the checkout process
    if (!orderSummary && currentStep !== 1) {
      dispatch(setStep(1));
    }
  }, [dispatch, isAuthenticated, items, totalAmount, navigate, buyNowProductId]);

  // Reset checkout state when component unmounts
  useEffect(() => {
    return () => {
      dispatch(resetCheckout());
    };
  }, [dispatch]);

  const handleNext = () => {
    if (currentStep < steps.length) {
      dispatch(setStep(currentStep + 1));
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      dispatch(setStep(currentStep - 1));
    }
  };

  const getStepContent = (step) => {
    switch (step) {
      case 1:
        return <AddressForm initialValues={shippingAddress} onNext={handleNext} />;
      case 2:
        return <PaymentForm onNext={handleNext} onBack={handleBack} />;
      case 3:
        return <OrderConfirmation orderSummary={orderSummary} />;
      default:
        throw new Error('Unknown step');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: { xs: 2, md: 4 } }}>
        <Typography component="h1" variant="h4" align="center" gutterBottom>
          Checkout
        </Typography>

        {/* Progress Bar */}
        <Box sx={{ width: '100%', mb: 3 }}>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: theme.palette.grey[200],
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
              },
            }}
          />
        </Box>

        {/* Enhanced Stepper */}
        <Stepper 
          activeStep={currentStep - 1} 
          sx={{ 
            py: 3,
            '& .MuiStepLabel-root': {
              '&.Mui-active': {
                color: theme.palette.primary.main,
              },
              '&.Mui-completed': {
                color: theme.palette.success.main,
              },
            },
          }}
        >
          {steps.map(({ label, icon: Icon }, index) => (
            <Step key={label}>
              <StepLabel
                StepIconComponent={() => (
                  <Icon
                    sx={{
                      fontSize: 28,
                      color: index < currentStep - 1
                        ? theme.palette.success.main
                        : index === currentStep - 1
                          ? theme.palette.primary.main
                          : theme.palette.grey[400],
                    }}
                  />
                )}
              >
                <Typography
                  sx={{
                    fontWeight: index === currentStep - 1 ? 600 : 400,
                    color: index === currentStep - 1
                      ? theme.palette.primary.main
                      : 'text.primary',
                  }}
                >
                  {label}
                </Typography>
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            {getStepContent(currentStep)}
          </Grid>
          <Grid item xs={12} md={4}>
            <OrderSummary
              items={filteredItems}
              totalAmount={filteredTotal}
              shippingAddress={currentStep > 1 ? shippingAddress : null}
            />
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default Checkout; 