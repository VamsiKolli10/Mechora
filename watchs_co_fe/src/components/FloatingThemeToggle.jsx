import { Box } from "@mui/material";
import ThemeToggle from "@/components/ThemeToggle";

const FloatingThemeToggle = () => (
  <Box
    sx={{
      position: "fixed",
      bottom: { xs: 16, md: 24 },
      right: { xs: 16, md: 32 },
      zIndex: 1400,
      backdropFilter: "blur(10px)",
      borderRadius: "999px",
      bgcolor: (theme) =>
        theme.palette.mode === "dark"
          ? "rgba(11,16,32,0.65)"
          : "rgba(255,255,255,0.85)",
      boxShadow: (theme) =>
        theme.palette.mode === "dark"
          ? "0 10px 30px rgba(0,0,0,0.45)"
          : "0 10px 30px rgba(15,23,42,0.15)",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      "&:hover": {
        transform: "scale(1.05)",
        boxShadow: (theme) =>
          theme.palette.mode === "dark"
            ? "0 12px 40px rgba(0,0,0,0.6)"
            : "0 12px 40px rgba(15,23,42,0.2)",
      },
    }}
    role="complementary"
    aria-label="Theme toggle"
  >
    <ThemeToggle />
  </Box>
);

export default FloatingThemeToggle;
