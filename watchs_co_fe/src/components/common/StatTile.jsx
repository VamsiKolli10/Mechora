import { Chip, Paper, Stack, Typography } from "@mui/material";

const StatTile = ({ value, label, helper, trend }) => (
  <Paper
    sx={{
      p: 3,
      borderRadius: 2,
      textAlign: "left",
      backdropFilter: "blur(12px)",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      "&:hover": {
        transform: "translateY(-4px)",
        boxShadow: (theme) =>
          theme.palette.mode === "dark"
            ? "0 12px 32px rgba(0,0,0,0.3)"
            : "0 12px 32px rgba(0,0,0,0.08)",
      },
    }}
    role="article"
    aria-label={`${label}: ${value}`}
  >
    <Stack spacing={1}>
      <Typography variant="overline" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h4" fontWeight={700}>
        {value}
      </Typography>
      {helper && (
        <Typography variant="body2" color="text.secondary">
          {helper}
        </Typography>
      )}
      {trend && (
        <Chip
          size="small"
          color={trend.startsWith("-") ? "default" : "success"}
          label={trend}
          sx={{ width: "fit-content" }}
        />
      )}
    </Stack>
  </Paper>
);

export default StatTile;
