import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Provider } from "react-redux";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import App from "./App";
import { store } from "./store";

describe("App routing", () => {
  it("renders the login form when the user is not authenticated", async () => {
    const theme = createTheme();
    render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <App />
        </ThemeProvider>
      </Provider>
    );
    const loginButton = await screen.findByRole("button", { name: /login/i });
    expect(loginButton).toBeInTheDocument();
  });
});
