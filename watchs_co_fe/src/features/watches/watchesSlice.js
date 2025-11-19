import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "@/utils/api";
import { getErrorMessage } from "@/utils/errors";

export const fetchWatches = createAsyncThunk(
  "watches/fetchWatches",
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/api/watches`, { params });
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to fetch watches"));
    }
  }
);

export const fetchWatchBySlug = createAsyncThunk(
  "watches/fetchWatchBySlug",
  async (slug, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/api/watches/slug/${slug}`);
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
      const { data } = await api.get(`/api/watches/${id}`);
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
      const { data } = await api.get(`/api/watches/featured`, {
        params: { limit },
      });
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
      const { data } = await api.get(`/api/search`, {
        params: { q: query, page, limit },
      });
      return data;
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
      const { data } = await api.get(`/api/search/suggestions`, {
        params: { q: query },
      });
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
      const { data } = await api.get(`/api/brands`);
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
      const { data } = await api.get(`/api/collections`);
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
    collection_id: null,
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
};

const watchesSlice = createSlice({
  name: "watches",
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    clearSearchSuggestions: (state) => {
      state.searchSuggestions = [];
    },
    clearCurrentWatch: (state) => {
      state.currentWatch = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWatches.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWatches.fulfilled, (state, action) => {
        state.loading = false;
        state.watches = action.payload.watches || [];
        state.pagination = action.payload.pagination || state.pagination;
      })
      .addCase(fetchWatches.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchWatchBySlug.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWatchBySlug.fulfilled, (state, action) => {
        state.loading = false;
        state.currentWatch = action.payload;
      })
      .addCase(fetchWatchBySlug.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchWatchById.fulfilled, (state, action) => {
        state.currentWatch = action.payload;
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
  },
});

export const { setFilters, clearFilters, clearSearchSuggestions, clearCurrentWatch } =
  watchesSlice.actions;
export const selectWatches = (state) => state.watches;
export default watchesSlice.reducer;
