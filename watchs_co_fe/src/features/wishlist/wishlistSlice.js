import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "@/utils/api";
import { getErrorMessage } from "@/utils/errors";
import { selectSessionKey } from "@/utils/sessionIdentity";

const request = (name, operation) => createAsyncThunk(`wishlist/${name}`,
  async (watchId, { getState, fulfillWithValue, rejectWithValue }) => {
    const ownerKey = selectSessionKey(getState());
    try {
      if (!getState().auth?.user) throw new Error("Authentication required");
      const result = await operation(watchId);
      if (ownerKey !== selectSessionKey(getState())) throw new Error("Session changed");
      return fulfillWithValue(result, { ownerKey });
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Wishlist could not be updated"), { ownerKey });
    }
  });
export const fetchWishlist = request("fetchWishlist", async () => (await api.get("/api/wishlist")).data);
export const addToWishlist = request("addToWishlist", async watchId => {
  await api.post("/api/wishlist/items", { watch_id: watchId });
  return watchId;
});
export const removeFromWishlist = request("removeFromWishlist", async watchId => {
  await api.delete(`/api/wishlist/items/${watchId}`);
  return watchId;
});
export const checkWishlistStatus = request("checkWishlistStatus", async watchId => {
  const { data } = await api.get(`/api/wishlist/items/${watchId}/check`);
  return { watchId, inWishlist: data.in_wishlist };
});
const initialState = { items: [], wishlistStatus: {}, loading: false, error: null, ownerKey: "guest:0", pendingIds: {} };
const wishlistSlice = createSlice({
  name: "wishlist", initialState,
  reducers: {
    clearWishlist: (state, action) => {
      const ownerKey = action.payload?.ownerKey ?? state.ownerKey;
      if (action.payload && ownerKey === state.ownerKey) return;
      return { ...initialState, items: [], wishlistStatus: {}, pendingIds: {}, ownerKey };
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchWishlist.pending, state => { state.loading = true; state.error = null; })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        if (action.meta.ownerKey !== state.ownerKey) return;
        state.loading = false;
        state.items = action.payload;
        state.wishlistStatus = Object.fromEntries(action.payload.map(item => [item.watch_id, true]));
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        if (action.meta.ownerKey === state.ownerKey) {
          delete state.pendingIds[action.payload];
          state.wishlistStatus[action.payload] = true;
        }
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        if (action.meta.ownerKey !== state.ownerKey) return;
        delete state.pendingIds[action.payload];
        state.wishlistStatus[action.payload] = false;
        state.items = state.items.filter(item => item.watch_id !== action.payload);
      })
      .addCase(checkWishlistStatus.fulfilled, (state, action) => {
        if (action.meta.ownerKey !== state.ownerKey) return;
        delete state.pendingIds[action.payload.watchId];
        state.wishlistStatus[action.payload.watchId] = action.payload.inWishlist;
      });
    [addToWishlist, removeFromWishlist, checkWishlistStatus].forEach(thunk => {
      builder.addCase(thunk.pending, (state, action) => {
        state.pendingIds[action.meta.arg] = true;
        if (thunk === checkWishlistStatus) state.wishlistStatus[action.meta.arg] = null;
      });
    });
    [fetchWishlist, addToWishlist, removeFromWishlist, checkWishlistStatus].forEach(thunk => {
      builder.addCase(thunk.rejected, (state, action) => {
        if (action.meta.ownerKey !== state.ownerKey) return;
        state.loading = false;
        delete state.pendingIds[action.meta.arg];
        if (thunk === checkWishlistStatus) state.wishlistStatus[action.meta.arg] = false;
        state.error = action.payload;
      });
    });
  },
});
export const { clearWishlist } = wishlistSlice.actions;
export const selectWishlist = state => state.wishlist;
export default wishlistSlice.reducer;
