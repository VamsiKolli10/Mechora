import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { API_BASE_URL } from "@/constants/env";

const getAuthHeaders = (getState) => {
  const state = getState();
  const token = state.auth?.token;
  if (!token) {
    throw new Error("Authentication required");
  }
  return { Authorization: `Bearer ${token}` };
};

export const fetchWishlist = createAsyncThunk(
  "wishlist/fetchWishlist",
  async (_, { getState, rejectWithValue }) => {
    try {
      const headers = getAuthHeaders(getState);
      const { data } = await axios.get(`${API_BASE_URL}/api/wishlist`, { headers });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to fetch wishlist");
    }
  }
);

export const addToWishlist = createAsyncThunk(
  "wishlist/addToWishlist",
  async (watchId, { getState, rejectWithValue }) => {
    try {
      const headers = getAuthHeaders(getState);
      await axios.post(
        `${API_BASE_URL}/api/wishlist/items`,
        { watch_id: watchId },
        { headers }
      );
      return watchId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to add to wishlist");
    }
  }
);

export const removeFromWishlist = createAsyncThunk(
  "wishlist/removeFromWishlist",
  async (watchId, { getState, rejectWithValue }) => {
    try {
      const headers = getAuthHeaders(getState);
      await axios.delete(`${API_BASE_URL}/api/wishlist/items/${watchId}`, { headers });
      return watchId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to remove from wishlist");
    }
  }
);

export const checkWishlistStatus = createAsyncThunk(
  "wishlist/checkWishlistStatus",
  async (watchId, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const token = state.auth?.token;
      if (!token) return { watchId, inWishlist: false };
      
      const { data } = await axios.get(
        `${API_BASE_URL}/api/wishlist/items/${watchId}/check`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return { watchId, inWishlist: data.in_wishlist };
    } catch (error) {
      return { watchId, inWishlist: false };
    }
  }
);

const initialState = {
  items: [],
  wishlistStatus: {}, // { watchId: boolean }
  loading: false,
  error: null,
};

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    clearWishlist: (state) => {
      state.items = [];
      state.wishlistStatus = {};
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        // Update wishlist status for all items
        action.payload.forEach((item) => {
          state.wishlistStatus[item.watch_id] = true;
        });
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        state.wishlistStatus[action.payload] = true;
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.wishlistStatus[action.payload] = false;
        state.items = state.items.filter((item) => item.watch_id !== action.payload);
      })
      .addCase(checkWishlistStatus.fulfilled, (state, action) => {
        state.wishlistStatus[action.payload.watchId] = action.payload.inWishlist;
      });
  },
});

export const { clearWishlist } = wishlistSlice.actions;
export const selectWishlist = (state) => state.wishlist;
export default wishlistSlice.reducer;

