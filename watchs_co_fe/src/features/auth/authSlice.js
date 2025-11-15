import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { API_BASE_URL } from "@/constants/env";

const getStoredToken = () =>
  (typeof window !== "undefined" && localStorage.getItem("token")) || null;

export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    const token = getStoredToken();
    if (!token) return { user: null, token: null };

    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return { user: data.user || data, token };
    } catch (error) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
      }
      return rejectWithValue(
        error.response?.data?.error || "Unable to verify session"
      );
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { dispatch, rejectWithValue }) => {
    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/api/auth/login`,
        credentials
      );
      const token = data.token;
      if (typeof window !== "undefined") {
        localStorage.setItem("token", token);
      }
      await dispatch(fetchCurrentUser());
      return { token };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Something went wrong. Try again."
      );
    }
  }
);

const initialState = {
  user: null,
  token: getStoredToken(),
  status: "idle",
  authStatus: "idle",
  error: null,
  authError: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload?.user || null;
        state.token = action.payload?.token || state.token;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.status = "failed";
        state.user = null;
        state.token = null;
        state.error =
          action.payload || action.error?.message || "Unable to fetch user";
      })
      .addCase(loginUser.pending, (state) => {
        state.authStatus = "loading";
        state.authError = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.authStatus = "succeeded";
        state.token = action.payload.token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.authStatus = "failed";
        state.authError =
          action.payload || action.error?.message || "Login failed";
      });
  },
});

export const { logout } = authSlice.actions;
export const selectAuth = (state) => state.auth;
export default authSlice.reducer;
