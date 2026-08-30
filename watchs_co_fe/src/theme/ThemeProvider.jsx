import { createContext, useEffect, useMemo, useState } from "react";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";

export const ColorModeContext = createContext({
  mode: "dark",
  toggleColorMode: () => {},
});

const paletteTokens = (mode) =>
  mode === "light"
    ? {
        primary: { main: "#1c1a16", contrastText: "#fffdf8" },
        secondary: { main: "#9a7137", contrastText: "#fffdf8" },
        success: { main: "#42705a" },
        info: { main: "#5f7180" },
        background: {
          default: "#f5f2eb",
          paper: "#fffdf8",
          accent: "#ebe5da",
        },
        divider: "rgba(44,39,31,0.12)",
        text: { primary: "#1c1a16", secondary: "#6f695f" },
      }
    : {
        primary: { main: "#f3ede2", contrastText: "#121315" },
        secondary: { main: "#d0aa6b", contrastText: "#121315" },
        success: { main: "#79aa8d" },
        info: { main: "#94a8b6" },
        background: {
          default: "#0c0d0f",
          paper: "#151619",
          accent: "#202125",
        },
        divider: "rgba(240,233,220,0.14)",
        text: { primary: "#f3ede2", secondary: "#aaa398" },
      };

const gradientTokens = (mode) =>
  mode === "light"
    ? {
        hero: "linear-gradient(135deg, #ece4d5, #f9f7f1)",
        glass: "linear-gradient(145deg, #fffdf8, #f9f5ed)",
      }
    : {
        hero: "linear-gradient(135deg, #29251f, #111214)",
        glass: "linear-gradient(145deg, #17181b, #111214)",
      };

const shadows = (mode) =>
  mode === "light"
    ? ["none", "0 18px 55px rgba(45,38,27,0.10)"]
    : ["none", "0 24px 65px rgba(0,0,0,0.42)"];

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
      fontFamily: "'Avenir Next', 'Segoe UI', sans-serif",
      h1: {
        fontFamily: "'Iowan Old Style', 'Baskerville', Georgia, serif",
        fontWeight: 500,
        letterSpacing: "-0.035em",
        lineHeight: 1.02,
      },
      h2: {
        fontFamily: "'Iowan Old Style', 'Baskerville', Georgia, serif",
        fontWeight: 500,
        letterSpacing: "-0.03em",
        lineHeight: 1.08,
      },
      h3: {
        fontFamily: "'Iowan Old Style', 'Baskerville', Georgia, serif",
        fontWeight: 500,
      },
      subtitle1: {
        fontWeight: 500,
      },
      button: {
        fontWeight: 600,
        letterSpacing: "0.04em",
      },
      overline: { fontWeight: 700, letterSpacing: "0.16em" },
    },
    shape: { borderRadius: 14 },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: palette.background.default,
            backgroundImage:
              mode === "light"
                ? "radial-gradient(circle at 10% 0%, rgba(154,113,55,0.08), transparent 36%)"
                : "radial-gradient(circle at 10% 0%, rgba(208,170,107,0.08), transparent 34%)",
            minHeight: "100vh",
            WebkitFontSmoothing: "antialiased",
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
            borderRadius: theme.shape.borderRadius * 1.25,
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: theme.palette.mode === "dark" ? "none" : soft,
          }),
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            textTransform: "none",
            fontWeight: 600,
            letterSpacing: "0.01em",
            boxShadow: "none",
            paddingInline: 22,
            minHeight: 42,
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:disabled": {
              opacity: 0.5,
              cursor: "not-allowed",
            },
          },
          containedPrimary: {
            backgroundImage: "none",
            "&:hover": {
              backgroundImage: "none",
              transform: "translateY(-1px)",
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
            borderRadius: 20,
            border: `1px solid ${palette.divider}`,
            backgroundImage: "none",
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
