import {
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

const FeatureCard = ({
  image,
  tag,
  title,
  subtitle,
  price,
  specs = [],
  actionLabel = "Reserve",
  onAction,
}) => (
  <Paper
    sx={{
      p: 3,
      display: "flex",
      flexDirection: "column",
      gap: 2,
      borderRadius: 2,
      position: "relative",
      overflow: "hidden",
      height: "100%",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      border: (theme) => `1px solid ${theme.palette.divider}`,
      cursor: "pointer",
      "&:hover": {
        transform: "translateY(-4px)",
        border: (theme) => `1px solid ${theme.palette.secondary.main}`,
        boxShadow: (theme) =>
          theme.palette.mode === "dark"
            ? "0 12px 32px rgba(192, 132, 252, 0.2)"
            : "0 12px 32px rgba(124, 58, 237, 0.15)",
      },
      "&:active": {
        transform: "translateY(-2px)",
      },
    }}
    role="article"
    aria-label={`Watch: ${title}`}
  >
    {image && (
      <Box
        sx={{
          borderRadius: 1.5,
          overflow: "hidden",
          aspectRatio: "4 / 3",
          background: (theme) =>
            `${theme.palette.mode === "dark" ? "rgba(15,23,42,0.7)" : "rgba(15,23,42,0.04)"}`,
          position: "relative",
          flexShrink: 0,
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background: `url(${image}) center/cover no-repeat`,
            filter: (theme) =>
              theme.palette.mode === "dark" ? "drop-shadow(0 20px 40px rgba(0,0,0,0.45))" : "none",
          }}
        />
      </Box>
    )}
    {tag && (
      <Chip
        label={tag}
        size="small"
        color="secondary"
        sx={{ alignSelf: "flex-start", letterSpacing: "0.08em" }}
      />
    )}
    {title && (
      <Typography variant="h6" fontWeight={600} lineHeight={1.3}>
        {title}
      </Typography>
    )}
    {subtitle && (
      <Typography variant="body2" color="text.secondary">
        {subtitle}
      </Typography>
    )}

    {Boolean(specs.length) && (
      <Stack spacing={0.5} sx={{ mt: "auto" }}>
        {specs.map((spec) => (
          <Typography key={spec} variant="caption" color="text.secondary">
            {spec}
          </Typography>
        ))}
      </Stack>
    )}

    <Divider sx={{ my: 2 }} />
    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: "auto" }}>
      {price && (
        <Stack spacing={0.5}>
          <Typography variant="overline" color="text.secondary">
            Reserve from
          </Typography>
          <Typography fontWeight={600} fontSize={20}>
            {price}
          </Typography>
        </Stack>
      )}
      <Button
        size="small"
        endIcon={<ArrowForwardIcon />}
        onClick={onAction}
        sx={{
          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            transform: "translateX(4px)",
            "& .MuiSvgIcon-root": {
              transform: "translateX(2px)",
            },
          },
          "& .MuiSvgIcon-root": {
            transition: "transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          },
        }}
        aria-label={`${actionLabel} ${title}`}
      >
        {actionLabel}
      </Button>
    </Stack>
  </Paper>
);

export default FeatureCard;
