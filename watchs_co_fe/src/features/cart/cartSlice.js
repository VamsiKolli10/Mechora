import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "@/utils/api";
import { getErrorMessage } from "@/utils/errors";

export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/api/cart");
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to fetch cart"));
    }
  }
);

export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async ({ watch_id, quantity = 1 }, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/api/cart/items", { watch_id, quantity });
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to add to cart"));
    }
  }
);

export const updateCartItem = createAsyncThunk(
  "cart/updateCartItem",
  async ({ itemId, quantity }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/api/cart/items/${itemId}`, { quantity });
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to update cart item"));
    }
  }
);

export const removeFromCart = createAsyncThunk(
  "cart/removeFromCart",
  async (itemId, { rejectWithValue }) => {
    try {
      const { data } = await api.delete(`/api/cart/items/${itemId}`);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to remove from cart"));
    }
  }
);

export const clearCart = createAsyncThunk(
  "cart/clearCart",
  async (_, { rejectWithValue }) => {
    try {
      await api.delete(`/api/cart`);
      return null;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to clear cart"));
    }
  }
);

export const mergeCart = createAsyncThunk(
  "cart/mergeCart",
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      if (!state.auth?.user) {
        return rejectWithValue("Authentication required");
      }

      const { data } = await api.post("/api/cart/merge");
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to merge cart"));
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
