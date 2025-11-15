import React from "react";
import ReactDOM from "react-dom/client";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { Provider } from "react-redux";
import App from "./App";
import "./index.css";
import { store } from "./store";

const theme = createTheme({
  palette: {
    primary: {
      main: "#2575fc",
    },
    secondary: {
      main: "#6a11cb",
    },
    background: {
      default: "#0f0f0f",
      paper: "#121212",
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </Provider>
  </React.StrictMode>
);
