import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import App from "./App";
import "./index.css";
import { store } from "./store";
import { fetchCurrentUser } from "@/features/auth/authSlice";

import CustomThemeProvider from "./theme/ThemeProvider";

// Bootstrap the authenticated session once when the app starts.
store.dispatch(fetchCurrentUser());

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <CustomThemeProvider>
        <App />
      </CustomThemeProvider>
    </Provider>
  </React.StrictMode>
);
