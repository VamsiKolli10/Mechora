import { createContext, useEffect, useMemo, useState } from "react";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";

export const ColorModeContext = createContext({
  mode: "dark",
  toggleColorMode: () => {},
});

const paletteTokens = (mode) =>
  mode === "light"
    ? {
        primary: { main: "#111936" },
        secondary: { main: "#7c3aed" },
        info: { main: "#0ea5e9" },
        background: {
          default: "#f6f7fb",
          paper: "rgba(255,255,255,0.9)",
          accent: "#eef2ff",
        },
        divider: "rgba(15,23,42,0.08)",
        text: { primary: "#0f172a", secondary: "#5b6478" },
      }
    : {
        primary: { main: "#cbd5ff" },
        secondary: { main: "#c084fc" },
        info: { main: "#38bdf8" },
        background: {
          default: "#050714",
          paper: "rgba(10,15,35,0.85)",
          accent: "#0f172a",
        },
        divider: "rgba(226,232,240,0.12)",
        text: { primary: "#f8f9ff", secondary: "#a8b3cf" },
      };

const gradientTokens = (mode) =>
  mode === "light"
    ? {
        hero: "linear-gradient(135deg, #fef3c7, #e0e7ff)",
        glass: "linear-gradient(135deg, rgba(255,255,255,0.75), rgba(226,232,255,0.8))",
      }
    : {
        hero: "linear-gradient(135deg, #1b1230, #0f1b3d)",
        glass: "linear-gradient(135deg, rgba(12,16,35,0.9), rgba(19,27,55,0.8))",
      };

const shadows = (mode) =>
  mode === "light"
    ? ["none", "0 10px 40px rgba(15,23,42,0.08)"]
    : ["none", "0 20px 55px rgba(0,0,0,0.45)"];

const buildTheme = (mode) => {
  const palette = paletteTokens(mode);
  const gradients = gradientTokens(mode);
  const [none, soft] = shadows(mode);
  return createTheme({
    palette: {
      mode,
      ...palette,
    },
    typography: {
      fontFamily: "'Space Grotesk', 'Inter', 'Roboto', sans-serif",
      h1: {
        fontWeight: 600,
        letterSpacing: "-0.04em",
      },
      h2: {
        fontWeight: 600,
        letterSpacing: "-0.02em",
      },
      subtitle1: {
        fontWeight: 500,
      },
      button: {
        fontWeight: 600,
        letterSpacing: "0.02em",
      },
    },
    shape: { borderRadius: 12 },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: palette.background.default,
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(124,58,237,0.08), transparent 60%), radial-gradient(circle at 80% 0, rgba(14,165,233,0.08), transparent 55%)",
            minHeight: "100vh",
          },
          "*, *::before, *::after": {
            boxSizing: "border-box",
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: ({ theme }) => ({
            backgroundImage: gradients.glass,
            borderRadius: theme.shape.borderRadius,
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: theme.palette.mode === "dark" ? soft : none,
          }),
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 999,
            textTransform: "none",
            fontWeight: 600,
            letterSpacing: "0.01em",
            boxShadow: "none",
            paddingInline: 24,
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:disabled": {
              opacity: 0.5,
              cursor: "not-allowed",
            },
          },
          containedPrimary: {
            backgroundImage:
              "linear-gradient(100deg, #7c3aed, #4f46e5)",
            color: "#fff",
            "&:hover": {
              backgroundImage:
                "linear-gradient(100deg, #8b5cf6, #6366f1)",
            },
          },
        },
        defaultProps: {
          disableElevation: true,
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 600,
            letterSpacing: "0.04em",
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            borderBottom: `1px solid ${palette.divider}`,
          },
        },
      },
      MuiContainer: {
        defaultProps: {
          maxWidth: "xl",
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: palette.divider,
          },
        },
      },
      MuiTextField: {
        defaultProps: {
          variant: "outlined",
          fullWidth: true,
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 18,
            backgroundColor: mode === "light" ? "rgba(255,255,255,0.8)" : "rgba(15,23,42,0.4)",
            backdropFilter: "blur(8px)",
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
              backgroundColor: mode === "light" ? "rgba(255,255,255,0.95)" : "rgba(15,23,42,0.5)",
            },
            "&.Mui-focused": {
              backgroundColor: mode === "light" ? "rgba(255,255,255,1)" : "rgba(15,23,42,0.6)",
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 2,
          },
        },
      },
    },
    customComponents: {
      gradients,
    },
  });
};

const CustomThemeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => {
    if (typeof window === "undefined") return "dark";
    return localStorage.getItem("mechora-theme") || "dark";
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("mechora-theme", mode);
    }
  }, [mode]);

  const colorMode = useMemo(
    () => ({
      mode,
      toggleColorMode: () =>
        setMode((prev) => (prev === "light" ? "dark" : "light")),
    }),
    [mode]
  );

  const theme = useMemo(() => buildTheme(mode), [mode]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};

export default CustomThemeProvider;
