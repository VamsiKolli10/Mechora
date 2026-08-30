import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { authApi } from "@/services/authApi";
import { getErrorMessage } from "@/utils/errors";

export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await authApi.getCurrentUser();
      return { user: data.user || data };
    } catch (error) {
      if (error.response?.status === 401) {
        return rejectWithValue("unauthenticated");
      }
      return rejectWithValue(getErrorMessage(error, "Unable to verify session"));
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const { data } = await authApi.login(credentials);

      if (data.requires_mfa) {
        return rejectWithValue({ requires_mfa: true, message: data.message });
      }

      return { user: data.user, session: data.session };
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Something went wrong. Try again.")
      );
    }
  }
);

export const signupUser = createAsyncThunk(
  "auth/signupUser",
  async (userData, { rejectWithValue }) => {
    try {
      const { data } = await authApi.signup(userData);
      return {
        user: data.user,
        session: data.session,
        message: data.message,
        pendingConfirmation: Boolean(data.pending_confirmation),
      };
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Something went wrong. Try again.")
      );
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async () => {
    try {
      await authApi.logout();
    } catch (error) {
      // best effort logout; swallow error to allow UI to proceed
      console.error("Logout error:", error);
    }
  }
);

const initialState = {
  user: null,
  session: null,
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
      state.session = null;
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
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        if (action.payload === "unauthenticated") {
          state.status = "idle";
          state.error = null;
        } else {
          state.status = "failed";
          state.error =
            action.payload || action.error?.message || "Unable to fetch user";
        }
        state.user = null;
        state.session = null;
      })
      .addCase(loginUser.pending, (state) => {
        state.authStatus = "loading";
        state.authError = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.authStatus = "succeeded";
        state.user = action.payload.user;
        state.session = action.payload.session || null;
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
        state.user = action.payload.user;
        state.session = action.payload.session || null;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.authStatus = "failed";
        state.authError =
          action.payload || action.error?.message || "Signup failed";
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.session = null;
      });
  },
});

export const { logout } = authSlice.actions;
export const selectAuth = (state) => state.auth;
export default authSlice.reducer;
