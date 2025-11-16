import { useContext } from "react";
import { IconButton, Tooltip, useTheme, alpha } from "@mui/material";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";
import { ColorModeContext } from "@/theme/ThemeProvider";

const ThemeToggle = () => {
  const theme = useTheme();
  const { toggleColorMode } = useContext(ColorModeContext);
  const isDark = theme.palette.mode === "dark";

  return (
    <Tooltip title={isDark ? "Switch to light mode" : "Switch to dark mode"}>
      <IconButton
        onClick={toggleColorMode}
        size="large"
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        sx={{
          color: theme.palette.text.primary,
          border: `1px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.15)" : "rgba(15,23,42,0.15)"}`,
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            backgroundColor: alpha(theme.palette.text.primary, 0.08),
            transform: "rotate(15deg) scale(1.1)",
            borderColor: theme.palette.secondary.main,
          },
          "& svg": {
            transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          },
        }}
      >
        {isDark ? <LightModeRoundedIcon /> : <DarkModeRoundedIcon />}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggle;
