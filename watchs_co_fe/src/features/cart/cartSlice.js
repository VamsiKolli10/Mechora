import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { API_BASE_URL } from "@/constants/env";

const getGuestToken = () => {
  if (typeof window === "undefined") return null;
  let token = localStorage.getItem("guest_token");
  if (!token) {
    token = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem("guest_token", token);
  }
  return token;
};

const getAuthHeaders = (getState) => {
  const state = getState();
  const token = state.auth?.token;
  const guestToken = getGuestToken();
  const headers = {};
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  } else if (guestToken) {
    headers["x-guest-token"] = guestToken;
  }
  
  return headers;
};

export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (_, { getState, rejectWithValue }) => {
    try {
      const headers = getAuthHeaders(getState);
      const { data } = await axios.get(`${API_BASE_URL}/api/cart`, { headers });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to fetch cart");
    }
  }
);

export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async ({ watch_id, quantity = 1 }, { getState, rejectWithValue }) => {
    try {
      const headers = getAuthHeaders(getState);
      const { data } = await axios.post(
        `${API_BASE_URL}/api/cart/items`,
        { watch_id, quantity },
        { headers }
      );
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to add to cart");
    }
  }
);

export const updateCartItem = createAsyncThunk(
  "cart/updateCartItem",
  async ({ itemId, quantity }, { getState, rejectWithValue }) => {
    try {
      const headers = getAuthHeaders(getState);
      const { data } = await axios.put(
        `${API_BASE_URL}/api/cart/items/${itemId}`,
        { quantity },
        { headers }
      );
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to update cart item");
    }
  }
);

export const removeFromCart = createAsyncThunk(
  "cart/removeFromCart",
  async (itemId, { getState, rejectWithValue }) => {
    try {
      const headers = getAuthHeaders(getState);
      const { data } = await axios.delete(
        `${API_BASE_URL}/api/cart/items/${itemId}`,
        { headers }
      );
      return { ...data, itemId };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to remove from cart");
    }
  }
);

export const clearCart = createAsyncThunk(
  "cart/clearCart",
  async (_, { getState, rejectWithValue }) => {
    try {
      const headers = getAuthHeaders(getState);
      await axios.delete(`${API_BASE_URL}/api/cart`, { headers });
      return null;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to clear cart");
    }
  }
);

export const mergeCart = createAsyncThunk(
  "cart/mergeCart",
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const token = state.auth?.token;
      const guestToken = getGuestToken();
      
      if (!token || !guestToken) {
        return rejectWithValue("Authentication required");
      }
      
      const { data } = await axios.post(
        `${API_BASE_URL}/api/cart/merge`,
        { guest_token: guestToken },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Clear guest token after merge
      localStorage.removeItem("guest_token");
      
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to merge cart");
    }
  }
);

const initialState = {
  cart: null,
  items: [],
  subtotal: 0,
  itemCount: 0,
  loading: false,
  error: null,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    clearCartState: (state) => {
      state.cart = null;
      state.items = [];
      state.subtotal = 0;
      state.itemCount = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload;
        state.items = action.payload?.items || [];
        state.subtotal = action.payload?.subtotal || 0;
        state.itemCount = action.payload?.item_count || 0;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload;
        state.items = action.payload?.items || [];
        state.subtotal = action.payload?.subtotal || 0;
        state.itemCount = action.payload?.item_count || 0;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.cart = action.payload;
        state.items = action.payload?.items || [];
        state.subtotal = action.payload?.subtotal || 0;
        state.itemCount = action.payload?.item_count || 0;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.cart = action.payload;
        state.items = action.payload?.items || [];
        state.subtotal = action.payload?.subtotal || 0;
        state.itemCount = action.payload?.item_count || 0;
      })
      .addCase(clearCart.fulfilled, (state) => {
        state.cart = null;
        state.items = [];
        state.subtotal = 0;
        state.itemCount = 0;
      })
      .addCase(mergeCart.fulfilled, (state, action) => {
        state.cart = action.payload;
        state.items = action.payload?.items || [];
        state.subtotal = action.payload?.subtotal || 0;
        state.itemCount = action.payload?.item_count || 0;
      });
  },
});

export const { clearCartState } = cartSlice.actions;
export const selectCart = (state) => state.cart;
export default cartSlice.reducer;

