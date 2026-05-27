import { configureStore } from '@reduxjs/toolkit';
import orderReducer from './orderSlice'; // Eita amra ekhon banabo

export const store = configureStore({
  reducer: {
    order: orderReducer,
    // cart: cartReducer, (jodi thake)
  },
});