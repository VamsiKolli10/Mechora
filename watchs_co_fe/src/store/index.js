import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/features/auth/authSlice";
import cartReducer from "@/features/cart/cartSlice";
import watchesReducer from "@/features/watches/watchesSlice";
import wishlistReducer from "@/features/wishlist/wishlistSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    watches: watchesReducer,
    wishlist: wishlistReducer,
  },
});

export default store;
