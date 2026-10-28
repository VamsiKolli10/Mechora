import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { cartApi } from "@/services/cartApi";
import { getErrorMessage } from "@/utils/errors";
import { selectSessionKey } from "@/utils/sessionIdentity";

// Keep cart mutations and the snapshots they return in a single client-side order.
let requests = Promise.resolve();
const createCartRequest = (name, request, fallback, initialize = false) => createAsyncThunk(
  `cart/${name}`,
  async (input, { getState, fulfillWithValue, rejectWithValue }) => {
    const ownerKey = selectSessionKey(getState());
    const operation = requests.then(async () => {
      if (ownerKey !== selectSessionKey(getState()) || getState().auth?.authStatus === "loading") {
        throw new Error("Session changed");
      }
      const { data } = await request(input);
      return data;
    });
    requests = operation.catch(() => {});
    try {
      const data = await operation;
      if (ownerKey !== selectSessionKey(getState())) throw new Error("Session changed");
      return fulfillWithValue(data, { ownerKey });
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, fallback), { ownerKey });
    }
  },
  { condition: (_, { getState }) => !initialize || !getState().cart.loading }
);

export const fetchCart = createCartRequest("fetchCart", () => cartApi.getCart(), "Failed to fetch cart", true);
export const addToCart = createCartRequest("addToCart", ({ watch_id, quantity = 1 }) => cartApi.addItem({ watch_id, quantity }), "Failed to add to cart");
export const updateCartItem = createCartRequest("updateCartItem", item => cartApi.updateItem(item), "Failed to update cart item");
export const removeFromCart = createCartRequest("removeFromCart", id => cartApi.removeItem(id), "Failed to remove cart item");
export const clearCart = createCartRequest("clearCart", () => cartApi.clearCart(), "Failed to clear cart");
export const mergeCart = createCartRequest("mergeCart", () => cartApi.mergeCart(), "Failed to merge cart", true);

const initialState = {
  cart: null, items: [], subtotal: 0, itemCount: 0, loading: false, error: null,
  ownerKey: "guest:0", pending: {}, mergeError: null,
};
const reset = (ownerKey) => ({ ...initialState, pending: {}, ownerKey });
const cartSlice = createSlice({
  name: "cart", initialState,
  reducers: {
    clearCartState: (state, action) => {
      const ownerKey = action.payload?.ownerKey ?? state.ownerKey;
      if (action.payload && ownerKey === state.ownerKey) return;
      return reset(ownerKey);
    },
  },
  extraReducers: (builder) => {
    [fetchCart, addToCart, updateCartItem, removeFromCart, clearCart, mergeCart].forEach(thunk => {
      builder.addCase(thunk.pending, (state, action) => {
        state.pending[action.meta.requestId] = true;
        state.loading = true;
        state.error = null;
        if (thunk === mergeCart) state.mergeError = null;
      });
      builder.addCase(thunk.fulfilled, (state, action) => {
        if (action.meta.ownerKey !== state.ownerKey || !state.pending[action.meta.requestId]) return;
        delete state.pending[action.meta.requestId];
        state.loading = Object.keys(state.pending).length > 0;
        const cart = thunk === clearCart ? null : action.payload;
        state.cart = cart;
        state.items = cart?.items || [];
        state.subtotal = cart?.subtotal || 0;
        state.itemCount = cart?.item_count || 0;
        if (thunk === mergeCart) state.mergeError = null;
      });
      builder.addCase(thunk.rejected, (state, action) => {
        if (action.meta.ownerKey !== state.ownerKey || !state.pending[action.meta.requestId]) return;
        delete state.pending[action.meta.requestId];
        state.loading = Object.keys(state.pending).length > 0;
        state.error = action.payload || action.error.message;
        if (thunk === mergeCart) state.mergeError = state.error;
      });
    });
  },
});
export const { clearCartState } = cartSlice.actions;
export const selectCart = state => state.cart;
export default cartSlice.reducer;
