import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "@/utils/api";
import { getErrorMessage } from "@/utils/errors";

const ensureAuthenticated = (getState) => getState().auth?.user;

export const fetchWishlist = createAsyncThunk(
  "wishlist/fetchWishlist",
  async (_, { getState, rejectWithValue }) => {
    try {
      const user = ensureAuthenticated(getState);
      if (!user) {
        return [];
      }
      const { data } = await api.get("/api/wishlist");
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to fetch wishlist"));
    }
  }
);

export const addToWishlist = createAsyncThunk(
  "wishlist/addToWishlist",
  async (watchId, { getState, rejectWithValue }) => {
    try {
      const user = ensureAuthenticated(getState);
      if (!user) {
        return rejectWithValue("Authentication required");
      }
      await api.post("/api/wishlist/items", { watch_id: watchId });
      return watchId;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to add to wishlist"));
    }
  }
);

export const removeFromWishlist = createAsyncThunk(
  "wishlist/removeFromWishlist",
  async (watchId, { getState, rejectWithValue }) => {
    try {
      const user = ensureAuthenticated(getState);
      if (!user) {
        return rejectWithValue("Authentication required");
      }
      await api.delete(`/api/wishlist/items/${watchId}`);
      return watchId;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to remove from wishlist"));
    }
  }
);

export const checkWishlistStatus = createAsyncThunk(
  "wishlist/checkWishlistStatus",
  async (watchId, { getState, rejectWithValue }) => {
    try {
      const user = ensureAuthenticated(getState);
      if (!user) {
        return { watchId, inWishlist: false };
      }

      const { data } = await api.get(`/api/wishlist/items/${watchId}/check`);
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
