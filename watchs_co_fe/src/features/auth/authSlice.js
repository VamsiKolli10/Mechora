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
      
      // Handle MFA requirement
      if (data.requires_mfa) {
        return rejectWithValue({ requires_mfa: true, message: data.message });
      }
      
      const token = data.token;
      const refreshToken = data.refresh_token;
      
      if (typeof window !== "undefined") {
        localStorage.setItem("token", token);
        if (refreshToken) {
          localStorage.setItem("refresh_token", refreshToken);
        }
      }
      
      await dispatch(fetchCurrentUser());
      return { token, refresh_token: refreshToken, user: data.user };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Something went wrong. Try again."
      );
    }
  }
);

export const signupUser = createAsyncThunk(
  "auth/signupUser",
  async (userData, { dispatch, rejectWithValue }) => {
    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/api/auth/signup`,
        userData
      );
      
      const token = data.token;
      const refreshToken = data.refresh_token;
      
      if (typeof window !== "undefined") {
        localStorage.setItem("token", token);
        if (refreshToken) {
          localStorage.setItem("refresh_token", refreshToken);
        }
      }
      
      await dispatch(fetchCurrentUser());
      return { token, refresh_token: refreshToken, user: data.user };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Something went wrong. Try again."
      );
    }
  }
);

export const refreshToken = createAsyncThunk(
  "auth/refreshToken",
  async (_, { getState, rejectWithValue }) => {
    try {
      const refresh_token = localStorage.getItem("refresh_token");
      if (!refresh_token) {
        throw new Error("No refresh token");
      }
      
      const { data } = await axios.post(
        `${API_BASE_URL}/api/auth/refresh`,
        { refresh_token }
      );
      
      if (typeof window !== "undefined") {
        localStorage.setItem("token", data.token);
        if (data.refresh_token) {
          localStorage.setItem("refresh_token", data.refresh_token);
        }
      }
      
      return { token: data.token, refresh_token: data.refresh_token };
    } catch (error) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("refresh_token");
      }
      return rejectWithValue(
        error.response?.data?.error || "Failed to refresh token"
      );
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        await axios.post(
          `${API_BASE_URL}/api/auth/logout`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }
    } catch (error) {
      // Continue with logout even if API call fails
      console.error("Logout error:", error);
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("refresh_token");
      }
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
        localStorage.removeItem("refresh_token");
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
          action.payload?.message || action.payload || action.error?.message || "Login failed";
      })
      .addCase(signupUser.pending, (state) => {
        state.authStatus = "loading";
        state.authError = null;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.authStatus = "succeeded";
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.authStatus = "failed";
        state.authError =
          action.payload || action.error?.message || "Signup failed";
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.token = action.payload.token;
      })
      .addCase(refreshToken.rejected, (state) => {
        state.user = null;
        state.token = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
      });
  },
});

export const { logout } = authSlice.actions;
export const selectAuth = (state) => state.auth;
export default authSlice.reducer;
