import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import cartReducer from './slices/cartSlice';
import wishlistReducer from './slices/wishlistSlice';
import checkoutReducer from './slices/checkoutSlice';
import productReducer from './slices/productSlice';
import notificationReducer from './slices/notificationSlice';
import orderReducer from '../features/order/orderSlice';
import couponReducer from '../features/coupon/couponSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    checkout: checkoutReducer,
    products: productReducer,
    notification: notificationReducer,
    order: orderReducer,
    coupon: couponReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store; 