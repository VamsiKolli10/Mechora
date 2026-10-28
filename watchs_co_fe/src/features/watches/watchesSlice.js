import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { productsApi } from "@/services/productsApi";
import { getErrorMessage } from "@/utils/errors";

export const fetchWatches = createAsyncThunk(
  "watches/fetchWatches",
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await productsApi.getProducts(params);
      return {
        watches: data.products || data.watches || [],
        pagination: data.pagination,
      };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to fetch watches"));
    }
  }
);

export const fetchWatchBySlug = createAsyncThunk(
  "watches/fetchWatchBySlug",
  async (slug, { rejectWithValue }) => {
    try {
      const { data } = await productsApi.getProductBySlug(slug);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to fetch watch"));
    }
  }
);

export const fetchWatchById = createAsyncThunk(
  "watches/fetchWatchById",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await productsApi.getProductById(id);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to fetch watch"));
    }
  }
);

export const fetchFeaturedWatches = createAsyncThunk(
  "watches/fetchFeaturedWatches",
  async (limit = 10, { rejectWithValue }) => {
    try {
      const { data } = await productsApi.getFeaturedProducts(limit);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to fetch featured watches"));
    }
  }
);

export const searchWatches = createAsyncThunk(
  "watches/searchWatches",
  async ({ query, page = 1, limit = 20 }, { rejectWithValue }) => {
    try {
      const { data } = await productsApi.searchProducts(query, { page, limit });
      return {
        watches: data.products || data.watches || [],
        pagination: data.pagination,
      };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Search failed"));
    }
  }
);

export const getSearchSuggestions = createAsyncThunk(
  "watches/getSearchSuggestions",
  async (query, { rejectWithValue }) => {
    if (!query || query.length < 2) {
      return [];
    }
    try {
      const { data } = await productsApi.getSearchSuggestions(query);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to get suggestions"));
    }
  }
);

export const fetchBrands = createAsyncThunk(
  "watches/fetchBrands",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await productsApi.getBrands();
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to fetch brands"));
    }
  }
);

export const fetchCollections = createAsyncThunk(
  "watches/fetchCollections",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await productsApi.getCollections();
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to fetch collections"));
    }
  }
);

const initialState = {
  watches: [],
  currentWatch: null,
  featuredWatches: [],
  brands: [],
  collections: [],
  searchResults: [],
  searchSuggestions: [],
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
  filters: {
    brand_id: null,
    brand_name: null,
    collection_id: null,
    collection_name: null,
    min_price: null,
    max_price: null,
    stock_status: null,
    condition: null,
    search: null,
    sort_by: "created_at",
    sort_order: "DESC",
  },
  loading: false,
  error: null,
  listLoading: false, detailLoading: false, listError: null, detailError: null,
  listRequestId: null, detailRequestId: null,
};

const watchesSlice = createSlice({
  name: "watches",
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    replaceFilters: (state, action) => {
      state.filters = { ...initialState.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    clearSearchSuggestions: (state) => {
      state.searchSuggestions = [];
    },
    clearCurrentWatch: (state) => {
      state.currentWatch = null;
      state.detailRequestId = null;
      state.detailError = null;
      state.detailLoading = false;
      state.loading = state.listLoading;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWatches.pending, (state, action) => {
        state.listRequestId = action.meta.requestId;
        state.listLoading = state.loading = true;
        state.listError = state.error = null;
      })
      .addCase(fetchWatches.fulfilled, (state, action) => {
        if (state.listRequestId !== action.meta.requestId) return;
        state.listLoading = false;
        state.loading = state.detailLoading;
        state.watches = action.payload.watches || [];
        state.pagination = action.payload.pagination || state.pagination;
      })
      .addCase(fetchWatches.rejected, (state, action) => {
        if (state.listRequestId !== action.meta.requestId) return;
        state.listLoading = false;
        state.loading = state.detailLoading;
        state.listError = state.error = action.payload;
      })
      .addCase(fetchFeaturedWatches.fulfilled, (state, action) => {
        state.featuredWatches = action.payload;
      })
      .addCase(searchWatches.fulfilled, (state, action) => {
        state.searchResults = action.payload.watches || [];
        state.pagination = action.payload.pagination || state.pagination;
      })
      .addCase(getSearchSuggestions.fulfilled, (state, action) => {
        state.searchSuggestions = action.payload;
      })
      .addCase(fetchBrands.fulfilled, (state, action) => {
        state.brands = action.payload;
      })
      .addCase(fetchCollections.fulfilled, (state, action) => {
        state.collections = action.payload;
      });
    [fetchWatchBySlug, fetchWatchById].forEach(thunk => {
      builder.addCase(thunk.pending, (state, action) => {
        state.detailRequestId = action.meta.requestId;
        state.detailLoading = state.loading = true;
        state.detailError = state.error = null;
      });
      builder.addCase(thunk.fulfilled, (state, action) => {
        if (state.detailRequestId !== action.meta.requestId) return;
        state.detailLoading = false;
        state.loading = state.listLoading;
        state.currentWatch = action.payload;
      });
      builder.addCase(thunk.rejected, (state, action) => {
        if (state.detailRequestId !== action.meta.requestId) return;
        state.detailLoading = false;
        state.loading = state.listLoading;
        state.detailError = state.error = action.payload || action.error.message;
      });
    });
  },
});

export const {
  setFilters,
  replaceFilters,
  clearFilters,
  clearSearchSuggestions,
  clearCurrentWatch,
} = watchesSlice.actions;
export const selectWatches = (state) => state.watches;
export default watchesSlice.reducer;
